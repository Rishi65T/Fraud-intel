import React, { useState } from 'react';
import { FraudEntity, EntityType } from '../../types/fraud';
import { 
  Users, 
  Search, 
  CreditCard, 
  Smartphone, 
  Store, 
  Server, 
  MapPin, 
  User, 
  ExternalLink
} from 'lucide-react';

interface EntitiesViewProps {
  entities: Record<string, FraudEntity>;
  onSelectEntity: (entityId: string) => void;
  onOpenFullProfile: (entity: FraudEntity) => void;
}

export const EntitiesView: React.FC<EntitiesViewProps> = ({
  entities,
  onSelectEntity,
  onOpenFullProfile
}) => {
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  const entityList = Object.values(entities);

  const filtered = entityList.filter(e => {
    if (selectedType !== 'ALL' && e.type !== selectedType) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        e.id.toLowerCase().includes(q) ||
        e.name.toLowerCase().includes(q) ||
        (e.details.customerId && e.details.customerId.toLowerCase().includes(q)) ||
        (e.details.ipAddress && e.details.ipAddress.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getIcon = (type: EntityType) => {
    switch (type) {
      case 'Customer': return <User className="w-4 h-4 text-[#38BDF8]" />;
      case 'Account': return <CreditCard className="w-4 h-4 text-[#EF4444]" />;
      case 'Device': return <Smartphone className="w-4 h-4 text-[#A78BFA]" />;
      case 'Merchant': return <Store className="w-4 h-4 text-[#10B981]" />;
      case 'IP Address': return <Server className="w-4 h-4 text-[#EF4444]" />;
      case 'Location': return <MapPin className="w-4 h-4 text-[#22D3EE]" />;
      default: return <Users className="w-4 h-4 text-[#38BDF8]" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1F2937]">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-[#38BDF8]" />
            <span>Financial Crime Entity Directory</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Cross-referenced Indian bank accounts, UPI customer IDs, rooted OnePlus emulators, and Mewat ISP proxies
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2 text-xs flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ID, IP, Name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#121824] border border-[#1F2937] rounded-lg pl-8 pr-3 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#38BDF8]"
            />
          </div>

          <div className="flex items-center gap-1 bg-[#121824] p-1 rounded-lg border border-[#1F2937]">
            {['ALL', 'Account', 'Customer', 'Device', 'Merchant', 'IP Address', 'Location'].map(t => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-2 py-1 rounded-md font-medium text-[11px] transition-colors ${
                  selectedType === t
                    ? 'bg-[#38BDF8] text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Entity Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(entity => {
          const isHigh = entity.riskScore >= 0.8;
          const isMed = entity.riskScore >= 0.5 && entity.riskScore < 0.8;

          return (
            <div
              key={entity.id}
              className="bg-[#0E131C] border border-[#1F2937] hover:border-[#38BDF8]/40 rounded-xl p-4 flex flex-col justify-between transition-all shadow-md group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getIcon(entity.type)}
                    <span className="text-xs font-semibold text-slate-300">{entity.type}</span>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                    isHigh
                      ? 'bg-rose-500/15 border-rose-500/40 text-rose-400'
                      : isMed
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                      : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                  }`}>
                    {entity.riskCategory} ({entity.riskScore.toFixed(2)})
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white font-mono">{entity.id}</h3>
                <p className="text-xs text-slate-400 truncate mt-0.5">{entity.name}</p>

                <div className="space-y-1.5 my-3 pt-3 border-t border-[#1F2937] text-xs">
                  {entity.details.totalAmount !== undefined && (
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-500">Total Volume</span>
                      <span className="font-mono font-bold text-white">
                        ₹{entity.details.totalAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}
                  {entity.details.customerId && (
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-500">Customer</span>
                      <span className="font-mono text-cyan-400">{entity.details.customerId}</span>
                    </div>
                  )}
                  {entity.details.ipAddress && (
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-500">IP Host</span>
                      <span className="font-mono text-rose-400">{entity.details.ipAddress}</span>
                    </div>
                  )}
                  {entity.details.deviceModel && (
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-500">Hardware</span>
                      <span className="truncate max-w-[140px] text-slate-200">{entity.details.deviceModel}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-[#1F2937]">
                <button
                  onClick={() => onSelectEntity(entity.id)}
                  className="flex-1 py-1.5 px-2 bg-[#121824] hover:bg-[#151E2C] border border-[#1F2937] hover:border-[#38BDF8] text-cyan-400 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-all"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Inspect in 3D</span>
                </button>
                <button
                  onClick={() => onOpenFullProfile(entity)}
                  className="py-1.5 px-3 bg-[#1E40AF] hover:bg-[#2563EB] text-white rounded-lg text-xs font-medium transition-all"
                >
                  Profile
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
