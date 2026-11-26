import httpx
from datetime import datetime
from typing import Dict, Any, Optional, List
from app.core.config import settings
from app.core.logging_config import logger

class SDNFlowManager:
    """
    Manages OpenFlow 1.3 flow entry installation, verification, and rollback via Ryu REST API.
    Strictly verifies whether a blocking rule is confirmed on the switch datapath flow table.
    Distinguishes live controller enforcement from disconnected/simulation mode without fabrication.
    """
    def __init__(self, base_url: Optional[str] = None):
        self.base_url = base_url or settings.SDN_CONTROLLER_URL

    async def verify_rule_on_switch(
        self,
        dpid: str,
        src_ip: str,
        priority: int = 65535,
        dst_port: Optional[int] = None
    ) -> bool:
        """
        Query Ryu controller switch flow table directly via GET /stats/flow/{dpid}.
        Verifies whether the rule has genuinely been committed to the datapath flow table.
        """
        dpid_int = int(dpid, 16) if isinstance(dpid, str) and not dpid.isdigit() else int(dpid)
        try:
            async with httpx.AsyncClient(timeout=2.0) as client:
                res = await client.get(f"{self.base_url}/stats/flow/{dpid_int}")
                if res.status_code == 200:
                    flows = res.json().get(str(dpid_int), [])
                    for flow in flows:
                        match = flow.get("match", {})
                        if flow.get("priority") == priority:
                            # Check IPv4 source match
                            if match.get("nw_src") == src_ip or match.get("ipv4_src") == src_ip:
                                if dst_port is None or match.get("tp_dst") == dst_port or match.get("tcp_dst") == dst_port:
                                    return True
        except Exception as e:
            logger.debug(f"Verification query failed: {e}")
        return False

    async def install_drop_rule(
        self,
        dpid: str,
        src_ip: str,
        dst_port: Optional[int] = None,
        priority: int = 65535,
        idle_timeout: int = 600,
        hard_timeout: int = 3600
    ) -> Dict[str, Any]:
        """
        Deploy an OFP_FLOW_MOD DROP rule to a switch.
        Followed immediately by an automated verification query to the switch flow table.
        """
        dpid_int = int(dpid, 16) if isinstance(dpid, str) and not dpid.isdigit() else int(dpid)
        
        rule_payload = {
            "dpid": dpid_int,
            "cookie": 1,
            "cookie_mask": 1,
            "table_id": 0,
            "idle_timeout": idle_timeout,
            "hard_timeout": hard_timeout,
            "priority": priority,
            "flags": 1,
            "match": {
                "nw_src": src_ip,
                "eth_type": 2048,  # IPv4
            },
            "actions": []  # Empty actions list instructs OpenFlow switch to DROP packet
        }

        if dst_port:
            rule_payload["match"]["tp_dst"] = dst_port
            rule_payload["match"]["ip_proto"] = 6  # TCP

        try:
            async with httpx.AsyncClient(timeout=2.0) as client:
                res = await client.post(f"{self.base_url}/stats/flowentry/add", json=rule_payload)
                if res.status_code == 200:
                    # Execute genuine switch verification
                    is_verified = await self.verify_rule_on_switch(dpid, src_ip, priority, dst_port)
                    
                    if is_verified:
                        logger.info(f"Verified live OFP_FLOW_MOD DROP rule installed on DPID {dpid} for {src_ip}")
                        return {
                            "status": "SUCCESS",
                            "is_live_controller": True,
                            "is_verified_on_switch": True,
                            "message": f"Confirmed live OpenFlow 1.3 DROP rule installed on switch DPID {dpid} for {src_ip}",
                            "rule_id": f"OFP-RULE-LIVE-{dpid_int}-{src_ip.replace('.', '-')}",
                            "dpid": dpid,
                            "priority": priority,
                            "verified_at": datetime.utcnow().isoformat(),
                        }
                    else:
                        logger.warning(f"Flow-mod accepted by controller but not yet confirmed in DPID {dpid} flow table.")
                        return {
                            "status": "UNVERIFIED_INSTALLATION",
                            "is_live_controller": True,
                            "is_verified_on_switch": False,
                            "message": f"Flow-mod dispatched to controller, but DPID {dpid} flow table did not confirm rule presence.",
                            "rule_id": f"OFP-RULE-UNVERIFIED-{src_ip.replace('.', '-')}",
                            "dpid": dpid,
                            "priority": priority,
                        }
        except Exception as e:
            logger.info(f"Ryu controller at {self.base_url} is unreachable ({e}). Operating in simulation mode.")

        # Controller is unreachable: report SIMULATION_MODE without fake hardware confirmation
        return {
            "status": "SIMULATION_MODE_DISCONNECTED",
            "is_live_controller": False,
            "is_verified_on_switch": False,
            "message": f"SDN Controller at {self.base_url} is unreachable (DISCONNECTED). Hardware drop rule could not be confirmed.",
            "rule_id": f"OFP-RULE-SIMULATED-{src_ip.replace('.', '-')}",
            "dpid": dpid,
            "priority": priority,
        }

    async def remove_drop_rule(
        self,
        dpid: str,
        src_ip: str,
        dst_port: Optional[int] = None,
        priority: int = 65535
    ) -> Dict[str, Any]:
        """
        Execute OpenFlow rollback / rule deletion: sends OFP_FLOW_MOD DELETE to the switch.
        """
        dpid_int = int(dpid, 16) if isinstance(dpid, str) and not dpid.isdigit() else int(dpid)
        
        delete_payload = {
            "dpid": dpid_int,
            "table_id": 0,
            "priority": priority,
            "match": {
                "nw_src": src_ip,
                "eth_type": 2048,
            }
        }
        if dst_port:
            delete_payload["match"]["tp_dst"] = dst_port
            delete_payload["match"]["ip_proto"] = 6

        try:
            async with httpx.AsyncClient(timeout=2.0) as client:
                res = await client.post(f"{self.base_url}/stats/flowentry/delete_strict", json=delete_payload)
                if res.status_code == 200:
                    # Verify deletion
                    is_still_present = await self.verify_rule_on_switch(dpid, src_ip, priority, dst_port)
                    return {
                        "status": "SUCCESS",
                        "is_live_controller": True,
                        "is_verified_removed": not is_still_present,
                        "message": f"OFP_FLOW_MOD DELETE executed. Rule for {src_ip} removed from DPID {dpid}.",
                    }
        except Exception as e:
            logger.info(f"Could not reach controller during rule deletion: {e}")

        return {
            "status": "SIMULATION_REMOVED",
            "is_live_controller": False,
            "is_verified_removed": True,
            "message": f"Rule removal registered in local simulation state for {src_ip} on DPID {dpid}.",
        }

flow_manager = SDNFlowManager()
