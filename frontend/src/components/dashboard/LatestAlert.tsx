import React from 'react';
import { ShieldAlert, ArrowRight, ShieldBan, Eye } from 'lucide-react';
import { Incident } from '../../types/incident';

interface LatestAlertProps {
  incident: Incident | null;
  onViewDetails: (incident: Incident) => void;
  onInvestigate: (incident: Incident) => void;
  onRequestBlock: (incident: Incident) => void;
}

export const LatestAlert: React.FC<LatestAlertProps> = ({
  incident,
  onViewDetails,
  onInvestigate,
  onRequestBlock,
}) => {
  if (!incident) {
    return (
      <div className="soc-card flex items-center justify-center py-8 text-soc-dim text-xs font-mono">
        No active critical alerts detected.
      </div>
    );
  }

  return (
    <div className="soc-card border-red-500/30 bg-gradient-to-r from-red-950/20 via-soc-panel to-soc-panel relative overflow-hidden">
      {/* Background indicator bar */}
      <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-red-500" />

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left Info */}
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-red-500/15 text-red-400 border border-red-500/30 flex-shrink-0 animate-pulse">
            <ShieldAlert className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-wider">
                {incident.classification.toUpperCase()} DETECTED
              </span>
              <span className="soc-badge bg-red-500/15 text-red-400 border border-red-500/30">
                {incident.severity}
              </span>
              <span className="text-xs font-mono text-soc-dim">
                ID: {incident.incident_id}
              </span>
            </div>

            <p className="text-sm text-soc-text font-medium">
              Traffic anomaly flagged: Low known-classifier confidence ({Math.round(incident.confidence * 100)}%) with extreme Autoencoder reconstruction error.
            </p>

            <div className="flex items-center gap-4 text-xs font-mono text-soc-muted pt-1">
              <span>Src: <strong className="text-white">{incident.src_ip}:{incident.src_port}</strong></span>
              <span>Dst: <strong className="text-white">{incident.dst_ip}:{incident.dst_port}</strong></span>
              <span>Proto: <strong className="text-soc-cyan">{incident.protocol}</strong></span>
              <span>Anomaly Score: <strong className="text-red-400">{incident.anomaly_score}</strong></span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-shrink-0 pt-2 lg:pt-0">
          <button
            onClick={() => onViewDetails(incident)}
            className="px-3.5 py-2 rounded-lg bg-soc-panelLight border border-soc-border hover:border-soc-borderLight text-xs font-medium text-soc-text hover:text-white transition flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            View Details
          </button>

          <button
            onClick={() => onInvestigate(incident)}
            className="px-3.5 py-2 rounded-lg bg-soc-cyan/15 border border-soc-cyan/40 hover:bg-soc-cyan/25 text-xs font-medium text-soc-cyan transition flex items-center gap-1.5 font-mono"
          >
            Investigate
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Block Flow button opens confirmation modal, NOT direct destructive execution */}
          <button
            onClick={() => onRequestBlock(incident)}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-[0_0_12px_rgba(239,68,68,0.3)]"
          >
            <ShieldBan className="w-3.5 h-3.5" />
            Block Flow
          </button>
        </div>
      </div>
    </div>
  );
};
