import React, { useState, useEffect, useContext } from 'react';
import { 
  TrendingUp, ShieldCheck, Clock, Award, CheckCircle, ArrowRight, 
  Zap, Sparkles, ChevronRight, Info, AlertTriangle
} from 'lucide-react';
import { User, Plan, UserPlan, Banner } from '../types';
import { CelebrationContext } from '../App';

interface PlansViewProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

const getPlanImage = (plan: Plan): string => {
  if (plan.image_url && plan.image_url.trim()) {
    return plan.image_url;
  }
  const name = plan.name.toLowerCase();
  const amt = plan.amount;
  const daily = plan.daily_return;

  if (name.includes('gigawatt') || name.includes('flash core') || daily === 2800) {
    return '/public/assets/aistudio/file_00000000650c81fdb97432eea241cd83_9a570f4c.png';
  }
  if (name.includes('nfes') || (name.includes('nayara') && amt === 1000) || (amt === 1000 && daily === 500)) {
    return '/public/assets/aistudio/file_00000000caf481fab640fb1171314240_9b4d8723.png';
  }
  if (name.includes('nes') || (name.includes('nayara') && amt === 2000) || (amt === 2000 && daily === 1200)) {
    return '/public/assets/aistudio/file_00000000ff9c81fa999c411a38489203_1885616d.png';
  }
  if (name.includes('jril') || name.includes('jio') || (amt === 500 && daily === 250)) {
    return '/public/assets/aistudio/file_00000000d91082108254f27654b69bad_de478902.png';
  }
  if (amt >= 5000) return '/public/assets/aistudio/file_00000000650c81fdb97432eea241cd83_9a570f4c.png';
  if (amt >= 3000) return '/public/assets/aistudio/IMG_20260926_124927_b5f9e492.png';
  
  return '/public/assets/aistudio/file_00000000d91082108254f27654b69bad_de478902.png';
};

