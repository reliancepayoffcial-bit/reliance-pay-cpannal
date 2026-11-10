import React from 'react';
import { X, Smartphone, Share, PlusSquare, CheckCircle2, Download, ShieldCheck, ArrowRight, Monitor } from 'lucide-react';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstallNative?: () => Promise<{ success: boolean; reason?: string }>;
  isInstallable: boolean;
  isIOS: boolean;
  isInstalled: boolean;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  onInstallNative,
  isInstallable,
  isIOS,
  isInstalled,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#0F172A] border border-blue-500/30 rounded-3xl p-6 shadow-2xl text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-800 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo and Title */}
        <div className="flex items-center space-x-3 mb-5">
          <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-lg shadow-blue-500/20 border border-blue-400/30 flex-shrink-0 bg-slate-800">
            <img
              src="/pwa-192x192.png"
              alt="Reliance Pay"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-extrabold text-white">Reliance Pay</h3>
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                PWA Standalone
              </span>
            </div>
            <p className="text-xs text-slate-400">Install to your mobile home screen</p>
          </div>
        </div>

        {isInstalled ? (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 text-center my-4">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
            <h4 className="font-bold text-sm text-emerald-400">Already Installed!</h4>
            <p className="text-xs text-slate-300 mt-1">
              Reliance Pay is active and running in standalone App Mode on your device.
            </p>
            <button
              onClick={onClose}
              className="mt-4 w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition"
            >
              Continue in App
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Direct 1-Tap Install for Browsers with prompt */}
            {isInstallable && onInstallNative && (
              <div className="bg-gradient-to-r from-blue-950/60 to-slate-900 border border-blue-500/40 rounded-2xl p-4">
                <p className="text-xs text-slate-300 mb-3">
                  Click below to open the browser's official application install prompt:
                </p>
                <button
                  onClick={async () => {
                    const res = await onInstallNative();
                    if (res.success) {
                      onClose();
                    }
                  }}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-extrabold py-3.5 px-4 rounded-xl text-sm flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/30 transition transform active:scale-95"
                >
                  <Download className="w-5 h-5" />
                  <span>INSTALL RELIANCE PAY</span>
                </button>
              </div>
            )}

            {/* iOS Safari Guide */}
            {isIOS && (
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 space-y-3">
                <div className="flex items-center space-x-2 text-blue-400">
                  <Smartphone className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">iPhone / iPad Installation</span>
                </div>
                <ol className="text-xs text-slate-300 space-y-2.5 list-none">
                  <li className="flex items-start space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">1</span>
                    <span>Tap the <strong className="text-white flex items-center inline-flex mx-1"><Share className="w-3.5 h-3.5 inline text-blue-400 mr-1" /> Share</strong> button in Safari's bottom toolbar.</span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">2</span>
                    <span>Scroll down and select <strong className="text-white inline-flex items-center mx-1"><PlusSquare className="w-3.5 h-3.5 inline text-emerald-400 mr-1" /> Add to Home Screen</strong>.</span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">3</span>
                    <span>Tap <strong className="text-white">Add</strong> in top right corner. The official Reliance Pay app icon will appear on your home screen.</span>
                  </li>
                </ol>
              </div>
            )}

            {/* Android Chrome / Edge Manual Guide if prompt not fired yet */}
            {!isIOS && !isInstallable && (
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 space-y-3">
                <div className="flex items-center space-x-2 text-amber-400">
                  <Smartphone className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Android / Chrome Steps</span>
                </div>
                <ol className="text-xs text-slate-300 space-y-2.5 list-none">
                  <li className="flex items-start space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">1</span>
                    <span>Tap the <strong>three vertical dots (⋮)</strong> menu in the top-right corner of Chrome.</span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">2</span>
                    <span>Select <strong className="text-white">"Install app"</strong> or <strong className="text-white">"Add to Home screen"</strong>.</span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">3</span>
                    <span>Confirm installation. Reliance Pay will run full-screen without address bar.</span>
                  </li>
                </ol>
              </div>
            )}

            {/* PWA Benefits */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-2">
              <div className="flex items-center space-x-2 bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Zero APK storage usage</span>
              </div>
              <div className="flex items-center space-x-2 bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span>Live encrypted updates</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl text-xs transition"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
