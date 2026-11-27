import React from 'react';
import { Incident } from '../../types/incident';
import { formatTimestamp } from '../../utils/formatters';
import { ChevronRight } from 'lucide-react';

interface RecentEventsProps {
  incidents: Incident[];
  onSelectIncident: (incident: Incident) => void;
}

export const RecentEvents: React.FC<RecentEventsProps> = ({ incidents, onSelectIncident }) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'INVESTIGATING':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'MITIGATED':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'CONFIRMED':
        return 'bg-red-50 text-red-700 border border-red-200';
      case 'FALSE_POSITIVE':
        return 'bg-slate-100 text-slate-600 border border-slate-200';
      default:
        return 'bg-blue-50 text-blue-700 border border-blue-200';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'text-red-600 font-bold';
      case 'HIGH':
        return 'text-orange-600 font-semibold';
      case 'MEDIUM':
        return 'text-amber-700 font-medium';
      default:
        return 'text-blue-700 font-medium';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 tracking-tight">Recent Security Events</h3>
          <p className="text-xs text-slate-500">Live incident triage and detection queue</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] font-semibold bg-slate-50/50">
              <th className="py-2.5 px-3">Time</th>
              <th className="py-2.5 px-3">Event / Incident</th>
              <th className="py-2.5 px-3">Severity</th>
              <th className="py-2.5 px-3">Source & Port</th>
              <th className="py-2.5 px-3">Classification</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {incidents.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                  No active incidents recorded in the current session.
                </td>
              </tr>
            ) : (
              incidents.map((incident) => (
                <tr key={incident.incident_id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">
                    {formatTimestamp(incident.detected_at)}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-900">
                    <span className="font-mono text-blue-700 mr-2">{incident.incident_id}</span>
                    <span className="text-slate-500 font-normal">Flow {incident.flow_id}</span>
                  </td>
                  <td className={`py-2.5 px-3 ${getSeverityBadge(incident.severity)}`}>
                    {incident.severity}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-700 text-[11px]">
                    {incident.src_ip}:{incident.src_port}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                        incident.is_zero_day_candidate
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}
                    >
                      {incident.classification}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${getStatusBadge(incident.status)}`}>
                      {incident.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => onSelectIncident(incident)}
                      className="px-2.5 py-1 rounded bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 transition inline-flex items-center gap-1 text-[11px] font-medium shadow-sm"
                    >
                      Triage
                      <ChevronRight className="w-3 h-3 text-slate-400" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
