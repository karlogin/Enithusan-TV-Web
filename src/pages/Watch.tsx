import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { getMovie } from '../api';
import MyListButton from '../components/MyListButton';
import VideoPlayer from '../components/VideoPlayer';
import { useLanguage } from '../context/LanguageContext';
import { useUserLibrary } from '../context/UserLibraryContext';
import { LANGUAGE_LABELS, type Language, type MovieDetails } from '../types';
import '../components/watch.css';

export default function Watch() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { language: globalLang } = useLanguage();
  const { continueWatching, updateProgress } = useUserLibrary();
  const lang = (searchParams.get('lang') as Language | null) ?? globalLang;

  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const saved = continueWatching.find((m) => m.id === id);
  const startTime = saved?.progress ?? 0;

  useEffect(() => {
    if (!id) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    getMovie(id, lang)
      .then((details) => {
        if (!cancelled) setMovie(details);
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
  }, [id, lang]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Loading player…</p>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="error-screen">
        <p>{error ?? 'Movie not found'}</p>
        <p style={{ fontSize: '0.85rem', maxWidth: 480, color: 'var(--text-muted)' }}>
          Einthusan may rate-limit rapid requests. Wait a few seconds and try again.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button type="button" className="btn btn-secondary" onClick={() => window.location.reload()}>
            Retry
          </button>
          <Link to="/" className="btn btn-secondary">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="watch-page">
      <div className="watch-player-wrap">
        <Link to="/" className="watch-back">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
          Back
        </Link>
        {movie.mp4Url || movie.hlsUrl ? (
          <VideoPlayer
            mp4Url={movie.mp4Url}
            hlsUrl={movie.hlsUrl}
            poster={movie.poster}
            startTime={startTime}
            onProgress={(progress, duration) => updateProgress(movie, progress, duration)}
          />
        ) : (
          <div className="player-error">
            <p>Stream unavailable for this title.</p>
          </div>
        )}
      </div>

      <div className="watch-info">
        <div className="watch-title-row">
          <h1 className="watch-title">{movie.title}</h1>
          <MyListButton movie={movie} />
        </div>
        <div className="watch-meta">
          {movie.imdbRating && (
            <span className="imdb-badge">★ {movie.imdbRating} IMDb</span>
          )}
          {movie.year && <span>{movie.year}</span>}
          {movie.runtime && <span>{movie.runtime}</span>}
          {movie.rated && <span className="muted">{movie.rated}</span>}
          <span className="muted">{LANGUAGE_LABELS[movie.lang]}</span>
          {movie.uhd && <span className="muted">Ultra HD</span>}
        </div>
        {movie.genre && <p className="watch-genre">{movie.genre}</p>}
        {movie.description && <p className="watch-description">{movie.description}</p>}
        {(movie.director || movie.cast) && (
          <dl className="watch-details">
            {movie.director && (
              <>
                <dt>Director</dt>
                <dd>{movie.director}</dd>
              </>
            )}
            {movie.cast && (
              <>
                <dt>Cast</dt>
                <dd>{movie.cast}</dd>
              </>
            )}
          </dl>
        )}
        {movie.imdbUrl && (
          <a href={movie.imdbUrl} target="_blank" rel="noopener noreferrer" className="imdb-link">
            View on IMDb →
          </a>
        )}
      </div>
    </div>
  );
}
