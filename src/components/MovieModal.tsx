import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMovie } from '../api';
import MyListButton from './MyListButton';
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
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
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

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getMovie(movie.id, movie.lang)
      .then((d) => {
        if (!cancelled) setDetails(d);
      })
      .catch(() => {
        if (!cancelled) setDetails({ ...movie, description: '' });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
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
        <button type="button" className="modal-close" aria-label="Close" onClick={onClose}>
          ×
        </button>
        <div
          className="modal-hero"
          style={{ backgroundImage: d.poster ? `url(${d.poster})` : undefined }}
        />
        <div className="modal-body">
          <div className="modal-top">
            {d.poster && <img className="modal-poster" src={d.poster} alt="" aria-hidden="true" />}
            <div className="modal-top-text">
              <h2 id="modal-title">{d.title}</h2>
              <div className="modal-meta">
                {d.userRating && <span className="rating-badge">★ {d.userRating}</span>}
                {d.year && <span>{d.year}</span>}
                <span>{LANGUAGE_LABELS[d.lang]}</span>
                {d.uhd && <span>Ultra HD</span>}
                {d.streamQuality && <span>{d.streamQuality}</span>}
              </div>
            </div>
          </div>
          {loading ? (
            <p className="modal-loading">Loading details…</p>
          ) : (
            <>
              {d.description && <p className="modal-desc">{d.description}</p>}
              {d.genre && <p className="modal-genre">{d.genre}</p>}
              {d.cast && <p className="modal-cast"><strong>Cast:</strong> {d.cast}</p>}
            </>
          )}
          <div className="modal-actions">
            <Link to={`/watch/${d.id}?lang=${d.lang}`} className="btn btn-play" onClick={onClose}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
              Play
            </Link>
            <MyListButton movie={d} />
          </div>
        </div>
      </div>
    </div>
  );
}
