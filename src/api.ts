import type { HomeData, Language, Movie, MovieDetails } from './types';

const API_BASE = import.meta.env.VITE_API_BASE ?? '/api';

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
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
