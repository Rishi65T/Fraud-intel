import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Headphones, Check, ShieldAlert, User, Settings, LogOut, ChevronDown, Lock } from 'lucide-react';
import { AnalystUser } from '../../types/auth';

interface HeaderProps {
  currentUser?: AnalystUser;
  onSearchSelect?: (query: string) => void;
  onNotificationClick?: () => void;
  onNavigateView?: (view: string) => void;
  onOpenProfile?: () => void;
  onLockTerminal?: () => void;
  onSignOut?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentUser,
  onSearchSelect,
  onNotificationClick,
  onNavigateView,
  onOpenProfile,
  onLockTerminal,
  onSignOut
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close popovers on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchResults = [
    { id: 'ACC-78291', type: 'Account', label: 'High Risk Hub ($128,430)', risk: '0.92' },
    { id: 'TXN-784923', type: 'Transaction', label: 'Amazon EU ($2,450.00)', risk: '0.92' },
    { id: 'DEV-9921', type: 'Device', label: 'Samsung S23 (7 Accounts)', risk: '0.94' },
    { id: 'CUST-4481', type: 'Customer', label: 'Rajesh Sharma', risk: '0.88' },
    { id: 'CL-001', type: 'Cluster', label: 'Jamtara Syndicate (48 Entities)', risk: '0.92' }
  ].filter(item => 
    !searchQuery.trim() || 
    item.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectSearchResult = (id: string) => {
    if (onSearchSelect) onSearchSelect(id);
    setSearchQuery('');
    setIsSearchFocused(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearchSelect) {
      onSearchSelect(searchQuery.trim());
      setIsSearchFocused(false);
    }
  };

  return (
    <header className="h-16 bg-[#070A12] border-b border-[#161D2C] flex items-center sticky top-0 z-40 select-none">
      
      {/* Brand Section: Aligned with Sidebar width */}
      <div 
        onClick={() => onNavigateView && onNavigateView('overview')}
        className="w-[200px] xl:w-[220px] h-full shrink-0 flex items-center gap-2.5 px-4 border-r border-[#161D2C] cursor-pointer hover:bg-[#0B0F19] transition-colors"
      >
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

      {/* Main Header Controls: Search + Support + Notification + Profile */}
      <div className="flex-1 flex items-center justify-between px-5 h-full min-w-0">
        
        {/* Center Search Input with Live Dropdown */}
        <div ref={searchRef} className="relative flex-1 max-w-md mr-4">
          <form onSubmit={handleSearchSubmit}>
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search transactions, accounts, devices..."
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchFocused(true);
                }}
                className="w-full bg-[#0C101C] border border-[#1C2538] hover:border-[#2C3B58] focus:border-[#38BDF8] focus:outline-none rounded-lg pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-500 transition-colors"
              />
            </div>
          </form>

