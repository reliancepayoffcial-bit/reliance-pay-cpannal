import React, { useState, useEffect } from 'react';
import { Volume2, AlertTriangle } from 'lucide-react';

interface ScrollingBannerProps {
  announcements?: string[];
  onOpenScamAlert?: () => void;
}

export const ScrollingBanner: React.FC<ScrollingBannerProps> = ({ announcements, onOpenScamAlert }) => {
  const [items, setItems] = useState<string[]>([]);

  useEffect(() => {
    if (announcements && announcements.length > 0) {
      setItems(announcements);
    } else {
      fetch('/api/announcements')
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.announcements) && data.announcements.length > 0) {
            setItems(data.announcements);
          } else {
            setItems([
              'Welcome to Reliance Pay! 12-Hour automated dividend distribution is active.',
              'Instant UPI Deposits & 24x7 Verified Payouts active across all channels.',
              '⚠️ Security Alert: Reliance Pay will never ask for your OTP, password or PIN!'
            ]);
          }
        })
        .catch(() => {
          setItems([
            'Welcome to Reliance Pay! 12-Hour automated dividend distribution is active.',
            'Instant UPI Deposits & 24x7 Verified Payouts active across all channels.'
          ]);
        });
    }
  }, [announcements]);

  const marqueeText = items.join('   •   ');

  return (
    <div
      onClick={() => onOpenScamAlert && onOpenScamAlert()}
      className="bg-[#131B31] border border-amber-500/30 rounded-2xl px-3 py-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-800/90 transition shadow-md overflow-hidden group"
    >
      <div className="flex items-center space-x-2.5 min-w-0 flex-1 overflow-hidden">
        <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider flex items-center space-x-1 flex-shrink-0">
          <Volume2 className="w-3 h-3 text-slate-950 stroke-[3]" />
          <span>SECURITY NOTICE</span>
        </span>
        
        <div className="overflow-hidden whitespace-nowrap relative w-full text-xs font-semibold text-amber-200">
          <div className="inline-block animate-marquee font-mono tracking-wide">
            {marqueeText} &nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp; {marqueeText}
          </div>
        </div>
      </div>

      <span className="text-[10px] bg-amber-500/20 text-amber-400 font-bold px-2 py-0.5 rounded-full border border-amber-500/40 flex-shrink-0 ml-2 group-hover:bg-amber-500 group-hover:text-slate-950 transition">
        VIEW ALERT ➔
      </span>
    </div>
  );
};
