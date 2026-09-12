import { describe, it, expect } from 'vitest';
import { mergeMovies, mergeContinue, mergeHistory } from '../context/UserLibraryContext';
import type { Movie, ContinueWatchingItem, HistoryItem } from '../types';

function makeMovie(id: string, lang: 'tamil' | 'hindi' | 'malayalam' = 'tamil'): Movie {
  return { id, title: `Movie ${id}`, lang, poster: '' };
}

function makeContinue(id: string, updatedAt: number): ContinueWatchingItem {
  return { ...makeMovie(id), progress: 100, duration: 1000, updatedAt };
}

function makeHistory(id: string, watchedAt: number): HistoryItem {
  return { ...makeMovie(id), watchedAt };
}

describe('mergeMovies', () => {
  it('deduplicates movies by id', () => {
    const a = [makeMovie('1'), makeMovie('2')];
    const b = [makeMovie('2'), makeMovie('3')];
    const result = mergeMovies(a, b);
    const ids = result.map((m) => m.id);
    expect(ids).toContain('1');
    expect(ids).toContain('2');
    expect(ids).toContain('3');
    expect(result.filter((m) => m.id === '2')).toHaveLength(1);
  });

  it('returns all unique movies when no overlap', () => {
    const a = [makeMovie('1')];
    const b = [makeMovie('2')];
    expect(mergeMovies(a, b)).toHaveLength(2);
  });

  it('handles empty arrays', () => {
    expect(mergeMovies([], [])).toHaveLength(0);
    expect(mergeMovies([makeMovie('1')], [])).toHaveLength(1);
    expect(mergeMovies([], [makeMovie('1')])).toHaveLength(1);
  });

  it('last occurrence wins (b overrides a for same id)', () => {
    const a = [{ ...makeMovie('1'), title: 'Old Title' }];
    const b = [{ ...makeMovie('1'), title: 'New Title' }];
    const result = mergeMovies(a, b);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('New Title');
  });
});

describe('mergeContinue', () => {
  it('deduplicates by id, keeps newer updatedAt', () => {
    const a = [makeContinue('1', 100), makeContinue('2', 200)];
    const b = [makeContinue('1', 500)]; // newer
    const result = mergeContinue(a, b);
    expect(result.filter((m) => m.id === '1')).toHaveLength(1);
    expect(result.find((m) => m.id === '1')!.updatedAt).toBe(500);
  });

  it('sorts by updatedAt descending', () => {
    const a = [makeContinue('old', 100)];
    const b = [makeContinue('new', 9000)];
    const result = mergeContinue(a, b);
    expect(result[0].id).toBe('new');
    expect(result[1].id).toBe('old');
  });

  it('caps at 20 items', () => {
    const a = Array.from({ length: 15 }, (_, i) => makeContinue(`a${i}`, i));
    const b = Array.from({ length: 15 }, (_, i) => makeContinue(`b${i}`, i + 100));
    const result = mergeContinue(a, b);
    expect(result.length).toBeLessThanOrEqual(20);
  });

  it('handles empty arrays', () => {
    expect(mergeContinue([], [])).toHaveLength(0);
  });
});

describe('mergeHistory', () => {
  it('deduplicates by id, keeps newer watchedAt', () => {
    const a = [makeHistory('1', 100)];
    const b = [makeHistory('1', 999)];
    const result = mergeHistory(a, b);
    expect(result).toHaveLength(1);
    expect(result[0].watchedAt).toBe(999);
  });

  it('keeps older when a has newer timestamp', () => {
    const a = [makeHistory('1', 999)];
    const b = [makeHistory('1', 100)];
    const result = mergeHistory(a, b);
    expect(result).toHaveLength(1);
    expect(result[0].watchedAt).toBe(999);
  });

  it('sorts by watchedAt descending', () => {
    const a = [makeHistory('first', 1000)];
    const b = [makeHistory('second', 2000)];
    const result = mergeHistory(a, b);
    expect(result[0].id).toBe('second');
    expect(result[1].id).toBe('first');
  });

  it('caps at 200 items', () => {
    const a = Array.from({ length: 150 }, (_, i) => makeHistory(`a${i}`, i));
    const b = Array.from({ length: 150 }, (_, i) => makeHistory(`b${i}`, i + 1000));
    const result = mergeHistory(a, b);
    expect(result.length).toBeLessThanOrEqual(200);
  });

  it('handles empty arrays', () => {
    expect(mergeHistory([], [])).toHaveLength(0);
  });
});
