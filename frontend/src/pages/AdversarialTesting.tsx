import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import {
  Zap,
  Play,
  Sliders,
  Download,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Cpu,
  Database,
  BarChart2,
  CheckCircle2,
} from 'lucide-react';

export const AdversarialTesting: React.FC = () => {
  const { user, canRunAdversarial } = useAuth();

  // Test configuration
  const [model, setModel] = useState<'XGBoost Classifier' | 'Random Forest' | 'Deep Autoencoder'>('XGBoost Classifier');
  const [dataset, setDataset] = useState<'CIC-IDS2017 SDN Test Subset' | 'In-Distribution Normal Flow Baseline'>('CIC-IDS2017 SDN Test Subset');
  const [attackCategory, setAttackCategory] = useState<'Feature Perturbation' | 'Traffic Timing Evasion' | 'Payload Size Morphing' | 'Gaussian Noise'>('Feature Perturbation');
  const [epsilon, setEpsilon] = useState<number>(0.12);
  const [iterations, setIterations] = useState<number>(50);

  // Results state
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isDemo, setIsDemo] = useState<boolean>(true);
  const [result, setResult] = useState<{
    baseline: { accuracy: number; detection_rate: number; fpr: number };
    perturbed: { accuracy: number; detection_rate: number; fpr: number };
    performance_degradation: number;
    robustness_score: number;
    tested_samples: number;
    execution_time_ms: number;
  } | null>(null);

  const handleRunTest = async () => {
    if (!canRunAdversarial) {
      alert(`RBAC RESTRICTION: Current role '${user.role}' cannot execute adversarial experiments. Only RESEARCHER or ADMIN roles are authorized.`);
      return;
    }

    try {
      setIsRunning(true);
      const res = await api.runAdversarialTest({
        model_name: model,
        dataset_name: dataset,
        attack_category: attackCategory,
        perturbation_epsilon: epsilon,
        iterations,
      });
      setResult(res);
      setIsDemo(res.is_demo);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRunning(false);
    }
  };

  const handleExport = () => {
    if (!result) return;
    const report = {
      test_run_id: `ADV-${Date.now()}`,
      researcher: user.username,
      timestamp: new Date().toISOString(),
      configuration: { model, dataset, attackCategory, epsilon, iterations },
      results: result,
      conclusion: `Model exhibited ${result.performance_degradation}% degradation under ε=${epsilon} perturbation. Overall Robustness Score: ${result.robustness_score}/100.`,
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `adversarial_resilience_report.json`;
    a.click();
  };

  return (
    <PageContainer
      title="Controlled Adversarial Robustness Benchmarking"
      subtitle="Defensive stress-testing environment evaluating AI classifier degradation under deliberate feature noise, traffic morphing, and evasion simulations."
      isDemo={isDemo}
      actions={
        result ? (
          <button
            onClick={handleExport}
            className="px-3.5 py-1.5 rounded-lg bg-soc-cyan/15 border border-soc-cyan/40 hover:bg-soc-cyan/25 text-xs font-mono text-soc-cyan transition flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Export Experiment Results
          </button>
        ) : undefined
      }
    >
      {/* Defensive Purpose Notice */}
      <div className="p-4 rounded-xl bg-soc-cyan/10 border border-soc-cyan/30 text-xs text-soc-text flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-soc-cyan flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-white block font-mono">
            Defensive Robustness Verification Mandate
          </strong>
          <p className="text-soc-muted leading-relaxed">
            Per PRD guidelines, this interface provides <strong>defensive resilience evaluation only</strong> on controlled offline evaluation splits. It does not automate live adversarial attacks on external infrastructure.
          </p>
        </div>
      </div>

      {/* Configuration Panel */}
      <div className="soc-card space-y-4">
        <div className="flex items-center justify-between border-b border-soc-border pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-soc-purple" />
            <h3 className="text-base font-semibold text-white tracking-wide">
              Experiment Configuration
            </h3>
          </div>
          <span className="text-xs font-mono text-soc-dim">
            Authorized for: RESEARCHER & ADMIN
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          {/* Model Selector */}
          <div>
            <label className="text-soc-dim block mb-1.5 uppercase text-[11px] flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-soc-cyan" /> Select AI Model
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value as any)}
              className="w-full bg-soc-bg border border-soc-border rounded-lg p-2.5 text-white focus:outline-none focus:border-soc-cyan"
            >
              <option value="XGBoost Classifier">XGBoost Classifier (Layer A)</option>
              <option value="Random Forest">Random Forest Classifier (Layer A)</option>
              <option value="Deep Autoencoder">Deep Autoencoder (Layer B)</option>
            </select>
          </div>

          {/* Dataset Selector */}
          <div>
            <label className="text-soc-dim block mb-1.5 uppercase text-[11px] flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-soc-purple" /> Test Dataset
            </label>
            <select
              value={dataset}
              onChange={(e) => setDataset(e.target.value as any)}
              className="w-full bg-soc-bg border border-soc-border rounded-lg p-2.5 text-white focus:outline-none focus:border-soc-purple"
            >
              <option value="CIC-IDS2017 SDN Test Subset">CIC-IDS2017 SDN Test Subset (2,500 flows)</option>
              <option value="In-Distribution Normal Flow Baseline">In-Distribution Normal Baseline</option>
            </select>
          </div>

          {/* Attack Category */}
          <div>
            <label className="text-soc-dim block mb-1.5 uppercase text-[11px] flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Perturbation Category
            </label>
            <select
              value={attackCategory}
              onChange={(e) => setAttackCategory(e.target.value as any)}
              className="w-full bg-soc-bg border border-soc-border rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-400"
            >
              <option value="Feature Perturbation">Feature Perturbation (Gradient Shift)</option>
              <option value="Traffic Timing Evasion">Traffic Timing Evasion (Packet Jitter)</option>
              <option value="Payload Size Morphing">Payload Size Morphing (Padding Noise)</option>
              <option value="Gaussian Noise">Gaussian Feature Perturbation</option>
            </select>
          </div>
        </div>

        {/* Sliders for Epsilon */}
        <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div>
            <div className="flex justify-between text-soc-dim mb-1">
              <span>Perturbation Magnitude (ε):</span>
              <strong className="text-soc-cyan">{(epsilon * 100).toFixed(0)}% ({epsilon.toFixed(2)})</strong>
            </div>
            <input
              type="range"
              min="0.02"
              max="0.40"
              step="0.02"
              value={epsilon}
              onChange={(e) => setEpsilon(parseFloat(e.target.value))}
              className="w-full accent-soc-cyan"
            />
          </div>

          <div>
            <div className="flex justify-between text-soc-dim mb-1">
              <span>Monte Carlo Iterations:</span>
              <strong className="text-purple-400">{iterations} passes</strong>
            </div>
            <input
              type="range"
              min="10"
              max="200"
              step="10"
              value={iterations}
              onChange={(e) => setIterations(parseInt(e.target.value))}
              className="w-full accent-soc-purple"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-3 border-t border-soc-border flex items-center justify-end gap-3">
          <button
            onClick={handleRunTest}
            disabled={isRunning || !canRunAdversarial}
            className={`px-5 py-2.5 rounded-lg text-xs font-bold transition flex items-center gap-2 font-mono shadow-lg ${
              canRunAdversarial
                ? 'bg-soc-cyan hover:bg-soc-cyanGlow text-black shadow-cyan-950/40'
                : 'bg-soc-dim/40 text-soc-muted cursor-not-allowed'
            }`}
          >
            {isRunning ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin" />
                Computing Gradient Perturbations...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Execute Controlled Robustness Test
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results Presentation (Before vs After) */}
      {result && (
        <div className="soc-card space-y-6">
          <div className="flex items-center justify-between border-b border-soc-border pb-3">
            <div>
              <h3 className="text-base font-semibold text-white tracking-wide">
                Robustness Benchmark Results
              </h3>
              <p className="text-xs text-soc-dim font-mono">
                Evaluated {result.tested_samples} samples across {iterations} noise iterations in {result.execution_time_ms}ms
              </p>
            </div>
            <span className="soc-badge bg-soc-cyan/15 text-soc-cyan border border-soc-cyan/30">
              Score: {result.robustness_score} / 100
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Before Perturbation */}
            <div className="p-4 rounded-xl bg-soc-bg border border-soc-border space-y-3">
              <span className="soc-badge bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Baseline (Unperturbed)
              </span>
              <div className="grid grid-cols-3 gap-2 font-mono text-xs pt-1">
                <div className="p-2.5 rounded bg-soc-panel">
                  <span className="text-soc-dim block text-[10px]">Accuracy</span>
                  <span className="text-lg font-bold text-emerald-400">
                    {(result.baseline.accuracy * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="p-2.5 rounded bg-soc-panel">
                  <span className="text-soc-dim block text-[10px]">Detection Rate</span>
                  <span className="text-lg font-bold text-soc-cyan">
                    {(result.baseline.detection_rate * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="p-2.5 rounded bg-soc-panel">
                  <span className="text-soc-dim block text-[10px]">False Pos. Rate</span>
                  <span className="text-lg font-bold text-soc-muted">
                    {(result.baseline.fpr * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

            {/* After Perturbation */}
            <div className="p-4 rounded-xl bg-soc-bg border border-red-500/30 space-y-3">
              <span className="soc-badge bg-red-500/15 text-red-400 border border-red-500/30">
                Under Perturbation (ε={epsilon})
              </span>
              <div className="grid grid-cols-3 gap-2 font-mono text-xs pt-1">
                <div className="p-2.5 rounded bg-soc-panel">
                  <span className="text-soc-dim block text-[10px]">Accuracy</span>
                  <span className="text-lg font-bold text-amber-400">
                    {(result.perturbed.accuracy * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="p-2.5 rounded bg-soc-panel">
                  <span className="text-soc-dim block text-[10px]">Detection Rate</span>
                  <span className="text-lg font-bold text-red-400">
                    {(result.perturbed.detection_rate * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="p-2.5 rounded bg-soc-panel">
                  <span className="text-soc-dim block text-[10px]">False Pos. Rate</span>
                  <span className="text-lg font-bold text-amber-400">
                    {(result.perturbed.fpr * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Metric Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
            <div className="p-3 rounded-lg bg-soc-bg border border-soc-border">
              <span className="text-soc-dim block text-[10px]">Performance Degradation</span>
              <span className="text-xl font-bold text-red-400 mt-1 block">
                -{result.performance_degradation}%
              </span>
            </div>

            <div className="p-3 rounded-lg bg-soc-bg border border-soc-border">
              <span className="text-soc-dim block text-[10px]">Adversarial Robustness Score</span>
              <span className="text-xl font-bold text-emerald-400 mt-1 block">
                {result.robustness_score} / 100
              </span>
            </div>

            <div className="p-3 rounded-lg bg-soc-bg border border-soc-border">
              <span className="text-soc-dim block text-[10px]">Defensive Recommendation</span>
              <span className="text-xs font-semibold text-soc-text mt-1 block">
                Deploy feature squashing & adversarial training retuning
              </span>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
