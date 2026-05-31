const KEY = 'einthusan-search-history';
const MAX = 8;

export function getSearchHistory(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]') as string[];
  } catch {
    return [];
  }
}

export function addSearchHistory(query: string) {
  const q = query.trim();
  if (!q) return;
  const prev = getSearchHistory().filter((x) => x.toLowerCase() !== q.toLowerCase());
  localStorage.setItem(KEY, JSON.stringify([q, ...prev].slice(0, MAX)));
}

export function clearSearchHistory() {
  localStorage.removeItem(KEY);
}
