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
      <span className="splash-wordmark">oli</span>
    </div>
  );
}
