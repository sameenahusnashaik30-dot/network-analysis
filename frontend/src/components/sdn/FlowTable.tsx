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
      <div className="flex items-center justify-between border-b border-soc-border pb-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-soc-purple" />
          <h3 className="text-base font-semibold text-white tracking-wide">
            SDN Flow Table Entries (Flow-Mod)
          </h3>
        </div>
        <span className="text-xs font-mono text-soc-dim">
          {rules.length} Rules Installed
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-soc-border text-soc-dim uppercase text-[10px]">
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
          <tbody className="divide-y divide-soc-border/50">
            {rules.map((rule) => (
              <tr key={rule.rule_id} className="hover:bg-soc-panelLight/40 transition">
                <td className="py-2.5 px-3 font-bold text-white">{rule.rule_id}</td>
                <td className="py-2.5 px-3 text-soc-cyan">{rule.dpid.slice(-4)}</td>
                <td className="py-2.5 px-3 text-amber-400 font-semibold">{rule.priority}</td>
                <td className="py-2.5 px-3 text-soc-muted">
                  {Object.entries(rule.match)
                    .map(([k, v]) => `${k}=${v}`)
                    .join(', ')}
                </td>
                <td className="py-2.5 px-3">
                  <span
                    className={`soc-badge ${
                      rule.actions.some((a) => a.includes('DROP'))
                        ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                        : 'bg-soc-panelLight text-soc-muted border border-soc-border'
                    }`}
                  >
                    {rule.actions.join('; ')}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-white">{rule.packet_count.toLocaleString()}</td>
                <td className="py-2.5 px-3 text-soc-muted">{formatBytes(rule.byte_count)}</td>
                <td className="py-2.5 px-3 text-right text-soc-dim">
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
