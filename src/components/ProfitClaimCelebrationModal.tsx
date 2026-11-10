import React, { useEffect, useRef, useState } from 'react';
import { Volume2, CheckCircle, X, Sparkles } from 'lucide-react';

interface ProfitClaimCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  amount: number;
  oldBalance?: number;
  newBalance?: number;
}

export const ProfitClaimCelebrationModal: React.FC<ProfitClaimCelebrationModalProps> = ({
  isOpen,
  onClose,
  planName,
  amount,
  oldBalance,
  newBalance
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  const audioPath = '/public/assets/aistudio/paytm_Transaction_Sound____2021_256k__6e458490.mp3';

  // Play audio on opening modal
  const playClaimAudio = () => {
    if (isMuted) return;

    try {
      if (!audioRef.current) {
        audioRef.current = new Audio(audioPath);
      }
      audioRef.current.currentTime = 0;
      audioRef.current.volume = 1.0;
      audioRef.current.play().catch(err => {
        console.warn('Audio auto-play prevented or failed:', err);
        playFallbackSynthesizerSound();
      });
    } catch (e) {
      playFallbackSynthesizerSound();
    }
  };

  const playFallbackSynthesizerSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      // Joyful chime sequence (C5 -> E5 -> G5 -> C6)
      osc1.frequency.setValueAtTime(523.25, now);
      osc1.frequency.setValueAtTime(659.25, now + 0.1);
      osc1.frequency.setValueAtTime(783.99, now + 0.2);
      osc1.frequency.setValueAtTime(1046.50, now + 0.3);

      osc2.frequency.setValueAtTime(261.63, now);
      osc2.frequency.setValueAtTime(329.63, now + 0.1);
      osc2.frequency.setValueAtTime(392.00, now + 0.2);
      osc2.frequency.setValueAtTime(523.25, now + 0.3);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 1.2);
      osc2.stop(now + 1.2);
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    if (isOpen) {
      playClaimAudio();
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  }, [isOpen]);

  // Falling Coins & Metallic Confetti Particle Rain Effect
  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    interface Particle {
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      rotation: number;
      rotationSpeed: number;
      type: 'coin' | 'confetti';
      color: string;
      shape: 'rect' | 'circle';
    }

    const particles: Particle[] = [];
    const colors = ['#F59E0B', '#FBBF24', '#FCD34D', '#EF4444', '#10B981', '#3B82F6', '#FFFFFF'];

    const numParticles = Math.min(80, Math.floor(window.innerWidth / 12));

    for (let i = 0; i < numParticles; i++) {
      const isCoin = Math.random() < 0.45;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * -height,
        size: isCoin ? Math.random() * 12 + 10 : Math.random() * 8 + 6,
        speedY: Math.random() * 3 + 2,
        speedX: Math.random() * 2 - 1,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: Math.random() * 0.08 - 0.04,
        type: isCoin ? 'coin' : 'confetti',
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: Math.random() > 0.5 ? 'rect' : 'circle'
      });
    }

    const drawCoin = (p: Particle) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);

      // Outer Golden Rim
      const grad = ctx.createRadialGradient(0, 0, p.size * 0.2, 0, 0, p.size);
      grad.addColorStop(0, '#FFE875');
      grad.addColorStop(0.7, '#F59E0B');
      grad.addColorStop(1, '#B45309');

      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#FEF08A';
      ctx.stroke();

      // Rupee Symbol on Coin
      ctx.fillStyle = '#78350F';
      ctx.font = `bold ${Math.floor(p.size * 1.1)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('₹', 0, 1);

      ctx.restore();
    };

    const drawConfetti = (p: Particle) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);

      ctx.fillStyle = p.color;
      if (p.shape === 'rect') {
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        p.y += p.speedY;
        p.x += Math.sin(p.y * 0.02) * p.speedX;
        p.rotation += p.rotationSpeed;

        if (p.y > height + 20) {
          p.y = -20;
          p.x = Math.random() * width;
        }

        if (p.type === 'coin') {
          drawCoin(p);
        } else {
          drawConfetti(p);
        }
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/90 backdrop-blur-md transition-all duration-300">
      {/* Background Canvas Rain Animation */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[121]"
      />

      {/* Main Premium Card Container matching User Attachment */}
      <div className="relative z-[122] max-w-md w-full bg-[#0D1426] border-2 border-amber-500/60 rounded-[2.5rem] p-6 text-white shadow-[0_0_50px_rgba(245,158,11,0.3)] overflow-hidden transform transition-all duration-300 animate-in fade-in zoom-in-95">
        
        {/* Glow ambient background lights */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header Pill & Close Button */}
        <div className="flex justify-between items-center mb-4">
          <div className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 text-amber-950 font-black text-xs sm:text-sm px-4 py-1.5 rounded-full flex items-center space-x-1.5 shadow-lg shadow-amber-500/30">
            <Sparkles className="w-4 h-4 text-amber-950 fill-amber-950" />
            <span>✨🎉 बधाई हो! • पैसे प्राप्त हुए</span>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition border border-slate-700/60"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Center Large Golden Coin Emblem matching attachment */}
        <div className="relative mx-auto w-24 h-24 my-4 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 animate-pulse blur-sm opacity-70" />
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-600 border-4 border-amber-200/80 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.6)]">
            <span className="text-amber-950 font-black text-4xl drop-shadow-md select-none">
              ₹
            </span>
          </div>
        </div>

        {/* Daily Dividend Credited Badge Title */}
        <div className="text-center space-y-1 mb-3">
          <p className="text-[11px] font-black text-slate-300 tracking-[0.25em] uppercase drop-shadow">
            DAILY DIVIDEND CREDITED
          </p>

          {/* Amount Display with vibrant green glow */}
          <h2 className="text-4xl sm:text-5xl font-black text-emerald-400 tracking-tight drop-shadow-[0_2px_12px_rgba(16,185,129,0.5)]">
            +₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
        </div>

        {/* Details Inset Box matching screenshot */}
        <div className="bg-[#070D1B] border border-blue-900/50 rounded-2xl p-4 space-y-3 mb-6 text-xs sm:text-sm">
          <div className="flex justify-between items-center pb-2 border-b border-blue-950/80">
            <span className="text-slate-400 font-medium">Plan:</span>
            <span className="font-extrabold text-white text-right max-w-[210px] truncate uppercase">
              {planName || 'RELIANCE INDUSTRIES LIMITED (RIL)'}
            </span>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-blue-950/80">
            <span className="text-slate-400 font-medium">Destination:</span>
            <span className="font-extrabold text-blue-400 text-right">
              Main Asset Wallet
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-400 font-medium">Status:</span>
            <span className="font-extrabold text-emerald-400 flex items-center space-x-1">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>✓ Success • सफल</span>
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Button 1: Replay Audio Alert */}
          <button
            onClick={() => {
              playClaimAudio();
            }}
            className="w-full bg-[#142038] hover:bg-[#1A2B4C] border border-blue-500/30 text-slate-100 font-bold py-3.5 px-4 rounded-2xl text-xs sm:text-sm flex items-center justify-center space-x-2 transition shadow-md active:scale-[0.98]"
          >
            <Volume2 className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>Replay Audio Alert (आवाज़ फिर से सुनें)</span>
          </button>

          {/* Button 2: Collect & Continue */}
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-amber-950 font-black py-4 px-4 rounded-2xl text-sm sm:text-base flex items-center justify-center space-x-2 transition shadow-lg shadow-amber-500/30 active:scale-[0.98]"
          >
            <span>Collect & Continue (सम्पन्न)</span>
          </button>
        </div>

      </div>
    </div>
  );
};
