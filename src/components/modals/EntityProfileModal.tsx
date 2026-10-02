import React, { useState } from 'react';
import { FraudEntity, Transaction } from '../../types/fraud';
import { 
  X, 
  CreditCard, 
  Lock, 
  FileText, 
  CheckCircle
} from 'lucide-react';

interface EntityProfileModalProps {
  entity: FraudEntity;
  transactions: Transaction[];
  onClose: () => void;
  onRunAiInvestigation: (entity: FraudEntity) => void;
}

export const EntityProfileModal: React.FC<EntityProfileModalProps> = ({
  entity,
  transactions,
  onClose,
  onRunAiInvestigation
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'transactions' | 'relationships' | 'compliance'>('profile');
  const [isFrozen, setIsFrozen] = useState(false);
  const [strSubmitted, setStrSubmitted] = useState(false);

  const relatedTxns = transactions.filter(t => t.accountId === entity.id || t.id === entity.id);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-3xl bg-[#0E131C] border border-[#1F2937] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#1F2937] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-[#38BDF8]">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white font-mono">{entity.id}</h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                  entity.riskScore >= 0.8 
                    ? 'bg-rose-500/15 border-rose-500/40 text-rose-400' 
                    : 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                }`}>
                  {entity.riskCategory} Risk ({entity.riskScore.toFixed(2)})
                </span>
                {isFrozen && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500 text-white font-bold">
                    FROZEN (SEC 102)
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-400">{entity.name} · {entity.type}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#121824] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-2 border-b border-[#1F2937] flex items-center gap-6 text-xs font-medium">
          {[
            { id: 'profile', label: 'Overview & Attributes' },
            { id: 'transactions', label: `Transaction History (${relatedTxns.length})` },
            { id: 'relationships', label: 'Network & Cluster Links' },
            { id: 'compliance', label: 'FIU-IND & Regulatory Actions' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`pb-3 transition-colors relative ${
                activeTab === tab.id
                  ? 'text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#38BDF8] shadow-[0_0_8px_#38BDF8]" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs text-slate-300">
          
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#121824] p-3 rounded-xl border border-[#1F2937]">
                  <span className="text-[10px] text-slate-400 block">Total Transacted</span>
                  <span className="text-lg font-bold font-mono text-white mt-1 block">
                    ₹{(entity.details.totalAmount || 1284300).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="bg-[#121824] p-3 rounded-xl border border-[#1F2937]">
                  <span className="text-[10px] text-slate-400 block">Transactions</span>
                  <span className="text-lg font-bold font-mono text-cyan-400 mt-1 block">
                    {entity.details.totalTransactions || 243}
                  </span>
                </div>
                <div className="bg-[#121824] p-3 rounded-xl border border-[#1F2937]">
                  <span className="text-[10px] text-slate-400 block">Linked Devices</span>
                  <span className="text-lg font-bold font-mono text-purple-400 mt-1 block">
                    {entity.details.linkedDevices || 4}
                  </span>
                </div>
                <div className="bg-[#121824] p-3 rounded-xl border border-[#1F2937]">
                  <span className="text-[10px] text-slate-400 block">Mewat / Proxy IPs</span>
                  <span className="text-lg font-bold font-mono text-rose-400 mt-1 block">
                    {entity.details.linkedIps || 6}
                  </span>
                </div>
              </div>

              {/* Attributes Table */}
              <div className="bg-[#121824] p-4 rounded-xl border border-[#1F2937] space-y-2">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Identity & Telemetry Metadata
                </span>
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                  <div><span className="text-slate-500">Customer ID:</span> <span className="font-mono text-cyan-400 ml-1">{entity.details.customerId || 'CUST-4481'}</span></div>
                  <div><span className="text-slate-500">Account Type:</span> <span className="text-slate-200 ml-1">{entity.details.accountType || 'Savings (HDFC Bank)'}</span></div>
                  <div><span className="text-slate-500">Email:</span> <span className="text-slate-200 ml-1 font-mono">{entity.details.email || 'rohan.sharma***@gmail.com'}</span></div>
                  <div><span className="text-slate-500">Phone:</span> <span className="text-slate-200 ml-1 font-mono">{entity.details.phone || '+91 98201 84920'}</span></div>
                  <div><span className="text-slate-500">Created Date:</span> <span className="text-slate-200 ml-1">{entity.details.createdDate || '2024-03-12'}</span></div>
                  <div><span className="text-slate-500">Last Activity:</span> <span className="text-slate-200 ml-1">{entity.details.lastActive || '2 mins ago'}</span></div>
                </div>
              </div>

              {/* SHAP Feature Importances */}
              {entity.shapValues && (
                <div>
                  <span className="text-xs font-bold text-white uppercase tracking-wider block mb-2">
                    Model Risk Explanations (TreeSHAP)
                  </span>
                  <div className="space-y-2">
                    {entity.shapValues.map((s, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-[#121824] border border-[#1F2937]">
                        <span className="text-slate-200 font-medium">{s.factor}</span>
                        <span className="font-mono font-bold text-rose-400">+{s.impact}% Risk Contribution</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="space-y-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">
                Recent Transaction Events
              </span>
              <div className="divide-y divide-[#182232] border border-[#1F2937] rounded-xl overflow-hidden bg-[#121824]">
                {relatedTxns.map(t => (
                  <div key={t.id} className="p-3 flex items-center justify-between text-xs hover:bg-[#151E2C]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white">{t.id}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          t.status === 'FRAUD' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {t.status}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">{t.merchant} · {t.location} · {t.timeAgo}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-bold font-mono text-white block">
                        ₹{t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-[10px] text-rose-400 font-mono">Score: {t.riskScore.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'relationships' && (
            <div className="space-y-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">
                Graph Centrality & Connected Entities
              </span>
              <div className="p-4 rounded-xl bg-[#121824] border border-[#1F2937] space-y-2 text-xs">
                <p className="text-slate-200">
                  ACC-78291 serves as the hub account in <strong>Jamtara UPI Phishing & Mule Ring (Cluster CL-001)</strong>.
                </p>
                <div className="pt-2 text-slate-400 space-y-1">
                  <div>· Connected to 4 rooted OnePlus emulators (DEV-9921, DEV-1044, DEV-5541, DEV-3209)</div>
                  <div>· Connected to 6 Mewat / Jamtara proxy nodes (103.212.144.18)</div>
                  <div>· 12 unique Indian e-commerce merchants receiving rapid micro-authorizations</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'compliance' && (
            <div className="space-y-4">
              <div className="bg-rose-950/20 border border-rose-500/30 p-4 rounded-xl space-y-2">
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block">
                  Regulatory Actions & FIU-IND STR Filing
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Financial Intelligence Unit - India (FIU-IND) PMLA guidelines require filing a Suspicious Transaction Report (STR) within 7 days of confirming syndicate layering under Section 102 CrPC.
                </p>
                {strSubmitted && (
                  <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>FIU-IND STR Package #STR-IND-2026-9042 successfully drafted and submitted to National Cybercrime Reporting Portal (1930 Helpline).</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setStrSubmitted(true)}
                  disabled={strSubmitted}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 shadow-md hover:from-purple-500 hover:to-indigo-500 transition-all"
                >
                  <FileText className="w-4 h-4" />
                  <span>{strSubmitted ? 'STR Submitted' : 'File STR with FIU-IND (1930 Helpline)'}</span>
                </button>

                <button
                  onClick={() => setIsFrozen(!isFrozen)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 border transition-all ${
                    isFrozen
                      ? 'bg-rose-600 border-rose-500 text-white'
                      : 'bg-[#121824] border-[#1F2937] text-rose-400 hover:bg-rose-950/30'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  <span>{isFrozen ? 'Account Frozen under Sec 102 (Unfreeze)' : 'Immediate Debit Freeze (Sec 102 CrPC)'}</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-[#080B12] border-t border-[#1F2937] flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-mono">
            Audit Trail ID: #AUD-78291-V4 · Encrypted Record
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onRunAiInvestigation(entity)}
              className="px-4 py-1.5 rounded-lg bg-[#A78BFA]/20 border border-[#A78BFA]/40 text-[#A78BFA] hover:bg-[#A78BFA]/30 font-medium text-xs transition-colors flex items-center gap-1.5"
            >
              <span>AI Forensic Synthesis</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-[#38BDF8] text-slate-950 font-bold hover:bg-[#0284C7] text-xs transition-colors"
            >
              Done
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
