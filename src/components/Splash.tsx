import { useEffect, useRef } from 'react';
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
          <svg className="splash-vada-icon" viewBox="0 0 36 36" aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="18" cy="18" r="14" fill="url(#splash-vada-texture)" />
            <circle cx="18" cy="18" r="5.5" fill="#000" />
            <ellipse cx="13" cy="11" rx="3.5" ry="2" fill="rgba(255,220,150,0.22)" />
            <defs>
              <radialGradient id="splash-vada-texture" cx="40%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#E8A050" />
                <stop offset="60%" stopColor="#C8873A" />
                <stop offset="100%" stopColor="#9A5E1A" />
              </radialGradient>
            </defs>
          </svg>
          <span className="splash-wordmark">vada</span>
        </div>
        <span className="splash-tamil">வடை</span>
      </div>
    </div>
  );
}
