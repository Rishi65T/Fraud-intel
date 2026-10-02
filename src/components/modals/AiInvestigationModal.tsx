import React from 'react';
import { AIPerformanceVerdict } from '../../services/api';
import { FraudEntity } from '../../types/fraud';
import { 
  Sparkles, 
  X, 
  CheckCircle, 
  AlertOctagon, 
  FileText
} from 'lucide-react';

interface AiInvestigationModalProps {
  entity: FraudEntity;
  verdict: AIPerformanceVerdict | null;
  isLoading: boolean;
  onClose: () => void;
  onCreateCase?: (title: string, summary: string) => void;
}

export const AiInvestigationModal: React.FC<AiInvestigationModalProps> = ({
  entity,
  verdict,
  isLoading,
  onClose,
  onCreateCase
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#0E131C] border border-[#1F2937] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1F2937] flex items-center justify-between bg-gradient-to-r from-purple-950/30 via-transparent to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-[#A78BFA]">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  AI Forensic Investigation Brief
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-[#A78BFA] border border-purple-500/30">
                  Gemini 3.8 Flash
                </span>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Target: {entity.id} ({entity.type}) · Base ML Risk: {entity.riskScore.toFixed(2)}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#121824] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-4 text-center">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-2 border-purple-500/20 border-t-purple-400 animate-spin" />
                <Sparkles className="w-5 h-5 text-purple-400 absolute inset-0 m-auto animate-pulse" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-white">Synthesizing Graph Forensic Signals...</h4>
                <p className="text-xs text-slate-400 max-w-sm">
                  Analyzing 48 neighbor hops, Mewat/Jamtara proxy routing, TreeSHAP attribution trees, and UPI velocity signatures.
                </p>
              </div>
            </div>
          ) : verdict ? (
            <>
              {/* Verdict Banner */}
              <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 flex items-start gap-3">
                <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-rose-400 uppercase tracking-wide">
                      {verdict.verdict}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      (Confidence: {(verdict.confidenceScore * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {verdict.executiveSummary}
                  </p>
                </div>
              </div>

              {/* Modus Operandi */}
              <div className="bg-[#121824] p-4 rounded-xl border border-[#1F2937] space-y-1.5">
                <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                  Criminal Modus Operandi
                </span>
                <p className="text-slate-200 text-xs leading-relaxed">
                  {verdict.modusOperandi}
                </p>
              </div>

              {/* Primary Evidence Signals */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                  Data-Backed Signals & Anomalies
                </span>
                <div className="space-y-1.5">
                  {verdict.primarySignals.map((signal, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-[#151E2C] border border-[#1F2937]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] shrink-0 mt-1.5" />
                      <span className="text-slate-200 text-xs">{signal}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Network Topology Insight */}
              <div className="bg-[#121824] p-4 rounded-xl border border-[#1F2937] space-y-1.5">
                <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                  Graph Centrality & Cluster Insight
                </span>
                <p className="text-slate-300 text-xs leading-relaxed">
                  {verdict.networkTopologyInsight}
                </p>
              </div>

              {/* Recommended Actions */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                  Recommended Analyst Next Steps
                </span>
                <div className="space-y-1.5">
                  {verdict.recommendedActions.map((action, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-emerald-300">
                      <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                      <span className="text-xs">{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-3.5 bg-[#080B12] border-t border-[#1F2937] flex items-center justify-between">
          <div className="text-[11px] text-slate-400 font-mono">
            FIU-IND STR Ready · Section 102 CrPC Audit Trail
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-[#1F2937] text-slate-300 hover:text-white hover:bg-[#121824] transition-colors"
            >
              Dismiss
            </button>

            {onCreateCase && verdict && (
              <button
                onClick={() => {
                  onCreateCase(
                    `Investigation on ${entity.id} - ${verdict.verdict}`,
                    verdict.executiveSummary
                  );
                  onClose();
                }}
                className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-xs shadow-lg transition-all flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Promote to Formal Case</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
