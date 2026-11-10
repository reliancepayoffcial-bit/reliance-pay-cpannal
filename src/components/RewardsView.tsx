import React, { useState, useEffect, useContext } from 'react';
import { Gift, Calendar, Sparkles, CheckCircle, Award, ArrowRight } from 'lucide-react';
import { User, ScratchCard } from '../types';
import { CelebrationContext } from '../App';

interface RewardsViewProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const RewardsView: React.FC<RewardsViewProps> = ({ user, onUpdateUser, showToast }) => {
  const { setCelebration, audioSettings } = useContext(CelebrationContext);
  const [claimedToday, setClaimedToday] = useState(false);
  const [checkinHistory, setCheckinHistory] = useState<any[]>([]);
  const [scratchCards, setScratchCards] = useState<ScratchCard[]>([]);
  const [scratchingId, setScratchingId] = useState<number | null>(null);

  const loadRewards = () => {
    fetch(`/api/checkin/${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setClaimedToday(data.claimedToday);
          setCheckinHistory(data.history || []);
        }
      });

    fetch(`/api/scratch-cards/${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setScratchCards(data.cards || []);
      });
  };

  useEffect(() => {
    loadRewards();
  }, [user.id]);

  const handleCheckin = async () => {
    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Check-in failed');

      showToast(data.message, 'success');
      loadRewards();

      // Refresh user balance
      const userRes = await fetch(`/api/user/profile/${user.id}`);
      const userData = await userRes.json();
      if (userData.success) onUpdateUser(userData.user);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleClaimScratch = async (cardId: number) => {
    try {
      const res = await fetch('/api/scratch-cards/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ card_id: cardId, user_id: user.id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to claim reward');

      // Trigger Celebration
      audioSettings.playSound('/public/assets/aistudio/__Coin_Message_Tone_____Coins_Jaisi_Sound_Wala_Notification_Tone___Best_Msg_Tone_______256k__4ed2597e.mp3');
      audioSettings.speak(`बधाई हो! आपको एक विशेष उपहार प्राप्त हुआ है।`, `Congratulations! You have received a special gift.`);
      
      setCelebration({
        message: `YOU WON\n₹${data.reward.toLocaleString('en-IN')}\nSuccessfully Credited to Your Wallet`,
        buttonText: 'View Wallet'
      });

      loadRewards();

      // Refresh user balance
      const userRes = await fetch(`/api/user/profile/${user.id}`);
      const userData = await userRes.json();
      if (userData.success) onUpdateUser(userData.user);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6 pb-20 sm:pb-6 text-white bg-[#0A0F1D] min-h-screen px-2 sm:px-4 pt-2">
      <div className="bg-gradient-to-r from-purple-900 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-slate-800">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
            <Gift className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black">Daily Rewards</h2>
        </div>
        <p className="text-slate-300 text-sm">Check in daily, scratch gift cards, and earn instant cash bonuses directly into your wallet.</p>
      </div>

      {/* Daily Check-in Card */}
      <div className="bg-[#131B31] rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
            <Calendar className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-lg">Daily Attendance Reward</h3>
            <p className="text-xs text-slate-400 mt-0.5">Check in every 24 hours to keep your streak alive & earn ₹10 cash reward.</p>
          </div>
        </div>

        <button
          onClick={handleCheckin}
          disabled={claimedToday}
          className={`px-6 py-3.5 rounded-2xl font-bold text-xs shadow-lg transition flex items-center space-x-2 ${
            claimedToday 
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none' 
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
          }`}
        >
          {claimedToday ? <CheckCircle className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
          <span>{claimedToday ? 'Claimed Today ✓' : 'Claim Daily Reward (₹10)'}</span>
        </button>
      </div>

      {/* Scratch Cards Section */}
      <div>
        <h3 className="font-extrabold text-white text-lg mb-4">My Scratch & Gift Cards</h3>
        {scratchCards.length === 0 ? (
          <div className="bg-[#131B31] rounded-3xl p-8 text-center text-slate-400 border border-slate-800 shadow-xl">
            No active scratch cards right now. Deposit funds or invite friends to receive surprise scratch cards!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {scratchCards.map(card => (
              <div key={card.id} className="bg-[#131B31] border border-slate-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden flex flex-col justify-between">
                <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />
                <div className="relative z-10">
                  <span className="text-[10px] font-bold bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-full uppercase border border-blue-500/20">Surprise Gift</span>
                  <div className="my-6 text-center">
                    {card.status === 'claimed' ? (
                      <div>
                        <p className="text-xs text-slate-400">Reward Claimed</p>
                        <h4 className="text-3xl font-black text-emerald-400 mt-1">₹{card.reward_amount}</h4>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Scratch to reveal reward</p>
                        <h4 className="text-2xl font-black text-blue-400">₹{card.reward_amount} Gift</h4>
                      </div>
                    )}
                  </div>
                </div>

                <div className="relative z-10">
                  {card.status !== 'claimed' ? (
                    <button
                      onClick={() => handleClaimScratch(card.id)}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl shadow-lg transition text-xs shadow-blue-600/20"
                    >
                      Scratch & Claim Now
                    </button>
                  ) : (
                    <div className="text-center text-xs text-emerald-400 font-semibold bg-emerald-500/10 py-2.5 rounded-xl border border-emerald-500/20">
                      Credited to Wallet ✓
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>

  );
};
