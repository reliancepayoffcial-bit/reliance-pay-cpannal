import React, { useEffect } from 'react';
import { Volume2, CheckCircle2, X } from 'lucide-react';
import { Deposit } from '../types';
import { playRelianceSoundboxAlert } from '../utils/soundboxAudio';

interface RechargeSuccessModalProps {
  deposit: Deposit;
  onClose: () => void;
}

export const RechargeSuccessModal: React.FC<RechargeSuccessModalProps> = ({ deposit, onClose }) => {
  useEffect(() => {
    // Automatically trigger Soundbox chime & Hindi voice alert when modal opens
    playRelianceSoundboxAlert(deposit.amount);
  }, [deposit]);

  const handleReplay = () => {
    playRelianceSoundboxAlert(deposit.amount);
  };

  const formattedAmount = deposit.amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  const rawAmountStr = Math.round(deposit.amount).toLocaleString('en-IN');

  return (
    <div className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-[#0B172A] border border-cyan-500/40 rounded-3xl p-5 shadow-[0_0_50px_rgba(6,182,212,0.3)] text-white overflow-hidden">
        
        {/* Glow ambient background effects */}
        <div className="absolute -top-16 -left-16 w-36 h-36 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-36 h-36 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Soundbox Header Badge & Close Button */}
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#102540] border border-cyan-500/40 text-cyan-300 text-xs font-semibold shadow-inner">
            <Volume2 className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>Reliance Pay Soundbox • वॉइस अलर्ट</span>
          </div>
          
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors border border-slate-700"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Center Soundbox Animated Speaker Icon Box */}
        <div className="relative z-10 flex justify-center my-3">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#0F3657] to-[#0A2239] border-2 border-emerald-400/80 shadow-[0_0_30px_rgba(52,211,153,0.35)] flex items-center justify-center relative group">
            <div className="absolute inset-0 rounded-3xl bg-emerald-400/10 animate-ping duration-1000 pointer-events-none" />
            <Volume2 className="w-10 h-10 text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
          </div>
        </div>

        {/* Verification Headline */}
        <div className="flex items-center justify-center space-x-1.5 mb-1 relative z-10 text-center">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-bold tracking-wider text-slate-200 uppercase">
            DEPOSIT RECEIVED & VERIFIED
          </span>
        </div>

        {/* Amount Display */}
        <div className="text-center my-1 relative z-10">
          <div className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight drop-shadow-[0_0_16px_rgba(52,211,153,0.5)]">
            +₹{formattedAmount}
          </div>
          <div className="text-xs font-medium text-cyan-200 mt-1">
            रिलायंस पे पर ₹{rawAmountStr} प्राप्त हुए
          </div>
        </div>

        {/* Summary Card Details */}
        <div className="bg-[#0B1E36]/90 border border-slate-700/80 rounded-2xl p-4 my-4 space-y-2.5 text-xs relative z-10 shadow-inner">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Payment Status:</span>
            <span className="text-emerald-400 font-bold flex items-center">
              <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />
              Approved & Credited
            </span>
          </div>

          <div className="flex items-center justify-between border-t border-slate-800/60 pt-2">
            <span className="text-slate-400 font-medium">Destination:</span>
            <span className="text-amber-300 font-bold">Main Asset Balance</span>
          </div>

          <div className="flex items-center justify-between border-t border-slate-800/60 pt-2">
            <span className="text-slate-400 font-medium">Voice Announcement:</span>
            <span className="text-slate-300 font-medium">Hindi / Indian English (Soundbox)</span>
          </div>
        </div>

        {/* Replay Voice Alert Button */}
        <button
          onClick={handleReplay}
          className="w-full mb-3 py-3 px-4 rounded-xl bg-[#122A48] hover:bg-[#1A3A62] border border-cyan-500/40 text-cyan-200 font-bold text-xs flex items-center justify-center space-x-2 transition-all active:scale-95 shadow-md group relative z-10"
        >
          <Volume2 className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          <span>🔊 Replay Voice Alert (आवाज़ फिर से सुनें)</span>
        </button>

        {/* Continue to Portfolio Button */}
        <button
          onClick={onClose}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-sm flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all active:scale-95 relative z-10"
        >
          <span>Continue to Portfolio (सम्पन्न)</span>
        </button>

      </div>
    </div>
  );
};
