import pytest
import time
from fastapi.testclient import TestClient
from scapy.all import IP, TCP, UDP, ICMP
from live_packet_sniffer import LivePacketSniffer, get_available_interfaces
from app.main import app
from app.database.repositories.flow_repository import FlowRepository

client = TestClient(app)
flow_repo = FlowRepository()

def test_interface_enumeration():
    """Verify that host network interfaces are discovered and classified."""
    interfaces = get_available_interfaces()
    assert isinstance(interfaces, list)
    assert len(interfaces) > 0
    
    # Check structure of the first interface
    first = interfaces[0]
    assert "id" in first
    assert "name" in first
    assert "type" in first
    assert "is_loopback" in first
    assert first["type"] in ["Wi-Fi", "Ethernet", "Loopback", "Virtual/Other"]

def test_packet_parser_tcp_header():
    """Verify Scapy TCP packet parsing: 5-tuple, flags, and payload exclusion."""
    sniffer = LivePacketSniffer()
    pkt = IP(src="192.168.1.77", dst="10.0.0.15") / TCP(sport=55123, dport=443, flags="SA") / b"SECRET_PAYLOAD_DATA"
    
    parsed = sniffer._parse_scapy_packet(pkt)
    assert parsed is not None
    assert parsed["src_ip"] == "192.168.1.77"
    assert parsed["dst_ip"] == "10.0.0.15"
    assert parsed["src_port"] == 55123
    assert parsed["dst_port"] == 443
    assert parsed["protocol"] == "TCP"
    assert "SYN" in parsed["flags"]
    assert "ACK" in parsed["flags"]
    # Verify no payload bytes are exposed in the parsed dictionary (Security/Privacy requirement)
    assert "payload" not in parsed
    assert "SECRET_PAYLOAD_DATA" not in str(parsed)

def test_packet_parser_udp_and_icmp():
    """Verify Scapy UDP and ICMP parsing."""
    sniffer = LivePacketSniffer()
    
    udp_pkt = IP(src="10.0.0.5", dst="8.8.8.8") / UDP(sport=53000, dport=53)
    parsed_udp = sniffer._parse_scapy_packet(udp_pkt)
    assert parsed_udp is not None
    assert parsed_udp["protocol"] == "UDP"
    assert parsed_udp["dst_port"] == 53
    
    icmp_pkt = IP(src="10.0.0.5", dst="10.0.0.1") / ICMP()
    parsed_icmp = sniffer._parse_scapy_packet(icmp_pkt)
    assert parsed_icmp is not None
    assert parsed_icmp["protocol"] == "ICMP"
    assert parsed_icmp["src_port"] == 0

def test_packet_parser_filters_internal_ports():
    """Ensure internal management ports (e.g. 8000, 5173) are filtered to avoid self-sniffing loops."""
    sniffer = LivePacketSniffer(ignore_ports={8000, 5173})
    pkt = IP(src="127.0.0.1", dst="127.0.0.1") / TCP(sport=49152, dport=8000, flags="A")
    assert sniffer._parse_scapy_packet(pkt) is None

def test_flow_window_aggregation_logic():
    """Verify that multiple packets matching a 5-tuple are correctly aggregated into a flow window."""
    sniffer = LivePacketSniffer(window_seconds=1.0)
    
    for _ in range(5):
        pkt = IP(src="192.168.2.10", dst="172.16.0.1") / TCP(sport=40001, dport=80, flags="S")
        sniffer.process_packet(pkt)
        
    key = ("192.168.2.10", "172.16.0.1", 40001, 80, "TCP")
    with sniffer._lock:
        assert key in sniffer.active_flows
        flow_entry = sniffer.active_flows[key]
        assert flow_entry["packet_count"] == 5
        assert flow_entry["byte_count"] > 0
        assert "SYN" in flow_entry["flags"]

def test_traffic_ingest_api():
    """Verify POST /api/traffic/ingest runs through detection engine and stores flow."""
    payload = {
        "flow_id": f"TEST-SNIFF-{int(time.time() * 1000) % 100000}",
        "switch_id": "0000000000000001",
        "src_ip": "185.220.101.5",
        "dst_ip": "10.0.0.2",
        "src_port": 54122,
        "dst_port": 80,
        "protocol": "TCP",
        "packet_count": 85000,
        "byte_count": 5800000,
        "duration_sec": 3.0,
        "packet_rate": 28333.3,
        "byte_rate": 1933333.3,
        "tcp_flags": "SYN",
    }
    response = client.post("/api/traffic/ingest", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "final_label" in data
    assert "confidence" in data
    assert "anomaly_score" in data
    assert data["final_label"] == "DDoS"

def test_traffic_realtime_and_dynamic_stats():
    """Verify GET /api/traffic/realtime computes genuine dynamic database stats."""
    response = client.get("/api/traffic/realtime")
    assert response.status_code == 200
    data = response.json()
    assert "flows" in data
    assert "stats" in data
    stats = data["stats"]
    assert "total_flows" in stats
    assert "packets_per_sec" in stats
    assert "tcp_percent" in stats
    assert isinstance(stats["total_flows"], int)
    assert stats["total_flows"] >= 1  # From previous test ingest

def test_traffic_interfaces_endpoint():
    """Verify GET /api/traffic/interfaces returns discovered host adapters."""
    response = client.get("/api/traffic/interfaces")
    assert response.status_code == 200
    data = response.json()
    assert "interfaces" in data
    assert data["count"] > 0
    assert "sniffer_status" in data

def test_sniffer_lifecycle_and_error_handling():
    """Test start, status, and stop lifecycle of LivePacketSniffer."""
    sniffer = LivePacketSniffer(interface="NON_EXISTENT_INTERFACE_XYZ", window_seconds=1.0)
    status_before = sniffer.get_status()
    assert status_before["is_running"] is False
    
    # Starting on non-existent interface should fail or report error cleanly without crashing
    sniffer.start(background=True)
    time.sleep(0.5)
    sniffer.stop()
    status_after = sniffer.get_status()
    assert status_after["is_running"] is False
