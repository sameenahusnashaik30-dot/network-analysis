import time
import socket
import threading
from typing import Dict, Any, List, Optional, Tuple, Set
from collections import defaultdict
import httpx

try:
    from scapy.all import sniff, conf, get_if_list, IP, TCP, UDP, ICMP
    SCAPY_AVAILABLE = True
except ImportError:
    SCAPY_AVAILABLE = False

API_INGEST_URL = "http://localhost:8000/api/traffic/ingest"

def get_available_interfaces() -> List[Dict[str, Any]]:
    """
    Enumerate network interfaces available for packet capture on the host.
    Identifies Wi-Fi, Ethernet, Virtual, and Loopback interfaces with their network properties.
    """
    interfaces = []
    if SCAPY_AVAILABLE:
        try:
            for iface_key, iface_data in conf.ifaces.items():
                name = getattr(iface_data, "name", str(iface_key))
                desc = getattr(iface_data, "description", name)
                ip = getattr(iface_data, "ip", "") or ""
                mac = getattr(iface_data, "mac", "") or ""
                
                # Interface classification
                desc_lower = (desc + " " + name).lower()
                is_wifi = any(w in desc_lower for w in ["wi-fi", "wifi", "wireless", "802.11"])
                is_loopback = any(l in desc_lower for l in ["loopback", "npf_loopback"]) or ip == "127.0.0.1"
                is_ethernet = any(e in desc_lower for e in ["ethernet", "realtek pcie", "host-only", "gigabit"]) and not is_wifi
                
                iface_type = "Wi-Fi" if is_wifi else ("Loopback" if is_loopback else ("Ethernet" if is_ethernet else "Virtual/Other"))
                
                interfaces.append({
                    "id": str(iface_key),
                    "name": name,
                    "description": desc,
                    "ip": ip,
                    "mac": mac,
                    "type": iface_type,
                    "is_loopback": is_loopback,
                    "is_up": bool(ip and ip != "0.0.0.0"),
                })
        except Exception as e:
            pass

    if not interfaces:
        # Fallback host interface lookup
        try:
            hostname = socket.gethostname()
            host_ip = socket.gethostbyname(hostname)
            interfaces.append({
                "id": "default",
                "name": "Host Primary Adapter",
                "description": f"Host IP: {host_ip}",
                "ip": host_ip,
                "mac": "",
                "type": "Ethernet/Wi-Fi",
                "is_loopback": False,
                "is_up": True,
            })
        except Exception:
            pass

    return interfaces


