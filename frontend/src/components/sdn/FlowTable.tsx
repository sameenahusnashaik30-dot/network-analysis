import React from 'react';
import { SDNFlowRule } from '../../types/sdn';
import { formatBytes, formatDuration } from '../../utils/formatters';
import { Sliders } from 'lucide-react';

interface FlowTableProps {
  rules: SDNFlowRule[];
}

export const FlowTable: React.FC<FlowTableProps> = ({ rules }) => {
  return (
    <div className="soc-card space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-purple-600" />
          <h3 className="text-sm font-semibold text-slate-900">
            SDN Flow Table Entries (Flow-Mod)
          </h3>
        </div>
        <span className="text-xs text-slate-500 font-medium">
          {rules.length} Rules Installed
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 uppercase text-[11px] font-semibold font-sans bg-slate-50/50">
              <th className="py-2.5 px-3">Rule ID</th>
              <th className="py-2.5 px-3">Switch DPID</th>
              <th className="py-2.5 px-3">Priority</th>
              <th className="py-2.5 px-3">Match Fields</th>
              <th className="py-2.5 px-3">Actions</th>
              <th className="py-2.5 px-3">Packets</th>
              <th className="py-2.5 px-3">Bytes</th>
              <th className="py-2.5 px-3 text-right">Duration</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rules.map((rule) => (
              <tr key={rule.rule_id} className="hover:bg-slate-50/80 transition">
                <td className="py-2.5 px-3 font-semibold text-slate-900">{rule.rule_id}</td>
                <td className="py-2.5 px-3 text-blue-600 font-semibold">{rule.dpid.slice(-4)}</td>
                <td className="py-2.5 px-3 text-amber-600 font-semibold">{rule.priority}</td>
                <td className="py-2.5 px-3 text-slate-600">
                  {Object.entries(rule.match)
                    .map(([k, v]) => `${k}=${v}`)
                    .join(', ')}
                </td>
                <td className="py-2.5 px-3 font-sans">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${
                      rule.actions.some((a) => a.includes('DROP'))
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {rule.actions.join('; ')}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-slate-900 font-medium">{rule.packet_count.toLocaleString()}</td>
                <td className="py-2.5 px-3 text-slate-600">{formatBytes(rule.byte_count)}</td>
                <td className="py-2.5 px-3 text-right text-slate-500">
                  {formatDuration(rule.duration_sec)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
