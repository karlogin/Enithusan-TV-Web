import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMovie } from '../api';
import MyListButton from './MyListButton';
import { useUserLibrary } from '../context/UserLibraryContext';
import type { Movie, MovieDetails } from '../types';
import { LANGUAGE_LABELS } from '../types';
import './modal.css';

const FOCUSABLE = 'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])';

function trapFocus(e: KeyboardEvent, panel: HTMLElement) {
  const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
  if (focusable.length === 0) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.key === 'Tab') {
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }
}

interface MovieModalProps {
  movie: Movie;
  onClose: () => void;
}

export default function MovieModal({ movie, onClose }: MovieModalProps) {
  const [details, setDetails] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);
  const { continueWatching } = useUserLibrary();
  const savedProgress = continueWatching.find((c) => c.id === movie.id);
  const isResumable = !!(savedProgress && savedProgress.progress > 0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getMovie(movie.id, movie.lang)
      .then((d) => { if (!cancelled) setDetails(d); })
      .catch(() => { if (!cancelled) setDetails({ ...movie, description: '' }); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [movie]);

  useEffect(() => {
    const panel = panelRef.current;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (panel) trapFocus(e, panel);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    const firstFocusable = panel?.querySelector<HTMLElement>(FOCUSABLE);
    firstFocusable?.focus();
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const d: MovieDetails = details ?? { ...movie, description: '' };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <button type="button" className="modal-backdrop" aria-label="Close" onClick={onClose} />
      <div className="modal-panel" ref={panelRef}>
        {/* Cinematic hero */}
        <div className="modal-hero" style={{ backgroundImage: d.poster ? `url(${d.poster})` : undefined }}>
          <div className="modal-hero-gradient" />
          <button type="button" className="modal-close" aria-label="Close" onClick={onClose}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
          </button>
          <Link
            to={`/watch/${d.id}?lang=${d.lang}`}
            className="modal-hero-play"
            aria-label={`Play ${d.title}`}
            onClick={onClose}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
          </Link>
        </div>

        {/* Content */}
        <div className="modal-body">
          <div className="modal-top">
            {d.poster && (
              <img className="modal-poster" src={d.poster} alt="" aria-hidden="true" />
            )}
            <div className="modal-top-text">
              <h2 id="modal-title" className="modal-title">{d.title}</h2>
              <div className="modal-meta">
                {d.userRating && <span className="rating-badge">★ {d.userRating}</span>}
                {d.year && <span>{d.year}</span>}
                <span>{LANGUAGE_LABELS[d.lang]}</span>
                {(d.uhd || d.streamQuality === 'UHD') && <span className="quality-pill">Ultra HD</span>}
                {d.streamQuality && d.streamQuality !== 'UHD' && <span className="quality-pill">{d.streamQuality}</span>}
              </div>
            </div>
          </div>

          {loading ? (
            <p className="modal-loading">Loading details…</p>
          ) : (
            <>
              {d.description && <p className="modal-desc">{d.description}</p>}
              {(d.genre || d.cast) && (
                <dl className="modal-details">
                  {d.genre && (
                    <><dt>Genre</dt><dd>{d.genre}</dd></>
                  )}
                  {d.cast && (
                    <><dt>Cast</dt><dd>{d.cast}</dd></>
                  )}
                </dl>
              )}
            </>
          )}

          <div className="modal-actions">
            <Link to={`/watch/${d.id}?lang=${d.lang}`} className="btn btn-play modal-play-btn" onClick={onClose}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
              {isResumable ? 'Resume' : 'Play'}
            </Link>
            <MyListButton movie={d} />
          </div>
        </div>
      </div>
    </div>
  );
}
