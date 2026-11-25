import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { AlertTable } from '../components/alerts/AlertTable';
import { AlertDetails } from '../components/alerts/AlertDetails';
import { MitigationModal } from '../components/mitigation/MitigationModal';
import { useAlerts } from '../hooks/useAlerts';
import { api } from '../services/api';
import { Incident, IncidentInvestigationData, IncidentStatus } from '../types/incident';
import { Search, Filter, RefreshCw, AlertCircle } from 'lucide-react';

export const Incidents: React.FC = () => {
  const {
    incidents,
    loading,
    isDemo,
    search,
    setSearch,
    severityFilter,
    setSeverityFilter,
    statusFilter,
    setStatusFilter,
    refresh,
  } = useAlerts();

  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [investigationData, setInvestigationData] = useState<IncidentInvestigationData | null>(null);
  const [investigationOpen, setInvestigationOpen] = useState(false);
  const [mitigationOpen, setMitigationOpen] = useState(false);

  const handleInvestigate = async (inc: Incident) => {
    setSelectedIncident(inc);
    try {
      const res = await api.getIncidentDetails(inc.incident_id);
      setInvestigationData(res.data);
      setInvestigationOpen(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRequestBlock = (inc: Incident) => {
    setSelectedIncident(inc);
    setMitigationOpen(true);
  };

  const handleUpdateStatus = async (status: IncidentStatus) => {
    if (selectedIncident) {
      await api.updateIncidentStatus(selectedIncident.incident_id, status);
      selectedIncident.status = status;
      refresh();
    }
  };

  return (
    <PageContainer
      title="Incident Investigation & Management"
      subtitle="Comprehensive security incident triage. Review network telemetry, correlated OpenFlow switch events, and AI feature attributions."
      isDemo={isDemo}
      actions={
        <button
          onClick={refresh}
          disabled={loading}
          className="px-3 py-1.5 rounded-lg bg-soc-panelLight border border-soc-border hover:border-soc-cyan/40 text-xs font-mono text-soc-text hover:text-soc-cyan transition flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Incidents
        </button>
      }
    >
      {/* Search and Filters */}
      <div className="soc-card p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-soc-dim absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search incident ID, IP, attack type..."
            className="w-full bg-soc-bg border border-soc-border rounded-lg pl-9 pr-3 py-1.5 text-xs text-soc-text placeholder-soc-dim focus:outline-none focus:border-soc-cyan font-mono"
          />
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto flex-wrap text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-soc-dim">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-soc-bg border border-soc-border rounded px-2 py-1 text-white focus:outline-none"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-soc-dim">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-soc-bg border border-soc-border rounded px-2 py-1 text-white focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="NEW">New</option>
              <option value="INVESTIGATING">Investigating</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="FALSE_POSITIVE">False Positive</option>
              <option value="MITIGATED">Mitigated</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Incidents Registry */}
      <AlertTable
        incidents={incidents}
        onInvestigate={handleInvestigate}
        onRequestBlock={handleRequestBlock}
      />

      {/* Investigation Details Workspace Modal */}
      {investigationOpen && (
        <AlertDetails
          data={investigationData}
          onClose={() => setInvestigationOpen(false)}
          onApproveBlock={() => {
            setInvestigationOpen(false);
            setMitigationOpen(true);
          }}
          onSetStatus={handleUpdateStatus}
        />
      )}

      {/* Mitigation Confirmation Modal */}
      <MitigationModal
        isOpen={mitigationOpen}
        incident={selectedIncident}
        onClose={() => setMitigationOpen(false)}
        onConfirm={async (inc, action) => {
          await api.approveMitigation({ incident_id: inc.incident_id, action });
          refresh();
        }}
      />
    </PageContainer>
  );
};
