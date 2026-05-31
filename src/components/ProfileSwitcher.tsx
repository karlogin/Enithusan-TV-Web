import { useProfile } from '../context/ProfileContext';
import './profile.css';

export default function ProfileSwitcher() {
  const { profiles, activeProfile, setActiveProfile } = useProfile();

  if (profiles.length <= 1) return null;

  return (
    <div className="profile-switcher">
      <label htmlFor="profile-select" className="sr-only">
        Profile
      </label>
      <select
        id="profile-select"
        className="profile-select"
        value={activeProfile.id}
        onChange={(e) => setActiveProfile(e.target.value)}
        style={{ borderColor: activeProfile.color }}
      >
        {profiles.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}{p.isKids ? ' (Kids)' : ''}
          </option>
        ))}
      </select>
    </div>
  );
}
