export interface SDNSwitch {
  dpid: string;
  name: string;
  ip_address: string;
  openflow_version: string;
  connected_since: string;
  ports_count: number;
  flow_count: number;
  packet_in_rate: number;
  status: 'ONLINE' | 'OFFLINE' | 'DEGRADED';
}

export interface SDNFlowRule {
  rule_id: string;
  dpid: string;
  table_id: number;
  priority: number;
  match: {
    in_port?: number;
    eth_type?: string;
    ipv4_src?: string;
    ipv4_dst?: string;
    ip_proto?: number;
    tcp_dst?: number;
    udp_dst?: number;
  };
  actions: string[];
  packet_count: number;
  byte_count: number;
  duration_sec: number;
  hard_timeout: number;
  idle_timeout: number;
}

export interface SDNControllerEvent {
  event_id: string;
  timestamp: string;
  event_type: 'PACKET_IN' | 'FLOW_MOD' | 'PORT_STATUS' | 'SWITCH_ENTER' | 'SWITCH_LEAVE' | 'LATENCY_SPIKE';
  dpid: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  details: string;
}

export interface SDNControllerStatus {
  is_online: boolean;
  controller_name: string;
  controller_version: string;
  openflow_status: string;
  connected_switches: number;
  active_rules: number;
  latency_ms: number;
  error_count: number;
  uptime_seconds: number;
}
