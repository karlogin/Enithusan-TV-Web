import { useEffect, useState } from 'react';
import { getHome } from '../api';
import MovieRow from './MovieRow';
import { useLanguage } from '../context/LanguageContext';
import { useUserLibrary } from '../context/UserLibraryContext';
import type { Movie } from '../types';

export default function BecauseYouWatchedRow() {
  const { language } = useLanguage();
  const { continueWatching } = useUserLibrary();
  const [movies, setMovies] = useState<Movie[]>([]);
  const seed = continueWatching[0];

  const watchedIds = continueWatching.map((m) => m.id).join(',');
  useEffect(() => {
    if (!seed) return;
    let cancelled = false;
    getHome(language)
      .then((data) => {
        if (cancelled) return;
        const pool = [
          ...data.browse,
          ...data.featured.mostWatched,
          ...data.featured.recentlyAdded,
        ];
        const seen = new Set(watchedIds.split(',').filter(Boolean));
        setMovies(pool.filter((m) => !seen.has(m.id)).slice(0, 12));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, seed?.id, watchedIds]);

  if (!seed || movies.length === 0) return null;

  return (
    <MovieRow
      title={`Because you watched ${seed.title}`}
      subtitle="More titles you might enjoy"
      movies={movies}
    />
  );
}
