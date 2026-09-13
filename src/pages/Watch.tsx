import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getMovie, refreshStream } from '../api';
import CastHint from '../components/CastHint';
import MyListButton from '../components/MyListButton';
import VideoPlayer from '../components/VideoPlayer';
import { useLanguage } from '../context/LanguageContext';
import { useUserLibrary } from '../context/UserLibraryContext';
import { useReactions } from '../hooks/useReactions';
import { LANGUAGE_LABELS, type Language, type MovieDetails } from '../types';
import '../components/watch.css';

const VALID_LANGS = new Set<Language>(['tamil', 'hindi', 'malayalam']);

export default function Watch() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { language: globalLang } = useLanguage();
  const { continueWatching, updateProgress, addToHistory } = useUserLibrary();
  const rawLang = searchParams.get('lang') as Language | null;
  const lang = rawLang && VALID_LANGS.has(rawLang) ? rawLang : globalLang;

  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { reaction, setReaction } = useReactions(id ?? '');

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
  }, [id, lang, retryCount]);

  // Back key (Escape) for Google TV remote — only when not in fullscreen
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !document.fullscreenElement) {
        navigate(-1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);

  const onStreamError = useCallback(async () => {
    if (!id) return null;
    try {
      const fresh = await refreshStream(id, lang);
      setMovie((m) => (m ? { ...m, ...fresh } : m));
      return fresh;
    } catch {
      return null;
    }
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
          The server may be rate-limiting rapid requests. Wait a few seconds and try again.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button type="button" className="btn btn-secondary" onClick={() => { setMovie(null); setError(null); setRetryCount((c) => c + 1); }}>
            Retry
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="watch-page">
      <div className="watch-player-wrap">
        <button type="button" className="watch-back" onClick={() => navigate(-1)}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
          Back
        </button>
        {movie.mp4Url || movie.hlsUrl ? (
          <VideoPlayer
            mp4Url={movie.mp4Url}
            hlsUrl={movie.hlsUrl}
            poster={movie.poster}
            title={movie.title}
            startTime={startTime}
            onProgress={(progress, duration) => {
              updateProgress(movie, progress, duration);
              if (progress >= 30) addToHistory(movie, progress, duration);
            }}
            onStreamError={onStreamError}
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
          <div className="watch-actions">
            <MyListButton movie={movie} />
            <div className="reaction-btns" role="group" aria-label="Rate this title">
              <button
                type="button"
                className={`reaction-btn ${reaction === 'up' ? 'active' : ''}`}
                onClick={() => setReaction('up')}
                aria-pressed={reaction === 'up'}
                aria-label="Thumbs up"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" />
                </svg>
              </button>
              <button
                type="button"
                className={`reaction-btn ${reaction === 'down' ? 'active' : ''}`}
                onClick={() => setReaction('down')}
                aria-pressed={reaction === 'down'}
                aria-label="Thumbs down"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div className="watch-meta">
          {movie.streamQuality && (
            <span className="quality-badge">{movie.streamQuality === 'UHD' ? 'Ultra HD' : 'HD'}</span>
          )}
          {movie.userRating && <span className="rating-badge">★ {movie.userRating}</span>}
          {movie.year && <span>{movie.year}</span>}
          <span className="muted">{LANGUAGE_LABELS[movie.lang]}</span>
          {movie.uhd && <span className="muted">Ultra HD available</span>}
        </div>
        {movie.genre && <p className="watch-genre">{movie.genre}</p>}
        {movie.description && <p className="watch-description">{movie.description}</p>}
        {(movie.director || movie.musicDirector || movie.cast) && (
          <dl className="watch-details">
            {movie.director && (
              <>
                <dt>Director</dt>
                <dd>{movie.director}</dd>
              </>
            )}
            {movie.musicDirector && (
              <>
                <dt>Music</dt>
                <dd>{movie.musicDirector}</dd>
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
        <CastHint />
        {movie.imdbSearchUrl && (
          <a href={movie.imdbSearchUrl} target="_blank" rel="noopener noreferrer" className="imdb-link">
            Search on IMDb →
          </a>
        )}
      </div>
    </div>
  );
}
