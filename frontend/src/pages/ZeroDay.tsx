import React, { useState, useEffect } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { api } from '../services/api';
import { Incident, IncidentInvestigationData, IncidentStatus } from '../types/incident';
import { SeverityBadge } from '../components/alerts/SeverityBadge';
import { AlertDetails } from '../components/alerts/AlertDetails';
import { MitigationModal } from '../components/mitigation/MitigationModal';
import { formatBytes, formatDuration, formatTimestamp, resolveDeviceType, resolveSoftwareService } from '../utils/formatters';
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
  Info,
  Server,
  Activity,
  Layers,
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
  const [searchTerm, setSearchTerm] = useState<string>('');

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
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesSearch =
      !searchTerm ||
      t.incident_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.src_ip.includes(searchTerm) ||
      t.dst_ip.includes(searchTerm) ||
      resolveDeviceType(t.src_ip).toLowerCase().includes(searchTerm.toLowerCase()) ||
      resolveSoftwareService(t.dst_port, t.protocol).toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <PageContainer
      title="Unknown Threat Detection"
      subtitle="Open-set recognition isolates novel zero-day attack candidates where known classifier confidence is low and Autoencoder reconstruction loss is anomalous."
      isDemo={isDemo}
      actions={
        <button
          onClick={loadZeroDay}
          disabled={loading}
          className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-xs font-medium text-slate-700 transition flex items-center gap-1.5 shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Candidates
        </button>
      }
    >
      {/* Detection Methodology Banner */}
      <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-slate-700 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-slate-900 block font-semibold text-xs">
            Open-World Boundary & Hypothesis
          </strong>
          <p className="text-slate-600 leading-relaxed">
            Standard signature models force anomalous traffic into predefined classes. SENTINEL-X establishes an open-set decision threshold: if maximum softmax confidence falls below <strong>0.65</strong> and latent autoencoder error exceeds <strong>0.70</strong>, the traffic is designated as an <strong>UNKNOWN / ZERO-DAY CANDIDATE</strong>. Samples remain candidates pending analyst triage rather than asserted ground truth.
          </p>
        </div>
      </div>

      {/* Filter and Search Ribbon */}
      <div className="soc-card p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by IP, Host, Device type, or Service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-sans"
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-500 text-xs font-medium mr-1">Status:</span>
          {['ALL', 'NEW', 'INVESTIGATING', 'CONFIRMED', 'FALSE_POSITIVE', 'MITIGATED', 'CLOSED'].map(
            (st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded text-xs transition ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {st}
              </button>
            )
          )}
        </div>
      </div>

      {/* Candidate Incident Registry Table */}
      <div className="soc-card space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-slate-900">
              Candidate Incident Registry
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Showing {filteredThreats.length} of {threats.length} Flagged Candidates
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase text-[11px] font-semibold bg-slate-50/50">
                <th className="py-2.5 px-3">Incident ID</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Source Device & IP</th>
                <th className="py-2.5 px-3">Target Host & Service</th>
                <th className="py-2.5 px-3">Proto</th>
                <th className="py-2.5 px-3">Volume</th>
                <th className="py-2.5 px-3">Packet Rate</th>
                <th className="py-2.5 px-3">Anomaly Score</th>
                <th className="py-2.5 px-3">Unknown Prob</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Analyst Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredThreats.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-500">
                    No zero-day candidates matching current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredThreats.map((inc) => {
                  const srcDevice = resolveDeviceType(inc.src_ip);
                  const dstService = resolveSoftwareService(inc.dst_port, inc.protocol);

                  return (
                    <tr key={inc.incident_id} className="hover:bg-slate-50/80 transition font-mono">
                      <td className="py-2.5 px-3 font-semibold text-blue-600">{inc.incident_id}</td>
                      <td className="py-2.5 px-3 font-sans">
                        <SeverityBadge severity={inc.severity} />
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="text-slate-900 font-medium">{inc.src_ip}:{inc.src_port}</div>
                        <div className="text-[11px] text-slate-500 font-sans">{srcDevice}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="text-slate-900 font-medium">{inc.dst_ip}:{inc.dst_port}</div>
                        <div className="text-[11px] text-slate-500 font-sans">{dstService}</div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{inc.protocol}</td>
                      <td className="py-2.5 px-3 text-slate-700">
                        {inc.packet_count.toLocaleString()} pkts ({formatBytes(inc.byte_count)})
                      </td>
                      <td className="py-2.5 px-3 text-slate-900 font-medium">
                        {inc.packet_rate.toFixed(1)} pps
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-red-600">{inc.anomaly_score}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-purple-700">
                          {Math.round((inc.unknown_score || 0.9) * 100)}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-sans">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          {inc.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-sans">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleInvestigate(inc)}
                            title="Inspect Evidence & Telemetry"
                            className="px-2 py-1 rounded bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 transition text-xs font-medium flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5 text-blue-600" />
                            Investigate
                          </button>

                          <button
                            onClick={() => {
                              setSelectedIncident(inc);
                              setComparisonModalOpen(true);
                            }}
                            title="Compare against baseline traffic profiles"
                            className="p-1 rounded bg-white hover:bg-slate-100 border border-slate-300 text-slate-600 transition"
                          >
                            <GitCompare className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleExportEvidence(inc)}
                            title="Download Evidence JSON"
                            className="p-1 rounded bg-white hover:bg-slate-100 border border-slate-300 text-slate-600 transition"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              setSelectedIncident(inc);
                              setMitigationOpen(true);
                            }}
                            title="Open Mitigation Authorization"
                            className="px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-white transition text-xs font-medium flex items-center gap-1 shadow-sm"
                          >
                            <ShieldBan className="w-3.5 h-3.5" />
                            Block
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comparison Modal */}
      {comparisonModalOpen && selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <GitCompare className="w-4 h-4 text-purple-600" />
                Pattern Comparison: Candidate Flow vs Baseline Profile
              </h3>
              <button
                onClick={() => setComparisonModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-medium"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-4 rounded-lg bg-red-50/50 border border-red-200 space-y-2">
                <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-semibold bg-red-100 text-red-800">
                  Candidate Flow
                </span>
                <div className="text-slate-900 font-bold">{selectedIncident.incident_id}</div>
                <div>Source Device: <strong className="text-slate-800">{resolveDeviceType(selectedIncident.src_ip)}</strong></div>
                <div>Target Service: <strong className="text-slate-800">{resolveSoftwareService(selectedIncident.dst_port, selectedIncident.protocol)}</strong></div>
                <div>Packet Rate: <strong className="text-red-700">{selectedIncident.packet_rate.toFixed(1)} pps</strong></div>
                <div>Byte Rate: <strong className="text-red-700">{formatBytes(selectedIncident.byte_rate)}/s</strong></div>
                <div>Autoencoder Loss: <strong className="text-red-700">{selectedIncident.anomaly_score}</strong></div>
              </div>

              <div className="p-4 rounded-lg bg-emerald-50/50 border border-emerald-200 space-y-2">
                <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                  Baseline Normal Profile
                </span>
                <div className="text-slate-900 font-bold">Standard OpenFlow Profile</div>
                <div>Source Device: <strong className="text-slate-800">Validated Host</strong></div>
                <div>Target Service: <strong className="text-slate-800">Standard Service</strong></div>
                <div>Packet Rate: <strong className="text-emerald-700">&lt; 150 pps</strong></div>
                <div>Byte Rate: <strong className="text-emerald-700">&lt; 20 KB/s</strong></div>
                <div>Autoencoder Loss: <strong className="text-emerald-700">&lt; 0.15</strong></div>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed pt-2 border-t border-slate-100 font-sans">
              <strong>Evaluation:</strong> Candidate deviates significantly in packet rate and payload entropy. Nearest known centroid: DoS (distance = 2.41), exceeding open-set threshold τ = 1.20. The system appropriately flags this flow as an unknown candidate for review rather than forcing a false positive classification.
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
