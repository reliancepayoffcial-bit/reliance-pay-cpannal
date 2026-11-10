import React, { useState, useEffect } from 'react';
import { 
  Users, Share2, Copy, Check, Gift, Sparkles, QrCode, 
  ArrowRight, Search, ChevronRight, Award, ShieldCheck, Clock, X
} from 'lucide-react';
import { User, ReferralItem } from '../types';

interface ReferralViewProps {
  user: User;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const ReferralView: React.FC<ReferralViewProps> = ({ user, showToast }) => {
  const [referralCode, setReferralCode] = useState(user.referral_code || 'RELIANCE_ADMIN');
  const [referrals, setReferrals] = useState<ReferralItem[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'friends' | 'matrix'>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);

  const referralLink = `${window.location.origin}/?ref=${referralCode}`;

  useEffect(() => {
    fetch(`/api/referrals/${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          if (data.referral_code) setReferralCode(data.referral_code);
          setReferrals(data.referrals || []);
        }
      });
  }, [user.id]);

  const handleCopy = (text: string, type: 'link' | 'code') => {
    navigator.clipboard.writeText(text);
    if (type === 'link') {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
    showToast('Copied to clipboard successfully!', 'success');
  };

  const totalRewards = referrals.reduce((sum, r) => sum + r.bonus_amount, 0);

  const filteredReferrals = referrals.filter(r =>
    r.referee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.referee_mobile.includes(searchQuery)
  );

  return (
    <div className="space-y-4 pb-28 text-white bg-[#0A0F1D] min-h-screen px-2 sm:px-4 pt-2">
      {/* Header matching screenshot */}
      <div className="bg-[#131B31] border border-slate-800 rounded-3xl p-5 shadow-xl">
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className="inline-block bg-pink-500/10 text-pink-400 border border-pink-500/30 text-[10px] font-bold px-2.5 py-1 rounded-full mb-2">
              Referral Rewards Hub
            </span>
            <h2 className="text-xl font-black text-white">Referral Rewards</h2>
            <p className="text-xs text-slate-400 mt-0.5">Track friends you have invited with real-time indicators for pending or successful sign-ups.</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handleCopy(referralLink, 'link')}
              className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-4 py-2 rounded-2xl text-xs font-bold shadow-lg shadow-blue-600/30 flex items-center space-x-1"
            >
              <span>+ Invite</span>
            </button>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          <div className="bg-[#0B1220] border border-slate-800 rounded-2xl p-4 shadow-xl">
            <div className="flex justify-between items-start">
              <span className="text-[10px] text-slate-400 font-bold">TOTAL FRIENDS</span>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <h3 className="text-2xl font-black text-white mt-1">{referrals.length}</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Direct referrals</p>
          </div>

          <div className="bg-[#0B1220] border border-slate-800 rounded-2xl p-4 shadow-xl">
            <div className="flex justify-between items-start">
              <span className="text-[10px] text-slate-400 font-bold">SUCCESSFUL</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-black text-emerald-400 mt-1">{referrals.length}</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Active registered users</p>
          </div>

          <div className="bg-[#0B1220] border border-slate-800 rounded-2xl p-4 shadow-xl">
            <div className="flex justify-between items-start">
              <span className="text-[10px] text-slate-400 font-bold">PENDING</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <h3 className="text-2xl font-black text-amber-400 mt-1">0</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Awaiting sign-up</p>
          </div>

          <div className="bg-[#0B1220] border border-slate-800 rounded-2xl p-4 shadow-xl">
            <div className="flex justify-between items-start">
              <span className="text-[10px] text-slate-400 font-bold">TOTAL REWARDS</span>
              <Award className="w-4 h-4 text-blue-400" />
            </div>
            <h3 className="text-2xl font-black text-blue-400 mt-1">₹{totalRewards}</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Commissions & bonus</p>
          </div>
        </div>
      </div>

      {/* Share Link & Earn 25% Lifetime Commissions Card matching screenshot */}
      <div className="bg-[#131B31] border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex justify-between items-center">
          <span className="bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px] font-bold px-2.5 py-1 rounded-full">
            REFERRAL LINK & CODE
          </span>
          <span className="text-xs font-bold text-emerald-400">✨ ₹50 Bonus per Friend</span>
        </div>

        <div>
          <h3 className="text-base font-black text-white">Share Link & Earn 25% Lifetime Commissions</h3>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => alert('Sharing via WhatsApp...')}
            className="flex-1 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/20 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center space-x-1.5 transition"
          >
            <span>WhatsApp</span>
          </button>
          <button
            onClick={() => alert('Sharing via Telegram...')}
            className="flex-1 bg-[#229ED9]/10 hover:bg-[#229ED9]/20 text-[#229ED9] border border-[#229ED9]/20 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center space-x-1.5 transition"
          >
            <span>Telegram</span>
          </button>
          <button
            onClick={() => setShowQrModal(true)}
            className="bg-[#0B1220] hover:bg-slate-800 text-slate-300 border border-slate-800 px-3.5 py-2.5 rounded-2xl flex items-center justify-center transition shadow-sm"
          >
            <QrCode className="w-4 h-4" />
          </button>
        </div>

        {/* Link Box */}
        <div className="bg-[#0B1220] border border-slate-800 rounded-2xl p-3 flex items-center justify-between shadow-inner">
          <span className="text-xs font-mono text-slate-300 truncate mr-2">{referralLink}</span>
          <button
            onClick={() => handleCopy(referralLink, 'link')}
            className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1 flex-shrink-0 shadow shadow-blue-600/20"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Code Box */}
        <div className="bg-[#0B1220] border border-slate-800 rounded-2xl p-3 flex items-center justify-between shadow-inner">
          <div className="flex items-center space-x-2">
            <span className="text-[11px] text-slate-400">Referral Code:</span>
            <span className="text-xs font-mono font-black text-blue-400 tracking-wider">{referralCode}</span>
          </div>
          <button
            onClick={() => handleCopy(referralCode, 'code')}
            className="bg-[#131B31] hover:bg-slate-800 text-slate-300 border border-slate-800 px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1 transition shadow-sm"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#131B31] border border-slate-800 rounded-2xl p-1 shadow-sm">
        <button
          onClick={() => setActiveSubTab('friends')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition ${
            activeSubTab === 'friends' ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md shadow-blue-600/20' : 'text-slate-400 hover:text-white'
          }`}
        >
          Friends ({referrals.length})
        </button>
        <button
          onClick={() => setActiveSubTab('matrix')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition ${
            activeSubTab === 'matrix' ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md shadow-blue-600/20' : 'text-slate-400 hover:text-white'
          }`}
        >
          3-Tier Matrix
        </button>
      </div>

      {activeSubTab === 'friends' && (
        <div className="space-y-4">
          {/* Sub filters */}
          <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="bg-blue-600 text-white px-4 py-2 rounded-2xl font-bold shadow-sm">All Friends ({referrals.length})</span>
            <span className="bg-[#131B31] border border-slate-800 text-slate-300 px-4 py-2 rounded-2xl font-bold shadow-sm">Successful ({referrals.length})</span>
            <span className="bg-[#131B31] border border-slate-800 text-slate-300 px-4 py-2 rounded-2xl font-bold shadow-sm">Pending</span>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search friend name or phone..."
              className="w-full bg-[#131B31] border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-600 shadow-sm"
            />
          </div>

          {/* Invited Friends List or Empty State matching screenshot */}
          {filteredReferrals.length === 0 ? (
            <div className="bg-[#131B31] border border-slate-800 rounded-3xl p-10 text-center space-y-4 shadow-xl">
              <div className="w-16 h-16 rounded-3xl bg-[#0B1220] text-slate-400 mx-auto flex items-center justify-center border border-slate-800 shadow-inner">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">No invited friends found</h4>
                <p className="text-xs text-slate-400 mt-1">You have not invited anyone yet. Share your referral link above!</p>
              </div>
              <button
                onClick={() => handleCopy(referralLink, 'link')}
                className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold px-6 py-3 rounded-2xl text-xs shadow-lg shadow-blue-600/30 transition"
              >
                Invite Your First Friend
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReferrals.map(r => (
                <div key={r.id} className="bg-[#131B31] border border-slate-800 rounded-2xl p-4 flex justify-between items-center text-xs shadow-sm">
                  <div>
                    <p className="font-bold text-white">{r.referee_name} (+91 {r.referee_mobile})</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Joined: {new Date(r.referee_joined).toLocaleDateString()}</p>
                  </div>
                  <span className="font-black text-emerald-400">+₹{r.bonus_amount} Bonus</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'matrix' && (
        <div className="bg-[#131B31] border border-slate-800 rounded-3xl p-6 text-center space-y-4 text-xs shadow-xl">
          <h3 className="text-base font-black text-white">3-Tier Commission Matrix</h3>
          <p className="text-slate-400">Earn lifetime passive commissions across 3 tiers of referrals:</p>
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="bg-[#0B1220] border border-slate-800 p-4 rounded-2xl shadow-sm">
              <p className="text-slate-400 text-[10px]">TIER 1 (Direct)</p>
              <p className="text-lg font-black text-blue-400 mt-1">15%</p>
            </div>
            <div className="bg-[#0B1220] border border-slate-800 p-4 rounded-2xl shadow-sm">
              <p className="text-slate-400 text-[10px]">TIER 2 (Level 2)</p>
              <p className="text-lg font-black text-indigo-400 mt-1">7%</p>
            </div>
            <div className="bg-[#0B1220] border border-slate-800 p-4 rounded-2xl shadow-sm">
              <p className="text-slate-400 text-[10px]">TIER 3 (Level 3)</p>
              <p className="text-lg font-black text-emerald-400 mt-1">3%</p>
            </div>
          </div>
        </div>
      )}

      {/* How Referral Rewards Work matching screenshot */}
      <div className="bg-[#131B31] border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
        <h3 className="font-extrabold text-sm text-white flex items-center space-x-1.5">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span>How Referral Rewards Work</span>
        </h3>

        <div className="space-y-3 text-xs">
          <div className="bg-[#0B1220] border border-slate-800 rounded-2xl p-4 flex items-start space-x-3 shadow-sm">
            <div className="w-7 h-7 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold flex-shrink-0">1</div>
            <div>
              <p className="font-bold text-white mb-0.5">Share Your Link</p>
              <p className="text-[11px] text-slate-400">Send your personal invitation link or QR code to your friends on WhatsApp or Telegram.</p>
            </div>
          </div>

          <div className="bg-[#0B1220] border border-slate-800 rounded-2xl p-4 flex items-start space-x-3 shadow-sm">
            <div className="w-7 h-7 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold flex-shrink-0">2</div>
            <div>
              <p className="font-bold text-white mb-0.5">Friend Registers (Status Updates)</p>
              <p className="text-[11px] text-slate-400">When your friend completes registration, their status turns to Successful Sign-up and they get ₹50 free welcome cash!</p>
            </div>
          </div>

          <div className="bg-[#0B1220] border border-slate-800 rounded-2xl p-4 flex items-start space-x-3 shadow-sm">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold flex-shrink-0">3</div>
            <div>
              <p className="font-bold text-white mb-0.5">Earn Lifetime 25% Dividends</p>
              <p className="text-[11px] text-slate-400">Every time any friend in your 3 tiers recharges or buys a plan, commissions are credited directly to your wallet.</p>
            </div>
          </div>
        </div>
      </div>

      {/* QR Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#131B31] border border-slate-800 rounded-3xl max-w-sm w-full p-6 text-white text-center shadow-2xl relative">
            <button 
              onClick={() => setShowQrModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-black text-lg mb-2">Referral QR Code</h3>
            <p className="text-xs text-slate-400 mb-4">Scan this QR code to join Reliance Pay instantly.</p>
            <div className="bg-white p-4 rounded-2xl inline-block mb-4 border border-slate-100 shadow-inner">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(referralLink)}`}
                alt="Referral QR Code"
                className="w-48 h-48 object-contain"
              />
            </div>
            <button
              onClick={() => setShowQrModal(false)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-2xl text-xs font-bold shadow-lg transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>

  );
};
