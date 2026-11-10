import { useState, useEffect } from 'react';

export const useAudioSettings = () => {
  const [settings, setSettings] = useState({
    soundEffects: true,
    voiceAnnouncements: true,
    celebrationMusic: false,
    volume: 100,
    language: 'hi' // Default to Hindi as per request
  });

  useEffect(() => {
    const saved = localStorage.getItem('audio_settings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  const updateSettings = (newSettings: Partial<typeof settings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('audio_settings', JSON.stringify(updated));
  };

  const playSound = (path: string) => {
    if (!settings.soundEffects) return;
    const audio = new Audio(path);
    audio.volume = settings.volume / 100;
    audio.play().catch(e => console.error("Audio playback failed", e));
  };

  const speak = (textHi: string, textEn: string) => {
    if (!settings.voiceAnnouncements || !('speechSynthesis' in window)) return;
    
    const utterance = new SpeechSynthesisUtterance(settings.language === 'hi' ? textHi : textEn);
    utterance.lang = settings.language === 'hi' ? 'hi-IN' : 'en-US';
    utterance.volume = settings.volume / 100;
    window.speechSynthesis.speak(utterance);
  };

  return { settings, updateSettings, playSound, speak };
};
