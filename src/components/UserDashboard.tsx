import React, { useState, useEffect, useContext } from 'react';
import { 
  Wallet, TrendingUp, ArrowDownRight, ArrowUpRight, Gift, Calendar, 
  ShieldCheck, Share2, Award, ChevronRight, ChevronLeft, Sparkles, MessageCircle, Download, Phone, Play, Zap 
} from 'lucide-react';
import { User, Banner, Plan, UserPlan } from '../types';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { PWAInstallModal } from './PWAInstallModal';
import { ScrollingBanner } from './ScrollingBanner';
import { WalletBalanceDisplay } from './WalletBalanceDisplay';
import { CelebrationContext } from '../App';

interface UserDashboardProps {
  user: User;
  settings: any;
  onNavigate: (tab: string) => void;
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  onOpenCheckIn: () => void;
  onOpenScratch: () => void;
  onOpenKyc: () => void;
  onOpenScamAlert?: () => void;
  onUpdateUser?: (user: User) => void;
  showToast?: (message: string, type?: 'success' | 'error') => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  user,
  settings,
  onNavigate,
  onOpenDeposit,
  onOpenWithdraw,
  onOpenCheckIn,
  onOpenScratch,
  onOpenKyc,
  onOpenScamAlert,
  onUpdateUser,
  showToast
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const { setCelebration, audioSettings, setProfitClaimModalData } = useContext(CelebrationContext);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [userPlans, setUserPlans] = useState<UserPlan[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All Portfolios');
  const [claimingId, setClaimingId] = useState<number | null>(null);
  const [claimedToday, setClaimedToday] = useState(false);
  const [claimingDaily, setClaimingDaily] = useState(false);

  const handleInstallApp = async () => {
    if (isInstallable) {
      const res = await install();
      if (!res.success && res.reason !== 'dismissed') {
        setShowInstallModal(true);
      }
    } else {
      setShowInstallModal(true);
    }
  };

  const fetchUserPlans = () => {
    fetch(`/api/user/plans/${user.id}`)
      .then(res => res.json())
      .then(data => { if (data.success) setUserPlans(data.plans); });
  };

  useEffect(() => {
    fetch('/api/banners')
      .then(res => res.json())
      .then(data => { if (data.success) setBanners(data.banners); });

    fetch('/api/plans')
      .then(res => res.json())
      .then(data => { if (data.success) setPlans(data.plans); });

    fetch(`/api/checkin/${user.id}`)
      .then(res => res.json())
      .then(data => { if (data.success) setClaimedToday(data.claimedToday); });

    fetchUserPlans();
  }, [user.id]);

  const handleClaimDaily = async () => {
    if (claimedToday || claimingDaily) return;
    setClaimingDaily(true);
    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Claim failed');

      setClaimedToday(true);
      if (onUpdateUser) {
        const userRes = await fetch(`/api/user/profile/${user.id}`);
        const userData = await userRes.json();
        if (userData.success) onUpdateUser(userData.user);
      }

      if (setCelebration) {
        setCelebration({
          message: `DAILY ATTENDANCE CLAIMED!\n+₹${data.reward || 10} Successfully Credited to Wallet`,
          buttonText: 'Awesome'
        });
      }
      if (showToast) showToast(`Successfully claimed ₹${data.reward || 10} daily attendance bonus!`, 'success');
    } catch (err: any) {
      if (showToast) showToast(err.message, 'error');
    } finally {
      setClaimingDaily(false);
    }
  };

