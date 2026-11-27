import React from 'react';
import { Incident } from '../../types/incident';
import { ShieldAlert, CheckCircle2, XCircle, Eye } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { resolveDeviceType, resolveSoftwareService } from '../../utils/formatters';

interface ApprovalPanelProps {
  incidents: Incident[];
  onApprove: (incident: Incident) => void;
  onMonitor: (incident: Incident) => void;
  onReject: (incident: Incident) => void;
}

export const ApprovalPanel: React.FC<ApprovalPanelProps> = ({
  incidents,
  onApprove,
  onMonitor,
  onReject,
}) => {
  const { canMitigate } = useAuth();
  const pending = incidents.filter((i) => i.mitigation_status === 'RECOMMENDED' || !i.mitigation_status);

  return (
    <div className="soc-card space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Pending Mitigation Authorizations
          </h3>
          <p className="text-xs text-slate-500 font-sans">
            Human-in-the-Loop Approval Queue (Default: Recommendation Only)
          </p>
        </div>
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          {pending.length} Actionable
        </span>
      </div>

      {pending.length === 0 ? (
        <div className="py-8 text-center text-slate-400 font-sans text-xs">
          No pending mitigations awaiting administrator authorization.
        </div>
      ) : (
        <div className="space-y-3">
          {pending.map((inc) => {
            const srcDevice = resolveDeviceType(inc.src_ip);
            const dstService = resolveSoftwareService(inc.dst_port, inc.protocol);

            return (
              <div
                key={inc.incident_id}
                className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold text-blue-600">
                      {inc.incident_id}
                    </span>
                    <span className="text-xs font-semibold text-slate-900">
                      {inc.classification}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                      Anomaly Score: {inc.anomaly_score}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-slate-600">
                    Host: <strong className="text-slate-900">{inc.src_ip}</strong> ({srcDevice}) → {inc.dst_ip}:{inc.dst_port} ({dstService})
                  </div>
                  <div className="text-xs text-slate-500">
                    Recommended Action: <span className="font-mono text-red-600 font-semibold">{inc.recommended_action || 'BLOCK_FLOW'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => onApprove(inc)}
                    disabled={!canMitigate}
                    title={!canMitigate ? 'Requires ADMIN Role' : 'Approve & deploy flow rule'}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-xs ${
                      canMitigate
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Approve & Block
                  </button>

                  <button
                    onClick={() => onMonitor(inc)}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-xs text-slate-700 font-medium transition flex items-center gap-1.5 shadow-xs"
                  >
                    <Eye className="w-3.5 h-3.5 text-blue-600" />
                    Monitor Only
                  </button>

                  <button
                    onClick={() => onReject(inc)}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-xs text-slate-500 hover:text-red-600 transition flex items-center gap-1.5 shadow-xs"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
