import React, { useState } from 'react';
import { FraudCluster } from '../../types/fraud';
import { Network, Share2 } from 'lucide-react';

interface ClustersViewProps {
  clusters: FraudCluster[];
  onSelectCluster: (cluster: FraudCluster) => void;
  onInspectInGraph: (clusterId: string) => void;
}

export const ClustersView: React.FC<ClustersViewProps> = ({
  clusters,
  onSelectCluster,
  onInspectInGraph
}) => {
  const [selectedClusterId, setSelectedClusterId] = useState<string>(clusters[0]?.id || '');

  const activeCluster = clusters.find(c => c.id === selectedClusterId) || clusters[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1F2937]">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Network className="w-5 h-5 text-[#38BDF8]" />
            <span>Fraud Syndicate Cluster Discovery</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Graph community detection identifying organized Indian UPI phishing rings and mule account networks
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30 font-medium">
            37 Total Active Clusters Discovered
          </span>
        </div>
      </div>

      {/* Main Grid: Clusters List + Cluster Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Cluster Cards */}
        <div className="lg:col-span-5 space-y-3">
          {clusters.map(cl => {
            const isSelected = cl.id === selectedClusterId;
            const isCrit = cl.riskScore >= 0.85;

            return (
              <div
                key={cl.id}
                onClick={() => setSelectedClusterId(cl.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#151E2C] border-[#38BDF8] shadow-[0_0_18px_rgba(56,189,248,0.25)]'
                    : 'bg-[#0E131C] border-[#1F2937] hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-rose-400">{cl.id}</span>
                    <span className="text-xs font-semibold text-white">{cl.name}</span>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                    isCrit ? 'bg-rose-500/15 border-rose-500/40 text-rose-400' : 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                  }`}>
                    {cl.riskScore.toFixed(2)}
                  </span>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                  {cl.description}
                </p>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#1F2937] text-[11px] font-mono">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Entities</span>
                    <span className="text-white font-bold">{cl.entitiesCount}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Mule Volume</span>
                    <span className="text-cyan-400 font-bold">
                      ₹{(cl.totalVolume / 100000).toFixed(1)}L
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Status</span>
                    <span className="text-emerald-400 font-bold">{cl.status}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Active Cluster Breakdown */}
        {activeCluster && (
          <div className="lg:col-span-7 bg-[#0E131C] rounded-xl border border-[#1F2937] p-6 space-y-6">
            
            <div className="flex items-start justify-between pb-4 border-b border-[#1F2937]">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white tracking-tight">{activeCluster.name}</h3>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    {activeCluster.id}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Pattern Signature: <strong className="text-cyan-400 font-medium">{activeCluster.pattern}</strong>
                </div>
              </div>

              <button
                onClick={() => onInspectInGraph(activeCluster.id)}
                className="px-4 py-2 bg-[#1E40AF] hover:bg-[#2563EB] text-white text-xs font-medium rounded-xl flex items-center gap-1.5 shadow-md transition-all active:scale-95"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Isolate in 3D Graph</span>
              </button>
            </div>

            {/* Topology Breakdown Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-[#121824] p-3 rounded-xl border border-[#1F2937]">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Accounts</span>
                <span className="text-xl font-bold font-mono text-white mt-1 block">{activeCluster.accountsCount}</span>
                <span className="text-[10px] text-slate-500">Mule Bank Nodes</span>
              </div>
              <div className="bg-[#121824] p-3 rounded-xl border border-[#1F2937]">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Devices</span>
                <span className="text-xl font-bold font-mono text-purple-400 mt-1 block">{activeCluster.devicesCount}</span>
                <span className="text-[10px] text-slate-500">Hooked Emulators</span>
              </div>
              <div className="bg-[#121824] p-3 rounded-xl border border-[#1F2937]">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Merchants</span>
                <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block">{activeCluster.merchantsCount}</span>
                <span className="text-[10px] text-slate-500">Gateways & Offramps</span>
              </div>
              <div className="bg-[#121824] p-3 rounded-xl border border-[#1F2937]">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Transactions</span>
                <span className="text-xl font-bold font-mono text-rose-400 mt-1 block">{activeCluster.transactionsCount}</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  ₹{activeCluster.totalVolume.toLocaleString('en-IN')} Total
                </span>
              </div>
            </div>

            {/* Pattern Narrative */}
            <div className="bg-[#121824] p-4 rounded-xl border border-[#1F2937] space-y-2">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Syndicate Behavioral Pattern Analysis
              </span>
              <p className="text-xs text-slate-200 leading-relaxed">
                {activeCluster.description}
              </p>
              <div className="text-[11px] text-slate-400 pt-2 border-t border-[#1F2937]">
                First detected {activeCluster.detectedTime} via Indian Banking GraphSAGE GNN modularity analysis.
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <span className="text-xs text-slate-400">Recommended action: Apply Section 102 CrPC debit freeze on linked accounts.</span>
              <button
                onClick={() => onSelectCluster(activeCluster)}
                className="px-3.5 py-2 rounded-lg bg-[#151E2C] hover:bg-[#1A2434] text-slate-200 border border-[#1F2937] text-xs font-medium transition-colors"
              >
                Inspect Associated Accounts
              </button>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
