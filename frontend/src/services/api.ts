import axios from 'axios';
import { APP_CONFIG } from '../utils/constants';
import { TrafficStats, TrafficHistoryPoint, NetworkFlow } from '../types/flow';
import { AttackDistributionItem, KnownAttackModelConfig } from '../types/attack';
import { Incident, IncidentInvestigationData } from '../types/incident';
import { ShapExplanation, LimeExplanation, ExplanationReliabilityResult } from '../types/xai';
import { SDNControllerStatus, SDNSwitch, SDNFlowRule, SDNControllerEvent } from '../types/sdn';
import { authService } from './auth';

const apiClient = axios.create({
  baseURL: APP_CONFIG.apiBaseUrl,
  timeout: 4000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization header automatically
apiClient.interceptors.request.use((config) => {
  const token = authService.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ==========================================
// REALISTIC MOCK / DEMO DATASETS (Rule 2/3)
// ==========================================

const MOCK_TRAFFIC_STATS: TrafficStats = {
  total_flows: 24850,
  active_flows: 1420,
  packets_per_sec: 18450,
  bytes_per_sec: 14285000,
  tcp_percent: 74.2,
  udp_percent: 21.5,
  icmp_percent: 4.3,
  top_sources: [
    { ip: '185.220.101.5', count: 4820 },
    { ip: '45.154.255.89', count: 3120 },
    { ip: '192.168.1.105', count: 1840 },
    { ip: '10.0.0.15', count: 1200 },
  ],
  top_destinations: [
    { ip: '10.0.0.2', count: 6840 },
    { ip: '10.0.0.8', count: 4520 },
    { ip: '10.0.0.5', count: 2190 },
  ],
  top_ports: [
    { port: 443, count: 11400 },
    { port: 80, count: 5200 },
    { port: 8443, count: 2840 },
    { port: 22, count: 1420 },
  ],
};

const MOCK_ATTACK_DISTRIBUTION: AttackDistributionItem[] = [
  { name: 'Normal', count: 24705, percentage: 94.2, color: '#10B981' },
  { name: 'DDoS', count: 68, percentage: 2.8, color: '#EF4444' },
  { name: 'Port Scan', count: 32, percentage: 1.3, color: '#F59E0B' },
  { name: 'Brute Force', count: 18, percentage: 0.7, color: '#EC4899' },
  { name: 'Botnet', count: 10, percentage: 0.4, color: '#8B5CF6' },
  { name: 'Unknown Attack', count: 17, percentage: 0.6, color: '#06B6D4' },
];

const MOCK_FLOWS: NetworkFlow[] = [
  {
    flow_id: 'FL-009182',
    switch_id: '0000000000000001',
    src_ip: '192.168.1.105',
    dst_ip: '10.0.0.15',
    src_port: 52180,
    dst_port: 80,
    protocol: 'TCP',
    packet_count: 5120,
    byte_count: 412000,
    duration_sec: 42.1,
    packet_rate: 121.6,
    byte_rate: 9786.2,
    tcp_flags: 'ACK,PSH',
    timestamp: new Date(Date.now() - 40000).toISOString(),
    classification: 'Normal',
    confidence: 0.98,
    anomaly_score: 0.04,
    is_unknown: false,
    status: 'active',
  },
  {
    flow_id: 'FL-009183',
    switch_id: '0000000000000002',
    src_ip: '185.220.101.5',
    dst_ip: '10.0.0.2',
    src_port: 54122,
    dst_port: 443,
    protocol: 'TCP',
    packet_count: 189200,
    byte_count: 12849000,
    duration_sec: 4.2,
    packet_rate: 45047.6,
    byte_rate: 3059285.7,
    tcp_flags: 'SYN',
    timestamp: new Date(Date.now() - 150000).toISOString(),
    classification: 'DDoS',
    confidence: 0.96,
    anomaly_score: 0.92,
    is_unknown: false,
    status: 'mitigated',
  },
  {
    flow_id: 'FL-009184',
    switch_id: '0000000000000003',
    src_ip: '45.154.255.89',
    dst_ip: '10.0.0.8',
    src_port: 61244,
    dst_port: 8443,
    protocol: 'TCP',
    packet_count: 9400,
    byte_count: 2100400,
    duration_sec: 18.5,
    packet_rate: 508.1,
    byte_rate: 113535.1,
    tcp_flags: 'URG,ACK,PSH',
    timestamp: new Date(Date.now() - 85000).toISOString(),
    classification: 'Unknown Attack',
    confidence: 0.38,
    anomaly_score: 0.94,
    is_unknown: true,
    status: 'active',
  },
  {
    flow_id: 'FL-009185',
    switch_id: '0000000000000001',
    src_ip: '198.51.100.44',
    dst_ip: '10.0.0.5',
    src_port: 42100,
    dst_port: 22,
    protocol: 'TCP',
    packet_count: 1400,
    byte_count: 89000,
    duration_sec: 12.0,
    packet_rate: 116.6,
    byte_rate: 7416.6,
    tcp_flags: 'SYN,ACK',
    timestamp: new Date(Date.now() - 210000).toISOString(),
    classification: 'Brute Force',
    confidence: 0.89,
    anomaly_score: 0.76,
    is_unknown: false,
    status: 'active',
  },
  {
    flow_id: 'FL-009186',
    switch_id: '0000000000000002',
    src_ip: '91.240.118.17',
    dst_ip: '10.0.0.12',
    src_port: 33412,
    dst_port: 8080,
    protocol: 'TCP',
    packet_count: 14200,
    byte_count: 3840000,
    duration_sec: 9.3,
    packet_rate: 1526.8,
    byte_rate: 412903.2,
    tcp_flags: 'RST,ACK',
    timestamp: new Date(Date.now() - 320000).toISOString(),
    classification: 'Zero-Day Candidate',
    confidence: 0.31,
    anomaly_score: 0.88,
    is_unknown: true,
    status: 'active',
  },
];

const MOCK_INCIDENTS: Incident[] = [
  {
    incident_id: 'INC-00142',
    flow_id: 'FL-009184',
    detected_at: new Date(Date.now() - 85000).toISOString(),
    last_observed_at: new Date(Date.now() - 10000).toISOString(),
    severity: 'CRITICAL',
    classification: 'Zero-Day Candidate',
    confidence: 0.38,
    anomaly_score: 0.94,
    unknown_score: 0.91,
    status: 'INVESTIGATING',
    is_zero_day_candidate: true,
    src_ip: '45.154.255.89',
    dst_ip: '10.0.0.8',
    src_port: 61244,
    dst_port: 8443,
    protocol: 'TCP',
    packet_count: 9400,
    byte_count: 2100400,
    duration_sec: 18.5,
    packet_rate: 508.1,
    byte_rate: 113535.1,
    tcp_flags: 'URG,ACK,PSH',
    sdn_event: {
      event_id: 'EVT-9041',
      switch_id: '0000000000000003',
      packet_in_count: 1420,
      flow_rule_id: 'RULE-OF13-882',
      description: 'Abnormal Packet-In spike detected on OpenFlow switch port 3',
    },
    recommended_action: 'BLOCK_FLOW',
    mitigation_status: 'RECOMMENDED',
  },
  {
    incident_id: 'INC-00141',
    flow_id: 'FL-009183',
    detected_at: new Date(Date.now() - 150000).toISOString(),
    last_observed_at: new Date(Date.now() - 120000).toISOString(),
    severity: 'HIGH',
    classification: 'DDoS',
    confidence: 0.96,
    anomaly_score: 0.92,
    unknown_score: 0.04,
    status: 'MITIGATED',
    is_zero_day_candidate: false,
    src_ip: '185.220.101.5',
    dst_ip: '10.0.0.2',
    src_port: 54122,
    dst_port: 443,
    protocol: 'TCP',
    packet_count: 189200,
    byte_count: 12849000,
    duration_sec: 4.2,
    packet_rate: 45047.6,
    byte_rate: 3059285.7,
    tcp_flags: 'SYN',
    sdn_event: {
      event_id: 'EVT-9039',
      switch_id: '0000000000000002',
      packet_in_count: 8900,
      flow_rule_id: 'RULE-OF13-801',
      description: 'SYN flood buffer saturation on switch 2',
    },
    recommended_action: 'BLOCK_FLOW',
    mitigation_status: 'EXECUTED',
    mitigation_audit: {
      approved_by: 'admin',
      approved_at: new Date(Date.now() - 110000).toISOString(),
      executed_action: 'BLOCK_FLOW',
      controller_response: 'OFP_FLOW_MOD DROP rule installed with priority 65535',
    },
  },
  {
    incident_id: 'INC-00140',
    flow_id: 'FL-009186',
    detected_at: new Date(Date.now() - 320000).toISOString(),
    last_observed_at: new Date(Date.now() - 250000).toISOString(),
    severity: 'HIGH',
    classification: 'Zero-Day Candidate',
    confidence: 0.31,
    anomaly_score: 0.88,
    unknown_score: 0.89,
    status: 'NEW',
    is_zero_day_candidate: true,
    src_ip: '91.240.118.17',
    dst_ip: '10.0.0.12',
    src_port: 33412,
    dst_port: 8080,
    protocol: 'TCP',
    packet_count: 14200,
    byte_count: 3840000,
    duration_sec: 9.3,
    packet_rate: 1526.8,
    byte_rate: 412903.2,
    tcp_flags: 'RST,ACK',
    sdn_event: {
      event_id: 'EVT-9035',
      switch_id: '0000000000000002',
      packet_in_count: 850,
      flow_rule_id: 'RULE-OF13-772',
      description: 'Unrecognized TCP flag sequence causing multiple table misses',
    },
    recommended_action: 'QUARANTINE_FLOW',
    mitigation_status: 'RECOMMENDED',
  },
];

const MOCK_SDN_STATUS: SDNControllerStatus = {
  is_online: true,
  controller_name: 'Ryu OpenFlow Controller',
  controller_version: 'v4.34 / OFP 1.3',
  openflow_status: 'ACTIVE',
  connected_switches: 4,
  active_rules: 158,
  latency_ms: 2.4,
  error_count: 0,
  uptime_seconds: 43200,
};

const MOCK_SWITCHES: SDNSwitch[] = [
  {
    dpid: '0000000000000001',
    name: 'OpenFlow Switch S1 (Edge Gateway)',
    ip_address: '10.0.0.1:48210',
    openflow_version: 'OpenFlow 1.3',
    connected_since: '12h 40m',
    ports_count: 8,
    flow_count: 64,
    packet_in_rate: 14.2,
    status: 'ONLINE',
  },
  {
    dpid: '0000000000000002',
    name: 'OpenFlow Switch S2 (DMZ Core)',
    ip_address: '10.0.0.2:48211',
    openflow_version: 'OpenFlow 1.3',
    connected_since: '12h 40m',
    ports_count: 16,
    flow_count: 82,
    packet_in_rate: 88.5,
    status: 'ONLINE',
  },
  {
    dpid: '0000000000000003',
    name: 'OpenFlow Switch S3 (App Tier)',
    ip_address: '10.0.0.3:48212',
    openflow_version: 'OpenFlow 1.3',
    connected_since: '12h 38m',
    ports_count: 12,
    flow_count: 45,
    packet_in_rate: 34.0,
    status: 'ONLINE',
  },
  {
    dpid: '0000000000000004',
    name: 'OpenFlow Switch S4 (Database Tier)',
    ip_address: '10.0.0.4:48213',
    openflow_version: 'OpenFlow 1.3',
    connected_since: '12h 35m',
    ports_count: 8,
    flow_count: 22,
    packet_in_rate: 4.8,
    status: 'ONLINE',
  },
];

const MOCK_FLOW_RULES: SDNFlowRule[] = [
  {
    rule_id: 'OFP-RULE-101',
    dpid: '0000000000000002',
    table_id: 0,
    priority: 65535,
    match: { ipv4_src: '185.220.101.5', ip_proto: 6, tcp_dst: 443 },
    actions: ['CLEAR_ACTIONS (DROP)'],
    packet_count: 142090,
    byte_count: 9662120,
    duration_sec: 450,
    hard_timeout: 3600,
    idle_timeout: 600,
  },
  {
    rule_id: 'OFP-RULE-102',
    dpid: '0000000000000001',
    table_id: 0,
    priority: 1000,
    match: { eth_type: '0x0800', ip_proto: 6, tcp_dst: 80 },
    actions: ['OUTPUT:Port 2'],
    packet_count: 82100,
    byte_count: 5582800,
    duration_sec: 4210,
    hard_timeout: 0,
    idle_timeout: 0,
  },
  {
    rule_id: 'OFP-RULE-103',
    dpid: '0000000000000003',
    table_id: 0,
    priority: 500,
    match: { eth_type: '0x0800', ipv4_dst: '10.0.0.8' },
    actions: ['OUTPUT:Port 3', 'CONTROLLER (SAMPLE)'],
    packet_count: 19400,
    byte_count: 4340000,
    duration_sec: 1420,
    hard_timeout: 0,
    idle_timeout: 300,
  },
];

const MOCK_CONTROLLER_EVENTS: SDNControllerEvent[] = [
  {
    event_id: 'EVT-9041',
    timestamp: new Date(Date.now() - 75000).toISOString(),
    event_type: 'PACKET_IN',
    dpid: '0000000000000003',
    severity: 'WARNING',
    details: 'Packet-In rate exceeded 500 pps on DPID 3; possible unknown flow burst',
  },
  {
    event_id: 'EVT-9040',
    timestamp: new Date(Date.now() - 110000).toISOString(),
    event_type: 'FLOW_MOD',
    dpid: '0000000000000002',
    severity: 'INFO',
    details: 'Admin-approved DROP rule successfully installed for src_ip 185.220.101.5',
  },
  {
    event_id: 'EVT-9039',
    timestamp: new Date(Date.now() - 150000).toISOString(),
    event_type: 'PACKET_IN',
    dpid: '0000000000000002',
    severity: 'CRITICAL',
    details: 'SYN packet flood detected on switch port 4; high packet buffer utilization',
  },
  {
    event_id: 'EVT-9038',
    timestamp: new Date(Date.now() - 600000).toISOString(),
    event_type: 'SWITCH_ENTER',
    dpid: '0000000000000004',
    severity: 'INFO',
    details: 'Switch S4 re-established OpenFlow 1.3 handshake with controller',
  },
];

// ==========================================
// API CLIENT IMPLEMENTATIONS WITH FALLBACK
// ==========================================

export const api = {
  // DASHBOARD
  async getDashboardSummary(): Promise<{
    kpis: {
      total_flows: number;
      known_attacks: number;
      unknown_threats: number;
      mitigated: number;
      active_incidents: number;
      anomaly_rate: number;
      controller_status: string;
      model_health: string;
    };
    traffic_stats: TrafficStats;
    attack_distribution: AttackDistributionItem[];
    latest_incident: Incident;
    is_demo: boolean;
  }> {
    try {
      const res = await apiClient.get('/dashboard/summary');
      return { ...res.data, is_demo: false };
    } catch {
      return {
        kpis: {
          total_flows: 24850,
          known_attacks: 128,
          unknown_threats: 17,
          mitigated: 112,
          active_incidents: 5,
          anomaly_rate: 0.58,
          controller_status: 'HEALTHY',
          model_health: 'OPTIMAL (97.4%)',
        },
        traffic_stats: MOCK_TRAFFIC_STATS,
        attack_distribution: MOCK_ATTACK_DISTRIBUTION,
        latest_incident: MOCK_INCIDENTS[0],
        is_demo: true,
      };
    }
  },

  async getTrafficHistory(range: '1H' | '6H' | '24H' | '7D'): Promise<{ points: TrafficHistoryPoint[]; is_demo: boolean }> {
    try {
      const res = await apiClient.get(`/traffic/history?range=${range}`);
      return { points: res.data.points, is_demo: false };
    } catch {
      const count = range === '1H' ? 12 : range === '6H' ? 24 : range === '24H' ? 24 : 14;
      const points: TrafficHistoryPoint[] = [];
      const now = Date.now();
      const stepMs = (range === '1H' ? 3600000 : range === '6H' ? 21600000 : range === '24H' ? 86400000 : 604800000) / count;

      for (let i = count; i >= 0; i--) {
        const t = new Date(now - i * stepMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const base = 1200 + Math.floor(Math.sin(i / 2) * 400);
        points.push({
          timestamp: t,
          normal: base,
          suspicious: Math.floor(base * 0.08 + Math.random() * 20),
          malicious: Math.floor(base * 0.03 + (i === 2 ? 85 : Math.random() * 10)),
        });
      }
      return { points, is_demo: true };
    }
  },

  // FLOWS & NETWORK
  async getLiveFlows(): Promise<{ flows: NetworkFlow[]; stats: TrafficStats; is_demo: boolean }> {
    try {
      const res = await apiClient.get('/traffic/realtime');
      return { flows: res.data.flows, stats: res.data.stats, is_demo: false };
    } catch {
      return { flows: MOCK_FLOWS, stats: MOCK_TRAFFIC_STATS, is_demo: true };
    }
  },

  // ZERO-DAY & INCIDENTS
  async getZeroDayThreats(): Promise<{ threats: Incident[]; is_demo: boolean }> {
    try {
      const res = await apiClient.get('/zero-day');
      return { threats: res.data, is_demo: false };
    } catch {
      const zeroDayOnly = MOCK_INCIDENTS.filter((inc) => inc.is_zero_day_candidate);
      return { threats: zeroDayOnly, is_demo: true };
    }
  },

  async getIncidentDetails(incidentId: string): Promise<{ data: IncidentInvestigationData; is_demo: boolean }> {
    try {
      const res = await apiClient.get(`/incidents/${incidentId}`);
      return { data: res.data, is_demo: false };
    } catch {
      const inc = MOCK_INCIDENTS.find((i) => i.incident_id === incidentId) || MOCK_INCIDENTS[0];
      const fl = MOCK_FLOWS.find((f) => f.flow_id === inc.flow_id) || MOCK_FLOWS[2];
      
      const shap = await this.getShapExplanation(inc.incident_id);
      const lime = await this.getLimeExplanation(inc.incident_id);

      const investigation: IncidentInvestigationData = {
        incident: inc,
        flow: fl,
        shap: shap.explanation,
        lime: lime.explanation,
        correlation_timeline: [
          {
            step: 1,
            title: 'Unusual Flow Initiation',
            timestamp: inc.detected_at,
            description: `Host ${inc.src_ip} initiated high-entropy connection to ${inc.dst_ip}:${inc.dst_port} via switch 3`,
            type: 'network',
          },
          {
            step: 2,
            title: 'SDN Packet-In Spike',
            timestamp: new Date(new Date(inc.detected_at).getTime() + 2000).toISOString(),
            description: 'Controller reported abnormal Packet-In rate of 508 pps on DPID 0000000000000003',
            type: 'sdn',
          },
          {
            step: 3,
            title: 'Open-Set AI Classification',
            timestamp: new Date(new Date(inc.detected_at).getTime() + 4000).toISOString(),
            description: `Autoencoder anomaly score (${inc.anomaly_score}) exceeded threshold (0.65). Known classifier confidence was low (${inc.confidence}), designating ZERO-DAY CANDIDATE.`,
            type: 'ml',
          },
          {
            step: 4,
            title: 'Mitigation Recommendation Created',
            timestamp: new Date(new Date(inc.detected_at).getTime() + 6000).toISOString(),
            description: 'Recommended Action: BLOCK_FLOW pending Administrator confirmation',
            type: 'action',
          },
        ],
      };
      return { data: investigation, is_demo: true };
    }
  },

  async updateIncidentStatus(incidentId: string, status: string): Promise<{ success: boolean; is_demo: boolean }> {
    try {
      const res = await apiClient.post(`/incidents/${incidentId}/status`, { status });
      return { success: res.data.success, is_demo: false };
    } catch {
      const target = MOCK_INCIDENTS.find((i) => i.incident_id === incidentId);
      if (target) {
        target.status = status as any;
      }
      return { success: true, is_demo: true };
    }
  },

  // KNOWN ATTACKS
  async getKnownAttacks(): Promise<{
    distribution: AttackDistributionItem[];
    model_config: KnownAttackModelConfig;
    incidents: Incident[];
    is_demo: boolean;
  }> {
    try {
      const res = await apiClient.get('/attacks/known');
      return { ...res.data, is_demo: false };
    } catch {
      return {
        distribution: MOCK_ATTACK_DISTRIBUTION,
        model_config: {
          model_type: 'XGBoost',
          dataset: 'CIC-IDS2017 / SDN-OpenFlow-Flows',
          accuracy: 0.984,
          precision: 0.978,
          recall: 0.972,
          f1_score: 0.975,
          classes: ['Normal', 'DDoS', 'DoS', 'Port Scan', 'Brute Force', 'Botnet', 'Web Attack'],
        },
        incidents: MOCK_INCIDENTS.filter((i) => !i.is_zero_day_candidate),
        is_demo: true,
      };
    }
  },

  // EXPLAINABLE AI (SHAP & LIME)
  async getShapExplanation(incidentId: string): Promise<{ explanation: ShapExplanation; is_demo: boolean }> {
    try {
      const res = await apiClient.get(`/xai/${incidentId}/shap`);
      return { explanation: res.data, is_demo: false };
    } catch {
      return {
        explanation: {
          incident_id: incidentId,
          base_value: 0.12,
          prediction_score: 0.94,
          target_class: 'Zero-Day Attack / Malicious',
          summary: 'High packet rate, non-standard destination port, and abnormal TCP flag combinations contributed most to the anomaly.',
          features: [
            { feature_name: 'Packet Rate (pps)', contribution: 0.42, feature_value: '508.1 pps', is_positive: true },
            { feature_name: 'Destination Port', contribution: 0.31, feature_value: 8443, is_positive: true },
            { feature_name: 'Flow Duration (s)', contribution: 0.18, feature_value: '18.5s', is_positive: true },
            { feature_name: 'Byte Count', contribution: 0.09, feature_value: '2.1 MB', is_positive: true },
            { feature_name: 'TCP Flag Entropy', contribution: 0.05, feature_value: 'URG,ACK,PSH', is_positive: true },
            { feature_name: 'Source Port Range', contribution: -0.06, feature_value: 61244, is_positive: false },
          ],
        },
        is_demo: true,
      };
    }
  },

  async getLimeExplanation(incidentId: string): Promise<{ explanation: LimeExplanation; is_demo: boolean }> {
    try {
      const res = await apiClient.get(`/xai/${incidentId}/lime`);
      return { explanation: res.data, is_demo: false };
    } catch {
      return {
        explanation: {
          incident_id: incidentId,
          intercept: 0.18,
          prediction_score: 0.91,
          target_class: 'Unknown Attack Candidate',
          explanation_text:
            'LIME local surrogate regression indicates the traffic was flagged primarily due to Packet Rate exceeding typical baseline (> 350 pps) combined with destination port 8443 showing non-standard byte payload ratios.',
          reasons: [
            { rule: 'packet_rate > 350.0 pps', weight: 0.48, description: 'High packet frequency deviates 4.2σ from normal profile' },
            { rule: 'dst_port in [8443, 8080] & protocol == TCP', weight: 0.28, description: 'Unusual destination port pattern' },
            { rule: 'byte_rate > 100 KB/s', weight: 0.19, description: 'Abnormal byte throughput during connection window' },
            { rule: 'flow_duration < 30.0s', weight: 0.12, description: 'Rapid short-lived connection cluster' },
          ],
        },
        is_demo: true,
      };
    }
  },

  async getExplanationReliability(incidentId: string): Promise<{ result: ExplanationReliabilityResult; is_demo: boolean }> {
    try {
      const res = await apiClient.get(`/xai/${incidentId}/reliability`);
      return { result: res.data, is_demo: false };
    } catch {
      return {
        result: {
          stability_score: 87, // 87% stability per PRD example
          feature_ranking_consistency: 0.89,
          perturbation_test_result: 'PASS — Explanations demonstrate robust feature rank invariance under ±5% Gaussian input noise',
          tested_features_count: 8,
          perturbation_sigma: 0.05,
          top_features_retained: ['Packet Rate (pps)', 'Destination Port', 'Flow Duration (s)'],
        },
        is_demo: true,
      };
    }
  },

  // SDN CONTROLLER
  async getSDNStatus(): Promise<{ status: SDNControllerStatus; is_demo: boolean }> {
    try {
      const res = await apiClient.get('/sdn/status');
      return { status: res.data, is_demo: false };
    } catch {
      return { status: MOCK_SDN_STATUS, is_demo: true };
    }
  },

  async getSDNSwitches(): Promise<{ switches: SDNSwitch[]; is_demo: boolean }> {
    try {
      const res = await apiClient.get('/sdn/switches');
      return { switches: res.data, is_demo: false };
    } catch {
      return { switches: MOCK_SWITCHES, is_demo: true };
    }
  },

  async getSDNFlowRules(): Promise<{ rules: SDNFlowRule[]; is_demo: boolean }> {
    try {
      const res = await apiClient.get('/sdn/flows');
      return { rules: res.data, is_demo: false };
    } catch {
      return { rules: MOCK_FLOW_RULES, is_demo: true };
    }
  },

  async getSDNEvents(): Promise<{ events: SDNControllerEvent[]; is_demo: boolean }> {
    try {
      const res = await apiClient.get('/sdn/events');
      return { events: res.data, is_demo: false };
    } catch {
      return { events: MOCK_CONTROLLER_EVENTS, is_demo: true };
    }
  },

  // MITIGATION (HUMAN IN THE LOOP)
  async approveMitigation(params: {
    incident_id: string;
    action: string;
    duration_sec?: number;
  }): Promise<{ success: boolean; message: string; audit_id: string; is_demo: boolean }> {
    const user = authService.getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      throw new Error('UNAUTHORIZED: Only users with the ADMIN role can authorize network mitigation actions.');
    }

    try {
      const res = await apiClient.post('/mitigation/approve', params);
      return { ...res.data, is_demo: false };
    } catch {
      // Update local state in demo mode
      const inc = MOCK_INCIDENTS.find((i) => i.incident_id === params.incident_id);
      if (inc) {
        inc.status = 'MITIGATED';
        inc.mitigation_status = 'EXECUTED';
        inc.mitigation_audit = {
          approved_by: user.username,
          approved_at: new Date().toISOString(),
          executed_action: params.action as any,
          controller_response: `OpenFlow 1.3 rule deployed to switch ${inc.sdn_event?.switch_id || '0000000000000001'}`,
        };
      }
      return {
        success: true,
        message: `Mitigation [${params.action}] successfully approved by ${user.fullName} and dispatched to SDN Controller.`,
        audit_id: `AUDIT-${Date.now()}`,
        is_demo: true,
      };
    }
  },

  async rejectMitigation(params: { incident_id: string; reason: string }): Promise<{ success: boolean; is_demo: boolean }> {
    try {
      const res = await apiClient.post('/mitigation/reject', params);
      return { success: res.data.success, is_demo: false };
    } catch {
      const inc = MOCK_INCIDENTS.find((i) => i.incident_id === params.incident_id);
      if (inc) {
        inc.mitigation_status = 'REJECTED';
      }
      return { success: true, is_demo: true };
    }
  },

  // ADVERSARIAL TESTING
  async runAdversarialTest(config: {
    model_name: string;
    dataset_name: string;
    attack_category: string;
    perturbation_epsilon: number;
    iterations: number;
  }): Promise<{
    baseline: { accuracy: number; detection_rate: number; fpr: number };
    perturbed: { accuracy: number; detection_rate: number; fpr: number };
    performance_degradation: number;
    robustness_score: number;
    tested_samples: number;
    execution_time_ms: number;
    is_demo: boolean;
  }> {
    try {
      const res = await apiClient.post('/adversarial/run', config);
      return { ...res.data, is_demo: false };
    } catch {
      // Calculate realistic adversarial degradation based on epsilon
      const eps = config.perturbation_epsilon || 0.15;
      const degradation = Math.min(0.35, eps * 1.4);
      const baselineAcc = 0.984;
      const perturbedAcc = parseFloat((baselineAcc - degradation).toFixed(3));
      const baselineDet = 0.976;
      const perturbedDet = parseFloat((baselineDet - degradation * 1.1).toFixed(3));
      const baselineFpr = 0.012;
      const perturbedFpr = parseFloat((baselineFpr + degradation * 0.4).toFixed(3));
      const robustnessScore = parseFloat((100 - degradation * 100).toFixed(1));

      return {
        baseline: {
          accuracy: baselineAcc,
          detection_rate: baselineDet,
          fpr: baselineFpr,
        },
        perturbed: {
          accuracy: perturbedAcc,
          detection_rate: perturbedDet,
          fpr: perturbedFpr,
        },
        performance_degradation: parseFloat((degradation * 100).toFixed(1)),
        robustness_score: robustnessScore,
        tested_samples: 2500,
        execution_time_ms: 1240,
        is_demo: true,
      };
    }
  },

  // ALL INCIDENTS
  async getIncidents(): Promise<{ incidents: Incident[]; is_demo: boolean }> {
    try {
      const res = await apiClient.get('/incidents');
      return { incidents: res.data, is_demo: false };
    } catch {
      return { incidents: MOCK_INCIDENTS, is_demo: true };
    }
  },

  // REPORTS
  async getReportsList(): Promise<{
    reports: {
      report_id: string;
      title: string;
      type: string;
      generated_at: string;
      author: string;
      summary: string;
      download_url: string;
    }[];
    is_demo: boolean;
  }> {
    try {
      const res = await apiClient.get('/reports');
      return { reports: res.data, is_demo: false };
    } catch {
      return {
        reports: [
          {
            report_id: 'RPT-2026-11-01',
            title: 'Daily SDN Security & Attack Overview',
            type: 'Daily Security Report',
            generated_at: new Date(Date.now() - 86400000).toISOString(),
            author: 'SENTINEL-X Automated Engine',
            summary: 'Comprehensive 24-hour summary of 24,850 flows, 128 known attacks, and 17 unknown candidate detections.',
            download_url: '/api/reports/download/RPT-2026-11-01.csv',
          },
          {
            report_id: 'RPT-2026-11-02',
            title: 'Zero-Day Open-Set Detection Audit',
            type: 'Zero-Day Report',
            generated_at: new Date(Date.now() - 43200000).toISOString(),
            author: 'Security Administrator',
            summary: 'Deep-dive into 17 unknown traffic flows flagged by Autoencoder reconstruction loss with SHAP analysis.',
            download_url: '/api/reports/download/RPT-2026-11-02.csv',
          },
          {
            report_id: 'RPT-2026-11-03',
            title: 'Explainable AI Feature Stability Verification',
            type: 'XAI Report',
            generated_at: new Date(Date.now() - 21600000).toISOString(),
            author: 'ML/SDN Researcher',
            summary: 'Perturbation analysis of SHAP and LIME feature ranking stability under controlled input variance (87% consistency).',
            download_url: '/api/reports/download/RPT-2026-11-03.csv',
          },
          {
            report_id: 'RPT-2026-11-04',
            title: 'Adversarial Resilience Benchmark on OpenFlow Flows',
            type: 'Adversarial Robustness Report',
            generated_at: new Date(Date.now() - 10800000).toISOString(),
            author: 'ML/SDN Researcher',
            summary: 'Evaluation of Random Forest and XGBoost classifiers against feature perturbation and evasion patterns.',
            download_url: '/api/reports/download/RPT-2026-11-04.csv',
          },
        ],
        is_demo: true,
      };
    }
  },
};
