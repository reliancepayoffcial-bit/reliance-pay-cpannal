import React, { useEffect } from 'react';
import { ShieldAlert, AlertTriangle, Check, X } from 'lucide-react';

interface ScamAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings?: any;
}

export const ScamAlertModal: React.FC<ScamAlertModalProps> = ({ isOpen, onClose, settings }) => {
  const appName = settings?.app_name || 'Reliance Pay';
  // Lock background page scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-[#131B31] border-2 border-amber-500/50 rounded-3xl max-w-md sm:max-w-lg w-full text-white shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh] sm:max-h-[90vh]">
        {/* POPUP HEADER */}
        <div className="bg-gradient-to-r from-amber-950/90 via-[#1A233D] to-amber-950/90 border-b border-amber-500/30 p-3.5 sm:p-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40">
              <AlertTriangle className="w-4 h-4 text-amber-400 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base text-amber-400 tracking-wide flex items-center space-x-1.5">
                <span>⚠️ Security Alert</span>
              </h3>
              <p className="text-[10px] text-slate-300 font-medium">Protect Your {appName} Account</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Security Alert"
            className="p-1.5 bg-slate-800/80 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* POPUP CONTENT - SCAM ALERT POSTER */}
        <div className="p-3 sm:p-4 overflow-y-auto flex flex-col items-center justify-center flex-1 bg-[#0A0F1D]/80">
          <div className="relative w-full flex justify-center items-center rounded-2xl overflow-hidden bg-slate-950/50 border border-slate-800 p-1">
            <img
              src="/public/assets/aistudio/file_00000000ce2c820ba540511cb2ffce3f_59ebb85a.png"
              alt={`${appName} Scam Alert and Security Warning`}
              className="max-w-[92vw] max-h-[60vh] sm:max-h-[65vh] object-contain rounded-xl w-auto h-auto transition-all"
              loading="eager"
            />
          </div>
        </div>

        {/* CONFIRM BUTTON FOOTER */}
        <div className="p-3.5 sm:p-4 bg-[#0D1529] border-t border-slate-800/80 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black py-3.5 px-6 rounded-2xl shadow-xl shadow-amber-400/20 text-sm transition active:scale-[0.98] flex items-center justify-center space-x-2"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Confirm</span>
          </button>
        </div>
      </div>
    </div>
  );
};
