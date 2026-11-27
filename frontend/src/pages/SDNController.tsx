import React, { useState, useEffect } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { api } from '../services/api';
import { SDNControllerStatus, SDNSwitch, SDNFlowRule, SDNControllerEvent } from '../types/sdn';
import { ControllerStatus } from '../components/sdn/ControllerStatus';
import { SwitchTable } from '../components/sdn/SwitchTable';
import { FlowTable } from '../components/sdn/FlowTable';
import { ControllerEvents } from '../components/sdn/ControllerEvents';
import { Network, RefreshCw, Server, Sliders, Radio, AlertTriangle } from 'lucide-react';

export const SDNController: React.FC = () => {
  const [status, setStatus] = useState<SDNControllerStatus | null>(null);
  const [switches, setSwitches] = useState<SDNSwitch[]>([]);
  const [rules, setRules] = useState<SDNFlowRule[]>([]);
  const [events, setEvents] = useState<SDNControllerEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(true);
  const [selectedSwitch, setSelectedSwitch] = useState<SDNSwitch | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [st, sw, fl, ev] = await Promise.all([
        api.getSDNStatus(),
        api.getSDNSwitches(),
        api.getSDNFlowRules(),
        api.getSDNEvents(),
      ]);
      setStatus(st.status);
      setSwitches(sw.switches);
      setRules(fl.rules);
      setEvents(ev.events);
      setIsDemo(st.is_demo);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <PageContainer
      title="SDN Controller Telemetry & Management"
      subtitle="Direct interface to OpenFlow 1.3 Controller. Inspect switch datapaths, active flow tables, packet-in buffering, and flow-mod installations."
      isDemo={isDemo}
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-xs font-medium text-slate-700 transition flex items-center gap-1.5 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Controller
          </button>
        </div>
      }
    >
      {/* Primary Status Card */}
      <ControllerStatus status={status} onRefresh={loadData} isRefreshing={loading} />

      {/* Switches Grid & Inspection */}
      <SwitchTable
        switches={switches}
        onSelectSwitch={(sw) => setSelectedSwitch(sw)}
      />

      {/* Switch Inspection Drawer/Modal if clicked */}
      {selectedSwitch && (
        <div className="soc-card border-blue-200 bg-blue-50/30 p-4 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-blue-200 pb-2">
            <span className="font-semibold text-slate-900 flex items-center gap-2 font-sans">
              <Server className="w-4 h-4 text-blue-600" />
              Switch Datapath Inspection: {selectedSwitch.name} ({selectedSwitch.dpid})
            </span>
            <button
              onClick={() => setSelectedSwitch(null)}
              className="text-slate-500 hover:text-slate-800 font-sans text-xs font-medium"
            >
              Close
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-700">
            <div>Socket IP: <strong className="text-slate-900">{selectedSwitch.ip_address}</strong></div>
            <div>Ports: <strong className="text-slate-900">{selectedSwitch.ports_count} active</strong></div>
            <div>Installed Rules: <strong className="text-slate-900">{selectedSwitch.flow_count}</strong></div>
            <div>Packet-In Rate: <strong className="text-amber-600 font-semibold">{selectedSwitch.packet_in_rate} pps</strong></div>
          </div>
        </div>
      )}

      {/* Flow-Mod Rules Table */}
      <FlowTable rules={rules} />

      {/* Real-time OpenFlow Event Timeline */}
      <ControllerEvents events={events} />
    </PageContainer>
  );
};
