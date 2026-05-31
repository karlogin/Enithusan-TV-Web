import { useEffect, useState } from 'react';
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

  const heroCandidates = [
    ...data.featured.mostWatched.slice(0, 5),
    ...data.browse.slice(0, 3),
  ].filter((m, i, arr) => arr.findIndex((x) => x.id === m.id) === i);

  return (
    <>
      {heroCandidates.length > 0 && (
        <HeroBanner movies={heroCandidates} onMoreInfo={setModalMovie} />
      )}
      <div className="page-content" style={{ marginTop: heroCandidates.length ? '-4rem' : '1rem', position: 'relative', zIndex: 2 }}>
        <ContinueWatchingRow items={continueWatching} />
        <BecauseYouWatchedRow />
        <TopTenRow movies={data.featured.mostWatched.length ? data.featured.mostWatched : data.browse} />
        {HOME_SECTIONS.map(({ key, title, subtitle }) => {
          const movies = key === 'browse' ? data.browse : data.featured[key];
          return (
            <MovieRow key={key} title={title} subtitle={subtitle} movies={movies} />
          );
        })}
      </div>
      {modalMovie && <MovieModal movie={modalMovie} onClose={() => setModalMovie(null)} />}
    </>
  );
}
