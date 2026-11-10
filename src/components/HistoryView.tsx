import React, { useState, useEffect } from 'react';
import { 
  History, RefreshCcw, Search, ArrowDownRight, ArrowUpRight, 
  CheckCircle, Clock, XCircle, Copy, Check, Sparkles, Gift 
} from 'lucide-react';
import { User, Transaction } from '../types';

interface HistoryViewProps {
  user: User;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ user, showToast }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'recharge' | 'withdrawal' | 'bonus'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  const loadHistory = () => {
    setSyncing(true);
    fetch(`/api/wallet/${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTransactions(data.transactions || []);
        }
      })
      .finally(() => setTimeout(() => setSyncing(false), 800));
  };

  useEffect(() => {
    loadHistory();
  }, [user.id]);

  const handleCopyTx = (txId: string) => {
    navigator.clipboard.writeText(txId);
    setCopiedId(txId);
    setTimeout(() => setCopiedId(null), 2000);
    showToast('Transaction ID copied to clipboard!', 'success');
  };

  // Calculate totals
  const totalRecharge = transactions
    .filter(t => t.type === 'deposit' && t.status === 'approved')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalPayouts = transactions
    .filter(t => t.type === 'withdrawal' && t.status === 'approved')
    .reduce((sum, t) => sum + t.amount, 0);

  const filteredTx = transactions.filter(t => {
    const matchesSearch = 
      t.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.amount.toString().includes(searchQuery) ||
      (t.reference_no && t.reference_no.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterType === 'recharge') return t.type === 'deposit';
    if (filterType === 'withdrawal') return t.type === 'withdrawal';
    if (filterType === 'bonus') return t.type === 'daily_reward' || t.type === 'scratch_reward' || t.type === 'referral_bonus';
    return true;
  });

  return (
    <div className="space-y-4 pb-28 text-white bg-[#0A0F1D] min-h-screen px-2 sm:px-4 pt-2">
      {/* 1. Header Card matching screenshot */}
      <div className="bg-[#131B31] border border-slate-800 rounded-3xl p-5 shadow-xl">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Transaction History</h2>
            <p className="text-xs text-slate-400">Official real-time ledger of your recharges, withdrawals & bonuses</p>
          </div>
        </div>

        {/* 3 Summary Stats Boxes */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <button 
            onClick={loadHistory}
            className="bg-[#0B1220] border border-slate-800 rounded-2xl p-3 flex flex-col items-center justify-center text-center hover:border-blue-500/50 transition"
          >
            <RefreshCcw className={`w-4 h-4 text-blue-400 mb-1 ${syncing ? 'animate-spin' : ''}`} />
            <span className="text-[10px] text-slate-400">Status</span>
            <span className="text-xs font-bold text-blue-400">{syncing ? 'Syncing...' : 'Synced ✓'}</span>
          </button>
          
          <div className="bg-[#0B1220] border border-slate-800 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] text-slate-400">SETTLED RECHARGES</span>
            <span className="text-sm font-black text-emerald-400 mt-0.5">₹{totalRecharge.toLocaleString()}</span>
          </div>

          <div className="bg-[#0B1220] border border-slate-800 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] text-slate-400">SETTLED PAYOUTS</span>
            <span className="text-sm font-black text-blue-400 mt-0.5">₹{totalPayouts.toLocaleString()}</span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <button
            onClick={() => setFilterType('all')}
            className={`py-2.5 rounded-2xl text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
              filterType === 'all' ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-600/30 border border-blue-500/50' : 'bg-[#0B1220] text-slate-400 border border-slate-800'
            }`}
          >
            <span>ALL</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${filterType === 'all' ? 'bg-white/20' : 'bg-slate-800'}`}>{transactions.length}</span>
          </button>
          <button
            onClick={() => setFilterType('recharge')}
            className={`py-2.5 rounded-2xl text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
              filterType === 'recharge' ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-600/30 border border-blue-500/50' : 'bg-[#0B1220] text-slate-400 border border-slate-800'
            }`}
          >
            <span>RECHARGE</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${filterType === 'recharge' ? 'bg-white/20' : 'bg-slate-800'}`}>{transactions.filter(t => t.type === 'deposit').length}</span>
          </button>
          <button
            onClick={() => setFilterType('withdrawal')}
            className={`py-2.5 rounded-2xl text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
              filterType === 'withdrawal' ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-600/30 border border-blue-500/50' : 'bg-[#0B1220] text-slate-400 border border-slate-800'
            }`}
          >
            <span>WITHDRAWAL</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${filterType === 'withdrawal' ? 'bg-white/20' : 'bg-slate-800'}`}>{transactions.filter(t => t.type === 'withdrawal').length}</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mt-4">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by amount, UTR, ref, or ID..."
            className="w-full bg-[#0B1220] border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Secondary Chips */}
        <div className="flex space-x-2 mt-3 overflow-x-auto scrollbar-none">
          <button onClick={() => setFilterType('bonus')} className="bg-[#0B1220] border border-slate-800 px-3 py-1.5 rounded-xl text-[11px] font-semibold text-slate-300 flex items-center space-x-1 whitespace-nowrap shadow-sm">
            <Gift className="w-3.5 h-3.5 text-pink-400" />
            <span>Scratch Bonus</span>
          </button>
          <button onClick={() => setFilterType('bonus')} className="bg-[#0B1220] border border-slate-800 px-3 py-1.5 rounded-xl text-[11px] font-semibold text-slate-300 flex items-center space-x-1 whitespace-nowrap shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Dividend Claims</span>
          </button>
        </div>
      </div>

      {/* Transaction Cards List */}
      <div className="space-y-3">
        {filteredTx.length === 0 ? (
          <div className="bg-[#131B31] border border-slate-800 rounded-3xl p-8 text-center text-slate-400 text-xs shadow-xl">
            No transaction records found matching your filter.
          </div>
        ) : (
          filteredTx.map(tx => {
            const txId = `#TX-${1793000000000 + tx.id * 1234}`;
            const isPositive = tx.type === 'deposit' || tx.type === 'daily_reward' || tx.type === 'scratch_reward' || tx.type === 'referral_bonus';
            
            return (
              <div key={tx.id} className="bg-[#131B31] border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                      isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'
                    }`}>
                      {isPositive ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-black text-white text-sm uppercase">
                          {tx.type === 'deposit' ? 'RECHARGE DEPOSIT' : 
                           tx.type === 'withdrawal' ? 'PAYOUT WITHDRAWAL' : 
                           tx.type === 'daily_reward' ? 'DIVIDEND CLAIM' : 'BONUS REWARD'}
                        </h4>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        {tx.type === 'deposit' ? 'UPI Payment' : tx.type === 'daily_reward' ? 'Daily Attendance Check-in' : 'Wallet Transfer'} • {new Date(tx.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className={`text-sm font-black ${isPositive ? 'text-emerald-400' : 'text-blue-400'}`}>
                      {isPositive ? '+' : '-'}₹{tx.amount.toFixed(2)}
                    </p>
                    <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold mt-1 ${
                      tx.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                      tx.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'
                    }`}>
                      {tx.status === 'approved' && <CheckCircle className="w-3 h-3" />}
                      {tx.status === 'pending' && <Clock className="w-3 h-3" />}
                      <span className="uppercase">{tx.status === 'approved' ? 'Successful' : tx.status}</span>
                    </span>
                  </div>
                </div>

                <div className="bg-[#0B1220] border border-slate-800 rounded-2xl p-3 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-[11px]">Tx ID:</span>
                    <div className="flex items-center space-x-1.5">
                      <span className="font-mono font-bold text-blue-400">{txId}</span>
                      <button onClick={() => handleCopyTx(txId)} className="text-slate-400 hover:text-white">
                        {copiedId === txId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-[11px]">Ref:</span>
                    <span className="font-mono text-slate-300 truncate max-w-[200px]">{tx.reference_no || tx.details}</span>
                  </div>
                </div>

                <div className="bg-blue-900/20 border border-blue-800/40 rounded-xl p-2.5 text-[11px] text-blue-300 flex items-center space-x-2">
                  <span className="font-bold">Note:</span>
                  <span className="italic">Verified & Approved by Finance Desk (SUCCESS)</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Live Floating Ticker matching screenshot */}
      <div className="fixed bottom-20 left-4 right-4 bg-[#131B31] border border-emerald-500/30 rounded-2xl p-3 shadow-2xl flex items-center justify-between text-xs z-30">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
            ✓
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-white">99***57</span>
              <span className="bg-emerald-500/10 text-emerald-400 text-[9px] px-1.5 py-0.5 rounded font-bold">Verified</span>
            </div>
            <p className="text-[11px] text-slate-300">₹500 claimed dividend from Nayara Petrol Pump</p>
          </div>
        </div>
      </div>
    </div>

  );
};
