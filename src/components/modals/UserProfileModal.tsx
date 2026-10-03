import React, { useState } from 'react';
import { AnalystUser, DEMO_ANALYSTS } from '../../types/auth';
import { 
  X, 
  ShieldCheck, 
  Key, 
  Lock, 
  LogOut, 
  UserCheck, 
  Award, 
  Clock, 
  Activity, 
  Cpu, 
  Building2, 
  Check, 
  Fingerprint,
  RefreshCw
} from 'lucide-react';

interface UserProfileModalProps {
  user: AnalystUser;
  isOpen: boolean;
  onClose: () => void;
  onLockTerminal: () => void;
  onSignOut: () => void;
  onSwitchUser: (newUser: AnalystUser) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  isOpen,
  onClose,
  onLockTerminal,
  onSignOut,
  onSwitchUser
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'performance' | 'security' | 'switch'>('profile');
  const [autoLockDuration, setAutoLockDuration] = useState('30 Minutes');
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [handoverNote, setHandoverNote] = useState('Monitoring Jamtara syndicate cluster CL-001. Cross-border UPI spike flagged on ACC-78291.');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSavePreferences = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in select-none">
      <div 
        className="relative w-full max-w-2xl bg-[#090D18] border border-[#1E293B] rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#162032] bg-[#0C1222]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#38BDF8] to-[#6366F1] p-0.5 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">Analyst Identity & Security Credentials</h2>
              <p className="text-[10px] text-slate-400 font-mono">SOC Clearance ID: {user.badgeNumber}</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#162032] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#162032] px-6 bg-[#080C16] text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'profile' ? 'border-[#38BDF8] text-[#38BDF8]' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('performance')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'performance' ? 'border-[#38BDF8] text-[#38BDF8]' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Investigation Stats
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'security' ? 'border-[#38BDF8] text-[#38BDF8]' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Security & Token
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('switch')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'switch' ? 'border-[#38BDF8] text-[#38BDF8]' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Switch Profile ({DEMO_ANALYSTS.length})
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* TAB 1: Profile Overview */}
          {activeTab === 'profile' && (
            <div className="space-y-4 animate-in fade-in">
              {/* Identity Card */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#0E1628] to-[#121B30] border border-[#1E2D48] flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img 
                      src={user.avatarUrl} 
                      alt={user.name} 
                      className="w-16 h-16 rounded-xl object-cover border-2 border-[#38BDF8]/60 shadow-[0_0_15px_rgba(56,189,248,0.3)]"
                    />
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#0E1628] shadow-sm" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">{user.name}</h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#1D4ED8]/20 text-[#60A5FA] border border-[#1D4ED8]/40">
                        {user.clearanceLevel}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">{user.role}</p>
                    <p className="text-[11px] text-slate-400 mt-1 font-mono">{user.email}</p>
                  </div>
                </div>

                <div className="text-right hidden sm:block">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Facility</span>
                  <span className="text-xs text-slate-200 font-medium">{user.facility}</span>
                </div>
              </div>

              {/* Detail Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-[#0C1222] border border-[#162238]">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Department</span>
                  <span className="text-slate-200 font-medium">{user.department}</span>
                </div>
                <div className="p-3 rounded-lg bg-[#0C1222] border border-[#162238]">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Network Endpoint</span>
                  <span className="text-slate-200 font-mono">{user.ipAddress}</span>
                </div>
                <div className="p-3 rounded-lg bg-[#0C1222] border border-[#162238]">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">FIDO2 Hardware Key</span>
                  <span className="text-emerald-400 font-mono flex items-center gap-1.5 mt-0.5">
                    <Key className="w-3 h-3" />
                    <span>{user.hardwareTokenId}</span>
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-[#0C1222] border border-[#162238]">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Last Authorized Login</span>
                  <span className="text-slate-200 font-mono">{user.lastLogin}</span>
                </div>
              </div>

              {/* Handover Briefing Notes */}
              <div className="p-3 rounded-lg bg-[#0C1222] border border-[#162238]">
                <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1.5">
                  Shift Handover Briefing Notes
                </label>
                <textarea
                  value={handoverNote}
                  onChange={(e) => setHandoverNote(e.target.value)}
                  rows={2}
                  className="w-full bg-[#080C16] border border-[#1A263E] rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-[#38BDF8]"
                />
              </div>
            </div>
          )}

          {/* TAB 2: Performance & Triage Stats */}
          {activeTab === 'performance' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-[#0C1222] border border-[#162238] text-center">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Fraud Mitigated</span>
                  <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block">
                    {user.savedAmountFormatted}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-[#0C1222] border border-[#162238] text-center">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Resolved Cases</span>
                  <span className="text-xl font-bold font-mono text-white mt-1 block">
                    {user.resolvedCasesCount}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-[#0C1222] border border-[#162238] text-center">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Active Triage</span>
                  <span className="text-xl font-bold font-mono text-[#F97316] mt-1 block">
                    {user.activeCasesCount} Cases
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0C1222] border border-[#162238] space-y-3">
                <span className="text-xs font-bold text-white tracking-wide block">Analyst Quality Metrics</span>
                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>Investigation Accuracy (Ground Truth)</span>
                    <span className="font-mono text-emerald-400 font-bold">99.4%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#162032] overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '99.4%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>Average Case Resolution Velocity</span>
                    <span className="font-mono text-[#38BDF8] font-bold">3.2 Minutes</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#162032] overflow-hidden">
                    <div className="h-full bg-[#38BDF8] rounded-full" style={{ width: '88%' }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Security & Token */}
          {activeTab === 'security' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-xl bg-[#0C1222] border border-[#162238] space-y-3">
                <span className="text-xs font-bold text-white tracking-wide block">Authentication Protocols</span>
                
                <div className="flex items-center justify-between py-2 border-b border-[#162032]">
                  <div className="flex items-center gap-2">
                    <Fingerprint className="w-4 h-4 text-emerald-400" />
                    <div>
                      <p className="text-xs font-semibold text-slate-200">Hardware Security Token</p>
                      <p className="text-[10px] text-slate-400">FIDO2 / WebAuthn cryptographically verified</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    ENROLLED
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-[#162032]">
                  <div>
                    <p className="text-xs font-semibold text-slate-200">Terminal Inactivity Auto-Lock</p>
                    <p className="text-[10px] text-slate-400">Automatically locks investigation stage</p>
                  </div>
                  <select 
                    value={autoLockDuration}
                    onChange={(e) => setAutoLockDuration(e.target.value)}
                    className="bg-[#080C16] border border-[#1A263E] rounded px-2 py-1 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="15 Minutes">15 Minutes</option>
                    <option value="30 Minutes">30 Minutes</option>
                    <option value="1 Hour">1 Hour</option>
                    <option value="Never">Never (Manual)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-xs font-semibold text-slate-200">Critical Alert Audio Chime</p>
                    <p className="text-[10px] text-slate-400">Audible ping on 0.90+ fraud scores</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSoundAlerts(!soundAlerts)}
                    className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
                      soundAlerts ? 'bg-[#38BDF8]' : 'bg-[#1C263A]'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      soundAlerts ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Switch Analyst Profile */}
          {activeTab === 'switch' && (
            <div className="space-y-3 animate-in fade-in">
              <span className="text-xs font-bold text-white tracking-wide block">Select Active Duty Analyst</span>
              {DEMO_ANALYSTS.map((anl) => {
                const isCurrent = anl.id === user.id;
                return (
                  <div
                    key={anl.id}
                    onClick={() => {
                      onSwitchUser(anl);
                      onClose();
                    }}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isCurrent 
                        ? 'bg-[#121B30] border-[#38BDF8] shadow-md' 
                        : 'bg-[#0C1222] border-[#162238] hover:bg-[#10182C] hover:border-[#243552]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img 
                        src={anl.avatarUrl} 
                        alt={anl.name} 
                        className="w-10 h-10 rounded-lg object-cover border border-[#243552]"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{anl.name}</span>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-blue-500/20 text-[#38BDF8]">
                            {anl.clearanceLevel.split(' ')[0]}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400">{anl.role} • {anl.badgeNumber}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isCurrent ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          ACTIVE
                        </span>
                      ) : (
                        <span className="text-xs text-[#38BDF8] hover:underline flex items-center gap-1">
                          <RefreshCw className="w-3 h-3" />
                          <span>Switch</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-[#162032] bg-[#0C1222] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onLockTerminal();
              }}
              className="px-3 py-1.5 rounded-lg bg-[#141E34] hover:bg-[#1A2844] border border-[#233554] text-xs font-medium text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Lock Terminal</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onSignOut();
              }}
              className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-medium text-rose-400 hover:text-rose-300 flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleSavePreferences}
            className="px-4 py-1.5 rounded-lg bg-[#1D4ED8] hover:bg-[#2563EB] text-xs font-semibold text-white transition-colors shadow-md flex items-center gap-1.5"
          >
            {savedSuccess ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Saved!</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
