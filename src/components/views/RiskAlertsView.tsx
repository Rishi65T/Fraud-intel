import React, { useState } from 'react';
import { RiskAlert } from '../../types/fraud';
import { 
  BellRing, 
  ShieldAlert, 
  CheckCircle, 
  Search, 
  SlidersHorizontal, 
  ArrowRight,
  ExternalLink,
  UserCheck
} from 'lucide-react';

interface RiskAlertsViewProps {
  alerts: RiskAlert[];
  onSelectEntity: (entityId: string) => void;
  onResolveAlert: (alertId: string) => void;
  onAssignAlert: (alertId: string, analyst: string) => void;
}

export const RiskAlertsView: React.FC<RiskAlertsViewProps> = ({
  alerts,
  onSelectEntity,
  onResolveAlert,
  onAssignAlert
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  const filtered = alerts.filter(a => {
    if (filterSeverity !== 'ALL' && a.severity !== filterSeverity) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        a.id.toLowerCase().includes(q) ||
        a.entityId.toLowerCase().includes(q) ||
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#202938]">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <BellRing className="w-5 h-5 text-[#ef4444]" />
            <span>Real-Time Risk Alerts Center</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Active behavioral anomalies, threshold alerts, and high-velocity syndicate triggers
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2 text-xs">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search alerts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#121923] border border-[#202938] rounded-lg pl-8 pr-3 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#38bdf8]"
            />
          </div>

          <div className="flex items-center gap-1 bg-[#121923] p-1 rounded-lg border border-[#202938]">
            {['ALL', 'Critical', 'High', 'Medium'].map(sev => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  filterSeverity === sev
                    ? 'bg-[#38bdf8] text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts Grid */}
      <div className="space-y-3">
        {filtered.map(alert => {
          const isCrit = alert.severity === 'Critical';
          const isHigh = alert.severity === 'High';

          return (
            <div
              key={alert.id}
              className="bg-[#0e131c] border border-[#202938] hover:border-[#38bdf8]/50 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all shadow-md group"
            >
              <div className="flex items-start gap-3 flex-1">
                <div className={`p-2 rounded-xl mt-0.5 ${isCrit ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' : isHigh ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'}`}>
                  <ShieldAlert className="w-5 h-5" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-white text-sm">{alert.title}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                      isCrit
                        ? 'bg-rose-500/15 border-rose-500/40 text-rose-400'
                        : isHigh
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                        : 'bg-cyan-500/15 border-cyan-500/40 text-cyan-400'
                    }`}>
                      {alert.severity} ({alert.riskScore.toFixed(2)})
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">ID: {alert.id}</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                    {alert.description}
                  </p>

                  <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                    <span>Target: <button onClick={() => onSelectEntity(alert.entityId)} className="font-mono text-cyan-400 hover:underline font-semibold">{alert.entityId}</button></span>
                    <span>·</span>
                    <span>Triggered: {alert.timeAgo}</span>
                    <span>·</span>
                    <span>Assigned: <strong className="text-slate-200">{alert.assignedAnalyst || 'Unassigned'}</strong></span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <button
                  onClick={() => onSelectEntity(alert.entityId)}
                  className="px-3 py-1.5 rounded-lg bg-[#151d29] hover:bg-[#1a2535] text-cyan-400 border border-[#202938] hover:border-cyan-500/40 text-xs font-medium flex items-center gap-1.5 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Inspect in 3D</span>
                </button>

                <button
                  onClick={() => onResolveAlert(alert.id)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center gap-1.5 transition-all"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Resolve</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
