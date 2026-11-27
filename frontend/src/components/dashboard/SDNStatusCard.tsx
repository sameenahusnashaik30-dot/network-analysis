import React from 'react';
import { Network, ExternalLink } from 'lucide-react';
import { SDNControllerStatus } from '../../types/sdn';

interface SDNStatusCardProps {
  status: SDNControllerStatus | null;
  onOpenSDN: () => void;
}

export const SDNStatusCard: React.FC<SDNStatusCardProps> = ({ status, onOpenSDN }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-blue-50 text-blue-600 border border-blue-100">
              <Network className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-tight">SDN Controller Telemetry</h3>
          </div>
          <span
            className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
              status?.is_online
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            {status?.is_online ? 'CONNECTED' : 'DISCONNECTED'}
          </span>
        </div>

        <p className="text-xs text-slate-500 mb-4">
          Ryu OpenFlow 1.3 Controller Integration
        </p>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-2.5 rounded-md bg-slate-50 border border-slate-100">
            <span className="text-slate-500 block text-[10px] uppercase font-medium">OpenFlow State</span>
            <span className="text-xs font-semibold font-mono text-emerald-700 mt-0.5 block">
              {status?.openflow_status || 'ACTIVE'}
            </span>
          </div>

          <div className="p-2.5 rounded-md bg-slate-50 border border-slate-100">
            <span className="text-slate-500 block text-[10px] uppercase font-medium">Connected Switches</span>
            <span className="text-xs font-semibold font-mono text-slate-900 mt-0.5 block">
              {status?.connected_switches ?? 0} DPIDs
            </span>
          </div>

          <div className="p-2.5 rounded-md bg-slate-50 border border-slate-100">
            <span className="text-slate-500 block text-[10px] uppercase font-medium">Active Flow Rules</span>
            <span className="text-xs font-semibold font-mono text-slate-900 mt-0.5 block">
              {status?.active_rules ?? 0} rules
            </span>
          </div>

          <div className="p-2.5 rounded-md bg-slate-50 border border-slate-100">
            <span className="text-slate-500 block text-[10px] uppercase font-medium">Controller Latency</span>
            <span className="text-xs font-semibold font-mono text-blue-700 mt-0.5 block">
              {status?.latency_ms ?? 0} ms
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-500">
          Datapath flow enforcement
        </span>
        <button
          onClick={onOpenSDN}
          className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
        >
          View Topology
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
