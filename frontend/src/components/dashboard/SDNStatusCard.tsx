import React from 'react';
import { Network, Activity, ArrowUpRight, Cpu } from 'lucide-react';
import { SDNControllerStatus } from '../../types/sdn';

interface SDNStatusCardProps {
  status: SDNControllerStatus | null;
  onOpenSDN: () => void;
}

export const SDNStatusCard: React.FC<SDNStatusCardProps> = ({ status, onOpenSDN }) => {
  return (
    <div className="soc-card flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-soc-cyan/20 text-soc-cyan border border-soc-cyan/30">
              <Network className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white tracking-wide">SDN Controller Telemetry</h3>
          </div>
          <span className="soc-badge bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            {status?.is_online ? 'CONNECTED' : 'OFFLINE'}
          </span>
        </div>

        <p className="text-xs text-soc-dim mb-4 font-mono">
          Ryu OpenFlow 1.3 Controller Integration
        </p>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-2.5 rounded-lg bg-soc-bg border border-soc-border">
            <span className="text-soc-dim block text-[10px] uppercase font-mono">OpenFlow State</span>
            <span className="text-sm font-semibold font-mono text-emerald-400">
              {status?.openflow_status || 'ACTIVE'}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-soc-bg border border-soc-border">
            <span className="text-soc-dim block text-[10px] uppercase font-mono">Connected Switches</span>
            <span className="text-sm font-semibold font-mono text-white">
              {status?.connected_switches ?? 0} DPIDs
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-soc-bg border border-soc-border">
            <span className="text-soc-dim block text-[10px] uppercase font-mono">Active Flow Rules</span>
            <span className="text-sm font-semibold font-mono text-white">
              {status?.active_rules ?? 0} rules
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-soc-bg border border-soc-border">
            <span className="text-soc-dim block text-[10px] uppercase font-mono">Controller Latency</span>
            <span className="text-sm font-semibold font-mono text-soc-cyan">
              {status?.latency_ms ?? 0} ms
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-soc-border/60">
        <button
          onClick={onOpenSDN}
          className="w-full py-2 rounded-lg bg-soc-panelLight border border-soc-border hover:border-soc-cyan/40 text-xs font-medium text-soc-text hover:text-soc-cyan transition flex items-center justify-center gap-1.5 font-mono"
        >
          Open Controller Monitor
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
