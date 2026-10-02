import React from 'react';
import { X } from 'lucide-react';

export const TransactionRiskTrend: React.FC = () => {
  return (
    <div className="bg-[#0A0E18] border border-[#161E2E] rounded-xl p-3.5 flex flex-col justify-between shadow-sm h-full min-h-[220px]">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#161E2E]">
        <span className="text-xs font-bold text-white tracking-wide">
          Transaction Risk Trend
        </span>
        <X className="w-3 h-3 text-slate-500 hover:text-white cursor-pointer" />
      </div>

      {/* SVG Chart matching screenshot */}
      <div className="relative w-full h-36 flex items-center my-1">
        
        {/* Y Axis */}
        <div className="flex flex-col justify-between h-28 text-[9px] text-slate-500 font-mono pr-2">
          <span>30</span>
          <span>20</span>
          <span>10</span>
          <span>0</span>
        </div>

        {/* SVG Graphic with 2 glowing lines */}
        <div className="flex-1 h-full flex flex-col justify-between">
          <svg className="w-full h-28 overflow-visible" viewBox="0 0 300 100" preserveAspectRatio="none">
            {/* Grid lines */}
            <line x1="0" y1="0" x2="300" y2="0" stroke="#161E2E" strokeWidth="1" />
            <line x1="0" y1="33" x2="300" y2="33" stroke="#161E2E" strokeWidth="1" />
            <line x1="0" y1="66" x2="300" y2="66" stroke="#161E2E" strokeWidth="1" />
            <line x1="0" y1="100" x2="300" y2="100" stroke="#161E2E" strokeWidth="1" />

            {/* Blue Normal Line */}
            <path
              d="M 0,70 Q 25,60 50,75 T 100,65 T 150,80 T 200,60 T 250,70 T 300,55"
              fill="none"
              stroke="#38BDF8"
              strokeWidth="2.2"
              className="drop-shadow-[0_0_6px_#38BDF8]"
            />

            {/* Red High Risk Line */}
            <path
              d="M 0,50 Q 25,25 50,45 T 100,20 T 150,40 T 200,25 T 250,35 T 300,10"
              fill="none"
              stroke="#EF4444"
              strokeWidth="2.2"
              className="drop-shadow-[0_0_8px_#EF4444]"
            />
          </svg>

          {/* X Axis labels */}
          <div className="flex justify-between text-[9px] text-slate-500 font-mono pt-1">
            <span>Jan</span>
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
            <span>Jun</span>
            <span>Jul</span>
          </div>
        </div>

      </div>

      {/* Bottom Legend */}
      <div className="flex items-center justify-center gap-5 text-[10px] text-slate-400 pt-1 border-t border-[#161E2E]">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#38BDF8]" />
          <span>Normal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
          <span>High Risk</span>
        </div>
      </div>

    </div>
  );
};
