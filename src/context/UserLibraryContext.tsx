import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getUserLibrary, saveUserLibrary } from '../api';
import { useAuth } from './AuthContext';
import type { ContinueWatchingItem, Movie, UserLibrary } from '../types';

const LIBRARY_KEY = 'einthusan-library';

function loadLocalLibrary(): UserLibrary {
  try {
    const raw = localStorage.getItem(LIBRARY_KEY);
    if (raw) return JSON.parse(raw) as UserLibrary;
  } catch {
    /* ignore */
  }
  return { myList: [], continueWatching: [] };
}

function saveLocalLibrary(library: UserLibrary) {
  localStorage.setItem(LIBRARY_KEY, JSON.stringify(library));
}

interface UserLibraryContextValue {
  myList: Movie[];
  continueWatching: ContinueWatchingItem[];
  isInMyList: (id: string) => boolean;
  toggleMyList: (movie: Movie) => void;
  updateProgress: (movie: Movie, progress: number, duration: number) => void;
  removeFromContinueWatching: (id: string) => void;
}

const UserLibraryContext = createContext<UserLibraryContextValue | null>(null);

export function UserLibraryProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [library, setLibrary] = useState<UserLibrary>(loadLocalLibrary);

  useEffect(() => {
    if (!user) return;
    getUserLibrary()
      .then((remote) => {
        const local = loadLocalLibrary();
        const merged: UserLibrary = {
          myList: mergeMovies(remote.myList, local.myList),
          continueWatching: mergeContinue(remote.continueWatching, local.continueWatching),
        };
        setLibrary(merged);
        saveLocalLibrary(merged);
      })
      .catch(() => undefined);
  }, [user?.id]);

  const persist = useCallback(
    (next: UserLibrary) => {
      setLibrary(next);
      saveLocalLibrary(next);
      if (user) {
        saveUserLibrary(next).catch(() => undefined);
      }
    },
    [user],
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

  const value = useMemo(
    () => ({
      myList: library.myList,
      continueWatching: library.continueWatching,
      isInMyList,
      toggleMyList,
      updateProgress,
      removeFromContinueWatching,
    }),
    [library, isInMyList, toggleMyList, updateProgress, removeFromContinueWatching],
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
