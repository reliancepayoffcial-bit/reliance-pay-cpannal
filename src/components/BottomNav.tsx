import React, { useState, useEffect } from 'react';
import { Home, TrendingUp, Users, Clock, User } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'referral', label: 'Referral', icon: Users },
    { id: 'plans', label: 'Plans', icon: TrendingUp },
    { id: 'home', label: 'Home', icon: Home },
    { id: 'record', label: 'Record', icon: Clock },
    { id: 'profile', label: 'My Profile', icon: User },
  ];

  const getIndex = (id: string) => {
    const idx = navItems.findIndex(item => item.id === id);
    return idx >= 0 ? idx : 2;
  };

  const currentIndex = getIndex(activeTab);
  const [rotation, setRotation] = useState(0);
  const [prevIndex, setPrevIndex] = useState(currentIndex);

  useEffect(() => {
    if (currentIndex !== prevIndex) {
      // Rotate exactly two complete 360-degree rotations (720 deg)
      const direction = currentIndex >= prevIndex ? 1 : -1;
      setRotation(prev => prev + direction * 720);
      setPrevIndex(currentIndex);
    }
  }, [currentIndex, prevIndex]);

  return (
    <nav 
      aria-label="Reliance Pay Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#131B31]/95 backdrop-blur-2xl border-t border-slate-800 text-white shadow-[0_-4px_20px_rgba(0,0,0,0.3)] select-none pb-safe"
    >
      <div className="max-w-md sm:max-w-lg mx-auto relative px-1 h-16 sm:h-20 flex items-center">
        
        {/* Floating 3D Logo Track / Slider Container */}
        <div 
          className="absolute top-0 left-0 h-full w-[20%] pointer-events-none transition-transform duration-600 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-20"
          style={{ transform: `translateX(${currentIndex * 100}%)` }}
        >
          {/* Floating Circular 3D Logo Wrapper */}
          <div className="relative w-full h-full flex flex-col items-center justify-start -top-5 sm:-top-7">
            
            {/* Outer Electric Blue & Metallic Gold Circular Glow Aura */}
            <div className="absolute w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-sky-500 via-amber-400 to-red-500 blur-md opacity-70 animate-pulse" />
            
            {/* Single Parent Rotation Wrapper: Both Logo and Outer Ring rotate together as ONE combined unit (720° on tab click) */}
            <div 
              className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-transform duration-600 ease-[cubic-bezier(0.34,1.56,0.64,1)] origin-center filter drop-shadow-[0_4px_16px_rgba(56,189,248,0.55)] drop-shadow-[0_0_12px_rgba(251,191,36,0.45)]"
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              {/* Complete 3D Jio Emblem & Ring Assembly (High clarity, vivid contrast, crisp edges) */}
              <img 
                src="/assets/reliance_pay_bottom_nav_jio_emblem.png" 
                alt="3D Jio Emblem Indicator" 
                className="w-full h-full object-contain filter brightness-[1.12] contrast-[1.18] saturate-[1.15] drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
              />
            </div>

            {/* Glowing Ground Indicator Dot */}
            <div className="w-6 h-1 bg-gradient-to-r from-sky-400 via-amber-300 to-red-400 rounded-full mt-1 shadow-[0_0_10px_#38bdf8] opacity-90" />
          </div>
        </div>

        {/* 5 Bottom Navigation Buttons Grid */}
        <div className="grid grid-cols-5 w-full h-full relative z-10">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`group relative flex flex-col items-center justify-end pb-2 pt-1 transition-all duration-300 ${
                  isActive ? 'text-blue-400 font-bold scale-105' : 'text-slate-500 hover:text-slate-300'
                }`}
                style={{ cursor: 'pointer' }}
              >
                {/* Icon with subtle active glow */}
                <div className={`transition-transform duration-300 ${isActive ? 'translate-y-[-2px] text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.3)]' : 'group-hover:scale-110'}`}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>

                {/* Tab Label */}
                <span className={`text-[10px] sm:text-xs tracking-tight transition-colors duration-300 mt-1 ${
                  isActive 
                    ? 'font-extrabold text-blue-400' 
                    : 'text-slate-500 font-medium'
                }`}>
                  {item.label}
                </span>

                {/* Active Light Glow Backdrop */}
                {isActive && (
                  <div className="absolute inset-x-2 bottom-0 h-1 bg-amber-400/20 rounded-full blur-xs" />
                )}
              </button>
            );
          })}
        </div>

      </div>
    </nav>
  );
};

