from typing import Dict, Any, List
from app.ml.detection_engine import detection_engine
from app.database.repositories.flow_repository import FlowRepository
from app.database.repositories.incident_repository import IncidentRepository
from app.models.flow import Flow
from app.models.incident import Incident
from datetime import datetime

class DetectionService:
    def __init__(self):
        self.flow_repo = FlowRepository()
        self.incident_repo = IncidentRepository()

    def ingest_flow(self, flow_dict: Dict[str, Any]) -> Dict[str, Any]:
        result = detection_engine.process_flow(flow_dict)
        
        flow_id = flow_dict.get("flow_id", f"FL-{int(datetime.utcnow().timestamp())}")
        status = "active"
        if result.final_label == "Normal":
            status = "normal"

        flow_model = Flow(
            flow_id=flow_id,
            switch_id=str(flow_dict.get("switch_id", "0000000000000001")),
            src_ip=str(flow_dict.get("src_ip", "192.168.1.100")),
            dst_ip=str(flow_dict.get("dst_ip", "10.0.0.10")),
            src_port=int(flow_dict.get("src_port", 50000)),
            dst_port=int(flow_dict.get("dst_port", 80)),
            protocol=str(flow_dict.get("protocol", "TCP")),
            packet_count=int(flow_dict.get("packet_count", 100)),
            byte_count=int(flow_dict.get("byte_count", 15000)),
            duration_sec=float(flow_dict.get("duration_sec", 1.0)),
            packet_rate=float(flow_dict.get("packet_rate", 100.0)),
            byte_rate=float(flow_dict.get("byte_rate", 15000.0)),
            tcp_flags=str(flow_dict.get("tcp_flags", "ACK")),
            timestamp=datetime.utcnow().isoformat(),
            classification=result.final_label,
            confidence=result.confidence,
            anomaly_score=result.anomaly_score,
            is_unknown=result.open_set.is_unknown,
            status=status,
        )
        self.flow_repo.create(flow_model)

        # If malicious or zero-day candidate, create Incident
        if result.final_label != "Normal":
            severity = "CRITICAL" if result.is_zero_day_candidate or result.final_label == "DDoS" else "HIGH"
            incident_id = f"INC-{int(datetime.utcnow().timestamp() * 1000) % 100000:05d}"
            
            inc = Incident(
                incident_id=incident_id,
                flow_id=flow_id,
                detected_at=datetime.utcnow().isoformat(),
                last_observed_at=datetime.utcnow().isoformat(),
                severity=severity,
                classification=result.final_label,
                confidence=result.confidence,
                anomaly_score=result.anomaly_score,
                unknown_score=result.unknown_score,
                status="NEW",
                is_zero_day_candidate=result.is_zero_day_candidate,
                src_ip=flow_model.src_ip,
                dst_ip=flow_model.dst_ip,
                src_port=flow_model.src_port,
                dst_port=flow_model.dst_port,
                protocol=flow_model.protocol,
                packet_count=flow_model.packet_count,
                byte_count=flow_model.byte_count,
                duration_sec=flow_model.duration_sec,
                packet_rate=flow_model.packet_rate,
                byte_rate=flow_model.byte_rate,
                tcp_flags=flow_model.tcp_flags,
                recommended_action="BLOCK_FLOW" if severity == "CRITICAL" else "QUARANTINE_FLOW",
                mitigation_status="RECOMMENDED",
            )
            self.incident_repo.create(inc)

        return result.dict()

detection_service = DetectionService()
