import { useEffect, useMemo, useState } from 'react';
import { getHome } from '../api';
import { useLanguage } from '../context/LanguageContext';
import MovieCard from '../components/MovieCard';
import { SkeletonPage } from '../components/Skeleton';
import type { Movie } from '../types';
import '../components/profile.css';

export default function Browse() {
  const { language } = useLanguage();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uhdOnly, setUhdOnly] = useState(false);
  const [yearFilter, setYearFilter] = useState('');

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

  const years = useMemo(
    () =>
      [...new Set(movies.map((m) => m.year).filter(Boolean) as string[])].sort(
        (a, b) => Number(b) - Number(a),
      ),
    [movies],
  );

  const filtered = useMemo(() => {
    return movies.filter((m) => {
      if (uhdOnly && !m.uhd) return false;
      if (yearFilter && m.year !== yearFilter) return false;
      return true;
    });
  }, [movies, uhdOnly, yearFilter]);

  if (loading) return <SkeletonPage />;

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
          <p className="search-results-count">{filtered.length} titles</p>
        </div>
        <div className="browse-filters">
          <button
            type="button"
            className={`filter-chip ${uhdOnly ? 'active' : ''}`}
            onClick={() => setUhdOnly((v) => !v)}
          >
            Ultra HD only
          </button>
          <select
            className="filter-select"
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            aria-label="Filter by year"
          >
            <option value="">All years</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div className="browse-grid">
          {filtered.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </div>
    </div>
  );
}
