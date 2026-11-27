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
      title="Security Overview"
      subtitle="Network telemetry, threat detection, and incident activity."
      isDemo={isDemo}
    >
      {/* Top Critical Alert Banner */}
      <LatestAlert
        incident={latestIncident}
        onViewDetails={handleInvestigate}
        onInvestigate={handleInvestigate}
        onRequestBlock={handleOpenMitigation}
      />

      {/* Primary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Flows"
          value={formatNumber(kpis.total_flows)}
          subtitle="Monitored in OpenFlow tables"
          change="+14.2% /hr"
          isPositive={true}
          icon={Activity}
          colorVariant="blue"
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

      {/* Operational Metrics Sub-Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-slate-500 block text-[11px] font-medium uppercase tracking-wider">Active Incidents</span>
            <span className="text-lg font-bold text-red-600 font-mono mt-0.5 block">{kpis.active_incidents} Active</span>
          </div>
          <div className="p-2 rounded-md bg-red-50 text-red-600">
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-slate-500 block text-[11px] font-medium uppercase tracking-wider">Anomaly Rate</span>
            <span className="text-lg font-bold text-amber-700 font-mono mt-0.5 block">{kpis.anomaly_rate}%</span>
          </div>
          <div className="p-2 rounded-md bg-amber-50 text-amber-600">
            <Zap className="w-4 h-4" />
          </div>
        </div>
        <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-slate-500 block text-[11px] font-medium uppercase tracking-wider">Controller Status</span>
            <span className="text-lg font-bold text-emerald-700 font-mono mt-0.5 block">{kpis.controller_status}</span>
          </div>
          <div className="p-2 rounded-md bg-emerald-50 text-emerald-600">
            <Network className="w-4 h-4" />
          </div>
        </div>
        <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-slate-500 block text-[11px] font-medium uppercase tracking-wider">Model Health</span>
            <span className="text-lg font-bold text-blue-700 font-mono mt-0.5 block">{kpis.model_health}</span>
          </div>
          <div className="p-2 rounded-md bg-blue-50 text-blue-600">
            <Cpu className="w-4 h-4" />
          </div>
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

      {/* Recent Events Table */}
      <RecentEvents
        incidents={latestIncident ? [latestIncident] : []}
        onSelectIncident={handleInvestigate}
      />

      {/* Mitigation Action Modal */}
      <MitigationModal
        isOpen={mitigationModalOpen}
        incident={selectedIncidentForMitigation}
        onClose={() => setMitigationModalOpen(false)}
        onConfirm={handleConfirmMitigation}
      />

      {/* Investigation Details Modal */}
      {investigationModalOpen && (
        <AlertDetails
          data={investigationData}
          onClose={() => setInvestigationModalOpen(false)}
          onApproveBlock={() => {
            setInvestigationModalOpen(false);
            if (investigationData) handleOpenMitigation(investigationData.incident);
          }}
          onSetStatus={handleUpdateStatus}
        />
      )}
    </PageContainer>
  );
};
