import React, { useState, useRef, useEffect } from 'react';
import { 
  User as UserIcon, ShieldCheck, Share2, Lock, KeyRound, LogOut, Copy, Check, 
  FileText, Headphones, Award, Bell, Volume2, Download, HelpCircle, ChevronRight, 
  Wallet, ArrowDownRight, ArrowUpRight, ShieldAlert, Sparkles, Phone, MessageCircle,
  Camera, X, Edit2, CreditCard, Cpu, Wifi, Zap, Building2, Search, Filter, CheckCircle2, AlertCircle, RefreshCw
} from 'lucide-react';
import { User, Deposit, Withdrawal, Transaction } from '../types';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { PWAInstallModal } from './PWAInstallModal';
import { LegalModal } from './LegalModal';
import { useAnimatedNumber } from '../hooks/useAnimatedNumber';

interface ProfileViewProps {
  user: User;
  settings: any;
  onUpdateUser: (updatedUser: User) => void;
  onLogout: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
  onOpenKyc: () => void;
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  onSwitchAdmin?: () => void;
  onOpenChat?: () => void;
  onOpenAdminAccess?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  settings,
  onUpdateUser,
  onLogout,
  showToast,
  onOpenKyc,
  onOpenDeposit,
  onOpenWithdraw,
  onSwitchAdmin,
  onOpenChat,
  onOpenAdminAccess
}) => {
  const telegramUrl = settings.telegram_link || 'https://t.me/reliancepay';
  const whatsappUrl = settings.whatsapp_link || 'https://wa.me/918824904563';
  const appName = settings.app_name || 'Reliance Pay';
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  // Modals state
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [showRechargeRecords, setShowRechargeRecords] = useState(false);
  const [showWithdrawRecords, setShowWithdrawRecords] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [showSoundboxModal, setShowSoundboxModal] = useState(false);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [showCustomerCareModal, setShowCustomerCareModal] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [legalTab, setLegalTab] = useState<'certification' | 'about' | 'terms' | 'privacy'>('certification');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Copy state
  const [copiedUid, setCopiedUid] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);

  // Password / PIN Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPin, setNewPin] = useState(user.withdrawal_pin || '1234');

  // Bank & UPI Form State
  const [upiInput, setUpiInput] = useState(user.upi_id || '');
  const [holderName, setHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [bankMobile, setBankMobile] = useState(user.mobile || '');

  // Edit Profile States
  const [editName, setEditName] = useState(user.name);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(user.profile_photo || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Soundbox & Notification Preferences
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => localStorage.getItem('reliance_pay_sound_enabled') !== 'false');
  const [notifyPrefs, setNotifyPrefs] = useState({
    recharge: true,
    withdrawal: true,
    investment: true,
    referral: true,
    security: true
  });

  // History & Records State
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Support Ticket creation form
  const [ticketSubject, setTicketSubject] = useState('General Issue');
  const [ticketMessage, setTicketMessage] = useState('');
  const [submittingTicket, setSubmittingTicket] = useState(false);

  // Balance Refresh Count-up 5s Hook
  const { displayValue, isRefreshing, refreshFromOne } = useAnimatedNumber(user.balance, 1500);

  // Parse Bank Details from User Profile JSON if available
  useEffect(() => {
    if (user.bank_details) {
      try {
        const parsed = JSON.parse(user.bank_details);
        if (parsed) {
          setHolderName(parsed.holderName || '');
          setAccountNumber(parsed.accountNumber || '');
          setIfscCode(parsed.ifscCode || '');
          setBankMobile(parsed.mobile || user.mobile || '');
        }
      } catch {
        const parts = user.bank_details.split(/[,|]/).map(s => s.trim());
        setHolderName(parts[2] || '');
        setAccountNumber(parts[0] || '');
        setIfscCode(parts[1] || '');
      }
    }
  }, [user.bank_details, user.mobile]);

  // Fetch Wallet Records
  const fetchWalletRecords = async () => {
    try {
      const res = await fetch(`/api/wallet/${user.id}`);
      const data = await res.json();
      if (data.success) {
        if (data.deposits) setDeposits(data.deposits);
        if (data.withdrawals) setWithdrawals(data.withdrawals);
        if (data.user && data.user.balance !== user.balance) {
          onUpdateUser({ ...user, balance: data.user.balance, deposited: data.user.deposited, withdrawn: data.user.withdrawn });
        }
      }
    } catch (_) {}
  };

  // Fetch Support Tickets
  const fetchTickets = async () => {
    try {
      const res = await fetch(`/api/support/tickets/${user.id}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.tickets)) {
        setTickets(data.tickets);
      }
    } catch (_) {}
  };

  // Fetch Referrals
  const fetchReferrals = async () => {
    try {
      const res = await fetch(`/api/referrals/${user.id}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.referrals)) {
        setReferrals(data.referrals);
      }
    } catch (_) {}
  };

  useEffect(() => {
    fetchWalletRecords();
    fetchTickets();
    fetchReferrals();
  }, [user.id]);

  // Copy Handlers
  const handleCopyUid = () => {
    navigator.clipboard.writeText(user.user_code);
    setCopiedUid(true);
    showToast('User ID copied to clipboard!', 'success');
    setTimeout(() => setCopiedUid(false), 2000);
  };

  const handleCopyRef = () => {
    navigator.clipboard.writeText(user.referral_code);
    setCopiedRef(true);
    showToast('Referral Code copied to clipboard!', 'success');
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const handleRefreshBalance = async () => {
    try {
      const res = await fetch(`/api/wallet/${user.id}`);
      const data = await res.json();
      if (data.success && data.user) {
        onUpdateUser(data.user);
        refreshFromOne(data.user.balance, 5000);
      } else {
        refreshFromOne(user.balance, 5000);
      }
      showToast('Wallet balance syncing... counting up from ₹1.00!', 'success');
    } catch (_) {
      refreshFromOne(user.balance, 5000);
    }
  };

  // Photo Select & Update
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const formData = new FormData();
      formData.append('name', editName);
      if (selectedPhoto) {
        formData.append('profile_photo', selectedPhoto);
      } else if (!photoPreview && user.profile_photo) {
        formData.append('remove_photo', 'true');
      }

      const res = await fetch(`/api/user/profile/${user.id}`, {
        method: 'PUT',
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      onUpdateUser(data.user);
      showToast('Profile updated successfully!', 'success');
      setShowEditProfileModal(false);
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveBankUpi = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const bankDetailsJson = JSON.stringify({
        holderName: holderName.trim(),
        accountNumber: accountNumber.trim(),
        ifscCode: ifscCode.trim().toUpperCase(),
        mobile: bankMobile.trim()
      });

      const res = await fetch(`/api/user/profile/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ upi_id: upiInput.trim(), bank_details: bankDetailsJson })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');

      onUpdateUser(data.user);
      showToast('Bank & UPI details updated successfully!', 'success');
      setShowBankModal(false);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleSavePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length !== 4 && newPin.length !== 6) {
      showToast('Payout PIN must be 4 or 6 digits', 'error');
      return;
    }
    try {
      const res = await fetch(`/api/user/profile/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ withdrawal_pin: newPin })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      onUpdateUser(data.user);
      showToast('Security Withdrawal PIN updated!', 'success');
      setShowPinModal(false);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketMessage.trim()) return;
    setSubmittingTicket(true);
    try {
      const res = await fetch('/api/support/ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          userName: user.name,
          userPhone: user.mobile,
          subject: ticketSubject,
          message: ticketMessage
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'Support Ticket Created!', 'success');
        setTicketMessage('');
        fetchTickets();
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSubmittingTicket(false);
    }
  };

  // Determine Membership Level Badge
  const getMembershipLevel = (deposited: number) => {
    if (deposited >= 100000) return 'VIP 5 MEMBER';
    if (deposited >= 50000) return 'VIP 4 MEMBER';
    if (deposited >= 20000) return 'VIP 3 MEMBER';
    if (deposited >= 5000) return 'VIP 2 MEMBER';
    return 'VIP 1 MEMBER';
  };

  return (
    <div className="space-y-4 pb-28 text-white bg-[#0A0F1D] min-h-screen px-2.5 sm:px-4 pt-2 font-sans max-w-2xl mx-auto">
      
      {/* 1. Header & User Profile Info Card (Exact match to screenshot) */}
      <div className="bg-[#131B31] rounded-3xl p-4 sm:p-5 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex items-start gap-3 sm:gap-4">
          
          {/* Avatar with Camera Button */}
          <div className="relative flex-shrink-0">
            <div 
              onClick={() => setShowEditProfileModal(true)}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-500 to-amber-600 p-0.5 shadow-[0_0_20px_rgba(251,191,36,0.3)] cursor-pointer overflow-hidden group"
            >
              <div className="w-full h-full bg-[#0B1220] rounded-[14px] flex items-center justify-center overflow-hidden relative">
                {user.profile_photo ? (
                  <img src={user.profile_photo} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black text-xl sm:text-2xl">
                    {(user?.name || 'User').slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  <Camera className="w-5 h-5 text-amber-300" />
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setShowEditProfileModal(true)}
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center border-2 border-white shadow-md hover:bg-[#0B1220]0 transition"
              title="Change Profile Photo"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* User Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1 mb-1">
              <h2 className="text-base sm:text-xl font-black text-white truncate tracking-wide">{user.name}</h2>
              <span className="bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border border-amber-500/40 text-amber-300 text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full flex-shrink-0 shadow-sm">
                👑 {getMembershipLevel(user.deposited)}
              </span>
            </div>

            <p className="text-xs text-slate-400 font-mono mb-2">+91 {user.mobile}</p>

            {/* UID & Ref Copy Badges */}
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
              <div className="flex items-center space-x-1.5 bg-[#0B1220] border border-slate-800 px-2.5 py-1 rounded-xl text-slate-600">
                <span className="text-slate-400">UID:</span>
                <span className="font-bold text-[#1E60F2]">{user.user_code}</span>
                <button onClick={handleCopyUid} className="hover:text-white transition">
                  {copiedUid ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                </button>
              </div>

              <div className="flex items-center space-x-1.5 bg-[#0B1220] border border-slate-800 px-2.5 py-1 rounded-xl text-slate-600">
                <span className="text-slate-400">Ref:</span>
                <span className="font-bold text-[#1E60F2]">{user.referral_code}</span>
                <button onClick={handleCopyRef} className="hover:text-white transition">
                  {copiedRef ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                </button>
              </div>
            </div>

            {/* 3 Security Badges Row */}
            <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-slate-800 text-[10px] font-semibold text-slate-400">
              <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-md">❖ 100% Encrypted</span>
              <span className="bg-sky-500/10 border border-sky-500/30 text-sky-300 px-2 py-0.5 rounded-md">❖ Fast UPI</span>
              <span className="bg-amber-500/10 border border-amber-500/30 text-amber-300 px-2 py-0.5 rounded-md">❖ 24/7 Desk</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Total Wallet Balance Card (Exact match to screenshot) */}
      <div className="bg-[#131B31] rounded-3xl p-4 sm:p-5 border border-slate-800 shadow-xl relative overflow-hidden">
        
        {/* Top Balance Header */}
        <div className="flex justify-between items-center mb-1">
          <div>
            <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">कुल वॉलेट संपत्ति (TOTAL BALANCE)</p>
            <div className="flex items-center space-x-2 mt-0.5">
              <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                ₹{displayValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <button 
                onClick={handleRefreshBalance}
                disabled={isRefreshing}
                className="p-1.5 text-blue-600 hover:bg-[#0B1220] rounded-lg transition" 
                title="Refresh Balance (5s Count Up)"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 block mb-0.5">दैनिक लाभांश स्थिति</span>
            <span className="inline-flex items-center space-x-1 text-[10px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Auto Accrual On</span>
            </span>
          </div>
        </div>

        {/* Deposit & Withdraw Summary */}
        <div className="flex items-center justify-between text-xs py-3 border-t border-b border-slate-800 my-3 text-slate-400 font-mono">
          <div>कुल जमा: <strong className="text-white ml-1">₹{user.deposited.toLocaleString('en-IN')}</strong></div>
          <div>कुल निकासी: <strong className="text-white ml-1">₹{user.withdrawn.toLocaleString('en-IN')}</strong></div>
        </div>

        {/* Two Main Action Buttons: Recharge & Withdraw */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onOpenDeposit}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-black py-3 px-4 rounded-2xl flex items-center justify-center space-x-2 transition shadow-md shadow-blue-500/20 active:scale-95 text-xs sm:text-sm"
          >
            <ArrowDownRight className="w-5 h-5 text-white" />
            <span>रिचार्ज (Recharge)</span>
          </button>

          <button
            onClick={onOpenWithdraw}
            className="bg-[#131B31] hover:bg-[#1C2640] text-white font-black py-3 px-4 rounded-2xl flex items-center justify-center space-x-2 transition shadow-sm border border-slate-800 active:scale-95 text-xs sm:text-sm"
          >
            <ArrowUpRight className="w-5 h-5 text-blue-600" />
            <span>निकासी (Withdraw)</span>
          </button>
        </div>
      </div>

      {/* 3. Customer Assistance Desk Quick Cards (3-Grid) */}
      <div className="bg-[#131B31] border border-slate-800 rounded-3xl p-4 shadow-xl">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-[#0B1220] border border-slate-800 flex items-center justify-center text-blue-600">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black text-white">ग्राहक सहायता केंद्र (Customer Assistance Desk)</h3>
              <p className="text-[10px] text-slate-400">24/7 Official Reliance Pay Help & Resolution</p>
            </div>
          </div>
          <span className="flex items-center space-x-1 text-[9px] bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Online</span>
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button 
            onClick={() => setShowCustomerCareModal(true)} 
            className="bg-[#0B1220] hover:bg-[#0B1220] border border-slate-800 p-3 rounded-2xl flex flex-col items-center text-center transition active:scale-95"
          >
            <Headphones className="w-5 h-5 text-emerald-600 mb-1" />
            <span className="text-[11px] font-bold text-white">कस्टमर केयर</span>
            <span className="text-[9px] text-slate-400">24/7 Support</span>
          </button>

          <button 
            onClick={() => setShowTicketModal(true)} 
            className="bg-[#0B1220] hover:bg-[#0B1220] border border-slate-800 p-3 rounded-2xl flex flex-col items-center text-center transition active:scale-95"
          >
            <FileText className="w-5 h-5 text-blue-600 mb-1" />
            <span className="text-[11px] font-bold text-white">सपोर्ट टिकट</span>
            <span className="text-[9px] text-slate-400">Track Query</span>
          </button>

          <button 
            onClick={() => setShowFaqModal(true)} 
            className="bg-[#0B1220] hover:bg-[#0B1220] border border-slate-800 p-3 rounded-2xl flex flex-col items-center text-center transition active:scale-95"
          >
            <HelpCircle className="w-5 h-5 text-indigo-600 mb-1" />
            <span className="text-[11px] font-bold text-white">FAQ सवाल</span>
            <span className="text-[9px] text-slate-400">Instant Solutions</span>
          </button>
        </div>
      </div>

      {/* 4. HQ Admin Control Panel Card (Visible for Admin Users or for Admin Switch) */}
      {user.role === 'admin' && onSwitchAdmin && (
        <button
          onClick={onSwitchAdmin}
          className="w-full bg-[#0B1220] border border-blue-200 rounded-3xl p-4 flex items-center justify-between shadow-sm hover:bg-blue-100 transition"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center border border-blue-500 shadow-sm">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="flex items-center space-x-2">
                <h4 className="font-black text-sm text-blue-900">HQ Admin Control Panel</h4>
                <span className="bg-blue-600 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase">ACTIVE</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">Manage Banners, Plans, Deposits, KYC...</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-blue-600" />
        </button>
      )}

      {/* 5. Section: वित्तीय सेवाएं एवं रिकॉर्ड (FINANCIAL SERVICES) */}
      <div className="space-y-2">
        <p className="text-[10px] font-black text-slate-400 px-1 tracking-widest uppercase">वित्तीय सेवाएं एवं रिकॉर्ड (FINANCIAL SERVICES)</p>
        <div className="bg-[#131B31] border border-slate-800 rounded-3xl overflow-hidden shadow-xl divide-y divide-slate-800">
          
          {/* Deposit Funds */}
          <button onClick={onOpenDeposit} className="w-full p-3.5 flex items-center justify-between hover:bg-[#1C2640] transition">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-[#0B1220] text-blue-600 flex items-center justify-center border border-slate-800">
                <ArrowDownRight className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-bold text-white text-xs sm:text-sm">Deposit Funds (जमा / रिचार्ज)</p>
                <p className="text-[10px] text-slate-400">Complete online recharge via UPI QR, PhonePe...</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Instant UPI</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </button>

          {/* Recharge Records */}
          <button onClick={() => setShowRechargeRecords(true)} className="w-full p-3.5 flex items-center justify-between hover:bg-slate-900/50 transition">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <ArrowDownRight className="w-5 h-5 rotate-180" />
              </div>
              <div className="text-left">
                <p className="font-bold text-white text-xs sm:text-sm">Recharge Records</p>
                <p className="text-[10px] text-slate-400">View payment deposits & verification status</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          {/* Withdrawal Records */}
          <button onClick={() => setShowWithdrawRecords(true)} className="w-full p-3.5 flex items-center justify-between hover:bg-[#1C2640] transition">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-[#0B1220] text-blue-600 flex items-center justify-center border border-slate-800">
                <ArrowUpRight className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-bold text-white text-xs sm:text-sm">Withdrawal Records</p>
                <p className="text-[10px] text-slate-400">Track your payout requests</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          {/* Update Bank & UPI */}
          <button onClick={() => setShowBankModal(true)} className="w-full p-3.5 flex items-center justify-between hover:bg-[#1C2640] transition">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                <CreditCard className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-bold text-white text-xs sm:text-sm">Update Bank & UPI</p>
                <p className="text-[10px] text-slate-400">Manage your payout bank accounts</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[9px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">Add Bank</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </button>

          {/* Referral Rewards & Friends */}
          <button onClick={() => setShowReferralModal(true)} className="w-full p-3.5 flex items-center justify-between hover:bg-[#1C2640] transition">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center border border-pink-100">
                <Share2 className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-bold text-white text-xs sm:text-sm">Referral Rewards & Friends</p>
                <p className="text-[10px] text-slate-400">Track invited partners & network commission</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      {/* 6. Section: सुरक्षा एवं पहचान सत्यापन (SECURITY & VERIFICATION) */}
      <div className="space-y-2">
        <p className="text-[10px] font-black text-slate-400 px-1 tracking-widest uppercase">सुरक्षा एवं पहचान सत्यापन (SECURITY & VERIFICATION)</p>
        <div className="bg-[#131B31] border border-slate-800 rounded-3xl overflow-hidden shadow-xl divide-y divide-slate-800">
          
          {/* KYC Verification */}
          <button onClick={onOpenKyc} className="w-full p-3.5 flex items-center justify-between hover:bg-[#1C2640] transition">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-[#0B1220] text-[#1E60F2] flex items-center justify-center border border-slate-800">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-bold text-white text-xs sm:text-sm">KYC Verification</p>
                <p className="text-[10px] text-slate-400">पहचान सत्यापन (Identity Proof)...</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded border ${
                user?.kyc_status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
              }`}>
                {(user?.kyc_status || 'Not Submitted').toUpperCase()}
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </button>

          {/* Security & Withdrawal Password PIN */}
          <button onClick={() => setShowPinModal(true)} className="w-full p-3.5 flex items-center justify-between hover:bg-[#1C2640] transition">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-[#0B1220] text-blue-600 flex items-center justify-center border border-slate-800">
                <KeyRound className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-bold text-white text-xs sm:text-sm">Security & Withdrawal Password</p>
                <p className="text-[10px] text-slate-400">Update your 6-digit payout security PIN</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[9px] font-bold text-blue-600 bg-[#0B1220] px-2 py-0.5 rounded border border-slate-800">PIN SET</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </button>

          {/* Change Password */}
          <button onClick={() => setShowPasswordModal(true)} className="w-full p-3.5 flex items-center justify-between hover:bg-[#1C2640] transition">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-[#0B1220] text-slate-600 flex items-center justify-center border border-slate-800">
                <Lock className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-bold text-white text-xs sm:text-sm">Change Password</p>
                <p className="text-[10px] text-slate-400">Update your Reliance Pay login password</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      {/* 7. Section: प्राथमिकताएं एवं सूचनाएं (PREFERENCES & ALERTS) */}
      <div className="space-y-2">
        <p className="text-[10px] font-black text-slate-400 px-1 tracking-widest uppercase">प्राथमिकताएं एवं सूचनाएं (PREFERENCES & ALERTS)</p>
        <div className="bg-[#131B31] border border-slate-800 rounded-3xl overflow-hidden shadow-xl divide-y divide-slate-800">
          
          {/* Soundbox & Audio */}
          <button onClick={() => setShowSoundboxModal(true)} className="w-full p-3.5 flex items-center justify-between hover:bg-[#1C2640] transition">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-[#0B1220] text-blue-600 flex items-center justify-center border border-slate-800">
                <Volume2 className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-bold text-white text-xs sm:text-sm">Soundbox & Audio</p>
                <p className="text-[10px] text-slate-400">Audio alerts for verified deposit...</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                soundEnabled ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-slate-400 bg-[#0B1220] border-slate-800'
              }`}>
                {soundEnabled ? 'ENABLED' : 'DISABLED'}
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </button>

          {/* Notification Settings */}
          <button onClick={() => setShowNotifyModal(true)} className="w-full p-3.5 flex items-center justify-between hover:bg-[#1C2640] transition">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-[#0B1220] text-blue-600 flex items-center justify-center border border-slate-800">
                <Bell className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-bold text-white text-xs sm:text-sm">Notification Settings</p>
                <p className="text-[10px] text-slate-400">Push alerts, payout status & referral messages</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          {/* Download Android App */}
          <button onClick={async () => {
            if (isInstallable) {
              await install();
            } else {
              setShowInstallModal(true);
            }
          }} className="w-full p-3.5 flex items-center justify-between hover:bg-[#1C2640] transition">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <Download className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-bold text-white text-xs sm:text-sm">Download Android App (APK)</p>
                <p className="text-[10px] text-slate-400">Lightweight Android Launcher APK • Opens C...</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">Official v1.0</span>
              <Download className="w-4 h-4 text-emerald-600" />
            </div>
          </button>
        </div>
      </div>

      {/* 8. Section: सहायता एवं समाधान (SUPPORT & HELPDESK) */}
      <div className="space-y-2">
        <p className="text-[10px] font-black text-slate-400 px-1 tracking-widest uppercase">सहायता एवं समाधान (SUPPORT & HELPDESK)</p>
        <div className="bg-[#131B31] border border-slate-800 rounded-3xl overflow-hidden shadow-xl divide-y divide-slate-800">
          
          {/* Support Ticket */}
          <button onClick={() => setShowTicketModal(true)} className="w-full p-3.5 flex items-center justify-between hover:bg-[#1C2640] transition">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-[#0B1220] text-blue-600 flex items-center justify-center border border-slate-800">
                <Headphones className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-bold text-white text-xs sm:text-sm">Support Ticket</p>
                <p className="text-[10px] text-slate-400">Create a ticket & track resolution from support...</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          {/* Customer Care */}
          <button onClick={() => setShowCustomerCareModal(true)} className="w-full p-3.5 flex items-center justify-between hover:bg-[#1C2640] transition">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <Headphones className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-bold text-white text-xs sm:text-sm">Customer Care</p>
                <p className="text-[10px] text-slate-400">Official 24/7 Reliance Pay assistance</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">24/7</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </button>

          {/* FAQ */}
          <button onClick={() => setShowFaqModal(true)} className="w-full p-3.5 flex items-center justify-between hover:bg-[#1C2640] transition">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-[#0B1220] text-blue-600 flex items-center justify-center border border-slate-800">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-bold text-white text-xs sm:text-sm">FAQ</p>
                <p className="text-[10px] text-slate-400">Frequently asked questions & solutions</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      {/* 9. Section: कंपनी विवरण एवं प्रमाण पत्र (COMPANY & LEGAL COMPLIANCE) */}
      <div className="space-y-2">
        <p className="text-[10px] font-black text-slate-400 px-1 tracking-widest uppercase">कंपनी विवरण एवं प्रमाण पत्र (COMPANY & LEGAL COMPLIANCE)</p>
        <div className="bg-[#131B31] border border-slate-800 rounded-3xl overflow-hidden shadow-xl divide-y divide-slate-800">
          
          {/* About Us */}
          <button onClick={() => { setLegalTab('about'); setShowLegalModal(true); }} className="w-full p-3.5 flex items-center justify-between hover:bg-[#1C2640] transition">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-[#0B1220] text-blue-600 flex items-center justify-center border border-slate-800">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-bold text-white text-xs sm:text-sm">About Us (Company Details)</p>
                <p className="text-[10px] text-slate-400">Reliance Pay digital investment platform over...</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          {/* Professional Certification */}
          <button onClick={() => { setLegalTab('certification'); setShowLegalModal(true); }} className="w-full p-3.5 flex items-center justify-between hover:bg-[#1C2640] transition">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                <Award className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-bold text-white text-xs sm:text-sm">Professional Certification</p>
                <p className="text-[10px] text-slate-400">NISM examination & factual qualification disc...</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          {/* Terms & Conditions */}
          <button onClick={() => { setLegalTab('terms'); setShowLegalModal(true); }} className="w-full p-3.5 flex items-center justify-between hover:bg-[#1C2640] transition">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-[#0B1220] text-blue-600 flex items-center justify-center border border-slate-800">
                <FileText className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-bold text-white text-xs sm:text-sm">Terms & Conditions</p>
                <p className="text-[10px] text-slate-400">Platform rules, policies & user agreement</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          {/* Privacy Policy */}
          <button onClick={() => { setLegalTab('privacy'); setShowLegalModal(true); }} className="w-full p-3.5 flex items-center justify-between hover:bg-[#1C2640] transition">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-bold text-white text-xs sm:text-sm">Privacy Policy</p>
                <p className="text-[10px] text-slate-400">Data protection, security & confidentiality</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          {/* Admin Portal Login & Access */}
          <button onClick={() => {
            if (user.role === 'admin' && onSwitchAdmin) {
              onSwitchAdmin();
            } else if (onOpenAdminAccess) {
              onOpenAdminAccess();
            } else if (onSwitchAdmin) {
              onSwitchAdmin();
            } else {
              showToast('Admin Portal access requires Administrator authorization.', 'error');
            }
          }} className="w-full p-3.5 flex items-center justify-between hover:bg-[#1C2640] transition group">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-[#0B1220] text-blue-600 flex items-center justify-center border border-slate-800 group-hover:scale-105 transition-transform">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="flex items-center space-x-2">
                  <p className="font-bold text-amber-300 text-xs sm:text-sm">Admin Portal Access (एडमिन लॉगिन)</p>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${
                    user.role === 'admin' 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {user.role === 'admin' ? 'AUTHORIZED' : 'VERIFY & ENTER'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">HQ Management Suite • Users, Plans, Deposits, KYC</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* 10. Logout Section */}
      <div className="pt-1">
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold py-3.5 rounded-3xl flex items-center justify-center space-x-2 transition active:scale-95 shadow-lg text-sm"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
        <p className="text-[10px] text-slate-400 text-center mt-1">Securely sign out of Reliance Pay</p>
      </div>

      {/* 11. Customer Assistance Footer Cards (Exact match to screenshot) */}
      <div className="bg-gradient-to-br from-[#120816] via-[#1A0A20] to-[#100714] border border-pink-500/30 rounded-3xl p-4 shadow-2xl space-y-3">
        <div className="flex justify-between items-center border-b border-pink-500/20 pb-2">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-ping" />
            <h4 className="text-xs font-black text-pink-300 uppercase tracking-wide">Official 24/7 Help Desk & Quick Services</h4>
          </div>
          <span className="bg-pink-500/20 text-pink-300 text-[9px] font-black px-2 py-0.5 rounded border border-pink-500/30">
            ACTIVE ONLINE
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          
          {/* Card 1: Help Desk (AI Chat Bot) */}
          <button
            onClick={() => { if (onOpenChat) onOpenChat(); else setShowTicketModal(true); }}
            className="bg-[#0E0713] hover:bg-pink-950/40 border border-pink-500/30 p-3 rounded-2xl flex flex-col items-center text-center transition active:scale-95 relative"
          >
            <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-pink-500 text-white font-black text-[9px] flex items-center justify-center">1</span>
            <Headphones className="w-6 h-6 text-pink-400 mb-1" />
            <span className="text-[11px] font-black text-white">Help Desk</span>
            <span className="text-[9px] text-pink-300/80">Chat Bot 24/7</span>
          </button>

          {/* Card 2: Install App */}
          <button
            onClick={async () => {
              if (isInstallable) {
                await install();
              } else {
                setShowInstallModal(true);
              }
            }}
            className="bg-[#0E0713] hover:bg-emerald-950/40 border border-emerald-500/30 p-3 rounded-2xl flex flex-col items-center text-center transition active:scale-95 relative"
          >
            <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 font-black text-[9px] flex items-center justify-center">2</span>
            <Download className="w-6 h-6 text-emerald-400 mb-1" />
            <span className="text-[11px] font-black text-white">Install App</span>
            <span className="text-[9px] text-emerald-300/80">PWA Fast</span>
          </button>

          {/* Card 3: WhatsApp */}
          <button
            onClick={() => window.open(whatsappUrl, '_blank')}
            className="bg-[#0E0713] hover:bg-emerald-950/40 border border-emerald-500/30 p-3 rounded-2xl flex flex-col items-center text-center transition active:scale-95 relative"
          >
            <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 font-black text-[9px] flex items-center justify-center">3</span>
            <MessageCircle className="w-6 h-6 text-emerald-400 mb-1" />
            <span className="text-[11px] font-black text-white">WhatsApp</span>
            <span className="text-[9px] text-emerald-300/80">Direct Helpline</span>
          </button>
        </div>
      </div>

      {/* --- SUB MODALS & DIALOGS --- */}

      {/* 1. Edit Profile Modal */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0B1222] border border-amber-500/30 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-amber-300">Edit Profile & Photo</h3>
              <button onClick={() => setShowEditProfileModal(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col items-center mb-6">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="w-24 h-24 rounded-full border-2 border-amber-400 p-1 bg-black overflow-hidden relative shadow-lg">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-800 text-amber-400 font-bold text-xl">
                      {(user?.name || 'User').slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <button className="absolute bottom-0 right-0 bg-amber-500 text-slate-950 p-1.5 rounded-full shadow-md">
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>
              <input type="file" ref={fileInputRef} onChange={handlePhotoSelect} accept="image/*" className="hidden" />
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <button
                type="submit"
                disabled={isUpdating}
                className="w-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold py-3 rounded-xl transition text-xs uppercase tracking-wide"
              >
                {isUpdating ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. Recharge Records Modal */}
      {showRechargeRecords && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0B1222] border border-amber-500/30 rounded-3xl max-w-lg w-full p-5 text-white shadow-2xl h-[80vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-3">
              <h3 className="font-bold text-base text-amber-300">Recharge Records (जमा इतिहास)</h3>
              <button onClick={() => setShowRechargeRecords(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search UTR / Reference No..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {deposits.filter(d => !searchQuery || d.utr?.includes(searchQuery)).length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8">No deposit records found.</p>
              ) : (
                deposits
                  .filter(d => !searchQuery || d.utr?.includes(searchQuery))
                  .map(d => (
                    <div key={d.id} className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-emerald-400">+₹{d.amount.toLocaleString('en-IN')}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">UTR: {d.utr || 'N/A'}</p>
                        <p className="text-[9px] text-slate-400">{new Date(d.created_at).toLocaleString()}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        d.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        d.status === 'rejected' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {(d.status || 'pending').toUpperCase()}
                      </span>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. Withdrawal Records Modal */}
      {showWithdrawRecords && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0B1222] border border-amber-500/30 rounded-3xl max-w-lg w-full p-5 text-white shadow-2xl h-[80vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-3">
              <h3 className="font-bold text-base text-amber-300">Withdrawal Records (निकासी इतिहास)</h3>
              <button onClick={() => setShowWithdrawRecords(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {withdrawals.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8">No withdrawal records found.</p>
              ) : (
                withdrawals.map(w => (
                  <div key={w.id} className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-sky-400">-₹{w.amount.toLocaleString('en-IN')}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Method: {w.method}</p>
                      <p className="text-[9px] text-slate-400">{new Date(w.created_at).toLocaleString()}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      w.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      w.status === 'rejected' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {(w.status || 'pending').toUpperCase()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. Update Bank & UPI Modal */}
      {showBankModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0B1222] border border-amber-500/30 rounded-3xl max-w-md w-full p-5 text-white shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
              <h3 className="font-bold text-base text-amber-300">Update Bank & UPI Details</h3>
              <button onClick={() => setShowBankModal(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBankUpi} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">UPI ID</label>
                <input
                  type="text"
                  value={upiInput}
                  onChange={e => setUpiInput(e.target.value)}
                  placeholder="e.g. user@paytm / user@ybl"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Account Holder Name</label>
                <input
                  type="text"
                  value={holderName}
                  onChange={e => setHolderName(e.target.value)}
                  placeholder="Official Bank Account Name"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Account Number</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={e => setAccountNumber(e.target.value)}
                  placeholder="Bank Account Number"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">IFSC Code</label>
                <input
                  type="text"
                  value={ifscCode}
                  onChange={e => setIfscCode(e.target.value)}
                  placeholder="e.g. SBIN0001234"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white uppercase"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold py-3 rounded-xl transition mt-2"
              >
                Save Payout Details
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 5. Security PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0B1222] border border-amber-500/30 rounded-3xl max-w-sm w-full p-5 text-white shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
              <h3 className="font-bold text-base text-amber-300">Set Security Withdrawal PIN</h3>
              <button onClick={() => setShowPinModal(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">New 4 or 6-digit Payout Security PIN</label>
                <input
                  type="password"
                  maxLength={6}
                  value={newPin}
                  onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 4 or 6-digit PIN"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-center font-mono text-lg tracking-widest text-amber-300"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 text-slate-950 font-bold py-3 rounded-xl transition text-xs uppercase"
              >
                Update Security PIN
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 6. Soundbox & Audio Preferences Modal */}
      {showSoundboxModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0B1222] border border-amber-500/30 rounded-3xl max-w-sm w-full p-5 text-white shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-amber-300">Soundbox & Audio Alerts</h3>
              <button onClick={() => setShowSoundboxModal(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-900 rounded-2xl">
              <div>
                <p className="text-xs font-bold text-white">Audio Alert Voice Prompts</p>
                <p className="text-[10px] text-slate-400">Play voice alert on successful recharge/payout</p>
              </div>
              <button
                onClick={() => {
                  const next = !soundEnabled;
                  setSoundEnabled(next);
                  localStorage.setItem('reliance_pay_sound_enabled', String(next));
                  showToast(next ? 'Soundbox alerts ENABLED' : 'Soundbox alerts DISABLED');
                }}
                className={`w-12 h-6 rounded-full transition p-1 flex items-center ${soundEnabled ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'}`}
              >
                <div className="w-4 h-4 rounded-full bg-[#131B31] shadow-md" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Support Ticket Creation Modal */}
      {showTicketModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0B1222] border border-amber-500/30 rounded-3xl max-w-md w-full p-5 text-white shadow-2xl h-[85vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-3">
              <h3 className="font-bold text-base text-amber-300">Support Desk (सपोर्ट टिकट)</h3>
              <button onClick={() => setShowTicketModal(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-3 text-xs mb-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Issue Category</label>
                <select
                  value={ticketSubject}
                  onChange={e => setTicketSubject(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="Recharge Problem">Recharge / Deposit Query</option>
                  <option value="Withdrawal Problem">Withdrawal / Payout Query</option>
                  <option value="Account & Profile">Account / KYC / Security</option>
                  <option value="General Query">General Inquiry</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Describe Issue (विवरण दर्ज करें)</label>
                <textarea
                  rows={3}
                  required
                  value={ticketMessage}
                  onChange={e => setTicketMessage(e.target.value)}
                  placeholder="Explain your query clearly..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white"
                />
              </div>

              <button
                type="submit"
                disabled={submittingTicket}
                className="w-full bg-amber-500 text-slate-950 font-bold py-2.5 rounded-xl transition"
              >
                {submittingTicket ? 'Submitting...' : 'Submit Support Ticket'}
              </button>
            </form>

            <div className="flex-1 overflow-y-auto space-y-2 border-t border-slate-800 pt-3">
              <p className="text-[11px] font-bold text-slate-400">Previous Tickets History</p>
              {tickets.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No active tickets.</p>
              ) : (
                tickets.map((t: any) => (
                  <div key={t.id} className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-amber-300 font-bold">{t.ticket_code}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        t.status === 'Resolved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'
                      }`}>{t.status}</span>
                    </div>
                    <p className="text-slate-300">{t.message}</p>
                    {t.admin_reply && (
                      <div className="bg-emerald-500/10 border border-emerald-500/30 p-2 rounded-xl text-emerald-300 text-[11px] mt-1">
                        <strong>Admin Reply:</strong> {t.admin_reply}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 8. FAQ Modal */}
      {showFaqModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0B1222] border border-amber-500/30 rounded-3xl max-w-lg w-full p-5 text-white shadow-2xl h-[80vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-3">
              <h3 className="font-bold text-base text-amber-300">FAQ - सवाल एवं जवाब</h3>
              <button onClick={() => setShowFaqModal(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
              <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl space-y-1">
                <p className="font-bold text-amber-300">Q1. Reliance Pay में Recharge / Deposit कैसे करें?</p>
                <p className="text-slate-300 leading-relaxed">Deposit section में जाएँ, राशि चुनें, दिए गए UPI QR पर पेमेंट करें और 12-अंकों का UTR नंबर भर कर Request सबमिट करें।</p>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl space-y-1">
                <p className="font-bold text-amber-300">Q2. Withdrawal प्रक्रिया क्या है और कितना समय लगता है?</p>
                <p className="text-slate-300 leading-relaxed">Withdrawal section में जा कर अपना बैंक खाता / UPI चुनें और PIN भरें। निकासी आम तौर पर 5 से 30 मिनट के भीतर खाते में क्रेडिट हो जाती है।</p>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl space-y-1">
                <p className="font-bold text-amber-300">Q3. Referral Bonus कैसे मिलता है?</p>
                <p className="text-slate-300 leading-relaxed">अपना Referral Link मित्रों के साथ साझा करें। जब आपका मित्र पहला पोर्टफोलियो एक्टिव करता है, तो तुरंत आपके वॉलेट में बोनस आ जाता है।</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 9. Customer Care Modal */}
      {showCustomerCareModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0B1222] border border-amber-500/30 rounded-3xl max-w-sm w-full p-5 text-white shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-amber-300">Customer Care Support</h3>
              <button onClick={() => setShowCustomerCareModal(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => window.open(telegramUrl, '_blank')}
                className="w-full bg-[#17212B] border border-sky-500/40 hover:bg-sky-950/40 text-sky-300 p-3 rounded-2xl flex items-center space-x-3 transition"
              >
                <Headphones className="w-6 h-6 text-sky-400" />
                <div className="text-left">
                  <p className="font-bold text-xs">Official Telegram Channel</p>
                  <p className="text-[10px] text-slate-400">@reliancepay</p>
                </div>
              </button>

              <button
                onClick={() => window.open(whatsappUrl, '_blank')}
                className="w-full bg-[#0E1B14] border border-emerald-500/40 hover:bg-emerald-950/40 text-emerald-300 p-3 rounded-2xl flex items-center space-x-3 transition"
              >
                <MessageCircle className="w-6 h-6 text-emerald-400" />
                <div className="text-left">
                  <p className="font-bold text-xs">Official WhatsApp Support</p>
                  <p className="text-[10px] text-slate-400">+91 8824904563</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0B1222] border border-red-500/40 rounded-3xl max-w-sm w-full p-6 text-white shadow-2xl text-center space-y-4">
            <LogOut className="w-10 h-10 text-red-400 mx-auto" />
            <div>
              <h3 className="font-black text-lg text-white">Sign Out Confirmation</h3>
              <p className="text-xs text-slate-300 mt-1">Are you sure you want to sign out of Reliance Pay?</p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition text-xs"
              >
                Cancel
              </button>
              <button
                onClick={onLogout}
                className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl transition text-xs shadow-lg shadow-red-600/30"
              >
                Logout Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0B1222] border border-amber-500/30 rounded-3xl max-w-sm w-full p-5 text-white shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
              <h3 className="font-bold text-base text-amber-300">Change Password</h3>
              <button onClick={() => setShowPasswordModal(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                const res = await fetch(`/api/user/profile/${user.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error);
                showToast('Password updated successfully!', 'success');
                setShowPasswordModal(false);
                setCurrentPassword('');
                setNewPassword('');
              } catch (err: any) {
                showToast(err.message, 'error');
              }
            }} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-sky-600 text-white font-bold py-3 rounded-xl transition mt-2"
              >
                Update Password
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Legal & Compliance Modal */}
      <LegalModal
        isOpen={showLegalModal}
        onClose={() => setShowLegalModal(false)}
        initialTab={legalTab}
      />

      {/* PWA Install Modal */}
      <PWAInstallModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
        onInstallNative={install}
        isInstallable={isInstallable}
        isIOS={isIOS}
        isInstalled={isInstalled}
      />

    </div>
  );
};
