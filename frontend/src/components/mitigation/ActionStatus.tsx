import React from 'react';
import { Incident } from '../../types/incident';
import { formatTimestamp, formatFullDate, resolveDeviceType, resolveSoftwareService } from '../../utils/formatters';
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
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-semibold text-slate-900">
            Enforced Mitigation Audit Trail
          </h3>
        </div>
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          {mitigated.length} Enforced Rules
        </span>
      </div>

      {mitigated.length === 0 ? (
        <div className="py-6 text-center text-slate-400 font-sans text-xs">
          No mitigations currently active in controller flow tables.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase text-[11px] font-semibold bg-slate-50/50">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Incident</th>
                <th className="py-2.5 px-3">Flow Match & Device</th>
                <th className="py-2.5 px-3">Action Enforced</th>
                <th className="py-2.5 px-3">Approved By</th>
                <th className="py-2.5 px-3">SDN OpenFlow Response</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {mitigated.map((inc) => {
                const srcDevice = resolveDeviceType(inc.src_ip);
                const dstService = resolveSoftwareService(inc.dst_port, inc.protocol);

                return (
                  <tr key={inc.incident_id} className="hover:bg-slate-50/80 transition">
                    <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                      {formatTimestamp(inc.mitigation_audit?.approved_at || inc.detected_at)}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {inc.incident_id}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="text-slate-900 font-medium">{inc.src_ip} → {inc.dst_ip}:{inc.dst_port}</div>
                      <div className="text-[11px] text-slate-500 font-sans">{srcDevice} → {dstService}</div>
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200">
                        {inc.mitigation_audit?.executed_action || 'BLOCK_FLOW'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 font-sans">
                      {inc.mitigation_audit?.approved_by || 'admin'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 max-w-xs truncate font-sans text-xs">
                      {inc.mitigation_audit?.controller_response || 'OFP_FLOW_MOD DROP rule installed with priority 65535'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
