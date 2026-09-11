import { Link } from 'react-router-dom';
import VadaiIcon from './VadaiIcon';
import './logo.css';

interface LogoProps {
  compact?: boolean;
}

export default function Logo({ compact = false }: LogoProps) {
  return (
    <Link to="/" className={`logo ${compact ? 'logo-compact' : ''}`} aria-label="Vadai home">
      <VadaiIcon id="logo" className="logo-vadai-icon" />
      <span className="logo-wordmark">vadai</span>
      {!compact && <span className="logo-tamil" aria-hidden="true">வடை</span>}
    </Link>
  );
}
