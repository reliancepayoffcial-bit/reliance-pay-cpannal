import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, X, RefreshCw, Copy, Check, Headphones, ShieldCheck, Sparkles, MessageSquare, AlertCircle, Clock, Volume2, VolumeX } from 'lucide-react';
import { User } from '../types';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  isEscalatedSuggested?: boolean;
}

interface Ticket {
  id: number;
  ticket_code: string;
  subject: string;
  message: string;
  status: string;
  admin_reply?: string;
  created_at: string;
}

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

// Web Audio API sound synthesizers for instant, low-latency audio feedback
const playSendSound = (isMuted: boolean) => {
  if (isMuted) return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.08);
  } catch (_) {}
};

const playReceiveSound = (isMuted: boolean) => {
  if (isMuted) return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // Pleasant double chime: C5 -> E5
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, ctx.currentTime);
    gain1.gain.setValueAtTime(0.06, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.12);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(659.25, ctx.currentTime + 0.06);
    gain2.gain.setValueAtTime(0.08, ctx.currentTime + 0.06);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.06);
    osc2.stop(ctx.currentTime + 0.22);
  } catch (_) {}
};

export const AIChatModal: React.FC<AIChatModalProps> = ({ isOpen, onClose, user }) => {
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('reliance_pay_chat_history');
    if (saved) {
      try { return JSON.parse(saved); } catch (_) {}
    }
    return [{
      id: 'welcome-1',
      sender: 'ai',
      text: 'नमस्कार! मैं **Reliance Pay AI Assistant** हूँ।\n\nमैं आपकी क्या मदद कर सकता हूँ? नीचे दिए गए सुझाव चुन सकते हैं या अपना सवाल लिख सकते हैं।',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');
  const [userTickets, setUserTickets] = useState<Ticket[]>([]);
  const [ticketSuccess, setTicketSuccess] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    return localStorage.getItem('reliance_pay_chat_muted') === 'true';
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    'Recharge कैसे करें?',
    'Paisa kaise nikale (Withdrawal)?',
    'Daily Dividend Income Claim',
    'Referral Commission Rule',
    'Connect to Human Support'
  ];

  const toggleMute = () => {
    setIsMuted(prev => {
      const next = !prev;
      localStorage.setItem('reliance_pay_chat_muted', String(next));
      return next;
    });
  };

  useEffect(() => {
    localStorage.setItem('reliance_pay_chat_history', JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (user?.id && isOpen) {
      fetch(`/api/support/tickets/${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.tickets)) {
            setUserTickets(data.tickets);
          }
        })
        .catch(() => {});
    }
  }, [user?.id, isOpen, ticketSuccess]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMsgId = `user-${Date.now()}`;
    const userMsg: Message = {
      id: userMsgId,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    playSendSound(isMuted);
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          userId: user?.id
        })
      });

      const data = await res.json();
      if (data.success) {
        const aiMsg: Message = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: data.reply,
          timestamp: data.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isEscalatedSuggested: data.isEscalatedSuggested
        };
        playReceiveSound(isMuted);
        setMessages(prev => [...prev, aiMsg]);
      } else {
        throw new Error(data.error || 'Response error');
      }
    } catch (err) {
      const errorMsg: Message = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: 'माफ़ कीजिये, नेटवर्क इशू के कारण जवाब नहीं मिल सका। कृपया पुनः प्रयास करें या सपोर्ट टीम से संपर्क करें।',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isEscalatedSuggested: true
      };
      playReceiveSound(isMuted);
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    const initial: Message[] = [{
      id: `welcome-${Date.now()}`,
      sender: 'ai',
      text: 'नमस्कार! बातचीत रिसेट कर दी गई है। मैं आपकी क्या सहायता कर सकता हूँ?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }];
    setMessages(initial);
    localStorage.removeItem('reliance_pay_chat_history');
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !supportMessage.trim()) return;

    try {
      const res = await fetch('/api/support/ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          userName: user.name,
          userPhone: user.mobile,
          subject: 'Customer Query Escalation',
          message: supportMessage,
          chatTranscript: JSON.stringify(messages.slice(-6))
        })
      });

      const data = await res.json();
      if (data.success) {
        setTicketSuccess(data.message);
        setSupportMessage('');
        setTimeout(() => {
          setShowSupportModal(false);
          setTicketSuccess(null);
        }, 2000);
      }
    } catch (err) {
      alert('Ticket creation failed. Please try again.');
    }
  };

  // Helper to format basic markdown bold
  const renderFormattedText = (text: string) => {
    return text.split('\n').map((line, idx) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={idx} className="mb-1 leading-relaxed">
          {parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={pIdx} className="font-bold text-amber-300">{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl h-[90vh] sm:h-[85vh] bg-gradient-to-b from-[#080C16] via-[#0D1527] to-[#070B14] rounded-3xl border border-slate-700/80 shadow-2xl flex flex-col overflow-hidden relative">
        
        {/* Header */}
        <div className="p-3.5 sm:p-4 bg-gradient-to-r from-slate-900/90 via-blue-950/80 to-slate-900/90 border-b border-slate-700/80 flex items-center justify-between gap-2 shadow-md">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-sky-400 to-amber-400 p-0.5 shadow-lg shadow-sky-500/20">
                <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center overflow-hidden">
                  <img src="/assets/reliance_pay_3d_loader_logo.png" alt="AI Avatar" className="w-9 h-9 object-contain" />
                </div>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full animate-pulse" title="Online 24/7" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-wide">Reliance Pay AI Assistant</h2>
                <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                  SMART AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Your Smart Digital Guide – Available 24/7
              </p>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={toggleMute}
              title={isMuted ? 'Unmute Audio Feedback' : 'Mute Audio Feedback'}
              className={`p-2 rounded-xl transition border ${
                isMuted
                  ? 'text-slate-500 bg-slate-800/50 border-slate-700/50 hover:text-slate-300'
                  : 'text-amber-400 bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20'
              }`}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              onClick={handleClearChat}
              title="Clear Conversation"
              className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-xl transition border border-slate-700"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowSupportModal(true)}
              className="p-2 text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 rounded-xl transition border border-amber-500/30 flex items-center space-x-1 text-xs font-semibold"
            >
              <Headphones className="w-4 h-4" />
              <span className="hidden xs:inline">Ticket</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-red-500/10 hover:bg-red-500/20 rounded-xl transition border border-red-500/30"
            >
              <X className="w-5 h-5 text-red-400" />
            </button>
          </div>
        </div>

        {/* User Tickets Alert Badge if any open ticket exists */}
        {userTickets.length > 0 && (
          <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2 flex items-center justify-between text-xs text-amber-300 overflow-x-auto">
            <div className="flex items-center space-x-2 flex-shrink-0">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Support Ticket: <strong className="font-mono text-white">{userTickets[0].ticket_code}</strong> ({userTickets[0].status})</span>
            </div>
            {userTickets[0].admin_reply && (
              <span className="text-emerald-400 font-semibold truncate ml-2">Reply: {userTickets[0].admin_reply}</span>
            )}
          </div>
        )}

        {/* Chat Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Quick Suggested Chip Options */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2">
            {suggestedQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => {
                  if (q === 'Connect to Human Support') {
                    setShowSupportModal(true);
                  } else {
                    handleSend(q);
                  }
                }}
                className="bg-slate-800/80 hover:bg-slate-700/90 border border-slate-700/80 text-slate-200 text-xs px-3 py-1.5 rounded-xl transition-all shadow-sm flex items-center space-x-1.5 hover:border-amber-500/40"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>{q}</span>
              </button>
            ))}
          </div>

          {/* Message Bubbles Stream */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-1`}
            >
              <div className="flex items-start space-x-2 max-w-[88%] sm:max-w-[80%]">
                {msg.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-lg bg-slate-800 border border-amber-500/30 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                    <Bot className="w-4 h-4 text-amber-400" />
                  </div>
                )}

                <div
                  className={`p-3.5 rounded-2xl text-xs sm:text-sm shadow-md relative group ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-sky-600 text-white rounded-tr-none border border-blue-400/30'
                      : 'bg-slate-800/90 text-slate-100 rounded-tl-none border border-slate-700/80'
                  }`}
                >
                  {renderFormattedText(msg.text)}

                  {/* Copy Button for AI Messages */}
                  {msg.sender === 'ai' && (
                    <button
                      onClick={() => handleCopyText(msg.id, msg.text)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition text-slate-400 hover:text-white p-1 bg-slate-900/80 rounded-md"
                      title="Copy Answer"
                    >
                      {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}

                  {/* Human Support Button if AI suggested escalation */}
                  {msg.isEscalatedSuggested && (
                    <button
                      onClick={() => setShowSupportModal(true)}
                      className="mt-3 w-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition"
                    >
                      <Headphones className="w-4 h-4" />
                      <span>Connect to Human Support (इंसानी सपोर्ट)</span>
                    </button>
                  )}
                </div>
              </div>

              <span className="text-[10px] text-slate-500 px-1 font-mono">{msg.timestamp}</span>
            </div>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-slate-800 border border-amber-500/30 flex items-center justify-center">
                <Bot className="w-4 h-4 text-amber-400 animate-pulse" />
              </div>
              <div className="bg-slate-800/90 border border-slate-700 p-3 rounded-2xl rounded-tl-none flex items-center space-x-1.5">
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce delay-150" />
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-300" />
                <span className="text-xs text-slate-400 ml-2">Reliance Pay AI is thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-slate-900/95 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="अपना प्रश्न यहाँ लिखें (उदा. Withdrawal कैसे करें)..."
            className="flex-1 bg-slate-800/90 border border-slate-700/80 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-500/60 transition shadow-inner"
          />

          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="w-11 h-11 rounded-2xl bg-gradient-to-r from-blue-600 via-sky-500 to-amber-500 hover:from-blue-500 hover:to-amber-400 text-white flex items-center justify-center transition shadow-lg disabled:opacity-50 flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        {/* Human Support Ticket Modal */}
        {showSupportModal && (
          <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
            <div className="w-full max-w-md bg-[#0D1527] border border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-4 text-white">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Headphones className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-bold text-amber-300">Human Support Ticket</h3>
                </div>
                <button onClick={() => setShowSupportModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {ticketSuccess ? (
                <div className="bg-emerald-500/20 border border-emerald-500/40 p-4 rounded-2xl text-center space-y-2">
                  <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
                  <p className="text-sm font-bold text-emerald-300">{ticketSuccess}</p>
                </div>
              ) : (
                <form onSubmit={handleCreateTicket} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">User Name & Mobile</label>
                    <input
                      type="text"
                      disabled
                      value={`${user?.name || 'Guest'} (${user?.mobile || 'No Phone'})`}
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Describe Your Issue (अपनी समस्या लिखें)</label>
                    <textarea
                      rows={4}
                      value={supportMessage}
                      onChange={e => setSupportMessage(e.target.value)}
                      placeholder="Explain your recharge, withdrawal, or account issue..."
                      required
                      className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-3 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold py-3 rounded-2xl transition text-xs uppercase tracking-wide shadow-lg"
                  >
                    Submit Support Ticket (टिकट भेजें)
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
