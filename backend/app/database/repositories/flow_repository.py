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
