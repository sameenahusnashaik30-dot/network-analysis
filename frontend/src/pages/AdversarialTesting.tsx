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
  const [model, setModel] = useState<'XGBoost Classifier' | 'Random Forest' | 'Deep Autoencoder'>('Random Forest');
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
            className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Export Experiment Results
          </button>
        ) : undefined
      }
    >
      {/* Defensive Purpose Notice */}
      <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-slate-700 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-slate-900 block font-semibold">
            Defensive Robustness Verification Mandate
          </strong>
          <p className="text-slate-600 leading-relaxed font-sans">
            This module provides <strong>defensive resilience evaluation only</strong> on controlled offline benchmark splits. It measures how classification accuracy and false-alarm rates degrade when flow features are deliberately perturbed.
          </p>
        </div>
      </div>

      {/* Configuration Panel */}
      <div className="soc-card space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-semibold text-slate-900">
              Experiment Configuration
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Authorized for: RESEARCHER & ADMIN
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          {/* Model Selector */}
          <div>
            <label className="text-slate-600 block mb-1.5 uppercase text-[11px] font-semibold flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-blue-600" /> Select AI Model
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value as any)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-blue-500 text-xs shadow-xs"
            >
              <option value="Random Forest">Random Forest Classifier (Layer A)</option>
              <option value="XGBoost Classifier">XGBoost Classifier (Layer A)</option>
              <option value="Deep Autoencoder">Deep Autoencoder (Layer B)</option>
            </select>
          </div>

          {/* Dataset Selector */}
          <div>
            <label className="text-slate-600 block mb-1.5 uppercase text-[11px] font-semibold flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-purple-600" /> Test Dataset
            </label>
            <select
              value={dataset}
              onChange={(e) => setDataset(e.target.value as any)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-blue-500 text-xs shadow-xs"
            >
              <option value="CIC-IDS2017 SDN Test Subset">CIC-IDS2017 SDN Test Subset (2,500 flows)</option>
              <option value="In-Distribution Normal Flow Baseline">In-Distribution Normal Baseline</option>
            </select>
          </div>

          {/* Attack Category */}
          <div>
            <label className="text-slate-600 block mb-1.5 uppercase text-[11px] font-semibold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-600" /> Perturbation Category
            </label>
            <select
              value={attackCategory}
              onChange={(e) => setAttackCategory(e.target.value as any)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-blue-500 text-xs shadow-xs"
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
            <div className="flex justify-between text-slate-600 mb-1 font-sans">
              <span className="font-medium">Perturbation Magnitude (ε):</span>
              <strong className="text-blue-600 font-mono">{(epsilon * 100).toFixed(0)}% ({epsilon.toFixed(2)})</strong>
            </div>
            <input
              type="range"
              min="0.02"
              max="0.40"
              step="0.02"
              value={epsilon}
              onChange={(e) => setEpsilon(parseFloat(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>

          <div>
            <div className="flex justify-between text-slate-600 mb-1 font-sans">
              <span className="font-medium">Monte Carlo Iterations:</span>
              <strong className="text-purple-600 font-mono">{iterations} passes</strong>
            </div>
            <input
              type="range"
              min="10"
              max="200"
              step="10"
              value={iterations}
              onChange={(e) => setIterations(parseInt(e.target.value))}
              className="w-full accent-purple-600"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            onClick={handleRunTest}
            disabled={isRunning || !canRunAdversarial}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2 shadow-sm ${
              canRunAdversarial
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
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
                Execute Robustness Benchmark
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results Presentation (Before vs After) */}
      {result && (
        <div className="soc-card space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Robustness Benchmark Results
              </h3>
              <p className="text-xs text-slate-500 font-sans">
                Evaluated {result.tested_samples} samples across {iterations} noise iterations in {result.execution_time_ms}ms
              </p>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              Score: {result.robustness_score} / 100
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Before Perturbation */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Baseline (Unperturbed)
              </span>
              <div className="grid grid-cols-3 gap-2 font-mono text-xs pt-1">
                <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                  <span className="text-slate-500 block text-[10px] font-sans font-semibold">Accuracy</span>
                  <span className="text-lg font-bold text-slate-900">
                    {(result.baseline.accuracy * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                  <span className="text-slate-500 block text-[10px] font-sans font-semibold">Detection Rate</span>
                  <span className="text-lg font-bold text-blue-600">
                    {(result.baseline.detection_rate * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                  <span className="text-slate-500 block text-[10px] font-sans font-semibold">False Pos. Rate</span>
                  <span className="text-lg font-bold text-slate-600">
                    {(result.baseline.fpr * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

            {/* After Perturbation */}
            <div className="p-4 rounded-xl bg-red-50/40 border border-red-200 space-y-3">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200">
                Under Perturbation (ε={epsilon})
              </span>
              <div className="grid grid-cols-3 gap-2 font-mono text-xs pt-1">
                <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                  <span className="text-slate-500 block text-[10px] font-sans font-semibold">Accuracy</span>
                  <span className="text-lg font-bold text-amber-600">
                    {(result.perturbed.accuracy * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                  <span className="text-slate-500 block text-[10px] font-sans font-semibold">Detection Rate</span>
                  <span className="text-lg font-bold text-red-600">
                    {(result.perturbed.detection_rate * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                  <span className="text-slate-500 block text-[10px] font-sans font-semibold">False Pos. Rate</span>
                  <span className="text-lg font-bold text-amber-600">
                    {(result.perturbed.fpr * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Metric Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[10px] font-sans font-semibold">Performance Degradation</span>
              <span className="text-xl font-bold text-red-600 mt-1 block">
                -{result.performance_degradation}%
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[10px] font-sans font-semibold">Adversarial Robustness Score</span>
              <span className="text-xl font-bold text-slate-900 mt-1 block">
                {result.robustness_score} / 100
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[10px] font-sans font-semibold">Defensive Recommendation</span>
              <span className="text-xs font-semibold text-slate-800 mt-1 block font-sans">
                Deploy feature squashing & adversarial training retuning
              </span>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
