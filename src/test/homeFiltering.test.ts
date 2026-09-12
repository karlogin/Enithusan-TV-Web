import { describe, it, expect } from 'vitest';
import type { HomeData, Language, Movie } from '../types';

function makeMovie(id: string, lang: Language): Movie {
  return { id, title: `Movie ${id}`, lang, poster: '' };
}

// Inline the pure filtering logic from Home.tsx useMemo for testing
function buildHeroAndNew(data: HomeData, language: Language) {
  const recentlyAddedLang = data.featured.recentlyAdded.filter((m) => m.lang === language);
  const newWeek = recentlyAddedLang.length > 0 ? recentlyAddedLang : data.featured.recentlyAdded;
  const mostWatchedLang = data.featured.mostWatched.filter((m) => m.lang === language);
  const mostWatchedPool = mostWatchedLang.length > 0 ? mostWatchedLang : data.featured.mostWatched;
  const heroPool = [...newWeek];
  for (const m of mostWatchedPool) {
    if (heroPool.length >= 5) break;
    if (!heroPool.find((x) => x.id === m.id)) heroPool.push(m);
  }
  return { heroCandidates: heroPool.slice(0, 5), newThisWeek: newWeek };
}

function makeEmptyData(): HomeData {
  return {
    browse: [],
    featured: {
      mostWatched: [],
      staffPicks: [],
      recentlyAdded: [],
      regionalHits: [],
      comingSoon: [],
    },
  };
}

describe('buildHeroAndNew', () => {
  it('hero candidates come from recentlyAdded first', () => {
    const data = makeEmptyData();
    data.featured.recentlyAdded = [
      makeMovie('r1', 'tamil'),
      makeMovie('r2', 'tamil'),
    ];
    data.featured.mostWatched = [makeMovie('w1', 'tamil')];

    const { heroCandidates, newThisWeek } = buildHeroAndNew(data, 'tamil');
    expect(heroCandidates[0].id).toBe('r1');
    expect(heroCandidates[1].id).toBe('r2');
    expect(newThisWeek).toHaveLength(2);
  });

  it('falls back to all recentlyAdded when no lang match', () => {
    const data = makeEmptyData();
    data.featured.recentlyAdded = [
      makeMovie('r1', 'hindi'),
      makeMovie('r2', 'malayalam'),
    ];
    const { newThisWeek } = buildHeroAndNew(data, 'tamil');
    // tamil has 0 matches, so falls back to all
    expect(newThisWeek).toHaveLength(2);
  });

  it('fills hero pool from mostWatched when recentlyAdded is short', () => {
    const data = makeEmptyData();
    data.featured.recentlyAdded = [makeMovie('r1', 'tamil')];
    data.featured.mostWatched = [
      makeMovie('w1', 'tamil'),
      makeMovie('w2', 'tamil'),
      makeMovie('w3', 'tamil'),
    ];
    const { heroCandidates } = buildHeroAndNew(data, 'tamil');
    expect(heroCandidates).toHaveLength(4);
    expect(heroCandidates[0].id).toBe('r1');
    expect(heroCandidates.map((m) => m.id)).toContain('w1');
  });

  it('deduplicates: does not add from mostWatched if already in hero pool', () => {
    const data = makeEmptyData();
    data.featured.recentlyAdded = [makeMovie('shared', 'tamil')];
    data.featured.mostWatched = [makeMovie('shared', 'tamil'), makeMovie('extra', 'tamil')];
    const { heroCandidates } = buildHeroAndNew(data, 'tamil');
    const ids = heroCandidates.map((m) => m.id);
    expect(ids.filter((id) => id === 'shared')).toHaveLength(1);
  });

  it('caps hero candidates at 5', () => {
    const data = makeEmptyData();
    data.featured.recentlyAdded = Array.from({ length: 4 }, (_, i) =>
      makeMovie(`r${i}`, 'tamil'),
    );
    data.featured.mostWatched = Array.from({ length: 5 }, (_, i) =>
      makeMovie(`w${i}`, 'tamil'),
    );
    const { heroCandidates } = buildHeroAndNew(data, 'tamil');
    expect(heroCandidates).toHaveLength(5);
  });

  it('returns empty heroPool when all data is empty', () => {
    const data = makeEmptyData();
    const { heroCandidates, newThisWeek } = buildHeroAndNew(data, 'tamil');
    expect(heroCandidates).toHaveLength(0);
    expect(newThisWeek).toHaveLength(0);
  });

  it('filters recentlyAdded by language', () => {
    const data = makeEmptyData();
    data.featured.recentlyAdded = [
      makeMovie('r1', 'tamil'),
      makeMovie('r2', 'hindi'),
      makeMovie('r3', 'tamil'),
    ];
    const { newThisWeek } = buildHeroAndNew(data, 'tamil');
    expect(newThisWeek.every((m) => m.lang === 'tamil')).toBe(true);
    expect(newThisWeek).toHaveLength(2);
  });
});
