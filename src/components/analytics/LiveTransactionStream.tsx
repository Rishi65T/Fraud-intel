import React, { useState } from 'react';
import { X, ExternalLink, ShieldAlert, ArrowUpRight } from 'lucide-react';

interface LiveTransactionStreamProps {
  onSelectEntity?: (id: string) => void;
  onOpenProfile?: () => void;
}

export const LiveTransactionStream: React.FC<LiveTransactionStreamProps> = ({
  onSelectEntity,
  onOpenProfile
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState<string | null>(null);

  const transactions = [
    { id: 'TXN-784923', account: 'ACC-78291', amount: '$2,450.00', merchant: 'Amazon', location: 'New York', risk: '0.92', status: 'FRAUD', riskColor: 'text-[#EF4444]', badgeBg: 'bg-rose-500/20 text-[#EF4444] border-rose-500/30' },
    { id: 'TXN-784922', account: 'ACC-11832', amount: '$320.00', merchant: 'Walmart', location: 'Chicago', risk: '0.23', status: 'CLEAN', riskColor: 'text-[#38BDF8]', badgeBg: 'bg-emerald-500/20 text-[#10B981] border-emerald-500/30' },
    { id: 'TXN-784921', account: 'ACC-99213', amount: '$1,200.00', merchant: 'Apple', location: 'San Francisco', risk: '0.78', status: 'REVIEW', riskColor: 'text-[#F59E0B]', badgeBg: 'bg-amber-500/20 text-[#F59E0B] border-amber-500/30' },
    { id: 'TXN-784920', account: 'ACC-44721', amount: '$89.00', merchant: 'Netflix', location: 'Miami', risk: '0.12', status: 'CLEAN', riskColor: 'text-[#38BDF8]', badgeBg: 'bg-emerald-500/20 text-[#10B981] border-emerald-500/30' },
    { id: 'TXN-784919', account: 'ACC-78291', amount: '$3,600.00', merchant: 'CryptoEx', location: 'Unknown', risk: '0.96', status: 'FRAUD', riskColor: 'text-[#EF4444]', badgeBg: 'bg-rose-500/20 text-[#EF4444] border-rose-500/30' }
  ];

  const handleRowClick = (t: typeof transactions[0]) => {
    setSelectedTxn(t.id);
    if (onSelectEntity) {
      onSelectEntity(t.account);
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
            REALTIME
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsMinimized(true)}
          className="text-slate-500 hover:text-white transition-colors"
          title="Minimize Stream"
        >
          <X className="w-3.5 h-3.5" />
        </button>
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
