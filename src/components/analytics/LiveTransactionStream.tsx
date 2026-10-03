import React, { useState, useEffect } from 'react';
import { X, ArrowUpRight, RefreshCw } from 'lucide-react';

interface LiveTransactionStreamProps {
  onSelectEntity?: (id: string) => void;
  onOpenProfile?: () => void;
}

interface FormattedTxn {
  id: string;
  account: string;
  amount: string;
  merchant: string;
  location: string;
  risk: string;
  status: string;
  riskColor: string;
  badgeBg: string;
}

export const LiveTransactionStream: React.FC<LiveTransactionStreamProps> = ({
  onSelectEntity,
  onOpenProfile
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<FormattedTxn[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchLiveTransactions = async () => {
    try {
      const res = await fetch('/api/transactions?limit=8');
      if (res.ok) {
        const rawData = await res.json();
        if (Array.isArray(rawData) && rawData.length > 0) {
          const mapped: FormattedTxn[] = rawData.map((t: any) => {
            const score = typeof t.predicted_risk_score === 'number' 
              ? t.predicted_risk_score 
              : (typeof t.risk === 'number' ? t.risk : 0.05);
            
            const isFraud = score >= 0.70 || t.is_fraud === 1;
            const isReview = !isFraud && score >= 0.40;
            const statusStr = isFraud ? 'FRAUD' : isReview ? 'REVIEW' : 'CLEAN';

            const riskColor = isFraud 
              ? 'text-[#EF4444]' 
              : isReview 
                ? 'text-[#F59E0B]' 
                : 'text-[#38BDF8]';

            const badgeBg = isFraud
              ? 'bg-rose-500/20 text-[#EF4444] border-rose-500/30'
              : isReview
                ? 'bg-amber-500/20 text-[#F59E0B] border-amber-500/30'
                : 'bg-emerald-500/20 text-[#10B981] border-emerald-500/30';

            const formattedAmount = typeof t.amount === 'number'
              ? `₹${t.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
              : (t.amount || '₹0.00');

            return {
              id: t.transaction_id || t.id || 'TXN-UNKNOWN',
              account: t.account_id || t.customer_id || t.account || 'ACC-DEFAULT',
              amount: formattedAmount,
              merchant: t.merchant_name || t.merchant || 'Retail Gateway',
              location: t.location_city || t.location || 'India',
              risk: score.toFixed(2),
              status: statusStr,
              riskColor,
              badgeBg
            };
          });
          setTransactions(mapped);
          setLastUpdated(new Date().toLocaleTimeString());
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn("Live stream fetch notice:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLiveTransactions();
    const interval = setInterval(fetchLiveTransactions, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleRowClick = (t: FormattedTxn) => {
    setSelectedTxn(t.id);
    if (onSelectEntity) {
      onSelectEntity(t.account);
    }
    if (onOpenProfile) {
      onOpenProfile();
    }
  };

  if (isMinimized) {
    return (
      <div className="bg-[#0A0E18] border border-[#161E2E] rounded-xl p-3 shadow-sm flex items-center justify-between">
        <span className="text-xs font-bold text-white tracking-wide">Live Transaction Stream (Minimized)</span>
        <button
          onClick={() => setIsMinimized(false)}
          className="text-xs text-[#38BDF8] hover:underline"
        >
          Expand Stream
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#0A0E18] border border-[#161E2E] rounded-xl p-4 shadow-sm h-full flex flex-col justify-between select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-[#161E2E]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-white tracking-wide">
            Live Transaction Stream
          </span>
          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            DATABASE ACTIVE
          </span>
          {lastUpdated && (
            <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
              Updated {lastUpdated}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchLiveTransactions}
            className="text-slate-400 hover:text-white transition-colors"
            title="Refresh database stream"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#38BDF8]' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            className="text-slate-500 hover:text-white transition-colors"
            title="Minimize Stream"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto my-1">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead>
            <tr className="text-[10px] text-slate-500 border-b border-[#161E2E]">
              <th className="pb-2 font-medium">Transaction ID</th>
              <th className="pb-2 font-medium">Account</th>
              <th className="pb-2 font-medium">Amount</th>
              <th className="pb-2 font-medium">Merchant</th>
              <th className="pb-2 font-medium">Location</th>
              <th className="pb-2 font-medium">Risk</th>
              <th className="pb-2 font-medium text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#121826]">
            {transactions.map((t) => {
              const isSelected = selectedTxn === t.id;
              return (
                <tr 
                  key={t.id} 
                  onClick={() => handleRowClick(t)}
                  className={`cursor-pointer transition-colors ${
                    isSelected ? 'bg-[#141C2E]' : 'hover:bg-[#0E1422]'
                  }`}
                >
                  <td className="py-2 font-mono text-[11px] text-slate-200 flex items-center gap-1.5">
                    <span>{t.id}</span>
                    <ArrowUpRight className="w-2.5 h-2.5 text-slate-500 opacity-60" />
                  </td>
                  <td className="py-2 font-mono text-[11px] text-slate-300">{t.account}</td>
                  <td className="py-2 font-mono text-[11px] text-slate-100 font-semibold">{t.amount}</td>
                  <td className="py-2 text-[11px] text-slate-300">{t.merchant}</td>
                  <td className="py-2 text-[11px] text-slate-400">{t.location}</td>
                  <td className={`py-2 font-mono font-bold text-[11px] ${t.riskColor}`}>{t.risk}</td>
                  <td className="py-2 text-right">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border ${t.badgeBg}`}>
                      {t.status}
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
