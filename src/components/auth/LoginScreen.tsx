import React, { useState } from 'react';
import { AnalystUser, DEMO_ANALYSTS } from '../../types/auth';
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  Fingerprint, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle,
  Cpu,
  ShieldAlert
} from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (user: AnalystUser) => void;
  lockedUser?: AnalystUser | null;
  onUnlock?: () => void;
  onSwitchUser?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  lockedUser,
  onUnlock,
  onSwitchUser
}) => {
  const [selectedAnalyst, setSelectedAnalyst] = useState<AnalystUser>(lockedUser || DEMO_ANALYSTS[0]);
  const [password, setPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [pin, setPin] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // If in quick lock-screen mode
  if (lockedUser) {
    const handleUnlockSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setIsAuthenticating(true);
      setTimeout(() => {
        setIsAuthenticating(false);
        if (onUnlock) onUnlock();
      }, 600);
    };

    const handleBiometricUnlock = () => {
      setIsAuthenticating(true);
      setTimeout(() => {
        setIsAuthenticating(false);
        if (onUnlock) onUnlock();
      }, 700);
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050811] text-[#F8FAFC] select-none p-4">
        {/* Background Ambient Glows */}
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-[#1D4ED8]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-[#EC4899]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative w-full max-w-md bg-[#090D18]/95 backdrop-blur-xl border border-[#1E293B] rounded-2xl p-7 shadow-[0_0_60px_rgba(0,0,0,0.9)] text-center animate-in zoom-in-95 duration-200">
          
          {/* Lock Icon */}
          <div className="w-12 h-12 mx-auto rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4 text-amber-400">
            <Lock className="w-6 h-6" />
          </div>

          <h2 className="text-xl font-bold text-white font-sans">Terminal Locked</h2>
          <p className="text-xs text-slate-400 mt-1">
            Session paused under SOC Inactivity Security Protocol
          </p>

          {/* Locked User Card */}
          <div className="mt-5 p-3 rounded-xl bg-[#0D1424] border border-[#1B273F] flex items-center gap-3 text-left">
            <img 
              src={lockedUser.avatarUrl} 
              alt={lockedUser.name} 
              className="w-12 h-12 rounded-xl object-cover border border-[#2B3B5C]"
            />
            <div className="flex-1 min-w-0">
              <span className="text-xs font-bold text-white block truncate">{lockedUser.name}</span>
              <span className="text-[10px] text-[#38BDF8] font-mono block">{lockedUser.role}</span>
              <span className="text-[10px] text-slate-500 font-mono block">{lockedUser.badgeNumber}</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              ACTIVE
            </span>
          </div>

          {/* Unlock Form */}
          <form onSubmit={handleUnlockSubmit} className="mt-5 space-y-3">
            <div>
              <input
                type="password"
                placeholder="Enter PIN (Default: 1234)"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                autoFocus
                className="w-full bg-[#070B14] border border-[#1C263A] focus:border-[#38BDF8] rounded-xl px-4 py-2.5 text-center text-sm font-mono tracking-widest text-white placeholder-slate-600 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full py-2.5 rounded-xl bg-[#1D4ED8] hover:bg-[#2563EB] active:bg-[#1E40AF] text-white text-xs font-bold transition-all shadow-lg shadow-blue-950/50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isAuthenticating ? (
                <span>Verifying Credentials...</span>
              ) : (
                <>
                  <Key className="w-4 h-4" />
                  <span>Resume Investigation Terminal</span>
                </>
              )}
            </button>
          </form>

          {/* Biometric Touch Option */}
          <button
            type="button"
            onClick={handleBiometricUnlock}
            disabled={isAuthenticating}
            className="w-full mt-3 py-2 rounded-xl bg-[#0D1424] hover:bg-[#131D32] border border-[#1C263A] text-slate-300 hover:text-white text-xs transition-colors flex items-center justify-center gap-2"
          >
            <Fingerprint className="w-4 h-4 text-emerald-400" />
            <span>FIDO2 Passkey / Touch ID Unlock</span>
          </button>

          {/* Switch User */}
          <div className="mt-4 pt-3 border-t border-[#162032] flex items-center justify-between text-xs text-slate-400">
            <span>Not {lockedUser.name}?</span>
            <button
              type="button"
              onClick={onSwitchUser}
              className="text-[#38BDF8] hover:underline"
            >
              Switch Analyst Account
            </button>
          </div>

        </div>
      </div>
    );
  }

  // Full Login Mode
  const handleFullLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsAuthenticating(true);
    setAuthError(null);

    setTimeout(() => {
      setIsAuthenticating(false);
      onLoginSuccess(selectedAnalyst);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050811] text-[#F8FAFC] select-none p-4 overflow-y-auto">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-[#1D4ED8]/12 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-[#EC4899]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-xl bg-[#090D18]/95 backdrop-blur-xl border border-[#1E293B] rounded-2xl shadow-[0_0_70px_rgba(0,0,0,0.85)] p-7 md:p-8 animate-in fade-in duration-200">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-5 border-b border-[#162032]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#6366F1] via-[#A855F7] to-[#EC4899] p-0.5 shadow-[0_0_15px_rgba(168,85,247,0.4)] flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-[#0B0F19] rounded-[10px] flex items-center justify-center">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white font-sans">
                FraudIntel Enterprise
              </h1>
              <p className="text-[11px] text-[#38BDF8] font-semibold">
                Financial Crime Surveillance & Neural Intelligence
              </p>
            </div>
          </div>

          <div className="hidden sm:flex flex-col items-end text-right">
            <span className="text-[9px] font-mono uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded">
              RESTRICTED SOC TERMINAL
            </span>
            <span className="text-[10px] text-slate-500 font-mono mt-1">Airgapped Local Core v2.4</span>
          </div>
        </div>

        {/* 1. Quick Select Analyst Profile */}
        <div className="mt-5">
          <label className="text-xs font-semibold text-slate-300 block mb-2.5">
            Select Authorized Analyst Profile:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {DEMO_ANALYSTS.map((anl) => {
              const isSelected = selectedAnalyst.id === anl.id;
              return (
                <button
                  key={anl.id}
                  type="button"
                  onClick={() => setSelectedAnalyst(anl)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected 
                      ? 'bg-[#121B30] border-[#38BDF8] shadow-[0_0_15px_rgba(56,189,248,0.25)] ring-1 ring-[#38BDF8]' 
                      : 'bg-[#0B101E] border-[#182338] hover:bg-[#10172A] hover:border-[#243552]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    <img 
                      src={anl.avatarUrl} 
                      alt={anl.name} 
                      className="w-8 h-8 rounded-lg object-cover border border-[#233554]"
                    />
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-white block truncate">{anl.name.split(' ')[0]}</span>
                      <span className="text-[9px] text-slate-400 font-mono block truncate">{anl.badgeNumber}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-[#38BDF8] block truncate">
                    {anl.clearanceLevel.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Login Form for Selected Profile */}
        <form onSubmit={handleFullLogin} className="mt-5 space-y-3.5">
          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1">
              Analyst Identity ID
            </label>
            <input 
              type="text" 
              readOnly 
              value={`${selectedAnalyst.name} (${selectedAnalyst.email})`}
              className="w-full bg-[#0B101E] border border-[#182338] rounded-xl px-3.5 py-2 text-xs text-slate-300 font-mono cursor-default focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1">
              Encrypted Passphrase / Cryptographic Token
            </label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#070B14] border border-[#182338] focus:border-[#38BDF8] rounded-xl pl-3.5 pr-10 py-2 text-xs text-white font-mono focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Security Features Info */}
          <div className="p-3 rounded-xl bg-[#0B101E] border border-[#182338] flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Hardware Token Linked: {selectedAnalyst.hardwareTokenId}</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono font-bold">READY</span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isAuthenticating}
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-[#1D4ED8] to-[#2563EB] hover:from-[#2563EB] hover:to-[#3B82F6] active:scale-[0.99] text-white text-xs font-bold tracking-wide transition-all shadow-xl shadow-blue-950/60 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isAuthenticating ? (
              <span>Authenticating Session...</span>
            ) : (
              <>
                <span>Access Fraud Intelligence Terminal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Security Warning Footer */}
        <div className="mt-5 pt-3 border-t border-[#162032] flex items-center justify-between text-[10px] text-slate-500">
          <span>Official Use Only • Authorized Personnel Surveillance</span>
          <span className="font-mono">AES-256 GCM</span>
        </div>

      </div>
    </div>
  );
};
