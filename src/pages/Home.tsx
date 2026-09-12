import { useEffect, useMemo, useState } from 'react';
import { getHome, isRateLimitError } from '../api';
import BecauseYouWatchedRow from '../components/BecauseYouWatchedRow';
import ContinueWatchingRow from '../components/ContinueWatchingRow';
import HeroBanner from '../components/HeroBanner';
import MovieModal from '../components/MovieModal';
import MovieRow from '../components/MovieRow';
import { SkeletonPage } from '../components/Skeleton';
import TopTenRow from '../components/TopTenRow';
import { useLanguage } from '../context/LanguageContext';
import { useUserLibrary } from '../context/UserLibraryContext';
import { HOME_SECTIONS, type HomeData, type Movie } from '../types';

export default function Home() {
  const { language } = useLanguage();
  const { continueWatching } = useUserLibrary();
  const [data, setData] = useState<HomeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalMovie, setModalMovie] = useState<Movie | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [retryIn, setRetryIn] = useState(0);

  useEffect(() => {
    if (retryIn <= 0) return;
    const t = window.setTimeout(() => setRetryIn((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [retryIn]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getHome(language)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message);
          if (isRateLimitError(err.message)) setRetryIn(15);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [language, retryCount]);

  const { heroCandidates, topTen, newThisWeek, dedupedSections } = useMemo(() => {
    if (!data) return { heroCandidates: [], topTen: [], newThisWeek: [], dedupedSections: [] };

    // New This Week — recentlyAdded filtered by language.
    // Fall back to all recentlyAdded when the API doesn't set lang on each movie.
    const recentlyAddedLang = data.featured.recentlyAdded.filter((m) => m.lang === language);
    const newWeek = recentlyAddedLang.length > 0 ? recentlyAddedLang : data.featured.recentlyAdded;

    // Hero carousel: New This Week first, pad to 5 with mostWatched (language-aware)
    const mostWatchedLang = data.featured.mostWatched.filter((m) => m.lang === language);
    const mostWatchedPool = mostWatchedLang.length > 0 ? mostWatchedLang : data.featured.mostWatched;
    const heroPool = [...newWeek];
    for (const m of mostWatchedPool) {
      if (heroPool.length >= 5) break;
      if (!heroPool.find((x) => x.id === m.id)) heroPool.push(m);
    }
    const candidates = heroPool.slice(0, 5);

    // "mostWatched" alone is often fewer than 10 titles, so backfill.
    const topTenPool = [
      ...data.featured.mostWatched,
      ...data.featured.recentlyAdded,
      ...data.featured.staffPicks,
      ...data.featured.regionalHits,
      ...data.browse,
    ].filter((m) => m.lang === language)
      .filter((m, i, arr) => arr.findIndex((x) => x.id === m.id) === i);
    const ten = topTenPool.slice(0, 10);

    const seen = new Set([...ten.map((m) => m.id), ...newWeek.map((m) => m.id)]);
    const rawSections = HOME_SECTIONS.map(({ key, title, subtitle }) => {
      const source = key === 'browse' ? data.browse : data.featured[key];
      const movies = source.filter((m) => m.lang === language && !seen.has(m.id));
      movies.forEach((m) => seen.add(m.id));
      return { key, title, subtitle, movies };
    }).filter((section) => section.movies.length > 0);

    const MIN_ROW_SIZE = 6;
    const deduped: typeof rawSections = [];
    let carryMovies: Movie[] = [];
    let carryTitles: string[] = [];
    for (const section of rawSections) {
      const movies = [...carryMovies, ...section.movies];
      const titles = [...carryTitles, section.title];
      if (movies.length >= MIN_ROW_SIZE || section === rawSections[rawSections.length - 1]) {
        deduped.push({
          ...section,
          title: titles.length > 1 ? titles.join(' & ') : section.title,
          subtitle: titles.length > 1 ? undefined : section.subtitle,
          movies,
        });
        carryMovies = [];
        carryTitles = [];
      } else {
        carryMovies = movies;
        carryTitles = titles;
      }
    }

    return { heroCandidates: candidates, topTen: ten, newThisWeek: newWeek, dedupedSections: deduped };
  }, [data, language]);

  if (loading) return <SkeletonPage />;

  if (error || !data) {
    return (
      <div className="error-screen">
        <p>Could not load content.</p>
        <p>{error}</p>
        {retryIn > 0 && <p>Retrying in {retryIn}s…</p>}
        {retryIn === 0 && (
          <button type="button" className="btn btn-secondary" onClick={() => { setRetryIn(0); setRetryCount((c) => c + 1); }}>
            Retry now
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      {heroCandidates.length > 0 && (
        <HeroBanner movies={heroCandidates} onMoreInfo={setModalMovie} />
      )}
      <div className="page-content" style={{ marginTop: heroCandidates.length ? '-4rem' : '1rem', position: 'relative', zIndex: 2 }}>
        <ContinueWatchingRow items={continueWatching} />
        <BecauseYouWatchedRow homeData={data} onMoreInfo={setModalMovie} />
        {newThisWeek.length > 0 && (
          <MovieRow title="New This Week" subtitle="Fresh titles added this week" movies={newThisWeek} onMoreInfo={setModalMovie} />
        )}
        <TopTenRow movies={topTen} onMoreInfo={setModalMovie} />
        {dedupedSections.map(({ key, title, subtitle, movies }) => (
          <MovieRow key={key} title={title} subtitle={subtitle} movies={movies} onMoreInfo={setModalMovie} />
        ))}
      </div>
      {modalMovie && <MovieModal movie={modalMovie} onClose={() => setModalMovie(null)} />}
    </>
  );
}
