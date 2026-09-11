import { useEffect, useRef } from 'react';
import VadaiIcon from './VadaiIcon';
import './splash.css';

export default function Splash({ onDone }: { onDone: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Animation is 2s (rise + hold + fade). Fire done 50ms after animation completes.
    const t = setTimeout(() => {
      ref.current?.classList.add('splash-exit');
      setTimeout(onDone, 550);
    }, 2000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div ref={ref} className="splash" aria-hidden="true">
      <div className="splash-brand">
        <div className="splash-logo-row">
          <VadaiIcon id="splash" className="splash-vadai-icon" />
          <span className="splash-wordmark">vadai</span>
        </div>
        <span className="splash-tamil">வடை</span>
      </div>
    </div>
  );
}
