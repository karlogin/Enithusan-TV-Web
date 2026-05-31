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
            <stop offset="0%" stopColor="#ff3b47" />
            <stop offset="100%" stopColor="#b8060f" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="44" height="44" rx="10" fill="url(#logoGrad)" />
        <path d="M19 14v20l18-10z" fill="#fff" />
      </svg>
      {!compact && (
        <span className="logo-text">
          <span className="logo-brand">Einthusan</span>
          <span className="logo-tag">TV</span>
        </span>
      )}
    </Link>
  );
}
