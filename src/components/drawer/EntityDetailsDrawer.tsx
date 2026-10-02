import React, { useState } from 'react';
import { FraudEntity } from '../../types/fraud';
import { 
  X, 
  Sparkles, 
  ExternalLink, 
  ShieldAlert, 
  CreditCard, 
  Smartphone, 
  Globe2, 
  Store, 
  Server, 
  User, 
  MapPin,
  Clock,
  ArrowUpRight,
  Fingerprint
} from 'lucide-react';
import { AIPerformanceVerdict } from '../../services/api';

interface EntityDetailsDrawerProps {
  entity: FraudEntity | null;
  onClose: () => void;
  onOpenFullProfile: (entity: FraudEntity) => void;
  onRunAiInvestigation: (entity: FraudEntity) => void;
  aiVerdict?: AIPerformanceVerdict | null;
  isAiLoading?: boolean;
}

export const EntityDetailsDrawer: React.FC<EntityDetailsDrawerProps> = ({
  entity,
  onClose,
  onOpenFullProfile,
  onRunAiInvestigation,
  aiVerdict,
  isAiLoading
}) => {
  if (!entity) return null;

  const getEntityIcon = () => {
    switch (entity.type) {
      case 'Customer': return <User className="w-4 h-4 text-[#38bdf8]" />;
      case 'Account': return <CreditCard className="w-4 h-4 text-[#ef4444]" />;
      case 'Device': return <Smartphone className="w-4 h-4 text-[#a78bfa]" />;
      case 'Transaction': return <ArrowUpRight className="w-4 h-4 text-[#f59e0b]" />;
      case 'Merchant': return <Store className="w-4 h-4 text-[#22c55e]" />;
      case 'IP Address': return <Server className="w-4 h-4 text-[#ef4444]" />;
      case 'Location': return <MapPin className="w-4 h-4 text-[#22d3ee]" />;
      default: return <Fingerprint className="w-4 h-4 text-[#38bdf8]" />;
    }
  };

  const isHighRisk = entity.riskScore >= 0.8;
  const isMediumRisk = entity.riskScore >= 0.5 && entity.riskScore < 0.8;

  return (
    <div className="w-[300px] xl:w-[320px] bg-[#0e131c] border border-[#202938] rounded-xl flex flex-col p-4 shadow-2xl relative text-xs animate-in fade-in slide-in-from-right duration-200">
      
      {/* Drawer Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#202938]">
        <div className="flex items-center gap-2">
          {getEntityIcon()}
          <span className="font-semibold text-slate-100 tracking-wide uppercase text-[11px]">
            {entity.type} Details
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-[#151d29] transition-colors"
          title="Close details"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Entity Identifier & Risk Badge */}
      <div className="py-3.5 flex items-center justify-between border-b border-[#202938]">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight font-mono">{entity.id}</h3>
          <span className="text-[11px] text-slate-400 truncate block max-w-[170px]">{entity.name}</span>
        </div>
        <div className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase border flex items-center gap-1.5 ${
          isHighRisk 
            ? 'bg-rose-500/15 border-rose-500/30 text-rose-400' 
            : isMediumRisk 
            ? 'bg-amber-500/15 border-amber-500/30 text-amber-400' 
            : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isHighRisk ? 'bg-rose-500' : isMediumRisk ? 'bg-amber-500' : 'bg-emerald-500'}`} />
          <span>{entity.riskCategory} Risk</span>
        </div>
      </div>

      {/* Contextual Metric Rows */}
      <div className="py-3 space-y-2.5 text-xs border-b border-[#202938]">
        {entity.details.accountType && (
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Account Type</span>
            <span className="text-slate-200 font-medium">{entity.details.accountType}</span>
          </div>
        )}
        {entity.details.customerId && (
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Customer ID</span>
            <span className="text-cyan-400 font-mono font-medium">{entity.details.customerId}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Risk Score</span>
          <span className={`font-mono font-bold text-sm tabular-nums ${isHighRisk ? 'text-[#ef4444]' : isMediumRisk ? 'text-[#f59e0b]' : 'text-[#22c55e]'}`}>
            {entity.riskScore.toFixed(2)}
          </span>
        </div>
        {entity.details.totalTransactions !== undefined && (
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Total Transactions</span>
            <span className="text-slate-200 font-mono tabular-nums">{entity.details.totalTransactions.toLocaleString()}</span>
          </div>
        )}
        {entity.details.totalAmount !== undefined && (
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Total Amount</span>
            <span className="text-slate-100 font-semibold font-mono tabular-nums">
              ₹{entity.details.totalAmount.toLocaleString('en-IN')}
            </span>
          </div>
        )}
        {entity.details.linkedDevices !== undefined && (
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Linked Devices</span>
            <span className="text-purple-400 font-mono font-semibold">{entity.details.linkedDevices}</span>
          </div>
        )}
        {entity.details.linkedIps !== undefined && (
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Linked IPs</span>
            <span className="text-rose-400 font-mono font-semibold">{entity.details.linkedIps}</span>
          </div>
        )}
        {entity.details.linkedMerchants !== undefined && (
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Linked Merchants</span>
            <span className="text-emerald-400 font-mono font-semibold">{entity.details.linkedMerchants}</span>
          </div>
        )}
        {entity.details.ipAddress && (
          <div className="flex items-center justify-between">
            <span className="text-slate-400">IP Host</span>
            <span className="text-rose-400 font-mono text-[11px]">{entity.details.ipAddress}</span>
          </div>
        )}
        {entity.details.deviceModel && (
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Hardware</span>
            <span className="text-slate-200 text-[11px] truncate max-w-[160px]">{entity.details.deviceModel}</span>
          </div>
        )}
        {entity.details.locationName && (
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Location</span>
            <span className="text-cyan-400 text-[11px]">{entity.details.locationName}</span>
          </div>
        )}
      </div>

      {/* SHAP Factor Impact Breakdown */}
      {entity.shapValues && entity.shapValues.length > 0 && (
        <div className="py-2.5 border-b border-[#202938]">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block mb-2">
            Top ML Risk Drivers
          </span>
          <div className="space-y-1.5">
            {entity.shapValues.slice(0, 3).map((item, i) => (
              <div key={i} className="flex items-center justify-between text-[11px]">
                <span className="text-slate-300 truncate max-w-[180px]">{item.factor}</span>
                <span className="text-[#ef4444] font-mono font-semibold tabular-nums">+{item.impact}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="pt-3 space-y-2 mt-auto">
        <button
          onClick={() => onOpenFullProfile(entity)}
          className="w-full py-2 px-3 bg-[#1d4ed8] hover:bg-[#2563eb] text-white font-medium rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-[0.98]"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>View Full Profile</span>
        </button>

        <button
          onClick={() => onRunAiInvestigation(entity)}
          disabled={isAiLoading}
          className="w-full py-2 px-3 bg-[#151d29] hover:bg-[#1a2433] text-[#a78bfa] border border-[#a78bfa]/30 hover:border-[#a78bfa] font-medium rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>{isAiLoading ? 'Synthesizing Forensic AI...' : 'Run AI Investigation'}</span>
        </button>
      </div>

    </div>
  );
};
