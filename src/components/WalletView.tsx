import React, { useState, useEffect } from 'react';
import { 
  Wallet, ArrowDownRight, ArrowUpRight, QrCode, Copy, Check, ShieldCheck, 
  AlertCircle, Building2, Smartphone, User as UserIcon, CreditCard, Hash, Phone,
  Clock, Download, ArrowLeft, Zap, Info, HelpCircle, Upload, X, RefreshCw, CheckCircle2, AlertTriangle
} from 'lucide-react';
import { User, Deposit, Withdrawal, Transaction } from '../types';

interface WalletViewProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

interface BankInfo {
  holderName: string;
  accountNumber: string;
  ifscCode: string;
  mobile: string;
}

const parseBankDetails = (raw?: string): BankInfo => {
  if (!raw) return { holderName: '', accountNumber: '', ifscCode: '', mobile: '' };
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return {
        holderName: parsed.holderName || '',
        accountNumber: parsed.accountNumber || '',
        ifscCode: parsed.ifscCode || '',
        mobile: parsed.mobile || '',
      };
    }
  } catch {
    // Handle fallback string like "1234567890, SBIN0001234, Rahul Sharma"
    const parts = raw.split(/[,|]/).map(s => s.trim());
    return {
      holderName: parts[2] || '',
      accountNumber: parts[0] || '',
      ifscCode: parts[1] || '',
      mobile: parts[3] || '',
    };
  }
  return { holderName: '', accountNumber: raw, ifscCode: '', mobile: '' };
};

