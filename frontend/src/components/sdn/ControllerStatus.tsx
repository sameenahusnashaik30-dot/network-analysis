import React from 'react';
import { SDNControllerStatus } from '../../types/sdn';
import { Network, Cpu, Clock, RefreshCw } from 'lucide-react';

interface ControllerStatusProps {
  status: SDNControllerStatus | null;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const ControllerStatus: React.FC<ControllerStatusProps> = ({
  status,
  onRefresh,
  isRefreshing,
}) => {
  return (
    <div className="soc-card space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              {status?.controller_name || 'Ryu SDN Controller'}
            </h3>
            <p className="text-xs text-slate-500 font-sans">
              Version: {status?.controller_version || 'Ryu 4.34 / OpenFlow 1.3'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-semibold border ${
            status?.is_online ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-700 border-slate-200'
          }`}>
            {status?.is_online ? '● CONNECTED' : '○ SIMULATED / DISCONNECTED'}
          </span>

          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
          <span className="text-slate-500 block text-[10px] uppercase font-sans font-semibold">OpenFlow Protocol</span>
          <span className="text-base font-bold text-slate-900 mt-1 block">
            {status?.openflow_status || 'ACTIVE (v1.3)'}
          </span>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
          <span className="text-slate-500 block text-[10px] uppercase font-sans font-semibold">Connected Switches</span>
          <span className="text-base font-bold text-slate-900 mt-1 block">
            {status?.connected_switches ?? 0} Switches
          </span>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
          <span className="text-slate-500 block text-[10px] uppercase font-sans font-semibold">Total Active Rules</span>
          <span className="text-base font-bold text-slate-900 mt-1 block">
            {status?.active_rules ?? 0} Rules
          </span>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
          <span className="text-slate-500 block text-[10px] uppercase font-sans font-semibold">Controller Latency</span>
          <span className="text-base font-bold text-blue-600 mt-1 block">
            {status?.latency_ms ?? 0} ms
          </span>
        </div>
      </div>
    </div>
  );
};
