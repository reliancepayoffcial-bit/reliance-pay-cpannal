import React, { useState, useEffect } from 'react';

interface AnimatedLoadingScreenProps {
  isReady: boolean;
  onFinish?: () => void;
}

export const AnimatedLoadingScreen: React.FC<AnimatedLoadingScreenProps> = ({ isReady, onFinish }) => {
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isUnmounted, setIsUnmounted] = useState(false);

  useEffect(() => {
    // Smooth progress increment
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95 && !isReady) return 95;
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const step = isReady ? 15 : Math.floor(Math.random() * 8) + 4;
        return Math.min(prev + step, 100);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isReady]);

  // Safety fallback
  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      setProgress(100);
    }, 2800);
    return () => clearTimeout(safetyTimer);
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      const fadeTimer = setTimeout(() => {
        setIsFadingOut(true);
      }, 300);

      const unmountTimer = setTimeout(() => {
        setIsUnmounted(true);
        if (onFinish) onFinish();
      }, 900);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(unmountTimer);
      };
    }
  }, [progress, onFinish]);

  if (isUnmounted) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-[#050811] via-[#0B1120] to-[#060914] text-white transition-opacity duration-700 ease-out px-4 overflow-hidden ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-label="Reliance Pay Loading Screen"
      role="status"
    >
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] sm:w-[500px] sm:h-[500px] bg-blue-600/15 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] sm:w-[350px] sm:h-[350px] bg-amber-500/15 rounded-full blur-[80px]" />
      </div>

      <div className="relative flex flex-col items-center w-full max-w-[280px] sm:max-w-[320px] text-center z-10">
        
        {/* Perfect 1:1 Circular Logo Frame & Dual Rotating Rings */}
        <div className="relative w-[180px] h-[180px] sm:w-[260px] sm:h-[260px] aspect-square flex items-center justify-center mb-6">
          
          {/* Outer Electric Blue 360-Degree Rotating Ring */}
          <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-sky-400 border-r-blue-500 shadow-[0_0_25px_rgba(56,189,248,0.5)] animate-[spin_6s_linear_infinite] motion-reduce:animate-none pointer-events-none" />
          
          {/* Inner Metallic Gold Counter-Rotating Ring */}
          <div className="absolute inset-2 sm:inset-3 rounded-full border-[3px] border-transparent border-b-amber-400 border-l-yellow-500 shadow-[0_0_20px_rgba(251,191,36,0.5)] animate-[spin-reverse_4.5s_linear_infinite] motion-reduce:animate-none pointer-events-none" />

          {/* Perfect Circular Inner Glass Frame for the Logo */}
          <div className="relative z-10 w-[82%] h-[82%] rounded-full bg-gradient-to-b from-[#0D1527] via-[#090E1B] to-[#070B16] border border-amber-500/30 p-3 sm:p-4 flex items-center justify-center overflow-hidden shadow-2xl backdrop-blur-md animate-float motion-reduce:animate-none">
            
            {/* Complete 3D Reliance Pay Logo from uploaded image (100% inside circle, object-contain, high clarity) */}
            <img 
              src="/assets/reliance_pay_3d_square.png" 
              alt="Reliance Pay 3D Metallic Logo" 
              className="w-full h-full object-contain filter brightness-[1.12] contrast-[1.15] drop-shadow-[0_4px_20px_rgba(239,68,68,0.45)] drop-shadow-[0_0_15px_rgba(251,191,36,0.4)]"
            />
          </div>
        </div>

        {/* Brand Name Typography */}
        <div className="space-y-1 mb-6">
          <h1 className="text-xl sm:text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-amber-300 drop-shadow-[0_2px_8px_rgba(255,255,255,0.2)] uppercase">
            RELIANCE PAY
          </h1>
          <div className="inline-block px-3 py-0.5 rounded-full bg-slate-900/80 border border-amber-500/30 shadow-inner">
            <p className="text-[10px] sm:text-xs font-bold text-amber-300 tracking-wide">
              Grow • Earn • Be Happy
            </p>
          </div>
        </div>

        {/* Glowing Progress Bar */}
        <div className="w-full space-y-2">
          <div className="w-full h-2.5 bg-slate-900/90 rounded-full border border-slate-700/80 p-0.5 overflow-hidden shadow-inner relative">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 via-sky-400 to-amber-400 rounded-full shadow-[0_0_12px_#38bdf8] transition-all duration-300 ease-out relative overflow-hidden"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
            </div>
          </div>

          {/* Progress Status */}
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 px-1">
            <div className="flex items-center space-x-1.5 text-sky-300">
              <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Securing Your Experience...</span>
            </div>
            <span className="font-mono text-amber-300 font-bold">{progress}%</span>
          </div>
        </div>

      </div>

      {/* Keyframe Animations */}
      <style>{`
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-5px) scale(1.02); }
        }
        @keyframes shimmer {
          100% { transform: translateX(200%); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
