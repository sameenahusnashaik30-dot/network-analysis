import React from 'react';
import { SDNSwitch } from '../../types/sdn';
import { Server, Activity } from 'lucide-react';

interface SwitchTableProps {
  switches: SDNSwitch[];
  onSelectSwitch?: (sw: SDNSwitch) => void;
}

export const SwitchTable: React.FC<SwitchTableProps> = ({ switches, onSelectSwitch }) => {
  return (
    <div className="soc-card space-y-4">
      <div className="flex items-center justify-between border-b border-soc-border pb-3">
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-soc-cyan" />
          <h3 className="text-base font-semibold text-white tracking-wide">
            Connected OpenFlow Switches
          </h3>
        </div>
        <span className="text-xs font-mono text-soc-dim">
          {switches.length} Active Data Paths (DPID)
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-soc-border text-soc-dim font-mono uppercase text-[10px]">
              <th className="py-2.5 px-3">DPID</th>
              <th className="py-2.5 px-3">Name / Role</th>
              <th className="py-2.5 px-3">Socket Address</th>
              <th className="py-2.5 px-3">Protocol</th>
              <th className="py-2.5 px-3">Active Ports</th>
              <th className="py-2.5 px-3">Flow Rules</th>
              <th className="py-2.5 px-3">Packet-In Rate</th>
              <th className="py-2.5 px-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-soc-border/50 font-mono">
            {switches.map((sw) => (
              <tr
                key={sw.dpid}
                onClick={() => onSelectSwitch && onSelectSwitch(sw)}
                className="hover:bg-soc-panelLight/40 transition cursor-pointer"
              >
                <td className="py-3 px-3 font-bold text-soc-cyan">{sw.dpid}</td>
                <td className="py-3 px-3 text-white font-sans font-medium">{sw.name}</td>
                <td className="py-3 px-3 text-soc-dim">{sw.ip_address}</td>
                <td className="py-3 px-3 text-soc-muted">{sw.openflow_version}</td>
                <td className="py-3 px-3 text-white">{sw.ports_count} ports</td>
                <td className="py-3 px-3 text-white">{sw.flow_count}</td>
                <td className="py-3 px-3 text-amber-400">{sw.packet_in_rate} pps</td>
                <td className="py-3 px-3 text-right">
                  <span className="soc-badge bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    {sw.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
