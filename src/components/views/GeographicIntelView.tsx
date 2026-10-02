import React from 'react';
import { GeographicRiskNode, GeographicRoute } from '../../types/fraud';
import { GlobalFraudGlobe } from '../3d/GlobalFraudGlobe';
import { Globe2, Navigation, MapPin } from 'lucide-react';

interface GeographicIntelViewProps {
  nodes: GeographicRiskNode[];
  routes: GeographicRoute[];
  onSelectLocation?: (node: GeographicRiskNode) => void;
}

export const GeographicIntelView: React.FC<GeographicIntelViewProps> = ({
  nodes,
  routes,
  onSelectLocation
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1F2937]">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Globe2 className="w-5 h-5 text-[#38BDF8]" />
            <span>Pan-India Fraud Intelligence & Inter-State Mule Vectors</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Inter-state financial crime velocity, impossible travel anomalies, and domestic UPI mule dispersion across Indian states
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-medium">
            8 Monitored Indian State Hubs
          </span>
        </div>
      </div>

      {/* Hero 3D Globe + Regional Hotspots Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Expanded 3D Globe */}
        <div className="lg:col-span-7 bg-[#0E131C] rounded-xl border border-[#1F2937] p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Real-Time Threat Globe (India Center)
            </span>
            <span className="text-[10px] font-mono text-emerald-400">WebGL 3D Active</span>
          </div>

          <div className="h-[360px] w-full my-2">
            <GlobalFraudGlobe />
          </div>

          <div className="text-xs text-slate-400 pt-3 border-t border-[#1F2937] flex items-center justify-between">
            <span>Primary Attack Corridor: Jamtara & Mewat → Mumbai & Bengaluru Hubs</span>
            <span className="font-mono text-rose-400">842 Blocked UPI Wires Today</span>
          </div>
        </div>

        {/* Right: Cross-Border Route Matrix */}
        <div className="lg:col-span-5 bg-[#0E131C] rounded-xl border border-[#1F2937] p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Inter-State Smurfing Corridors
            </span>
            <span className="text-[10px] font-mono text-slate-400">Mule Volume (₹)</span>
          </div>

          <div className="space-y-2.5 my-2">
            {routes.map(r => (
              <div
                key={r.id}
                className="p-3 rounded-lg bg-[#121824] border border-[#1F2937] flex items-center justify-between text-xs hover:border-[#38BDF8]/40 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Navigation className="w-3.5 h-3.5 text-cyan-400 rotate-45" />
                  <span className="font-semibold text-white">{r.fromName}</span>
                  <span className="text-slate-500">→</span>
                  <span className="font-semibold text-slate-200">{r.toName}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-slate-200 tabular-nums font-semibold">
                    ₹{(r.volume / 100000).toFixed(1)}L
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                    r.riskLevel === 'High' ? 'bg-rose-500/15 border-rose-500/40 text-rose-400' : 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                  }`}>
                    {r.riskLevel}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-lg bg-[#080B12] border border-[#1F2937] text-[11px] text-slate-300">
            <strong>Indian Banking Anomaly Rule:</strong> Flags customer credentials utilized across two geographic locations with physical transit speed &gt; 800 km/h (e.g. Mumbai ATM followed by Kolkata login within 15 minutes).
          </div>
        </div>

      </div>

      {/* Regional Hotspot Ranking Table */}
      <div className="bg-[#0E131C] rounded-xl border border-[#1F2937] p-5">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
          Pan-India Risk Hotspots Ranking
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1F2937] text-[10px] text-slate-400 uppercase tracking-wider">
                <th className="pb-2">City / Location</th>
                <th className="pb-2">State / Region</th>
                <th className="pb-2 text-center">Risk Tier</th>
                <th className="pb-2 text-right">Transactions</th>
                <th className="pb-2 text-right">Fraud Count</th>
                <th className="pb-2 text-right">Active Syndicates</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#151E2C]">
              {nodes.map(node => (
                <tr
                  key={node.id}
                  onClick={() => onSelectLocation && onSelectLocation(node)}
                  className="hover:bg-[#121824] cursor-pointer transition-colors"
                >
                  <td className="py-2.5 font-semibold text-white flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{node.name}</span>
                  </td>
                  <td className="py-2.5 text-slate-300 font-medium">
                    {node.country}
                  </td>
                  <td className="py-2.5 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                      node.riskLevel === 'High'
                        ? 'bg-rose-500/15 border-rose-500/40 text-rose-400'
                        : node.riskLevel === 'Medium'
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                        : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                    }`}>
                      {node.riskLevel} ({node.riskScore.toFixed(2)})
                    </span>
                  </td>
                  <td className="py-2.5 text-right font-mono text-slate-300 tabular-nums">
                    {node.transactionCount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-2.5 text-right font-mono text-rose-400 font-bold tabular-nums">
                    {node.fraudCount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-2.5 text-right font-mono text-purple-400 font-semibold tabular-nums">
                    {node.activeSyndicates} rings
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
