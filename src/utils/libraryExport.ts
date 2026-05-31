import type { UserLibrary } from '../types';

export function exportLibrary(data: UserLibrary & { exportedAt: number }) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `einthusan-library-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importLibrary(json: string) {
  const data = JSON.parse(json) as UserLibrary;
  if (!Array.isArray(data.myList) || !Array.isArray(data.continueWatching)) {
    throw new Error('Invalid library file');
  }
  const key = Object.keys(localStorage).find((k) => k.startsWith('einthusan-library'));
  if (key) {
    localStorage.setItem(key, JSON.stringify(data));
  } else {
    localStorage.setItem('einthusan-library:default', JSON.stringify(data));
  }
}
