import { Link } from 'react-router-dom';
import './logo.css';

interface LogoProps {
  compact?: boolean;
}

export default function Logo({ compact = false }: LogoProps) {
  return (
    <Link to="/" className={`logo ${compact ? 'logo-compact' : ''}`} aria-label="Oli home">
      <span className="logo-wordmark">oli</span>
    </Link>
  );
}
