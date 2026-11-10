import React, { useState, useEffect, createContext } from 'react';
import { User, Deposit } from './types';
import { AuthModal } from './components/AuthModal';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { UserDashboard } from './components/UserDashboard';
import { PlansView } from './components/PlansView';
import { WalletView } from './components/WalletView';
import { RewardsView } from './components/RewardsView';
import { ProfileView } from './components/ProfileView';
import { AdminPanel } from './components/AdminPanel';
import { KycModal } from './components/KycModal';
import { ScamAlertModal } from './components/ScamAlertModal';
import { RechargeSuccessModal } from './components/RechargeSuccessModal';
import { ProfitClaimCelebrationModal } from './components/ProfitClaimCelebrationModal';
import { HistoryView } from './components/HistoryView';
import { ReferralView } from './components/ReferralView';
import { AnimatedLoadingScreen } from './components/AnimatedLoadingScreen';
import { AIChatModal } from './components/AIChatModal';
import { AdminAccessModal } from './components/AdminAccessModal';
import { LiveActivityNotification } from './components/LiveActivityNotification';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { useAudioSettings } from './hooks/useAudioSettings';

export const CelebrationContext = createContext<any>(null);

export default function App() {
  const [isAppInitialized, setIsAppInitialized] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('reliance_pay_user');
    return saved ? JSON.parse(saved) : null;
  });
  const audioSettings = useAudioSettings();
  const [celebration, setCelebration] = useState<any>(null);
  const [profitClaimModalData, setProfitClaimModalData] = useState<{
    planName: string;
    amount: number;
    oldBalance?: number;
    newBalance: number;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<'home' | 'plans' | 'wallet' | 'rewards' | 'profile' | 'referral' | 'record' | 'admin'>('home');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showKycModal, setShowKycModal] = useState(false);
  const [showAdminAccessModal, setShowAdminAccessModal] = useState(false);
  const [showScamAlert, setShowScamAlert] = useState<boolean>(() => {
    return !sessionStorage.getItem('hasSeenScamAlert');
  });
  const [settings, setSettings] = useState<any>({});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [unacknowledgedDeposit, setUnacknowledgedDeposit] = useState<Deposit | null>(null);

  const fetchSettings = () => {
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => { if (data.success) setSettings(data.settings); })
      .finally(() => setIsAppInitialized(true));
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Poll for approved deposits and check if user has unacknowledged approved deposits
  useEffect(() => {
    if (!user) {
      setUnacknowledgedDeposit(null);
      return;
    }

    const checkApprovedDeposits = () => {
      fetch(`/api/wallet/${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            // Refresh user profile details if balance changed
            if (data.user && (data.user.balance !== user.balance || data.user.deposited !== user.deposited)) {
              setUser(prev => prev ? { ...prev, balance: data.user.balance, deposited: data.user.deposited } : null);
            }

            if (Array.isArray(data.deposits)) {
              const approvedDeposits: Deposit[] = data.deposits.filter((d: Deposit) => d.status === 'approved');
              const ackSaved = localStorage.getItem(`acknowledged_deposit_ids_${user.id}`);
              const ackIds: number[] = ackSaved ? JSON.parse(ackSaved) : [];
              
              const unack = approvedDeposits.find(d => !ackIds.includes(d.id));
              if (unack) {
                setUnacknowledgedDeposit(unack);
              }
            }
          }
        })
        .catch(() => {});
    };

    checkApprovedDeposits();
    const interval = setInterval(checkApprovedDeposits, 7000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const handleAcknowledgeDeposit = (depositId: number) => {
    if (user) {
      const ackSaved = localStorage.getItem(`acknowledged_deposit_ids_${user.id}`);
      const ackIds: number[] = ackSaved ? JSON.parse(ackSaved) : [];
      if (!ackIds.includes(depositId)) {
        ackIds.push(depositId);
        localStorage.setItem(`acknowledged_deposit_ids_${user.id}`, JSON.stringify(ackIds));
      }
    }
    setUnacknowledgedDeposit(null);
  };

  useEffect(() => {
    if (user) {
      localStorage.setItem('reliance_pay_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('reliance_pay_user');
    }
  }, [user]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const [isEntering, setIsEntering] = useState(false);
  const [pendingUser, setPendingUser] = useState<User | null>(null);

  const handleLogout = () => {
    setUser(null);
    setPendingUser(null);
    setIsAdminMode(false);
    setActiveTab('home');
    localStorage.removeItem('reliance_pay_user');
    showToast('Logged out successfully', 'success');
  };

  const handleTransitionFinish = () => {
    if (pendingUser) {
      setUser(pendingUser);
      setPendingUser(null);
      setIsEntering(false);
      showToast(`Welcome back, ${pendingUser.name}!`);
    }
  };

  if (!user || isEntering) {
    return (
      <div className="bg-slate-50 min-h-screen text-slate-900">
        {isEntering && (
          <AnimatedLoadingScreen 
            isReady={true} 
            key="login-transition" 
            onFinish={handleTransitionFinish}
          />
        )}
        {!isEntering && (
          <AuthModal 
            settings={settings}
            onLoginSuccess={u => { 
              setPendingUser(u);
              setIsEntering(true);
            }} 
          />
        )}
        {toast && (
          <div className="fixed top-6 right-6 z-50 bg-white border border-slate-200 text-slate-900 px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-3">
            {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-red-400" />}
            <span className="text-xs font-semibold">{toast.message}</span>
          </div>
        )}
      </div>
    );
  }

  const handleRefreshBalance = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/wallet/${user.id}`);
      const data = await res.json();
      if (data.success && data.user) {
        setUser(prev => prev ? { ...prev, balance: data.user.balance } : null);
        showToast('Wallet balance refreshed successfully!', 'success');
      }
    } catch (_) {}
  };

  return (
    <CelebrationContext.Provider value={{ celebration, setCelebration, audioSettings, setProfitClaimModalData }}>
      {/* 3D Animated Loading Screen */}
      <AnimatedLoadingScreen isReady={isAppInitialized} />

      <div className="min-h-screen bg-[#0A0F1D] text-white font-sans antialiased selection:bg-blue-500 selection:text-white">
        {profitClaimModalData && (
          <ProfitClaimCelebrationModal
            isOpen={!!profitClaimModalData}
            planName={profitClaimModalData.planName}
            amount={profitClaimModalData.amount}
            oldBalance={profitClaimModalData.oldBalance}
            newBalance={profitClaimModalData.newBalance}
            onClose={() => {
              if (user && profitClaimModalData.newBalance !== undefined) {
                setUser({ ...user, balance: profitClaimModalData.newBalance });
              }
              showToast(`+₹${profitClaimModalData.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} credited to wallet successfully!`, 'success');
              setProfitClaimModalData(null);
            }}
          />
        )}
        {celebration && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center animate-pulse">
              <h2 className="text-2xl font-black text-white mb-2">🎉 CONGRATULATIONS!</h2>
              <p className="text-slate-300 mb-6">{celebration.message}</p>
              <button 
                onClick={() => { setCelebration(null); }}
                className="bg-pink-600 text-white font-bold py-3 px-6 rounded-2xl w-full"
              >
                {celebration.buttonText || 'Continue'}
              </button>
            </div>
          </div>
        )}
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-white border border-slate-200 text-slate-900 px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 animate-bounce">
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <AlertCircle className="w-5 h-5 text-red-500" />}
          <span className="text-xs font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        user={user}
        settings={settings}
        onLogout={handleLogout}
        onOpenWallet={() => setActiveTab('wallet')}
        onOpenProfile={() => setActiveTab('profile')}
        onSwitchAdmin={() => setIsAdminMode(!isAdminMode)}
        isAdminMode={isAdminMode}
        onRefreshBalance={handleRefreshBalance}
        onOpenAdminAccess={() => setShowAdminAccessModal(true)}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-4">
        {isAdminMode ? (
          <AdminPanel 
            adminUser={user} 
            showToast={showToast} 
            onExitAdmin={() => setIsAdminMode(false)}
          />
        ) : (
          <>
            {activeTab === 'home' && (
              <UserDashboard
                user={user}
                settings={settings}
                onNavigate={tab => setActiveTab(tab as any)}
                onOpenDeposit={() => setActiveTab('wallet')}
                onOpenWithdraw={() => setActiveTab('wallet')}
                onOpenCheckIn={() => setActiveTab('rewards')}
                onOpenScratch={() => setActiveTab('rewards')}
                onOpenKyc={() => setShowKycModal(true)}
                onOpenScamAlert={() => setShowScamAlert(true)}
                onUpdateUser={u => setUser(u)}
                showToast={showToast}
              />
            )}
            {activeTab === 'plans' && <PlansView user={user} settings={settings} onUpdateUser={u => setUser(u)} showToast={showToast} />}
            {activeTab === 'wallet' && <WalletView user={user} onUpdateUser={u => setUser(u)} showToast={showToast} />}
            {activeTab === 'rewards' && <RewardsView user={user} onUpdateUser={u => setUser(u)} showToast={showToast} />}
            {activeTab === 'referral' && <ReferralView user={user} showToast={showToast} />}
            {activeTab === 'profile' && (
              <ProfileView 
                user={user} 
                settings={settings}
                onUpdateUser={u => setUser(u)} 
                onLogout={handleLogout} 
                showToast={showToast} 
                onOpenKyc={() => setShowKycModal(true)}
                onOpenDeposit={() => setActiveTab('wallet')}
                onOpenWithdraw={() => setActiveTab('wallet')}
                onSwitchAdmin={() => setIsAdminMode(!isAdminMode)}
                onOpenChat={() => setIsChatOpen(true)}
                onOpenAdminAccess={() => setShowAdminAccessModal(true)}
              />
            )}
            {activeTab === 'record' && <HistoryView user={user} showToast={showToast} />}
          </>
        )}
      </main>

      {/* Mobile Bottom Navigation matching screenshot */}
      {!isAdminMode && (
        <BottomNav
          activeTab={activeTab}
          setActiveTab={tab => setActiveTab(tab as any)}
        />
      )}

      {/* Security Alert / Scam Alert Modal */}
      <ScamAlertModal
        isOpen={showScamAlert}
        settings={settings}
        onClose={() => {
          setShowScamAlert(false);
          sessionStorage.setItem('hasSeenScamAlert', 'true');
        }}
      />

      {/* KYC Modal */}
      {showKycModal && (
        <KycModal
          user={user}
          onClose={() => setShowKycModal(false)}
          onSuccess={() => {
            fetch(`/api/user/profile/${user.id}`)
              .then(res => res.json())
              .then(data => { if (data.success) setUser(data.user); });
          }}
          showToast={showToast}
        />
      )}

      {/* Recharge / Deposit Success Soundbox Voice Alert Modal */}
      {unacknowledgedDeposit && (
        <RechargeSuccessModal
          deposit={unacknowledgedDeposit}
          onClose={() => handleAcknowledgeDeposit(unacknowledgedDeposit.id)}
        />
      )}

      {/* Floating AI Smart Chat Assistant Button */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 bg-gradient-to-tr from-blue-600 via-sky-500 to-amber-500 hover:scale-105 p-3 sm:p-3.5 rounded-full shadow-[0_4px_25px_rgba(56,189,248,0.45)] border-2 border-amber-400/60 flex items-center space-x-2 text-white font-bold text-xs transition group cursor-pointer"
        title="Reliance Pay AI Smart Assistant"
      >
        <div className="relative w-7 h-7 flex items-center justify-center">
          <img src="/assets/reliance_pay_3d_loader_logo.png" alt="AI Assistant" className="w-full h-full object-contain animate-pulse" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 border border-slate-100 rounded-full animate-ping" />
        </div>
        <span className="hidden xs:inline pr-1 text-amber-100 font-extrabold tracking-wide">AI Assistant</span>
      </button>

      {/* AI Smart Chat Assistant Modal */}
      <AIChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        user={user}
      />

      {/* Admin Panel Access Verification Modal */}
      {showAdminAccessModal && (
        <AdminAccessModal
          currentUser={user}
          isOpen={showAdminAccessModal}
          onClose={() => setShowAdminAccessModal(false)}
          onSuccess={(adminUser) => {
            setUser(adminUser);
            setIsAdminMode(true);
            showToast(`Admin Access Granted: ${adminUser.name} (${adminUser.role})`, 'success');
          }}
          showToast={showToast}
        />
      )}

      {/* Floating Bottom Live Activity Notification Toast */}
      {!isAdminMode && <LiveActivityNotification />}
    </div>
    </CelebrationContext.Provider>
  );
}
