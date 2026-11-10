import React, { useState } from 'react';
import { ShieldAlert, FileText, CheckCircle2, AlertTriangle, X, Award, ExternalLink, ShieldCheck } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'certification' | 'about' | 'terms' | 'privacy';
}

export const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, initialTab = 'certification' }) => {
  const [activeTab, setActiveTab] = useState<'certification' | 'about' | 'terms' | 'privacy'>(initialTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#131B31] border border-slate-800 rounded-3xl max-w-2xl w-full text-white shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-[#182342] to-slate-900 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Legal Documents & Compliance Disclosures</h3>
              <p className="text-xs text-slate-400">Reliance Pay Official Governance & Legal Disclosures</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex border-b border-slate-800 bg-[#0A0F1D] px-3 pt-2 space-x-2 flex-shrink-0 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('certification')}
            className={`py-2.5 px-3.5 rounded-t-xl font-bold transition flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'certification'
                ? 'bg-[#131B31] text-amber-400 border-t-2 border-amber-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>NISM Certification</span>
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`py-2.5 px-3.5 rounded-t-xl font-bold transition flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'about'
                ? 'bg-[#131B31] text-blue-400 border-t-2 border-blue-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Company Details</span>
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`py-2.5 px-3.5 rounded-t-xl font-bold transition flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'terms'
                ? 'bg-[#131B31] text-purple-400 border-t-2 border-purple-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Terms & Conditions</span>
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`py-2.5 px-3.5 rounded-t-xl font-bold transition flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'privacy'
                ? 'bg-[#131B31] text-emerald-400 border-t-2 border-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Privacy Policy</span>
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs text-slate-300 leading-relaxed">
          {/* TAB 1: NISM PROFESSIONAL CERTIFICATION & QUALIFICATION DISCLOSURE */}
          {activeTab === 'certification' && (
            <div className="space-y-5">
              <div className="bg-[#0A0F1D] border border-amber-500/30 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400">DISCLOSURE SECTION</span>
                    <h4 className="text-base font-black text-white">Professional Certification & Qualification</h4>
                  </div>
                  <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold px-2.5 py-1 rounded-full">
                    Qualification Disclosure
                  </span>
                </div>

                {/* Structured Metadata Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                  <div className="bg-[#131B31] p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Certification Name</span>
                    <p className="font-extrabold text-white mt-0.5">NISM — SEBI Investor Certification Examination</p>
                  </div>
                  <div className="bg-[#131B31] p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Issuing Institution</span>
                    <p className="font-extrabold text-white mt-0.5">National Institute of Securities Markets (NISM)</p>
                  </div>
                  <div className="bg-[#131B31] p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Examination Module</span>
                    <p className="font-extrabold text-white mt-0.5">SEBI Investor Certification Examination</p>
                  </div>
                  <div className="bg-[#131B31] p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Test Date</span>
                    <p className="font-extrabold text-slate-200 mt-0.5">April 04, 2024</p>
                  </div>
                  <div className="bg-[#131B31] p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Certificate Issuance Date</span>
                    <p className="font-extrabold text-slate-200 mt-0.5">April 12, 2024</p>
                  </div>
                  <div className="bg-[#131B31] p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Certificate Valid Till</span>
                    <p className="font-extrabold text-amber-400 mt-0.5">April 03, 2026</p>
                  </div>
                </div>

                {/* Important Validity Rule Notice */}
                <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-3.5 space-y-1">
                  <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>Certification Status Notice</span>
                  </div>
                  <p className="text-slate-200 text-[11px] leading-relaxed">
                    <strong>Historical NISM Certification — validity date shown on certificate: April 03, 2026.</strong> Current validity/renewal status should be independently verified. Certificate shown for professional qualification disclosure only.
                  </p>
                </div>
              </div>

              {/* Mandatory Legal Disclaimer */}
              <div className="bg-[#0A0F1D] border border-slate-800 rounded-2xl p-4 space-y-2.5">
                <h5 className="font-bold text-white text-xs uppercase tracking-wider text-slate-300">LEGAL DISCLAIMER</h5>
                <p className="text-slate-300 text-[11px] leading-relaxed bg-[#131B31] p-3 rounded-xl border border-slate-800/80">
                  "An NISM certification is a professional certification and should not be interpreted as a licence, registration, regulatory approval, endorsement, or authorization of Reliance Pay or any financial product offered through the platform."
                </p>
              </div>

              {/* Regulatory Affirmation & Non-Affiliation Protection */}
              <div className="bg-[#0A0F1D] border border-slate-800 rounded-2xl p-4 space-y-2.5 text-[11px]">
                <h5 className="font-bold text-slate-300 uppercase tracking-wider">REGULATORY STATUS & NON-AFFILIATION AFFIRMATION</h5>
                <ul className="space-y-1.5 text-slate-400 list-disc list-inside">
                  <li>This NISM examination certificate is <strong>NOT</strong> an RBI approval, payment gateway licence, wallet/PPI licence, or government authorization to operate Reliance Pay.</li>
                  <li>This certificate is <strong>NOT</strong> a SEBI registration or licence as an Investment Adviser, Stock Broker, or Portfolio Manager.</li>
                  <li>Possession of this examination certificate alone does not imply regulatory endorsement of any investment plan or financial product.</li>
                  <li>Reliance Pay operates independently and claims no official affiliation, partnership, or endorsement with Reliance Industries Limited, Jio, Nayara Energy, SEBI, RBI, or NISM unless a separate verified legal relationship exists.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: COMPANY & LEGAL ENTITY DETAILS */}
          {activeTab === 'about' && (
            <div className="space-y-4">
              <div className="bg-[#0A0F1D] border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
                <h4 className="text-sm font-black text-white">About Reliance Pay Financial Platform</h4>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Reliance Pay is a digital asset management and investment calculation engine designed to provide users with transparent financial growth tracking, automated dividend accrual, instant UPI deposits, and secure 24x7 payouts.
                </p>
              </div>

              <div className="bg-[#0A0F1D] border border-slate-800 rounded-2xl p-4 space-y-2">
                <h5 className="font-bold text-white text-xs">Professional Qualification Disclosure</h5>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Our platform maintains professional competence disclosures including historical NISM (SEBI Investor Certification Examination) qualifications. All certifications are disclosed strictly as educational and professional background disclosures.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: TERMS & CONDITIONS */}
          {activeTab === 'terms' && (
            <div className="space-y-3 text-xs text-slate-300">
              <h4 className="text-sm font-black text-white">Terms & Conditions of Service</h4>
              <p>
                1. Users must complete identity and account verification before initiating high-value transactions.
              </p>
              <p>
                2. All deposit requests are subject to manual or gateway verification. Unverified or fake UTR reference submissions will result in immediate account suspension.
              </p>
              <p>
                3. Investment yield calculations and dividend payouts are subject to contractual terms agreed upon at the time of purchase.
              </p>
            </div>
          )}

          {/* TAB 4: PRIVACY POLICY */}
          {activeTab === 'privacy' && (
            <div className="space-y-3 text-xs text-slate-300">
              <h4 className="text-sm font-black text-white">Privacy & Security Policy</h4>
              <p>
                Reliance Pay utilizes bank-grade 256-bit encryption for all user communications, transaction logs, and profile records. We do not sell or share personal data with third-party advertisers.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#0A0F1D] border-t border-slate-800 flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black px-6 py-2.5 rounded-xl text-xs shadow-lg transition"
          >
            Close Disclosure
          </button>
        </div>
      </div>
    </div>
  );
};
