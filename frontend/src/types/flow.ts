export type ProtocolType = 'TCP' | 'UDP' | 'ICMP' | 'OTHER';

export interface NetworkFlow {
  flow_id: string;
  switch_id: string;
  src_ip: string;
  dst_ip: string;
  src_port: number;
  dst_port: number;
  protocol: ProtocolType;
  packet_count: number;
  byte_count: number;
  duration_sec: number;
  packet_rate: number;
  byte_rate: number;
  tcp_flags?: string;
  timestamp: string;
  classification: string;
  confidence: number;
  anomaly_score: number;
  is_unknown: boolean;
  status: 'active' | 'mitigated' | 'quarantined' | 'closed';
}

export interface TrafficStats {
  total_flows: number;
  active_flows: number;
  packets_per_sec: number;
  bytes_per_sec: number;
  tcp_percent: number;
  udp_percent: number;
  icmp_percent: number;
  top_sources: { ip: string; count: number }[];
  top_destinations: { ip: string; count: number }[];
  top_ports: { port: number; count: number }[];
}

export interface TrafficHistoryPoint {
  timestamp: string;
  normal: number;
  suspicious: number;
  malicious: number;
}
