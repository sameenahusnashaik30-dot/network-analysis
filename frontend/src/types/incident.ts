import { NetworkFlow } from './flow';
import { ShapExplanation, LimeExplanation } from './xai';

export type IncidentSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export type IncidentStatus =
  | 'NEW'
  | 'INVESTIGATING'
  | 'CONFIRMED'
  | 'FALSE_POSITIVE'
  | 'MITIGATED'
  | 'CLOSED';

export type MitigationActionType =
  | 'BLOCK_FLOW'
  | 'QUARANTINE_FLOW'
  | 'RATE_LIMIT'
  | 'REMOVE_RULE'
  | 'MONITOR_ONLY';

export interface Incident {
  incident_id: string;
  flow_id: string;
  detected_at: string;
  last_observed_at: string;
  severity: IncidentSeverity;
  classification: string;
  confidence: number;
  anomaly_score: number;
  unknown_score: number;
  status: IncidentStatus;
  is_zero_day_candidate: boolean;
  
  // Network attributes
  src_ip: string;
  dst_ip: string;
  src_port: number;
  dst_port: number;
  protocol: string;
  packet_count: number;
  byte_count: number;
  duration_sec: number;
  packet_rate: number;
  byte_rate: number;
  tcp_flags?: string;

  // Correlated SDN evidence
  sdn_event?: {
    event_id: string;
    switch_id: string;
    packet_in_count: number;
    flow_rule_id: string;
    description: string;
  };

  // Mitigation
  recommended_action: MitigationActionType;
  mitigation_status?: 'RECOMMENDED' | 'APPROVED' | 'REJECTED' | 'EXECUTED';
  mitigation_audit?: {
    approved_by?: string;
    approved_at?: string;
    executed_action?: MitigationActionType;
    controller_response?: string;
  };
}

export interface IncidentInvestigationData {
  incident: Incident;
  flow: NetworkFlow;
  shap?: ShapExplanation;
  lime?: LimeExplanation;
  correlation_timeline: {
    step: number;
    title: string;
    timestamp: string;
    description: string;
    type: 'network' | 'ml' | 'sdn' | 'action';
  }[];
}
