import { useRef, useState } from 'react';
import type { Profile } from '../context/ProfileContext';

interface PinPromptProps {
  profile: Profile;
  onConfirm: (pin: string) => boolean; // returns false = wrong PIN
  onCancel: () => void;
}

export default function PinPrompt({ profile, onConfirm, onCancel }: PinPromptProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = () => {
    if (pin.length !== 4) { setError(true); inputRef.current?.focus(); return; }
    const ok = onConfirm(pin);
    if (!ok) { setError(true); setPin(''); inputRef.current?.focus(); }
  };

  return (
    <div className="pin-backdrop" role="dialog" aria-modal="true" aria-label={`Enter PIN for ${profile.name}`}>
      <div className="pin-dialog">
        <div className="pin-avatar" style={{ background: profile.color }}>{profile.name[0].toUpperCase()}</div>
        <h2 className="pin-title">{profile.name}</h2>
        <p className="pin-subtitle">Enter your 4-digit PIN</p>
        <input
          ref={inputRef}
          type="password"
          inputMode="numeric"
          maxLength={4}
          pattern="[0-9]{4}"
          className={`pin-input ${error ? 'pin-input-error' : ''}`}
          value={pin}
          autoFocus
          onChange={(e) => { setPin(e.target.value.replace(/\D/g, '')); setError(false); }}
          onKeyDown={(e) => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') onCancel(); }}
          aria-label="PIN"
          aria-invalid={error}
          aria-describedby={error ? 'pin-err' : undefined}
        />
        {error && <p id="pin-err" className="pin-error" role="alert">Incorrect PIN — try again</p>}
        <div className="pin-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={submit}>Continue</button>
        </div>
      </div>
    </div>
  );
}
