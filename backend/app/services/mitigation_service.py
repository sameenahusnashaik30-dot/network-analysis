from datetime import datetime
from typing import Dict, Any
from fastapi import HTTPException, status
from app.database.repositories.incident_repository import IncidentRepository
from app.database.repositories.alert_repository import AuditRepository
from app.models.audit_log import AuditLog
from app.sdn.flow_manager import flow_manager

class MitigationService:
    def __init__(self):
        self.incident_repo = IncidentRepository()
        self.audit_repo = AuditRepository()

    async def approve_and_block(
        self,
        incident_id: str,
        action: str,
        duration_sec: int,
        admin_user: str,
        admin_role: str
    ) -> Dict[str, Any]:
        # Strict RBAC enforcement server-side
        if admin_role != "ADMIN":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"FORBIDDEN: User role '{admin_role}' is not authorized to enact network mitigation. ADMIN role required.",
            )

        incident = self.incident_repo.get_by_id(incident_id)
        if not incident:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Incident {incident_id} not found in repository.",
            )

        # Dispatch flow rule to OpenFlow switch
        dpid = getattr(incident, "switch_id", None) or "0000000000000002"
        flow_res = await flow_manager.install_drop_rule(
            dpid=dpid,
            src_ip=incident.src_ip,
            dst_port=incident.dst_port,
            priority=65535,
            hard_timeout=duration_sec,
        )

        audit_id = f"AUDIT-{int(datetime.utcnow().timestamp())}"
        audit_record = {
            "approved_by": admin_user,
            "approved_at": datetime.utcnow().isoformat(),
            "executed_action": action,
            "controller_response": flow_res.get("message", "Rule installed"),
            "is_verified": flow_res.get("is_verified_on_switch", False),
        }

        # Update persistent repository
        self.incident_repo.update_mitigation(
            incident_id=incident_id,
            mitigation_status="EXECUTED",
            audit_data=audit_record,
        )

        # Create immutable security audit log
        audit_status = "SUCCESS" if flow_res.get("is_verified_on_switch", False) else "SIMULATION_STANDBY"
        audit_log = AuditLog(
            log_id=audit_id,
            timestamp=datetime.utcnow().isoformat(),
            username=admin_user,
            user_role=admin_role,
            action_type=f"MITIGATION_{action}",
            resource_id=incident_id,
            status=audit_status,
            details=f"Admin {admin_user} authorized {action} against flow {incident.src_ip} -> {incident.dst_ip}:{incident.dst_port}. Verified: {flow_res.get('is_verified_on_switch', False)}",
        )
        self.audit_repo.create(audit_log)

        return {
            "success": True,
            "message": f"Mitigation [{action}] authorized by {admin_user} and dispatched to OpenFlow switch {dpid}.",
            "audit_id": audit_id,
            "executed_action": action,
            "flow_rule_installed": flow_res.get("rule_id", "OFP-RULE-101"),
        }

    async def rollback_mitigation(
        self,
        incident_id: str,
        admin_user: str,
        admin_role: str,
        reason: str = "Admin manual rollback"
    ) -> Dict[str, Any]:
        """Rollback an active mitigation: dispatches rule removal to OpenFlow controller."""
        if admin_role != "ADMIN":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"FORBIDDEN: User role '{admin_role}' is not authorized to rollback mitigation. ADMIN role required.",
            )

        incident = self.incident_repo.get_by_id(incident_id)
        if not incident:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Incident {incident_id} not found in repository.",
            )

        dpid = getattr(incident, "switch_id", None) or "0000000000000002"
        flow_res = await flow_manager.remove_drop_rule(
            dpid=dpid,
            src_ip=incident.src_ip,
            dst_port=incident.dst_port,
        )

        audit_id = f"AUDIT-RB-{int(datetime.utcnow().timestamp())}"
        audit_log = AuditLog(
            log_id=audit_id,
            timestamp=datetime.utcnow().isoformat(),
            username=admin_user,
            user_role=admin_role,
            action_type="MITIGATION_ROLLBACK",
            resource_id=incident_id,
            status="SUCCESS",
            details=f"Admin {admin_user} executed rollback of mitigation on {incident.src_ip}: {reason}. Response: {flow_res.get('message')}",
        )
        self.audit_repo.create(audit_log)

        self.incident_repo.update_mitigation(
            incident_id=incident_id,
            mitigation_status="ROLLED_BACK",
            audit_data={"rolled_back_by": admin_user, "reason": reason, "timestamp": datetime.utcnow().isoformat()},
        )

        return {
            "success": True,
            "message": f"Mitigation successfully rolled back by {admin_user} for incident {incident_id}.",
            "audit_id": audit_id,
            "executed_action": "ROLLBACK",
            "flow_rule_installed": None,
        }

    def reject_mitigation(self, incident_id: str, reason: str, username: str, user_role: str) -> Dict[str, Any]:
        self.incident_repo.update_status(incident_id, "CLOSED")
        
        audit_id = f"AUDIT-{int(datetime.utcnow().timestamp())}"
        audit_log = AuditLog(
            log_id=audit_id,
            timestamp=datetime.utcnow().isoformat(),
            username=username,
            user_role=user_role,
            action_type="MITIGATION_REJECTED",
            resource_id=incident_id,
            status="REJECTED",
            details=f"Mitigation recommendation rejected: {reason}",
        )
        self.audit_repo.create(audit_log)
        return {"success": True, "message": "Recommendation marked as rejected."}

mitigation_service = MitigationService()
