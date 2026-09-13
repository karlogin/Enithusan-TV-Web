import { useState } from 'react';
import { useProfile, type Profile } from '../context/ProfileContext';
import PinPrompt from './PinPrompt';
import './profile.css';

export default function ProfileSwitcher() {
  const { profiles, activeProfile, setActiveProfile, checkPin } = useProfile();
  const [pendingProfile, setPendingProfile] = useState<Profile | null>(null);

  if (profiles.length <= 1) return null;

  const onSelect = (id: string) => {
    if (id === activeProfile.id) return;
    const target = profiles.find((p) => p.id === id);
    if (!target) return;
    if (target.pin) {
      setPendingProfile(target);
    } else {
      setActiveProfile(id);
    }
  };

  const onPinConfirm = (pin: string): boolean => {
    if (!pendingProfile) return true;
    if (checkPin(pendingProfile.id, pin)) {
      setActiveProfile(pendingProfile.id);
      setPendingProfile(null);
      return true;
    }
    return false;
  };

  return (
    <>
      <div className="profile-switcher">
        <select
          className="profile-select"
          value={activeProfile.id}
          onChange={(e) => onSelect(e.target.value)}
          aria-label="Profile"
        >
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}{p.isKids ? ' (Kids)' : ''}{p.pin ? ' 🔒' : ''}
            </option>
          ))}
        </select>
      </div>
      {pendingProfile && (
        <PinPrompt
          profile={pendingProfile}
          onConfirm={onPinConfirm}
          onCancel={() => setPendingProfile(null)}
        />
      )}
    </>
  );
}