          {/* Live Search Autocomplete Dropdown */}
          {isSearchFocused && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#0C101C] border border-[#1C2538] rounded-xl shadow-2xl p-2 z-50 animate-in fade-in">
              <div className="text-[10px] font-mono uppercase text-slate-500 px-2 py-1 border-b border-[#161D2C]">
                Fast Search Results
              </div>
              <div className="space-y-1 mt-1">
                {searchResults.length > 0 ? (
                  searchResults.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectSearchResult(item.id)}
                      className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[#141C2E] transition-colors text-left"
                    >
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-blue-500/20 text-[#38BDF8] border border-blue-500/30">
                          {item.type}
                        </span>
                        <span className="text-xs font-semibold text-white font-mono">{item.id}</span>
                        <span className="text-xs text-slate-400 truncate max-w-[170px]">{item.label}</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-[#EF4444]">{item.risk}</span>
                    </button>
                  ))
                ) : (
                  <div className="p-3 text-center text-xs text-slate-500">
                    No matching entities found for "{searchQuery}"
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right User & Notifications & Support Elements */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* Support / Copilot Audio Assistance Button */}
          <div className="relative">
            <button 
              type="button" 
              onClick={() => setIsSupportOpen(!isSupportOpen)}
              title="Fraud Command Center AI Support"
              className="relative text-slate-400 hover:text-slate-200 transition-colors p-2 rounded-lg hover:bg-[#0E1422] focus:outline-none"
            >
              <Headphones className="w-4 h-4" />
            </button>

            {isSupportOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-[#0A0E18] border border-[#161E2E] rounded-xl shadow-2xl p-3 z-50 text-xs animate-in fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-[#161E2E] font-semibold text-white">
                  <span>AI Copilot Hotline</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">ONLINE</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  Autonomous fraud triage is active on 8 channels. Zero false negative mode enabled.
                </p>
                <button
                  onClick={() => {
                    setIsSupportOpen(false);
                    if (onNavigateView) onNavigateView('investigate');
                  }}
                  className="w-full mt-2.5 py-1.5 bg-[#1D4ED8] hover:bg-[#2563EB] text-white text-[11px] font-semibold rounded-lg transition-colors text-center block"
                >
                  Open Investigation Console
                </button>
              </div>
            )}
          </div>

          {/* Notification Bell with red alert dot & Dropdown Popover */}
          <div ref={notifRef} className="relative">
            <button 
              type="button" 
              onClick={() => {
                setIsNotificationsOpen(!isNotificationsOpen);
                if (onNotificationClick) onNotificationClick();
              }}
              aria-label="Notifications" 
              className="relative text-slate-400 hover:text-slate-200 transition-colors p-2 rounded-lg hover:bg-[#0E1422] focus:outline-none"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#EF4444] shadow-[0_0_6px_#EF4444]" />
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-[#0A0E18] border border-[#161E2E] rounded-xl shadow-2xl p-3 z-50 text-xs animate-in fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-[#161E2E]">
                  <span className="font-semibold text-white">Risk Alerts (4 New)</span>
                  <button 
                    onClick={() => {
                      setIsNotificationsOpen(false);
                      if (onNavigateView) onNavigateView('alerts');
                    }}
                    className="text-[10px] text-[#38BDF8] hover:underline"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-2 mt-2">
                  <div 
                    onClick={() => {
                      if (onSearchSelect) onSearchSelect('ACC-78291');
                      setIsNotificationsOpen(false);
                    }}
                    className="p-2 rounded-lg bg-[#0E1422] hover:bg-[#141C2E] cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold text-[#EF4444]">
                      <span>Critical Velocity Spike</span>
                      <span className="text-[10px] text-slate-500 font-mono">1m ago</span>
                    </div>
                    <p className="text-[10px] text-slate-300 mt-0.5">ACC-78291 attempted 5 card charges in 40s.</p>
                  </div>
                  <div 
                    onClick={() => {
                      if (onSearchSelect) onSearchSelect('DEV-9921');
                      setIsNotificationsOpen(false);
                    }}
                    className="p-2 rounded-lg bg-[#0E1422] hover:bg-[#141C2E] cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold text-[#F59E0B]">
                      <span>Fingerprint Spoofing</span>
                      <span className="text-[10px] text-slate-500 font-mono">3m ago</span>
                    </div>
                    <p className="text-[10px] text-slate-300 mt-0.5">DEV-9921 matched 7 accounts simultaneously.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile: Dynamic Analyst Profile with Dropdown */}
          <div ref={profileRef} className="relative">
            <button
              type="button"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2.5 pl-3 border-l border-[#1A2234] hover:opacity-90 transition-opacity focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#38BDF8] to-[#EC4899] p-0.5 flex items-center justify-center shrink-0">
                <img
                  src={currentUser?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80"}
                  alt={currentUser?.name || "Alex Carter"}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <div className="hidden sm:flex flex-col text-left leading-tight">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-semibold text-white">{currentUser?.name || "Alex Carter"}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </div>
                <span className="text-[10px] text-slate-400">{currentUser?.role || "Fraud Analyst"}</span>
              </div>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-[#0A0E18] border border-[#161E2E] rounded-xl shadow-2xl p-2 z-50 text-xs animate-in fade-in">
                {/* Clickable Header card to open full profile */}
                <div 
                  onClick={() => {
                    setIsProfileOpen(false);
                    if (onOpenProfile) onOpenProfile();
                  }}
                  className="px-2.5 py-2 border-b border-[#161E2E] hover:bg-[#121A2C] rounded-lg cursor-pointer transition-colors"
                >
                  <p className="font-semibold text-white">{currentUser?.name || "Alex Carter"}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{currentUser?.clearanceLevel || "Tier-3 Clearance"}</p>
                  <div className="flex items-center gap-1.5 mt-1 text-[10px] text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Active Session • {currentUser?.badgeNumber || 'FCU-TX-8821'}</span>
                  </div>
                </div>

                <div className="space-y-0.5 mt-1">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      if (onOpenProfile) onOpenProfile();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-[#141C2E] text-slate-300 hover:text-white transition-colors text-left"
                  >
                    <User className="w-3.5 h-3.5 text-[#38BDF8]" />
                    <span>Analyst Dossier & Keys</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      if (onNavigateView) onNavigateView('settings');
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-[#141C2E] text-slate-300 hover:text-white transition-colors text-left"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                    <span>Terminal Preferences</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      if (onNavigateView) onNavigateView('investigate');
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-[#141C2E] text-slate-300 hover:text-white transition-colors text-left"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                    <span>My Assigned Cases ({currentUser?.activeCasesCount || 4})</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      if (onLockTerminal) onLockTerminal();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-[#141C2E] text-amber-300 hover:text-amber-200 transition-colors text-left"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Lock Terminal</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      if (onSignOut) onSignOut();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-rose-950/40 text-rose-400 hover:text-rose-300 transition-colors text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Shift Handover / Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

    </header>
  );
};