export const PlansView: React.FC<PlansViewProps & { settings?: any }> = ({ user, onUpdateUser, showToast, settings }) => {
  const { setCelebration, audioSettings } = useContext(CelebrationContext);
  const appName = settings?.app_name || 'Reliance Pay';
  const [plans, setPlans] = useState<Plan[]>([]);
  const [userPlans, setUserPlans] = useState<UserPlan[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = () => {
    fetch('/api/plans')
      .then(res => res.json())
      .then(data => { if (data.success) setPlans(data.plans); });

    fetch(`/api/user/plans/${user.id}`)
      .then(res => res.json())
      .then(data => { if (data.success) setUserPlans(data.plans); });

    fetch('/api/banners')
      .then(res => res.json())
      .then(data => { if (data.success) setBanners(data.banners); });
  };

  useEffect(() => {
    loadData();
  }, [user.id]);


  const handlePurchase = async () => {
    if (!selectedPlan) return;
    if (user.kyc_required === 1) {
      showToast('KYC Verification Required. Please complete KYC to purchase new plans.', 'error');
      return;
    }
    if (user.balance < selectedPlan.amount) {
      showToast('Insufficient wallet balance. Please recharge funds.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/plans/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, plan_id: selectedPlan.id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to purchase plan');

      // Trigger Celebration
      audioSettings.playSound('/public/assets/aistudio/__Coin_Message_Tone_____Coins_Jaisi_Sound_Wala_Notification_Tone___Best_Msg_Tone_______256k__4ed2597e.mp3');
      audioSettings.speak(`बधाई हो! आपका ${selectedPlan.name} प्लान सफलतापूर्वक एक्टिव हो गया है।`, `Congratulations! Your ${selectedPlan.name} plan has been successfully activated.`);
      
      setCelebration({
        message: `Plan: ${selectedPlan.name}\nAmount: ₹${selectedPlan.amount.toLocaleString('en-IN')}\nStatus: Successfully Activated`,
        buttonText: 'View My Investment'
      });

      setSelectedPlan(null);
      loadData();

      // Refresh user balance
      const userRes = await fetch(`/api/user/profile/${user.id}`);
      const userData = await userRes.json();
      if (userData.success) onUpdateUser(userData.user);
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredPlans = plans.filter(p => {
    if (selectedCategory === 'All') return true;
    if (selectedCategory === 'Stable') {
      return p.category === 'Stable' || p.name.includes('Stable') || (p.amount <= 3000 && !p.category?.includes('VIP'));
    }
    if (selectedCategory === 'VIP Welfare') {
      return p.category === 'VIP Welfare' || p.name.includes('NFES') || p.name.includes('Welfare');
    }
    if (selectedCategory === 'High Return') {
      return p.category === 'High Return' || p.name.includes('NES') || p.name.includes('High Return');
    }
    if (selectedCategory === 'VIP Elite') {
      return p.category === 'VIP Elite' || p.name.includes('VIP') || p.name.includes('Thermal') || p.amount >= 10000;
    }
    return p.name.toLowerCase().includes(selectedCategory.toLowerCase());
  });

  const stableCount = plans.filter(p => p.category === 'Stable' || (p.name.includes('Stable') && !p.category?.includes('VIP'))).length;
  const welfareCount = plans.filter(p => p.category === 'VIP Welfare' || p.name.includes('NFES')).length;
  const highReturnCount = plans.filter(p => p.category === 'High Return' || p.name.includes('NES')).length;
  const vipEliteCount = plans.filter(p => p.category === 'VIP Elite' || p.name.includes('VIP') || p.name.includes('Thermal')).length;

  return (
    <div className="space-y-4 pb-28 text-white bg-[#0A0F1D] min-h-screen px-2 sm:px-4 pt-2">
      {/* Header matching screenshot */}
      <div className="bg-[#131B31] border border-slate-800 rounded-3xl p-5 shadow-xl">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h2 className="text-xl font-black text-white">Investment Portfolios</h2>
            <p className="text-xs text-slate-400 mt-0.5">Explore structured wealth creation plans with automated 12-hour dividend claim cycles.</p>
          </div>
          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center space-x-1 flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Live Accrual</span>
          </span>
        </div>
      </div>

      {/* Banner Carousel matching screenshot */}
      {banners.length > 0 && (
        <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl bg-[#131B31] aspect-[2/1] border-[8px] border-slate-900 group">
          {/* Inner Glossy Border */}
          <div className="absolute inset-0 border border-slate-700/50 rounded-[1.8rem] z-10 pointer-events-none" />
          
          <img
            src={banners[0]?.image_url || '/public/assets/aistudio/IMG-20261101-WA0060_0895105e.jpg'}
            alt="Investment Banner"
            className="w-full h-full object-contain bg-slate-950 transition-transform duration-700 group-hover:scale-105"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-5">
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest drop-shadow-lg">Featured Portfolio</span>
            </div>
          </div>

          <div className="absolute bottom-5 right-5 flex space-x-1.5 z-20 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/20">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === 0 ? 'w-5 bg-pink-500 shadow-lg shadow-pink-500/50' : 'bg-white/50'}`} />
            ))}
          </div>
        </div>
      )}

      {/* Category Filter Pills matching screenshot */}
      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'All', label: 'All Portfolios (सभी)', count: plans.length },
          { id: 'Stable', label: 'Stable', count: stableCount },
          { id: 'VIP Welfare', label: 'VIP Welfare', count: welfareCount },
          { id: 'High Return', label: 'High Return', count: highReturnCount },
          { id: 'VIP Elite', label: 'VIP Elite', count: vipEliteCount },
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition flex items-center space-x-1.5 ${
              selectedCategory === cat.id 
                ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-600/30 border border-blue-500/50' 
                : 'bg-[#131B31] text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <span>{cat.label}</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${selectedCategory === cat.id ? 'bg-white/20' : 'bg-slate-800'}`}>{cat.count}</span>
          </button>
        ))}
      </div>

      {/* Automated 12-Hour Claim System Info Box matching screenshot */}
      <div className="bg-[#0B1220] border border-blue-900/40 rounded-2xl p-4 flex items-start space-x-3">
        <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Info className="w-4 h-4" />
        </div>
        <div className="text-xs text-slate-300">
          <p className="font-bold text-white mb-0.5">Automated 12-Hour Claim System:</p>
          <p className="text-[11px] text-slate-400">
            Each active investment contract yields regular dividends claimable every 12 hours directly into your withdrawable wallet balance with atomic server-side verification.
          </p>
        </div>
      </div>

      {/* Investment Plan Cards Grid matching screenshot */}
      <div className="space-y-4">
        {filteredPlans.map((plan) => {
          const roi = Math.round((plan.total_return / plan.amount) * 100);
          const categoryTag = plan.category || (plan.amount <= 3000 ? 'Stable' : plan.amount >= 10000 ? 'VIP Elite' : 'High Return');
          const claimAmt = plan.claim_amount || Math.round(plan.daily_return / 2);
          const totalClaims = plan.total_claims || (plan.duration_days * 2);
          const planBgImage = getPlanImage(plan);
          
          return (
            <div key={plan.id} className="bg-[#131B31] border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl relative overflow-hidden group hover:border-blue-500/50 transition">
              {/* ROI Badge */}
              <div className="absolute top-0 right-0 bg-gradient-to-l from-emerald-950/80 via-slate-900/90 to-transparent px-3.5 py-1 rounded-bl-2xl border-l border-b border-emerald-500/30 flex items-center space-x-1 text-emerald-400 text-[11px] font-black z-20 backdrop-blur-sm">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>+{roi}% ROI</span>
              </div>

              {/* MAIN PORTFOLIO ASSET COMPARTMENT WITH USER-PROVIDED BACKGROUND IMAGE */}
              <div className="relative rounded-2xl overflow-hidden mb-4 p-4 border border-slate-800 min-h-[130px] flex flex-col justify-end bg-slate-950">
                {/* Background Image: Cover, Centered, Responsive, Preserves Aspect Ratio */}
                <img
                  src={planBgImage}
                  alt={plan.name}
                  loading="lazy"
                  className={`absolute inset-0 w-full h-full object-center transition-transform duration-700 group-hover:scale-105 ${
                    plan.layout === 'side' ? 'object-contain p-2' : 'object-cover'
                  }`}
                />

                {/* Dark Transparent Overlay for Crisp Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1D] via-[#0A0F1D]/80 to-transparent" />

                {/* Foreground Content inside Portfolio Compartment */}
                <div className="relative z-10 space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="bg-blue-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-blue-400/40 uppercase tracking-wider shadow-sm">
                      {categoryTag}
                    </span>
                    <span className="bg-emerald-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-400/40 flex items-center space-x-1 shadow-sm">
                      <ShieldCheck className="w-3 h-3 text-white" />
                      <span>{plan.joined_users || 0} / {plan.capacity || 800} Join</span>
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
                <div className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Claims Every 12 Hrs (₹{claimAmt.toLocaleString('en-IN')} × {totalClaims})</span>
                </div>
                <span className="font-bold text-slate-300">Total <span className="text-pink-500 font-black">₹{plan.total_return.toLocaleString('en-IN')}</span></span>
              </div>

              <button
                onClick={() => {
                  if (user.kyc_required === 1) {
                    showToast('KYC Verification Required to purchase new plans.', 'error');
                    return;
                  }
                  setSelectedPlan(plan);
                }}
                className={`w-full font-black py-3.5 rounded-2xl shadow-lg flex items-center justify-center space-x-2 transition ${
                  user.kyc_required === 1 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed grayscale' 
                  : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-600/20'
                }`}
              >
                {user.kyc_required === 1 && <AlertTriangle className="w-4 h-4" />}
                <span>{user.kyc_required === 1 ? 'KYC Required' : `Invest Now (₹${plan.amount.toLocaleString('en-IN')})`}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Brand & Financial Disclosure Notice */}
      <div className="bg-[#0B1220] border border-slate-800 rounded-2xl p-4 text-[11px] text-slate-400 space-y-1.5 leading-relaxed">
        <div className="flex items-center space-x-1.5 font-bold text-slate-200">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Portfolio & Financial Disclosure Notice</span>
        </div>
        <p>
          {appName} wealth creation portfolios operate on structured 12-hour algorithmic dividend claims. All yields are platform dividend distributions calculated and processed strictly via server-side verification. These portfolios represent simulated platform wealth tiers and do not constitute direct equity securities or regulatory-guaranteed market debentures of Reliance Industries Ltd or Nayara Energy.
        </p>
      </div>

      {/* Investment Confirmation Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#131B31] border border-slate-800 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl">
            <h3 className="text-xl font-black mb-1">Confirm Investment</h3>
            <p className="text-xs text-slate-400 mb-5">You are about to activate <span className="text-white font-bold">{selectedPlan.name}</span>.</p>

            <div className="bg-[#0B1220] border border-slate-800 rounded-2xl p-4 space-y-2.5 mb-5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Contract Price:</span>
                <span className="font-bold text-white">₹{selectedPlan.amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Daily Return:</span>
                <span className="font-bold text-emerald-400">₹{selectedPlan.daily_return.toLocaleString('en-IN')} / day</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Per 12-Hour Claim:</span>
                <span className="font-bold text-blue-400">₹{(selectedPlan.claim_amount || Math.round(selectedPlan.daily_return / 2)).toLocaleString('en-IN')} every 12 hrs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Cycle Duration:</span>
                <span className="font-bold text-white">{selectedPlan.duration_days} Days ({selectedPlan.total_claims || selectedPlan.duration_days * 2} Claims)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Return:</span>
                <span className="font-bold text-pink-500">₹{selectedPlan.total_return.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-800">
                <span className="text-slate-400">Net Estimated Profit:</span>
                <span className="font-black text-emerald-400">₹{(selectedPlan.total_return - selectedPlan.amount).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Gross ROI:</span>
                <span className="font-black text-emerald-400">{Math.round((selectedPlan.total_return / selectedPlan.amount) * 100)}% ROI</span>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setSelectedPlan(null)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-3 rounded-xl transition text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handlePurchase}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-3 rounded-xl transition text-xs shadow-lg shadow-blue-600/30"
              >
                {loading ? 'Processing...' : 'Confirm & Pay'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>

  );
};
