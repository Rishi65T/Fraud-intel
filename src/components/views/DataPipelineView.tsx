import React from 'react';
import { Database, CheckCircle, ArrowDown } from 'lucide-react';

export const DataPipelineView: React.FC = () => {
  const datasets = [
    {
      name: 'NPCI UPI Real-Time Fraud Benchmark',
      records: '1,420,000 transactions',
      fraudRatio: '0.168% (2,385 positive cases)',
      features: 'Time, Amount (₹), VPA Velocity, SIM Binding Trust, IFSC, Device Fingerprint',
      status: 'Ingested & Normalized',
      target: 'Class (0 = Clean, 1 = Fraud / Intercept)',
      source: 'National Payments Corporation of India (NPCI) Benchmark'
    },
    {
      name: 'RBI Digital Payment Risk Stream (IMPS/NEFT)',
      records: '850,000 transactions',
      fraudRatio: '0.142% (1,207 positive cases)',
      features: 'step, type, amount, payerVpa, payeeVpa, oldBalance, newBalance, terminalId',
      status: 'Ingested & Normalized',
      target: 'isFraud, isFlaggedFraud',
      source: 'Reserve Bank of India (RBI) Stream Corpus'
    },
    {
      name: 'I4C Indian Cybercrime Heterogeneous Graph',
      records: '1,200,000 nodes & 2,840,000 edges',
      fraudRatio: '1.8% illicit mule, 24% licit, 74.2% unlabelled',
      features: '166 graph & local features (2-hop mule neighbor, Louvain modularity)',
      status: 'Ingested & Linked to GraphSAGE GNN',
      target: 'class (1 = mule syndicate, 2 = clean)',
      source: 'Indian Cybercrime Coordination Centre (I4C / MHA)'
    }
  ];

  const pipelineStages = [
    { title: 'Raw Dataset Ingestion', desc: 'Batch ingestion from Kafka payment stream and S3 parquet buckets with strict schema validation.' },
    { title: 'Data Cleaning & Normalization', desc: 'Missing value imputation, Winsorization of extreme transaction amounts in ₹, and timestamp alignment.' },
    { title: 'Feature Engineering Engine', desc: 'Rolling 1h/24h/7d UPI velocity counts, Mahalanobis distances, Mewat/Jamtara proxy lookups, device entropy.' },
    { title: 'Graph Topology Synthesis', desc: 'Constructing PyTorch Geometric heterogeneous graphs connecting Account, Device, Merchant, and IP nodes.' },
    { title: 'Stratified Train / Val / Test Split', desc: 'Strict time-series out-of-time validation splits preventing future data leakage.' },
    { title: 'Model Training & Hyperparameter Tuning', desc: 'Bayesian optimization of XGBoost trees and GraphSAGE message-passing layers.' },
    { title: 'Explainability & TreeSHAP Precomputation', desc: 'Global feature importance and per-transaction local SHAP attribution caching in Redis.' },
    { title: 'Real-Time Inference Serving', desc: 'Sub-4ms P99 latency risk evaluation over REST and WebSocket endpoints in FraudIntel.' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1F2937]">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Database className="w-5 h-5 text-[#38BDF8]" />
            <span>Data Ingestion & ML Feature Pipeline</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Documented schemas, feature transformations, and automated end-to-end MLOps pipeline for Indian payment rails
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-medium">
            Pipeline Health: 100% Operational
          </span>
        </div>
      </div>

      {/* Datasets Section */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
          Ingested Ground-Truth Training Corpora
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {datasets.map((d, i) => (
            <div key={i} className="bg-[#0E131C] rounded-xl border border-[#1F2937] p-4 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    {d.status}
                  </span>
                  <span className="text-[11px] font-mono text-cyan-400 font-bold">{d.records}</span>
                </div>
                <h4 className="text-sm font-bold text-white">{d.name}</h4>
                <p className="text-xs text-slate-400 mt-1">Imbalance: {d.fraudRatio}</p>
                <div className="text-[11px] text-slate-300 bg-[#121824] p-2.5 rounded-lg border border-[#1F2937] mt-2 font-mono">
                  {d.features}
                </div>
              </div>
              <div className="text-[10px] text-slate-500 pt-2 border-t border-[#1F2937]">
                Source: {d.source}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pipeline Diagram */}
      <div className="bg-[#0E131C] rounded-xl border border-[#1F2937] p-6 space-y-5">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
          End-to-End MLOps Pipeline Flow
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {pipelineStages.map((stage, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-[#121824] border border-[#1F2937] flex flex-col justify-between space-y-2 relative">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-cyan-400 font-bold">STAGE 0{idx + 1}</span>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <h4 className="text-xs font-bold text-white">{stage.title}</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  {stage.desc}
                </p>
              </div>
              {idx < pipelineStages.length - 1 && (
                <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10">
                  <div className="w-4 h-4 rounded-full bg-[#151E2C] border border-[#1F2937] flex items-center justify-center">
                    <ArrowDown className="w-2.5 h-2.5 text-slate-400 -rotate-90" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
