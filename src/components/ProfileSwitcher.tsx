import CustomSelect from './CustomSelect';
import { useProfile } from '../context/ProfileContext';
import './profile.css';

export default function ProfileSwitcher() {
  const { profiles, activeProfile, setActiveProfile } = useProfile();

  if (profiles.length <= 1) return null;

  return (
    <div className="profile-switcher">
      <CustomSelect
        value={activeProfile.id}
        onChange={setActiveProfile}
        options={profiles.map((p) => ({ value: p.id, label: `${p.name}${p.isKids ? ' (Kids)' : ''}` }))}
        ariaLabel="Profile"
      />
    </div>
  );
}
