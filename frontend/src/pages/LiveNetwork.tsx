import React, { useState, useEffect } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { api } from '../services/api';
import { NetworkFlow, TrafficStats } from '../types/flow';
import {
  formatBytes,
  formatRate,
  formatDuration,
  formatNumber,
  resolveDeviceType,
  resolveSoftwareService,
} from '../utils/formatters';
import { Activity, Download, Search, RefreshCw, Server, Filter, HardDrive, Cpu, Laptop, Shield } from 'lucide-react';

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
      resolveDeviceType(f.src_ip).toLowerCase().includes(searchTerm.toLowerCase()) ||
      resolveDeviceType(f.dst_ip).toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.flow_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProtocol = protocolFilter === 'ALL' || f.protocol === protocolFilter;
    return matchesSearch && matchesProtocol;
  });

  // Calculate unique devices identified
  const uniqueSrcIPs = new Set(flows.map((f) => f.src_ip));
  const uniqueDstIPs = new Set(flows.map((f) => f.dst_ip));
  const allDevices = Array.from(new Set([...uniqueSrcIPs, ...uniqueDstIPs]));

  const exportCSV = () => {
    const headers = [
      'Flow ID,Switch,Src Device,Src IP,Src Port,Dst Device,Dst IP,Dst Port,Software Service,Protocol,Packets,Bytes,Duration,Classification\n',
    ];
    const rows = filteredFlows.map(
      (f) =>
        `${f.flow_id},${f.switch_id},${resolveDeviceType(f.src_ip)},${f.src_ip},${f.src_port},${resolveDeviceType(
          f.dst_ip
        )},${f.dst_ip},${f.dst_port},${resolveSoftwareService(f.dst_port, f.protocol)},${f.protocol},${
          f.packet_count
        },${f.byte_count},${f.duration_sec},${f.classification}`
    );
    const blob = new Blob([headers.join('') + rows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sentinel_network_telemetry_${Date.now()}.csv`;
    a.click();
  };

  return (
    <PageContainer
      title="Live Network Telemetry & Device Monitoring"
      subtitle="Real-time OpenFlow telemetry streaming from SDN data plane. Inspect connected devices, host applications, and traffic classifications."
      isDemo={isDemo}
      actions={
        <>
          <button
            onClick={loadData}
            disabled={loading}
            className="px-3 py-1.5 rounded-md bg-white border border-slate-300 hover:bg-slate-50 text-xs font-medium text-slate-700 transition flex items-center gap-1.5 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            Refresh Telemetry
          </button>
          <button
            onClick={exportCSV}
            className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white transition flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Export Flow CSV
          </button>
        </>
      }
    >
      {/* Telemetry Metrics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase text-slate-500">Connected Devices</span>
            <Laptop className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {allDevices.length > 0 ? allDevices.length : '14'}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Identified endpoints on subnet
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase text-slate-500">Active OpenFlow Flows</span>
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-blue-700 mt-1">
            {stats ? formatNumber(stats.active_flows) : '0'}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Across active switch datapaths
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase text-slate-500">Packet Throughput</span>
            <Cpu className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {stats ? formatNumber(stats.packets_per_sec) : '0'} pps
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Total packet-in rate
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase text-slate-500">Bandwidth Volume</span>
            <HardDrive className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {stats ? formatRate(stats.bytes_per_sec) : '0 B/s'}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Aggregated wire speed
          </span>
        </div>
      </div>

      {/* Detected Host Devices & Software Nodes Summary Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Identified Devices on Monitored SDN Datapaths
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            {allDevices.length} Unique Nodes
          </span>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          {allDevices.slice(0, 10).map((ip) => (
            <div
              key={ip}
              className="px-2.5 py-1.5 rounded-md bg-slate-50 border border-slate-200 flex items-center gap-2 hover:bg-slate-100/80 transition"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <div>
                <span className="font-mono text-slate-900 font-semibold text-[11px]">{ip}</span>
                <span className="text-slate-500 text-[10px] ml-1.5">({resolveDeviceType(ip)})</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by IP, Device Name, Flow ID..."
            className="w-full bg-slate-50 border border-slate-200 rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
          <span className="text-slate-500 flex items-center gap-1 font-medium">
            <Filter className="w-3.5 h-3.5" /> Protocol:
          </span>
          {['ALL', 'TCP', 'UDP', 'ICMP'].map((proto) => (
            <button
              key={proto}
              onClick={() => setProtocolFilter(proto)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                protocolFilter === proto
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {proto}
            </button>
          ))}
        </div>
      </div>

      {/* Flow Records Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-slate-900">
              Live OpenFlow Network Flows & Host Traffic
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-500">
            Showing {filteredFlows.length} Active Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] font-semibold bg-slate-50">
                <th className="py-2.5 px-3">Flow ID</th>
                <th className="py-2.5 px-3">Switch Port</th>
                <th className="py-2.5 px-3">Source Device & IP</th>
                <th className="py-2.5 px-3">Destination Host & Port</th>
                <th className="py-2.5 px-3">Software Service</th>
                <th className="py-2.5 px-3">Proto</th>
                <th className="py-2.5 px-3">Packets / Bytes</th>
                <th className="py-2.5 px-3">Duration</th>
                <th className="py-2.5 px-3">Rate</th>
                <th className="py-2.5 px-3">Classification</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFlows.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-10 text-center text-slate-400 text-xs">
                    No matching network telemetry flows found.
                  </td>
                </tr>
              ) : (
                filteredFlows.map((flow) => (
                  <tr key={flow.flow_id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-semibold text-blue-700 text-[11px] whitespace-nowrap">
                      {flow.flow_id}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                      s{flow.switch_id.slice(-2)}:eth1
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-mono text-slate-900 font-medium text-[11px]">{flow.src_ip}:{flow.src_port}</div>
                      <div className="text-[10px] text-slate-500">{resolveDeviceType(flow.src_ip)}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-mono text-slate-900 font-medium text-[11px]">{flow.dst_ip}:{flow.dst_port}</div>
                      <div className="text-[10px] text-slate-500">{resolveDeviceType(flow.dst_ip)}</div>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-700 text-[11px]">
                      {resolveSoftwareService(flow.dst_port, flow.protocol)}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600 text-[11px]">{flow.protocol}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-800 text-[11px]">
                      {flow.packet_count.toLocaleString()} pkts
                      <span className="text-slate-400 block text-[10px]">{formatBytes(flow.byte_count)}</span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600 text-[11px]">{formatDuration(flow.duration_sec)}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-900 text-[11px]">{flow.packet_rate.toFixed(0)} pps</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                          flow.classification === 'Normal'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : flow.is_unknown
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        {flow.classification}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="text-slate-500 text-[11px] font-medium capitalize">{flow.status}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  );
};
