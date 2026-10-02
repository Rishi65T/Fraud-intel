import React, { useState } from 'react';
import { Search, Bell } from 'lucide-react';

interface HeaderProps {
  onSearchSelect?: (query: string) => void;
  onNotificationClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onSearchSelect,
  onNotificationClick 
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearchSelect) {
      onSearchSelect(searchQuery.trim());
    }
  };

  return (
    <header className="h-16 bg-[#070A12] border-b border-[#161D2C] flex items-center sticky top-0 z-40 select-none">
      
      {/* Brand Section: Aligned with Sidebar width */}
      <div className="w-[200px] xl:w-[220px] h-full shrink-0 flex items-center gap-2.5 px-4 border-r border-[#161D2C]">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#6366F1] via-[#A855F7] to-[#EC4899] p-0.5 shadow-[0_0_12px_rgba(168,85,247,0.4)] flex items-center justify-center shrink-0">
          <div className="w-full h-full bg-[#0B0F19] rounded-[6px] flex items-center justify-center">
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
        </div>
        <span className="text-lg font-bold tracking-tight text-white font-sans truncate">
          FraudIntel
        </span>
      </div>

      {/* Main Header Controls: Search + Single Notification + Profile */}
      <div className="flex-1 flex items-center justify-between px-5 h-full min-w-0">
        
        {/* Center Search Input */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md mr-4">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search transactions, accounts, devices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0C101C] border border-[#1C2538] hover:border-[#2C3B58] focus:border-[#38BDF8] focus:outline-none rounded-lg pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-500 transition-colors"
            />
          </div>
        </form>

        {/* Right User & Single Notification Element */}
        <div className="flex items-center gap-4 shrink-0">
          
          {/* Single Notification Bell with red alert dot */}
          <button 
            type="button" 
            onClick={onNotificationClick}
            aria-label="Notifications" 
            className="relative text-slate-400 hover:text-slate-200 transition-colors p-1.5 rounded-lg hover:bg-[#0E1422] focus:outline-none focus:ring-1 focus:ring-[#38BDF8]/50"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#EF4444] shadow-[0_0_6px_#EF4444]" />
          </button>

          {/* User Profile: Alex Carter */}
          <div className="flex items-center gap-2.5 pl-3 border-l border-[#1A2234]">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#38BDF8] to-[#EC4899] p-0.5 flex items-center justify-center shrink-0">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80"
                alt="Alex Carter"
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <div className="hidden sm:flex flex-col text-left leading-tight">
              <span className="text-xs font-semibold text-white">Alex Carter</span>
              <span className="text-[10px] text-slate-400">Fraud Analyst</span>
            </div>
          </div>

        </div>

      </div>

    </header>
  );
};
