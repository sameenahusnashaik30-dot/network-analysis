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
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-xs font-medium text-slate-700 transition flex items-center gap-1.5 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Explanations
          </button>
          <button
            onClick={handleExportExplanation}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Export XAI Report
          </button>
        </div>
      }
    >
      {/* Research Disclaimer Alert */}
      <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-amber-950 block font-semibold text-xs">
            Model Explainability Interpretation Note
          </strong>
          <p className="text-amber-800 leading-relaxed font-sans">
            SHAP and LIME provide mathematical approximations of feature attribution within local neighborhoods of the model manifold. In cybersecurity operations, these explanations illuminate <em>why the model arrived at this classification</em>, but should be synthesized with raw packet captures and network context before taking disruptive mitigation actions.
          </p>
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 text-xs font-medium">
        <button
          onClick={() => setActiveTab('shap')}
          className={`py-3 px-4 border-b-2 transition ${
            activeTab === 'shap'
              ? 'border-blue-600 text-blue-600 font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          SHAP Feature Contributions
        </button>
        <button
          onClick={() => setActiveTab('lime')}
          className={`py-3 px-4 border-b-2 transition ${
            activeTab === 'lime'
              ? 'border-blue-600 text-blue-600 font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          LIME Decision Rules
        </button>
        <button
          onClick={() => setActiveTab('compare')}
          className={`py-3 px-4 border-b-2 transition ${
            activeTab === 'compare'
              ? 'border-blue-600 text-blue-600 font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Compare SHAP vs LIME
        </button>
        <button
          onClick={() => setActiveTab('reliability')}
          className={`py-3 px-4 border-b-2 transition ${
            activeTab === 'reliability'
              ? 'border-blue-600 text-blue-600 font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
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
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <GitCompare className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-semibold text-slate-900">
                  Cross-Method Feature Ranking Alignment (SHAP vs LIME)
                </h3>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                Ranking Agreement: 85.7%
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed font-sans">
              Comparing global game-theoretic Shapley values against local sparse linear surrogate rules for Incident {incidentId}:
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase text-[11px] font-semibold font-sans bg-slate-50/50">
                    <th className="py-2.5 px-3">Feature Name</th>
                    <th className="py-2.5 px-3">SHAP Rank & Value</th>
                    <th className="py-2.5 px-3">LIME Rank & Weight</th>
                    <th className="py-2.5 px-3">Consensus Alignment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/80 transition">
                    <td className="py-2.5 px-3 font-semibold text-slate-900 font-sans">Packet Rate</td>
                    <td className="py-2.5 px-3 text-red-600 font-bold">#1 (+0.42)</td>
                    <td className="py-2.5 px-3 text-red-600 font-bold">#1 (+0.48)</td>
                    <td className="py-2.5 px-3 font-sans">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        STRONG AGREEMENT
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/80 transition">
                    <td className="py-2.5 px-3 font-semibold text-slate-900 font-sans">Destination Port</td>
                    <td className="py-2.5 px-3 text-red-600 font-semibold">#2 (+0.31)</td>
                    <td className="py-2.5 px-3 text-red-600 font-semibold">#2 (+0.28)</td>
                    <td className="py-2.5 px-3 font-sans">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        STRONG AGREEMENT
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/80 transition">
                    <td className="py-2.5 px-3 font-semibold text-slate-900 font-sans">Flow Duration</td>
                    <td className="py-2.5 px-3 text-amber-600 font-semibold">#3 (+0.18)</td>
                    <td className="py-2.5 px-3 text-amber-600 font-semibold">#4 (+0.12)</td>
                    <td className="py-2.5 px-3 font-sans">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        MODERATE AGREEMENT
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/80 transition">
                    <td className="py-2.5 px-3 font-semibold text-slate-900 font-sans">Byte Rate / Count</td>
                    <td className="py-2.5 px-3 text-amber-600 font-semibold">#4 (+0.09)</td>
                    <td className="py-2.5 px-3 text-amber-600 font-semibold">#3 (+0.19)</td>
                    <td className="py-2.5 px-3 font-sans">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        MODERATE AGREEMENT
                      </span>
                    </td>
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
