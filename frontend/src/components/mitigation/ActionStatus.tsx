import React from 'react';
import { Incident } from '../../types/incident';
import { formatTimestamp, formatFullDate } from '../../utils/formatters';
import { ShieldCheck, History } from 'lucide-react';

interface ActionStatusProps {
  incidents: Incident[];
}

export const ActionStatus: React.FC<ActionStatusProps> = ({ incidents }) => {
  const mitigated = incidents.filter(
    (i) => i.mitigation_status === 'EXECUTED' || i.status === 'MITIGATED'
  );

  return (
    <div className="soc-card space-y-4">
      <div className="flex items-center justify-between border-b border-soc-border pb-3">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-soc-cyan" />
          <h3 className="text-base font-semibold text-white tracking-wide">
            Enforced Mitigation Audit Trail
          </h3>
        </div>
        <span className="soc-badge bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          {mitigated.length} Enforced Rules
        </span>
      </div>

      {mitigated.length === 0 ? (
        <div className="py-6 text-center text-soc-dim font-mono text-xs">
          No mitigations currently active in controller flow tables.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-soc-border text-soc-dim font-mono uppercase text-[10px]">
                <th className="py-2 px-3">Timestamp</th>
                <th className="py-2 px-3">Incident</th>
                <th className="py-2 px-3">Flow Match</th>
                <th className="py-2 px-3">Action Enforced</th>
                <th className="py-2 px-3">Approved By</th>
                <th className="py-2 px-3">SDN OpenFlow Response</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-soc-border/50">
              {mitigated.map((inc) => (
                <tr key={inc.incident_id} className="hover:bg-soc-panelLight/40 font-mono">
                  <td className="py-2.5 px-3 text-soc-dim whitespace-nowrap">
                    {formatTimestamp(inc.mitigation_audit?.approved_at || inc.detected_at)}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-white">
                    {inc.incident_id}
                  </td>
                  <td className="py-2.5 px-3 text-soc-cyan">
                    {inc.src_ip} → {inc.dst_ip}:{inc.dst_port}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="soc-badge bg-red-500/15 text-red-400 border border-red-500/30">
                      {inc.mitigation_audit?.executed_action || 'BLOCK_FLOW'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-soc-muted">
                    {inc.mitigation_audit?.approved_by || 'admin'}
                  </td>
                  <td className="py-2.5 px-3 text-soc-dim max-w-xs truncate">
                    {inc.mitigation_audit?.controller_response || 'OFP_FLOW_MOD DROP rule installed with priority 65535'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
