import React from 'react';
import { Incident } from '../../types/incident';
import { ShieldAlert, CheckCircle2, XCircle, Eye } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

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
      <div className="flex items-center justify-between border-b border-soc-border pb-3">
        <div>
          <h3 className="text-base font-semibold text-white tracking-wide">
            Pending Mitigation Authorizations
          </h3>
          <p className="text-xs text-soc-dim font-mono">
            Human-in-the-Loop Approval Queue (Default: Recommendation Only)
          </p>
        </div>
        <span className="soc-badge bg-soc-cyan/15 text-soc-cyan border border-soc-cyan/30">
          {pending.length} Actionable
        </span>
      </div>

      {pending.length === 0 ? (
        <div className="py-8 text-center text-soc-dim font-mono text-xs">
          No pending mitigations awaiting administrator authorization.
        </div>
      ) : (
        <div className="space-y-3">
          {pending.map((inc) => (
            <div
              key={inc.incident_id}
              className="p-4 rounded-xl bg-soc-bg border border-soc-border flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-red-400">
                    {inc.incident_id}
                  </span>
                  <span className="text-xs font-semibold text-white">
                    {inc.classification}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-soc-panelLight border border-soc-border text-soc-muted">
                    Anomaly Score: {inc.anomaly_score}
                  </span>
                </div>
                <div className="text-xs font-mono text-soc-muted">
                  Target: <strong className="text-soc-cyan">{inc.src_ip}</strong> → {inc.dst_ip}:{inc.dst_port} ({inc.protocol})
                </div>
                <div className="text-xs text-soc-dim">
                  AI Recommendation: <span className="font-mono text-amber-400 font-semibold">{inc.recommended_action || 'BLOCK_FLOW'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => onApprove(inc)}
                  disabled={!canMitigate}
                  title={!canMitigate ? 'Requires ADMIN Role' : 'Approve & deploy flow rule'}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    canMitigate
                      ? 'bg-red-600 hover:bg-red-500 text-white shadow-md'
                      : 'bg-soc-panelLight text-soc-dim border border-soc-border cursor-not-allowed'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Approve & Block
                </button>

                <button
                  onClick={() => onMonitor(inc)}
                  className="px-3 py-1.5 rounded-lg bg-soc-panelLight border border-soc-border hover:border-soc-borderLight text-xs text-soc-text font-medium transition flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Monitor Only
                </button>

                <button
                  onClick={() => onReject(inc)}
                  className="px-3 py-1.5 rounded-lg bg-soc-panelLight border border-soc-border hover:border-soc-borderLight text-xs text-soc-muted hover:text-red-400 transition flex items-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
