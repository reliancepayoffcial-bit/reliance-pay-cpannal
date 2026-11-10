import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register service worker for Reliance Pay PWA
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('Reliance Pay: New version available');
  },
  onOfflineReady() {
    console.log('Reliance Pay PWA: Offline app shell ready');
  },
});

createRoot(document.getElementById('root')!).render(<App />);
