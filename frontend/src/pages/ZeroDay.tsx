import React, { useState, useEffect } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { api } from '../services/api';
import { Incident, IncidentInvestigationData, IncidentStatus } from '../types/incident';
import { SeverityBadge } from '../components/alerts/SeverityBadge';
import { AlertDetails } from '../components/alerts/AlertDetails';
import { MitigationModal } from '../components/mitigation/MitigationModal';
import { formatBytes, formatDuration, formatTimestamp, formatFullDate } from '../utils/formatters';
import {
  ShieldAlert,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  ShieldBan,
  BrainCircuit,
  Download,
  GitCompare,
  RefreshCw,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const ZeroDay: React.FC = () => {
  const { canMitigate, canInvestigate } = useAuth();
  const [threats, setThreats] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [investigationData, setInvestigationData] = useState<IncidentInvestigationData | null>(null);
  const [investigationOpen, setInvestigationOpen] = useState(false);
  const [mitigationOpen, setMitigationOpen] = useState(false);
  const [comparisonModalOpen, setComparisonModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const loadZeroDay = async () => {
    try {
      setLoading(true);
      const res = await api.getZeroDayThreats();
      setThreats(res.threats);
      setIsDemo(res.is_demo);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadZeroDay();
  }, []);

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

  const handleUpdateStatus = async (inc: Incident, newStatus: IncidentStatus) => {
    await api.updateIncidentStatus(inc.incident_id, newStatus);
    setThreats((prev) =>
      prev.map((i) => (i.incident_id === inc.incident_id ? { ...i, status: newStatus } : i))
    );
  };

  const handleExportEvidence = (inc: Incident) => {
    const evidenceJson = JSON.stringify(inc, null, 2);
    const blob = new Blob([evidenceJson], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sentinel_evidence_${inc.incident_id}.json`;
    a.click();
  };

  const filteredThreats = threats.filter((t) => {
    return statusFilter === 'ALL' || t.status === statusFilter;
  });

  return (
    <PageContainer
      title="Zero-Day Candidate Detection"
      subtitle="Open-set recognition engine isolates novel zero-day attack candidates where known classifier confidence is low and Autoencoder reconstruction loss is anomalous."
      isDemo={isDemo}
      actions={
        <button
          onClick={loadZeroDay}
          disabled={loading}
          className="px-3 py-1.5 rounded-lg bg-soc-panelLight border border-soc-border hover:border-soc-cyan/40 text-xs font-mono text-soc-text hover:text-soc-cyan transition flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Zero-Day Queue
        </button>
      }
    >
      {/* Research Methodology Alert */}
      <div className="p-4 rounded-xl bg-soc-purple/10 border border-soc-purple/30 text-xs text-soc-text flex items-start gap-3">
        <HelpCircle className="w-5 h-5 text-soc-purple flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-white block font-mono">
            Open-World Decision Boundary Principle
          </strong>
          <p className="text-soc-muted leading-relaxed">
            Standard classifiers force anomalous packets into predefined classes (e.g., misclassifying novel exfiltration as HTTP brute force). SENTINEL-X establishes an open-set decision threshold: if maximum softmax confidence falls below 0.65 and latent autoencoder error exceeds 0.70, traffic is designated as an <strong>UNKNOWN / ZERO-DAY CANDIDATE</strong>.
          </p>
        </div>
      </div>

      {/* Filter Ribbon */}
      <div className="soc-card p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
        <span className="text-soc-dim">
          Filter by Lifecycle Status:
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {['ALL', 'NEW', 'INVESTIGATING', 'CONFIRMED', 'FALSE_POSITIVE', 'MITIGATED', 'CLOSED'].map(
            (st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded transition ${
                  statusFilter === st
                    ? 'bg-soc-cyan text-black font-bold'
                    : 'bg-soc-bg border border-soc-border text-soc-muted hover:text-white'
                }`}
              >
                {st}
              </button>
            )
          )}
        </div>
      </div>

      {/* Zero-Day Table */}
      <div className="soc-card space-y-4">
        <div className="flex items-center justify-between border-b border-soc-border pb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-soc-cyan" />
            <h3 className="text-base font-semibold text-white tracking-wide">
              Candidate Incident Registry
            </h3>
          </div>
          <span className="text-xs font-mono text-soc-dim">
            {filteredThreats.length} Flagged Candidates
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-soc-border text-soc-dim uppercase text-[10px]">
                <th className="py-2.5 px-3">Incident ID</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Flow (Src → Dst)</th>
                <th className="py-2.5 px-3">Proto</th>
                <th className="py-2.5 px-3">Packets / Vol</th>
                <th className="py-2.5 px-3">Rate</th>
                <th className="py-2.5 px-3">Anomaly</th>
                <th className="py-2.5 px-3">Unknown Prob</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Research Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-soc-border/50">
              {filteredThreats.map((inc) => (
                <tr key={inc.incident_id} className="hover:bg-soc-panelLight/40 transition">
                  <td className="py-3 px-3 font-bold text-soc-cyan">{inc.incident_id}</td>
                  <td className="py-3 px-3">
                    <SeverityBadge severity={inc.severity} />
                  </td>
                  <td className="py-3 px-3 text-white">
                    {inc.src_ip}:{inc.src_port} → {inc.dst_ip}:{inc.dst_port}
                  </td>
                  <td className="py-3 px-3 text-soc-muted">{inc.protocol}</td>
                  <td className="py-3 px-3 text-white">
                    {inc.packet_count.toLocaleString()} ({formatBytes(inc.byte_count)})
                  </td>
                  <td className="py-3 px-3 text-amber-400">{inc.packet_rate.toFixed(1)} pps</td>
                  <td className="py-3 px-3 text-red-400 font-bold">{inc.anomaly_score}</td>
                  <td className="py-3 px-3 text-soc-purple font-bold">
                    {Math.round((inc.unknown_score || 0.9) * 100)}%
                  </td>
                  <td className="py-3 px-3">
                    <span className="soc-badge bg-soc-panelLight text-soc-muted border border-soc-border">
                      {inc.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1 font-sans">
                      <button
                        onClick={() => handleInvestigate(inc)}
                        title="Open Investigation Workspace"
                        className="p-1.5 rounded bg-soc-cyan/15 text-soc-cyan border border-soc-cyan/30 hover:bg-soc-cyan/25 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleExportEvidence(inc)}
                        title="Export Evidence JSON"
                        className="p-1.5 rounded bg-soc-panelLight text-soc-muted border border-soc-border hover:text-white transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          setSelectedIncident(inc);
                          setComparisonModalOpen(true);
                        }}
                        title="Compare with Known Baseline Patterns"
                        className="p-1.5 rounded bg-soc-panelLight text-soc-muted border border-soc-border hover:text-soc-purple transition"
                      >
                        <GitCompare className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          setSelectedIncident(inc);
                          setMitigationOpen(true);
                        }}
                        title="Approve & Block Flow"
                        className="p-1.5 rounded bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600/40 transition"
                      >
                        <ShieldBan className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comparison Modal */}
      {comparisonModalOpen && selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-soc-panel border border-soc-border rounded-2xl w-full max-w-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-soc-border pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <GitCompare className="w-4 h-4 text-soc-purple" />
                Pattern Comparison: Unknown Incident vs Known Baselines
              </h3>
              <button
                onClick={() => setComparisonModalOpen(false)}
                className="text-soc-muted hover:text-white text-xs font-mono"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-4 rounded-xl bg-soc-bg border border-red-500/30 space-y-2">
                <span className="soc-badge bg-red-500/20 text-red-400">Candidate Flow</span>
                <div className="text-white font-bold">{selectedIncident.incident_id}</div>
                <div>Packet Rate: <strong className="text-red-400">{selectedIncident.packet_rate} pps</strong></div>
                <div>Byte Rate: <strong className="text-red-400">{formatBytes(selectedIncident.byte_rate)}/s</strong></div>
                <div>Port: <strong className="text-white">{selectedIncident.dst_port}</strong></div>
                <div>Flags: <strong className="text-white">{selectedIncident.tcp_flags || 'NONE'}</strong></div>
                <div>Autoencoder Loss: <strong className="text-red-400">{selectedIncident.anomaly_score}</strong></div>
              </div>

              <div className="p-4 rounded-xl bg-soc-bg border border-emerald-500/30 space-y-2">
                <span className="soc-badge bg-emerald-500/20 text-emerald-400">Baseline Normal Profile</span>
                <div className="text-white font-bold">Standard OpenFlow Profile</div>
                <div>Packet Rate: <strong className="text-emerald-400">&lt; 150 pps</strong></div>
                <div>Byte Rate: <strong className="text-emerald-400">&lt; 20 KB/s</strong></div>
                <div>Standard Ports: <strong className="text-white">80, 443, 53</strong></div>
                <div>Flags: <strong className="text-white">ACK, PSH</strong></div>
                <div>Autoencoder Loss: <strong className="text-emerald-400">&lt; 0.15</strong></div>
              </div>
            </div>

            <p className="text-xs text-soc-muted font-mono leading-relaxed pt-2">
              <strong>Evaluation:</strong> Candidate deviates 4.8σ in packet rate and payload entropy. Nearest known centroid: DoS (distance = 2.41), exceeding open-set threshold $\tau = 1.20$. System correctly classifies as ZERO-DAY CANDIDATE instead of forcing into DoS.
            </p>
          </div>
        </div>
      )}

      {/* Investigation Details Modal */}
      {investigationOpen && (
        <AlertDetails
          data={investigationData}
          onClose={() => setInvestigationOpen(false)}
          onApproveBlock={() => {
            setInvestigationOpen(false);
            setMitigationOpen(true);
          }}
          onSetStatus={async (status) => {
            if (selectedIncident) {
              await handleUpdateStatus(selectedIncident, status);
            }
          }}
        />
      )}

      {/* Mitigation Modal */}
      <MitigationModal
        isOpen={mitigationOpen}
        incident={selectedIncident}
        onClose={() => setMitigationOpen(false)}
        onConfirm={async (inc, action) => {
          await api.approveMitigation({ incident_id: inc.incident_id, action });
          loadZeroDay();
        }}
      />
    </PageContainer>
  );
};
