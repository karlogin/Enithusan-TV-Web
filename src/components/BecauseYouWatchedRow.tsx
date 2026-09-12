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
    return pool.filter((m) => !watchedIds.has(m.id)).slice(0, 12);
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
