import React, { useState, useEffect } from 'react';
import { 
  Phone, Lock, User as UserIcon, KeyRound, ArrowRight, Eye, EyeOff, 
  Globe, ShieldCheck, CheckCircle2, AlertCircle, HelpCircle, X, MessageSquare, ChevronRight, Hash
} from 'lucide-react';
import { LegalModal } from './LegalModal';

interface AuthModalProps {
  onLoginSuccess: (user: any) => void;
  settings?: any;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onLoginSuccess, settings = {} }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  
  // Login & Registration state
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [withdrawalPin, setWithdrawalPin] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [invitedBy, setInvitedBy] = useState<string | null>(null);
  
  // Toggles & checkboxes
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Modals
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotMobile, setForgotMobile] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Load remembered mobile if available
  useEffect(() => {
    const savedMobile = localStorage.getItem('reliance_pay_remembered_mobile');
    if (savedMobile) {
      setMobile(savedMobile);
    }
  }, []);

  // Extract referral code dynamically from URL query params (e.g. ?ref=RP546010)
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const queryRef = urlParams.get('ref') || urlParams.get('referral');
      const savedRef = sessionStorage.getItem('reliance_pay_ref');
      const effectiveRef = queryRef || savedRef;

      if (effectiveRef) {
        setReferralCode(effectiveRef.toUpperCase().trim());
        setInvitedBy(effectiveRef.toUpperCase().trim());
        sessionStorage.setItem('reliance_pay_ref', effectiveRef.toUpperCase().trim());
        setIsLogin(false); // Switch to registration on referral link
      }
    } catch {
      // Non-browser fallback
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Clean and validate mobile
    const cleanMobile = mobile.replace(/\D/g, '').trim();
    if (cleanMobile.length !== 10) {
      setError(lang === 'hi' ? 'कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें' : 'Mobile number must contain exactly 10 digits');
      return;
    }

    if (password.length < 6) {
      setError(lang === 'hi' ? 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए' : 'Password must be at least 6 characters long');
      return;
    }

    if (!isLogin) {
      if (!name.trim()) {
        setError(lang === 'hi' ? 'कृपया अपना पूरा नाम दर्ज करें' : 'Full Name cannot be empty');
        return;
      }
      if (password !== confirmPassword) {
        setError(lang === 'hi' ? 'पासवर्ड और कन्फर्म पासवर्ड मेल नहीं खाते' : 'Passwords do not match');
        return;
      }
      if (!agreeTerms) {
        setError(lang === 'hi' ? 'कृपया नियम और शर्तों को स्वीकार करें' : 'Terms & Conditions checkbox must be selected');
        return;
      }
    }

    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin 
        ? { mobile: cleanMobile, password } 
        : { mobile: cleanMobile, name: name.trim(), password, referral_code: referralCode.trim() };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || (lang === 'hi' ? 'प्रमाणीकरण विफल रहा' : 'Authentication failed'));

      // Remember mobile if requested (Security note: mobile is not sensitive, only password)
      if (rememberMe) {
        localStorage.setItem('reliance_pay_remembered_mobile', cleanMobile);
      } else {
        localStorage.removeItem('reliance_pay_remembered_mobile');
      }

      // Clear sensitive credentials immediately from memory
      setPassword('');
      setConfirmPassword('');
      setWithdrawalPin('');

      onLoginSuccess(data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotMobile.trim()) return;
    setForgotSuccess(true);
  };

  // Translations
  const t = {
    tagline: 'Secure • Smart • Trusted',
    slogan: lang === 'hi' ? 'आज निवेश करें... कल समृद्ध बनें...' : 'Invest Today... Grow Tomorrow...',
    loginTab: lang === 'hi' ? 'लॉगिन' : 'Login',
    registerTab: lang === 'hi' ? 'रजिस्टर' : 'Register',
    phonePlaceholder: lang === 'hi' ? 'मोबाइल नंबर दर्ज करें' : 'Enter Phone Number',
    passwordPlaceholder: lang === 'hi' ? 'पासवर्ड दर्ज करें' : 'Enter Password',
    confirmPasswordPlaceholder: lang === 'hi' ? 'पासवर्ड दोबारा दर्ज करें' : 'Re-enter Password',
    withdrawalPinPlaceholder: lang === 'hi' ? 'निकासी पिन (डेमो 4-अंक)' : 'Withdrawal PIN (UI Demo Only)',
    fullNamePlaceholder: lang === 'hi' ? 'पूरा नाम दर्ज करें' : 'Enter Full Name',
    referralPlaceholder: lang === 'hi' ? 'रेफरल कोड (वैकल्पिक)' : 'Referral Number (Optional)',
    rememberMe: lang === 'hi' ? 'मुझे याद रखें' : 'Remember me',
    forgotPassword: lang === 'hi' ? 'पासवर्ड भूल गए?' : 'Forget my password?',
    loginBtn: lang === 'hi' ? 'लॉगिन करें' : 'Login',
    registerBtn: lang === 'hi' ? 'खाता बनाएं' : 'CREATE ACCOUNT',
    termsPrefix: lang === 'hi' ? 'लॉगिन करके आप सहमत हैं' : 'By logging in you agree to our',
    termsLink: lang === 'hi' ? 'नियम और शर्तें' : 'Terms & Conditions',
    termsAgreeRegister: lang === 'hi' ? 'मैं नियम व शर्तों और गोपनीयता नीति से सहमत हूँ' : 'I agree to the Terms & Conditions and Privacy Policy',
    noAccount: lang === 'hi' ? 'खाता नहीं है?' : "I don't have an account",
    createAccountLink: lang === 'hi' ? 'नया खाता बनाएं' : 'Create New Account',
    haveAccount: lang === 'hi' ? 'पहले से खाता है? लॉगिन करें' : 'Already have an account? Login',
    referralBonusAlert: lang === 'hi' ? 'रेफरल लागू: ₹50 वेलकम बोनस' : 'Referral applied: Welcome Bonus eligible',
    pleaseWait: lang === 'hi' ? 'कृपया प्रतीक्षा करें...' : 'Please wait...'
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden font-sans selection:bg-blue-600 selection:text-white bg-slate-50">
      
      {/* 1. Full-Screen Corporate Glass-Building Architectural Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* The Building Background from Reference Asset */}
        <img 
          src="./assets/aistudio/file_00000000e63c81f5b23df2c0dd1210dd_6260351e.png" 
          alt="Reliance Corporate Architecture" 
          className="w-full h-full object-cover object-center filter brightness-[1.08] contrast-[1.01]"
        />
        
        {/* Subtle soft white and light-blue gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/60 via-blue-50/40 to-white/60" />
        
        {/* Soft light blue blur around the four edges (Elegant Vignette Blur effect) */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Top Edge Blur - Soft White/Blue focus */}
          <div className="absolute top-0 inset-x-0 h-[22vh] backdrop-blur-[8px] bg-white/30 [mask-image:linear-gradient(to_bottom,black_10%,transparent)]" />
          {/* Bottom Edge Blur */}
          <div className="absolute bottom-0 inset-x-0 h-[22vh] backdrop-blur-[8px] bg-white/30 [mask-image:linear-gradient(to_top,black_10%,transparent)]" />
          {/* Left Edge Blur */}
          <div className="absolute left-0 inset-y-0 w-[22vw] backdrop-blur-[8px] bg-white/30 [mask-image:linear-gradient(to_right,black_10%,transparent)]" />
          {/* Right Edge Blur */}
          <div className="absolute right-0 inset-y-0 w-[22vw] backdrop-blur-[8px] bg-white/30 [mask-image:linear-gradient(to_left,black_10%,transparent)]" />
        </div>

        {/* Center area clarity enhancement - light radial fade to focus center area */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(255,255,255,0.4)_100%)] pointer-events-none" />
      </div>

      {/* 2. Top-Right Language Selector */}
      <header className="relative z-30 w-full max-w-md mx-auto pt-4 px-4 sm:px-6 flex justify-end">
        <button
          type="button"
          onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-white text-slate-800 text-xs font-bold shadow-[0_4px_16px_rgba(0,0,0,0.15)] border border-slate-100 hover:bg-slate-50 transition active:scale-95 cursor-pointer"
          title="Switch Language / भाषा बदलें"
        >
          <Globe className="w-3.5 h-3.5 text-[#1E60F2]" />
          <span>{lang === 'en' ? 'English / हिन्दी' : 'हिन्दी / English'}</span>
          <span className="text-[10px] text-slate-400">▾</span>
        </button>
      </header>

      {/* 3. Main Center Content Container */}
      <main className="relative z-20 w-full max-w-md mx-auto px-4 pt-1 pb-6 flex-1 flex flex-col justify-center items-center">
        
        {/* BRANDING SECTION AT THE TOP */}
        <div className="text-center w-full mb-3 flex flex-col items-center">
          
          {/* New Circular Reliance Pay Logo */}
          <div className="mb-4 transition-transform duration-300 hover:scale-105">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white p-1 shadow-[0_8px_25px_rgba(30,96,242,0.35)] border-2 border-blue-500/20 overflow-hidden flex items-center justify-center">
              <img 
                src="./assets/reliance_pay_header_logo.png" 
                alt="Reliance Pay" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Reliance Pay 3D Glossy Pill Badge */}
          <div className="mb-2 shadow-[0_6px_25px_rgba(225,29,42,0.35)] rounded-full transition-transform duration-200 hover:scale-[1.02]">
            <img 
              src="./assets/reliance_pay_pill_badge.png" 
              alt="Reliance Pay" 
              className="h-9 sm:h-10 w-auto object-contain"
            />
          </div>

          {/* Tagline with Divider Lines: — Secure • Smart • Trusted — */}
          <div className="flex items-center justify-center space-x-2 text-[11px] sm:text-xs font-semibold text-blue-100 tracking-wider mb-2.5">
            <span className="w-8 sm:w-12 h-[1px] bg-blue-200/50" />
            <span>{t.tagline}</span>
            <span className="w-8 sm:w-12 h-[1px] bg-blue-200/50" />
          </div>

          {/* Glass-effect Capsule: "Invest Today... Grow Tomorrow..." with White Blue Border */}
          <div className="inline-flex items-center justify-center px-5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border-[1.5px] border-blue-300/40 shadow-[0_0_20px_rgba(30,144,255,0.25)] relative overflow-hidden group">
            {/* White-blue border glow effect */}
            <div className="absolute inset-0 border border-white/30 rounded-full" />
            <span className="text-xs sm:text-[13px] font-semibold text-white tracking-wide relative z-10">
              {t.slogan}
            </span>
          </div>

        </div>

        {/* 4. LOGIN AND REGISTRATION CARD (Pure White Translucent Card with Rounded Corners) */}
        <div className="w-full bg-white/98 backdrop-blur-md rounded-[32px] sm:rounded-[38px] shadow-[0_20px_60px_rgba(10,38,110,0.35)] px-6 pt-6 pb-7 sm:px-8 sm:pt-7 sm:pb-8 text-slate-900 border border-white/60 relative">
          
          {/* Two Tabs Inside the Card: LOGIN | REGISTER */}
          <div className="flex border-b border-slate-100 pb-3 mb-6 relative">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setError(''); }}
              className="flex-1 text-center relative py-1 focus:outline-none transition group cursor-pointer"
            >
              <span className={`text-lg sm:text-xl transition ${
                isLogin ? 'font-bold text-[#1E60F2]' : 'font-semibold text-slate-400 hover:text-slate-600'
              }`}>
                {t.loginTab}
              </span>
              {isLogin && (
                <div className="absolute -bottom-3 inset-x-0 mx-auto w-20 sm:w-24 h-1 bg-[#1E60F2] rounded-full shadow-sm shadow-blue-500/40" />
              )}
            </button>

            <button
              type="button"
              onClick={() => { setIsLogin(false); setError(''); }}
              className="flex-1 text-center relative py-1 focus:outline-none transition group cursor-pointer"
            >
              <span className={`text-lg sm:text-xl transition ${
                !isLogin ? 'font-bold text-[#1E60F2]' : 'font-semibold text-slate-400 hover:text-slate-600'
              }`}>
                {t.registerTab}
              </span>
              {!isLogin && (
                <div className="absolute -bottom-3 inset-x-0 mx-auto w-20 sm:w-24 h-1 bg-[#1E60F2] rounded-full shadow-sm shadow-blue-500/40" />
              )}
            </button>
          </div>

          {/* Referral Banner Alert if coming via invite */}
          {invitedBy && !isLogin && (
            <div className="mb-4 bg-blue-50 border border-blue-200 rounded-xl p-2.5 flex items-center space-x-2 text-xs text-blue-800">
              <CheckCircle2 className="w-4 h-4 text-[#1E60F2] flex-shrink-0" />
              <span>{t.referralBonusAlert}: <strong className="font-mono text-blue-950 font-bold">{invitedBy}</strong></span>
            </div>
          )}

          {/* Validation Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 flex items-start space-x-2 text-xs text-red-700 animate-shake">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Form inside Card */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* REGISTRATION ONLY: 1. Full Name */}
            {!isLogin && (
              <div>
                <div className="relative flex items-center border-b border-slate-200 focus-within:border-[#1E60F2] pb-2.5 transition-colors">
                  <UserIcon className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder={t.fullNamePlaceholder}
                    className="w-full bg-transparent text-slate-900 placeholder-slate-400 font-medium text-sm focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Mobile Number Field: +91 | Enter Phone Number */}
            <div>
              <div className="relative flex items-center border-b border-slate-200 focus-within:border-[#1E60F2] pb-2.5 transition-colors">
                <span className="text-slate-900 font-bold text-base mr-2 flex-shrink-0 select-none">
                  +91
                </span>
                <span className="text-slate-300 font-light text-base mr-2.5 select-none">|</span>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={mobile}
                  onChange={e => setMobile(e.target.value.replace(/\D/g, ''))}
                  placeholder={t.phonePlaceholder}
                  className="w-full bg-transparent text-slate-900 placeholder-slate-400 font-medium text-sm focus:outline-none tracking-wide"
                />
              </div>
            </div>

            {/* Password Field with Show/Hide Eye Toggle */}
            <div>
              <div className="relative flex items-center border-b border-slate-200 focus-within:border-[#1E60F2] pb-2.5 transition-colors">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={t.passwordPlaceholder}
                  className="w-full bg-transparent text-slate-900 placeholder-slate-400 font-medium text-sm focus:outline-none pr-8"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 text-slate-400 hover:text-slate-600 p-1 focus:outline-none transition cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* REGISTRATION ONLY: 4. Re-enter Password (Confirm Password) */}
            {!isLogin && (
              <div>
                <div className="relative flex items-center border-b border-slate-200 focus-within:border-[#1E60F2] pb-2.5 transition-colors">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder={t.confirmPasswordPlaceholder}
                    className="w-full bg-transparent text-slate-900 placeholder-slate-400 font-medium text-sm focus:outline-none pr-8"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-0 text-slate-400 hover:text-slate-600 p-1 focus:outline-none transition cursor-pointer"
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            {/* REGISTRATION ONLY: 5. Withdrawal Password / PIN (UI DEMO ONLY) */}
            {!isLogin && (
              <div>
                <div className="relative flex items-center border-b border-slate-200 focus-within:border-[#1E60F2] pb-2.5 transition-colors">
                  <Hash className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
                  <input
                    type="password"
                    maxLength={6}
                    value={withdrawalPin}
                    onChange={e => setWithdrawalPin(e.target.value.replace(/\D/g, ''))}
                    placeholder={t.withdrawalPinPlaceholder}
                    className="w-full bg-transparent text-slate-900 placeholder-slate-400 font-medium text-sm focus:outline-none pr-16"
                  />
                  <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 uppercase select-none">
                    UI Demo
                  </span>
                </div>
                <p className="text-[9px] text-slate-400 mt-1">
                  * Prototype demo field – never collected or transmitted.
                </p>
              </div>
            )}

            {/* REGISTRATION ONLY: 6. Referral Number (Optional) */}
            {!isLogin && (
              <div>
                <div className="relative flex items-center border-b border-slate-200 focus-within:border-[#1E60F2] pb-2.5 transition-colors">
                  <KeyRound className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
                  <input
                    type="text"
                    value={referralCode}
                    onChange={e => setReferralCode(e.target.value.toUpperCase())}
                    placeholder={t.referralPlaceholder}
                    className="w-full bg-transparent text-slate-900 placeholder-slate-400 font-mono font-bold text-sm uppercase focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* LOGIN ONLY: Remember Me Checkbox & Forgot Password Link */}
            {isLogin ? (
              <div className="flex items-center justify-between pt-0.5 text-xs sm:text-sm">
                <label className="flex items-center space-x-2 text-slate-800 font-medium cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-[#1E60F2] focus:ring-blue-500 border-slate-300 cursor-pointer"
                  />
                  <span>{t.rememberMe}</span>
                </label>
                
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[#1E60F2] hover:text-blue-700 font-bold transition flex items-center cursor-pointer"
                >
                  <span>{t.forgotPassword}</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </button>
              </div>
            ) : (
              /* REGISTRATION ONLY: 7. Terms & Conditions checkbox */
              <div className="pt-0.5">
                <label className="flex items-start space-x-2 text-xs text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={e => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded text-[#1E60F2] focus:ring-blue-500 border-slate-300 cursor-pointer flex-shrink-0"
                  />
                  <span>{t.termsAgreeRegister}</span>
                </label>
              </div>
            )}

            {/* Prominent Large Blue Button (Login → / CREATE ACCOUNT →) */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#1456E8] via-[#1E60F2] to-[#2563EB] hover:from-[#1149c7] hover:to-[#1d4ed8] text-white font-bold py-3.5 sm:py-4 px-6 rounded-full shadow-[0_12px_28px_rgba(24,91,235,0.4)] text-base tracking-wide active:scale-[0.98] transition duration-200 flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
              >
                <span>{loading ? t.pleaseWait : isLogin ? t.loginBtn : t.registerBtn}</span>
                <ArrowRight className="w-5 h-5 ml-1" />
              </button>
            </div>
          </form>

          {/* Terms & Conditions Link */}
          <div className="text-center mt-4 text-[11px] sm:text-xs text-slate-500">
            <span>{t.termsPrefix} </span>
            <button
              type="button"
              onClick={() => setShowTermsModal(true)}
              className="text-[#1E60F2] hover:text-blue-700 font-bold underline cursor-pointer"
            >
              {t.termsLink}
            </button>
          </div>

          {/* Account Switching Section */}
          <div className="text-center mt-3 pt-2">
            <p className="text-xs text-slate-600 font-medium">
              {isLogin ? t.noAccount : t.haveAccount}
            </p>
            {isLogin ? (
              <button
                type="button"
                onClick={() => { setIsLogin(false); setError(''); }}
                className="text-[#1E60F2] hover:text-blue-700 font-bold text-sm sm:text-base mt-0.5 inline-flex items-center cursor-pointer transition group"
              >
                <span>{t.createAccountLink}</span>
                <ChevronRight className="w-4 h-4 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => { setIsLogin(true); setError(''); }}
                className="text-[#1E60F2] hover:text-blue-700 font-bold text-sm sm:text-base mt-0.5 inline-flex items-center cursor-pointer transition group"
              >
                <span>{t.loginBtn}</span>
                <ChevronRight className="w-4 h-4 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}

            {/* Security Footer Text */}
            <div className="mt-4 pt-3 border-t border-slate-50 text-[10px] sm:text-[11px] text-slate-400 font-medium flex flex-col items-center justify-center">
              <p>Your data 100% safe | power by <span className="text-[#FF0000] font-black uppercase">Reliance pay</span></p>
            </div>
          </div>

        </div>

      </main>

      {/* 5. Elegant Blue Wave Design at the Bottom (Matching Reference Screenshot) */}
      <div className="relative z-20 w-full overflow-hidden leading-none pointer-events-none mt-auto">
        <img 
          src="/assets/reliance_bottom_wave.png" 
          alt="Reliance Blue Wave Ribbon" 
          className="w-full h-auto min-h-[50px] max-h-[85px] object-cover object-bottom"
        />
      </div>

      {/* Terms & Conditions Legal Modal */}
      {showTermsModal && (
        <LegalModal
          isOpen={showTermsModal}
          onClose={() => setShowTermsModal(false)}
          initialTab="terms"
        />
      )}

      {/* Forgot Password Recovery Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-sm w-full p-6 text-slate-900 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-600 via-sky-400 to-blue-600" />
            
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <HelpCircle className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900">Password Recovery</h3>
              </div>
              <button 
                onClick={() => { setShowForgotModal(false); setForgotSuccess(false); }} 
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {forgotSuccess ? (
              <div className="text-center py-4 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-sm text-slate-900">Recovery Request Received</h4>
                <p className="text-xs text-slate-600">
                  Password reset assistance has been initiated for your registered number. Our 24/7 support will assist you.
                </p>
                {settings.whatsapp_link && (
                  <a
                    href={settings.whatsapp_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs mt-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Instant WhatsApp Reset</span>
                  </a>
                )}
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Enter your registered Reliance Pay mobile number. Our system will generate secure reset verification instructions.
                </p>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Registered Mobile Number</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={forgotMobile}
                    onChange={e => setForgotMobile(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 font-mono text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white font-bold py-3 rounded-xl text-xs shadow-lg shadow-blue-600/30 transition cursor-pointer"
                >
                  Submit Reset Request
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
