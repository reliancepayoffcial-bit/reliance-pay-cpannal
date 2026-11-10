/**
 * Reliance Pay Soundbox Audio Alert Helper
 * Generates terminal chime + Hindi speech synthesis: "रिलायंस पे पर ₹[Amount] प्राप्त हुए"
 */
export function playRelianceSoundboxAlert(amount: number) {
  // 1. Play Coin / Soundbox Chime
  try {
    const audioPath = '/public/assets/aistudio/__Coin_Message_Tone_____Coins_Jaisi_Sound_Wala_Notification_Tone___Best_Msg_Tone_______256k__4ed2597e.mp3';
    const audio = new Audio(audioPath);
    audio.volume = 0.9;
    audio.play().catch(() => {
      // Fallback to Web Audio synthetic dual-chime if file blocked
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const now = ctx.currentTime;
          
          const osc1 = ctx.createOscillator();
          const g1 = ctx.createGain();
          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(520, now);
          g1.gain.setValueAtTime(0.3, now);
          g1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
          osc1.connect(g1);
          g1.connect(ctx.destination);
          osc1.start(now);
          osc1.stop(now + 0.25);

          const osc2 = ctx.createOscillator();
          const g2 = ctx.createGain();
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(650, now + 0.15);
          g2.gain.setValueAtTime(0.4, now + 0.15);
          g2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
          osc2.connect(g2);
          g2.connect(ctx.destination);
          osc2.start(now + 0.15);
          osc2.stop(now + 0.5);
        }
      } catch (e) {
        console.warn('Web Audio chime fallback failed', e);
      }
    });
  } catch (e) {
    console.warn('Audio play failed', e);
  }

  // 2. Hindi Soundbox Voice Alert after short chime delay
  setTimeout(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const formattedAmount = amount.toLocaleString('hi-IN');
      const text = `रिलायंस पे पर ${formattedAmount} रुपये प्राप्त हुए।`;
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'hi-IN';
      utterance.rate = 0.92;
      utterance.pitch = 1.05;

      const voices = window.speechSynthesis.getVoices();
      const hindiVoice = voices.find(v => 
        v.lang.toLowerCase().includes('hi') || 
        v.name.toLowerCase().includes('hindi') || 
        v.name.toLowerCase().includes('india')
      );

      if (hindiVoice) {
        utterance.voice = hindiVoice;
      }

      window.speechSynthesis.speak(utterance);
    }
  }, 400);
}
