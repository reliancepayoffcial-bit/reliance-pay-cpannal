import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, KeyRound, Lock, Phone, ArrowRight, X, Sparkles, UserCheck, AlertCircle } from 'lucide-react';
import { User } from '../types';

interface AdminAccessModalProps {
  currentUser: User;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (adminUser: User) => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const AdminAccessModal: React.FC<AdminAccessModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onSuccess,
  showToast
}) => {
  const [accessMode, setAccessMode] = useState<'pin' | 'credentials'>('pin');
  const [adminPin, setAdminPin] = useState('');
  const [adminMobile, setAdminMobile] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [grantToCurrent, setGrantToCurrent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload: any = {
        grantToUserId: grantToCurrent ? currentUser.id : undefined
      };

      if (accessMode === 'pin') {
        if (!adminPin.trim()) {
          throw new Error('Please enter Admin Master PIN');
        }
        payload.adminPin = adminPin.trim();
      } else {
        if (!adminMobile.trim() || !adminPassword.trim()) {
          throw new Error('Please provide admin mobile and password');
        }
        payload.mobile = adminMobile.trim();
        payload.password = adminPassword.trim();
      }

      const res = await fetch('/api/admin/authenticate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      showToast(data.message || 'Administrator authenticated successfully!', 'success');
      onSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Access Denied. Invalid Admin Credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickMasterUnlock = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/authenticate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminPin: adminPin || '999999' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showToast('Master Admin verified! Welcome to HQ Control Panel.', 'success');
      onSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-gradient-to-b from-[#0D1527] via-[#0A101F] to-[#070B14] border border-amber-500/40 rounded-3xl max-w-md w-full p-6 text-white shadow-[0_10px_50px_rgba(245,158,11,0.25)] relative overflow-hidden">
        
        {/* Ambient Top Glow Line */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-600 via-amber-400 to-sky-400" />
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60 hover:bg-slate-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Admin Shield */}
        <div className="text-center mb-5 pt-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-yellow-500/10 to-red-500/20 border border-amber-500/40 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-500/10">
            <ShieldAlert className="w-8 h-8 text-amber-400 animate-pulse" />
          </div>
          <div className="inline-flex items-center space-x-1.5 bg-amber-500/10 border border-amber-500/30 px-3 py-0.5 rounded-full mb-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[10px] font-black uppercase text-amber-300 tracking-wider">RELIANCE PAY HQ SECURITY</span>
          </div>
          <h3 className="text-xl font-black text-white">Admin Portal Access</h3>
          <p className="text-xs text-slate-300 mt-1">
            Authorize administrative privileges for user management, deposits, plans & system controls.
          </p>
        </div>

        {/* Tab Selection: PIN vs Full Credentials */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900/90 border border-slate-800 rounded-2xl mb-4">
          <button
            type="button"
            onClick={() => { setAccessMode('pin'); setError(''); }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
              accessMode === 'pin' 
                ? 'bg-amber-500 text-slate-950 font-black shadow-md' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Master PIN</span>
          </button>
          <button
            type="button"
            onClick={() => { setAccessMode('credentials'); setError(''); }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
              accessMode === 'credentials' 
                ? 'bg-amber-500 text-slate-950 font-black shadow-md' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Admin Login</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-500/20 border border-red-500/50 rounded-2xl p-3 flex items-start space-x-2 text-xs text-red-200">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          {accessMode === 'pin' ? (
            <div>
              <label className="block text-xs font-bold text-amber-300 mb-1.5">
                Admin Master Access PIN
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={adminPin}
                  onChange={e => setAdminPin(e.target.value)}
                  placeholder="Enter 6-digit Master PIN (e.g. 999999)"
                  className="w-full bg-slate-900/90 border border-slate-700 focus:border-amber-400 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none transition tracking-widest font-mono"
                  autoFocus
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                <span>Default Master PIN: <strong className="text-amber-300">999999</strong></span>
                <span className="text-slate-500">or <strong>admin123</strong></span>
              </p>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Admin Mobile Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    type="tel"
                    value={adminMobile}
                    onChange={e => setAdminMobile(e.target.value)}
                    placeholder="9999999999"
                    className="w-full bg-slate-900/90 border border-slate-700 focus:border-amber-400 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none transition font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Admin Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={e => setAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900/90 border border-slate-700 focus:border-amber-400 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none transition"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1 italic">
                  Administrator mobile and password are required for this access mode.
                </p>
              </div>
            </>
          )}

          {/* Optional: Grant Admin Role directly to current session */}
          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="grantToCurrent"
              checked={grantToCurrent}
              onChange={e => setGrantToCurrent(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
            />
            <label htmlFor="grantToCurrent" className="text-[11px] text-slate-300 cursor-pointer select-none">
              Assign Admin Privileges directly to current account ({currentUser.name})
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black py-3.5 rounded-xl shadow-lg shadow-amber-500/25 flex items-center justify-center space-x-2 transition active:scale-95 disabled:opacity-50 text-xs sm:text-sm tracking-wide"
          >
            <span>{loading ? 'Verifying Credentials...' : 'Verify & Enter Admin Panel'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* 1-Click Master Access Button for quick access */}
        <div className="mt-4 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={handleQuickMasterUnlock}
            disabled={loading}
            className="w-full bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 hover:border-amber-500/40 py-2.5 px-4 rounded-xl text-xs font-bold text-amber-300 hover:text-white transition flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>1-Click Instant Master Admin Unlock</span>
            <UserCheck className="w-4 h-4 text-emerald-400 ml-1" />
          </button>
        </div>

      </div>
    </div>
  );
};
