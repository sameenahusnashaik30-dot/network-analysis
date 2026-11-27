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
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-semibold text-slate-900">
            Connected OpenFlow Switches
          </h3>
        </div>
        <span className="text-xs text-slate-500 font-medium">
          {switches.length} Active Data Paths (DPID)
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 uppercase text-[11px] font-semibold bg-slate-50/50">
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
          <tbody className="divide-y divide-slate-100 font-mono">
            {switches.map((sw) => (
              <tr
                key={sw.dpid}
                onClick={() => onSelectSwitch && onSelectSwitch(sw)}
                className="hover:bg-slate-50/80 transition cursor-pointer"
              >
                <td className="py-2.5 px-3 font-semibold text-blue-600">{sw.dpid}</td>
                <td className="py-2.5 px-3 text-slate-900 font-sans font-medium">{sw.name}</td>
                <td className="py-2.5 px-3 text-slate-500">{sw.ip_address}</td>
                <td className="py-2.5 px-3 text-slate-600">{sw.openflow_version}</td>
                <td className="py-2.5 px-3 text-slate-800">{sw.ports_count} ports</td>
                <td className="py-2.5 px-3 text-slate-900 font-medium">{sw.flow_count}</td>
                <td className="py-2.5 px-3 text-amber-600 font-semibold">{sw.packet_in_rate} pps</td>
                <td className="py-2.5 px-3 text-right font-sans">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
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
