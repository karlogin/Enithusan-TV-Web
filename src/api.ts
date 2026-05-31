import type { HomeData, Language, Movie, MovieDetails, User, UserLibrary } from './types';

const API_BASE = import.meta.env.VITE_API_BASE ?? '/api';
const TOKEN_KEY = 'einthusan-auth-token';

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (!headers.has('Content-Type') && init?.body) {
    headers.set('Content-Type', 'application/json');
  }
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    try {
      const body = JSON.parse(text) as { error?: string };
      if (body.error) throw new Error(body.error);
    } catch (e) {
      if (e instanceof Error && e.message !== text) throw e;
    }
    throw new Error(text || `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export function getHome(lang: Language): Promise<HomeData> {
  return fetchJson<HomeData>(`/home?lang=${lang}`);
}

export function searchMovies(query: string, lang: Language): Promise<Movie[]> {
  const q = encodeURIComponent(query.trim());
  return fetchJson<Movie[]>(`/search?q=${q}&lang=${lang}`);
}

export function getMovie(id: string, lang: Language): Promise<MovieDetails> {
  return fetchJson<MovieDetails>(`/movie/${id}?lang=${lang}`);
}

export function proxyStreamUrl(hlsUrl: string): string {
  return `${API_BASE}/stream?url=${encodeURIComponent(hlsUrl)}`;
}

export function registerUser(email: string, password: string, name: string) {
  return fetchJson<{ token: string; user: User }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  });
}

export function loginUser(email: string, password: string) {
  return fetchJson<{ token: string; user: User }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function logoutUser() {
  return fetchJson<{ ok: boolean }>('/auth/logout', { method: 'POST' });
}

export function getMe() {
  return fetchJson<{ user: User }>('/auth/me');
}

export function getUserLibrary() {
  return fetchJson<UserLibrary>('/user/library');
}

export function saveUserLibrary(library: UserLibrary) {
  return fetchJson<UserLibrary>('/user/library', {
    method: 'PUT',
    body: JSON.stringify(library),
  });
}
