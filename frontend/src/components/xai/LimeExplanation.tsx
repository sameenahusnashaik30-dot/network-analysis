import React from 'react';
import { LimeExplanation as LimeType } from '../../types/xai';
import { HelpCircle, CheckCircle2 } from 'lucide-react';

interface LimeExplanationProps {
  data: LimeType | null;
}

export const LimeExplanation: React.FC<LimeExplanationProps> = ({ data }) => {
  if (!data) {
    return (
      <div className="soc-card py-12 text-center text-xs font-mono text-soc-dim">
        Explanation unavailable — model explanation service not connected
      </div>
    );
  }

  return (
    <div className="soc-card space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-soc-border pb-3">
        <div>
          <h3 className="text-base font-semibold text-white tracking-wide">
            LIME (Local Interpretable Model-agnostic Explanations)
          </h3>
          <p className="text-xs text-soc-dim font-mono">
            Local linear surrogate model fitted around the anomalous flow vector
          </p>
        </div>
        <span className="soc-badge bg-soc-cyan/15 text-soc-cyan border border-soc-cyan/30">
          Target: {data.target_class}
        </span>
      </div>

      <div className="p-3.5 rounded-xl bg-soc-bg border border-soc-border space-y-2">
        <div className="flex items-center gap-2 text-soc-cyan text-xs font-bold font-mono">
          <HelpCircle className="w-4 h-4" />
          Why was this traffic flagged?
        </div>
        <p className="text-xs text-soc-text leading-relaxed">
          {data.explanation_text}
        </p>
      </div>

      {/* Decision Rules breakdown */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-mono text-soc-dim uppercase">Surrogate Feature Rules & Impact</h4>
        {data.reasons.map((r, i) => (
          <div
            key={i}
            className="p-3 rounded-lg bg-soc-panelLight/40 border border-soc-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                <span className="font-mono text-xs font-semibold text-white">{r.rule}</span>
              </div>
              <p className="text-xs text-soc-muted">{r.description}</p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-[10px] text-soc-dim font-mono uppercase">Weight:</span>
              <span className="text-xs font-mono font-bold text-red-400">
                +{r.weight.toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
