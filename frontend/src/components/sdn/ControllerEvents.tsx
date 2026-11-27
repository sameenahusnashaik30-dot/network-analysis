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
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'FLOW_MOD':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'SWITCH_ENTER':
      case 'SWITCH_LEAVE':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-red-50 text-red-700 border-red-200';
    }
  };

  return (
    <div className="soc-card space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-semibold text-slate-900">
            SDN Controller Event Log
          </h3>
        </div>
        <span className="text-xs text-slate-500 font-medium">
          Real-Time OpenFlow Telemetry Messages
        </span>
      </div>

      <div className="space-y-2.5">
        {events.map((evt) => (
          <div
            key={evt.event_id}
            className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-3 hover:bg-slate-100/60 transition"
          >
            <div className="p-1.5 rounded-lg bg-white border border-slate-200 flex-shrink-0 text-blue-600 shadow-xs">
              <Zap className="w-4 h-4" />
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${getEventBadge(evt.event_type)}`}>
                    {evt.event_type}
                  </span>
                  <span className="text-xs font-mono text-slate-500">
                    Switch DPID: <strong className="text-slate-900">{evt.dpid}</strong>
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  {formatTimestamp(evt.timestamp)}
                </span>
              </div>
              <p className="text-xs text-slate-700 font-sans leading-relaxed">
                {evt.details}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
