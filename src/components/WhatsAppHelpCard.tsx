import React from 'react';
import { MessageCircle, ExternalLink, ShieldCheck } from 'lucide-react';

interface WhatsAppHelpCardProps {
  settings?: any;
  className?: string;
}

export const WhatsAppHelpCard: React.FC<WhatsAppHelpCardProps> = ({ settings = {}, className = "" }) => {
  const name = settings.whatsapp_name || 'Devender Rathore';
  const number = settings.whatsapp_number || '919549425930';
  const displayMobile = settings.whatsapp_display || '+91 9549425930';
  const message = settings.whatsapp_message || 'Hello Devender Rathore, I need help with Reliance Pay.';
  const isEnabled = settings.whatsapp_enabled !== 'false';

  if (!isEnabled) return null;

  const waUrl = `https://wa.me/${number.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;

  return (
    <div 
      onClick={() => window.open(waUrl, '_blank', 'noopener,noreferrer')}
      className={`bg-gradient-to-br from-[#091711] via-[#0E241A] to-[#08150F] border border-emerald-500/40 rounded-3xl p-4 sm:p-5 shadow-[0_8px_30px_rgba(16,185,129,0.15)] relative overflow-hidden group cursor-pointer transition-all duration-300 hover:border-emerald-400/80 hover:shadow-[0_12px_40px_rgba(16,185,129,0.25)] active:scale-[0.99] ${className}`}
    >
      {/* Background Subtle Green Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        
        {/* Left Side Info */}
        <div className="flex items-start space-x-3.5">
          {/* WhatsApp Icon Circle with Floating Animation */}
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 via-green-500 to-emerald-400 p-0.5 shadow-lg shadow-emerald-500/30 flex items-center justify-center animate-pulse">
              <div className="w-full h-full bg-[#091711] rounded-[14px] flex items-center justify-center">
                {/* Official WhatsApp Logo SVG */}
                <svg className="w-7 h-7 sm:w-8 sm:h-8 fill-emerald-400 drop-shadow-[0_2px_8px_rgba(16,185,129,0.6)]" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
              </div>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-[#091711] rounded-full animate-ping" />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm sm:text-base font-black text-white tracking-wide">Official WhatsApp Help Desk</h3>
              <span className="bg-emerald-500/20 text-emerald-300 text-[9px] font-black px-2 py-0.5 rounded border border-emerald-500/30 uppercase">
                WhatsApp Support
              </span>
            </div>
            
            <p className="text-xs font-semibold text-emerald-300 mt-0.5">
              Customer Support Name: <strong className="text-white">{name}</strong>
            </p>
            <p className="text-[11px] text-slate-300/80 mt-1">Helpline: {displayMobile} • Chat with our Customer Support Team</p>
          </div>
        </div>

        {/* Right Side Action Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            window.open(waUrl, '_blank', 'noopener,noreferrer');
          }}
          className="bg-gradient-to-r from-emerald-500 via-emerald-400 to-green-500 hover:from-emerald-400 hover:to-green-400 text-slate-950 font-black px-4 py-2.5 rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/25 transition active:scale-95 text-xs tracking-wide flex-shrink-0"
        >
          <MessageCircle className="w-4 h-4 fill-slate-950" />
          <span>CHAT ON WHATSAPP</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>

      </div>
    </div>
  );
};
