import { Link } from 'react-router-dom';
import './logo.css';

interface LogoProps {
  compact?: boolean;
}

export default function Logo({ compact = false }: LogoProps) {
  return (
    <Link to="/" className={`logo ${compact ? 'logo-compact' : ''}`} aria-label="Einthusan TV home">
      <svg className="logo-mark" viewBox="0 0 48 48" aria-hidden="true">
        <defs>
          <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0a84ff" />
            <stop offset="100%" stopColor="#6c5ce7" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="44" height="44" rx="13" fill="url(#logoGrad)" />
        <path
          d="M24 8a16 16 0 1 0 11.3 4.7"
          fill="none"
          stroke="#fff"
          strokeOpacity="0.4"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path d="M20 15.5v17l14.5-8.5z" fill="#fff" />
      </svg>
      {!compact && (
        <span className="logo-text">
          <span className="logo-brand">einthusan</span>
          <span className="logo-tag">tv</span>
        </span>
      )}
    </Link>
  );
}
