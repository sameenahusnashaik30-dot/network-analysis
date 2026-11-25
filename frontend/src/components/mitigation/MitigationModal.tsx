import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck, X, ShieldBan, Lock } from 'lucide-react';
import { Incident } from '../../types/incident';
import { useAuth } from '../../hooks/useAuth';

interface MitigationModalProps {
  isOpen: boolean;
  incident: Incident | null;
  onClose: () => void;
  onConfirm: (incident: Incident, action: string) => Promise<void>;
}

export const MitigationModal: React.FC<MitigationModalProps> = ({
  isOpen,
  incident,
  onClose,
  onConfirm,
}) => {
  const { user, canMitigate } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string>('BLOCK_FLOW');
  const [authError, setAuthError] = useState<string | null>(null);

  if (!isOpen || !incident) return null;

  const handleConfirm = async () => {
    if (!canMitigate) {
      setAuthError(`RBAC VIOLATION: Current role '${user.role}' is not authorized to execute network mitigations. Only ADMIN can authorize mitigation.`);
      return;
    }

    try {
      setIsSubmitting(true);
      setAuthError(null);
      await onConfirm(incident, selectedAction);
      onClose();
    } catch (err: any) {
      setAuthError(err.message || 'Mitigation execution failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-soc-panel border border-soc-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border-red-500/30">
        {/* Header */}
        <div className="px-6 py-4 bg-red-950/20 border-b border-soc-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30">
              <ShieldBan className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                Confirm Network Mitigation Action
              </h3>
              <p className="text-xs text-soc-dim font-mono">
                SDN OpenFlow Flow-Mod Authorization
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-soc-muted hover:text-white transition p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
            <p className="leading-relaxed">
              Are you sure you want to enforce mitigation on this flow? This will instruct the SDN controller to alter OpenFlow switch flow tables and suppress matching packets.
            </p>
          </div>

          {/* Flow Parameters */}
          <div className="bg-soc-bg rounded-xl border border-soc-border p-4 space-y-2.5 font-mono">
            <div className="flex justify-between border-b border-soc-border/50 pb-2">
              <span className="text-soc-dim">Incident ID</span>
              <span className="text-white font-bold">{incident.incident_id}</span>
            </div>
            <div className="flex justify-between border-b border-soc-border/50 pb-2">
              <span className="text-soc-dim">Source Flow</span>
              <span className="text-soc-cyan">{incident.src_ip}:{incident.src_port}</span>
            </div>
            <div className="flex justify-between border-b border-soc-border/50 pb-2">
              <span className="text-soc-dim">Destination</span>
              <span className="text-white">{incident.dst_ip}:{incident.dst_port}</span>
            </div>
            <div className="flex justify-between border-b border-soc-border/50 pb-2">
              <span className="text-soc-dim">Protocol</span>
              <span className="text-white">{incident.protocol}</span>
            </div>
            <div className="flex justify-between border-b border-soc-border/50 pb-2">
              <span className="text-soc-dim">AI Confidence</span>
              <span className="text-soc-orange">{Math.round(incident.confidence * 100)}% ({incident.classification})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-soc-dim">Anomaly Score</span>
              <span className="text-red-400 font-bold">{incident.anomaly_score}</span>
            </div>
          </div>

          {/* Action Choice */}
          <div>
            <label className="block text-soc-dim font-mono text-[11px] mb-2 uppercase">
              Select Enforcement Action:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['BLOCK_FLOW', 'QUARANTINE_FLOW', 'RATE_LIMIT'].map((action) => (
                <button
                  key={action}
                  type="button"
                  onClick={() => setSelectedAction(action)}
                  className={`py-2 px-3 rounded-lg border text-xs font-mono font-medium transition ${
                    selectedAction === action
                      ? 'border-red-500 bg-red-500/20 text-white font-bold shadow'
                      : 'border-soc-border bg-soc-panelLight text-soc-muted hover:border-soc-borderLight'
                  }`}
                >
                  {action.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* RBAC notice */}
          <div className="flex items-center justify-between text-[11px] text-soc-dim font-mono pt-1">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-soc-cyan" />
              Executing User: <strong className="text-white">{user.username} ({user.role})</strong>
            </span>
            <span className={canMitigate ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
              {canMitigate ? 'AUTHORIZED' : 'RESTRICTED'}
            </span>
          </div>

          {authError && (
            <div className="p-3 rounded-lg bg-red-500/15 border border-red-500/40 text-red-400 text-xs font-mono">
              {authError}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-soc-panelLight/40 border-t border-soc-border flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg bg-soc-panel border border-soc-border text-soc-muted hover:text-white transition text-xs font-medium"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirm}
            disabled={isSubmitting || !canMitigate}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 shadow-lg ${
              canMitigate
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-950/40'
                : 'bg-soc-dim/40 text-soc-muted cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              'Transmitting to SDN Controller...'
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                Confirm {selectedAction.replace('_', ' ')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
