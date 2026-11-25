import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';
import { KPICard } from '../components/dashboard/KPICard';
import { TrafficChart } from '../components/dashboard/TrafficChart';
import { AttackDistribution } from '../components/dashboard/AttackDistribution';
import { LatestAlert } from '../components/dashboard/LatestAlert';
import { XAIExplanationCard } from '../components/dashboard/XAIExplanationCard';
import { SDNStatusCard } from '../components/dashboard/SDNStatusCard';
import { RecentEvents } from '../components/dashboard/RecentEvents';
import { MitigationModal } from '../components/mitigation/MitigationModal';
import { AlertDetails } from '../components/alerts/AlertDetails';
import { useDashboard } from '../hooks/useDashboard';
import { api } from '../services/api';
import { Incident, IncidentInvestigationData, IncidentStatus } from '../types/incident';
import {
  Activity,
  ShieldAlert,
  Flame,
  ShieldCheck,
  AlertCircle,
  Zap,
  Network,
  Cpu,
} from 'lucide-react';
import { formatNumber } from '../utils/formatters';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    loading,
    isDemo,
    kpis,
    trafficHistory,
    attackDistribution,
    latestIncident,
    timeRange,
    setTimeRange,
    refresh,
  } = useDashboard();

  // Modal states
  const [mitigationModalOpen, setMitigationModalOpen] = useState(false);
  const [selectedIncidentForMitigation, setSelectedIncidentForMitigation] = useState<Incident | null>(null);

  const [investigationData, setInvestigationData] = useState<IncidentInvestigationData | null>(null);
  const [investigationModalOpen, setInvestigationModalOpen] = useState(false);

  const handleOpenMitigation = (incident: Incident) => {
    setSelectedIncidentForMitigation(incident);
    setMitigationModalOpen(true);
  };

  const handleConfirmMitigation = async (incident: Incident, action: string) => {
    await api.approveMitigation({
      incident_id: incident.incident_id,
      action,
    });
    refresh();
  };

  const handleInvestigate = async (incident: Incident) => {
    try {
      const res = await api.getIncidentDetails(incident.incident_id);
      setInvestigationData(res.data);
      setInvestigationModalOpen(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateStatus = async (status: IncidentStatus) => {
    if (investigationData) {
      await api.updateIncidentStatus(investigationData.incident.incident_id, status);
      investigationData.incident.status = status;
      refresh();
    }
  };

  return (
    <PageContainer
      title="Security Operations Dashboard"
      subtitle="Real-time OpenFlow telemetry, hybrid AI detection, and automated explainable evidence correlation."
      isDemo={isDemo}
    >
      {/* Top Critical Alert Banner */}
      <LatestAlert
        incident={latestIncident}
        onViewDetails={handleInvestigate}
        onInvestigate={handleInvestigate}
        onRequestBlock={handleOpenMitigation}
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Flows"
          value={formatNumber(kpis.total_flows)}
          subtitle="Monitored in OpenFlow tables"
          change="+14.2% /hr"
          isPositive={true}
          icon={Activity}
          colorVariant="cyan"
        />
        <KPICard
          title="Known Attacks"
          value={formatNumber(kpis.known_attacks)}
          subtitle="Classified by supervised models"
          change="97.4% accuracy"
          isPositive={true}
          icon={Flame}
          colorVariant="red"
        />
        <KPICard
          title="Unknown Threats"
          value={formatNumber(kpis.unknown_threats)}
          subtitle="Open-set zero-day candidates"
          change="Requires investigation"
          isPositive={false}
          icon={ShieldAlert}
          colorVariant="purple"
        />
        <KPICard
          title="Mitigated"
          value={formatNumber(kpis.mitigated)}
          subtitle="Human-approved flow rules"
          change="100% audited"
          isPositive={true}
          icon={ShieldCheck}
          colorVariant="green"
        />
      </div>

      {/* Secondary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="p-3.5 rounded-xl bg-soc-panel border border-soc-border flex items-center justify-between">
          <div>
            <span className="text-soc-dim block text-[10px] uppercase">Active Incidents</span>
            <span className="text-lg font-bold text-red-400">{kpis.active_incidents} Active</span>
          </div>
          <AlertCircle className="w-5 h-5 text-red-400/80" />
        </div>
        <div className="p-3.5 rounded-xl bg-soc-panel border border-soc-border flex items-center justify-between">
          <div>
            <span className="text-soc-dim block text-[10px] uppercase">Anomaly Rate</span>
            <span className="text-lg font-bold text-amber-400">{kpis.anomaly_rate}%</span>
          </div>
          <Zap className="w-5 h-5 text-amber-400/80" />
        </div>
        <div className="p-3.5 rounded-xl bg-soc-panel border border-soc-border flex items-center justify-between">
          <div>
            <span className="text-soc-dim block text-[10px] uppercase">Controller Status</span>
            <span className="text-lg font-bold text-emerald-400">{kpis.controller_status}</span>
          </div>
          <Network className="w-5 h-5 text-emerald-400/80" />
        </div>
        <div className="p-3.5 rounded-xl bg-soc-panel border border-soc-border flex items-center justify-between">
          <div>
            <span className="text-soc-dim block text-[10px] uppercase">Model Health</span>
            <span className="text-lg font-bold text-soc-cyan">{kpis.model_health}</span>
          </div>
          <Cpu className="w-5 h-5 text-soc-cyan/80" />
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TrafficChart
            data={trafficHistory}
            selectedRange={timeRange}
            onRangeChange={setTimeRange}
            isLoading={loading}
          />
        </div>
        <div>
          <AttackDistribution data={attackDistribution} />
        </div>
      </div>

      {/* Subsystem Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <XAIExplanationCard
          shap={{
            incident_id: latestIncident?.incident_id || 'INC-00142',
            base_value: 0.12,
            prediction_score: 0.94,
            target_class: 'Zero-Day Candidate',
            summary: 'High packet rate, destination port 8443, and flow duration contributed most to the anomaly.',
            features: [
              { feature_name: 'Packet Rate (pps)', contribution: 0.42, feature_value: '508.1', is_positive: true },
              { feature_name: 'Destination Port', contribution: 0.31, feature_value: 8443, is_positive: true },
              { feature_name: 'Flow Duration (s)', contribution: 0.18, feature_value: '18.5', is_positive: true },
              { feature_name: 'Byte Count', contribution: 0.09, feature_value: '2.1 MB', is_positive: true },
              { feature_name: 'TCP Flag Entropy', contribution: 0.05, feature_value: 'URG,ACK', is_positive: true },
            ],
          }}
          onOpenXAI={() => navigate('/xai')}
        />

        <SDNStatusCard
          status={{
            is_online: true,
            controller_name: 'Ryu OpenFlow Controller',
            controller_version: 'v4.34 / OFP 1.3',
            openflow_status: 'ACTIVE',
            connected_switches: 4,
            active_rules: 158,
            latency_ms: 2.4,
            error_count: 0,
            uptime_seconds: 43200,
          }}
          onOpenSDN={() => navigate('/sdn-controller')}
        />
      </div>

      {/* Recent Security Events Table */}
      <RecentEvents
        incidents={latestIncident ? [latestIncident] : []}
        onSelectIncident={handleInvestigate}
      />

      {/* Mitigation Confirmation Modal (Human-in-the-Loop) */}
      <MitigationModal
        isOpen={mitigationModalOpen}
        incident={selectedIncidentForMitigation}
        onClose={() => setMitigationModalOpen(false)}
        onConfirm={handleConfirmMitigation}
      />

      {/* Deep Incident Investigation Workspace */}
      {investigationModalOpen && (
        <AlertDetails
          data={investigationData}
          onClose={() => setInvestigationModalOpen(false)}
          onApproveBlock={() => {
            setInvestigationModalOpen(false);
            if (investigationData) {
              handleOpenMitigation(investigationData.incident);
            }
          }}
          onSetStatus={handleUpdateStatus}
        />
      )}
    </PageContainer>
  );
};
