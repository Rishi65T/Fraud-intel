import React, { useState } from 'react';
import { Settings, ShieldCheck, Sliders, Save } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [fraudThreshold, setFraudThreshold] = useState(0.80);
  const [reviewThreshold, setReviewThreshold] = useState(0.50);
  const [autoFreezeHighRisk, setAutoFreezeHighRisk] = useState(true);
  const [torImmediateFlag, setTorImmediateFlag] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1F2937]">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#38BDF8]" />
            <span>Platform Settings & Risk Engine Configuration</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Calibrate Indian banking decision boundaries, automated Section 102 CrPC freezes, and FIU-IND alerting
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 bg-[#38BDF8] hover:bg-[#0284C7] text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{isSaved ? 'Thresholds Updated!' : 'Save Changes'}</span>
        </button>
      </div>

      {/* Threshold Sliders */}
      <div className="bg-[#0E131C] rounded-xl border border-[#1F2937] p-5 space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <span>Decision Boundary Thresholds</span>
        </h3>

        <div className="space-y-4 pt-2">
          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1.5">
              <span>Automatic Fraud / Intercept Threshold</span>
              <span className="font-mono font-bold text-rose-400">{fraudThreshold.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.60"
              max="0.95"
              step="0.01"
              value={fraudThreshold}
              onChange={(e) => setFraudThreshold(parseFloat(e.target.value))}
              className="w-full accent-rose-500"
            />
            <span className="text-[11px] text-slate-400">UPI/IMPS transactions with score ≥ {fraudThreshold.toFixed(2)} are immediately blocked and queued for FIU-IND STR generation.</span>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1.5">
              <span>Manual Analyst Review Threshold</span>
              <span className="font-mono font-bold text-amber-400">{reviewThreshold.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.30"
              max="0.65"
              step="0.01"
              value={reviewThreshold}
              onChange={(e) => setReviewThreshold(parseFloat(e.target.value))}
              className="w-full accent-amber-500"
            />
            <span className="text-[11px] text-slate-400">Transactions between {reviewThreshold.toFixed(2)} and {fraudThreshold.toFixed(2)} trigger human investigator verification.</span>
          </div>
        </div>
      </div>

      {/* Policy Enforcement Flags */}
      <div className="bg-[#0E131C] rounded-xl border border-[#1F2937] p-5 space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Automated Policy Enforcement Rules</span>
        </h3>

        <div className="space-y-3 pt-1 text-xs">
          <label className="flex items-center justify-between p-3 rounded-lg bg-[#121824] border border-[#1F2937] cursor-pointer">
            <div>
              <span className="font-medium text-white block">Auto-Freeze High-Risk Account Settlement Rails</span>
              <span className="text-[11px] text-slate-400">Lock outbound UPI, IMPS, and debit card rails when risk score &gt; 0.90 for &gt; 3 transactions</span>
            </div>
            <input
              type="checkbox"
              checked={autoFreezeHighRisk}
              onChange={(e) => setAutoFreezeHighRisk(e.target.checked)}
              className="w-4 h-4 rounded text-[#38BDF8] focus:ring-0"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-lg bg-[#121824] border border-[#1F2937] cursor-pointer">
            <div>
              <span className="font-medium text-white block">Instant Flag on Mewat & Jamtara Proxy Blocks</span>
              <span className="text-[11px] text-slate-400">Apply automatic +0.35 risk penalty for ISP ASN addresses flagged in known cybercrime corridors</span>
            </div>
            <input
              type="checkbox"
              checked={torImmediateFlag}
              onChange={(e) => setTorImmediateFlag(e.target.checked)}
              className="w-4 h-4 rounded text-[#38BDF8] focus:ring-0"
            />
          </label>
        </div>
      </div>

    </div>
  );
};
