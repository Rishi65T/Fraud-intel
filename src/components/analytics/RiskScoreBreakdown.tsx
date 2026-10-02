import React from 'react';

export const RiskScoreBreakdown: React.FC = () => {
  const size = 100;
  const strokeWidth = 9;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - 0.92 * circumference;

  const factors = [
    { name: 'Transaction Velocity', impact: '+24%' },
    { name: 'Shared Device', impact: '+21%' },
    { name: 'Geographic Anomaly', impact: '+18%' },
    { name: 'Merchant Risk', impact: '+15%' },
    { name: 'Network Association', impact: '+14%' }
  ];

  return (
    <div className="bg-[#0A0E18] border border-[#161E2E] rounded-xl p-4 shadow-sm h-full flex flex-col justify-between">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-[#161E2E]">
        <span className="text-xs font-bold text-white tracking-wide">
          Risk Score Breakdown
        </span>
      </div>

      {/* Main content: Donut gauge + factors list */}
      <div className="flex items-center gap-5 my-1">
        
        {/* Glowing Donut Gauge */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg width={size} height={size} className="transform -rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#151E2E"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="url(#riskGradient)"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="drop-shadow-[0_0_8px_#EC4899]"
            />
            <defs>
              <linearGradient id="riskGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#EC4899" />
                <stop offset="100%" stopColor="#EF4444" />
              </linearGradient>
            </defs>
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xl font-bold font-mono text-white tracking-tight">
              0.92
            </span>
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#EF4444] mt-0.5">
              High Risk
            </span>
          </div>
        </div>

        {/* Factors List */}
        <div className="flex-1 space-y-1.5 text-xs">
          {factors.map((f, i) => (
            <div key={i} className="flex items-center justify-between text-[11px]">
              <span className="text-slate-300 font-medium">{f.name}</span>
              <span className="font-mono font-bold text-[#EF4444] tabular-nums">{f.impact}</span>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
};
