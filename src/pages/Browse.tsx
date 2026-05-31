import { useEffect, useState } from 'react';
import { getHome } from '../api';
import { useLanguage } from '../context/LanguageContext';
import MovieCard from '../components/MovieCard';
import type { Movie } from '../types';

export default function Browse() {
  const { language } = useLanguage();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getHome(language)
      .then((data) => {
        if (cancelled) return;
        const all = [
          ...data.browse,
          ...data.featured.mostWatched,
          ...data.featured.recentlyAdded,
          ...data.featured.staffPicks,
          ...data.featured.regionalHits,
        ];
        const seen = new Set<string>();
        const unique = all.filter((m) => {
          if (seen.has(m.id)) return false;
          seen.add(m.id);
          return true;
        });
        setMovies(unique);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [language]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-screen">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-content">
        <div className="search-results-header">
          <h1>Browse</h1>
          <p className="search-results-count">{movies.length} titles</p>
        </div>
        <div className="browse-grid">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </div>
    </div>
  );
}
