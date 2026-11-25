import sqlite3
import json
from typing import List, Optional
from app.database.connection import get_db_connection
from app.models.incident import Incident

class IncidentRepository:
    def create(self, incident: Incident) -> Incident:
        conn = get_db_connection()
        cursor = conn.cursor()
        audit_json = json.dumps(incident.mitigation_audit) if incident.mitigation_audit else None
        cursor.execute("""
            INSERT OR REPLACE INTO incidents (
                incident_id, flow_id, detected_at, last_observed_at, severity, classification,
                confidence, anomaly_score, unknown_score, status, is_zero_day_candidate,
                src_ip, dst_ip, src_port, dst_port, protocol, packet_count, byte_count,
                duration_sec, packet_rate, byte_rate, tcp_flags, recommended_action,
                mitigation_status, mitigation_audit
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            incident.incident_id, incident.flow_id, incident.detected_at, incident.last_observed_at,
            incident.severity, incident.classification, incident.confidence, incident.anomaly_score,
            incident.unknown_score, incident.status, 1 if incident.is_zero_day_candidate else 0,
            incident.src_ip, incident.dst_ip, incident.src_port, incident.dst_port, incident.protocol,
            incident.packet_count, incident.byte_count, incident.duration_sec, incident.packet_rate,
            incident.byte_rate, incident.tcp_flags, incident.recommended_action,
            incident.mitigation_status, audit_json
        ))
        conn.commit()
        conn.close()
        return incident

    def get_all(self) -> List[Incident]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM incidents ORDER BY detected_at DESC")
        rows = cursor.fetchall()
        conn.close()
        return [self._row_to_incident(r) for r in rows]

    def get_by_id(self, incident_id: str) -> Optional[Incident]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM incidents WHERE incident_id = ?", (incident_id,))
        r = cursor.fetchone()
        conn.close()
        if not r:
            return None
        return self._row_to_incident(r)

    def update_status(self, incident_id: str, status: str) -> bool:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE incidents SET status = ? WHERE incident_id = ?", (status, incident_id))
        conn.commit()
        conn.close()
        return True

    def update_mitigation(self, incident_id: str, mitigation_status: str, audit_data: dict) -> bool:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE incidents
            SET mitigation_status = ?, mitigation_audit = ?, status = 'MITIGATED'
            WHERE incident_id = ?
        """, (mitigation_status, json.dumps(audit_data), incident_id))
        conn.commit()
        conn.close()
        return True

    def _row_to_incident(self, r: sqlite3.Row) -> Incident:
        audit = json.loads(r["mitigation_audit"]) if r["mitigation_audit"] else None
        return Incident(
            incident_id=r["incident_id"],
            flow_id=r["flow_id"],
            detected_at=r["detected_at"],
            last_observed_at=r["last_observed_at"],
            severity=r["severity"],
            classification=r["classification"],
            confidence=r["confidence"],
            anomaly_score=r["anomaly_score"],
            unknown_score=r["unknown_score"],
            status=r["status"],
            is_zero_day_candidate=bool(r["is_zero_day_candidate"]),
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
            recommended_action=r["recommended_action"],
            mitigation_status=r["mitigation_status"],
            mitigation_audit=audit,
        )
