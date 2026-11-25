import React from 'react';
import { SDNControllerEvent } from '../../types/sdn';
import { formatTimestamp } from '../../utils/formatters';
import { Radio, AlertCircle, Info, Zap } from 'lucide-react';

interface ControllerEventsProps {
  events: SDNControllerEvent[];
}

export const ControllerEvents: React.FC<ControllerEventsProps> = ({ events }) => {
  const getEventBadge = (type: string) => {
    switch (type) {
      case 'PACKET_IN':
        return 'bg-amber-500/15 text-amber-400 border border-amber-500/30';
      case 'FLOW_MOD':
        return 'bg-soc-cyan/15 text-soc-cyan border border-soc-cyan/30';
      case 'SWITCH_ENTER':
      case 'SWITCH_LEAVE':
        return 'bg-soc-purple/15 text-soc-purple border border-soc-purple/30';
      default:
        return 'bg-red-500/15 text-red-400 border border-red-500/30';
    }
  };

  return (
    <div className="soc-card space-y-4">
      <div className="flex items-center justify-between border-b border-soc-border pb-3">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-soc-cyan animate-pulse" />
          <h3 className="text-base font-semibold text-white tracking-wide">
            SDN Controller Event Log
          </h3>
        </div>
        <span className="text-xs font-mono text-soc-dim">
          Real-Time OpenFlow Messages
        </span>
      </div>

      <div className="space-y-2.5">
        {events.map((evt) => (
          <div
            key={evt.event_id}
            className="p-3 rounded-xl bg-soc-bg border border-soc-border flex items-start gap-3 hover:border-soc-borderLight transition"
          >
            <div className="p-1.5 rounded-lg bg-soc-panelLight border border-soc-border flex-shrink-0 text-soc-cyan">
              <Zap className="w-4 h-4" />
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className={`soc-badge ${getEventBadge(evt.event_type)}`}>
                    {evt.event_type}
                  </span>
                  <span className="text-xs font-mono text-soc-dim">
                    Switch DPID: <strong className="text-white">{evt.dpid}</strong>
                  </span>
                </div>
                <span className="text-[11px] font-mono text-soc-dim">
                  {formatTimestamp(evt.timestamp)}
                </span>
              </div>
              <p className="text-xs text-soc-text font-mono leading-relaxed">
                {evt.details}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
