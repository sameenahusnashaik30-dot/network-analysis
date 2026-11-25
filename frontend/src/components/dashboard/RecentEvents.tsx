import React from 'react';
import { Incident } from '../../types/incident';
import { formatTimestamp } from '../../utils/formatters';
import { ChevronRight, ExternalLink } from 'lucide-react';

interface RecentEventsProps {
  incidents: Incident[];
  onSelectIncident: (incident: Incident) => void;
}

export const RecentEvents: React.FC<RecentEventsProps> = ({ incidents, onSelectIncident }) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'INVESTIGATING':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/30';
      case 'MITIGATED':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
      case 'CONFIRMED':
        return 'bg-red-500/10 text-red-400 border border-red-500/30';
      case 'FALSE_POSITIVE':
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/30';
      default:
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/30';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'text-red-400 font-bold';
      case 'HIGH':
        return 'text-orange-400 font-semibold';
      case 'MEDIUM':
        return 'text-amber-400';
      default:
        return 'text-blue-400';
    }
  };

  return (
    <div className="soc-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-white tracking-wide">Recent Security Events</h3>
          <p className="text-xs text-soc-dim font-mono">Live incident detection stream</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-soc-border text-soc-dim font-mono uppercase text-[10px]">
              <th className="py-2.5 px-3">Time</th>
              <th className="py-2.5 px-3">Event / Incident</th>
              <th className="py-2.5 px-3">Severity</th>
              <th className="py-2.5 px-3">Source & Port</th>
              <th className="py-2.5 px-3">Classification</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-soc-border/50">
            {incidents.map((inc) => (
              <tr
                key={inc.incident_id}
                onClick={() => onSelectIncident(inc)}
                className="hover:bg-soc-panelLight/60 cursor-pointer transition group"
              >
                <td className="py-3 px-3 font-mono text-soc-muted whitespace-nowrap">
                  {formatTimestamp(inc.detected_at)}
                </td>
                <td className="py-3 px-3 font-mono font-medium text-white">
                  {inc.incident_id}
                </td>
                <td className="py-3 px-3 font-mono">
                  <span className={getSeverityBadge(inc.severity)}>{inc.severity}</span>
                </td>
                <td className="py-3 px-3 font-mono text-soc-muted">
                  {inc.src_ip}:{inc.src_port}
                </td>
                <td className="py-3 px-3">
                  <span className="font-semibold text-soc-text">{inc.classification}</span>
                  {inc.is_zero_day_candidate && (
                    <span className="ml-1.5 text-[9px] font-mono px-1.5 py-0.5 rounded bg-soc-cyan/15 text-soc-cyan border border-soc-cyan/30">
                      ZERO-DAY
                    </span>
                  )}
                </td>
                <td className="py-3 px-3">
                  <span className={`soc-badge ${getStatusBadge(inc.status)}`}>
                    {inc.status}
                  </span>
                </td>
                <td className="py-3 px-3 text-right">
                  <button className="text-soc-muted group-hover:text-soc-cyan transition flex items-center gap-1 ml-auto text-[11px] font-mono">
                    Investigate
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
