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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-soc-border pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-soc-cyan/15 text-soc-cyan border border-soc-cyan/30">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white tracking-wide">
              {status?.controller_name || 'Ryu SDN Controller'}
            </h3>
            <p className="text-xs text-soc-dim font-mono">
              Version: {status?.controller_version || 'Ryu 4.34 / OpenFlow 1.3'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="soc-badge bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            {status?.is_online ? 'CONNECTED' : 'DISCONNECTED'}
          </span>

          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-1.5 rounded-lg bg-soc-panelLight border border-soc-border hover:border-soc-cyan/40 text-soc-muted hover:text-soc-cyan transition"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-soc-cyan' : ''}`} />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="p-3 rounded-xl bg-soc-bg border border-soc-border">
          <span className="text-soc-dim block text-[10px] uppercase">OpenFlow Protocol</span>
          <span className="text-base font-bold text-emerald-400 mt-1 block">
            {status?.openflow_status || 'ACTIVE (v1.3)'}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-soc-bg border border-soc-border">
          <span className="text-soc-dim block text-[10px] uppercase">Connected Switches</span>
          <span className="text-base font-bold text-white mt-1 block">
            {status?.connected_switches ?? 0} Switches
          </span>
        </div>

        <div className="p-3 rounded-xl bg-soc-bg border border-soc-border">
          <span className="text-soc-dim block text-[10px] uppercase">Total Active Rules</span>
          <span className="text-base font-bold text-white mt-1 block">
            {status?.active_rules ?? 0} Rules
          </span>
        </div>

        <div className="p-3 rounded-xl bg-soc-bg border border-soc-border">
          <span className="text-soc-dim block text-[10px] uppercase">Controller Latency</span>
          <span className="text-base font-bold text-soc-cyan mt-1 block">
            {status?.latency_ms ?? 0} ms
          </span>
        </div>
      </div>
    </div>
  );
};
