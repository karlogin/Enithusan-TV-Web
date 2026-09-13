import { useCallback, useState } from 'react';

type Reaction = 'up' | 'down' | null;

const STORAGE_KEY = 'vadai-reactions';

function load(): Record<string, Reaction> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Record<string, Reaction>;
  } catch { /* ignore */ }
  return {};
}

function save(data: Record<string, Reaction>) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* ignore */ }
}

export function useReactions(movieId: string) {
  const [all, setAll] = useState<Record<string, Reaction>>(load);
  const reaction = all[movieId] ?? null;

  const setReaction = useCallback((next: Reaction) => {
    setAll((prev) => {
      const updated = { ...prev, [movieId]: next === prev[movieId] ? null : next };
      save(updated);
      return updated;
    });
  }, [movieId]);

  return { reaction, setReaction };
}
