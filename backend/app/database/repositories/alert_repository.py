import sqlite3
from typing import List, Optional
from app.database.connection import get_db_connection
from app.models.audit_log import AuditLog

class AuditRepository:
    def create(self, log: AuditLog) -> AuditLog:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO audit_logs (log_id, timestamp, username, user_role, action_type, resource_id, status, details)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            log.log_id, log.timestamp, log.username, log.user_role, log.action_type,
            log.resource_id, log.status, log.details
        ))
        conn.commit()
        conn.close()
        return log

    def get_all(self, limit: int = 50) -> List[AuditLog]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT ?", (limit,))
        rows = cursor.fetchall()
        conn.close()
        return [
            AuditLog(
                log_id=r["log_id"],
                timestamp=r["timestamp"],
                username=r["username"],
                user_role=r["user_role"],
                action_type=r["action_type"],
                resource_id=r["resource_id"],
                status=r["status"],
                details=r["details"]
            )
            for r in rows
        ]
