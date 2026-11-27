import React, { useState } from 'react';
import { IncidentInvestigationData, IncidentStatus } from '../../types/incident';
import { SeverityBadge } from './SeverityBadge';
import { formatBytes, formatDuration, formatFullDate, resolveDeviceType, resolveSoftwareService } from '../../utils/formatters';
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
  Server,
  Cpu,
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

  const srcDevice = resolveDeviceType(incident.src_ip);
  const dstService = resolveSoftwareService(incident.dst_port, incident.protocol);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-5xl shadow-xl my-8 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-slate-900">
                  Incident Investigation: {incident.incident_id}
                </h3>
                <SeverityBadge severity={incident.severity} />
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200">
                  {incident.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Detected: {formatFullDate(incident.detected_at)}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50/50 text-xs font-medium">
          <button
            onClick={() => setActiveTab('evidence')}
            className={`py-3 px-4 border-b-2 transition ${
              activeTab === 'evidence'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Network & Device Evidence
          </button>
          <button
            onClick={() => setActiveTab('xai')}
            className={`py-3 px-4 border-b-2 transition ${
              activeTab === 'xai'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Model Attribution (SHAP & LIME)
          </button>
          <button
            onClick={() => setActiveTab('correlation')}
            className={`py-3 px-4 border-b-2 transition ${
              activeTab === 'correlation'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            SDN Control-Plane Correlation
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto text-xs">
          {activeTab === 'evidence' && (
            <div className="space-y-6">
              {/* Host & Device Resolution */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                    <Server className="w-4 h-4 text-blue-600" />
                    <span>Originating Host Identity</span>
                  </div>
                  <div className="font-semibold text-slate-900 text-sm">{srcDevice}</div>
                  <div className="font-mono text-slate-600">{incident.src_ip}:{incident.src_port}</div>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                    <Cpu className="w-4 h-4 text-emerald-600" />
                    <span>Target Software & Service</span>
                  </div>
                  <div className="font-semibold text-slate-900 text-sm">{dstService}</div>
                  <div className="font-mono text-slate-600">{incident.dst_ip}:{incident.dst_port}</div>
                </div>
              </div>

              {/* Network Flow Telemetry */}
              <div>
                <h4 className="font-semibold text-slate-700 uppercase tracking-wider text-[11px] mb-3 flex items-center gap-2">
                  <Network className="w-4 h-4 text-blue-600" />
                  Flow Telemetry Parameters
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Protocol / Flags</span>
                    <span className="text-slate-900 font-semibold">{incident.protocol} ({incident.tcp_flags || 'NONE'})</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Flow Duration</span>
                    <span className="text-slate-900 font-semibold">{formatDuration(incident.duration_sec)}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Packet Count</span>
                    <span className="text-slate-900 font-semibold">{incident.packet_count.toLocaleString()}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Byte Volume</span>
                    <span className="text-slate-900 font-semibold">{formatBytes(incident.byte_count)}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Packet Rate</span>
                    <span className="text-slate-900 font-semibold">{incident.packet_rate.toFixed(1)} pps</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Byte Rate</span>
                    <span className="text-slate-900 font-semibold">{formatBytes(incident.byte_rate)}/s</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Switch DPID</span>
                    <span className="text-slate-900 font-semibold">{incident.sdn_event?.switch_id || flow?.switch_id || 's1 (00:01)'}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Flow Reference</span>
                    <span className="text-slate-900 font-semibold">{incident.flow_id || 'FLOW-1049'}</span>
                  </div>
                </div>
              </div>

              {/* AI Classification Evidence */}
              <div>
                <h4 className="font-semibold text-slate-700 uppercase tracking-wider text-[11px] mb-3 flex items-center gap-2">
                  <BrainCircuit className="w-4 h-4 text-purple-600" />
                  Hybrid ML Decision Evidence
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Primary Classification</span>
                    <span className="text-slate-900 font-semibold">{incident.classification}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Classifier Confidence</span>
                    <span className="text-blue-600 font-semibold">{Math.round(incident.confidence * 100)}%</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Autoencoder Reconstruction</span>
                    <span className="text-red-600 font-bold">{incident.anomaly_score}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Open-Set Unknown Probability</span>
                    <span className="text-purple-600 font-bold">{Math.round((incident.unknown_score || 0.85) * 100)}%</span>
                  </div>
                </div>
              </div>

              {/* Correlated SDN Event */}
              {incident.sdn_event && (
                <div>
                  <h4 className="font-semibold text-slate-700 uppercase tracking-wider text-[11px] mb-3 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-amber-600" />
                    OpenFlow Control-Plane Signal
                  </h4>
                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2 font-mono">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Event Reference:</span>
                      <span className="text-blue-600 font-semibold">{incident.sdn_event.event_id}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Originating Datapath ID:</span>
                      <span className="text-slate-900 font-semibold">{incident.sdn_event.switch_id}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Packet-In Rate:</span>
                      <span className="text-amber-600 font-semibold">{incident.sdn_event.packet_in_count} pps</span>
                    </div>
                    <p className="text-xs text-slate-600 pt-2 border-t border-slate-200 font-sans">
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
                  <h4 className="font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
                    SHAP Feature Attributions (Local Explanation)
                  </h4>
                  <div className="space-y-2">
                    {shap.features.map((f) => (
                      <div key={f.feature_name} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between font-mono">
                        <div>
                          <span className="text-slate-900 font-medium">{f.feature_name}</span>
                          <span className="text-slate-500 text-[11px] ml-2">({String(f.feature_value)})</span>
                        </div>
                        <span className={`font-semibold ${f.contribution >= 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                          {f.contribution >= 0 ? `+${f.contribution}` : f.contribution}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400 font-mono">SHAP data not connected.</div>
              )}

              {lime && (
                <div className="space-y-3 pt-3 border-t border-slate-200">
                  <h4 className="font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
                    LIME Local Surrogate Decision Rules
                  </h4>
                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed font-mono">
                    {lime.explanation_text}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'correlation' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Temporal correlation between data-plane packet telemetry and control-plane OpenFlow signaling:
              </p>
              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {correlation_timeline.map((step) => (
                  <div key={step.step} className="relative">
                    <div className="absolute -left-6 top-1.5 w-2.5 h-2.5 rounded-full bg-blue-600 border-2 border-white" />
                    <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900 text-xs">{step.title}</span>
                        <span className="font-mono text-[10px] text-slate-400">{step.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-600">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Update Status:</span>
            {(['CONFIRMED', 'FALSE_POSITIVE', 'CLOSED'] as IncidentStatus[]).map((st) => (
              <button
                key={st}
                onClick={() => onSetStatus(st)}
                disabled={!canInvestigate}
                className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 border border-slate-300 text-[11px] font-mono text-slate-700 transition"
              >
                {st}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition text-xs font-medium"
            >
              Close
            </button>
            <button
              onClick={onApproveBlock}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              Approve Mitigation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
