import React, { useState, useEffect } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { api } from '../services/api';
import { ShapExplanation, LimeExplanation as LimeType, ExplanationReliabilityResult } from '../types/xai';
import { ShapChart } from '../components/xai/ShapChart';
import { LimeExplanation } from '../components/xai/LimeExplanation';
import { ExplanationReliability } from '../components/xai/ExplanationReliability';
import { BrainCircuit, Sliders, RefreshCw, Download, GitCompare, ShieldAlert, AlertTriangle } from 'lucide-react';

export const XAI: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'shap' | 'lime' | 'compare' | 'reliability'>('shap');
  const [shap, setShap] = useState<ShapExplanation | null>(null);
  const [lime, setLime] = useState<LimeType | null>(null);
  const [reliability, setReliability] = useState<ExplanationReliabilityResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(true);
  const [isTestingReliability, setIsTestingReliability] = useState(false);

  const incidentId = 'INC-00142';

  const loadData = async () => {
    try {
      setLoading(true);
      const [shapRes, limeRes, relRes] = await Promise.all([
        api.getShapExplanation(incidentId),
        api.getLimeExplanation(incidentId),
        api.getExplanationReliability(incidentId),
      ]);
      setShap(shapRes.explanation);
      setLime(limeRes.explanation);
      setReliability(relRes.result);
      setIsDemo(shapRes.is_demo);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRunReliabilityTest = async () => {
    try {
      setIsTestingReliability(true);
      const res = await api.getExplanationReliability(incidentId);
      setReliability(res.result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsTestingReliability(false);
    }
  };

  const handleExportExplanation = () => {
    const report = {
      incident_id: incidentId,
      timestamp: new Date().toISOString(),
      shap,
      lime,
      reliability,
      research_notes: 'Generated via SENTINEL-X Hybrid Explainability Engine. Attribution reflects local model sensitivity and does not prove causal attribution.',
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sentinel_xai_report_${incidentId}.json`;
    a.click();
  };

  return (
    <PageContainer
      title="Explainable AI & Trustworthiness"
      subtitle="Dual local interpretability framework combining SHAP additive Shapley values, LIME surrogate rules, and perturbation-based explanation stability auditing."
      isDemo={isDemo}
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg bg-soc-panelLight border border-soc-border text-xs font-mono text-soc-text hover:text-soc-purple transition flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Explanations
          </button>
          <button
            onClick={handleExportExplanation}
            className="px-3 py-1.5 rounded-lg bg-soc-purple/20 border border-soc-purple/40 text-xs font-mono text-soc-purple hover:bg-soc-purple/30 transition flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Export XAI Report
          </button>
        </div>
      }
    >
      {/* Research Disclaimer Alert */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-soc-text flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-amber-300 block font-mono">
            Academic Research Methodology Disclaimer
          </strong>
          <p className="text-soc-muted leading-relaxed">
            SHAP and LIME provide mathematical approximations of feature attribution within local neighborhoods of the model manifold. In cybersecurity research, these explanations illuminate <em>why the model made a prediction</em>, but do not inherently establish empirical causality or guarantee adversarial infallibility.
          </p>
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex border-b border-soc-border bg-soc-panel rounded-t-xl px-4 text-xs font-mono">
        <button
          onClick={() => setActiveTab('shap')}
          className={`py-3 px-4 border-b-2 font-semibold transition ${
            activeTab === 'shap'
              ? 'border-soc-purple text-soc-purple'
              : 'border-transparent text-soc-muted hover:text-white'
          }`}
        >
          SHAP Feature Contributions
        </button>
        <button
          onClick={() => setActiveTab('lime')}
          className={`py-3 px-4 border-b-2 font-semibold transition ${
            activeTab === 'lime'
              ? 'border-soc-cyan text-soc-cyan'
              : 'border-transparent text-soc-muted hover:text-white'
          }`}
        >
          LIME Decision Rules
        </button>
        <button
          onClick={() => setActiveTab('compare')}
          className={`py-3 px-4 border-b-2 font-semibold transition ${
            activeTab === 'compare'
              ? 'border-soc-orange text-soc-orange'
              : 'border-transparent text-soc-muted hover:text-white'
          }`}
        >
          Compare SHAP vs LIME
        </button>
        <button
          onClick={() => setActiveTab('reliability')}
          className={`py-3 px-4 border-b-2 font-semibold transition ${
            activeTab === 'reliability'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-soc-muted hover:text-white'
          }`}
        >
          Explanation Stability Audit
        </button>
      </div>

      {/* Content Rendering based on Tab */}
      <div className="space-y-6">
        {activeTab === 'shap' && <ShapChart data={shap} onRefresh={loadData} />}

        {activeTab === 'lime' && <LimeExplanation data={lime} />}

        {activeTab === 'compare' && (
          <div className="soc-card space-y-4">
            <div className="flex items-center justify-between border-b border-soc-border pb-3">
              <div className="flex items-center gap-2">
                <GitCompare className="w-5 h-5 text-soc-orange" />
                <h3 className="text-base font-semibold text-white tracking-wide">
                  Cross-Method Feature Ranking Alignment (SHAP vs LIME)
                </h3>
              </div>
              <span className="soc-badge bg-soc-orange/15 text-soc-orange border border-soc-orange/30">
                Ranking Agreement: 85.7%
              </span>
            </div>

            <p className="text-xs text-soc-muted leading-relaxed font-mono">
              Comparing global game-theoretic Shapley values against local sparse linear surrogate rules for Incident {incidentId}:
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-soc-border text-soc-dim uppercase text-[10px]">
                    <th className="py-2.5 px-3">Feature Name</th>
                    <th className="py-2.5 px-3">SHAP Rank & Value</th>
                    <th className="py-2.5 px-3">LIME Rank & Weight</th>
                    <th className="py-2.5 px-3">Consensus Alignment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-soc-border/50">
                  <tr className="hover:bg-soc-panelLight/40">
                    <td className="py-2.5 px-3 font-bold text-white">Packet Rate</td>
                    <td className="py-2.5 px-3 text-red-400 font-bold">#1 (+0.42)</td>
                    <td className="py-2.5 px-3 text-red-400 font-bold">#1 (+0.48)</td>
                    <td className="py-2.5 px-3 text-emerald-400 font-bold">STRONG AGREEMENT</td>
                  </tr>
                  <tr className="hover:bg-soc-panelLight/40">
                    <td className="py-2.5 px-3 font-bold text-white">Destination Port</td>
                    <td className="py-2.5 px-3 text-red-400">#2 (+0.31)</td>
                    <td className="py-2.5 px-3 text-red-400">#2 (+0.28)</td>
                    <td className="py-2.5 px-3 text-emerald-400 font-bold">STRONG AGREEMENT</td>
                  </tr>
                  <tr className="hover:bg-soc-panelLight/40">
                    <td className="py-2.5 px-3 font-bold text-white">Flow Duration</td>
                    <td className="py-2.5 px-3 text-amber-400">#3 (+0.18)</td>
                    <td className="py-2.5 px-3 text-amber-400">#4 (+0.12)</td>
                    <td className="py-2.5 px-3 text-amber-400 font-semibold">MODERATE AGREEMENT</td>
                  </tr>
                  <tr className="hover:bg-soc-panelLight/40">
                    <td className="py-2.5 px-3 font-bold text-white">Byte Rate / Count</td>
                    <td className="py-2.5 px-3 text-amber-400">#4 (+0.09)</td>
                    <td className="py-2.5 px-3 text-amber-400">#3 (+0.19)</td>
                    <td className="py-2.5 px-3 text-amber-400 font-semibold">MODERATE AGREEMENT</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'reliability' && (
          <ExplanationReliability
            data={reliability}
            onRunTest={handleRunReliabilityTest}
            isRunning={isTestingReliability}
          />
        )}
      </div>
    </PageContainer>
  );
};
