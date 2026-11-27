import React from 'react';
import { BrainCircuit, ExternalLink } from 'lucide-react';
import { ShapExplanation } from '../../types/xai';

interface XAIExplanationCardProps {
  shap: ShapExplanation | null;
  onOpenXAI: () => void;
}

export const XAIExplanationCard: React.FC<XAIExplanationCardProps> = ({ shap, onOpenXAI }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-purple-50 text-purple-600 border border-purple-100">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-tight">AI Explanation — SHAP</h3>
          </div>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
            Shapley Attributions
          </span>
        </div>

        <p className="text-xs text-slate-500 mb-3">
          Top feature contributions for latest flagged high-risk flow:
        </p>

        {shap ? (
          <div className="space-y-2">
            {shap.features.slice(0, 5).map((f) => {
              const absVal = Math.abs(f.contribution);
              const percent = Math.min(100, Math.round(absVal * 120));
              return (
                <div key={f.feature_name} className="text-xs">
                  <div className="flex items-center justify-between text-slate-600 mb-1">
                    <span className="text-[11px] font-medium text-slate-800">{f.feature_name}</span>
                    <span
                      className={`font-semibold font-mono text-[11px] ${
                        f.contribution >= 0 ? 'text-red-600' : 'text-emerald-600'
                      }`}
                    >
                      {f.contribution >= 0 ? `+${f.contribution}` : f.contribution}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
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
          <div className="py-6 text-center text-xs text-slate-400">
            No local explanation loaded.
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-500">
          Target: {shap?.target_class || 'Candidate'}
        </span>
        <button
          onClick={onOpenXAI}
          className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
        >
          Deep Investigation
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
