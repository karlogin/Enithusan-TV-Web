import { createContext, useCallback, useContext, useMemo, useState } from 'react';

export interface Profile {
  id: string;
  name: string;
  color: string;
  isKids?: boolean;
}

interface ProfileContextValue {
  profiles: Profile[];
  activeProfile: Profile;
  setActiveProfile: (id: string) => void;
  addProfile: (name: string, isKids?: boolean) => void;
  removeProfile: (id: string) => void;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);
const STORAGE_KEY = 'einthusan-profiles';
const ACTIVE_KEY = 'einthusan-active-profile';

const COLORS = ['#e50914', '#0080ff', '#46d369', '#f5c518', '#b046ff', '#ff6b35'];
const DEFAULT: Profile[] = [{ id: 'default', name: 'Main', color: '#e50914' }];

function loadProfiles(): Profile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Profile[];
  } catch {
    /* ignore */
  }
  return DEFAULT;
}

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profiles, setProfiles] = useState<Profile[]>(loadProfiles);
  const [activeId, setActiveId] = useState(
    () => localStorage.getItem(ACTIVE_KEY) || 'default',
  );

  const activeProfile = profiles.find((p) => p.id === activeId) ?? profiles[0];

  const persist = useCallback((next: Profile[]) => {
    setProfiles(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const setActiveProfile = useCallback((id: string) => {
    setActiveId(id);
    localStorage.setItem(ACTIVE_KEY, id);
  }, []);

  const addProfile = useCallback(
    (name: string, isKids = false) => {
      const id = `p_${Date.now()}`;
      const color = COLORS[profiles.length % COLORS.length];
      persist([...profiles, { id, name, color, isKids }]);
      setActiveProfile(id);
    },
    [profiles, persist, setActiveProfile],
  );

  const removeProfile = useCallback(
    (id: string) => {
      if (profiles.length <= 1 || id === 'default') return;
      const next = profiles.filter((p) => p.id !== id);
      persist(next);
      if (activeId === id) setActiveProfile(next[0].id);
    },
    [profiles, activeId, persist, setActiveProfile],
  );

  const value = useMemo(
    () => ({ profiles, activeProfile, setActiveProfile, addProfile, removeProfile }),
    [profiles, activeProfile, setActiveProfile, addProfile, removeProfile],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
}

export function profileStorageKey(base: string, profileId: string) {
  return `${base}:${profileId}`;
}
