import { useEffect, useState } from 'react';
import { getHome } from '../api';
import { useLanguage } from '../context/LanguageContext';
import HeroBanner from '../components/HeroBanner';
import MovieRow from '../components/MovieRow';
import type { HomeData } from '../types';

export default function Home() {
  const { language } = useLanguage();
  const [data, setData] = useState<HomeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getHome(language)
      .then((result) => {
        if (!cancelled) setData(result);
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
        <p>Loading movies…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="error-screen">
        <p>Could not load content.</p>
        <p>{error}</p>
        <p style={{ fontSize: '0.85rem', maxWidth: 480 }}>
          Make sure the API proxy is running. See README for setup.
        </p>
      </div>
    );
  }

  const hero =
    data.featured.mostWatched[0] ??
    data.browse[0] ??
    data.featured.recentlyAdded[0];

  return (
    <>
      {hero && <HeroBanner movie={hero} />}
      <div className="page-content" style={{ marginTop: hero ? '-4rem' : '1rem', position: 'relative', zIndex: 2 }}>
        <MovieRow title="Most Watched" movies={data.featured.mostWatched} />
        <MovieRow title="Recently Added" movies={data.featured.recentlyAdded} />
        <MovieRow title="Staff Picks" movies={data.featured.staffPicks} />
        <MovieRow title="Regional Hits" movies={data.featured.regionalHits} />
        <MovieRow title="Trending Now" movies={data.browse} />
        <MovieRow title="Coming Soon" movies={data.featured.comingSoon} />
      </div>
    </>
  );
}
