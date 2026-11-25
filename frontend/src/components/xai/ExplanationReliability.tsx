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
      <div className="soc-card py-8 text-center text-xs font-mono text-soc-dim">
        Explanation stability metrics not yet computed for this flow.
      </div>
    );
  }

  return (
    <div className="soc-card space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-soc-border pb-3">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-base font-semibold text-white tracking-wide">
              Explanation Reliability & Robustness
            </h3>
          </div>
          <p className="text-xs text-soc-dim font-mono">
            Mathematical invariance of SHAP/LIME attribution ranks under continuous feature perturbations
          </p>
        </div>

        {onRunTest && (
          <button
            onClick={onRunTest}
            disabled={isRunning}
            className="px-3.5 py-1.5 rounded-lg bg-soc-cyan/15 border border-soc-cyan/40 hover:bg-soc-cyan/25 text-xs font-mono font-medium text-soc-cyan transition flex items-center gap-1.5 self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
            Run Reliability Test
          </button>
        )}
      </div>

      {/* Main Score Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-soc-bg border border-soc-border">
          <span className="text-[11px] font-mono text-soc-dim uppercase block">
            Explanation Stability Score
          </span>
          <div className="text-3xl font-bold font-mono text-emerald-400 mt-1">
            {data.stability_score}%
          </div>
          <span className="text-[11px] text-soc-muted mt-1 block">
            Top features preserved under perturbation
          </span>
        </div>

        <div className="p-4 rounded-xl bg-soc-bg border border-soc-border">
          <span className="text-[11px] font-mono text-soc-dim uppercase block">
            Ranking Consistency (Spearman ρ)
          </span>
          <div className="text-3xl font-bold font-mono text-soc-cyan mt-1">
            {data.feature_ranking_consistency.toFixed(2)}
          </div>
          <span className="text-[11px] text-soc-muted mt-1 block">
            High monotonicity across 50 noise vectors
          </span>
        </div>

        <div className="p-4 rounded-xl bg-soc-bg border border-soc-border">
          <span className="text-[11px] font-mono text-soc-dim uppercase block">
            Perturbation Sigma (σ)
          </span>
          <div className="text-3xl font-bold font-mono text-purple-400 mt-1">
            ±{(data.perturbation_sigma * 100).toFixed(0)}%
          </div>
          <span className="text-[11px] text-soc-muted mt-1 block">
            Gaussian noise applied to continuous flow metrics
          </span>
        </div>
      </div>

      {/* Perturbation Result Summary */}
      <div className="p-3.5 rounded-lg bg-soc-panelLight/40 border border-soc-border text-xs space-y-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="font-mono font-semibold text-white">Evaluation Outcome:</span>
          <span className="text-soc-muted">{data.perturbation_test_result}</span>
        </div>

        <div className="text-[11px] text-soc-dim font-mono flex items-center gap-2 flex-wrap pt-1">
          <span>Invariable Top Features:</span>
          {data.top_features_retained.map((feat) => (
            <span
              key={feat}
              className="px-2 py-0.5 rounded bg-soc-bg border border-soc-border text-soc-text"
            >
              {feat}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
