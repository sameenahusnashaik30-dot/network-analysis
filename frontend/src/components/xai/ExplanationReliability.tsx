import React from 'react';
import { ExplanationReliabilityResult } from '../../types/xai';
import { ShieldCheck, Activity, RefreshCw } from 'lucide-react';

interface ExplanationReliabilityProps {
  data: ExplanationReliabilityResult | null;
  onRunTest?: () => void;
  isRunning?: boolean;
}

export const ExplanationReliability: React.FC<ExplanationReliabilityProps> = ({
  data,
  onRunTest,
  isRunning,
}) => {
  if (!data) {
    return (
      <div className="soc-card py-8 text-center text-xs font-mono text-slate-400">
        Explanation stability metrics not yet computed for this flow.
      </div>
    );
  }

  return (
    <div className="soc-card space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-semibold text-slate-900">
              Explanation Reliability & Robustness
            </h3>
          </div>
          <p className="text-xs text-slate-500 font-sans">
            Mathematical invariance of SHAP/LIME attribution ranks under continuous feature perturbations
          </p>
        </div>

        {onRunTest && (
          <button
            onClick={onRunTest}
            disabled={isRunning}
            className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-xs font-medium text-slate-700 transition flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
            Run Reliability Test
          </button>
        )}
      </div>

      {/* Main Score Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
          <span className="text-[11px] font-sans font-semibold text-slate-500 uppercase block">
            Explanation Stability Score
          </span>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {data.stability_score}%
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block font-sans">
            Top features preserved under perturbation
          </span>
        </div>

        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
          <span className="text-[11px] font-sans font-semibold text-slate-500 uppercase block">
            Ranking Consistency (Spearman ρ)
          </span>
          <div className="text-2xl font-bold font-mono text-blue-600 mt-1">
            {data.feature_ranking_consistency.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block font-sans">
            High monotonicity across 50 noise vectors
          </span>
        </div>

        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
          <span className="text-[11px] font-sans font-semibold text-slate-500 uppercase block">
            Perturbation Sigma (σ)
          </span>
          <div className="text-2xl font-bold font-mono text-purple-600 mt-1">
            ±{(data.perturbation_sigma * 100).toFixed(0)}%
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block font-sans">
            Gaussian noise applied to continuous flow metrics
          </span>
        </div>
      </div>

      {/* Perturbation Result Summary */}
      <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-600" />
          <span className="font-semibold text-slate-900 font-sans">Evaluation Outcome:</span>
          <span className="text-slate-600 font-sans">{data.perturbation_test_result}</span>
        </div>

        <div className="text-[11px] text-slate-500 flex items-center gap-2 flex-wrap pt-1 font-sans">
          <span className="font-medium text-slate-600">Invariable Top Features:</span>
          {data.top_features_retained.map((feat) => (
            <span
              key={feat}
              className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-mono text-[11px]"
            >
              {feat}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
