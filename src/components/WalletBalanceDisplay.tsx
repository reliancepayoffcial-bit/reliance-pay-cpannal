import React, { useState } from 'react';
import { RefreshCw, Sparkles } from 'lucide-react';
import { useAnimatedNumber } from '../hooks/useAnimatedNumber';

interface WalletBalanceDisplayProps {
  balance: number;
  userId?: number;
  onUpdateUser?: (updatedUser: any) => void;
  showToast?: (msg: string, type?: 'success' | 'error') => void;
  className?: string;
  currencyClassName?: string;
  showRefreshBtn?: boolean;
}

export const WalletBalanceDisplay: React.FC<WalletBalanceDisplayProps> = ({
  balance,
  userId,
  onUpdateUser,
  showToast,
  className = "text-3xl sm:text-5xl font-black text-white tracking-tighter",
  currencyClassName = "text-amber-500 text-2xl sm:text-3xl mr-1",
  showRefreshBtn = true
}) => {
  const { displayValue, isAnimating, isRefreshing, refreshFromOne } = useAnimatedNumber(balance, 1500);
  const [isFetching, setIsFetching] = useState(false);

  const playCashRegisterSound = () => {
    try {
      const audio = new Audio('/assets/aistudio/__Coin_Message_Tone_____Coins_Jaisi_Sound_Wala_Notification_Tone___Best_Msg_Tone_______256k__4ed2597e.mp3');
      audio.volume = 1.0;
      audio.play().catch(() => {});
    } catch (_) {}
  };

  const handleRefresh = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isFetching || isRefreshing) return;
    setIsFetching(true);
    playCashRegisterSound();

    try {
      let latestBalance = balance;
      if (userId) {
        const res = await fetch(`/api/wallet/${userId}`);
        const data = await res.json();
        if (data.success && data.user) {
          latestBalance = data.user.balance;
          if (onUpdateUser) {
            onUpdateUser(data.user);
          }
        }
      }

      // Trigger 5-second count-up animation starting from ₹1.00
      refreshFromOne(latestBalance, 5000);
      if (showToast) {
        showToast('Wallet balance syncing... counting up from ₹1.00!', 'success');
      }
    } catch (_) {
      refreshFromOne(balance, 5000);
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 w-full">
      <div className={`relative inline-flex items-baseline transition-all duration-500 ${isAnimating ? 'scale-105' : ''}`}>
        <span className="text-3xl sm:text-5xl font-black text-white tracking-tighter">
          <span className={currencyClassName}>₹</span>
          {displayValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>

        {isRefreshing && (
          <span className="ml-2.5 text-[10px] sm:text-xs font-black text-amber-300 bg-amber-500/20 border border-amber-500/40 px-2.5 py-1 rounded-full animate-pulse flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-amber-400 animate-spin" />
            <span>COUNTING UP (5S)...</span>
          </span>
        )}
      </div>

      {showRefreshBtn && (
        <button
          onClick={handleRefresh}
          disabled={isFetching || isRefreshing}
          className="flex items-center space-x-1.5 bg-gradient-to-r from-amber-500/20 via-amber-400/10 to-sky-500/20 hover:from-amber-500/30 hover:to-sky-500/30 border border-amber-500/40 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-300 hover:text-white transition shadow-md active:scale-95 disabled:opacity-60"
          title="Refresh Balance (5-Second Count Up)"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isFetching || isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Syncing (5s)...' : 'Refresh Balance'}</span>
        </button>
      )}
    </div>
  );
};