class LivePacketSniffer:
    """
    SENTINEL-X Production Live Network Packet Sniffer.
    Captures raw Layer 3/4 headers using Scapy, aggregates 5-tuple flow statistics
    into configurable time windows, extracts ML features, and forwards them to
    the Sentinel-X ingestion endpoint for real-time classification and XAI explanation.
    """
    def __init__(
        self,
        interface: Optional[str] = None,
        target_api: str = API_INGEST_URL,
        window_seconds: float = 3.0,
        bpf_filter: str = "ip",
        ignore_ports: Optional[Set[int]] = None,
    ):
        self.interface = interface
        self.target_api = target_api
        self.window_seconds = window_seconds
        self.bpf_filter = bpf_filter
        self.ignore_ports = ignore_ports or {8000, 5173, 20241, 20242}  # Exclude Sentinel-X management traffic
        
        self.active_flows: Dict[Tuple[str, str, int, int, str], Dict[str, Any]] = defaultdict(lambda: {
            "packet_count": 0,
            "byte_count": 0,
            "start_time": time.time(),
            "last_time": time.time(),
            "flags": set(),
        })
        
        self._lock = threading.Lock()
        self._stop_event = threading.Event()
        self._capture_thread: Optional[threading.Thread] = None
        self._flush_thread: Optional[threading.Thread] = None
        
        # Operational Telemetry
        self.total_packets_captured = 0
        self.total_flows_flushed = 0
        self.last_flush_time = time.time()
        self.last_error: Optional[str] = None
        self.is_running = False

    def _parse_scapy_packet(self, packet) -> Optional[Dict[str, Any]]:
        """
        Extract 5-tuple and Layer 4 header flags from a Scapy packet.
        SECURITY & PRIVACY: Only header metadata is parsed. Payload bytes are discarded.
        """
        if not SCAPY_AVAILABLE or not packet.haslayer(IP):
            return None

        ip_layer = packet[IP]
        src_ip = ip_layer.src
        dst_ip = ip_layer.dst
        proto_num = ip_layer.proto
        byte_len = len(packet)

        src_port, dst_port = 0, 0
        proto_name = "OTHER"
        flags_set: Set[str] = set()

        if packet.haslayer(TCP):
            proto_name = "TCP"
            tcp = packet[TCP]
            src_port = int(tcp.sport)
            dst_port = int(tcp.dport)
            
            # Extract TCP flag abbreviations
            f_val = tcp.flags
            if f_val.S: flags_set.add("SYN")
            if f_val.A: flags_set.add("ACK")
            if f_val.F: flags_set.add("FIN")
            if f_val.R: flags_set.add("RST")
            if f_val.P: flags_set.add("PSH")
            if f_val.U: flags_set.add("URG")

        elif packet.haslayer(UDP):
            proto_name = "UDP"
            udp = packet[UDP]
            src_port = int(udp.sport)
            dst_port = int(udp.dport)

        elif packet.haslayer(ICMP):
            proto_name = "ICMP"
            src_port = 0
            dst_port = 0

        # Filter out self-traffic to management ports
        if src_port in self.ignore_ports or dst_port in self.ignore_ports:
            return None

        return {
            "src_ip": src_ip,
            "dst_ip": dst_ip,
            "src_port": src_port,
            "dst_port": dst_port,
            "protocol": proto_name,
            "byte_len": byte_len,
            "flags": flags_set,
        }

    def process_packet(self, packet):
        """Callback invoked by Scapy sniff engine per packet."""
        parsed = self._parse_scapy_packet(packet)
        if not parsed:
            return

        with self._lock:
            self.total_packets_captured += 1
            key = (
                parsed["src_ip"],
                parsed["dst_ip"],
                parsed["src_port"],
                parsed["dst_port"],
                parsed["protocol"],
            )
            flow = self.active_flows[key]
            flow["packet_count"] += 1
            flow["byte_count"] += parsed["byte_len"]
            flow["last_time"] = time.time()
            if parsed["flags"]:
                flow["flags"].update(parsed["flags"])

    def flush_flows(self) -> List[Dict[str, Any]]:
        """
        Aggregate current active flows in the window, calculate statistical features,
        and transmit them to the Sentinel-X ingestion endpoint.
        """
        with self._lock:
            if not self.active_flows:
                return []
            flows_to_flush = dict(self.active_flows)
            self.active_flows.clear()

        now = time.time()
        ingested_results = []

        for (src_ip, dst_ip, src_port, dst_port, proto), stats in flows_to_flush.items():
            duration = max(0.05, round(stats["last_time"] - stats["start_time"], 3))
            pkt_cnt = stats["packet_count"]
            byte_cnt = stats["byte_count"]
            pkt_rate = round(pkt_cnt / duration, 2)
            byte_rate = round(byte_cnt / duration, 2)
            flags = ",".join(sorted(stats["flags"])) if stats["flags"] else ("ACK" if proto == "TCP" else "NONE")

            payload = {
                "flow_id": f"SNIFF-{int(now * 1000) % 1000000:06d}-{src_port}",
                "switch_id": "0000000000000001",
                "src_ip": src_ip,
                "dst_ip": dst_ip,
                "src_port": src_port,
                "dst_port": dst_port,
                "protocol": proto,
                "packet_count": pkt_cnt,
                "byte_count": byte_cnt,
                "duration_sec": duration,
                "packet_rate": pkt_rate,
                "byte_rate": byte_rate,
                "tcp_flags": flags,
            }

            try:
                with httpx.Client(timeout=2.5) as client:
                    resp = client.post(self.target_api, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        verdict = data.get("final_label", "UNKNOWN")
                        conf = data.get("confidence", 0.0)
                        ingested_results.append({
                            "flow": payload,
                            "verdict": verdict,
                            "confidence": conf,
                            "is_zero_day": data.get("is_zero_day_candidate", False),
                        })
            except Exception as e:
                self.last_error = f"Ingestion post failed: {e}"

        self.total_flows_flushed += len(ingested_results)
        self.last_flush_time = now
        return ingested_results

    def _flush_loop(self):
        """Periodic background timer to flush aggregated windows."""
        while not self._stop_event.is_set():
            time.sleep(self.window_seconds)
            if self.is_running:
                self.flush_flows()

    def _sniff_worker(self):
        """Scapy sniffing background loop."""
        try:
            kwargs = {
                "prn": self.process_packet,
                "filter": self.bpf_filter,
                "store": False,
                "stop_filter": lambda _: self._stop_event.is_set(),
            }
            if self.interface:
                kwargs["iface"] = self.interface

            sniff(**kwargs)
        except PermissionError as pe:
            self.last_error = f"PERMISSION_DENIED_RAW_SOCKET: Administrator privileges or Npcap required: {pe}"
            self.is_running = False
        except Exception as e:
            self.last_error = f"CAPTURE_ERROR: {e}"
            self.is_running = False

    def start(self, background: bool = True):
        """Start packet sniffer and flow aggregation worker."""
        if not SCAPY_AVAILABLE:
            self.last_error = "SCAPY_UNAVAILABLE: Scapy library is not installed."
            return False

        if self.is_running:
            return True

        self._stop_event.clear()
        self.is_running = True
        self.last_error = None

        self._flush_thread = threading.Thread(target=self._flush_loop, daemon=True)
        self._flush_thread.start()

        if background:
            self._capture_thread = threading.Thread(target=self._sniff_worker, daemon=True)
            self._capture_thread.start()
            return True
        else:
            self._sniff_worker()
            return True

    def stop(self):
        """Stop packet sniffer and flush remaining flows."""
        if not self.is_running:
            return
        self._stop_event.set()
        self.is_running = False
        
        # Flush any remaining flows
        self.flush_flows()
        
        if self._capture_thread and self._capture_thread.is_alive():
            self._capture_thread.join(timeout=1.0)

    def get_status(self) -> Dict[str, Any]:
        """Return operational telemetry of the sniffer."""
        return {
            "is_running": self.is_running,
            "interface": self.interface or "Auto-selected / Default",
            "window_seconds": self.window_seconds,
            "packets_captured": self.total_packets_captured,
            "flows_flushed": self.total_flows_flushed,
            "last_flush_timestamp": self.last_flush_time,
            "active_flows_in_window": len(self.active_flows),
            "last_error": self.last_error,
            "scapy_available": SCAPY_AVAILABLE,
        }

    def replay_demo_burst(self, count: int = 5) -> List[Dict[str, Any]]:
        """
        Explicit test generator for DEMO MODE presentations when hardware interface capture
        is inactive or restricted.
        RULE: Every flow is clearly tagged as DEMO so synthetic data is never confused with live metrics.
        """
        import random
        results = []
        now = time.time()
        
        sample_scenarios = [
            ("192.168.1.105", "10.0.0.15", 52180, 80, "TCP", 2200, 185000, 18.5, "ACK,PSH", "Normal"),
            ("185.220.101.5", "10.0.0.2", 54122, 443, "TCP", 88000, 6200000, 2.8, "SYN", "DDoS"),
            ("198.51.100.99", "10.0.0.8", 61004, 9443, "TCP", 6400, 1420000, 10.2, "URG,ACK,PSH", "Zero-Day Candidate"),
            ("172.16.0.40", "10.0.0.5", 48210, 22, "TCP", 450, 31000, 4.0, "SYN,ACK", "Brute Force"),
            ("10.0.0.88", "10.0.0.1", 39100, 53, "UDP", 120, 9600, 1.2, "NONE", "Normal"),
        ]

        for i in range(min(count, len(sample_scenarios))):
            src_ip, dst_ip, sport, dport, proto, pkts, bytes_n, dur, flags, _ = sample_scenarios[i]
            payload = {
                "flow_id": f"DEMO-STREAM-{i+1:03d}-{int(now) % 10000}",
                "switch_id": "0000000000000002",
                "src_ip": src_ip,
                "dst_ip": dst_ip,
                "src_port": sport,
                "dst_port": dport,
                "protocol": proto,
                "packet_count": pkts,
                "byte_count": bytes_n,
                "duration_sec": dur,
                "packet_rate": round(pkts / dur, 2),
                "byte_rate": round(bytes_n / dur, 2),
                "tcp_flags": flags,
            }
            try:
                with httpx.Client(timeout=2.0) as client:
                    resp = client.post(self.target_api, json=payload)
                    if resp.status_code == 200:
                        results.append(resp.json())
            except Exception as e:
                self.last_error = f"Demo ingestion failed: {e}"

        return results

# Singleton instance for programmatic management
live_sniffer = LivePacketSniffer()

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="SENTINEL-X Real Network Traffic Collector")
    parser.add_argument("--list-interfaces", action="store_true", help="List available network interfaces")
    parser.add_argument("--interface", type=str, default=None, help="Interface name or IP to capture")
    parser.add_argument("--window", type=float, default=3.0, help="Flow aggregation window in seconds")
    parser.add_argument("--demo", action="store_true", help="Run explicit DEMO synthetic burst")
    args = parser.parse_args()

    if args.list_interfaces:
        print("\nAvailable Network Interfaces:")
        for iface in get_available_interfaces():
            print(f"  [{iface['type']}] {iface['name']} (IP: {iface['ip'] or 'N/A'}, MAC: {iface['mac'] or 'N/A'})")
    elif args.demo:
        print("\nExecuting DEMO synthetic burst...")
        res = live_sniffer.replay_demo_burst(count=5)
        print(f"Ingested {len(res)} demo flows successfully.")
    else:
        print(f"\nStarting live packet sniffer (Window: {args.window}s)...")
        sniffer = LivePacketSniffer(interface=args.interface, window_seconds=args.window)
        try:
            sniffer.start(background=False)
        except KeyboardInterrupt:
            sniffer.stop()
            print("\nSniffer stopped cleanly.")
