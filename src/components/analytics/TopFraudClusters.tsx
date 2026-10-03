import React, { useState, useEffect } from 'react';
import { X, Network, ArrowUpRight, RefreshCw } from 'lucide-react';

interface TopFraudClustersProps {
  onSelectCluster?: (clusterId: string) => void;
}

interface FormattedCluster {
  id: string;
  name: string;
  entities: number;
  score: number;
  isCrit: boolean;
}

export const TopFraudClusters: React.FC<TopFraudClustersProps> = ({
  onSelectCluster
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeCluster, setActiveCluster] = useState<string | null>(null);
  const [clusters, setClusters] = useState<FormattedCluster[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchClusters = async () => {
    try {
      const res = await fetch('/api/clusters');
      if (res.ok) {
        const rawData = await res.json();
        if (Array.isArray(rawData) && rawData.length > 0) {
          const mapped: FormattedCluster[] = rawData.slice(0, 5).map((c: any, idx: number) => {
            const score = typeof c.risk_score === 'number' 
              ? c.risk_score 
              : (typeof c.score === 'number' ? c.score : 0.85);
            return {
              id: c.cluster_id || c.id || `CL-00${idx + 1}`,
              name: c.name || `Syndicate Cluster ${idx + 1}`,
              entities: c.member_count || c.entities || (c.members ? c.members.length : 24),
              score: Math.min(score, 0.99),
              isCrit: score >= 0.85
            };
          });
          setClusters(mapped);
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn("Failed to fetch live clusters:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchClusters();
  }, []);

  const handleClusterClick = (c: FormattedCluster) => {
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
          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            GRAPH LOUVAIN
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={fetchClusters}
            className="text-slate-400 hover:text-white transition-colors"
            title="Refresh clusters"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin text-[#38BDF8]' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            className="text-slate-500 hover:text-white transition-colors"
            title="Minimize Clusters"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
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
