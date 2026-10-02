import React from 'react';
import { X } from 'lucide-react';

export const TopFraudClusters: React.FC = () => {
  const clusters = [
    { id: 'CL-001', entities: 48, score: 0.92, isCrit: true },
    { id: 'CL-002', entities: 32, score: 0.87, isCrit: true },
    { id: 'CL-003', entities: 28, score: 0.79, isCrit: false },
    { id: 'CL-004', entities: 21, score: 0.74, isCrit: false },
    { id: 'CL-005', entities: 19, score: 0.68, isCrit: false }
  ];

  return (
    <div className="bg-[#0A0E18] border border-[#161E2E] rounded-xl p-3.5 flex flex-col justify-between shadow-sm h-full min-h-[220px]">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#161E2E]">
        <span className="text-xs font-bold text-white tracking-wide">
          Top Fraud Clusters
        </span>
        <X className="w-3 h-3 text-slate-500 hover:text-white cursor-pointer" />
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
            {clusters.map((c) => (
              <tr key={c.id} className="hover:bg-[#0E1422] transition-colors">
                <td className="py-1.5 font-mono text-[11px] text-slate-200">
                  {c.id}
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
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};
