import React from 'react';
import { Incident } from '../../types/incident';
import { SeverityBadge } from './SeverityBadge';
import { formatTimestamp } from '../../utils/formatters';
import { Eye, ShieldBan, ShieldCheck } from 'lucide-react';

interface AlertTableProps {
  incidents: Incident[];
  onInvestigate: (incident: Incident) => void;
  onRequestBlock: (incident: Incident) => void;
}

export const AlertTable: React.FC<AlertTableProps> = ({
  incidents,
  onInvestigate,
  onRequestBlock,
}) => {
  return (
    <div className="soc-card space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-soc-border text-soc-dim font-mono uppercase text-[10px]">
              <th className="py-2.5 px-3">Time</th>
              <th className="py-2.5 px-3">Incident ID</th>
              <th className="py-2.5 px-3">Severity</th>
              <th className="py-2.5 px-3">Classification</th>
              <th className="py-2.5 px-3">Flow (Src → Dst)</th>
              <th className="py-2.5 px-3">Anomaly</th>
              <th className="py-2.5 px-3">Confidence</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-soc-border/50 font-mono">
            {incidents.map((inc) => (
              <tr key={inc.incident_id} className="hover:bg-soc-panelLight/40 transition">
                <td className="py-3 px-3 text-soc-dim whitespace-nowrap">
                  {formatTimestamp(inc.detected_at)}
                </td>
                <td className="py-3 px-3 font-bold text-white">
                  {inc.incident_id}
                </td>
                <td className="py-3 px-3">
                  <SeverityBadge severity={inc.severity} />
                </td>
                <td className="py-3 px-3 font-sans">
                  <span className="font-semibold text-white">{inc.classification}</span>
                  {inc.is_zero_day_candidate && (
                    <span className="ml-1.5 text-[9px] font-mono px-1.5 py-0.5 rounded bg-soc-cyan/15 text-soc-cyan border border-soc-cyan/30">
                      CANDIDATE
                    </span>
                  )}
                </td>
                <td className="py-3 px-3 text-soc-muted truncate max-w-xs">
                  {inc.src_ip}:{inc.src_port} → {inc.dst_ip}:{inc.dst_port}
                </td>
                <td className="py-3 px-3">
                  <span className={inc.anomaly_score > 0.7 ? 'text-red-400 font-bold' : 'text-soc-muted'}>
                    {inc.anomaly_score}
                  </span>
                </td>
                <td className="py-3 px-3 text-soc-cyan">
                  {Math.round(inc.confidence * 100)}%
                </td>
                <td className="py-3 px-3">
                  <span className="soc-badge bg-soc-panelLight text-soc-muted border border-soc-border">
                    {inc.status}
                  </span>
                </td>
                <td className="py-3 px-3 text-right">
                  <div className="flex items-center justify-end gap-1.5 font-sans">
                    <button
                      onClick={() => onInvestigate(inc)}
                      className="px-2.5 py-1 rounded bg-soc-panelLight hover:bg-soc-border border border-soc-border text-soc-cyan transition text-xs flex items-center gap-1 font-mono"
                    >
                      <Eye className="w-3 h-3" />
                      Investigate
                    </button>
                    <button
                      onClick={() => onRequestBlock(inc)}
                      className="px-2.5 py-1 rounded bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-500/30 transition text-xs flex items-center gap-1 font-mono"
                    >
                      <ShieldBan className="w-3 h-3" />
                      Block
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
