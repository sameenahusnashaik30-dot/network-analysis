import React, { useState, useEffect } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { api } from '../services/api';
import { AttackDistributionItem, KnownAttackModelConfig } from '../types/attack';
import { Incident } from '../types/incident';
import { SeverityBadge } from '../components/alerts/SeverityBadge';
import { formatTimestamp, resolveDeviceType, resolveSoftwareService } from '../utils/formatters';
import { Flame, Cpu, Sliders, CheckCircle2, ShieldBan, RefreshCw, BarChart2, ShieldCheck } from 'lucide-react';
import { MitigationModal } from '../components/mitigation/MitigationModal';

export const KnownAttacks: React.FC = () => {
  const [distribution, setDistribution] = useState<AttackDistributionItem[]>([]);
  const [modelConfig, setModelConfig] = useState<KnownAttackModelConfig | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(true);
  const [selectedModel, setSelectedModel] = useState<'XGBoost' | 'Random Forest'>('Random Forest');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [mitigationModalOpen, setMitigationModalOpen] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getKnownAttacks();
      setDistribution(res.distribution);
      setModelConfig(res.model_config);
      setIncidents(res.incidents);
      setIsDemo(res.is_demo);
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
      title="Known Attack Classification"
      subtitle="Supervised multi-class models (Layer A) detect signature-matching SDN attacks including DDoS, DoS, Port Scan, Brute Force, and Botnet traffic."
      isDemo={isDemo}
      actions={
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 border border-slate-300 p-0.5 rounded-lg text-xs font-medium">
            {(['Random Forest', 'XGBoost'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setSelectedModel(m)}
                className={`px-3 py-1 rounded transition text-xs ${
                  selectedModel === m
                    ? 'bg-white text-blue-700 font-semibold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <button
            onClick={loadData}
            disabled={loading}
            className="p-1.5 rounded-lg bg-white border border-slate-300 text-slate-600 hover:bg-slate-50 transition shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      }
    >
      {/* Model Benchmark Card */}
      <div className="soc-card space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Supervised Model Architecture ({selectedModel})
              </h3>
              <p className="text-xs text-slate-500">
                Trained on SDN OpenFlow Benchmark Dataset (CIC-IDS2017 feature representation)
              </p>
            </div>
          </div>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            OPTIMAL CALIBRATION
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block text-[10px] uppercase font-sans font-semibold">Test Accuracy</span>
            <span className="text-2xl font-bold text-slate-900 mt-1 block">
              {modelConfig ? (modelConfig.accuracy * 100).toFixed(1) : '98.4'}%
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block text-[10px] uppercase font-sans font-semibold">Precision</span>
            <span className="text-2xl font-bold text-blue-600 mt-1 block">
              {modelConfig ? (modelConfig.precision * 100).toFixed(1) : '97.8'}%
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block text-[10px] uppercase font-sans font-semibold">Recall</span>
            <span className="text-2xl font-bold text-purple-600 mt-1 block">
              {modelConfig ? (modelConfig.recall * 100).toFixed(1) : '97.2'}%
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block text-[10px] uppercase font-sans font-semibold">F1-Score</span>
            <span className="text-2xl font-bold text-amber-600 mt-1 block">
              {modelConfig ? (modelConfig.f1_score * 100).toFixed(1) : '97.5'}%
            </span>
          </div>
        </div>
      </div>

      {/* Categories Breakdown */}
      <div className="soc-card space-y-4">
        <h3 className="text-sm font-semibold text-slate-900">
          Configured Attack Classes & Detection Volume
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {distribution.map((item) => (
            <div
              key={item.name}
              className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1 text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="font-semibold text-slate-900 truncate">{item.name}</span>
              </div>
              <div className="text-lg font-bold font-mono text-slate-900">{item.count}</div>
              <div className="text-[11px] text-slate-500">{item.percentage}% of all traffic</div>
            </div>
          ))}
        </div>
      </div>

      {/* Known Attack Incidents Table */}
      <div className="soc-card space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-red-600" />
            <h3 className="text-sm font-semibold text-slate-900">
              Known Attack Incident Log
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {incidents.length} Classified Events
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase text-[11px] font-semibold bg-slate-50/50">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Incident ID</th>
                <th className="py-2.5 px-3">Attack Class</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Source Device & IP</th>
                <th className="py-2.5 px-3">Target Service & Host</th>
                <th className="py-2.5 px-3">Confidence</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Mitigation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {incidents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500 font-sans">
                    No classified attack events recorded.
                  </td>
                </tr>
              ) : (
                incidents.map((inc) => {
                  const srcDevice = resolveDeviceType(inc.src_ip);
                  const dstService = resolveSoftwareService(inc.dst_port, inc.protocol);

                  return (
                    <tr key={inc.incident_id} className="hover:bg-slate-50/80 transition">
                      <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                        {formatTimestamp(inc.detected_at)}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{inc.incident_id}</td>
                      <td className="py-2.5 px-3 font-semibold text-red-600 font-sans">{inc.classification}</td>
                      <td className="py-2.5 px-3 font-sans">
                        <SeverityBadge severity={inc.severity} />
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="text-slate-900 font-medium">{inc.src_ip}:{inc.src_port}</div>
                        <div className="text-[11px] text-slate-500 font-sans">{srcDevice}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="text-slate-900 font-medium">{inc.dst_ip}:{inc.dst_port}</div>
                        <div className="text-[11px] text-slate-500 font-sans">{dstService}</div>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-blue-600">
                        {Math.round(inc.confidence * 100)}%
                      </td>
                      <td className="py-2.5 px-3 font-sans">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          {inc.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-sans">
                        <button
                          onClick={() => {
                            setSelectedIncident(inc);
                            setMitigationModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-700 text-white transition text-xs font-semibold flex items-center gap-1 ml-auto shadow-sm"
                        >
                          <ShieldBan className="w-3.5 h-3.5" />
                          Block Flow
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mitigation Modal */}
      <MitigationModal
        isOpen={mitigationModalOpen}
        incident={selectedIncident}
        onClose={() => setMitigationModalOpen(false)}
        onConfirm={async (inc, action) => {
          await api.approveMitigation({ incident_id: inc.incident_id, action });
          loadData();
        }}
      />
    </PageContainer>
  );
};
