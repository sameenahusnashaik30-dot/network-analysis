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
      <div className="bg-white border border-slate-200 rounded-lg p-6 text-center text-slate-500 text-xs shadow-sm">
        No active critical alerts detected in the network.
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 border-l-4 border-l-red-600 rounded-lg p-5 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left Info Column */}
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800 uppercase tracking-wider">
              HIGH PRIORITY
            </span>
            <span className="text-xs font-semibold text-slate-900">
              {incident.is_zero_day_candidate ? 'Potential Unknown Threat' : incident.classification}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              ID: {incident.incident_id}
            </span>
          </div>

          <p className="text-xs text-slate-600">
            Low known-classifier confidence ({Math.round(incident.confidence * 100)}%) with elevated anomaly score.
          </p>

          <div className="flex flex-wrap items-center gap-5 text-xs text-slate-600 pt-1">
            <span>
              <span className="text-slate-400">Source:</span>{' '}
              <strong className="text-slate-900 font-mono">{incident.src_ip}:{incident.src_port}</strong>
            </span>
            <span>
              <span className="text-slate-400">Destination:</span>{' '}
              <strong className="text-slate-900 font-mono">{incident.dst_ip}:{incident.dst_port}</strong>
            </span>
            <span>
              <span className="text-slate-400">Protocol:</span>{' '}
              <strong className="text-slate-800 font-mono">{incident.protocol}</strong>
            </span>
            <span>
              <span className="text-slate-400">Anomaly Score:</span>{' '}
              <strong className="text-red-700 font-mono">{incident.anomaly_score}</strong>
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-shrink-0 pt-2 lg:pt-0">
          <button
            onClick={() => onViewDetails(incident)}
            className="px-3 py-1.5 rounded-md bg-white border border-slate-300 hover:bg-slate-50 text-xs font-medium text-slate-700 transition flex items-center gap-1.5 shadow-sm"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            View Details
          </button>

          <button
            onClick={() => onInvestigate(incident)}
            className="px-3 py-1.5 rounded-md bg-blue-50 border border-blue-200 hover:bg-blue-100 text-xs font-medium text-blue-700 transition flex items-center gap-1.5"
          >
            Investigate
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onRequestBlock(incident)}
            className="px-3.5 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
          >
            <ShieldBan className="w-3.5 h-3.5" />
            Block Flow
          </button>
        </div>
      </div>
    </div>
  );
};
