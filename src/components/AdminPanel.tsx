import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Users, TrendingUp, ArrowDownRight, ArrowUpRight, 
  FileText, Settings, Gift, Image as ImageIcon, CheckCircle, XCircle, Trash2, Plus, Search, RefreshCw,
  Sliders, ShieldCheck, Check, DollarSign, AlertCircle, Edit, Eye, AlertTriangle, Zap, Volume2, Clock,
  Database, Key, User as UserIcon, X, ChevronRight, Bot, Headphones, MessageSquare, Send, LogOut
} from 'lucide-react';
import { AdminStats, User, Deposit, Withdrawal, KycEntry, Plan, Banner } from '../types';

interface AdminPanelProps {
  adminUser: User;
  showToast: (msg: string, type?: 'success' | 'error') => void;
  onExitAdmin?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ adminUser, showToast, onExitAdmin }) => {
  const adminFetch = (url: string, options: any = {}) => {
    const isProtected = url.startsWith('/api/admin');
    const headers = isProtected 
      ? { ...options.headers, 'x-admin-id': adminUser.id.toString() }
      : options.headers;
    return window.fetch(url, { ...options, headers });
  };

  const [activeSubTab, setActiveSubTab] = useState<'stats' | 'users' | 'deposits' | 'withdrawals' | 'plans' | 'banners' | 'kyc' | 'scratch' | 'tickets' | 'settings'>('stats');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [kycList, setKycList] = useState<KycEntry[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [replyText, setReplyText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [savingLimits, setSavingLimits] = useState(false);

  // Global Announcement Ticker state
  const [announcementList, setAnnouncementList] = useState<string[]>([]);
  const [newAnnouncementText, setNewAnnouncementText] = useState('');
  const [savingAnnouncements, setSavingAnnouncements] = useState(false);

  // New Plan form
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanCategory, setNewPlanCategory] = useState('Stable');
  const [newPlanAmount, setNewPlanAmount] = useState('');
  const [newPlanDuration, setNewPlanDuration] = useState('7');
  const [newPlanDaily, setNewPlanDaily] = useState('');
  const [newPlanTotal, setNewPlanTotal] = useState('');
  const [newPlanDescription, setNewPlanDescription] = useState('');
  const [newPlanImage, setNewPlanImage] = useState('');
  const [newPlanJoinedOffset, setNewPlanJoinedOffset] = useState('0');
  const [newPlanLayout, setNewPlanLayout] = useState<'full' | 'side'>('full');

  // Edit Plan modal state
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  // New Banner form
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerImage, setBannerImage] = useState('');
  const [bannerLink, setBannerLink] = useState('#plans');

  // Issue Scratch card form
  const [scratchUserId, setScratchUserId] = useState('');
  const [scratchAmount, setScratchAmount] = useState('100');

  // User Moderation state
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [balanceAction, setBalanceAction] = useState<'add' | 'subtract'>('add');
  const [balanceAmount, setBalanceAmount] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showKycActionModal, setShowKycActionModal] = useState(false);
  const [kycActionType, setKycActionType] = useState<'approve' | 'reject' | 'require' | 'cancel'>('require');
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [showAssignPlanModal, setShowAssignPlanModal] = useState(false);
  const [assignPlanId, setAssignPlanId] = useState('');
  const [showDbToolsModal, setShowDbToolsModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (file: File, type: 'plan' | 'banner' | 'qr') => {
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append(type === 'qr' ? 'qr_code' : 'image', file);
      
      const endpoint = type === 'qr' ? '/api/admin/settings/qr' : '/api/admin/upload';
      const res = await adminFetch(endpoint, {
        method: 'POST',
        body: formData
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      showToast(data.message, 'success');
      return data.imageUrl || data.qrUrl;
    } catch (err: any) {
      showToast(err.message, 'error');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const loadAdminData = () => {
    setIsRefreshing(true);
    adminFetch('/api/admin/stats').then(res => res.json()).then(d => { if (d.success) setStats(d.stats); });
    adminFetch('/api/admin/users').then(res => res.json()).then(d => { if (d.success) setUsers(d.users); });
    adminFetch('/api/admin/deposits').then(res => res.json()).then(d => { if (d.success) setDeposits(d.deposits); });
    adminFetch('/api/admin/withdrawals').then(res => res.json()).then(d => { if (d.success) setWithdrawals(d.withdrawals); });
    adminFetch('/api/admin/kyc').then(res => res.json()).then(d => { if (d.success) setKycList(d.kycList); });
    adminFetch('/api/admin/plans').then(res => res.json()).then(d => { if (d.success) setPlans(d.plans); });
    adminFetch('/api/admin/banners').then(res => res.json()).then(d => { if (d.success) setBanners(d.banners); });
    adminFetch('/api/admin/settings').then(res => res.json()).then(d => { if (d.success) setSettings(d.settings); });
    adminFetch('/api/admin/tickets').then(res => res.json()).then(d => { if (d.success) setSupportTickets(d.tickets); });
    adminFetch('/api/announcements').then(res => res.json()).then(d => {
      if (d.success && Array.isArray(d.announcements)) {
        setAnnouncementList(d.announcements);
      }
      setIsRefreshing(false);
    }).catch(() => setIsRefreshing(false));
  };

  const handleAdminTicketReply = async (ticketId: number, status: 'replied' | 'closed') => {
    if (!replyText.trim()) return;
    try {
      const res = await adminFetch(`/api/admin/tickets/${ticketId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminReply: replyText, status })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast(data.message, 'success');
      setReplyText('');
      setSelectedTicket(null);
      loadAdminData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleDepositAction = async (id: number, action: 'approve' | 'reject') => {
    try {
      const res = await adminFetch(`/api/admin/deposits/${id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast(data.message, 'success');
      loadAdminData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleWithdrawalAction = async (id: number, action: 'approve' | 'reject') => {
    try {
      const res = await adminFetch(`/api/admin/withdrawals/${id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast(data.message, 'success');
      loadAdminData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleKycAction = async (id: number, action: 'Approved' | 'Rejected') => {
    try {
      const res = await adminFetch(`/api/admin/kyc/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kyc_id: id, action })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast(data.message, 'success');
      loadAdminData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleUserKycAction = async () => {
    if (!selectedUser) return;
    
    try {
      let res;
      if (kycActionType === 'approve') {
        res = await adminFetch(`/api/admin/users/${selectedUser.id}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kyc_status: 'Approved', kyc_verification_status: 'Approved' }) });
      } else if (kycActionType === 'require') {
        res = await adminFetch(`/api/admin/kyc/notify`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: selectedUser.id, kyc_required: 1 }) });
      } else if (kycActionType === 'cancel') {
        res = await adminFetch(`/api/admin/kyc/notify`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: selectedUser.id, kyc_required: 0 }) });
      } else {
        showToast('Invalid action', 'error');
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast(data.message, 'success');
      setShowKycActionModal(false);
      loadAdminData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleUserStatus = async (id: number, status: string) => {
    try {
      const res = await adminFetch(`/api/admin/users/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast(data.message, 'success');
      loadAdminData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleAdjustBalance = async () => {
    if (!selectedUser || !balanceAmount) return;
    try {
      const res = await adminFetch(`/api/admin/users/${selectedUser.id}/balance`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(balanceAmount), action: balanceAction })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast(data.message, 'success');
      setShowBalanceModal(false);
      setBalanceAmount('');
      loadAdminData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleChangePassword = async () => {
    if (!selectedUser || !newPassword) return;
    try {
      const res = await adminFetch(`/api/admin/users/${selectedUser.id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_password: newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast(data.message, 'success');
      setShowPasswordModal(false);
      setNewPassword('');
      loadAdminData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Are you sure you want to PERMANENTLY delete this user? This action cannot be undone.')) return;
    try {
      const res = await adminFetch(`/api/admin/users/${id}/delete`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast(data.message, 'success');
      loadAdminData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleManualRecharge = async () => {
    if (!selectedUser || !rechargeAmount || isNaN(parseFloat(rechargeAmount))) return;
    try {
      const res = await adminFetch(`/api/admin/users/${selectedUser.id}/balance`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(rechargeAmount), action: 'add' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast(`Manual recharge of ₹${rechargeAmount} successful`, 'success');
      setShowRechargeModal(false);
      setRechargeAmount('');
      loadAdminData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleAssignPlan = async () => {
    if (!selectedUser || !assignPlanId) return;
    try {
      const res = await adminFetch(`/api/admin/users/${selectedUser.id}/assign-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_id: parseInt(assignPlanId) })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast(data.message, 'success');
      setShowAssignPlanModal(false);
      setAssignPlanId('');
      loadAdminData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await adminFetch('/api/admin/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newPlanName,
          category: newPlanCategory,
          amount: parseFloat(newPlanAmount),
          duration_days: parseInt(newPlanDuration),
          daily_return: parseFloat(newPlanDaily),
          total_return: parseFloat(newPlanTotal),
          description: newPlanDescription,
          image_url: newPlanImage,
          joined_users_offset: parseInt(newPlanJoinedOffset) || 0,
          layout: newPlanLayout
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.warning) {
        showToast(data.warning, 'error');
      } else {
        showToast(data.message, 'success');
      }
      setNewPlanName('');
      setNewPlanAmount('');
      setNewPlanDaily('');
      setNewPlanTotal('');
      setNewPlanDescription('');
      setNewPlanImage('');
      loadAdminData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleUpdatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    try {
      const res = await adminFetch(`/api/admin/plans/${editingPlan.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPlan)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.warning) {
        showToast(data.warning, 'error');
      } else {
        showToast(data.message, 'success');
      }
      setEditingPlan(null);
      loadAdminData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleTogglePlanStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      const res = await adminFetch(`/api/admin/plans/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast(data.message, 'success');
      loadAdminData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleDeletePlan = async (id: number) => {
    if (!confirm('Are you sure you want to delete this plan? Historical user investments will not be affected.')) return;
    try {
      await adminFetch(`/api/admin/plans/${id}`, { method: 'DELETE' });
      showToast('Plan deactivated / removed', 'success');
      loadAdminData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await adminFetch('/api/admin/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: bannerTitle, image_url: bannerImage, link_url: bannerLink, sort_order: banners.length + 1 })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast(data.message, 'success');
      setBannerTitle('');
      setBannerImage('');
      loadAdminData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteBanner = async (id: number) => {
    try {
      await adminFetch(`/api/admin/banners/${id}`, { method: 'DELETE' });
      showToast('Banner deleted', 'success');
      loadAdminData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleAddAnnouncementItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncementText.trim()) return;
    setAnnouncementList([...announcementList, newAnnouncementText.trim()]);
    setNewAnnouncementText('');
    showToast('Announcement added to list! Click "Save & Publish Globally" to deploy.', 'success');
  };

  const handleRemoveAnnouncementItem = (index: number) => {
    const updated = announcementList.filter((_, i) => i !== index);
    setAnnouncementList(updated);
  };

  const handleSaveAnnouncements = async () => {
    try {
      setSavingAnnouncements(true);
      const res = await adminFetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ announcements: announcementList })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save announcements');
      showToast('Global Scrolling Ticker Announcements published successfully!', 'success');
      loadAdminData();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSavingAnnouncements(false);
    }
  };

  const handleIssueScratch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await adminFetch('/api/admin/scratch-cards/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: parseInt(scratchUserId), reward_amount: parseFloat(scratchAmount) })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast(data.message, 'success');
      setScratchUserId('');
      setScratchAmount('100');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await adminFetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast(data.message, 'success');
      loadAdminData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleSaveWithdrawalLimits = async (customMin?: string, customMax?: string) => {
    const minVal = customMin !== undefined ? parseFloat(customMin) : parseFloat(settings.min_withdrawal || '150');
    const maxVal = customMax !== undefined ? parseFloat(customMax) : parseFloat(settings.max_withdrawal || '50000');

    if (isNaN(minVal) || minVal <= 0) {
      showToast('Minimum withdrawal amount must be a positive number greater than 0', 'error');
      return;
    }
    if (isNaN(maxVal) || maxVal < minVal) {
      showToast(`Maximum withdrawal amount (₹${maxVal}) cannot be less than Minimum amount (₹${minVal})`, 'error');
      return;
    }

    try {
      setSavingLimits(true);
      const updatedPayload = {
        ...settings,
        min_withdrawal: String(minVal),
        max_withdrawal: String(maxVal)
      };
      const res = await adminFetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPayload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSettings(updatedPayload);
      showToast(`Global withdrawal limits updated: Min ₹${minVal} | Max ₹${maxVal}`, 'success');
      loadAdminData();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSavingLimits(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.mobile.includes(searchQuery) || 
    u.user_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600/30 text-emerald-400 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black">Admin Control Panel</h2>
            <p className="text-xs text-slate-400">Complete management suite for Reliance Pay operations.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={loadAdminData}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Data</span>
          </button>
          {onExitAdmin && (
            <button
              onClick={onExitAdmin}
              className="bg-gradient-to-r from-red-600 via-amber-600 to-red-600 hover:from-red-500 hover:to-amber-500 text-white font-black px-4 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 shadow-lg shadow-red-600/30 transition active:scale-95"
            >
              <LogOut className="w-4 h-4" />
              <span>Exit to User App (यूजर ऐप)</span>
            </button>
          )}
        </div>
      </div>

      {/* Admin Nav Tabs */}
      <div className="flex overflow-x-auto space-x-2 pb-2 scrollbar-none">
        {[
          { id: 'stats', label: 'Dashboard', icon: TrendingUp },
          { id: 'users', label: 'Users', icon: Users },
          { id: 'deposits', label: `Deposits (${stats?.pendingDeposits || 0})`, icon: ArrowDownRight },
          { id: 'withdrawals', label: `Withdrawals (${stats?.pendingWithdrawals || 0})`, icon: ArrowUpRight },
          { id: 'plans', label: 'Plans', icon: TrendingUp },
          { id: 'banners', label: 'Banners', icon: ImageIcon },
          { id: 'kyc', label: `KYC (${stats?.pendingKyc || 0})`, icon: FileText },
          { id: 'scratch', label: 'Scratch Cards', icon: Gift },
          { id: 'tickets', label: `AI Tickets (${supportTickets.filter(t => t.status === 'open').length})`, icon: Bot },
          { id: 'settings', label: 'Settings', icon: Settings },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition ${
                isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Sub Tab: Dashboard Stats */}
      {activeSubTab === 'stats' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <p className="text-slate-500 text-xs font-bold uppercase">Total Users</p>
              <h3 className="text-3xl font-black text-slate-800 mt-2">{stats.totalUsers}</h3>
              <p className="text-xs text-emerald-600 font-semibold mt-1">{stats.activeUsers} Active Accounts</p>
            </div>
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <p className="text-slate-500 text-xs font-bold uppercase">Total Deposited</p>
              <h3 className="text-3xl font-black text-emerald-600 mt-2">₹{stats.totalDeposited.toFixed(2)}</h3>
              <p className="text-xs text-slate-400 mt-1">Approved deposits</p>
            </div>
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <p className="text-slate-500 text-xs font-bold uppercase">Total Withdrawn</p>
              <h3 className="text-3xl font-black text-blue-600 mt-2">₹{stats.totalWithdrawn.toFixed(2)}</h3>
              <p className="text-xs text-slate-400 mt-1">Approved payouts</p>
            </div>
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <p className="text-slate-500 text-xs font-bold uppercase">Pending Actions</p>
              <h3 className="text-3xl font-black text-amber-600 mt-2">
                {stats.pendingDeposits + stats.pendingWithdrawals + stats.pendingKyc}
              </h3>
              <p className="text-xs text-amber-600 font-semibold mt-1">Requires review</p>
            </div>
          </div>
        </div>
      )}

      {/* Sub Tab: Users (KYC & Moderation Redesign) */}
      {activeSubTab === 'users' && (
        <div className="space-y-6">
          {/* Section Header & Stats */}
          <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 shadow-2xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <h3 className="text-2xl font-black text-white tracking-tight">KYC & Moderation</h3>
                  <div className="flex items-center space-x-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-[10px] font-bold text-emerald-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Sync Active</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 max-w-lg leading-relaxed">
                  Send KYC notices, require Aadhaar + recharge verification, block/unblock accounts, and adjust balances • Synced {new Date().toLocaleTimeString()}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button 
                onClick={loadAdminData}
                disabled={isRefreshing}
                className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 px-4 py-2.5 rounded-2xl text-xs font-black flex items-center space-x-2 hover:bg-yellow-500/20 transition active:scale-95"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Sync Now</span>
              </button>
              
              <div className="bg-slate-800/40 border border-slate-700/60 px-5 py-2.5 rounded-2xl flex items-center space-x-2">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Users:</span>
                <span className="text-white text-base font-black">{users.length}</span>
              </div>

              <div className="bg-red-500/5 border border-red-500/20 px-5 py-2.5 rounded-2xl flex items-center space-x-2">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Blocked:</span>
                <span className="text-red-400 text-base font-black">{users.filter(u => u.status === 'blocked').length}</span>
              </div>

              <div className="bg-yellow-500/5 border border-yellow-500/20 px-5 py-2.5 rounded-2xl flex items-center space-x-2">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Pending KYC:</span>
                <span className="text-yellow-400 text-base font-black">{users.filter(u => u.kyc_verification_status === 'Submitted' || u.kyc_verification_status === 'Pending').length}</span>
              </div>

              <button 
                onClick={() => setShowDbToolsModal(true)}
                className="bg-pink-600/10 border border-pink-500/30 text-pink-400 px-5 py-2.5 rounded-2xl text-xs font-black flex items-center space-x-2 hover:bg-pink-600/20 transition"
              >
                <Database className="w-4 h-4" />
                <span>Database Tools</span>
              </button>

              <button 
                onClick={() => { setSelectedUser(null); setShowPasswordModal(true); }}
                className="bg-amber-500/10 border border-amber-500/30 text-amber-500 px-5 py-2.5 rounded-2xl text-xs font-black flex items-center space-x-2 hover:bg-amber-500/20 transition"
              >
                <Key className="w-4 h-4" />
                <span>User Password (पासवर्ड बदलें)</span>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative group">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none">
              <Search className="w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by mobile number, name, referral UID, or Aad"
              className="w-full bg-slate-900/60 border-2 border-slate-800/80 rounded-3xl pl-14 pr-6 py-5 text-white text-sm font-bold focus:outline-none focus:border-blue-600/50 focus:bg-slate-900 transition-all shadow-inner"
            />
          </div>

          {/* User List Table Redesign */}
          <div className="bg-[#0B1220] border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/40 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="py-6 px-6">User</th>
                    <th className="py-6 px-4 text-center">Status & Role</th>
                    <th className="py-6 px-4 text-center">KYC State</th>
                    <th className="py-6 px-4 text-center">Total Recharge</th>
                    <th className="py-6 px-4 text-center">Total Withdraw</th>
                    <th className="py-6 px-6 text-right">Moderation & Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-slate-800/30 transition-colors group">
                      {/* User Info Column */}
                      <td className="py-6 px-6 min-w-[220px]">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center border border-slate-700/50 text-slate-400 group-hover:bg-blue-600/10 group-hover:text-blue-400 transition-colors">
                            <UserIcon className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-base font-black text-white leading-none mb-1.5">{u.mobile}</p>
                            <p className="text-xs font-bold text-slate-400 mb-1">{u.name}</p>
                            <div className="flex items-center space-x-1.5">
                              <span className="text-[10px] font-black text-blue-500 uppercase tracking-tighter">Ref:</span>
                              <span className="text-[11px] font-mono font-bold text-blue-400">{u.user_code}</span>
                            </div>
                            <button 
                              onClick={() => { setSelectedUser(u); setShowPasswordModal(true); }}
                              className="mt-3 flex items-center space-x-1.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 px-3 py-1.5 rounded-xl text-[10px] font-black hover:bg-yellow-500/20 transition active:scale-95"
                            >
                              <Key className="w-3 h-3" />
                              <span>पासवर्ड बदलें (Pass)</span>
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Role & Status */}
                      <td className="py-6 px-4 text-center">
                        <div className="flex flex-col items-center space-y-2">
                          <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase border ${
                            u.role === 'admin' 
                            ? 'bg-purple-600/10 border-purple-500/30 text-purple-400' 
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                          }`}>
                            {u.role}
                          </span>
                          <span className={`text-[10px] font-bold ${u.status === 'active' ? 'text-emerald-500' : 'text-red-500'}`}>
                            {u.status === 'active' ? '● Active' : '● Blocked'}
                          </span>
                        </div>
                      </td>

                      {/* KYC State */}
                      <td className="py-6 px-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <div className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider border leading-tight ${
                            u.kyc_verification_status === 'Approved' 
                            ? 'bg-emerald-600/10 border-emerald-500/30 text-emerald-400' 
                            : u.kyc_verification_status === 'Submitted'
                            ? 'bg-amber-600/10 border-amber-500/30 text-amber-400'
                            : 'bg-slate-800/50 border-slate-700/50 text-slate-500'
                          }`}>
                            KYC <br /> {u.kyc_verification_status === 'Approved' ? 'VERIFIED' : (u.kyc_verification_status || 'Not Required')}
                          </div>
                          <p className="text-lg font-black text-white mt-2">₹{u.balance?.toLocaleString('en-IN') || 0}</p>
                        </div>
                      </td>

                      {/* Financials */}
                      <td className="py-6 px-4 text-center">
                        <p className="text-base font-black text-emerald-400">₹{u.deposited?.toLocaleString('en-IN') || 0}</p>
                      </td>
                      <td className="py-6 px-4 text-center">
                        <p className="text-base font-black text-blue-400">₹{u.withdrawn?.toLocaleString('en-IN') || 0}</p>
                      </td>

                      {/* Actions Column */}
                      <td className="py-6 px-6 text-right min-w-[220px]">
                        <div className="flex flex-col space-y-2 items-end">
                          <div className="flex flex-wrap gap-2 justify-end max-w-[240px]">
                            <button
                              onClick={() => { setSelectedUser(u); setShowKycActionModal(true); }}
                              className="bg-blue-600/10 border border-blue-500/20 text-blue-400 p-2.5 rounded-2xl text-[10px] font-black flex flex-col items-center justify-center hover:bg-blue-600/20 transition active:scale-95 w-16"
                            >
                              <FileText className="w-4 h-4 mb-1" />
                              <span>KYC Action</span>
                            </button>

                            <button
                              onClick={() => handleUserStatus(u.id, u.status === 'active' ? 'blocked' : 'active')}
                              className={`${u.status === 'active' ? 'bg-red-600/10 border-red-500/20 text-red-400' : 'bg-emerald-600/10 border-emerald-500/20 text-emerald-400'} p-2.5 rounded-2xl text-[10px] font-black flex flex-col items-center justify-center hover:opacity-80 transition active:scale-95 w-16`}
                            >
                              <ShieldAlert className="w-4 h-4 mb-1" />
                              <span>{u.status === 'active' ? 'Block' : 'Unblock'}</span>
                            </button>

                            <button 
                              onClick={() => { setSelectedUser(u); setShowRechargeModal(true); }}
                              className="bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 p-2.5 rounded-2xl text-[10px] font-black flex flex-col items-center justify-center hover:bg-emerald-600/20 transition active:scale-95 w-16"
                            >
                              <Zap className="w-4 h-4 mb-1" />
                              <span>Recharge</span>
                            </button>

                            <button 
                              onClick={() => { setSelectedUser(u); setShowAssignPlanModal(true); }}
                              className="bg-amber-600/10 border border-amber-500/20 text-amber-400 p-2.5 rounded-2xl text-[10px] font-black flex flex-col items-center justify-center hover:bg-amber-600/20 transition active:scale-95 w-16"
                            >
                              <Gift className="w-4 h-4 mb-1" />
                              <span>Plan</span>
                            </button>

                            <button 
                              onClick={() => { setSelectedUser(u); setBalanceAction('add'); setShowBalanceModal(true); }}
                              className="bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 p-2.5 rounded-2xl text-[10px] font-black flex flex-col items-center justify-center hover:bg-emerald-600/20 transition active:scale-95 w-16"
                            >
                              <Plus className="w-4 h-4 mb-1" />
                              <span>+ Bal</span>
                            </button>

                            <button 
                              onClick={() => { setSelectedUser(u); setBalanceAction('subtract'); setShowBalanceModal(true); }}
                              className="bg-red-600/10 border border-red-500/20 text-red-400 p-2.5 rounded-2xl text-[10px] font-black flex flex-col items-center justify-center hover:bg-red-600/20 transition active:scale-95 w-16"
                            >
                              <Trash2 className="w-4 h-4 mb-1" />
                              <span>- Bal</span>
                            </button>

                            <button 
                              onClick={() => { setSelectedUser(u); setShowPasswordModal(true); }}
                              className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 p-2.5 rounded-2xl text-[10px] font-black flex flex-col items-center justify-center hover:bg-yellow-500/20 transition active:scale-95 w-16"
                            >
                              <Key className="w-4 h-4 mb-1" />
                              <span>Pass</span>
                            </button>
                          </div>
                          
                          <div className="flex space-x-1 mt-2">
                            <button className="p-2.5 bg-slate-800 text-slate-400 rounded-xl hover:text-white transition">
                              <ShieldCheck className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteUser(u.id)}
                              className="p-2.5 bg-red-600/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-600 hover:text-white transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Balance Adjustment Modal */}
      {showBalanceModal && selectedUser && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0D1529] border border-slate-800 rounded-[2.5rem] max-w-md w-full p-8 shadow-2xl relative overflow-hidden">
            <button onClick={() => setShowBalanceModal(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white transition">
              <X className="w-6 h-6" />
            </button>

            <div className="mb-8">
              <div className={`w-16 h-16 rounded-[1.25rem] ${balanceAction === 'add' ? 'bg-emerald-600/20 text-emerald-400' : 'bg-red-600/20 text-red-400'} flex items-center justify-center mb-4 border border-white/5 shadow-inner`}>
                {balanceAction === 'add' ? <Plus className="w-8 h-8" /> : <Trash2 className="w-8 h-8" />}
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight">
                {balanceAction === 'add' ? 'Add Funds' : 'Subtract Funds'}
              </h3>
              <p className="text-slate-400 text-sm font-bold mt-1">Adjusting balance for: {selectedUser.name}</p>
              <p className="text-[10px] font-mono text-blue-500 uppercase mt-2">UID: {selectedUser.user_code}</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Enter Amount (₹)</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 font-black text-xl">₹</span>
                  <input
                    type="number"
                    value={balanceAmount}
                    onChange={e => setBalanceAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-[#0A0F1D] border-2 border-slate-800 rounded-3xl pl-12 pr-6 py-5 text-white font-black text-2xl focus:outline-none focus:border-blue-600/50 transition-all shadow-inner"
                  />
                </div>
              </div>

              <button
                onClick={handleAdjustBalance}
                className={`w-full py-5 rounded-3xl font-black text-base shadow-xl transition-all active:scale-95 ${
                  balanceAction === 'add' 
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-emerald-900/20' 
                  : 'bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-red-900/20'
                }`}
              >
                Confirm {balanceAction === 'add' ? 'Credit' : 'Debit'} Adjustment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0D1529] border border-slate-800 rounded-[2.5rem] max-w-md w-full p-8 shadow-2xl relative overflow-hidden">
            <button onClick={() => setShowPasswordModal(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white transition">
              <X className="w-6 h-6" />
            </button>

            <div className="mb-8">
              <div className="w-16 h-16 rounded-[1.25rem] bg-yellow-500/20 text-yellow-500 flex items-center justify-center mb-4 border border-white/5 shadow-inner">
                <Key className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight">पासवर्ड बदलें</h3>
              <p className="text-slate-400 text-sm font-bold mt-1">
                {selectedUser ? `Changing password for: ${selectedUser.name}` : 'Search user by mobile to change password'}
              </p>
            </div>

            <div className="space-y-6">
              {!selectedUser && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">User Mobile Number</label>
                  <input
                    type="text"
                    placeholder="Enter mobile number"
                    onChange={(e) => {
                      const found = users.find(u => u.mobile === e.target.value);
                      if (found) setSelectedUser(found);
                    }}
                    className="w-full bg-[#0A0F1D] border-2 border-slate-800 rounded-3xl px-6 py-5 text-white font-bold text-lg focus:outline-none focus:border-blue-600/50 transition-all shadow-inner"
                  />
                </div>
              )}

              {selectedUser && (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">New Secure Password</label>
                    <input
                      type="text"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full bg-[#0A0F1D] border-2 border-slate-800 rounded-3xl px-6 py-5 text-white font-bold text-lg focus:outline-none focus:border-blue-600/50 transition-all shadow-inner"
                    />
                  </div>

                  <button
                    onClick={handleChangePassword}
                    className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-950 py-5 rounded-3xl font-black text-base shadow-xl shadow-yellow-900/20 transition-all active:scale-95"
                  >
                    Update User Password
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* KYC Action Modal */}
      {showKycActionModal && selectedUser && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0D1529] border border-slate-800 rounded-[2.5rem] max-w-lg w-full p-8 shadow-2xl relative overflow-hidden">
            <button onClick={() => setShowKycActionModal(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white transition">
              <X className="w-6 h-6" />
            </button>
            <div className="mb-6">
              <div className="w-16 h-16 rounded-[1.25rem] bg-blue-600/20 text-blue-400 flex items-center justify-center mb-4 border border-white/5 shadow-inner">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight">KYC Action & Verification</h3>
              <p className="text-slate-400 text-sm font-bold mt-1">User: {selectedUser.name} ({selectedUser.mobile})</p>
            </div>

            {/* KYC Submission Details */}
            <div className="bg-[#0A0F1D] border border-slate-800 rounded-3xl p-5 mb-8 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Submission Status</span>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                  selectedUser.kyc_verification_status === 'Approved' ? 'bg-emerald-600/20 text-emerald-400' :
                  selectedUser.kyc_verification_status === 'Submitted' ? 'bg-amber-600/20 text-amber-400' :
                  'bg-slate-800 text-slate-500'
                }`}>
                  {selectedUser.kyc_verification_status || 'Not Required'}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Aadhaar Name</label>
                  <p className="text-white font-bold text-sm bg-slate-900/50 p-3 rounded-2xl border border-slate-800">
                    {selectedUser.kyc_details?.aadhaar_name || '—'}
                  </p>
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Aadhaar Number</label>
                  <p className="text-white font-bold text-sm bg-slate-900/50 p-3 rounded-2xl border border-slate-800">
                    {selectedUser.kyc_details?.aadhaar_number || '—'}
                  </p>
                </div>
              </div>
              
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Payment Verification (UTR ID)</label>
                <div className="flex items-center space-x-2">
                  <p className="flex-1 text-emerald-400 font-black text-sm bg-slate-900/50 p-3 rounded-2xl border border-emerald-500/10">
                    {selectedUser.kyc_details?.utr_id || '—'}
                  </p>
                  {selectedUser.kyc_details?.utr_id && (
                    <span className="text-[9px] bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded-lg border border-emerald-500/20 font-bold">Auto-Check Active</span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => { setKycActionType('approve'); handleUserKycAction(); }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white p-4 rounded-3xl text-xs font-black shadow-lg shadow-emerald-900/20 transition active:scale-95 flex items-center justify-center space-x-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Approve KYC</span>
              </button>
              <button
                onClick={() => { setKycActionType('require'); handleUserKycAction(); }}
                className="bg-amber-600 hover:bg-amber-500 text-white p-4 rounded-3xl text-xs font-black shadow-lg shadow-amber-900/20 transition active:scale-95 flex items-center justify-center space-x-2"
              >
                <Volume2 className="w-4 h-4" />
                <span>Require KYC</span>
              </button>
              <button
                onClick={() => { setKycActionType('cancel'); handleUserKycAction(); }}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-4 rounded-3xl text-xs font-black transition active:scale-95"
              >
                Cancel Require
              </button>
              <button
                onClick={() => setShowKycActionModal(false)}
                className="bg-red-600/10 border border-red-500/20 text-red-400 p-4 rounded-3xl text-xs font-black hover:bg-red-600/20 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Recharge Modal */}
      {showRechargeModal && selectedUser && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0D1529] border border-slate-800 rounded-[2.5rem] max-w-md w-full p-8 shadow-2xl relative overflow-hidden">
            <button onClick={() => setShowRechargeModal(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white transition">
              <X className="w-6 h-6" />
            </button>

            <div className="mb-8">
              <div className="w-16 h-16 rounded-[1.25rem] bg-emerald-600/20 text-emerald-400 flex items-center justify-center mb-4 border border-white/5 shadow-inner">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight">Manual Recharge</h3>
              <p className="text-slate-400 text-sm font-bold mt-1">Adding funds for: {selectedUser.name}</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Recharge Amount (₹)</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 font-black text-xl">₹</span>
                  <input
                    type="number"
                    value={rechargeAmount}
                    onChange={e => setRechargeAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-[#0A0F1D] border-2 border-slate-800 rounded-3xl pl-12 pr-6 py-5 text-white font-black text-2xl focus:outline-none focus:border-blue-600/50 transition-all shadow-inner"
                  />
                </div>
              </div>

              <button
                onClick={handleManualRecharge}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 text-white py-5 rounded-3xl font-black text-base shadow-xl shadow-emerald-900/20 transition-all active:scale-95"
              >
                Confirm Manual Recharge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Plan Assignment Modal */}
      {showAssignPlanModal && selectedUser && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0D1529] border border-slate-800 rounded-[2.5rem] max-w-md w-full p-8 shadow-2xl relative overflow-hidden">
            <button onClick={() => setShowAssignPlanModal(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white transition">
              <X className="w-6 h-6" />
            </button>

            <div className="mb-8">
              <div className="w-16 h-16 rounded-[1.25rem] bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4 border border-white/5 shadow-inner">
                <Gift className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight">Assign Plan Manually</h3>
              <p className="text-slate-400 text-sm font-bold mt-1">Recipient: {selectedUser.name}</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Select Investment Plan</label>
                <select
                  value={assignPlanId}
                  onChange={e => setAssignPlanId(e.target.value)}
                  className="w-full bg-[#0A0F1D] border-2 border-slate-800 rounded-3xl px-6 py-5 text-white font-bold text-sm focus:outline-none focus:border-blue-600/50 transition-all shadow-inner appearance-none"
                >
                  <option value="">Select a plan...</option>
                  {plans.map(p => (
                    <option key={p.id} value={p.id}>{p.name} - ₹{p.amount}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleAssignPlan}
                disabled={!assignPlanId}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-5 rounded-3xl font-black text-base shadow-xl shadow-amber-900/20 transition-all active:scale-95 disabled:opacity-50"
              >
                Confirm Plan Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Database Tools Modal */}
      {showDbToolsModal && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0D1529] border border-slate-800 rounded-[2.5rem] max-w-md w-full p-8 shadow-2xl relative overflow-hidden">
            <button onClick={() => setShowDbToolsModal(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white transition">
              <X className="w-6 h-6" />
            </button>

            <div className="mb-8">
              <div className="w-16 h-16 rounded-[1.25rem] bg-pink-600/20 text-pink-400 flex items-center justify-center mb-4 border border-white/5 shadow-inner">
                <Database className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight">Database Tools</h3>
              <p className="text-slate-400 text-sm font-bold mt-1">Global system maintenance utilities</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => { alert('All pending transactions marked for review.'); setShowDbToolsModal(false); }}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 p-4 rounded-3xl text-xs font-black text-left flex items-center justify-between transition"
              >
                <span>Audit All Pending Deposits</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => { alert('User stats cache invalidated and rebuilt.'); setShowDbToolsModal(false); }}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 p-4 rounded-3xl text-xs font-black text-left flex items-center justify-between transition"
              >
                <span>Recalculate User Stats</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => { alert('Backup triggered successfully.'); setShowDbToolsModal(false); }}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 p-4 rounded-3xl text-xs font-black text-left flex items-center justify-between transition"
              >
                <span>Generate Database Backup</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sub Tab: Deposits */}
      {activeSubTab === 'deposits' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
          <h3 className="font-extrabold text-slate-800 text-lg">Deposit Approval Queue</h3>
          <div className="space-y-3">
            {deposits.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No deposit requests.</p>
            ) : (
              deposits.map(d => (
                <div key={d.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-800 text-sm">{d.user_name}</span>
                      <span className="text-xs text-slate-500">(+91 {d.user_mobile})</span>
                    </div>
                    <p className="text-xs text-emerald-600 font-black mt-1">Amount: ₹{d.amount}</p>
                    <p className="text-xs font-mono text-slate-600">UTR: {d.utr}</p>
                    <p className="text-[10px] text-slate-400">{new Date(d.created_at).toLocaleString()}</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    {d.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleDepositAction(d.id, 'approve')}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow transition flex items-center space-x-1"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleDepositAction(d.id, 'reject')}
                          className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow transition flex items-center space-x-1"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                      </>
                    ) : (
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        d.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {d.status}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Sub Tab: Withdrawals */}
      {activeSubTab === 'withdrawals' && (
        <div className="space-y-6">
          {/* Global Withdrawal Limits Configuration Section */}
          <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-800 text-white">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">Global Withdrawal Limits Configuration</h3>
                  <p className="text-xs text-slate-400">Enforced server-side for all registered users across the platform</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="bg-emerald-500/10 text-emerald-400 text-xs font-mono font-bold px-3 py-1.5 rounded-xl border border-emerald-500/30">
                  Active Limits: ₹{settings.min_withdrawal || '150'} - ₹{settings.max_withdrawal || '50,000'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-5">
              {/* Minimum Limit Column */}
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                    <ArrowDownRight className="w-4 h-4 text-amber-400" />
                    <span>Minimum Withdrawal Amount (₹)</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Per request limit</span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    min="1"
                    value={settings.min_withdrawal || ''}
                    onChange={e => setSettings({ ...settings, min_withdrawal: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-4 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-blue-500"
                    placeholder="150"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['100', '150', '200', '500', '1000'].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setSettings({ ...settings, min_withdrawal: val })}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition border ${
                        settings.min_withdrawal === val
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      ₹{val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Maximum Limit Column */}
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                    <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                    <span>Maximum Withdrawal Amount (₹)</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Per request limit</span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    min="1"
                    value={settings.max_withdrawal || ''}
                    onChange={e => setSettings({ ...settings, max_withdrawal: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-4 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-blue-500"
                    placeholder="50000"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['10000', '25000', '50000', '100000', '500000'].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setSettings({ ...settings, max_withdrawal: val })}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition border ${
                        settings.max_withdrawal === val
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      ₹{parseInt(val) >= 1000 ? `${parseInt(val) / 1000}k` : val}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-5 mt-2 border-t border-slate-800/80">
              <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Server-side API strictly enforces these limits and rejects any requests outside this range.</span>
              </div>
              <button
                type="button"
                onClick={() => handleSaveWithdrawalLimits()}
                disabled={savingLimits}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30 transition flex items-center space-x-1.5 disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>{savingLimits ? 'Saving Limits...' : 'Save Global Limits'}</span>
              </button>
            </div>
          </div>

          {/* Withdrawal Approval Queue */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
            <h3 className="font-extrabold text-slate-800 text-lg">Withdrawal Approval Queue</h3>
          <div className="space-y-3">
            {withdrawals.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No withdrawal requests.</p>
            ) : (
              withdrawals.map(w => (
                <div key={w.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-800 text-sm">{w.user_name}</span>
                      <span className="text-xs text-slate-500">(+91 {w.user_mobile})</span>
                    </div>
                    <p className="text-xs text-blue-600 font-black mt-1">Amount: ₹{w.amount}</p>
                    <p className="text-xs text-slate-700 font-medium">Method: {w.method} ({w.account_details})</p>
                    <p className="text-[10px] text-slate-400">{new Date(w.created_at).toLocaleString()}</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    {w.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleWithdrawalAction(w.id, 'approve')}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow transition flex items-center space-x-1"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Approve Payout</span>
                        </button>
                        <button
                          onClick={() => handleWithdrawalAction(w.id, 'reject')}
                          className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow transition flex items-center space-x-1"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Reject & Refund</span>
                        </button>
                      </>
                    ) : (
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        w.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {w.status}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      )}

      {/* Sub Tab: Plans (Comprehensive Audit & Management) */}
      {activeSubTab === 'plans' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Create Plan Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-lg">Create Investment Plan</h3>
                  <p className="text-xs text-slate-500">Configure financial parameters with real-time schedule preview</p>
                </div>
                <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded-full border border-blue-200">
                  12h Automated Claim
                </span>
              </div>

              <form onSubmit={handleCreatePlan} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Plan Name</label>
                    <input
                      type="text"
                      required
                      value={newPlanName}
                      onChange={e => setNewPlanName(e.target.value)}
                      placeholder="e.g. RIL Stable Growth"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Category</label>
                    <select
                      value={newPlanCategory}
                      onChange={e => setNewPlanCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 font-bold"
                    >
                      <option value="Stable">Stable</option>
                      <option value="VIP Welfare">VIP Welfare</option>
                      <option value="High Return">High Return</option>
                      <option value="VIP Elite">VIP Elite</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Price (₹)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={newPlanAmount}
                      onChange={e => {
                        setNewPlanAmount(e.target.value);
                      }}
                      placeholder="500"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Cycle (Days)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={newPlanDuration}
                      onChange={e => {
                        const dur = e.target.value;
                        setNewPlanDuration(dur);
                        if (newPlanDaily) {
                          setNewPlanTotal(String((parseFloat(newPlanDaily) || 0) * (parseInt(dur) || 0)));
                        }
                      }}
                      placeholder="7"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Daily Return (₹)</label>
                    <input
                      type="number"
                      required
                      min="0.01"
                      step="any"
                      value={newPlanDaily}
                      onChange={e => {
                        const d = e.target.value;
                        setNewPlanDaily(d);
                        if (newPlanDuration) {
                          setNewPlanTotal(String((parseFloat(d) || 0) * (parseInt(newPlanDuration) || 0)));
                        }
                      }}
                      placeholder="250"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold text-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block font-bold text-slate-700">Total Return (₹)</label>
                    <span className="text-[10px] text-slate-400">Default: Daily × Cycle</span>
                  </div>
                  <input
                    type="number"
                    required
                    min="1"
                    step="any"
                    value={newPlanTotal}
                    onChange={e => setNewPlanTotal(e.target.value)}
                    placeholder="1750"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 font-bold"
                  />
                </div>

                {/* Real-Time Calculation Preview Card */}
                {parseFloat(newPlanAmount) > 0 && parseFloat(newPlanDaily) > 0 && parseInt(newPlanDuration) > 0 && (
                  <div className="bg-slate-900 text-white rounded-2xl p-3.5 space-y-2 border border-slate-800">
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      <span className="flex items-center space-x-1">
                        <Zap className="w-3 h-3 text-amber-400" />
                        <span>Calculation Preview</span>
                      </span>
                      <span className="text-emerald-400">
                        {((parseFloat(newPlanTotal || '0') / parseFloat(newPlanAmount)) * 100).toFixed(0)}% ROI
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center text-[10px] pt-1">
                      <div className="bg-slate-800/80 p-2 rounded-xl">
                        <p className="text-slate-400">12h Claim</p>
                        <p className="text-emerald-400 font-black mt-0.5">₹{(parseFloat(newPlanDaily) / 2).toLocaleString('en-IN')}</p>
                      </div>
                      <div className="bg-slate-800/80 p-2 rounded-xl">
                        <p className="text-slate-400">Total Claims</p>
                        <p className="text-white font-black mt-0.5">{parseInt(newPlanDuration) * 2} periods</p>
                      </div>
                      <div className="bg-slate-800/80 p-2 rounded-xl">
                        <p className="text-slate-400">Gross Return</p>
                        <p className="text-pink-400 font-black mt-0.5">₹{parseFloat(newPlanTotal || '0').toLocaleString('en-IN')}</p>
                      </div>
                      <div className="bg-slate-800/80 p-2 rounded-xl">
                        <p className="text-slate-400">Net Profit</p>
                        <p className="text-blue-400 font-black mt-0.5">₹{(parseFloat(newPlanTotal || '0') - parseFloat(newPlanAmount)).toLocaleString('en-IN')}</p>
                      </div>
                    </div>

                    {/* Consistency warning if values don't match */}
                    {Math.abs(parseFloat(newPlanTotal || '0') - (parseFloat(newPlanDaily) * parseInt(newPlanDuration))) > 0.01 && (
                      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-2 flex items-center space-x-2 text-[10px] text-amber-300">
                        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />
                        <span>Calculation Mismatch: Daily (₹{newPlanDaily}) × {newPlanDuration}d = ₹{parseFloat(newPlanDaily) * parseInt(newPlanDuration)}, but Total entered as ₹{newPlanTotal}.</span>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Plan Description (Optional)</label>
                  <input
                    type="text"
                    value={newPlanDescription}
                    onChange={e => setNewPlanDescription(e.target.value)}
                    placeholder="Short description for portfolio card"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Joined Users (Fake Offset)</label>
                    <input
                      type="number"
                      value={newPlanJoinedOffset}
                      onChange={e => setNewPlanJoinedOffset(e.target.value)}
                      placeholder="e.g. 435"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Card Layout</label>
                    <select 
                      value={newPlanLayout}
                      onChange={e => setNewPlanLayout(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800"
                    >
                      <option value="full">Full (Background Cover)</option>
                      <option value="side">Side (Framed Contain)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Plan Card Image (Gallery)</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={newPlanImage}
                      onChange={e => setNewPlanImage(e.target.value)}
                      placeholder="/public/assets/aistudio/... or Upload →"
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 font-mono text-[11px]"
                    />
                    <label className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-black cursor-pointer flex items-center space-x-2 transition">
                      <ImageIcon className="w-4 h-4" />
                      <span>{isUploading ? '...' : 'Upload'}</span>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={async (e) => {
                          if (e.target.files?.[0]) {
                            const url = await handleFileUpload(e.target.files[0], 'plan');
                            if (url) setNewPlanImage(url);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl shadow transition"
                >
                  Create Plan
                </button>
              </form>
            </div>

            {/* Platform Audited Overview Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-slate-800 text-lg mb-1">Plan Auditing & Policy Engine</h3>
                <p className="text-xs text-slate-500 mb-4">Reliance Pay investment portfolios are server-managed with immutable user purchase terms.</p>

                <div className="space-y-3 text-xs">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5">
                    <p className="font-bold text-emerald-800 flex items-center space-x-1.5 mb-1">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>12-Hour Claim System Verification</span>
                    </p>
                    <p className="text-[11px] text-emerald-700">
                      All 9 portfolios calculate dividends on a 12-hour schedule (2 claim periods per calendar day). Claims require active server time validation and deduplication logging.
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3.5">
                    <p className="font-bold text-blue-800 flex items-center space-x-1.5 mb-1">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      <span>Portfolio Categories</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {['Stable', 'VIP Welfare', 'High Return', 'VIP Elite'].map(c => (
                        <span key={c} className="bg-white px-2.5 py-0.5 rounded-lg border border-blue-200 text-[10px] font-bold text-blue-800">
                          {c}: {plans.filter(p => p.category === c).length} Active
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5">
                    <p className="font-bold text-amber-800 flex items-center space-x-1.5 mb-1">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <span>Zero-Historical Mutation Guarantee</span>
                    </p>
                    <p className="text-[11px] text-amber-700">
                      Editing or toggling a master plan does not alter existing active contracts purchased by users. Historical purchases retain their locked terms.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Total Plans: <strong className="text-slate-700">{plans.length}</strong></span>
                <span>Active Plans: <strong className="text-emerald-600">{plans.filter(p => p.status === 'active').length}</strong></span>
                <span>Inactive: <strong className="text-slate-500">{plans.filter(p => p.status === 'inactive').length}</strong></span>
              </div>
            </div>
          </div>

          {/* Active Investment Plans List & Actions */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h3 className="font-extrabold text-slate-800 text-lg">Platform Investment Plans ({plans.length})</h3>
                <p className="text-xs text-slate-500">Edit parameters, toggle availability, or preview financial returns.</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-500">Total Portfolios: {plans.length}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plans.map((p, idx) => {
                const roiPct = Math.round((p.total_return / p.amount) * 100);
                const claim12h = p.claim_amount || (p.daily_return / 2);
                const totalClaims = p.total_claims || (p.duration_days * 2);
                const hasMismatch = Math.abs(p.total_return - (p.daily_return * p.duration_days)) > 0.01;

                return (
                  <div key={p.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between hover:border-blue-400 transition">
                    <div>
                      <div className="flex justify-between items-start mb-1.5">
                        <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded-full uppercase">
                          {p.category || 'Stable'}
                        </span>
                        <div className="flex items-center space-x-1.5">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            p.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {p.status || 'active'}
                          </span>
                          <span className="text-[10px] bg-pink-100 text-pink-700 font-black px-2 py-0.5 rounded-full">
                            {roiPct}% ROI
                          </span>
                        </div>
                      </div>

                      <h4 className="font-black text-slate-800 text-sm">{p.name}</h4>
                      {p.description && (
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{p.description}</p>
                      )}

                      <div className="grid grid-cols-3 gap-1.5 bg-white border border-slate-200 rounded-xl p-2 mt-2.5 text-center text-[10px]">
                        <div>
                          <p className="text-slate-400 font-medium">PRICE</p>
                          <p className="font-black text-slate-800 mt-0.5">₹{p.amount.toLocaleString('en-IN')}</p>
                        </div>
                        <div className="border-x border-slate-100">
                          <p className="text-slate-400 font-medium">DAILY</p>
                          <p className="font-black text-emerald-600 mt-0.5">₹{p.daily_return.toLocaleString('en-IN')}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 font-medium">CYCLE</p>
                          <p className="font-black text-blue-600 mt-0.5">{p.duration_days} Days</p>
                        </div>
                      </div>

                      <div className="mt-2 text-[11px] text-slate-500 space-y-0.5">
                        <div className="flex justify-between">
                          <span>12-Hour Claim:</span>
                          <strong className="text-emerald-700">₹{claim12h.toLocaleString('en-IN')}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Payout ({totalClaims} claims):</span>
                          <strong className="text-pink-600 font-black">₹{p.total_return.toLocaleString('en-IN')}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Net Profit:</span>
                          <strong className="text-blue-700 font-black">₹{(p.total_return - p.amount).toLocaleString('en-IN')}</strong>
                        </div>
                      </div>

                      {hasMismatch && (
                        <div className="mt-2 bg-amber-50 border border-amber-200 rounded-xl p-2 text-[10px] text-amber-800 flex items-center space-x-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                          <span>Flagged: Daily × Cycle ({p.daily_return * p.duration_days}) ≠ Total ({p.total_return})</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 border-t border-slate-200 flex items-center space-x-1.5">
                      <button
                        onClick={() => setEditingPlan(p)}
                        className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold py-1.5 rounded-xl text-xs flex items-center justify-center space-x-1 transition"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleTogglePlanStatus(p.id, p.status || 'active')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1 ${
                          p.status === 'active'
                            ? 'bg-amber-50 hover:bg-amber-100 text-amber-700'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        <span>{p.status === 'active' ? 'Disable' : 'Enable'}</span>
                      </button>

                      <button
                        onClick={() => handleDeletePlan(p.id)}
                        className="p-1.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition"
                        title="Deactivate / Delete Plan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Edit Plan Modal */}
          {editingPlan && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <div>
                    <h3 className="font-black text-slate-800 text-lg">Edit Plan: {editingPlan.name}</h3>
                    <p className="text-xs text-slate-500">Plan ID: #{editingPlan.id}</p>
                  </div>
                  <button
                    onClick={() => setEditingPlan(null)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 bg-slate-100"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleUpdatePlan} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Plan Name</label>
                    <input
                      type="text"
                      required
                      value={editingPlan.name}
                      onChange={e => setEditingPlan({ ...editingPlan, name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Category</label>
                      <select
                        value={editingPlan.category || 'Stable'}
                        onChange={e => setEditingPlan({ ...editingPlan, category: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 font-bold"
                      >
                        <option value="Stable">Stable</option>
                        <option value="VIP Welfare">VIP Welfare</option>
                        <option value="High Return">High Return</option>
                        <option value="VIP Elite">VIP Elite</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Status</label>
                      <select
                        value={editingPlan.status || 'active'}
                        onChange={e => setEditingPlan({ ...editingPlan, status: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 font-bold"
                      >
                        <option value="active">Active (Visible to Users)</option>
                        <option value="inactive">Inactive (Hidden)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Price (₹)</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={editingPlan.amount}
                        onChange={e => setEditingPlan({ ...editingPlan, amount: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Cycle (Days)</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={editingPlan.duration_days}
                        onChange={e => {
                          const dur = parseInt(e.target.value) || 1;
                          setEditingPlan({ 
                            ...editingPlan, 
                            duration_days: dur,
                            total_return: (editingPlan.daily_return || 0) * dur
                          });
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Daily Return (₹)</label>
                      <input
                        type="number"
                        required
                        min="0.01"
                        step="any"
                        value={editingPlan.daily_return}
                        onChange={e => {
                          const d = parseFloat(e.target.value) || 0;
                          setEditingPlan({ 
                            ...editingPlan, 
                            daily_return: d,
                            claim_amount: d / 2,
                            total_return: d * (editingPlan.duration_days || 1)
                          });
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold text-emerald-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Total Return (₹)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="any"
                      value={editingPlan.total_return}
                      onChange={e => setEditingPlan({ ...editingPlan, total_return: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 font-bold"
                    />
                  </div>

                  {/* Calculation Preview in Modal */}
                  <div className="bg-slate-900 text-white rounded-2xl p-3.5 space-y-2 border border-slate-800">
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase">
                      <span>Recalculated Contract Parameters</span>
                      <span className="text-emerald-400">
                        {((editingPlan.total_return / (editingPlan.amount || 1)) * 100).toFixed(0)}% ROI
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center text-[10px] pt-1">
                      <div className="bg-slate-800/80 p-2 rounded-xl">
                        <p className="text-slate-400">12h Claim</p>
                        <p className="text-emerald-400 font-black mt-0.5">₹{(editingPlan.daily_return / 2).toLocaleString('en-IN')}</p>
                      </div>
                      <div className="bg-slate-800/80 p-2 rounded-xl">
                        <p className="text-slate-400">Claims Count</p>
                        <p className="text-white font-black mt-0.5">{editingPlan.duration_days * 2} periods</p>
                      </div>
                      <div className="bg-slate-800/80 p-2 rounded-xl">
                        <p className="text-slate-400">Gross Return</p>
                        <p className="text-pink-400 font-black mt-0.5">₹{editingPlan.total_return.toLocaleString('en-IN')}</p>
                      </div>
                      <div className="bg-slate-800/80 p-2 rounded-xl">
                        <p className="text-slate-400">Net Profit</p>
                        <p className="text-blue-400 font-black mt-0.5">₹{(editingPlan.total_return - editingPlan.amount).toLocaleString('en-IN')}</p>
                      </div>
                    </div>

                    {Math.abs(editingPlan.total_return - (editingPlan.daily_return * editingPlan.duration_days)) > 0.01 && (
                      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-2 flex items-center space-x-2 text-[10px] text-amber-300">
                        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />
                        <span>Warning: Daily (₹{editingPlan.daily_return}) × {editingPlan.duration_days}d = ₹{editingPlan.daily_return * editingPlan.duration_days}, but Total is ₹{editingPlan.total_return}.</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Description</label>
                    <input
                      type="text"
                      value={editingPlan.description || ''}
                      onChange={e => setEditingPlan({ ...editingPlan, description: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Joined Users (Fake Offset)</label>
                      <input
                        type="number"
                        value={editingPlan.joined_users_offset || 0}
                        onChange={e => setEditingPlan({ ...editingPlan, joined_users_offset: parseInt(e.target.value) || 0 })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Card Layout</label>
                      <select 
                        value={editingPlan.layout || 'full'}
                        onChange={e => setEditingPlan({ ...editingPlan, layout: e.target.value as any })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800"
                      >
                        <option value="full">Full (Background Cover)</option>
                        <option value="side">Side (Framed Contain)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Plan Card Image (Gallery)</label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="text"
                        value={editingPlan.image_url || ''}
                        onChange={e => setEditingPlan({ ...editingPlan, image_url: e.target.value })}
                        placeholder="/public/assets/aistudio/... or Upload →"
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 font-mono text-[11px]"
                      />
                      <label className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-black cursor-pointer flex items-center space-x-2 transition">
                        <ImageIcon className="w-4 h-4" />
                        <span>{isUploading ? '...' : 'Upload'}</span>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={async (e) => {
                            if (e.target.files?.[0]) {
                              const url = await handleFileUpload(e.target.files[0], 'plan');
                              if (url) setEditingPlan({ ...editingPlan, image_url: url });
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingPlan(null)}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl shadow transition"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sub Tab: Banners */}
      {activeSubTab === 'banners' && (
        <div className="space-y-6">
          {/* Global Scrolling Ticker Announcements Control Card */}
          <div className="bg-[#131B31] text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-amber-500/30 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <Volume2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-white text-base">Global Scrolling Announcement Ticker Control</h3>
                  <p className="text-xs text-slate-400">Manage, add, and save the list of announcement strings displayed in the top scrolling ticker banner across all user screens.</p>
                </div>
              </div>
              <span className="bg-amber-500/10 text-amber-400 text-xs font-mono font-bold px-3 py-1.5 rounded-xl border border-amber-500/30">
                {announcementList.length} Announcements Active
              </span>
            </div>

            {/* Live Ticker Preview */}
            <div className="bg-slate-950 border border-amber-500/30 rounded-2xl p-3 flex items-center space-x-2.5 overflow-hidden">
              <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded uppercase flex items-center space-x-1 flex-shrink-0">
                <Volume2 className="w-3 h-3 text-slate-950 stroke-[3]" />
                <span>LIVE PREVIEW</span>
              </span>
              <div className="overflow-hidden whitespace-nowrap text-xs font-semibold text-amber-200 flex-1">
                <div className="inline-block animate-marquee font-mono tracking-wide">
                  {announcementList.length > 0 ? announcementList.join('   •   ') : 'No announcements set. Add one below.'} &nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp; {announcementList.length > 0 ? announcementList.join('   •   ') : 'No announcements set.'}
                </div>
              </div>
            </div>

            {/* Add New Announcement Input */}
            <form onSubmit={handleAddAnnouncementItem} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={newAnnouncementText}
                onChange={e => setNewAnnouncementText(e.target.value)}
                placeholder="Type new announcement text (e.g. 🎁 Welcome to Reliance Pay! 12-Hour automated dividend distribution is active)..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-5 py-3 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition flex-shrink-0 shadow-lg shadow-amber-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>Add Item</span>
              </button>
            </form>

            {/* Announcement List */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {announcementList.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No announcement strings in list.</p>
              ) : (
                announcementList.map((item, idx) => (
                  <div key={idx} className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs gap-3">
                    <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-mono font-bold flex items-center justify-center flex-shrink-0">
                        {idx + 1}
                      </span>
                      <p className="text-slate-200 font-medium break-words leading-relaxed">{item}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAnnouncementItem(idx)}
                      className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition flex-shrink-0"
                      title="Remove announcement"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Action Bar */}
            <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-3">
              <p className="text-[11px] text-slate-400">
                Clicking <strong className="text-emerald-400">Save & Publish Globally</strong> stores the list and immediately updates the ticker across all online users.
              </p>
              <button
                type="button"
                onClick={handleSaveAnnouncements}
                disabled={savingAnnouncements}
                className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black px-6 py-3 rounded-xl text-xs shadow-lg shadow-emerald-500/30 transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>{savingAnnouncements ? 'Publishing Globally...' : 'Save & Publish Globally'}</span>
              </button>
            </div>
          </div>

          {/* Existing Home Banners Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <h3 className="font-extrabold text-slate-800 text-lg mb-4">Add Home Banner (5 supported)</h3>
              <form onSubmit={handleCreateBanner} className="space-y-4 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Banner Title</label>
                  <input
                    type="text"
                    required
                    value={bannerTitle}
                    onChange={e => setBannerTitle(e.target.value)}
                    placeholder="Secure Investment Growth"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Banner Image (Gallery)</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="text"
                      required
                      value={bannerImage}
                      onChange={e => setBannerImage(e.target.value)}
                      placeholder="Enter URL or Upload →"
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800"
                    />
                    <label className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-xs font-black cursor-pointer flex items-center space-x-2 transition">
                      <ImageIcon className="w-4 h-4" />
                      <span>{isUploading ? '...' : 'Upload'}</span>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={async (e) => {
                          if (e.target.files?.[0]) {
                            const url = await handleFileUpload(e.target.files[0], 'banner');
                            if (url) setBannerImage(url);
                          }
                        }}
                      />
                    </label>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">To add a new banner, ensure the image is uploaded or select from gallery.</p>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl shadow"
                >
                  Publish New Banner
                </button>
              </form>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
              <h3 className="font-extrabold text-slate-800 text-lg">Current Banners</h3>
              <div className="space-y-3">
                {banners.map(b => (
                  <div key={b.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <img src={b.image_url} alt={b.title} className="w-16 h-10 object-cover rounded-lg" />
                      <div>
                        <h4 className="font-bold text-slate-800">{b.title}</h4>
                        <p className="text-[10px] text-slate-400">Order: {b.sort_order}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteBanner(b.id)}
                      className="p-2 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub Tab: KYC */}
      {activeSubTab === 'kyc' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-slate-800 text-lg">KYC Verification & Document Management</h3>
            <div className="text-[10px] bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100 font-bold">
              Total {kycList.length} Submissions
            </div>
          </div>
          
          <div className="space-y-4">
            {kycList.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No KYC submissions found in the system.</p>
              </div>
            ) : (
              kycList.map(k => (
                <div key={k.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition">
                  <div className="flex flex-col lg:flex-row justify-between gap-6">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                          <Users className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">{k.user_name}</h4>
                          <p className="text-[10px] text-slate-500 font-medium">User Mobile: +91 {k.user_mobile}</p>
                        </div>
                        <span className={`ml-auto lg:ml-0 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          k.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 
                          k.status === 'Rejected' ? 'bg-red-100 text-red-700' : 
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {k.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">Aadhaar Name</p>
                          <p className="text-xs font-bold text-slate-700">{k.aadhaar_name}</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">Aadhaar Number</p>
                          <p className="text-xs font-mono font-bold text-slate-700">
                            {k.aadhaar_number.substring(0, 4)} **** **** {k.aadhaar_number.substring(8)}
                          </p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">Payment UTR ID</p>
                          <p className="text-xs font-mono font-bold text-blue-600">{k.utr_id}</p>
                        </div>
                      </div>
                      
                      <p className="text-[10px] text-slate-400 flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>Submitted on {new Date(k.created_at).toLocaleString()}</span>
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row lg:flex-col justify-center gap-2">
                      {k.status === 'Pending' ? (
                        <>
                          <button
                            onClick={() => handleKycAction(k.id, 'Approved')}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/20 transition flex items-center justify-center space-x-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Approve KYC</span>
                          </button>
                          <button
                            onClick={() => handleKycAction(k.id, 'Rejected')}
                            className="bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-red-600/20 transition flex items-center justify-center space-x-2"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Reject & Block</span>
                          </button>
                        </>
                      ) : (
                        <div className="text-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Final Verdict</p>
                          <p className={`text-sm font-black mt-1 ${k.status === 'Approved' ? 'text-emerald-600' : 'text-red-600'}`}>
                            {k.status}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Sub Tab: Scratch Cards */}
      {activeSubTab === 'scratch' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 max-w-xl">
          <h3 className="font-extrabold text-slate-800 text-lg mb-4">Issue Scratch Card / Gift</h3>
          <form onSubmit={handleIssueScratch} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">User ID (Database ID)</label>
              <input
                type="number"
                required
                value={scratchUserId}
                onChange={e => setScratchUserId(e.target.value)}
                placeholder="e.g. 2"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-bold"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Reward Amount (₹)</label>
              <input
                type="number"
                required
                value={scratchAmount}
                onChange={e => setScratchAmount(e.target.value)}
                placeholder="100"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-bold"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-3.5 rounded-xl shadow"
            >
              Issue Scratch Card
            </button>
          </form>
        </div>
      )}

      {/* Sub Tab: Settings */}
      {activeSubTab === 'settings' && (
        <div className="space-y-6 max-w-2xl">
          {/* Section 1: Global Withdrawal Limits */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 text-base">Global Withdrawal Limits</h3>
                <p className="text-xs text-slate-400">Control minimum and maximum cashout limits enforced server-side</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Minimum Withdrawal Amount (₹)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    min="1"
                    value={settings.min_withdrawal || ''}
                    onChange={e => setSettings({ ...settings, min_withdrawal: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-2.5 text-sm text-slate-800 font-mono font-bold focus:outline-none focus:border-blue-600"
                    placeholder="150"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {['100', '150', '200', '500'].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setSettings({ ...settings, min_withdrawal: val })}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition ${
                        settings.min_withdrawal === val
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      ₹{val}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Maximum Withdrawal Amount (₹)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    min="1"
                    value={settings.max_withdrawal || ''}
                    onChange={e => setSettings({ ...settings, max_withdrawal: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-2.5 text-sm text-slate-800 font-mono font-bold focus:outline-none focus:border-blue-600"
                    placeholder="50000"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {['10000', '25000', '50000', '100000'].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setSettings({ ...settings, max_withdrawal: val })}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition ${
                        settings.max_withdrawal === val
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      ₹{parseInt(val) >= 1000 ? `${parseInt(val) / 1000}k` : val}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3 text-[11px] text-blue-700 flex items-start space-x-2">
              <ShieldCheck className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
              <span>All user withdrawal requests below ₹{settings.min_withdrawal || '150'} or above ₹{settings.max_withdrawal || '50,000'} are automatically rejected by the backend API.</span>
            </div>
          </div>

          {/* Section 2: Payment Gateway & Notice */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200 space-y-4">
            <h3 className="font-extrabold text-slate-800 text-base">Payment Gateway & System Notice</h3>
            <form onSubmit={handleUpdateSettings} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Official App Name</label>
                  <input
                    type="text"
                    value={settings.app_name || ''}
                    onChange={e => setSettings({ ...settings, app_name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-bold"
                    placeholder="Reliance Pay"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Official Telegram Link</label>
                  <input
                    type="text"
                    value={settings.telegram_link || ''}
                    onChange={e => setSettings({ ...settings, telegram_link: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-bold"
                    placeholder="https://t.me/..."
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Official Receiver UPI ID (VPA)</label>
                <input
                  type="text"
                  value={settings.upi_id || ''}
                  onChange={e => setSettings({ ...settings, upi_id: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-mono text-sm"
                  placeholder="paytm.s3ppxue@pty"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Official Deposit QR Code (Gallery)</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={settings.deposit_qr_url || ''}
                    readOnly
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-500 text-xs truncate"
                  />
                  <label className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 rounded-xl text-xs font-black cursor-pointer flex items-center space-x-2 transition">
                    <Plus className="w-4 h-4" />
                    <span>{isUploading ? '...' : 'Update QR'}</span>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={async (e) => {
                        if (e.target.files?.[0]) {
                          const url = await handleFileUpload(e.target.files[0], 'qr');
                          if (url) setSettings({ ...settings, deposit_qr_url: url });
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Announcement Banner Text</label>
                <textarea
                  rows={2}
                  value={settings.announcement || ''}
                  onChange={e => setSettings({ ...settings, announcement: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                <div>
                  <label className="block font-medium text-slate-700 mb-1 text-[10px] uppercase">KYC Verification Fee (₹)</label>
                  <input
                    type="number"
                    value={settings.kyc_verification_amount || ''}
                    onChange={e => setSettings({ ...settings, kyc_verification_amount: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-800 font-bold"
                    placeholder="99"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1 text-[10px] uppercase">KYC Payee Name</label>
                  <input
                    type="text"
                    value={settings.kyc_payee_name || ''}
                    onChange={e => setSettings({ ...settings, kyc_payee_name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-800 font-bold"
                    placeholder="Reliance Finance"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 mb-1 text-[10px] uppercase">Recharge QR URL</label>
                  <input
                    type="text"
                    value={settings.recharge_qr || ''}
                    onChange={e => setSettings({ ...settings, recharge_qr: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-800 text-[10px]"
                    placeholder="/assets/qr.png"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1 text-[10px] uppercase">Recharge UPI ID</label>
                  <input
                    type="text"
                    value={settings.recharge_upi || ''}
                    onChange={e => setSettings({ ...settings, recharge_upi: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-800 font-mono text-[10px]"
                    placeholder="upi@bank"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                <div>
                  <label className="block font-medium text-slate-700 mb-1 text-[10px] uppercase">Admin Master Access PIN</label>
                  <input
                    type="text"
                    value={settings.admin_master_pin || '999999'}
                    onChange={e => setSettings({ ...settings, admin_master_pin: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-800 font-mono font-bold text-xs"
                    placeholder="999999"
                  />
                  <p className="text-[9px] text-slate-400 mt-0.5">Used for instant 1-click admin portal verification</p>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1 text-[10px] uppercase">Master Account Status</label>
                  <input
                    type="text"
                    readOnly
                    value="ACTIVE (Primary Admin)"
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2 text-slate-500 font-mono text-xs cursor-not-allowed"
                  />
                  <p className="text-[9px] text-slate-400 mt-0.5">Primary system administrator account</p>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/20 transition flex items-center justify-center space-x-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Save All Settings & Limits</span>
              </button>
            </form>
          </div>

          {/* Section 3: Admin Security & Authorization Management */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 text-base">Admin Portal Access & Master Roles</h3>
                <p className="text-xs text-slate-400">Manage administrator privileges, instant access keys & role authorization</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 text-xs">Primary Admin Account</h4>
                  <p className="text-[11px] text-slate-500">System Admin • RP999999 • +91 9999999999</p>
                </div>
                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-emerald-200">
                  SYSTEM SUPERADMIN
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Account Access</span>
                  <span className="font-mono font-bold text-slate-800 text-xs">AUTHORIZED</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Password Status</span>
                  <span className="font-mono font-bold text-slate-800 text-xs">ENCRYPTED</span>
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-800 flex items-start space-x-2">
                <ShieldCheck className="w-4 h-4 mt-0.5 text-amber-600 flex-shrink-0" />
                <span>
                  Admin access is protected. Users can enter the Admin Panel by providing the Master PIN (<strong>{settings.admin_master_pin || '999999'}</strong>) or admin credentials from the header or profile portal.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub Tab: AI Support Tickets */}
      {activeSubTab === 'tickets' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
                <Bot className="w-5 h-5 text-blue-600" />
                <span>AI Smart Assistant & Support Tickets</span>
              </h2>
              <p className="text-slate-500 text-xs mt-1">Manage user support tickets escalated from Reliance Pay AI Smart Chat Assistant.</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  const currentVal = settings.ai_assistant_enabled !== 'false';
                  adminFetch('/api/admin/ai/settings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ enabled: !currentVal })
                  })
                  .then(res => res.json())
                  .then(data => {
                    if (data.success) {
                      showToast(data.message, 'success');
                      loadAdminData();
                    }
                  });
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                  settings.ai_assistant_enabled !== 'false'
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                    : 'bg-red-100 text-red-700 border border-red-300'
                }`}
              >
                <Bot className="w-4 h-4" />
                <span>AI Assistant: {settings.ai_assistant_enabled !== 'false' ? 'ENABLED (ON)' : 'DISABLED (OFF)'}</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 overflow-x-auto">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Customer Support Tickets ({supportTickets.length})</h3>
            {supportTickets.length === 0 ? (
              <p className="text-slate-400 text-xs text-center py-8">No customer support tickets found.</p>
            ) : (
              <div className="space-y-3">
                {supportTickets.map(ticket => (
                  <div key={ticket.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-lg">{ticket.ticket_code}</span>
                        <span className="font-semibold text-xs text-slate-800">{ticket.user_name} ({ticket.user_phone})</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        ticket.status === 'open' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {ticket.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 font-medium">Issue: {ticket.message}</p>

                    {ticket.admin_reply && (
                      <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
                        <strong>Admin Reply:</strong> {ticket.admin_reply}
                      </div>
                    )}

                    <div className="pt-2 flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Type official admin response..."
                        value={selectedTicket?.id === ticket.id ? replyText : ''}
                        onChange={e => {
                          setSelectedTicket(ticket);
                          setReplyText(e.target.value);
                        }}
                        className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                      />
                      <button
                        onClick={() => handleAdminTicketReply(ticket.id, 'replied')}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-1.5 rounded-xl text-xs flex items-center space-x-1"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Reply</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
