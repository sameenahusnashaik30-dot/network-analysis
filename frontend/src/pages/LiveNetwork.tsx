import React, { useState, useEffect } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { api } from '../services/api';
import { NetworkFlow, TrafficStats } from '../types/flow';
import { formatBytes, formatRate, formatDuration, formatTimestamp, formatNumber } from '../utils/formatters';
import { Activity, Radio, Filter, Download, Search, RefreshCw, Server, ArrowUpDown } from 'lucide-react';

export const LiveNetwork: React.FC = () => {
  const [flows, setFlows] = useState<NetworkFlow[]>([]);
  const [stats, setStats] = useState<TrafficStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDemo, setIsDemo] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [protocolFilter, setProtocolFilter] = useState<string>('ALL');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getLiveFlows();
      setFlows(res.flows);
      setStats(res.stats);
      setIsDemo(res.is_demo);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  const filteredFlows = flows.filter((f) => {
    const matchesSearch =
      searchTerm === '' ||
      f.src_ip.includes(searchTerm) ||
      f.dst_ip.includes(searchTerm) ||
      f.flow_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProtocol = protocolFilter === 'ALL' || f.protocol === protocolFilter;
    return matchesSearch && matchesProtocol;
  });

  const exportCSV = () => {
    const headers = ['Flow ID,Switch,Src IP,Src Port,Dst IP,Dst Port,Protocol,Packets,Bytes,Duration,Classification\n'];
    const rows = filteredFlows.map(
      (f) =>
        `${f.flow_id},${f.switch_id},${f.src_ip},${f.src_port},${f.dst_ip},${f.dst_port},${f.protocol},${f.packet_count},${f.byte_count},${f.duration_sec},${f.classification}`
    );
    const blob = new Blob([headers.join('') + rows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sentinel_x_flows_${Date.now()}.csv`;
    a.click();
  };

  return (
    <PageContainer
      title="Live Network Telemetry"
      subtitle="Real-time OpenFlow telemetry streaming from SDN data plane. Monitor flow rates, protocol distributions, and active switch paths."
      isDemo={isDemo}
      actions={
        <>
          <button
            onClick={loadData}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg bg-soc-panelLight border border-soc-border hover:border-soc-cyan/40 text-xs font-mono text-soc-text hover:text-soc-cyan transition flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Telemetry
          </button>
          <button
            onClick={exportCSV}
            className="px-3 py-1.5 rounded-lg bg-soc-cyan/15 border border-soc-cyan/30 hover:bg-soc-cyan/25 text-xs font-mono text-soc-cyan transition flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Export Flow CSV
          </button>
        </>
      }
    >
      {/* Telemetry Metrics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="soc-card p-4">
          <span className="text-[10px] font-mono uppercase text-soc-dim">Active Data Plane Flows</span>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {stats ? formatNumber(stats.active_flows) : '0'}
          </div>
          <span className="text-[10px] text-soc-muted font-mono mt-1 block">
            Across 4 connected switches
          </span>
        </div>

        <div className="soc-card p-4">
          <span className="text-[10px] font-mono uppercase text-soc-dim">Packet Throughput</span>
          <div className="text-2xl font-bold font-mono text-soc-cyan mt-1">
            {stats ? formatNumber(stats.packets_per_sec) : '0'} pps
          </div>
          <span className="text-[10px] text-soc-muted font-mono mt-1 block">
            Total OpenFlow packet-in stream
          </span>
        </div>

        <div className="soc-card p-4">
          <span className="text-[10px] font-mono uppercase text-soc-dim">Bandwidth Volume</span>
          <div className="text-2xl font-bold font-mono text-purple-400 mt-1">
            {stats ? formatRate(stats.bytes_per_sec) : '0 B/s'}
          </div>
          <span className="text-[10px] text-soc-muted font-mono mt-1 block">
            Aggregated wire speed
          </span>
        </div>

        <div className="soc-card p-4">
          <span className="text-[10px] font-mono uppercase text-soc-dim">Protocol Distribution</span>
          <div className="text-xs font-mono text-white mt-2 flex justify-between">
            <span className="text-soc-cyan">TCP {stats?.tcp_percent || 0}%</span>
            <span className="text-amber-400">UDP {stats?.udp_percent || 0}%</span>
            <span className="text-emerald-400">ICMP {stats?.icmp_percent || 0}%</span>
          </div>
          <div className="w-full bg-soc-bg rounded-full h-1.5 overflow-hidden flex mt-1.5">
            <div className="bg-soc-cyan h-full" style={{ width: `${stats?.tcp_percent || 70}%` }} />
            <div className="bg-amber-400 h-full" style={{ width: `${stats?.udp_percent || 20}%` }} />
            <div className="bg-emerald-400 h-full" style={{ width: `${stats?.icmp_percent || 10}%` }} />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="soc-card p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-soc-dim absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter by Flow ID, Source IP, Dst IP..."
            className="w-full bg-soc-bg border border-soc-border rounded-lg pl-9 pr-3 py-1.5 text-xs text-soc-text placeholder-soc-dim focus:outline-none focus:border-soc-cyan font-mono"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs font-mono">
          <span className="text-soc-dim flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Protocol:
          </span>
          {['ALL', 'TCP', 'UDP', 'ICMP'].map((proto) => (
            <button
              key={proto}
              onClick={() => setProtocolFilter(proto)}
              className={`px-2.5 py-1 rounded transition ${
                protocolFilter === proto
                  ? 'bg-soc-cyan text-black font-bold'
                  : 'bg-soc-bg border border-soc-border text-soc-muted hover:text-white'
              }`}
            >
              {proto}
            </button>
          ))}
        </div>
      </div>

      {/* Flow Records Table */}
      <div className="soc-card space-y-4">
        <div className="flex items-center justify-between border-b border-soc-border pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-soc-cyan" />
            <h3 className="text-base font-semibold text-white tracking-wide">
              Live OpenFlow Network Flows
            </h3>
          </div>
          <span className="text-xs font-mono text-soc-dim">
            Showing {filteredFlows.length} Active Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-soc-border text-soc-dim uppercase text-[10px]">
                <th className="py-2.5 px-3">Flow ID</th>
                <th className="py-2.5 px-3">Switch DPID</th>
                <th className="py-2.5 px-3">Source IP : Port</th>
                <th className="py-2.5 px-3">Destination IP : Port</th>
                <th className="py-2.5 px-3">Proto</th>
                <th className="py-2.5 px-3">Packets</th>
                <th className="py-2.5 px-3">Bytes</th>
                <th className="py-2.5 px-3">Duration</th>
                <th className="py-2.5 px-3">Packet Rate</th>
                <th className="py-2.5 px-3">AI Label</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-soc-border/50">
              {filteredFlows.map((flow) => (
                <tr key={flow.flow_id} className="hover:bg-soc-panelLight/40 transition">
                  <td className="py-3 px-3 font-bold text-soc-cyan">{flow.flow_id}</td>
                  <td className="py-3 px-3 text-soc-dim">{flow.switch_id.slice(-4)}</td>
                  <td className="py-3 px-3 text-white">
                    {flow.src_ip}:{flow.src_port}
                  </td>
                  <td className="py-3 px-3 text-white">
                    {flow.dst_ip}:{flow.dst_port}
                  </td>
                  <td className="py-3 px-3 text-soc-muted">{flow.protocol}</td>
                  <td className="py-3 px-3 text-white">{flow.packet_count.toLocaleString()}</td>
                  <td className="py-3 px-3 text-soc-muted">{formatBytes(flow.byte_count)}</td>
                  <td className="py-3 px-3 text-soc-dim">{formatDuration(flow.duration_sec)}</td>
                  <td className="py-3 px-3 text-soc-cyan">{flow.packet_rate.toFixed(1)} pps</td>
                  <td className="py-3 px-3">
                    <span
                      className={`soc-badge ${
                        flow.classification === 'Normal'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : flow.is_unknown
                          ? 'bg-soc-cyan/15 text-soc-cyan border border-soc-cyan/30'
                          : 'bg-red-500/15 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {flow.classification}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className="text-soc-muted">{flow.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  );
};
