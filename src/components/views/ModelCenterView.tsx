import React, { useState } from 'react';
import { ModelMetric } from '../../types/fraud';
import { 
  Cpu, 
  Sliders, 
  Play, 
  Zap
} from 'lucide-react';
import { MLPredictionResult, fraudApi } from '../../services/api';

interface ModelCenterViewProps {
  models: ModelMetric[];
}

export const ModelCenterView: React.FC<ModelCenterViewProps> = ({ models }) => {
  const [selectedModelId, setSelectedModelId] = useState<string>(models[0]?.id || 'MDL-XGB-24');
  
  // Interactive Inference Sandbox state
  const [sandboxAmount, setSandboxAmount] = useState<number>(45000);
  const [sandboxMerchant, setSandboxMerchant] = useState<string>('Flipkart Digital');
  const [sandboxIsTor, setSandboxIsTor] = useState<boolean>(true);
  const [sandboxIsNewDevice, setSandboxIsNewDevice] = useState<boolean>(true);
  const [sandboxVelocity, setSandboxVelocity] = useState<number>(6);
  const [sandboxAccountAge, setSandboxAccountAge] = useState<number>(14);

  const [predictionResult, setPredictionResult] = useState<MLPredictionResult | null>(null);
  const [isPredicting, setIsPredicting] = useState<boolean>(false);

  const activeModel = models.find(m => m.id === selectedModelId) || models[0];

  const runLiveInference = async () => {
    setIsPredicting(true);
    try {
      const res = await fraudApi.predictRisk({
        amount: sandboxAmount,
        merchant: sandboxMerchant,
        isNewDevice: sandboxIsNewDevice,
        isTorOrVpn: sandboxIsTor,
        velocityPerHour: sandboxVelocity,
        customerAgeDays: sandboxAccountAge
      });
      setPredictionResult(res);
    } catch (err) {
      console.error('Inference error:', err);
    } finally {
      setIsPredicting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1F2937]">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#38BDF8]" />
            <span>Indian Banking ML Model Registry & Benchmarks</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Production & candidate models trained on NPCI UPI Real-Time Fraud Benchmark + I4C Cybercrime HeteroGraph
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Inference Serving Active (3.8ms P99)</span>
          </span>
        </div>
      </div>

      {/* Model Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {models.map(m => {
          const isSelected = m.id === selectedModelId;
          const isProd = m.status === 'Production';

          return (
            <div
              key={m.id}
              onClick={() => setSelectedModelId(m.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-[#151E2C] border-[#38BDF8] shadow-[0_0_20px_-3px_rgba(56,189,248,0.25)]'
                  : 'bg-[#0E131C] border-[#1F2937] hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  isProd 
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' 
                    : 'bg-purple-500/15 border-purple-500/30 text-purple-400'
                }`}>
                  {m.status}
                </span>
                <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" />
                  {m.latencyMs}ms
                </span>
              </div>

              <h3 className="text-sm font-bold text-white tracking-tight">{m.name}</h3>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5">{m.version}</div>

              <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-[#1F2937] text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block">PR-AUC</span>
                  <span className="font-mono font-bold text-cyan-400">{m.prAuc.toFixed(3)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">F1-Score</span>
                  <span className="font-mono font-bold text-slate-200">{m.f1.toFixed(3)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Model Deep Dive: Metrics + Confusion Matrix + Feature Importance */}
      {activeModel && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Metrics & Evaluation */}
          <div className="bg-[#0E131C] rounded-xl border border-[#1F2937] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Performance Metrics & Training
              </h4>
              <span className="text-[11px] font-mono text-slate-400">{activeModel.type}</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {activeModel.description}
            </p>

            <div className="grid grid-cols-2 gap-3 py-2 text-xs">
              <div className="bg-[#121824] p-3 rounded-lg border border-[#1F2937]">
                <span className="text-[10px] text-slate-400 block">Precision</span>
                <span className="text-lg font-bold font-mono text-emerald-400">
                  {(activeModel.precision * 100).toFixed(1)}%
                </span>
              </div>
              <div className="bg-[#121824] p-3 rounded-lg border border-[#1F2937]">
                <span className="text-[10px] text-slate-400 block">Recall</span>
                <span className="text-lg font-bold font-mono text-cyan-400">
                  {(activeModel.recall * 100).toFixed(1)}%
                </span>
              </div>
              <div className="bg-[#121824] p-3 rounded-lg border border-[#1F2937]">
                <span className="text-[10px] text-slate-400 block">ROC-AUC</span>
                <span className="text-lg font-bold font-mono text-purple-400">
                  {activeModel.rocAuc.toFixed(3)}
                </span>
              </div>
              <div className="bg-[#121824] p-3 rounded-lg border border-[#1F2937]">
                <span className="text-[10px] text-slate-400 block">PR-AUC (Imbalanced)</span>
                <span className="text-lg font-bold font-mono text-rose-400">
                  {activeModel.prAuc.toFixed(3)}
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 space-y-1 pt-2 border-t border-[#1F2937]">
              <div><span className="text-slate-500">Benchmark Dataset:</span> {activeModel.dataset}</div>
              <div><span className="text-slate-500">Training Checkpoint:</span> {activeModel.trainingDate}</div>
            </div>
          </div>

          {/* Center Column: Confusion Matrix */}
          <div className="bg-[#0E131C] rounded-xl border border-[#1F2937] p-5 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Holdout Confusion Matrix (284k Indian txns)
            </h4>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-emerald-950/20 border border-emerald-500/30 p-3.5 rounded-xl text-center">
                <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider block">
                  True Positive (Fraud Caught)
                </span>
                <span className="text-xl font-bold font-mono text-white mt-1 block">
                  {activeModel.confusionMatrix.truePositive.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-emerald-400/80">94.1% capture rate</span>
              </div>

              <div className="bg-rose-950/20 border border-rose-500/30 p-3.5 rounded-xl text-center">
                <span className="text-[10px] font-semibold text-rose-400 uppercase tracking-wider block">
                  False Negative (Missed)
                </span>
                <span className="text-xl font-bold font-mono text-rose-400 mt-1 block">
                  {activeModel.confusionMatrix.falseNegative.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-rose-400/80">5.9% leak rate</span>
              </div>

              <div className="bg-[#121824] border border-[#1F2937] p-3.5 rounded-xl text-center">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  False Positive (Friction)
                </span>
                <span className="text-xl font-bold font-mono text-amber-400 mt-1 block">
                  {activeModel.confusionMatrix.falsePositive.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-slate-400">0.06% friction rate</span>
              </div>

              <div className="bg-[#121824] border border-[#1F2937] p-3.5 rounded-xl text-center">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  True Negative (Clean)
                </span>
                <span className="text-xl font-bold font-mono text-slate-300 mt-1 block">
                  {(activeModel.confusionMatrix.trueNegative / 1000).toFixed(0)}k
                </span>
                <span className="text-[10px] text-slate-500">Verified legitimate</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 pt-2 border-t border-[#1F2937]">
              Optimized for minimal user friction across UPI checkout flows.
            </div>
          </div>

          {/* Right Column: Feature Importance */}
          <div className="bg-[#0E131C] rounded-xl border border-[#1F2937] p-5 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              TreeSHAP Global Feature Weights
            </h4>

            <div className="space-y-3 pt-1 text-xs">
              {activeModel.featureImportance.map((feat, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-mono text-slate-300">{feat.feature}</span>
                    <span className="font-mono text-cyan-400 font-bold">
                      {(feat.importance * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-[#121824] h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-[#38BDF8] to-purple-500 h-full rounded-full"
                      style={{ width: `${feat.importance * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Interactive Live Inference Sandbox */}
      <div className="bg-[#0E131C] rounded-xl border border-[#1F2937] p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1F2937] pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#38BDF8]" />
            <div>
              <h3 className="text-base font-bold text-white">Live ML Risk Inference Sandbox</h3>
              <p className="text-xs text-slate-400">
                Test real-time feature vector inference against the production Indian Banking XGBoost + GraphSAGE model
              </p>
            </div>
          </div>

          <button
            onClick={runLiveInference}
            disabled={isPredicting}
            className="px-5 py-2 rounded-xl bg-[#38BDF8] hover:bg-[#0284C7] text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isPredicting ? 'Executing Model...' : 'Run Real-Time Inference'}</span>
          </button>
        </div>

        {/* Feature Input Sliders & Toggles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-slate-300 mb-1.5">
                <span>Transaction Amount (₹)</span>
                <span className="font-mono font-bold text-white">₹{sandboxAmount.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min="500"
                max="200000"
                step="1000"
                value={sandboxAmount}
                onChange={(e) => setSandboxAmount(Number(e.target.value))}
                className="w-full accent-[#38BDF8]"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1.5">
                <span>Hourly UPI Velocity</span>
                <span className="font-mono font-bold text-white">{sandboxVelocity} txns/hr</span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                value={sandboxVelocity}
                onChange={(e) => setSandboxVelocity(Number(e.target.value))}
                className="w-full accent-[#38BDF8]"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-slate-300 mb-1.5">
                <span>Customer Account Age</span>
                <span className="font-mono font-bold text-white">{sandboxAccountAge} days</span>
              </div>
              <input
                type="range"
                min="1"
                max="365"
                value={sandboxAccountAge}
                onChange={(e) => setSandboxAccountAge(Number(e.target.value))}
                className="w-full accent-[#38BDF8]"
              />
            </div>

            <div>
              <label className="text-slate-300 mb-1.5 block">Merchant Category</label>
              <select
                value={sandboxMerchant}
                onChange={(e) => setSandboxMerchant(e.target.value)}
                className="w-full bg-[#121824] border border-[#1F2937] rounded-lg px-3 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-[#38BDF8]"
              >
                <option value="Flipkart Digital">Flipkart (Digital Goods & Vouchers)</option>
                <option value="PayTM Gateway">PayTM / PhonePe Gateway (P2P Virtual Escrow)</option>
                <option value="Croma Electronics">Croma / Reliance Digital (Electronics)</option>
                <option value="Tanishq Jewellers">Tanishq Jewellers (Precious Metals)</option>
                <option value="Zepto Quick">Zepto / Swiggy Instamart (Quick Commerce)</option>
              </select>
            </div>
          </div>

          <div className="space-y-3 bg-[#121824] p-4 rounded-xl border border-[#1F2937]">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Behavioral Risk Flags
            </span>

            <label className="flex items-center gap-2.5 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={sandboxIsTor}
                onChange={(e) => setSandboxIsTor(e.target.checked)}
                className="rounded border-[#1F2937] bg-[#0E131C] text-[#EF4444] focus:ring-0 w-4 h-4"
              />
              <span>Mewat / Jamtara Proxy ISP Node</span>
            </label>

            <label className="flex items-center gap-2.5 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={sandboxIsNewDevice}
                onChange={(e) => setSandboxIsNewDevice(e.target.checked)}
                className="rounded border-[#1F2937] bg-[#0E131C] text-[#EF4444] focus:ring-0 w-4 h-4"
              />
              <span>Rooted Android / Hooked Zygote Fingerprint</span>
            </label>
          </div>

        </div>

        {/* Prediction Results Banner */}
        {predictionResult && (
          <div className="p-4 rounded-xl bg-[#121824] border border-[#38BDF8]/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400 uppercase">Predicted Risk:</span>
                <span className={`text-base font-bold font-mono px-2.5 py-0.5 rounded ${
                  predictionResult.status === 'FRAUD' 
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                    : predictionResult.status === 'REVIEW' 
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {predictionResult.status} ({predictionResult.predictedRiskScore.toFixed(2)})
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Latency: {predictionResult.inferenceLatencyMs}ms
                </span>
              </div>
              <div className="text-xs text-slate-300 flex items-center gap-2 flex-wrap">
                <span className="text-slate-500">Key Drivers:</span>
                {predictionResult.contributingFactors.map((f, i) => (
                  <span key={i} className="text-cyan-300 font-medium">· {f}</span>
                ))}
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[11px] text-slate-400 font-mono block">Evaluated by {predictionResult.modelUsed}</span>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
