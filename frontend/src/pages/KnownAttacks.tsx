import React, { useState, useEffect } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { api } from '../services/api';
import { AttackDistributionItem, KnownAttackModelConfig } from '../types/attack';
import { Incident } from '../types/incident';
import { SeverityBadge } from '../components/alerts/SeverityBadge';
import { formatTimestamp } from '../utils/formatters';
import { Flame, Cpu, Sliders, CheckCircle2, ShieldBan, RefreshCw, BarChart2 } from 'lucide-react';
import { MitigationModal } from '../components/mitigation/MitigationModal';

export const KnownAttacks: React.FC = () => {
  const [distribution, setDistribution] = useState<AttackDistributionItem[]>([]);
  const [modelConfig, setModelConfig] = useState<KnownAttackModelConfig | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(true);
  const [selectedModel, setSelectedModel] = useState<'XGBoost' | 'Random Forest'>('XGBoost');
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
          <div className="flex bg-soc-bg border border-soc-border p-1 rounded-lg text-xs font-mono">
            {(['XGBoost', 'Random Forest'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setSelectedModel(m)}
                className={`px-3 py-1 rounded transition ${
                  selectedModel === m
                    ? 'bg-soc-cyan text-black font-bold'
                    : 'text-soc-muted hover:text-white'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 rounded-lg bg-soc-panelLight border border-soc-border text-soc-muted hover:text-soc-cyan"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      }
    >
      {/* Model Benchmark Card */}
      <div className="soc-card space-y-4">
        <div className="flex items-center justify-between border-b border-soc-border pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-soc-cyan" />
            <div>
              <h3 className="text-base font-semibold text-white tracking-wide">
                Supervised Model Architecture ({selectedModel})
              </h3>
              <p className="text-xs text-soc-dim font-mono">
                Trained on SDN OpenFlow Benchmark Dataset (CIC-IDS2017 feature representation)
              </p>
            </div>
          </div>
          <span className="soc-badge bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            OPTIMAL CALIBRATION
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
          <div className="p-3.5 rounded-xl bg-soc-bg border border-soc-border">
            <span className="text-soc-dim block text-[10px] uppercase">Test Accuracy</span>
            <span className="text-2xl font-bold text-emerald-400 mt-1 block">
              {modelConfig ? (modelConfig.accuracy * 100).toFixed(1) : '98.4'}%
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-soc-bg border border-soc-border">
            <span className="text-soc-dim block text-[10px] uppercase">Precision</span>
            <span className="text-2xl font-bold text-soc-cyan mt-1 block">
              {modelConfig ? (modelConfig.precision * 100).toFixed(1) : '97.8'}%
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-soc-bg border border-soc-border">
            <span className="text-soc-dim block text-[10px] uppercase">Recall</span>
            <span className="text-2xl font-bold text-soc-purple mt-1 block">
              {modelConfig ? (modelConfig.recall * 100).toFixed(1) : '97.2'}%
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-soc-bg border border-soc-border">
            <span className="text-soc-dim block text-[10px] uppercase">F1-Score</span>
            <span className="text-2xl font-bold text-amber-400 mt-1 block">
              {modelConfig ? (modelConfig.f1_score * 100).toFixed(1) : '97.5'}%
            </span>
          </div>
        </div>
      </div>

      {/* Categories Breakdown */}
      <div className="soc-card space-y-4">
        <h3 className="text-base font-semibold text-white tracking-wide">
          Configured Attack Classes & Detection Volume
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {distribution.map((item) => (
            <div
              key={item.name}
              className="p-3 rounded-xl bg-soc-bg border border-soc-border space-y-1 text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="font-semibold text-white truncate">{item.name}</span>
              </div>
              <div className="text-lg font-bold font-mono text-soc-text">{item.count}</div>
              <div className="text-[10px] text-soc-dim font-mono">{item.percentage}% of all traffic</div>
            </div>
          ))}
        </div>
      </div>

      {/* Known Attack Incidents Table */}
      <div className="soc-card space-y-4">
        <div className="flex items-center justify-between border-b border-soc-border pb-3">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-red-400" />
            <h3 className="text-base font-semibold text-white tracking-wide">
              Known Attack Incident Log
            </h3>
          </div>
          <span className="text-xs font-mono text-soc-dim">
            {incidents.length} Classified Events
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-soc-border text-soc-dim uppercase text-[10px]">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Incident ID</th>
                <th className="py-2.5 px-3">Attack Class</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Source → Destination</th>
                <th className="py-2.5 px-3">Confidence</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Mitigation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-soc-border/50">
              {incidents.map((inc) => (
                <tr key={inc.incident_id} className="hover:bg-soc-panelLight/40 transition">
                  <td className="py-3 px-3 text-soc-dim whitespace-nowrap">
                    {formatTimestamp(inc.detected_at)}
                  </td>
                  <td className="py-3 px-3 font-bold text-white">{inc.incident_id}</td>
                  <td className="py-3 px-3 font-semibold text-red-400">{inc.classification}</td>
                  <td className="py-3 px-3">
                    <SeverityBadge severity={inc.severity} />
                  </td>
                  <td className="py-3 px-3 text-soc-muted">
                    {inc.src_ip}:{inc.src_port} → {inc.dst_ip}:{inc.dst_port}
                  </td>
                  <td className="py-3 px-3 text-soc-cyan font-bold">
                    {Math.round(inc.confidence * 100)}%
                  </td>
                  <td className="py-3 px-3">
                    <span className="soc-badge bg-soc-panelLight text-soc-muted border border-soc-border">
                      {inc.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => {
                        setSelectedIncident(inc);
                        setMitigationModalOpen(true);
                      }}
                      className="px-2.5 py-1 rounded bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600/40 transition text-xs font-sans font-medium flex items-center gap-1 ml-auto"
                    >
                      <ShieldBan className="w-3.5 h-3.5" />
                      Block Flow
                    </button>
                  </td>
                </tr>
              ))}
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
