import React from 'react';
import { LimeExplanation as LimeType } from '../../types/xai';
import { HelpCircle, CheckCircle2 } from 'lucide-react';

interface LimeExplanationProps {
  data: LimeType | null;
}

export const LimeExplanation: React.FC<LimeExplanationProps> = ({ data }) => {
  if (!data) {
    return (
      <div className="soc-card py-12 text-center text-xs font-mono text-slate-400">
        Explanation unavailable — model explanation service not connected
      </div>
    );
  }

  return (
    <div className="soc-card space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            LIME (Local Interpretable Model-agnostic Explanations)
          </h3>
          <p className="text-xs text-slate-500 font-sans">
            Local linear surrogate model fitted around the anomalous flow vector
          </p>
        </div>
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          Target: {data.target_class}
        </span>
      </div>

      <div className="p-3.5 rounded-lg bg-blue-50/60 border border-blue-200 space-y-2">
        <div className="flex items-center gap-2 text-blue-700 text-xs font-semibold">
          <HelpCircle className="w-4 h-4" />
          Why was this traffic flagged?
        </div>
        <p className="text-xs text-slate-700 leading-relaxed font-sans">
          {data.explanation_text}
        </p>
      </div>

      {/* Decision Rules breakdown */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Surrogate Feature Rules & Impact</h4>
        {data.reasons.map((r, i) => (
          <div
            key={i}
            className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-600" />
                <span className="font-mono text-xs font-semibold text-slate-900">{r.rule}</span>
              </div>
              <p className="text-xs text-slate-500 font-sans">{r.description}</p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto font-mono">
              <span className="text-[10px] text-slate-400 uppercase">Weight:</span>
              <span className="text-xs font-bold text-red-600">
                +{r.weight.toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
