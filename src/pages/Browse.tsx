import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getBrowseMore, getHome } from '../api';
import { useLanguage } from '../context/LanguageContext';
import CustomSelect from '../components/CustomSelect';
import MovieCard from '../components/MovieCard';
import MovieModal from '../components/MovieModal';
import { SkeletonPage } from '../components/Skeleton';
import type { Movie } from '../types';
import '../components/profile.css';

const PAGE_SIZE = 18;
const OLDEST_YEAR = 2015;
const MAX_EMPTY_YEAR_STREAK = 3;

export default function Browse() {
  const { language } = useLanguage();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uhdOnly, setUhdOnly] = useState(false);
  const [yearFilter, setYearFilter] = useState('');
  const [modalMovie, setModalMovie] = useState<Movie | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Cursor for fetching genuinely new pages from the source site (not just
  // revealing what's already loaded) once the initial catalog runs out.
  const [cursor, setCursor] = useState<{ year: number; page: number } | null>(null);
  const [exhausted, setExhausted] = useState(false);
  const [fetchingMore, setFetchingMore] = useState(false);
  const emptyYearStreak = useRef(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setExhausted(false);
    emptyYearStreak.current = 0;

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
        setCursor({ year: new Date().getFullYear(), page: 0 });
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

  const loadMorePages = useCallback(async () => {
    if (!cursor || exhausted || fetchingMore) return;
    setFetchingMore(true);
    try {
      const results = await getBrowseMore(language, cursor.year, cursor.page);
      if (results.length > 0) {
        setMovies((prev) => {
          const seen = new Set(prev.map((m) => m.id));
          const additions = results.filter((m) => !seen.has(m.id));
          return additions.length ? [...prev, ...additions] : prev;
        });
        setCursor({ year: cursor.year, page: cursor.page + 1 });
        emptyYearStreak.current = 0;
      } else {
        emptyYearStreak.current += 1;
        const nextYear = cursor.year - 1;
        if (emptyYearStreak.current >= MAX_EMPTY_YEAR_STREAK || nextYear < OLDEST_YEAR) {
          setExhausted(true);
        } else {
          setCursor({ year: nextYear, page: 0 });
        }
      }
    } catch {
      setExhausted(true);
    } finally {
      setFetchingMore(false);
    }
  }, [cursor, exhausted, fetchingMore, language]);

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

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [uhdOnly, yearFilter, language]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        if (visibleCount < filtered.length) {
          setVisibleCount((c) => Math.min(c + PAGE_SIZE, filtered.length));
        } else {
          void loadMorePages();
        }
      },
      { rootMargin: '600px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [filtered.length, visibleCount, loadMorePages]);

  const visible = filtered.slice(0, visibleCount);
  const canLoadMore = visibleCount < filtered.length || !exhausted;

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
          <CustomSelect
            className="filter-select-wrap"
            value={yearFilter}
            onChange={setYearFilter}
            options={[{ value: '', label: 'All years' }, ...years.map((y) => ({ value: y, label: y }))]}
            ariaLabel="Filter by year"
          />
        </div>
        <div className="browse-grid">
          {visible.map((movie) => (
            <MovieCard key={movie.id} movie={movie} onMoreInfo={setModalMovie} />
          ))}
        </div>
        {canLoadMore && <div ref={sentinelRef} className="browse-sentinel" />}
        {fetchingMore && <p className="browse-loading-more">Loading more…</p>}
      </div>
      {modalMovie && <MovieModal movie={modalMovie} onClose={() => setModalMovie(null)} />}
    </div>
  );
}
