import { useMemo } from 'react';
import MovieRow from './MovieRow';
import { useUserLibrary } from '../context/UserLibraryContext';
import type { HomeData, Movie } from '../types';

interface BecauseYouWatchedRowProps {
  homeData: HomeData;
  onMoreInfo?: (movie: Movie) => void;
}

export default function BecauseYouWatchedRow({ homeData, onMoreInfo }: BecauseYouWatchedRowProps) {
  const { continueWatching } = useUserLibrary();
  const seed = continueWatching[0];

  const movies = useMemo(() => {
    if (!seed) return [];
    const watchedIds = new Set(continueWatching.map((m) => m.id));
    const pool = [
      ...homeData.browse,
      ...homeData.featured.mostWatched,
      ...homeData.featured.recentlyAdded,
    ];
    const seedYear = seed.year ? parseInt(seed.year, 10) : null;
    return pool
      .filter((m) => !watchedIds.has(m.id))
      .map((m) => {
        let score = 0;
        if (m.lang === seed.lang) score += 10;
        if (seedYear && m.year) {
          const diff = Math.abs(parseInt(m.year, 10) - seedYear);
          score += Math.max(0, 5 - diff);
        }
        return { m, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)
      .map(({ m }) => m);
  }, [seed?.id, continueWatching, homeData]);

  if (!seed || movies.length === 0) return null;

  return (
    <MovieRow
      title={`Because you watched ${seed.title}`}
      subtitle="More titles you might enjoy"
      movies={movies}
      onMoreInfo={onMoreInfo}
    />
  );
}