export const WalletView: React.FC<WalletViewProps> = ({ user, onUpdateUser, showToast }) => {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'history'>('deposit');
  const [walletData, setWalletData] = useState<{
    deposits: Deposit[];
    withdrawals: Withdrawal[];
    transactions: Transaction[];
    settings: { upi_id?: string; qr_code_url?: string; deposit_qr_url?: string; min_withdrawal?: string; max_withdrawal?: string };
  }>({ deposits: [], withdrawals: [], transactions: [], settings: {} });

  // Deposit flow state matching screenshots
  const [depositStep, setDepositStep] = useState<'form' | 'payment' | 'submitted'>('form');
  const [depositAmount, setDepositAmount] = useState('25000');
  const [sessionId, setSessionId] = useState('DEP-RPAY-MVZKCYD3-AGBV0');
  const [timeLeft, setTimeLeft] = useState(596); // starts ~09:56 matching screenshot
  const [showUtrModal, setShowUtrModal] = useState(false);
  const [submittingDeposit, setSubmittingDeposit] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    txId: string;
    amount: number;
    submittedAt: string;
  } | null>(null);
  const [floatingAlert, setFloatingAlert] = useState<{
    user: string;
    amount: string;
    plan: string;
  } | null>({
    user: '88***91',
    amount: '₹500',
    plan: 'Nayara Petrol Pump'
  });

  const [utr, setUtr] = useState('');
  const [screenshot, setScreenshot] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Withdrawal form
  const [withdrawAmount, setWithdrawAmount] = useState('150');
  const [method, setMethod] = useState<'UPI' | 'Bank'>('UPI');
  const [upiIdInput, setUpiIdInput] = useState(user.upi_id || '');

  // Detailed Bank Fields
  const [holderName, setHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [bankMobile, setBankMobile] = useState('');

  const [withdrawalPin, setWithdrawalPin] = useState('');
  const [savingDetails, setSavingDetails] = useState(false);

  const loadWallet = () => {
    fetch(`/api/wallet/${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setWalletData({
            deposits: data.deposits || [],
            withdrawals: data.withdrawals || [],
            transactions: data.transactions || [],
            settings: data.settings || {}
          });
          if (data.settings?.min_withdrawal) {
            const minW = parseFloat(data.settings.min_withdrawal);
            if (!isNaN(minW) && (!withdrawAmount || parseFloat(withdrawAmount) < minW)) {
              setWithdrawAmount(String(minW));
            }
          }
        }
      });
  };

  useEffect(() => {
    loadWallet();
    if (user.upi_id) setUpiIdInput(user.upi_id);
    if (user.bank_details) {
      const parsed = parseBankDetails(user.bank_details);
      if (parsed.holderName) setHolderName(parsed.holderName);
      else if (user.name) setHolderName(user.name);

      if (parsed.accountNumber) setAccountNumber(parsed.accountNumber);
      if (parsed.ifscCode) setIfscCode(parsed.ifscCode);
      if (parsed.mobile) setBankMobile(parsed.mobile);
      else if (user.mobile) setBankMobile(user.mobile);
    } else {
      if (user.name) setHolderName(user.name);
      if (user.mobile) setBankMobile(user.mobile);
    }
  }, [user.id, user.upi_id, user.bank_details, user.name, user.mobile]);

  // Live Countdown Timer Effect for Payment Session
  useEffect(() => {
    if (depositStep !== 'payment') return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [depositStep]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleCopyUpi = () => {
    const upi = walletData.settings.upi_id || 'paytm.s3ppxue@pty';
    navigator.clipboard.writeText(upi);
    setCopiedUpi(true);
    showToast('Official UPI ID copied to clipboard!', 'success');
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleProceedToPayment = () => {
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt < 500) {
      showToast('Minimum deposit amount is ₹500', 'error');
      return;
    }
    if (amt > 100000) {
      showToast('Maximum deposit amount is ₹1,00,000', 'error');
      return;
    }
    const rand1 = Math.random().toString(36).substring(2, 10).toUpperCase();
    const rand2 = Math.random().toString(36).substring(2, 7).toUpperCase();
    setSessionId(`DEP-RPAY-${rand1}-${rand2}`);
    setTimeLeft(596); // 9 mins 56 secs matching screenshot
    setDepositStep('payment');
  };

  const handleDownloadQr = () => {
    const officialUpi = walletData.settings.upi_id || 'paytm.s3ppxue@pty';
    const upiUrl = `upi://pay?pa=${encodeURIComponent(officialUpi)}&pn=Reliance%20Pay%20Official&am=${depositAmount}&cu=INR`;
    const qrImageUrl = walletData.settings.qr_code_url || `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(upiUrl)}`;

    const a = document.createElement('a');
    a.href = qrImageUrl;
    a.target = '_blank';
    a.download = `ReliancePay_QR_${depositAmount}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('Downloading Official Reliance Pay QR Code...', 'success');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('File size must be under 5MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshot(reader.result as string);
        showToast('Screenshot attached successfully!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(depositAmount);
    if (!utr || !depositAmount || isNaN(amt)) {
      showToast('Please enter amount and 12-digit UTR reference number', 'error');
      return;
    }

    if (utr.trim().length < 6) {
      showToast('Please enter a valid 12-digit UTR number', 'error');
      return;
    }

    try {
      setSubmittingDeposit(true);
      const res = await fetch('/api/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, amount: amt, utr: utr.trim(), screenshot })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Deposit submission failed');

      setSubmittedData({
        txId: data.transaction_id || `#${Date.now()}`,
        amount: amt,
        submittedAt: new Date().toLocaleString('en-IN', {
          day: 'numeric',
          month: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        })
      });
      setDepositStep('submitted');
      showToast(data.message || 'Deposit request submitted successfully!', 'success');
      setUtr('');
      setScreenshot('');
      loadWallet();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSubmittingDeposit(false);
    }
  };

  const handleSavePayoutDetails = async () => {
    try {
      setSavingDetails(true);
      const payload: any = { id: user.id };

      if (method === 'UPI') {
        if (!upiIdInput.trim()) {
          showToast('Please enter a valid UPI ID (e.g. name@okhdfcbank)', 'error');
          setSavingDetails(false);
          return;
        }
        payload.upi_id = upiIdInput.trim();
      } else {
        if (!holderName.trim()) {
          showToast('Please enter Holder Name', 'error');
          setSavingDetails(false);
          return;
        }
        if (!accountNumber.trim()) {
          showToast('Please enter Bank Account Number', 'error');
          setSavingDetails(false);
          return;
        }
        if (!ifscCode.trim()) {
          showToast('Please enter Bank IFSC Code', 'error');
          setSavingDetails(false);
          return;
        }
        if (!bankMobile.trim()) {
          showToast('Please enter Bank Linked Mobile Number', 'error');
          setSavingDetails(false);
          return;
        }
        payload.bank_details = JSON.stringify({
          holderName: holderName.trim(),
          accountNumber: accountNumber.trim(),
          ifscCode: ifscCode.trim().toUpperCase(),
          mobile: bankMobile.trim()
        });
      }

      const res = await fetch(`/api/user/profile/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save payout details');

      onUpdateUser(data.user);
      showToast(`${method === 'UPI' ? 'UPI ID' : 'Bank details'} saved & verified successfully!`, 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSavingDetails(false);
    }
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user.kyc_required === 1) {
      showToast('KYC Verification Required. Withdrawal restricted.', 'error');
      return;
    }
    let activeDetailsSummary = '';

    if (method === 'UPI') {
      if (!upiIdInput.trim()) {
        showToast('Please enter your UPI ID', 'error');
        return;
      }
      activeDetailsSummary = `UPI: ${upiIdInput.trim()}`;
    } else {
      if (!holderName.trim() || !accountNumber.trim() || !ifscCode.trim() || !bankMobile.trim()) {
        showToast('Please enter Holder Name, A/C Number, IFSC Code and Mobile number', 'error');
        return;
      }
      activeDetailsSummary = `Holder: ${holderName.trim()} | A/C: ${accountNumber.trim()} | IFSC: ${ifscCode.trim().toUpperCase()} | Mob: ${bankMobile.trim()}`;
    }

    const minLimit = parseFloat(walletData.settings?.min_withdrawal || '150');
    const maxLimit = parseFloat(walletData.settings?.max_withdrawal || '50000');
    const numericAmt = parseFloat(withdrawAmount);

    if (!withdrawAmount || isNaN(numericAmt) || !withdrawalPin) {
      showToast('Please enter a valid withdrawal amount and PIN', 'error');
      return;
    }

    if (numericAmt < minLimit) {
      showToast(`Minimum withdrawal allowed is ₹${minLimit.toLocaleString('en-IN')}`, 'error');
      return;
    }

    if (numericAmt > maxLimit) {
      showToast(`Maximum withdrawal allowed is ₹${maxLimit.toLocaleString('en-IN')}`, 'error');
      return;
    }

    try {
      // Auto-save the details to user profile for future use
      const savePayload: any = {};
      if (method === 'UPI') {
        savePayload.upi_id = upiIdInput.trim();
      } else {
        savePayload.bank_details = JSON.stringify({
          holderName: holderName.trim(),
          accountNumber: accountNumber.trim(),
          ifscCode: ifscCode.trim().toUpperCase(),
          mobile: bankMobile.trim()
        });
      }

      await fetch(`/api/user/profile/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(savePayload)
      });

      const res = await fetch('/api/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          amount: numericAmt,
          method: method === 'UPI' ? 'UPI' : 'Bank Transfer',
          account_details: activeDetailsSummary,
          withdrawal_pin: withdrawalPin
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Withdrawal failed');

      showToast(data.message, 'success');
      setWithdrawAmount(String(minLimit));
      setWithdrawalPin('');
      loadWallet();

      // Refresh user profile
      const userRes = await fetch(`/api/user/profile/${user.id}`);
      const userData = await userRes.json();
      if (userData.success) onUpdateUser(userData.user);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const minLimit = parseFloat(walletData.settings?.min_withdrawal || '150');
  const maxLimit = parseFloat(walletData.settings?.max_withdrawal || '50000');
  const parsedAmount = parseFloat(withdrawAmount) || 0;
  const platformFee = parsedAmount * 0.10;
  const netReceived = parsedAmount - platformFee;

  const currentSavedBank = parseBankDetails(user.bank_details);

  const officialUpi = walletData.settings.upi_id || 'paytm.s3ppxue@pty';
  const upiUrl = `upi://pay?pa=${encodeURIComponent(officialUpi)}&pn=Reliance%20Pay%20Official&am=${depositAmount}&cu=INR`;
  const qrImageUrl = walletData.settings.deposit_qr_url || `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(upiUrl)}`;

  const quickAmounts = [500, 1000, 2000, 5000, 10000, 25000];

  return (
    <div className="space-y-6 pb-24 text-white bg-[#0A0F1D] min-h-screen px-2 sm:px-4 pt-1 max-w-3xl mx-auto">
      {/* Top Navigation Tabs */}
      <div className="flex items-center justify-between bg-[#131B31] p-1.5 rounded-2xl border border-slate-800 shadow-xl">
        <button
          onClick={() => setActiveTab('deposit')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center space-x-1.5 ${
            activeTab === 'deposit' 
              ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-600/30' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ArrowDownRight className="w-4 h-4" />
          <span>Deposit (रिचार्ज)</span>
        </button>
        <button
          onClick={() => setActiveTab('withdraw')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center space-x-1.5 ${
            activeTab === 'withdraw' 
              ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>Withdraw (निकासी)</span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center space-x-1.5 ${
            activeTab === 'history' 
              ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>History (इतिहास)</span>
        </button>
      </div>

      {/* Deposit Tab - Exact Match to Screenshots */}
      {activeTab === 'deposit' && (
        <div className="space-y-4">
          {/* Header Title with Verified Payment Desk Badge */}
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Deposit</h1>
              <span className="inline-flex items-center space-x-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold tracking-wide">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified Payment Desk</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Deposit funds to your Reliance Pay asset wallet via verified UPI channels
            </p>
          </div>

          {/* ASSET BALANCE Card */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 border border-blue-500/60 rounded-2xl p-4 sm:p-5 flex justify-between items-center shadow-2xl">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-blue-100">ASSET BALANCE</p>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-0.5">
                ₹{user.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h2>
            </div>
            <span className="bg-white/20 border border-white/30 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-inner">
              Min ₹500
            </span>
          </div>

          {/* Stepper Progress Bar (1 Amount -> 2 Channel -> 3 Rules -> 5 Payment) */}
          <div className="bg-[#0B1220] border border-slate-800 rounded-2xl p-3 flex items-center justify-between text-xs shadow-inner">
            <div className="flex items-center space-x-1.5">
              <div className="w-5 h-5 rounded-full flex items-center justify-center font-black text-[11px] bg-blue-600 text-white">
                1
              </div>
              <span className="font-bold text-blue-400 text-[11px] sm:text-xs">Amount</span>
            </div>

            <div className="flex-1 mx-2 h-[1px] bg-slate-800"></div>

            <div className="flex items-center space-x-1.5">
              <div className="w-5 h-5 rounded-full flex items-center justify-center font-black text-[11px] bg-blue-600 text-white">
                2
              </div>
              <span className="font-bold text-blue-400 text-[11px] sm:text-xs">Channel</span>
            </div>

            <div className="flex-1 mx-2 h-[1px] bg-slate-800"></div>

            <div className="flex items-center space-x-1.5">
              <div className="w-5 h-5 rounded-full flex items-center justify-center font-black text-[11px] bg-blue-600 text-white">
                3
              </div>
              <span className="font-bold text-blue-400 text-[11px] sm:text-xs">Rules</span>
            </div>

            <div className="flex-1 mx-2 h-[1px] bg-slate-800"></div>

            <div className="flex items-center space-x-1.5">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center font-black text-[11px] ${
                depositStep === 'payment' || depositStep === 'submitted'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-500'
              }`}>
                5
              </div>
              <span className={`font-bold text-[11px] sm:text-xs ${
                depositStep === 'payment' || depositStep === 'submitted' ? 'text-emerald-400' : 'text-slate-500'
              }`}>
                Payment
              </span>
            </div>
          </div>

          {/* PHASE 1: AMOUNT SELECTION & RULES (Screenshot Form) */}
          {depositStep === 'form' && (
            <div className="space-y-4">
              {/* Card 1: 1 Enter Deposit Amount */}
              <div className="bg-[#131B31] border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                      1
                    </span>
                    <h3 className="font-bold text-white text-sm sm:text-base">Enter Deposit Amount</h3>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">Min: ₹500 • Max: ₹100000</span>
                </div>

                {/* Amount input with ₹ prefix */}
                <div className="relative">
                  <span className="absolute left-4 top-3 text-blue-400 font-black text-2xl">₹</span>
                  <input
                    type="number"
                    min="500"
                    max="100000"
                    value={depositAmount}
                    onChange={e => setDepositAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full bg-[#0B1220] border border-slate-800 rounded-2xl pl-10 pr-4 py-3.5 text-white font-black text-2xl focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Quick Amount Select Pills */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">QUICK AMOUNT SELECT</p>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {quickAmounts.map(amt => {
                      const isSelected = parseFloat(depositAmount) === amt;
                      return (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setDepositAmount(String(amt))}
                          className={`py-2.5 px-2 rounded-xl text-xs font-bold transition border ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/30'
                              : 'bg-[#0B1220] text-slate-300 border-slate-800 hover:bg-slate-800'
                          }`}
                        >
                          ₹{amt.toLocaleString('en-IN')}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Card 2: 2 Select Payment Channel */}
              <div className="bg-[#131B31] border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-3 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                      2
                    </span>
                    <h3 className="font-bold text-white text-sm sm:text-base">Select Payment Channel</h3>
                  </div>
                  <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                    0% Gateway Fee
                  </span>
                </div>

                <div className="bg-[#0B1220] border border-slate-800 rounded-2xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                        <Zap className="w-4 h-4 fill-white" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">UPI Payment (Official Gateway)</p>
                        <p className="text-[11px] text-slate-400">Fastest channel • Merchant QR & One-Click UPI Apps</p>
                      </div>
                    </div>
                    <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded border border-blue-600">
                      Recommended
                    </span>
                  </div>

                  {/* App Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {['PhonePe', 'Google Pay', 'Paytm UPI', 'Other UPI Apps'].map(app => (
                      <span key={app} className="bg-[#131B31] text-slate-300 text-[10px] font-semibold px-2.5 py-1 rounded-lg border border-slate-800 shadow-sm">
                        {app}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card 3: 3 Deposit Information & Security Rules (जमा नियम) */}
              <div className="bg-[#131B31] border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-3 shadow-xl">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                    3
                  </span>
                  <h3 className="font-bold text-white text-sm sm:text-base">
                    Deposit Information & Security Rules (जमा नियम)
                  </h3>
                </div>

                <div className="bg-[#0B1220] border border-slate-800 rounded-2xl p-4 text-[11px] text-slate-300 space-y-2">
                  <div className="flex items-start space-x-2">
                    <span className="font-bold text-blue-400">1.</span>
                    <span>कम से कम रिचार्ज <strong>₹500</strong> और अधिकतम <strong>₹1,00,000</strong> तक एक बार में किया जा सकता है।</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="font-bold text-blue-400">2.</span>
                    <span>भुगतान के लिए केवल आधिकारिक UPI ID या QR कोड का ही उपयोग करें।</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="font-bold text-blue-400">3.</span>
                    <span>पेमेंट पूरा होने के बाद <strong>12-अंकों का UTR / UPI Transaction Reference</strong> नंबर अनिवार्य रूप से दर्ज करें।</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="font-bold text-blue-400">4.</span>
                    <span>गलत UTR या फर्जी स्क्रीनशॉट दर्ज करने पर खाता तुरंत ब्लॉक कर दिया जाएगा।</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="font-bold text-blue-400">5.</span>
                    <span>आपका फंड UTR सबमिट करने के बाद <strong>2 से 10 मिनट</strong> के अंदर वॉलेट में क्रेडिट कर दिया जाता है।</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="font-bold text-blue-400">6.</span>
                    <span>किसी भी सहायता के लिए 24/7 हेल्पडेस्क या WhatsApp सपोर्ट से तुरंत संपर्क करें।</span>
                  </div>
                </div>
              </div>

              {/* Proceed Now Button */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleProceedToPayment}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-600/30 text-base transition flex items-center justify-center space-x-2"
                >
                  <span>Proceed Now (आगे बढ़ें ₹{Number(depositAmount || 0).toLocaleString('en-IN')})</span>
                  <span>➔</span>
                </button>
                <p className="text-[11px] text-slate-400 text-center">
                  Clicking 'Proceed Now' creates a secure 10-minute payment session
                </p>
              </div>
            </div>
          )}

          {/* PHASE 2: 10-MINUTE PAYMENT ORDER SCREEN (Exact Screenshots 1, 4, 5) */}
          {depositStep === 'payment' && (
            <div className="space-y-4">
              {/* Change Amount button & Session Bar */}
              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setDepositStep('form')}
                  className="bg-[#131B31] hover:bg-slate-800 border border-slate-800 text-slate-300 px-3.5 py-2 rounded-xl flex items-center space-x-1.5 font-bold transition shadow-sm"
                >
                  <ArrowLeft className="w-4 h-4 text-slate-400" />
                  <span>Change Amount</span>
                </button>
                <div className="font-mono text-[11px] sm:text-xs">
                  <span className="text-slate-400">Session: </span>
                  <span className="text-blue-400 font-bold">{sessionId}</span>
                </div>
              </div>

              {/* PAYMENT ORDER SUMMARY Card */}
              <div className="bg-[#131B31] border border-slate-800 rounded-3xl p-5 sm:p-7 space-y-5 shadow-xl">
                <div>
                  <p className="text-[11px] font-extrabold tracking-wider text-blue-400 uppercase">PAYMENT ORDER SUMMARY</p>
                  <h2 className="text-3xl sm:text-4xl font-black text-white mt-1">
                    ₹{Number(depositAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">Channel: UPI Payment</p>
                </div>

                {/* Countdown Timer */}
                <div className="bg-[#0B1220] border border-blue-900/40 rounded-2xl p-3.5 sm:p-4 flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 flex-shrink-0">
                    <Clock className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">COMPLETE PAYMENT WITHIN</p>
                    <p className="text-2xl font-black font-mono text-blue-400 tracking-wider">
                      {formatTime(timeLeft)}
                    </p>
                  </div>
                </div>

                {/* QR Code Container */}
                <div className="flex flex-col items-center justify-center py-2">
                  <div className="bg-white p-3.5 rounded-3xl border-4 border-blue-600 shadow-2xl shadow-blue-600/20 max-w-[240px] w-full flex items-center justify-center">
                    <img
                      src={qrImageUrl}
                      alt="UPI QR Code"
                      className="w-48 h-48 object-contain rounded-lg"
                    />
                  </div>
                </div>

                {/* Merchant Payee */}
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">MERCHANT PAYEE</p>
                  <p className="text-base sm:text-lg font-black text-white">Reliance Pay Official</p>
                </div>

                {/* Official UPI ID (VPA) */}
                <div className="bg-[#0B1220] border border-slate-800 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-blue-400 uppercase">OFFICIAL UPI ID (VPA)</span>
                    <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                      LIVE VERIFIED
                    </span>
                  </div>
                  <p className="font-mono font-black text-base text-white tracking-wide">
                    {officialUpi}
                  </p>
                </div>

                {/* 2 Buttons Side-by-Side: Download QR and Copy UPI */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleDownloadQr}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-3 rounded-xl text-xs sm:text-sm flex items-center justify-center space-x-2 transition shadow-lg shadow-emerald-600/30"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download QR</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-black py-3 px-3 rounded-xl text-xs sm:text-sm flex items-center justify-center space-x-2 transition shadow-lg shadow-blue-600/30"
                  >
                    {copiedUpi ? <Check className="w-4 h-4 text-emerald-100" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedUpi ? 'Copied' : 'Copy UPI'}</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                  Download or scan QR with any UPI app (PhonePe / Google Pay / Paytm) or copy the official UPI ID to complete your payment of ₹{Number(depositAmount || 0).toLocaleString('en-IN')}.
                </p>

                {/* Payment Apps Section */}
                <div className="pt-2 border-t border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wide">
                      PAYMENT APPS (PHONEPE / GOOGLE PAY / PAYTM):
                    </span>
                    <span className="bg-blue-500/10 text-blue-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-blue-500/30">
                      Direct Click Disabled
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="bg-[#0B1220] border border-slate-800 rounded-xl p-3 flex items-center space-x-2.5 text-xs text-slate-500 opacity-80 cursor-not-allowed">
                      <div className="w-3.5 h-3.5 rounded-full bg-slate-700"></div>
                      <span className="font-semibold">PhonePe</span>
                    </div>
                    <div className="bg-[#0B1220] border border-slate-800 rounded-xl p-3 flex items-center space-x-2.5 text-xs text-slate-500 opacity-80 cursor-not-allowed">
                      <div className="w-3.5 h-3.5 rounded-full bg-slate-700"></div>
                      <span className="font-semibold">Google Pay</span>
                    </div>
                    <div className="bg-[#0B1220] border border-slate-800 rounded-xl p-3 flex items-center space-x-2.5 text-xs text-slate-500 opacity-80 cursor-not-allowed">
                      <div className="w-3 h-3 rotate-45 bg-slate-700"></div>
                      <span className="font-semibold">Paytm UPI</span>
                    </div>
                    <div className="bg-[#0B1220] border border-slate-800 rounded-xl p-3 flex items-center space-x-2.5 text-xs text-slate-500 opacity-80 cursor-not-allowed">
                      <Zap className="w-3.5 h-3.5 text-slate-600" />
                      <span className="font-semibold">Other UPI Apps</span>
                    </div>
                  </div>

                  {/* Information Notice Box */}
                  <div className="bg-[#0B1220] border border-blue-900/40 rounded-xl p-3 text-[11px] text-slate-300 flex items-start space-x-2.5">
                    <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      Direct app click is disabled. Please click <strong>Download QR</strong> or <strong>Copy UPI</strong> above, open PhonePe / Google Pay / Paytm manually to complete payment, then submit the 12-digit UTR below.
                    </p>
                  </div>
                </div>
              </div>

              {/* Enter Payment Verification Details Card (Screenshot 4) */}
              <div className="bg-[#131B31] border border-slate-800 rounded-3xl p-5 sm:p-7 space-y-4 shadow-xl">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <div className="text-blue-400">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-white text-sm sm:text-base">
                      Enter Payment Verification Details
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowUtrModal(true)}
                    className="text-blue-400 hover:text-blue-300 text-xs font-bold underline flex items-center space-x-1"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Where is UTR?</span>
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Enter 12-Digit UPI Transaction ID / UTR <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={20}
                    value={utr}
                    onChange={e => setUtr(e.target.value)}
                    placeholder="e.g. 592810482910"
                    className="w-full bg-[#0B1220] border border-slate-800 rounded-xl px-4 py-3 text-white font-mono text-base focus:outline-none focus:border-blue-500 tracking-wider"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Standard UTR is 12 digits (numbers/alphanumeric) {utr.trim().length} / 12 characters
                  </p>
                </div>

                {/* Screenshot Upload */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Upload Payment Screenshot (JPG, PNG, WebP • Max 5MB)
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <label className="cursor-pointer bg-[#0B1220] hover:bg-slate-800 border border-slate-800 text-slate-300 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition flex-1">
                      <Upload className="w-4 h-4 text-blue-400" />
                      <span>Choose Screenshot Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>
                    {screenshot && (
                      <button
                        type="button"
                        onClick={() => setScreenshot('')}
                        className="px-3 py-2 bg-red-500/10 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold hover:bg-red-500/20"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {screenshot && (
                    <div className="mt-2 p-2 bg-[#0B1220] border border-slate-800 rounded-xl flex items-center space-x-3 shadow-inner">
                      <img src={screenshot} alt="Payment Screenshot" className="w-12 h-12 object-cover rounded-lg" />
                      <span className="text-xs text-emerald-400 font-semibold">Screenshot attached</span>
                    </div>
                  )}
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed bg-[#0B1220] p-3 rounded-xl border border-slate-800">
                  Notice: Uploading a screenshot assists verification, but does NOT automatically approve funds. All requests are manually checked by our finance desk.
                </p>

                <button
                  type="submit"
                  onClick={handleDepositSubmit}
                  disabled={submittingDeposit}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-600/30 text-base transition flex items-center justify-center space-x-2"
                >
                  <span>{submittingDeposit ? 'Submitting...' : `Submit Deposit Request (₹${Number(depositAmount || 0).toLocaleString('en-IN')})`}</span>
                </button>
              </div>
            </div>
          )}

          {/* PHASE 3: SUBMITTED CONFIRMATION SCREEN (Exact Screenshot 3) */}
          {depositStep === 'submitted' && (
            <div className="bg-[#0A1020] border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-8 space-y-6 text-center shadow-2xl">
              {/* Green Checkmark Circle */}
              <div className="w-16 h-16 rounded-full border-2 border-emerald-400/80 bg-emerald-500/10 flex items-center justify-center text-emerald-400 mx-auto">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Deposit Request Submitted<br />(Pending Verification)
                </h2>
                <p className="text-xs text-amber-400 font-bold mt-2">
                  Status: PENDING • Funds will be credited to your wallet once approved by Admin / Finance Desk.
                </p>
              </div>

              {/* Transaction Detail Card */}
              <div className="bg-[#070C18] border border-slate-800 rounded-2xl p-4 text-xs space-y-2.5 text-left font-mono">
                <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Transaction ID:</span>
                  <span className="font-bold text-white">{submittedData?.txId || '#1793642426259'}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Deposit Amount:</span>
                  <span className="font-black text-emerald-400 text-sm">
                    ₹{submittedData?.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '25,000.00'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Payment Channel:</span>
                  <span className="text-slate-200">UPI Payment</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Submitted At:</span>
                  <span className="text-slate-200">{submittedData?.submittedAt || new Date().toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400">Verification Status:</span>
                  <span className="bg-amber-500/20 text-amber-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-500/30">
                    PENDING / UNDER REVIEW
                  </span>
                </div>
              </div>

              {/* Balance Security Notice */}
              <div className="bg-[#14120D] border border-amber-600/40 rounded-2xl p-4 text-xs text-left">
                <p className="font-bold text-amber-400 mb-1 text-center sm:text-left">Balance Security Notice:</p>
                <p className="text-slate-300 text-[11px] leading-relaxed text-center sm:text-left">
                  Your wallet balance remains unchanged. Once our finance desk verifies your UTR against official bank statements, your funds will be approved and credited immediately.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    setDepositStep('form');
                    setSubmittedData(null);
                  }}
                  className="w-full bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black py-3.5 rounded-xl text-sm shadow-lg transition"
                >
                  Make Another Deposit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('recent-deposit-records');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full bg-[#131B31] hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold py-3.5 rounded-xl text-sm transition"
                >
                  View Deposit Records
                </button>
              </div>
            </div>
          )}

          {/* Recent Deposit Records List (Matches Screenshots 3, 4, 5) */}
          <div id="recent-deposit-records" className="space-y-3 pt-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-white text-sm sm:text-base flex items-center space-x-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Recent Deposit Records ({walletData.deposits.length})</span>
              </h3>
              <button
                type="button"
                onClick={loadWallet}
                className="bg-[#131B31] border border-slate-700 text-slate-300 hover:text-white text-[11px] font-bold px-3 py-1 rounded-xl flex items-center space-x-1 transition"
              >
                <RefreshCw className="w-3 h-3 text-blue-400" />
                <span>Syncing...</span>
              </button>
            </div>

            {walletData.deposits.length === 0 ? (
              <div className="bg-[#0A1020] border border-slate-800 rounded-2xl p-6 text-center text-slate-400 text-xs">
                No deposit records found yet.
              </div>
            ) : (
              <div className="space-y-2.5">
                {walletData.deposits.map(dep => {
                  const isSuccess = dep.status === 'approved' || dep.status === 'success';
                  const isPending = dep.status === 'pending';
                  return (
                    <div
                      key={dep.id}
                      className="bg-[#0A1020] border border-slate-800 rounded-2xl p-4 flex items-center justify-between transition hover:border-slate-700 shadow"
                    >
                      <div>
                        <p className="text-white font-black text-sm sm:text-base">
                          ₹{dep.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {new Date(dep.created_at).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: true
                          })} • UTR: {dep.utr.length > 8 ? `${dep.utr.substring(0, 6)}...` : dep.utr}
                        </p>
                        <p className={`text-[10px] italic mt-1 ${isSuccess ? 'text-emerald-400' : isPending ? 'text-amber-400' : 'text-rose-400'}`}>
                          {isSuccess
                            ? 'Financial Reconciliation by Admin (SUCCESS)'
                            : isPending
                            ? 'Awaiting admin verification'
                            : 'Verification rejected'}
                        </p>
                      </div>

                      <div>
                        <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-[10px] font-bold ${
                          isSuccess
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : isPending
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                        }`}>
                          {isSuccess && <Check className="w-3 h-3 stroke-[3]" />}
                          {isPending && <Clock className="w-3 h-3" />}
                          <span>{isSuccess ? 'Successful' : isPending ? 'Pending' : 'Rejected'}</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Dividend Banner matching screenshots 3, 4, 5 */}
      {floatingAlert && (
        <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-40 bg-[#141022]/95 backdrop-blur border border-pink-500/40 rounded-2xl p-3 shadow-2xl flex items-center justify-between text-xs">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white flex-shrink-0 shadow">
              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-slate-200">{floatingAlert.user}</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-1.5 py-0.2 rounded border border-emerald-500/40 flex items-center space-x-0.5">
                  <Check className="w-2.5 h-2.5" />
                  <span>Verified</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-300 truncate">
                <strong className="text-white">{floatingAlert.amount}</strong> claimed dividend from {floatingAlert.plan}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setFloatingAlert(null)}
            className="text-slate-400 hover:text-white p-1 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Where is UTR Modal */}
      {showUtrModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0E1526] border border-amber-500/40 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <HelpCircle className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-white text-base">Where to Find 12-Digit UTR?</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowUtrModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="bg-[#070C18] border border-slate-800 rounded-xl p-3">
                <p className="font-bold text-amber-400 mb-1">📱 PhonePe</p>
                <p className="text-[11px] text-slate-400">
                  Open PhonePe → History → Click on the payment → Look for <strong>UTR: 123456789012</strong> (12 digits) under Transfer Details.
                </p>
              </div>

              <div className="bg-[#070C18] border border-slate-800 rounded-xl p-3">
                <p className="font-bold text-amber-400 mb-1">📱 Google Pay (GPay)</p>
                <p className="text-[11px] text-slate-400">
                  Open Google Pay → Scroll to 'See transaction history' → Tap transaction → Find <strong>UPI transaction ID</strong> (12 digits).
                </p>
              </div>

              <div className="bg-[#070C18] border border-slate-800 rounded-xl p-3">
                <p className="font-bold text-amber-400 mb-1">📱 Paytm UPI</p>
                <p className="text-[11px] text-slate-400">
                  Open Paytm → Balance & History → Tap payment → Find <strong>UPI Ref No.</strong> (12 digits).
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowUtrModal(false)}
              className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black py-3 rounded-xl text-xs transition"
            >
              Got it, Close
            </button>
          </div>
        </div>
      )}

      {/* Withdrawal Tab - Exact Match to Screenshots */}
      {activeTab === 'withdraw' && (
        <div className="space-y-4">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Withdraw</h1>
              <span className="inline-flex items-center space-x-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 px-3 py-1 rounded-full text-xs font-bold tracking-wide">
                <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                <span>Secure Payout Portal</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Withdraw your settled dividends directly to your linked UPI or Bank account
            </p>
          </div>

          {/* Saved Payout Details Banner */}
          <div className="bg-[#0A0F1D] border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold flex-shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-300">
                  {method === 'UPI' ? 'Saved UPI Details' : 'Saved Bank Details'}
                </p>
                {method === 'UPI' ? (
                  <p className="text-[11px] font-mono text-emerald-400 truncate">
                    {user.upi_id ? `UPI: ${user.upi_id}` : 'No UPI ID saved yet'}
                  </p>
                ) : (
                  <p className="text-[11px] font-mono text-emerald-400 truncate">
                    {currentSavedBank.accountNumber
                      ? `${currentSavedBank.holderName} • A/C: ${currentSavedBank.accountNumber} • IFSC: ${currentSavedBank.ifscCode}`
                      : 'No Bank account saved yet'}
                  </p>
                )}
              </div>
            </div>
            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-500/30 flex-shrink-0 ml-2">
              Saved & Verified
            </span>
          </div>

          <form onSubmit={handleWithdrawSubmit} className="space-y-5">
            {/* Amount & Quick Pills */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-slate-300">
                  Withdrawal Amount (Min ₹{minLimit.toLocaleString('en-IN')})
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  Max: ₹{maxLimit.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="relative mb-3">
                <span className="absolute left-4 top-3.5 text-slate-400 font-bold text-lg">₹</span>
                <input
                  type="number"
                  required
                  min={minLimit}
                  max={maxLimit}
                  value={withdrawAmount}
                  onChange={e => setWithdrawAmount(e.target.value)}
                  className="w-full bg-[#0A0F1D] border border-slate-800 rounded-2xl pl-10 pr-4 py-3.5 text-white font-black text-lg focus:outline-none focus:border-blue-600"
                />
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {[
                  minLimit,
                  minLimit < 1000 ? 1000 : minLimit * 2,
                  2000,
                  5000,
                  maxLimit >= 10000 ? 10000 : maxLimit
                ]
                  .filter((v, i, a) => a.indexOf(v) === i && v >= minLimit && v <= maxLimit)
                  .slice(0, 5)
                  .map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setWithdrawAmount(String(amt))}
                      className={`py-2 rounded-xl text-xs font-bold transition border ${
                        parsedAmount === amt 
                          ? 'bg-pink-600 text-white border-pink-500 shadow-lg' 
                          : 'bg-[#0A0F1D] text-slate-300 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      ₹{amt >= 1000 ? `${amt / 1000}k` : amt}
                    </button>
                  ))}
              </div>
            </div>

            {/* Payout Channel Toggle */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Payout Channel</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMethod('UPI')}
                  className={`py-3 px-4 rounded-2xl text-xs font-bold flex items-center justify-center space-x-2 border transition ${
                    method === 'UPI' 
                      ? 'bg-blue-600 text-white border-blue-500 shadow-lg' 
                      : 'bg-[#0A0F1D] text-slate-400 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Instant UPI</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('Bank')}
                  className={`py-3 px-4 rounded-2xl text-xs font-bold flex items-center justify-center space-x-2 border transition ${
                    method === 'Bank' 
                      ? 'bg-blue-600 text-white border-blue-500 shadow-lg' 
                      : 'bg-[#0A0F1D] text-slate-400 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Bank Transfer</span>
                </button>
              </div>
            </div>

            {/* UPI Section */}
            {method === 'UPI' && (
              <div className="bg-[#0A0F1D] border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                    <Smartphone className="w-4 h-4 text-blue-400" />
                    <span>Your UPI ID / VPA *</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleSavePayoutDetails}
                    disabled={savingDetails}
                    className="text-[11px] font-bold text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{savingDetails ? 'Saving...' : 'Save UPI'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={upiIdInput}
                  onChange={e => setUpiIdInput(e.target.value)}
                  placeholder="e.g. user@okhdfcbank / paytm"
                  className="w-full bg-[#131B31] border border-slate-700 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-blue-500"
                />
                <p className="text-[10px] text-slate-400">
                  Instant withdrawal will be credited directly to this UPI ID.
                </p>
              </div>
            )}

            {/* Detailed Bank Details Section */}
            {method === 'Bank' && (
              <div className="bg-[#0A0F1D] border border-slate-800 rounded-2xl p-4 space-y-3.5">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-slate-200">Bank Account Details (बैंक विवरण)</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSavePayoutDetails}
                    disabled={savingDetails}
                    className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-lg text-[11px] font-bold flex items-center space-x-1 transition"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{savingDetails ? 'Saving...' : 'Save Details'}</span>
                  </button>
                </div>

                {/* 1. Holder Name */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center space-x-1">
                    <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                    <span>Holder Name (खाताधारक का नाम) *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={holderName}
                    onChange={e => setHolderName(e.target.value)}
                    placeholder="Enter full account holder name"
                    className="w-full bg-[#131B31] border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* 2. A/C Number */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center space-x-1">
                    <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                    <span>A/C Number (बैंक खाता संख्या) *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={accountNumber}
                    onChange={e => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 5010048192038"
                    className="w-full bg-[#131B31] border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* 3. IFSC Code */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center space-x-1">
                    <Hash className="w-3.5 h-3.5 text-slate-400" />
                    <span>IFSC Code (आईएफएससी कोड) *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={ifscCode}
                    onChange={e => setIfscCode(e.target.value.toUpperCase())}
                    placeholder="e.g. HDFC0001234 / SBIN0000456"
                    className="w-full bg-[#131B31] border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono uppercase text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* 4. Mobile number */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center space-x-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>Mobile Number (बैंक से जुड़ा मोबाइल नंबर) *</span>
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={bankMobile}
                    onChange={e => setBankMobile(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 9876543210"
                    className="w-full bg-[#131B31] border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <p className="text-[10px] text-slate-400 pt-1">
                  Click <strong>Save Details</strong> to save this bank account to your profile permanently.
                </p>
              </div>
            )}

            {/* Withdrawal Password / PIN */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Withdrawal Password / PIN</label>
              <input
                type="password"
                maxLength={6}
                required
                value={withdrawalPin}
                onChange={e => setWithdrawalPin(e.target.value)}
                placeholder="Enter 4 or 6-digit PIN"
                className="w-full bg-[#0A0F1D] border border-slate-800 rounded-2xl px-4 py-3 text-white font-mono tracking-widest focus:outline-none focus:border-blue-600"
              />
              <p className="text-[10px] text-slate-400 mt-1">Default PIN is 1234 unless updated in your profile.</p>
            </div>

            {/* Calculation Summary Box */}
            <div className="bg-[#0A0F1D] border border-slate-800 rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Requested Withdrawal:</span>
                <span className="font-bold text-white">₹{parsedAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Platform Fee (10%):</span>
                <span className="font-bold text-red-400">-₹{platformFee.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-sm">
                <span className="font-bold text-slate-200">Net Received in Account:</span>
                <span className="font-black text-emerald-400 text-base">₹{netReceived > 0 ? netReceived.toFixed(2) : '0.00'}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={user.kyc_required === 1}
              className={`w-full font-black py-4 rounded-2xl shadow-xl transition flex items-center justify-center space-x-2 text-sm ${
                user.kyc_required === 1
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed grayscale'
                : 'bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white shadow-pink-600/30'
              }`}
            >
              <span>{user.kyc_required === 1 ? 'KYC Required for Withdrawal' : `Confirm Withdrawal of ₹${parsedAmount.toFixed(0)}`}</span>
              <ArrowUpRight className="w-5 h-5" />
            </button>
          </form>

          {/* Payout Rules & Limits */}
          <div className="bg-[#0A0F1D] border border-slate-800 rounded-2xl p-4 text-[11px] text-slate-400 space-y-1.5">
            <p className="font-bold text-slate-200 mb-1 flex items-center space-x-1.5">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>Payout Rules & Limits</span>
            </p>
            <p>• Minimum withdrawal amount: ₹{minLimit.toLocaleString('en-IN')}</p>
            <p>• Maximum withdrawal limit: ₹{maxLimit.toLocaleString('en-IN')}</p>
            <p>• Platform service fee: 10% deducted per request</p>
            <p>• Withdrawal working hours: 08:00 - 20:00</p>
            <p>• Your payout details are saved securely in your profile</p>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="bg-[#131B31] rounded-3xl p-6 shadow-sm border border-slate-800 max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-extrabold text-white text-lg">Withdrawal History ({walletData.withdrawals.length})</h3>
            <span className="text-[10px] bg-blue-500/20 text-blue-400 font-bold px-3 py-1 rounded-full border border-blue-500/30 animate-pulse">
              SYNCING...
            </span>
          </div>
          {walletData.withdrawals.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">No withdrawal records found yet.</div>
          ) : (
            <div className="space-y-3">
              {walletData.withdrawals.map(wd => (
                <div key={wd.id} className="flex items-center justify-between p-4 rounded-2xl bg-[#0A0F1D] border border-slate-800">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center font-bold">
                      <ArrowUpRight className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">₹{wd.amount.toFixed(2)} ({wd.method})</p>
                      <p className="text-[11px] text-slate-400 font-mono truncate max-w-[180px] sm:max-w-md">{wd.account_details}</p>
                      <p className="text-[10px] text-slate-500">{new Date(wd.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                      wd.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      wd.status === 'pending' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {wd.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
