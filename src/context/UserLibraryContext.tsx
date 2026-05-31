import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getUserLibrary, saveUserLibrary } from '../api';
import { profileStorageKey, useProfile } from './ProfileContext';
import { useAuth } from './AuthContext';
import type { ContinueWatchingItem, Movie, UserLibrary } from '../types';

interface UserLibraryContextValue {
  myList: Movie[];
  continueWatching: ContinueWatchingItem[];
  isInMyList: (id: string) => boolean;
  toggleMyList: (movie: Movie) => void;
  updateProgress: (movie: Movie, progress: number, duration: number) => void;
  removeFromContinueWatching: (id: string) => void;
  importLibrary: (data: UserLibrary) => void;
}

const UserLibraryContext = createContext<UserLibraryContextValue | null>(null);

function loadLocalLibrary(key: string): UserLibrary {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as UserLibrary;
  } catch {
    /* ignore */
  }
  return { myList: [], continueWatching: [] };
}

export function UserLibraryProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { activeProfile } = useProfile();
  const storageKey = profileStorageKey('einthusan-library', activeProfile.id);
  const [library, setLibrary] = useState<UserLibrary>(() => loadLocalLibrary(storageKey));

  useEffect(() => {
    setLibrary(loadLocalLibrary(storageKey));
  }, [storageKey]);

  useEffect(() => {
    if (!user) return;
    const local = loadLocalLibrary(storageKey);
    getUserLibrary(activeProfile.id)
      .then((remote) => {
        const merged: UserLibrary = {
          myList: mergeMovies(remote.myList, local.myList),
          continueWatching: mergeContinue(remote.continueWatching, local.continueWatching),
        };
        setLibrary(merged);
        localStorage.setItem(storageKey, JSON.stringify(merged));
        saveUserLibrary(merged, activeProfile.id).catch(() => undefined);
      })
      .catch(() => undefined);
  }, [user?.id, activeProfile.id, storageKey]);

  const persist = useCallback(
    (next: UserLibrary) => {
      setLibrary(next);
      localStorage.setItem(storageKey, JSON.stringify(next));
      if (user) {
        saveUserLibrary(next, activeProfile.id).catch(() => undefined);
      }
    },
    [user, storageKey, activeProfile.id],
  );

  const isInMyList = useCallback(
    (id: string) => library.myList.some((m) => m.id === id),
    [library.myList],
  );

  const toggleMyList = useCallback(
    (movie: Movie) => {
      const exists = library.myList.some((m) => m.id === movie.id);
      const myList = exists
        ? library.myList.filter((m) => m.id !== movie.id)
        : [movie, ...library.myList];
      persist({ ...library, myList });
    },
    [library, persist],
  );

  const updateProgress = useCallback(
    (movie: Movie, progress: number, duration: number) => {
      if (!duration || progress < 10) return;
      if (progress / duration > 0.95) {
        persist({
          ...library,
          continueWatching: library.continueWatching.filter((m) => m.id !== movie.id),
        });
        return;
      }
      const item: ContinueWatchingItem = {
        ...movie,
        progress,
        duration,
        updatedAt: Date.now(),
      };
      const rest = library.continueWatching.filter((m) => m.id !== movie.id);
      persist({ ...library, continueWatching: [item, ...rest].slice(0, 20) });
    },
    [library, persist],
  );

  const removeFromContinueWatching = useCallback(
    (id: string) => {
      persist({
        ...library,
        continueWatching: library.continueWatching.filter((m) => m.id !== id),
      });
    },
    [library, persist],
  );

  const importLibrary = useCallback(
    (data: UserLibrary) => {
      persist({
        myList: mergeMovies(library.myList, data.myList),
        continueWatching: mergeContinue(library.continueWatching, data.continueWatching),
      });
    },
    [library, persist],
  );

  const value = useMemo(
    () => ({
      myList: library.myList,
      continueWatching: library.continueWatching,
      isInMyList,
      toggleMyList,
      updateProgress,
      removeFromContinueWatching,
      importLibrary,
    }),
    [library, isInMyList, toggleMyList, updateProgress, removeFromContinueWatching, importLibrary],
  );

  return (
    <UserLibraryContext.Provider value={value}>{children}</UserLibraryContext.Provider>
  );
}

function mergeMovies(a: Movie[], b: Movie[]): Movie[] {
  const map = new Map<string, Movie>();
  [...a, ...b].forEach((m) => map.set(m.id, m));
  return [...map.values()];
}

function mergeContinue(a: ContinueWatchingItem[], b: ContinueWatchingItem[]): ContinueWatchingItem[] {
  const map = new Map<string, ContinueWatchingItem>();
  [...a, ...b].forEach((m) => {
    const existing = map.get(m.id);
    if (!existing || m.updatedAt > existing.updatedAt) map.set(m.id, m);
  });
  return [...map.values()].sort((x, y) => y.updatedAt - x.updatedAt).slice(0, 20);
}

export function useUserLibrary() {
  const ctx = useContext(UserLibraryContext);
  if (!ctx) throw new Error('useUserLibrary must be used within UserLibraryProvider');
  return ctx;
}
