import React, { useState } from 'react';
import { IncidentInvestigationData, IncidentStatus } from '../../types/incident';
import { SeverityBadge } from './SeverityBadge';
import { formatBytes, formatDuration, formatFullDate } from '../../utils/formatters';
import {
  ShieldAlert,
  Network,
  BrainCircuit,
  Sliders,
  CheckCircle2,
  XCircle,
  Eye,
  ArrowRight,
  GitCommit,
  X,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface AlertDetailsProps {
  data: IncidentInvestigationData | null;
  onClose: () => void;
  onApproveBlock: () => void;
  onSetStatus: (status: IncidentStatus) => void;
}

export const AlertDetails: React.FC<AlertDetailsProps> = ({
  data,
  onClose,
  onApproveBlock,
  onSetStatus,
}) => {
  const { canMitigate, canInvestigate } = useAuth();
  const [activeTab, setActiveTab] = useState<'evidence' | 'xai' | 'correlation'>('evidence');

  if (!data) return null;
  const { incident, flow, shap, lime, correlation_timeline } = data;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-soc-panel border border-soc-border rounded-2xl w-full max-w-5xl shadow-2xl my-8 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-soc-panelLight/40 border-b border-soc-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-soc-cyan/15 text-soc-cyan border border-soc-cyan/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide">
                  Incident Investigation Workspace: {incident.incident_id}
                </h3>
                <SeverityBadge severity={incident.severity} />
                <span className="soc-badge bg-soc-panelLight text-soc-cyan border border-soc-border">
                  {incident.status}
                </span>
              </div>
              <p className="text-xs text-soc-dim font-mono">
                Detected: {formatFullDate(incident.detected_at)}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-soc-muted hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-soc-border px-6 bg-soc-bg/40 text-xs font-mono">
          <button
            onClick={() => setActiveTab('evidence')}
            className={`py-3 px-4 border-b-2 font-semibold transition ${
              activeTab === 'evidence'
                ? 'border-soc-cyan text-soc-cyan'
                : 'border-transparent text-soc-dim hover:text-white'
            }`}
          >
            Network & SDN Evidence
          </button>
          <button
            onClick={() => setActiveTab('xai')}
            className={`py-3 px-4 border-b-2 font-semibold transition ${
              activeTab === 'xai'
                ? 'border-soc-purple text-soc-purple'
                : 'border-transparent text-soc-dim hover:text-white'
            }`}
          >
            AI Attribution (SHAP + LIME)
          </button>
          <button
            onClick={() => setActiveTab('correlation')}
            className={`py-3 px-4 border-b-2 font-semibold transition ${
              activeTab === 'correlation'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-soc-dim hover:text-white'
            }`}
          >
            SDN Attack Correlation
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto text-xs">
          {activeTab === 'evidence' && (
            <div className="space-y-6">
              {/* Network Evidence */}
              <div>
                <h4 className="font-mono text-soc-dim uppercase text-[11px] mb-3 flex items-center gap-2">
                  <Network className="w-4 h-4 text-soc-cyan" />
                  Network Flow Telemetry
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                  <div className="p-3 rounded-lg bg-soc-bg border border-soc-border">
                    <span className="text-soc-dim block text-[10px]">Source IP:Port</span>
                    <span className="text-white font-bold">{incident.src_ip}:{incident.src_port}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-soc-bg border border-soc-border">
                    <span className="text-soc-dim block text-[10px]">Destination IP:Port</span>
                    <span className="text-white font-bold">{incident.dst_ip}:{incident.dst_port}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-soc-bg border border-soc-border">
                    <span className="text-soc-dim block text-[10px]">Protocol & Flags</span>
                    <span className="text-soc-cyan font-bold">{incident.protocol} ({incident.tcp_flags || 'NONE'})</span>
                  </div>
                  <div className="p-3 rounded-lg bg-soc-bg border border-soc-border">
                    <span className="text-soc-dim block text-[10px]">Flow Duration</span>
                    <span className="text-white font-bold">{formatDuration(incident.duration_sec)}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-soc-bg border border-soc-border">
                    <span className="text-soc-dim block text-[10px]">Total Packets</span>
                    <span className="text-white font-bold">{incident.packet_count.toLocaleString()}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-soc-bg border border-soc-border">
                    <span className="text-soc-dim block text-[10px]">Byte Volume</span>
                    <span className="text-white font-bold">{formatBytes(incident.byte_count)}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-soc-bg border border-soc-border">
                    <span className="text-soc-dim block text-[10px]">Packet Rate</span>
                    <span className="text-white font-bold">{incident.packet_rate} pps</span>
                  </div>
                  <div className="p-3 rounded-lg bg-soc-bg border border-soc-border">
                    <span className="text-soc-dim block text-[10px]">Byte Throughput</span>
                    <span className="text-white font-bold">{formatBytes(incident.byte_rate)}/s</span>
                  </div>
                </div>
              </div>

              {/* AI Classification Evidence */}
              <div>
                <h4 className="font-mono text-soc-dim uppercase text-[11px] mb-3 flex items-center gap-2">
                  <BrainCircuit className="w-4 h-4 text-soc-purple" />
                  Hybrid Machine Learning Decision
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                  <div className="p-3 rounded-lg bg-soc-bg border border-soc-border">
                    <span className="text-soc-dim block text-[10px]">Primary Class</span>
                    <span className="text-white font-bold">{incident.classification}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-soc-bg border border-soc-border">
                    <span className="text-soc-dim block text-[10px]">Classifier Confidence</span>
                    <span className="text-soc-cyan font-bold">{Math.round(incident.confidence * 100)}%</span>
                  </div>
                  <div className="p-3 rounded-lg bg-soc-bg border border-soc-border">
                    <span className="text-soc-dim block text-[10px]">Autoencoder Anomaly</span>
                    <span className="text-red-400 font-bold">{incident.anomaly_score}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-soc-bg border border-soc-border">
                    <span className="text-soc-dim block text-[10px]">Unknown / Open-Set Score</span>
                    <span className="text-soc-purple font-bold">{incident.unknown_score || 0.0}</span>
                  </div>
                </div>
              </div>

              {/* Correlated SDN Event */}
              {incident.sdn_event && (
                <div>
                  <h4 className="font-mono text-soc-dim uppercase text-[11px] mb-3 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-amber-400" />
                    SDN Controller Telemetry Link
                  </h4>
                  <div className="p-4 rounded-xl bg-soc-bg border border-soc-border space-y-2 font-mono">
                    <div className="flex justify-between text-xs">
                      <span className="text-soc-dim">Event Reference:</span>
                      <span className="text-soc-cyan font-bold">{incident.sdn_event.event_id}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-soc-dim">Originating Switch DPID:</span>
                      <span className="text-white font-bold">{incident.sdn_event.switch_id}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-soc-dim">Packet-In Frequency Spike:</span>
                      <span className="text-amber-400 font-bold">{incident.sdn_event.packet_in_count} pps</span>
                    </div>
                    <p className="text-xs text-soc-muted pt-2 border-t border-soc-border/60">
                      {incident.sdn_event.description}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'xai' && (
            <div className="space-y-6">
              {shap ? (
                <div className="space-y-3">
                  <h4 className="font-mono text-soc-dim uppercase text-[11px]">SHAP Feature Importance</h4>
                  <div className="space-y-2">
                    {shap.features.map((f) => (
                      <div key={f.feature_name} className="p-2.5 rounded-lg bg-soc-bg border border-soc-border flex items-center justify-between font-mono">
                        <div>
                          <span className="text-white font-medium">{f.feature_name}</span>
                          <span className="text-soc-dim text-[11px] ml-2">({String(f.feature_value)})</span>
                        </div>
                        <span className={`font-bold ${f.contribution >= 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                          {f.contribution >= 0 ? `+${f.contribution}` : f.contribution}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-soc-dim font-mono">SHAP data not connected.</div>
              )}

              {lime && (
                <div className="space-y-3 pt-3 border-t border-soc-border/60">
                  <h4 className="font-mono text-soc-dim uppercase text-[11px]">LIME Local Surrogate Rules</h4>
                  <div className="p-3.5 rounded-lg bg-soc-bg border border-soc-border text-xs text-soc-text leading-relaxed">
                    {lime.explanation_text}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'correlation' && (
            <div className="space-y-4">
              <p className="text-xs text-soc-dim font-mono">
                Temporal correlation between data-plane packet telemetry and control-plane OpenFlow signaling:
              </p>
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-soc-border">
                {correlation_timeline.map((step) => (
                  <div key={step.step} className="relative">
                    <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-soc-cyan border-2 border-soc-panel" />
                    <div className="p-3.5 rounded-xl bg-soc-bg border border-soc-border space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white text-xs">{step.title}</span>
                        <span className="font-mono text-[10px] text-soc-dim">{step.timestamp}</span>
                      </div>
                      <p className="text-xs text-soc-muted">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Mitigation Authorization */}
        <div className="px-6 py-4 bg-soc-panelLight/40 border-t border-soc-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-soc-dim">Update Status:</span>
            {(['CONFIRMED', 'FALSE_POSITIVE', 'CLOSED'] as IncidentStatus[]).map((st) => (
              <button
                key={st}
                onClick={() => onSetStatus(st)}
                disabled={!canInvestigate}
                className="px-2.5 py-1 rounded bg-soc-bg hover:bg-soc-panelLight border border-soc-border text-[11px] font-mono text-soc-muted hover:text-white transition"
              >
                {st}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-soc-panel border border-soc-border text-soc-muted hover:text-white transition text-xs font-medium"
            >
              Close
            </button>
            <button
              onClick={onApproveBlock}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg"
            >
              <CheckCircle2 className="w-4 h-4" />
              Approve & Block Flow
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
