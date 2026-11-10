import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowDownRight, ArrowUpRight, Sparkles, Gift, Users, ShieldCheck, 
  Clock, CheckCircle2, TrendingUp, X 
} from 'lucide-react';
import { LiveActivity, LiveActivityType } from '../types';

interface LiveActivityNotificationProps {
  className?: string;
}

export const LiveActivityNotification: React.FC<LiveActivityNotificationProps> = ({ className = "" }) => {
  const [activities, setActivities] = useState<LiveActivity[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(!document.hidden);
  const [isDismissed, setIsDismissed] = useState(false);
  const rotationTimerRef = useRef<any>(null);

  // 1. Fetch genuine server-confirmed live activities
  const fetchActivities = async () => {
    try {
      const res = await fetch('/api/activities/live');
      const data = await res.json();
      if (data.success && Array.isArray(data.activities) && data.activities.length > 0) {
        setActivities(data.activities);
      }
    } catch (_) {
      // Keep existing activities if fetch fails
    }
  };

  useEffect(() => {
    fetchActivities();
    const refreshInterval = setInterval(fetchActivities, 60000); // Background sync every 60s
    return () => clearInterval(refreshInterval);
  }, []);

  // 2. Pause animations and rotations when page is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPageVisible(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // 3. Rotate notification every 10 seconds with smooth slide transition
  useEffect(() => {
    if (!isPageVisible || activities.length === 0 || isDismissed) return;

    rotationTimerRef.current = setInterval(() => {
      // Trigger smooth slide-out
      setIsExiting(true);

      setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % activities.length);
        setIsExiting(false);
      }, 400); // Matches transition duration
    }, 10000); // Exactly 10 seconds interval

    return () => {
      if (rotationTimerRef.current) clearInterval(rotationTimerRef.current);
    };
  }, [activities.length, isPageVisible, isDismissed]);

  if (activities.length === 0 || isDismissed) return null;

  const current = activities[currentIndex] || activities[0];

  // Helper icon & styling per activity type
  const getActivityStyle = (type: LiveActivityType) => {
    switch (type) {
      case 'deposit_success':
        return {
          icon: ArrowDownRight,
          badgeColor: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
          iconBg: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-emerald-500/20',
          tag: 'Deposit Successful',
          accent: 'text-emerald-400 font-extrabold'
        };
      case 'withdrawal_success':
        return {
          icon: ArrowUpRight,
          badgeColor: 'text-sky-400 bg-sky-500/15 border-sky-500/30',
          iconBg: 'bg-sky-500/20 text-sky-400 border border-sky-500/40 shadow-sky-500/20',
          tag: 'Withdrawal Successful',
          accent: 'text-sky-300 font-extrabold'
        };
      case 'bonus_received':
        return {
          icon: Sparkles,
          badgeColor: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
          iconBg: 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-amber-500/20',
          tag: 'Bonus Received',
          accent: 'text-amber-300 font-extrabold'
        };
      case 'referral_bonus':
        return {
          icon: Users,
          badgeColor: 'text-purple-300 bg-purple-500/15 border-purple-500/30',
          iconBg: 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-purple-500/20',
          tag: 'Referral Bonus Received',
          accent: 'text-amber-300 font-extrabold'
        };
      case 'verification_completed':
        return {
          icon: ShieldCheck,
          badgeColor: 'text-blue-400 bg-blue-500/15 border-blue-500/30',
          iconBg: 'bg-blue-500/20 text-blue-400 border border-blue-500/40 shadow-blue-500/20',
          tag: 'Account Verification Completed',
          accent: 'text-blue-300 font-extrabold'
        };
      default:
        return {
          icon: TrendingUp,
          badgeColor: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
          iconBg: 'bg-amber-500/20 text-amber-400 border border-amber-500/40',
          tag: 'Live Activity',
          accent: 'text-white'
        };
    }
  };

  const style = getActivityStyle(current.type);
  const IconComponent = style.icon;

  return (
    <aside 
      aria-label="Live Activity Notification"
      className={`fixed bottom-[4.5rem] sm:bottom-20 left-2.5 right-14 sm:right-auto sm:left-6 max-w-[290px] xs:max-w-[320px] sm:max-w-[340px] z-30 select-none pointer-events-auto transition-all duration-300 ${className}`}
    >
      <div 
        className={`relative w-full rounded-xl bg-gradient-to-r from-[#070D1A]/95 via-[#0C172E]/95 to-[#060D1A]/95 border border-sky-500/35 hover:border-amber-400/50 shadow-[0_6px_24px_rgba(2,132,199,0.22)] py-1.5 px-2 sm:py-2 sm:px-2.5 overflow-hidden backdrop-blur-2xl transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isExiting 
            ? 'opacity-0 translate-y-2 scale-95 pointer-events-none' 
            : 'opacity-100 translate-y-0 scale-100'
        }`}
      >
        {/* Subtle Metallic Gold & Blue Ambient Accent Bottom Line */}
        <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-sky-500/30 via-amber-400/60 to-sky-500/30" />

        <div className="flex items-center justify-between gap-2">
          {/* Left: Compact Activity Icon */}
          <div className={`w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm ${style.iconBg}`}>
            <IconComponent className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-pulse" />
          </div>

          {/* Center: Notification Text */}
          <div className="flex-1 min-w-0 pr-0.5">
            <div className="flex items-center space-x-1 leading-none mb-0.5">
              <span className={`text-[8px] font-black uppercase px-1.5 py-0.2 rounded border ${style.badgeColor}`}>
                {style.tag}
              </span>
              {current.is_demo && (
                <span className="text-[7px] font-black text-amber-300/90 bg-amber-500/10 px-1 py-0.2 rounded border border-amber-500/20 uppercase tracking-tighter">
                  DEMO
                </span>
              )}
            </div>

            <p className="text-[10px] sm:text-[11px] text-slate-200 font-medium truncate leading-tight">
              <strong className="text-white font-bold">{current.user_display}</strong>{' '}
              <span className="text-slate-400 font-mono text-[9px]">({current.mobile_masked})</span>{' '}
              {current.amount !== undefined && current.amount > 0 && (
                <span className={style.accent}>
                  ₹{current.amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                </span>
              )}
            </p>
          </div>

          {/* Right: Activity Time & Live Beacon */}
          <div className="flex flex-col items-end flex-shrink-0 text-right leading-none">
            <div className="flex items-center space-x-0.5 text-[8px] sm:text-[9px] text-slate-400">
              <Clock className="w-2.5 h-2.5 text-slate-500" />
              <span>{current.time_ago}</span>
            </div>
            <span className="inline-flex items-center space-x-0.5 text-[7px] text-emerald-400 font-black mt-0.5">
              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span>LIVE</span>
            </span>
          </div>

          {/* Small Close Button */}
          <button
            onClick={() => setIsDismissed(true)}
            className="p-0.5 -mr-0.5 text-slate-500 hover:text-slate-300 rounded hover:bg-slate-800/60 transition"
            title="Dismiss"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </aside>
  );
};
