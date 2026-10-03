import React, { useState } from 'react';
import { X, Network, ArrowUpRight } from 'lucide-react';

interface TopFraudClustersProps {
  onSelectCluster?: (clusterId: string) => void;
}

export const TopFraudClusters: React.FC<TopFraudClustersProps> = ({
  onSelectCluster
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeCluster, setActiveCluster] = useState<string | null>(null);

  const clusters = [
    { id: 'CL-001', entities: 48, score: 0.92, isCrit: true },
    { id: 'CL-002', entities: 32, score: 0.87, isCrit: true },
    { id: 'CL-003', entities: 28, score: 0.79, isCrit: false },
    { id: 'CL-004', entities: 21, score: 0.74, isCrit: false },
    { id: 'CL-005', entities: 19, score: 0.68, isCrit: false }
  ];

  const handleClusterClick = (c: typeof clusters[0]) => {
    setActiveCluster(c.id);
    if (onSelectCluster) {
      onSelectCluster(c.id);
    }
  };

  if (isMinimized) {
    return (
      <div className="bg-[#0A0E18] border border-[#161E2E] rounded-xl p-3 shadow-sm flex items-center justify-between">
        <span className="text-xs font-bold text-white tracking-wide">Top Fraud Clusters (Minimized)</span>
        <button
          onClick={() => setIsMinimized(false)}
          className="text-xs text-[#38BDF8] hover:underline"
        >
          Expand
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#0A0E18] border border-[#161E2E] rounded-xl p-3.5 flex flex-col justify-between shadow-sm h-full min-h-[220px] select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#161E2E]">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-white tracking-wide">
            Top Fraud Clusters
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsMinimized(true)}
          className="text-slate-500 hover:text-white transition-colors"
          title="Minimize Clusters"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {/* Table matching screenshot */}
      <div className="w-full flex-1 my-1">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-[10px] text-slate-500 border-b border-[#161E2E]">
              <th className="pb-1.5 font-medium">Cluster ID</th>
              <th className="pb-1.5 font-medium text-center">Entities</th>
              <th className="pb-1.5 font-medium text-right">Risk Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#121826]">
            {clusters.map((c) => {
              const isSelected = activeCluster === c.id;
              return (
                <tr 
                  key={c.id} 
                  onClick={() => handleClusterClick(c)}
                  className={`cursor-pointer transition-colors ${
                    isSelected ? 'bg-[#141C2E]' : 'hover:bg-[#0E1422]'
                  }`}
                >
                  <td className="py-1.5 font-mono text-[11px] text-slate-200 flex items-center gap-1">
                    <span>{c.id}</span>
                    <ArrowUpRight className="w-2.5 h-2.5 text-slate-500 opacity-60" />
                  </td>
                  <td className="py-1.5 font-mono text-[11px] text-slate-300 text-center">
                    {c.entities}
                  </td>
                  <td className="py-1.5 text-right">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      c.isCrit 
                        ? 'bg-rose-500/20 text-[#EF4444] border border-rose-500/30' 
                        : 'bg-amber-500/20 text-[#F59E0B] border border-amber-500/30'
                    }`}>
                      {c.score.toFixed(2)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
};
