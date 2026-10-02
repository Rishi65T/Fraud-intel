import React from 'react';
import { 
  Home, 
  Activity, 
  Share2, 
  SearchCode, 
  BellRing, 
  Users, 
  Network, 
  Globe2, 
  BarChart3, 
  Cpu, 
  Database, 
  Settings,
  ChevronRight
} from 'lucide-react';

export type NavView = 
  | 'overview' 
  | 'transactions' 
  | 'graph' 
  | 'investigate' 
  | 'alerts' 
  | 'entities' 
  | 'clusters' 
  | 'geographic' 
  | 'analytics' 
  | 'models' 
  | 'data' 
  | 'settings';

interface SidebarProps {
  activeView: NavView;
  onSelectView: (view: NavView) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onSelectView
}) => {
  const navItems: { id: NavView; label: string; icon: React.ReactNode; hasChevron?: boolean }[] = [
    { id: 'overview', label: 'Overview', icon: <Home className="w-4 h-4" /> },
    { id: 'transactions', label: 'Live Transactions', icon: <Activity className="w-4 h-4" /> },
    { id: 'graph', label: 'Fraud Graph', icon: <Share2 className="w-4 h-4" /> },
    { id: 'investigate', label: 'Investigate', icon: <SearchCode className="w-4 h-4" /> },
    { id: 'alerts', label: 'Risk Alerts', icon: <BellRing className="w-4 h-4" /> },
    { id: 'entities', label: 'Entities', icon: <Users className="w-4 h-4" /> },
    { id: 'clusters', label: 'Clusters', icon: <Network className="w-4 h-4" /> },
    { id: 'geographic', label: 'Geographic Intel', icon: <Globe2 className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" />, hasChevron: true },
    { id: 'models', label: 'Models', icon: <Cpu className="w-4 h-4" /> },
    { id: 'data', label: 'Data', icon: <Database className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> }
  ];

  return (
    <aside className="w-[200px] xl:w-[220px] bg-[#070A12] border-r border-[#161D2C] flex flex-col justify-between shrink-0 select-none py-4">
      {/* Nav List exactly matching screenshot */}
      <nav className="px-3 space-y-1">
        {navItems.map((item) => {
          // Default to 'graph' or activeView
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-[#1D4ED8] text-white shadow-[0_0_14px_rgba(29,78,216,0.5)] font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-[#0E1322]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={isActive ? 'text-white' : 'text-slate-400'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>

              {item.hasChevron && (
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="px-4 text-[10px] text-slate-600 font-mono">
        v2.4 Production Engine
      </div>
    </aside>
  );
};
