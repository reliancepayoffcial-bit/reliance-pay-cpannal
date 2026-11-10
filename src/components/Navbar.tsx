import React from 'react';
import { ShieldCheck, Bell, Wallet, User as UserIcon, LogOut, ShieldAlert, RefreshCw } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  user: User;
  settings: any;
  onLogout: () => void;
  onOpenWallet: () => void;
  onOpenProfile: () => void;
  onSwitchAdmin?: () => void;
  isAdminMode?: boolean;
  onRefreshBalance?: () => void;
  onOpenAdminAccess?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  settings,
  onLogout,
  onOpenWallet,
  onOpenProfile,
  onSwitchAdmin,
  isAdminMode,
  onRefreshBalance,
  onOpenAdminAccess
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0A0F1D]/95 backdrop-blur-md text-white shadow-xl border-b border-slate-800 relative">
      {/* Subtle Blue Top Accent Line */}
      <div className="absolute inset-x-0 bottom-0 h-[1px] bg-blue-900/40" />
      
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 relative z-10">
        {/* Prominent & Attractive Reliance Pay Logo */}
        <div className="flex items-center">
          <div 
            className="flex items-center cursor-pointer py-1 sm:py-1.5 px-2 sm:px-3 rounded-2xl bg-[#131B31] hover:bg-slate-800 border border-slate-800 transition-all duration-300 group"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <img 
              src="/assets/reliance_pay_header_logo.png" 
              alt="Reliance Pay - Grow • Earn • Be Happy" 
              className="h-10 xs:h-12 sm:h-14 md:h-16 w-auto max-w-[175px] xs:max-w-[215px] sm:max-w-[290px] md:max-w-[340px] object-contain filter brightness-[1.08] contrast-[1.06] drop-shadow-[0_4px_16px_rgba(239,68,68,0.35)] drop-shadow-[0_0_12px_rgba(251,191,36,0.3)] group-hover:scale-[1.03] transition-all duration-300"
            />
          </div>
        </div>

        {/* Right Action Items */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Wallet Balance Badge */}
          <div className="flex items-center bg-[#0B1220] border border-slate-800 rounded-xl shadow-inner overflow-hidden">
            <button
              onClick={onOpenWallet}
              className="flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-3 py-1.5 sm:py-2 hover:bg-slate-800 transition group"
            >
              <Wallet className="w-4 h-4 text-emerald-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium leading-none">Balance</p>
                <p className="text-xs sm:text-sm font-extrabold text-blue-400 leading-tight">₹{user.balance.toFixed(2)}</p>
              </div>
            </button>
            {onRefreshBalance && (
              <button
                onClick={(e) => { e.stopPropagation(); onRefreshBalance(); }}
                className="p-2 text-blue-400 hover:bg-slate-800 border-l border-slate-800 transition"
                title="Refresh Wallet Balance"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Admin Switcher if user is admin, otherwise Admin Access button */}
          {user.role === 'admin' ? (
            onSwitchAdmin && (
              <button
                onClick={onSwitchAdmin}
                className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-semibold transition shadow-md ${
                  isAdminMode 
                    ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-red-600/30' 
                    : 'bg-gradient-to-r from-amber-500/20 to-yellow-500/10 text-amber-300 border border-amber-500/40 hover:border-amber-400'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-[11px] sm:text-xs">{isAdminMode ? 'User View' : 'Admin Panel'}</span>
              </button>
            )
          ) : (
            onOpenAdminAccess && (
              <button
                onClick={onOpenAdminAccess}
                title="Admin Panel Portal Access"
                className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition shadow-md bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/15 hover:from-amber-500/25 hover:to-yellow-500/20 text-amber-300 border border-amber-500/40 hover:border-amber-400/80 active:scale-95"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px] font-black tracking-tight">Admin</span>
              </button>
            )
          )}

          {/* Profile Button */}
          <button
            onClick={onOpenProfile}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#131B31] hover:bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 transition overflow-hidden shadow-sm"
          >
            {user.profile_photo ? (
              <img src={user.profile_photo} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            )}
          </button>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            title="Logout"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 transition hidden sm:flex"
          >
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
