import React from 'react';
import { BrainCircuit, ArrowUpRight } from 'lucide-react';
import { ShapExplanation } from '../../types/xai';

interface XAIExplanationCardProps {
  shap: ShapExplanation | null;
  onOpenXAI: () => void;
}

export const XAIExplanationCard: React.FC<XAIExplanationCardProps> = ({ shap, onOpenXAI }) => {
  return (
    <div className="soc-card flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-soc-purple/20 text-soc-purple border border-soc-purple/30">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white tracking-wide">AI Explanation — SHAP</h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-soc-purple/10 text-soc-purple border border-soc-purple/20">
            Local Shapley Values
          </span>
        </div>

        <p className="text-xs text-soc-dim mb-3">
          Feature contribution breakdown for latest high-risk flow:
        </p>

        {shap ? (
          <div className="space-y-2.5">
            {shap.features.slice(0, 5).map((f) => {
              const absVal = Math.abs(f.contribution);
              const percent = Math.min(100, Math.round(absVal * 120));
              return (
                <div key={f.feature_name} className="text-xs">
                  <div className="flex items-center justify-between text-soc-muted mb-1 font-mono">
                    <span className="text-[11px] text-soc-text font-medium">{f.feature_name}</span>
                    <span
                      className={`font-semibold ${
                        f.contribution >= 0 ? 'text-red-400' : 'text-emerald-400'
                      }`}
                    >
                      {f.contribution >= 0 ? `+${f.contribution}` : f.contribution}
                    </span>
                  </div>
                  <div className="w-full bg-soc-bg rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        f.contribution >= 0 ? 'bg-red-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-6 text-center text-xs font-mono text-soc-dim">
            Explanation unavailable — model explanation service not connected
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-soc-border/60">
        <button
          onClick={onOpenXAI}
          className="w-full py-2 rounded-lg bg-soc-panelLight border border-soc-border hover:border-soc-purple/40 text-xs font-medium text-soc-text hover:text-soc-purple transition flex items-center justify-center gap-1.5 font-mono"
        >
          View LIME & Stability Details
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
