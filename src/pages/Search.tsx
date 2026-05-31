import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { searchMovies } from '../api';
import { useLanguage } from '../context/LanguageContext';
import MovieCard from '../components/MovieCard';
import { SkeletonPage } from '../components/Skeleton';
import { addSearchHistory, clearSearchHistory, getSearchHistory } from '../hooks/useSearchHistory';
import type { Movie } from '../types';
import '../components/profile.css';

export default function Search() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const query = params.get('q') ?? '';
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>(getSearchHistory);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    addSearchHistory(query);
    setHistory(getSearchHistory());

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

  if (loading && query) return <SkeletonPage />;

  return (
    <div className="page">
      <div className="page-content">
        <div className="search-results-header">
          <h1>{query ? `Results for "${query}"` : 'Search'}</h1>
          {!loading && query && (
            <p className="search-results-count">
              {results.length} {results.length === 1 ? 'title' : 'titles'} found
            </p>
          )}
        </div>

        {!query && history.length > 0 && (
          <div className="search-history">
            {history.map((h) => (
              <button key={h} type="button" onClick={() => navigate(`/search?q=${encodeURIComponent(h)}`)}>
                {h}
              </button>
            ))}
            <button type="button" onClick={() => { clearSearchHistory(); setHistory([]); }}>Clear</button>
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
            <p>Press <kbd>/</kbd> or use the search icon in the navbar.</p>
            <p><Link to="/browse">Browse all titles</Link></p>
          </div>
        )}
      </div>
    </div>
  );
}
