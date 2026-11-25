import time
import socket
import struct
import httpx
from collections import defaultdict
from datetime import datetime

API_INGEST_URL = "http://localhost:8000/api/traffic/ingest"

class LivePacketSniffer:
    """
    Captures live network packets on the host interface, aggregates active flow
    statistics, and continuously pushes live telemetry to SENTINEL-X.
    """
    def __init__(self, target_api: str = API_INGEST_URL, window_seconds: float = 3.0):
        self.target_api = target_api
        self.window_seconds = window_seconds
        self.active_flows = defaultdict(lambda: {
            "packet_count": 0,
            "byte_count": 0,
            "start_time": time.time(),
            "last_time": time.time(),
            "flags": set(),
            "protocol": "TCP",
        })

    def _parse_ip_header(self, raw_data: bytes):
        if len(raw_data) < 20:
            return None
        version_ihl = raw_data[0]
        ihl = (version_ihl & 0x0F) * 4
        proto = raw_data[9]
        src_ip = socket.inet_ntoa(raw_data[12:16])
        dst_ip = socket.inet_ntoa(raw_data[16:20])
        
        protocol_name = "TCP" if proto == 6 else ("UDP" if proto == 17 else "ICMP")
        src_port, dst_port, flags_str = 0, 0, ""

        if proto == 6 and len(raw_data) >= ihl + 14:  # TCP
            tcp_hdr = raw_data[ihl:ihl + 14]
            src_port, dst_port = struct.unpack("!HH", tcp_hdr[:4])
            flags_byte = tcp_hdr[13]
            flags = []
            if flags_byte & 0x02: flags.append("SYN")
            if flags_byte & 0x10: flags.append("ACK")
            if flags_byte & 0x04: flags.append("RST")
            if flags_byte & 0x20: flags.append("URG")
            if flags_byte & 0x08: flags.append("PSH")
            if flags_byte & 0x01: flags.append("FIN")
            flags_str = ",".join(flags)
        elif proto == 17 and len(raw_data) >= ihl + 4:  # UDP
            src_port, dst_port = struct.unpack("!HH", raw_data[ihl:ihl + 4])

        return {
            "src_ip": src_ip,
            "dst_ip": dst_ip,
            "src_port": src_port,
            "dst_port": dst_port,
            "protocol": protocol_name,
            "byte_len": len(raw_data),
            "flags": flags_str,
        }

    def start_sniffing(self, max_flows: int = 50):
        print("=" * 70)
        print("  SENTINEL-X LIVE NETWORK PACKET SNIFFER")
        print("=" * 70)
        host_ip = socket.gethostbyname(socket.gethostname())
        print(f"[*] Binding to host network interface: {host_ip}")

        try:
            # Create raw Windows socket for packet capture
            sniffer = socket.socket(socket.AF_INET, socket.SOCK_RAW, socket.IPPROTO_IP)
            sniffer.bind((host_ip, 0))
            sniffer.setsockopt(socket.IPPROTO_IP, socket.IP_HDRINCL, 1)
            # Enable promiscuous mode on Windows interface
            sniffer.ioctl(socket.SIO_RCVALL, socket.RCVALL_ON)
            print("[+] Promiscuous capture mode ACTIVE. Listening for live flows...")
        except Exception as e:
            print(f"[-] Raw socket bind requires Administrator privileges: {e}")
            print("[*] Generating simulated live host packet traffic for demonstration...")
            self._simulate_live_stream()
            return

        flow_count = 0
        last_flush = time.time()

        try:
            while flow_count < max_flows:
                raw_pkt, _ = sniffer.recvfrom(65535)
                parsed = self._parse_ip_header(raw_pkt)
                if not parsed or parsed["src_port"] == 8000 or parsed["dst_port"] == 8000:
                    continue  # Ignore traffic to our own API

                key = (parsed["src_ip"], parsed["dst_ip"], parsed["src_port"], parsed["dst_port"], parsed["protocol"])
                flow = self.active_flows[key]
                flow["packet_count"] += 1
                flow["byte_count"] += parsed["byte_len"]
                flow["last_time"] = time.time()
                flow["protocol"] = parsed["protocol"]
                if parsed["flags"]:
                    flow["flags"].add(parsed["flags"])

                # Flush active flows every window_seconds
                if time.time() - last_flush > self.window_seconds:
                    self._flush_flows()
                    last_flush = time.time()
                    flow_count += 1

        except KeyboardInterrupt:
            print("\n[*] Stopping live packet capture...")
        finally:
            try:
                sniffer.ioctl(socket.SIO_RCVALL, socket.RCVALL_OFF)
            except Exception:
                pass

    def _flush_flows(self):
        now = time.time()
        for (src_ip, dst_ip, src_port, dst_port, proto), flow in list(self.active_flows.items()):
            dur = max(0.001, now - flow["start_time"])
            pkt_cnt = flow["packet_count"]
            byte_cnt = flow["byte_count"]
            flags = ",".join(flow["flags"]) or "ACK"

            payload = {
                "flow_id": f"SNIFF-{int(now * 1000) % 100000:05d}",
                "switch_id": "0000000000000001",
                "src_ip": src_ip,
                "dst_ip": dst_ip,
                "src_port": src_port,
                "dst_port": dst_port,
                "protocol": proto,
                "packet_count": pkt_cnt,
                "byte_count": byte_cnt,
                "duration_sec": round(dur, 2),
                "packet_rate": round(pkt_cnt / dur, 2),
                "byte_rate": round(byte_cnt / dur, 2),
                "tcp_flags": flags,
            }

            try:
                with httpx.Client(timeout=2.0) as client:
                    res = client.post(self.target_api, json=payload)
                    if res.status_code == 200:
                        verdict = res.json().get("final_label", "UNKNOWN")
                        print(f"  [LIVE CAPTURE] {src_ip}:{src_port} -> {dst_ip}:{dst_port} ({proto}) => VERDICT: {verdict}")
            except Exception as e:
                print(f"  [WARN] Ingestion error: {e}")

        self.active_flows.clear()

    def _simulate_live_stream(self, count: int = 10):
        """Simulates live network interface packet bursts if raw sockets are restricted."""
        import random
        for i in range(count):
            now = time.time()
            is_zero_day = (i == 4)
            is_ddos = (i == 7)

            if is_zero_day:
                pkt_cnt, byte_cnt, dur = 8200, 1950000, 12.0
                dst_port, flags = 9443, "URG,ACK,PSH"
                src_ip = "198.51.100.99"
            elif is_ddos:
                pkt_cnt, byte_cnt, dur = 95000, 6800000, 3.0
                dst_port, flags = 80, "SYN"
                src_ip = "185.220.101.9"
            else:
                pkt_cnt, byte_cnt, dur = random.randint(1500, 3500), random.randint(120000, 280000), 25.0
                dst_port, flags = random.choice([443, 80]), "ACK"
                src_ip = f"192.168.1.{random.randint(10, 250)}"

            payload = {
                "flow_id": f"LIVE-STREAM-{i:03d}",
                "switch_id": "0000000000000002",
                "src_ip": src_ip,
                "dst_ip": "10.0.0.5",
                "src_port": random.randint(30000, 65000),
                "dst_port": dst_port,
                "protocol": "TCP",
                "packet_count": pkt_cnt,
                "byte_count": byte_cnt,
                "duration_sec": dur,
                "packet_rate": round(pkt_cnt / dur, 2),
                "byte_rate": round(byte_cnt / dur, 2),
                "tcp_flags": flags,
            }

            try:
                with httpx.Client(timeout=2.0) as client:
                    res = client.post(self.target_api, json=payload)
                    if res.status_code == 200:
                        verdict = res.json().get("final_label", "UNKNOWN")
                        conf = res.json().get("confidence", 0)
                        print(f"  [STREAM {i+1}/{count}] {src_ip}:{payload['src_port']} -> 10.0.0.5:{dst_port} | Verdict: [{verdict}] (Conf: {conf:.2f})")
            except Exception as e:
                print(f"  [ERROR] {e}")
            time.sleep(0.5)

if __name__ == "__main__":
    sniffer = LivePacketSniffer()
    sniffer.start_sniffing()
