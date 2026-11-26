import sqlite3
from typing import List, Optional
from app.database.connection import get_db_connection
from app.models.flow import Flow

class FlowRepository:
    def __init__(self):
        pass

    def create(self, flow: Flow) -> Flow:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT OR REPLACE INTO flows (
                flow_id, switch_id, src_ip, dst_ip, src_port, dst_port, protocol,
                packet_count, byte_count, duration_sec, packet_rate, byte_rate,
                tcp_flags, timestamp, classification, confidence, anomaly_score, is_unknown, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            flow.flow_id, flow.switch_id, flow.src_ip, flow.dst_ip, flow.src_port, flow.dst_port, flow.protocol,
            flow.packet_count, flow.byte_count, flow.duration_sec, flow.packet_rate, flow.byte_rate,
            flow.tcp_flags, flow.timestamp, flow.classification, flow.confidence, flow.anomaly_score,
            1 if flow.is_unknown else 0, flow.status
        ))
        conn.commit()
        conn.close()
        return flow

    def get_all(self, limit: int = 100) -> List[Flow]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM flows ORDER BY timestamp DESC LIMIT ?", (limit,))
        rows = cursor.fetchall()
        conn.close()
        return [
            Flow(
                flow_id=r["flow_id"],
                switch_id=r["switch_id"],
                src_ip=r["src_ip"],
                dst_ip=r["dst_ip"],
                src_port=r["src_port"],
                dst_port=r["dst_port"],
                protocol=r["protocol"],
                packet_count=r["packet_count"],
                byte_count=r["byte_count"],
                duration_sec=r["duration_sec"],
                packet_rate=r["packet_rate"],
                byte_rate=r["byte_rate"],
                tcp_flags=r["tcp_flags"],
                timestamp=r["timestamp"],
                classification=r["classification"],
                confidence=r["confidence"],
                anomaly_score=r["anomaly_score"],
                is_unknown=bool(r["is_unknown"]),
                status=r["status"],
            )
            for r in rows
        ]

    def get_by_id(self, flow_id: str) -> Optional[Flow]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM flows WHERE flow_id = ?", (flow_id,))
        r = cursor.fetchone()
        conn.close()
        if not r:
            return None
        return Flow(
            flow_id=r["flow_id"],
            switch_id=r["switch_id"],
            src_ip=r["src_ip"],
            dst_ip=r["dst_ip"],
            src_port=r["src_port"],
            dst_port=r["dst_port"],
            protocol=r["protocol"],
            packet_count=r["packet_count"],
            byte_count=r["byte_count"],
            duration_sec=r["duration_sec"],
            packet_rate=r["packet_rate"],
            byte_rate=r["byte_rate"],
            tcp_flags=r["tcp_flags"],
            timestamp=r["timestamp"],
            classification=r["classification"],
            confidence=r["confidence"],
            anomaly_score=r["anomaly_score"],
            is_unknown=bool(r["is_unknown"]),
            status=r["status"],
        )

    def get_count(self) -> int:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) as count FROM flows")
        row = cursor.fetchone()
        conn.close()
        return row["count"] if row else 0

    def get_statistics(self) -> dict:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) as total FROM flows")
        total_row = cursor.fetchone()
        total_flows = total_row["total"] if total_row else 0

        if total_flows == 0:
            conn.close()
            return {
                "total_flows": 0,
                "active_flows": 0,
                "packets_per_sec": 0.0,
                "bytes_per_sec": 0.0,
                "tcp_percent": 0.0,
                "udp_percent": 0.0,
                "icmp_percent": 0.0,
                "top_sources": [],
                "top_destinations": [],
                "top_ports": [],
            }

        cursor.execute("SELECT AVG(packet_rate) as avg_pkt_rate, AVG(byte_rate) as avg_byte_rate FROM flows")
        rate_row = cursor.fetchone()
        avg_pkt_rate = round(float(rate_row["avg_pkt_rate"] or 0.0), 1)
        avg_byte_rate = round(float(rate_row["avg_byte_rate"] or 0.0), 1)

        cursor.execute("SELECT COUNT(*) as active FROM flows WHERE status = 'active' OR status = 'NEW'")
        active_row = cursor.fetchone()
        active_flows = active_row["active"] if (active_row and active_row["active"] > 0) else min(total_flows, 50)

        cursor.execute("SELECT protocol, COUNT(*) as cnt FROM flows GROUP BY protocol")
        proto_rows = cursor.fetchall()
        proto_counts = {r["protocol"]: r["cnt"] for r in proto_rows}
        tcp_pct = round((proto_counts.get("TCP", 0) / total_flows) * 100, 1)
        udp_pct = round((proto_counts.get("UDP", 0) / total_flows) * 100, 1)
        icmp_pct = round((proto_counts.get("ICMP", 0) / total_flows) * 100, 1)

        cursor.execute("SELECT src_ip as ip, COUNT(*) as count FROM flows GROUP BY src_ip ORDER BY count DESC LIMIT 5")
        top_sources = [{"ip": r["ip"], "count": r["count"]} for r in cursor.fetchall()]

        cursor.execute("SELECT dst_ip as ip, COUNT(*) as count FROM flows GROUP BY dst_ip ORDER BY count DESC LIMIT 5")
        top_destinations = [{"ip": r["ip"], "count": r["count"]} for r in cursor.fetchall()]

        cursor.execute("SELECT dst_port as port, COUNT(*) as count FROM flows GROUP BY dst_port ORDER BY count DESC LIMIT 5")
        top_ports = [{"port": r["port"], "count": r["count"]} for r in cursor.fetchall()]

        conn.close()
        return {
            "total_flows": total_flows,
            "active_flows": active_flows,
            "packets_per_sec": avg_pkt_rate,
            "bytes_per_sec": avg_byte_rate,
            "tcp_percent": tcp_pct,
            "udp_percent": udp_pct,
            "icmp_percent": icmp_pct,
            "top_sources": top_sources,
            "top_destinations": top_destinations,
            "top_ports": top_ports,
        }
