import { Link } from 'react-router-dom';
import './logo.css';

interface LogoProps {
  compact?: boolean;
}

function VadaIcon() {
  return (
    <svg className="logo-vada-icon" viewBox="0 0 36 36" aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer ring */}
      <circle cx="18" cy="18" r="14" fill="#C8873A" />
      {/* Crispy texture marks */}
      <circle cx="18" cy="18" r="14" fill="url(#vada-texture)" />
      {/* Inner hole */}
      <circle cx="18" cy="18" r="5.5" fill="#000" />
      {/* Subtle highlight */}
      <ellipse cx="13" cy="11" rx="3.5" ry="2" fill="rgba(255,220,150,0.22)" />
      <defs>
        <radialGradient id="vada-texture" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#E8A050" />
          <stop offset="60%" stopColor="#C8873A" />
          <stop offset="100%" stopColor="#9A5E1A" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export default function Logo({ compact = false }: LogoProps) {
  return (
    <Link to="/" className={`logo ${compact ? 'logo-compact' : ''}`} aria-label="Vada home">
      <VadaIcon />
      <span className="logo-wordmark">vada</span>
      {!compact && <span className="logo-tamil" aria-hidden="true">வடை</span>}
    </Link>
  );
}
