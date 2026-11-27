import React, { useState, useEffect } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { api } from '../services/api';
import { Incident } from '../types/incident';
import { ApprovalPanel } from '../components/mitigation/ApprovalPanel';
import { ActionStatus } from '../components/mitigation/ActionStatus';
import { MitigationModal } from '../components/mitigation/MitigationModal';
import { ShieldCheck, RefreshCw, AlertTriangle, ShieldBan, Sliders } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Mitigation: React.FC = () => {
  const { user, canMitigate } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getIncidents();
      setIncidents(res.incidents);
      setIsDemo(res.is_demo);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = (inc: Incident) => {
    setSelectedIncident(inc);
    setModalOpen(true);
  };

  const handleMonitor = async (inc: Incident) => {
    await api.updateIncidentStatus(inc.incident_id, 'INVESTIGATING');
    loadData();
  };

  const handleReject = async (inc: Incident) => {
    await api.rejectMitigation({ incident_id: inc.incident_id, reason: 'False positive / benign operator traffic' });
    loadData();
  };

  return (
    <PageContainer
      title="Intelligent Human-in-the-Loop Mitigation"
      subtitle="Defensive policy enforcement for OpenFlow datapaths. Destructive network actions require authenticated administrator verification and are recorded in immutable audit logs."
      isDemo={isDemo}
      actions={
        <button
          onClick={loadData}
          disabled={loading}
          className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-xs font-medium text-slate-700 transition flex items-center gap-1.5 shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh State
        </button>
      }
    >
      {/* Zero Auto-Destruction Policy Notice */}
      <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-amber-950 block font-semibold text-xs">
            Safety Invariant: Recommendation-Only Default
          </strong>
          <p className="text-amber-800 leading-relaxed font-sans">
            Autonomous AI models must never unilaterally disconnect live network ports. All defensive recommendations (Block, Quarantine, Rate Limit) remain in <strong>PENDING REVIEW</strong> until a credentialed Administrator validates correlated telemetry and authorizes the OpenFlow Flow-Mod command.
          </p>
        </div>
      </div>

      {/* Pending Approvals Panel */}
      <ApprovalPanel
        incidents={incidents}
        onApprove={handleApprove}
        onMonitor={handleMonitor}
        onReject={handleReject}
      />

      {/* Audit Log of Enforced Flow Rules */}
      <ActionStatus incidents={incidents} />

      {/* Mitigation Confirmation Dialog */}
      <MitigationModal
        isOpen={modalOpen}
        incident={selectedIncident}
        onClose={() => setModalOpen(false)}
        onConfirm={async (inc, action) => {
          await api.approveMitigation({ incident_id: inc.incident_id, action });
          loadData();
        }}
      />
    </PageContainer>
  );
};
