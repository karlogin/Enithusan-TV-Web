import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isRateLimitError, getHome } from '../api';
import type { HomeData } from '../types';

describe('isRateLimitError', () => {
  it('detects "rate limit" in message', () => {
    expect(isRateLimitError('Einthusan rate limited')).toBe(true);
  });

  it('detects case-insensitive rate limit', () => {
    expect(isRateLimitError('RATE LIMIT exceeded')).toBe(true);
    expect(isRateLimitError('Rate Limit')).toBe(true);
  });

  it('returns false for non-rate-limit errors', () => {
    expect(isRateLimitError('Network error')).toBe(false);
    expect(isRateLimitError('404 Not Found')).toBe(false);
    expect(isRateLimitError('')).toBe(false);
  });
});

const mockHomeData: HomeData = {
  browse: [{ id: '1', title: 'Test Movie', lang: 'tamil', poster: '' }],
  featured: {
    mostWatched: [],
    staffPicks: [],
    recentlyAdded: [{ id: '2', title: 'New Movie', lang: 'tamil', poster: '' }],
    regionalHits: [],
    comingSoon: [],
  },
};

describe('getHome cache', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns cached data on second call within TTL', async () => {
    let callCount = 0;
    vi.stubGlobal('fetch', async () => {
      callCount++;
      return {
        ok: true,
        json: async () => mockHomeData,
        headers: new Headers(),
      };
    });

    // First call — should hit network
    const first = await getHome('tamil');
    expect(first).toEqual(mockHomeData);
    expect(callCount).toBe(1);

    // Second call — should return from cache, no extra fetch
    const second = await getHome('tamil');
    expect(second).toEqual(mockHomeData);
    expect(callCount).toBe(1); // still 1, served from cache
  });

  it('caches separately per language', async () => {
    let callCount = 0;
    vi.stubGlobal('fetch', async (url: string) => {
      callCount++;
      return {
        ok: true,
        json: async () => ({ ...mockHomeData, _lang: url }),
        headers: new Headers(),
      };
    });

    await getHome('hindi');
    await getHome('malayalam');
    expect(callCount).toBe(2); // different lang keys, both should fetch
  });
});