  // Tick countdown every second for active user plans
  useEffect(() => {
    const timer = setInterval(() => {
      setUserPlans(prevPlans =>
        prevPlans.map(p => {
          if (p.status === 'active' && p.seconds_remaining && p.seconds_remaining > 0) {
            const nextSec = p.seconds_remaining - 1;
            return {
              ...p,
              seconds_remaining: nextSec,
              can_claim: nextSec <= 0 ? true : p.can_claim
            };
          }
          return p;
        })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleClaim = async (userPlanId: number) => {
    setClaimingId(userPlanId);
    try {
      const targetUserPlan = userPlans.find(up => up.id === userPlanId);

      const res = await fetch(`/api/user/plans/${userPlanId}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Claim failed');
      }

      // Open Premium Congratulations Modal matching screenshot
      if (setProfitClaimModalData) {
        setProfitClaimModalData({
          planName: targetUserPlan?.plan_name || 'RELIANCE INDUSTRIES LIMITED (RIL)',
          amount: data.amount,
          oldBalance: user.balance,
          newBalance: data.new_balance
        });
      }

      if (onUpdateUser && data.new_balance !== undefined) {
        onUpdateUser({ ...user, balance: data.new_balance });
      }
      fetchUserPlans();
    } catch (err: any) {
      if (showToast) {
        showToast(err.message, 'error');
      } else {
        alert(err.message);
      }
    } finally {
      setClaimingId(null);
    }
  };

  const formatCountdown = (secs?: number) => {
    if (!secs || secs <= 0) return 'Ready to Claim';
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const remSecs = secs % 60;
    return `${hrs.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m ${remSecs.toString().padStart(2, '0')}s`;
  };

  // 3-second auto-scroll banner
  useEffect(() => {
    if (banners.length === 0) return;
    const timer = setInterval(() => {
      setCurrentBanner(prev => (prev + 1) % banners.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null || banners.length === 0) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (diff > 40) {
      setCurrentBanner(prev => (prev + 1) % banners.length);
    } else if (diff < -40) {
      setCurrentBanner(prev => (prev - 1 + banners.length) % banners.length);
    }
    setTouchStartX(null);
  };

  return (
    <div className="space-y-4 pb-24 text-white bg-[#0A0F1D] min-h-screen px-2 sm:px-4 pt-2">
      {/* Global Scrolling Ticker Announcement Banner */}
      <ScrollingBanner onOpenScamAlert={onOpenScamAlert} />

      {/* KYC Warning Banner */}
      {user.kyc_required === 1 && (
        <div 
          onClick={onOpenKyc}
          className="bg-amber-500/10 border border-amber-500/30 rounded-3xl p-4 flex items-center space-x-3 cursor-pointer"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-black text-amber-500 tracking-tight">⚠️ KYC Verification Required</h4>
            <p className="text-[11px] text-amber-200/70 mt-1 leading-relaxed">
              Your account requires KYC verification. Withdrawal and new plan purchases are restricted. Complete KYC verification to restore these services.
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-amber-500 flex-shrink-0" />
        </div>
      )}

      {/* Home Page Side-Scrolling Banner Carousel */}
      {banners.length > 0 && (
        <div 
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative rounded-3xl overflow-hidden shadow-2xl bg-[#131B31] aspect-[21/9] sm:aspect-[2.3/1] border border-slate-800 group select-none"
        >
          {/* Side-Scrolling Horizontal Track */}
          <div 
            className="flex w-full h-full transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentBanner * 100}%)` }}
          >
            {banners.map((banner) => (
              <div
                key={banner.id}
                onClick={() => {
                  if (banner.link_url === '#wallet') onOpenDeposit();
                  else if (banner.link_url === '#referral') onNavigate('referral');
                  else if (banner.link_url === '#plans') onNavigate('plans');
                  else if (banner.link_url === '#support') onNavigate('profile');
                }}
                className="w-full h-full flex-shrink-0 relative cursor-pointer"
              >
                <img
                  src={banner.image_url}
                  alt={banner.title}
                  className="w-full h-full object-cover object-center filter brightness-[0.8] contrast-[1.05]"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1D]/90 via-transparent to-transparent flex flex-col justify-end p-3.5 sm:p-5">
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 rounded-md w-fit mb-0.5 backdrop-blur-sm">
                    FEATURED PROMO
                  </span>
                  <h2 className="text-sm sm:text-lg font-black text-white drop-shadow-sm truncate">{banner.title}</h2>
                </div>
              </div>
            ))}
          </div>

          {/* Left / Right Chevron Controls */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentBanner(prev => (prev - 1 + banners.length) % banners.length);
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-slate-950/60 hover:bg-slate-900 border border-slate-700/80 text-white flex items-center justify-center backdrop-blur-md opacity-80 group-hover:opacity-100 transition active:scale-95"
            aria-label="Previous Banner"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentBanner(prev => (prev + 1) % banners.length);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-slate-950/60 hover:bg-slate-900 border border-slate-700/80 text-white flex items-center justify-center backdrop-blur-md opacity-80 group-hover:opacity-100 transition active:scale-95"
            aria-label="Next Banner"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Active Banner Indicator Dots */}
          <div className="absolute bottom-3 right-3 flex items-center space-x-1.5 z-20 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full border border-slate-800">
            {banners.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentBanner(i);
                }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === currentBanner ? 'w-5 bg-blue-500 shadow-lg' : 'w-2 bg-slate-600 hover:bg-slate-500'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Available Asset Balance Card */}
      <div className="bg-[#131B31] rounded-3xl p-5 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-yellow-400" />
              <span className="text-[11px] font-bold text-slate-400 tracking-wider">AVAILABLE ASSET BALANCE</span>
            </div>
            <div className="flex items-center space-x-3 mt-1 text-[10px] font-mono text-slate-500 uppercase">
              <span>UID: {user.user_code}</span>
              <div className="w-1 h-1 rounded-full bg-slate-700" />
              <span>REF: {user.referral_code}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center space-x-1.5 text-[9px] font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              <Sparkles className="w-3 h-3" />
              <span>ACTIVE SYNC</span>
            </span>
          </div>
        </div>

        <div className="mb-6 flex items-baseline">
          <WalletBalanceDisplay 
            balance={user.balance} 
            userId={user.id}
            onUpdateUser={onUpdateUser}
            showToast={showToast}
          />
        </div>

        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800 mb-5 text-center">
          <div className="bg-[#0B1220] p-2.5 rounded-2xl border border-slate-800">
            <p className="text-[10px] text-slate-400">TOTAL RECHARGE</p>
            <p className="text-sm font-bold text-white mt-0.5">₹{user.deposited.toLocaleString()}</p>
          </div>
          <div className="bg-[#0B1220] p-2.5 rounded-2xl border border-slate-800">
            <p className="text-[10px] text-slate-400">TOTAL WITHDRAW</p>
            <p className="text-sm font-bold text-white mt-0.5">₹{user.withdrawn.toLocaleString()}</p>
          </div>
          <div className="bg-[#0B1220] p-2.5 rounded-2xl border border-slate-800">
            <p className="text-[10px] text-slate-400">TOTAL GAIN</p>
            <p className="text-sm font-bold text-emerald-400 mt-0.5">+₹{(user.balance * 0.15).toFixed(0)}</p>
          </div>
        </div>

        {/* 4 Action Buttons */}
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={onOpenDeposit}
            className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black font-black py-3 rounded-2xl flex flex-col items-center justify-center space-y-1 shadow-lg shadow-yellow-900/20 transition"
          >
            <ArrowDownRight className="w-5 h-5" />
            <span className="text-[11px]">Recharge</span>
          </button>
          <button
            onClick={onOpenWithdraw}
            className="bg-[#0B1220] hover:bg-slate-800 text-slate-300 font-bold py-3 rounded-2xl flex flex-col items-center justify-center space-y-1 border border-slate-800 transition"
          >
            <ArrowUpRight className="w-5 h-5 text-blue-400" />
            <span className="text-[11px]">Withdraw</span>
          </button>
          <button
            onClick={() => onNavigate('referral')}
            className="bg-[#0B1220] hover:bg-slate-800 text-slate-300 font-bold py-3 rounded-2xl flex flex-col items-center justify-center space-y-1 border border-slate-800 transition"
          >
            <Share2 className="w-5 h-5 text-blue-400" />
            <span className="text-[11px]">Referral</span>
          </button>
          <button
            onClick={() => onNavigate('profile')}
            className="bg-[#0B1220] hover:bg-slate-800 text-slate-300 font-bold py-3 rounded-2xl flex flex-col items-center justify-center space-y-1 border border-slate-800 transition"
          >
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-[11px]">Profile</span>
          </button>
        </div>
      </div>

      {/* Daily Attendance Bonus Card - ₹10 */}
      <div className="bg-[#131B31] border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl flex items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 p-0.5 shadow-sm flex items-center justify-center flex-shrink-0">
            <div className="w-full h-full bg-[#0B1220] rounded-[14px] flex items-center justify-center text-blue-400">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-black text-white">Daily Attendance Bonus</h3>
              <span className="bg-blue-500/10 text-blue-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-blue-500/30">
                ₹10 FREE CASH
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Claim your daily attendance reward every 24 hours.</p>
          </div>
        </div>

        <button
          onClick={handleClaimDaily}
          disabled={claimedToday || claimingDaily}
          className={`px-4 py-2.5 rounded-2xl font-black text-xs transition shadow-md flex items-center space-x-1.5 flex-shrink-0 ${
            claimedToday
              ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed shadow-none'
              : 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-blue-900/25 active:scale-95'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{claimedToday ? 'Claimed Today ✓' : claimingDaily ? 'Claiming...' : 'Claim ₹10 Now'}</span>
        </button>
      </div>

      {/* Official 24/7 Help Desk & Quick Services */}
      <div className="bg-[#131B31] border border-slate-800 rounded-3xl p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xs font-bold text-slate-400">Official 24/7 Help Desk & Quick Services</h3>
          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30 animate-pulse">
            ACTIVE ONLINE
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button 
            onClick={() => onNavigate('profile')}
            className="bg-[#0B1220] hover:bg-slate-800 border border-slate-800 p-3 rounded-2xl flex flex-col items-center text-center relative transition"
          >
            <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center">1</span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-1.5">
              <MessageCircle className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white">Help Desk</span>
            <span className="text-[9px] text-slate-400">Chat Bot 24/7</span>
          </button>

          <button 
            onClick={handleInstallApp}
            className="bg-[#0B1220] hover:bg-slate-800 border border-slate-800 p-3 rounded-2xl flex flex-col items-center text-center relative transition"
          >
            <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center">2</span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-1.5">
              <Download className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white">{isInstalled ? 'App Active' : 'Install App'}</span>
            <span className="text-[9px] text-slate-400">{isInstalled ? 'Standalone' : 'PWA Fast'}</span>
          </button>

          <button 
            onClick={() => {
              const waUrl = settings.whatsapp_link || 'https://wa.me/919549425930?text=Hello%20Devender%20Rathore%2C%20I%20need%20help%20with%20Reliance%20Pay.';
              window.open(waUrl, '_blank', 'noopener,noreferrer');
            }}
            className="bg-[#0B1220] hover:bg-slate-800 border border-slate-800 p-3 rounded-2xl flex flex-col items-center text-center relative transition"
          >
            <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] font-bold flex items-center justify-center">3</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-1.5">
              <Phone className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white">WhatsApp</span>
            <span className="text-[9px] text-emerald-400 font-bold">Helpline</span>
          </button>
        </div>
      </div>

      {/* Reliance Pay Official PWA Installation / Standalone Status Card */}
      {!isInstalled ? (
        <div className="bg-[#131B31] border border-blue-900/40 rounded-3xl p-4 flex items-center justify-between shadow-xl">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold flex-shrink-0">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-extrabold text-sm text-white">{settings.app_name || 'Reliance Pay'} Official Web App</h4>
                <span className="bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">PWA FAST</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Install on phone home screen for 1-tap instant secure standalone access.</p>
            </div>
          </div>
          <button 
            onClick={handleInstallApp}
            className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-black px-4 py-2.5 rounded-2xl text-xs flex items-center space-x-1.5 shadow-md shadow-blue-900/25 transition flex-shrink-0 active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>INSTALL APP</span>
          </button>
        </div>
      ) : (
        <div className="bg-[#131B31] border border-emerald-900/40 rounded-3xl p-3.5 px-4 flex items-center justify-between shadow-xl">
          <div className="flex items-center space-x-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-emerald-400">Standalone App Mode Active</span>
            <span className="text-[10px] text-slate-400">• High-Speed Realtime Sync</span>
          </div>
          <span className="text-[10px] bg-[#0B1220] text-slate-300 font-semibold px-2.5 py-1 rounded-xl border border-slate-800">
            Reliance Pay PWA
          </span>
        </div>
      )}

      {/* Daily Attendance Bonus */}
      <div className="bg-[#131B31] border border-purple-900/40 rounded-3xl p-4 flex items-center justify-between shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="font-extrabold text-sm text-white">Daily Attendance Bonus</h4>
              <span className="bg-purple-500/10 text-purple-400 text-[9px] font-bold px-2 py-0.5 rounded-full">+₹10 FREE</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Check in daily to claim instant cash reward credited directly to your wallet.</p>
          </div>
        </div>
        <button
          onClick={onOpenCheckIn}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold px-4 py-2.5 rounded-2xl text-xs shadow-md shadow-purple-900/20 transition flex-shrink-0"
        >
          Claim ₹10
        </button>
      </div>

      {/* Your Active Investments & 12-Hour Claim System */}
      <div className="bg-[#131B31] border border-slate-800 rounded-3xl p-4 shadow-xl">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-black text-white">Your Active Investments ({userPlans.length})</h3>
          </div>
          <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full font-bold">
            12-Hour Automated Payout
          </span>
        </div>

        {userPlans.length === 0 ? (
          <div className="bg-[#0B1220] border border-slate-800 rounded-2xl p-6 text-center">
            <p className="text-xs text-slate-400 mb-3">You do not have any active wealth plans currently.</p>
            <button
              onClick={() => onNavigate('plans')}
              className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold px-6 py-2.5 rounded-2xl text-xs shadow-md shadow-blue-900/25 transition"
            >
              Start Investing
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {userPlans.map(up => {
              const totalClaims = up.total_claims || ((up.duration_days || 7) * 2);
              const claimsDone = up.claims_completed || 0;
              const progressPct = Math.min(100, Math.round((claimsDone / totalClaims) * 100));
              const claimAmt = up.claim_amount || (up.daily_return / 2);

              return (
                <div key={up.id} className="bg-[#0B1220] border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-sm text-white">{up.plan_name}</h4>
                        <span className="text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-bold uppercase">
                          {up.category || 'Stable'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Invested: <span className="text-white font-bold">₹{up.amount.toLocaleString('en-IN')}</span> | Daily: <span className="text-emerald-400 font-bold">₹{up.daily_return.toLocaleString('en-IN')}</span>
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-black text-emerald-400">
                        ₹{(up.earned_so_far || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-[9px] text-slate-400">of ₹{up.total_return.toLocaleString('en-IN')} total</p>
                    </div>
                  </div>

                  {/* Claims Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Claims Progress: <span className="text-white font-bold">{claimsDone} / {totalClaims}</span> ({progressPct}%)</span>
                      <span>Next Payout: <span className="text-emerald-400 font-bold">₹{claimAmt.toLocaleString('en-IN')}</span></span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700">
                      <div 
                        className="bg-gradient-to-r from-blue-600 to-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Claim Action or Countdown Status */}
                  <div className="pt-1 flex items-center justify-between">
                    {up.status === 'completed' ? (
                      <span className="w-full text-center py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs rounded-xl">
                        Contract Completed & Fully Settled
                      </span>
                    ) : up.can_claim ? (
                      <button
                        onClick={() => handleClaim(up.id)}
                        disabled={claimingId === up.id}
                        className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-slate-950 font-black py-2.5 rounded-xl text-xs shadow-lg shadow-emerald-900/25 flex items-center justify-center space-x-2 transition disabled:opacity-50 animate-pulse"
                      >
                        <Zap className="w-4 h-4 fill-slate-950" />
                        <span>
                          {claimingId === up.id ? 'Processing Server Claim...' : `Claim 12h Dividend (₹${claimAmt.toLocaleString('en-IN')})`}
                        </span>
                      </button>
                    ) : (
                      <div className="w-full flex items-center justify-between bg-[#0A0F1D] border border-slate-800 px-3 py-2 rounded-xl text-xs shadow-inner">
                        <span className="text-[11px] text-slate-400 flex items-center space-x-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                          <span>Dividend Accumulating</span>
                        </span>
                        <span className="font-mono font-bold text-blue-400 text-[11px]">
                          Next: {formatCountdown(up.seconds_remaining)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Investment Portfolios (प्लान) */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <div>
            <h3 className="font-extrabold text-base text-white">Investment Portfolios (प्लान)</h3>
            <p className="text-[11px] text-slate-400">Select categories on the side to switch portfolios instantly.</p>
          </div>
          <button onClick={() => onNavigate('plans')} className="text-pink-400 text-xs font-semibold flex items-center hover:underline">
            <span>View All ({plans.length})</span>
            <ChevronRight className="w-4 h-4 ml-0.5" />
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-none mb-4">
          {['All Portfolios', 'Stable', 'VIP Welfare', 'High Return', 'VIP Elite'].map(cat => {
            const count = cat === 'All Portfolios' 
              ? plans.length 
              : plans.filter(p => p.category === cat).length;

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition flex items-center space-x-1.5 ${
                  selectedCategory === cat 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30 border border-blue-500/50' 
                    : 'bg-[#131B31] text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                <span>{cat}</span>
                <span className="bg-[#0B1220] px-1.5 py-0.5 rounded-full text-[9px]">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Investment Plan Cards Grid matching screenshot */}
        <div className="space-y-4">
          {plans
            .filter(p => selectedCategory === 'All Portfolios' || p.category === selectedCategory)
            .map((plan) => {
              const roiPercent = Math.round((plan.total_return / plan.amount) * 100);
              const claim12h = plan.claim_amount || (plan.daily_return / 2);
              const claimsTotal = plan.total_claims || (plan.duration_days * 2);

              return (
                <div key={plan.id} className="bg-[#131B31] border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl relative overflow-hidden group hover:border-blue-500/50 transition">
                  {/* ROI Badge */}
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-emerald-950/80 via-slate-900/90 to-transparent px-3.5 py-1 rounded-bl-2xl border-l border-b border-emerald-500/30 flex items-center space-x-1 text-emerald-400 text-[11px] font-black z-20 backdrop-blur-sm">
                    <Zap className="w-3.5 h-3.5 text-emerald-400" />
                    <span>+{roiPercent}% ROI</span>
                  </div>

                  {/* Portfolio Asset Compartment */}
                  <div className="relative rounded-2xl overflow-hidden mb-4 p-4 border border-slate-800 min-h-[130px] flex flex-col justify-end bg-slate-950">
                    <img
                      src={plan.image_url || '/public/assets/aistudio/Reliance-Industries_e2922df4.webp'}
                      alt={plan.name}
                      loading="lazy"
                      className={`absolute inset-0 w-full h-full object-center transition-transform duration-700 group-hover:scale-105 ${
                        plan.layout === 'side' ? 'object-contain p-2' : 'object-cover'
                      }`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1D] via-[#0A0F1D]/80 to-transparent" />

                    <div className="relative z-10 space-y-1.5">
                      <div className="flex items-center space-x-2">
                        <span className="bg-blue-600/90 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-blue-400/40 uppercase tracking-wider backdrop-blur-md shadow-sm">
                          {plan.category || 'Stable'}
                        </span>
                        <span className="bg-emerald-600/80 text-emerald-100 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-400/40 backdrop-blur-md flex items-center space-x-1 shadow-sm">
                          <ShieldCheck className="w-3 h-3 text-emerald-300" />
                          <span>{plan.joined_users || 0} / {plan.capacity || 800} User Join</span>
                        </span>
                      </div>
                      <h4 className="font-black text-white text-lg tracking-wide drop-shadow-md leading-snug">
                        {plan.name}
                      </h4>
                      <p className="text-[11px] text-slate-300 line-clamp-2 drop-shadow font-medium">
                        {plan.description || 'Verified energy & infrastructure growth portfolio'}
                      </p>
                    </div>
                  </div>

                  {/* 3 Stats Columns */}
                  <div className="grid grid-cols-3 gap-2 bg-[#0B1220] border border-slate-800 rounded-2xl p-3 mb-4 text-center">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">PRICE</p>
                      <p className="text-base font-black text-white mt-0.5">₹{plan.amount.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="border-x border-slate-800">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">DAILY</p>
                      <p className="text-base font-black text-emerald-400 mt-0.5">₹{plan.daily_return.toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">CYCLE</p>
                      <p className="text-base font-black text-blue-400 mt-0.5">{plan.duration_days} Days</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-4 text-xs text-slate-400 px-1">
                    <span>12h Payout: <strong className="text-emerald-400">₹{claim12h.toLocaleString('en-IN')}</strong></span>
                    <span className="font-bold text-slate-300">Total <span className="text-pink-500 font-black">₹{plan.total_return.toLocaleString('en-IN')}</span></span>
                  </div>

                  <button
                    onClick={() => onNavigate('plans')}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-500 text-white font-black py-3.5 rounded-2xl shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 transition"
                  >
                    <span>Invest Now (₹{plan.amount.toLocaleString('en-IN')})</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
        </div>
      </div>

      {/* PWA Install Modal */}
      <PWAInstallModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
        onInstallNative={install}
        isInstallable={isInstallable}
        isIOS={isIOS}
        isInstalled={isInstalled}
      />
    </div>
  );
};
