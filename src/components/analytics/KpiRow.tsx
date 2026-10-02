import React from 'react';

interface KpiRowProps {
  kpis: {
    totalTransactions: string;
    totalTransactionsChange: string;
    riskTransactions: string;
    riskTransactionsChange: string;
    activeAlerts: string;
    activeAlertsChange: string;
    fraudClusters: string;
    fraudClustersChange: string;
  };
}

export const KpiRow: React.FC<KpiRowProps> = ({ kpis }) => {
  const cards = [
    {
      label: 'Total Transactions',
      value: '12.4M',
      change: '↑ 12%',
      valueColor: 'text-[#38BDF8]',
      trendColor: 'text-[#38BDF8]'
    },
    {
      label: 'Risk Transactions',
      value: '48,231',
      change: '↑ 28%',
      valueColor: 'text-[#EF4444]',
      trendColor: 'text-[#34D399]'
    },
    {
      label: 'Active Alerts',
      value: '1,284',
      change: '↑ 5%',
      valueColor: 'text-[#F87171]',
      trendColor: 'text-[#34D399]'
    },
    {
      label: 'Fraud Clusters',
      value: '37',
      change: '↑ 18%',
      valueColor: 'text-[#F87171]',
      trendColor: 'text-[#34D399]'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 w-full">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="bg-[#0A0E18] border border-[#161E2E] rounded-xl p-3.5 flex flex-col justify-between shadow-sm"
        >
          <span className="text-[11px] font-medium text-slate-400">
            {card.label}
          </span>

          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-xl lg:text-2xl font-bold font-mono tracking-tight ${card.valueColor}`}>
              {card.value}
            </span>
            <span className={`text-xs font-mono font-medium ${card.trendColor}`}>
              {card.change}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
