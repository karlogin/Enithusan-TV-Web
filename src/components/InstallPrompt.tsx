import { useEffect, useState } from 'react';
import './install-prompt.css';

const DISMISSED_KEY = 'vadai-install-prompt-dismissed';

function isIosSafari(): boolean {
  const ua = window.navigator.userAgent;
  const isIos = /iPad|iPhone|iPod/.test(ua) || (ua.includes('Macintosh') && navigator.maxTouchPoints > 1);
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
  return isIos && isSafari;
}

function isStandalone(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches
    || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

export default function InstallPrompt() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(DISMISSED_KEY)) return;
    } catch { /* ignore */ }
    if (isStandalone() || !isIosSafari()) return;
    const timer = window.setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setVisible(false);
    try { localStorage.setItem(DISMISSED_KEY, '1'); } catch { /* ignore */ }
  };

  if (!visible) return null;

  return (
    <div className="install-prompt" role="note">
      <button type="button" className="install-prompt-close" onClick={dismiss} aria-label="Dismiss">
        &times;
      </button>
      <p>
        Install Vadai: tap <span className="install-prompt-share" aria-hidden="true">⬆</span> Share,
        then <strong>Add to Home Screen</strong>.
      </p>
    </div>
  );
}
