import { createContext, useCallback, useContext, useMemo, useState } from 'react';

export interface Profile {
  id: string;
  name: string;
  color: string;
  isKids?: boolean;
  pin?: string; // 4-digit PIN; if set, required to switch TO this profile
}

interface ProfileContextValue {
  profiles: Profile[];
  activeProfile: Profile;
  setActiveProfile: (id: string) => void;
  addProfile: (name: string, isKids?: boolean) => void;
  removeProfile: (id: string) => void;
  setProfilePin: (id: string, pin: string | null) => void;
  checkPin: (id: string, attempt: string) => boolean;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);
const STORAGE_KEY = 'vadai-profiles';
const ACTIVE_KEY = 'vadai-active-profile';

const COLORS = ['#ff3864', '#0080ff', '#46d369', '#f5c518', '#b046ff', '#ff6b35'];
const DEFAULT: Profile[] = [{ id: 'default', name: 'Main', color: '#ff3864' }];

function isValidProfile(p: unknown): p is Profile {
  return (
    typeof p === 'object' &&
    p !== null &&
    typeof (p as Profile).id === 'string' &&
    typeof (p as Profile).name === 'string' &&
    typeof (p as Profile).color === 'string'
  );
}

function loadProfiles(): Profile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed.every(isValidProfile)) {
        return parsed;
      }
    }
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

  const setProfilePin = useCallback(
    (id: string, pin: string | null) => {
      persist(profiles.map((p) => p.id === id ? { ...p, pin: pin ?? undefined } : p));
    },
    [profiles, persist],
  );

  const checkPin = useCallback(
    (id: string, attempt: string) => {
      const profile = profiles.find((p) => p.id === id);
      if (!profile?.pin) return true;
      return profile.pin === attempt;
    },
    [profiles],
  );

  const value = useMemo(
    () => ({ profiles, activeProfile, setActiveProfile, addProfile, removeProfile, setProfilePin, checkPin }),
    [profiles, activeProfile, setActiveProfile, addProfile, removeProfile, setProfilePin, checkPin],
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
