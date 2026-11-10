import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, QrCode, Copy, CheckCircle2, AlertCircle, Clock, ChevronRight } from 'lucide-react';
import { User } from '../types';

interface KycModalProps {
  user: User;
  onClose: () => void;
  onSuccess: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const KycModal: React.FC<KycModalProps> = ({ user, onClose, onSuccess, showToast }) => {
  const [aadhaarName, setAadhaarName] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [utrId, setUtrId] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes in seconds

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSettings(data.settings);
        }
      });
  }, []);

  useEffect(() => {
    if (!showPayment) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [showPayment]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (aadhaarNumber.length !== 12 || !/^\d+$/.test(aadhaarNumber)) {
      showToast('Aadhaar Number must be exactly 12 digits.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/user/kyc/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          aadhaar_name: aadhaarName,
          aadhaar_number: aadhaarNumber,
          utr_id: utrId
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'KYC submission failed');

      showToast(data.message, 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('UPI ID copied to clipboard', 'success');
  };

  if (showPayment) {
    return (
      <div className="fixed inset-0 z-[60] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-[#0D1529] rounded-[2rem] border border-slate-800 max-w-md w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <button onClick={() => setShowPayment(false)} className="absolute top-6 right-6 text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>

          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center mx-auto border border-yellow-500/20">
              <QrCode className="w-8 h-8" />
            </div>
            
            <div>
              <h3 className="text-xl font-black text-white tracking-tight">Deposit Verification Payment</h3>
              <p className="text-xs text-slate-400 mt-1">Complete the verification payment to proceed with KYC.</p>
            </div>

            <div className="bg-[#0A0F1D] border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 font-medium">Payable Amount:</span>
                <span className="text-white font-black text-lg">₹{settings?.kyc_verification_amount || '99'}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 font-medium">Payee Name:</span>
                <span className="text-white font-bold">{settings?.kyc_payee_name || 'Reliance Finance'}</span>
              </div>
            </div>

            {settings?.recharge_qr && (
              <div className="bg-white p-4 rounded-2xl mx-auto w-fit shadow-xl border-4 border-slate-800">
                <img src={settings.recharge_qr} alt="Payment QR" className="w-48 h-48 object-contain" />
              </div>
            )}

            {settings?.recharge_upi && (
              <div className="bg-[#1A2540] border border-slate-700/60 rounded-xl p-3 flex items-center justify-between">
                <div className="flex flex-col items-start text-left">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">UPI ID</span>
                  <span className="text-sm font-mono font-bold text-white">{settings.recharge_upi}</span>
                </div>
                <button 
                  onClick={() => copyToClipboard(settings.recharge_upi)}
                  className="p-2 hover:bg-slate-700 rounded-lg transition text-slate-400 hover:text-white"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex items-center justify-center space-x-2 text-amber-500 font-bold bg-amber-500/10 py-2 rounded-xl border border-amber-500/20">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Expires in {formatTime(timeLeft)}</span>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-left">
              <p className="text-[10px] text-blue-200 leading-relaxed">
                <strong>नोट:</strong> डिपॉजिट वेरिफिकेशन का पेमेंट विड्रोल लेने वाले बैंक अकाउंट से करें। केवल पिछले 30 मिनट के अंदर किया गया पेमेंट ही मान्य होगा। पेमेंट करने के बाद UTR ID यहाँ सबमिट करें।
              </p>
            </div>

            <button
              onClick={() => setShowPayment(false)}
              className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-950 font-black py-4 rounded-2xl shadow-lg shadow-yellow-500/20 transition active:scale-95"
            >
              I HAVE PAID - PROCEED
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0D1529] rounded-[2rem] border border-slate-800 max-w-md w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Abstract Background Decoration */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl" />

        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-white transition">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20 shadow-inner">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div className="text-left">
            <h3 className="font-black text-white text-xl tracking-tight">Identity Verification</h3>
            <p className="text-xs text-slate-400 font-medium">Secure your account for withdrawals.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Aadhaar Full Name</label>
            <input
              type="text"
              required
              placeholder="Enter name as on Aadhaar"
              value={aadhaarName}
              onChange={e => setAadhaarName(e.target.value)}
              className="w-full bg-[#0A0F1D] border border-slate-800 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-blue-500/50 font-bold transition shadow-inner"
            />
          </div>

          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Aadhaar Card Number</label>
            <input
              type="text"
              required
              maxLength={12}
              placeholder="12 Digit Aadhaar Number"
              value={aadhaarNumber}
              onChange={e => setAadhaarNumber(e.target.value.replace(/\D/g, ''))}
              className="w-full bg-[#0A0F1D] border border-slate-800 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-blue-500/50 font-mono font-bold tracking-widest transition shadow-inner"
            />
          </div>

          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Verification UTR ID</label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="Enter 12-digit Payment UTR"
                value={utrId}
                onChange={e => setUtrId(e.target.value)}
                className="w-full bg-[#0A0F1D] border border-slate-800 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-blue-500/50 font-bold transition shadow-inner"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <AlertCircle className="w-4 h-4 text-slate-600" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowPayment(true)}
              className="bg-[#1A2540] hover:bg-[#222E4E] text-white font-bold py-4 rounded-2xl border border-slate-700/60 transition flex items-center justify-center space-x-2 text-sm shadow-lg shadow-slate-950/20 active:scale-95"
            >
              <QrCode className="w-4 h-4 text-yellow-500" />
              <span>Make Payment</span>
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-600/30 transition disabled:opacity-50 text-sm active:scale-95"
            >
              {loading ? 'Processing...' : 'Submit KYC'}
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800/60 text-left">
          <div className="flex items-start space-x-3 text-[10px] text-slate-400 leading-relaxed">
            <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
            <p>
              Your data is encrypted and stored securely in compliance with financial regulations. 
              Verification usually takes 1-6 hours during business periods.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
