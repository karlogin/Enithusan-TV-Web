import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchMovies } from '../api';
import { useLanguage } from '../context/LanguageContext';
import MovieCard from '../components/MovieCard';
import type { Movie } from '../types';

export default function Search() {
  const { language } = useLanguage();
  const [params] = useSearchParams();
  const query = params.get('q') ?? '';
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    searchMovies(query, language)
      .then((movies) => {
        if (!cancelled) setResults(movies);
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
  }, [query, language]);

  return (
    <div className="page">
      <div className="page-content">
        <div className="search-results-header">
          <h1>
            {query ? `Results for "${query}"` : 'Search'}
          </h1>
          {!loading && query && (
            <p className="search-results-count">
              {results.length} {results.length === 1 ? 'title' : 'titles'} found
            </p>
          )}
        </div>

        {loading && (
          <div className="loading-screen" style={{ minHeight: '40vh' }}>
            <div className="loading-spinner" />
          </div>
        )}

        {error && (
          <div className="error-screen" style={{ minHeight: '40vh' }}>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && query && results.length === 0 && (
          <div className="search-empty">
            <p>No matches for &ldquo;{query}&rdquo;</p>
            <p>Try a different title or check the language filter.</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="browse-grid">
            {results.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}

        {!query && (
          <div className="search-empty">
            <p>Use the search icon in the navbar to find movies.</p>
          </div>
        )}
      </div>
    </div>
  );
}
