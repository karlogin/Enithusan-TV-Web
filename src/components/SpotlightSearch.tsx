import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchMovies } from '../api';
import { useLanguage } from '../context/LanguageContext';
import { useSpotlight } from '../context/SpotlightContext';
import { addSearchHistory, clearSearchHistory, getSearchHistory } from '../hooks/useSearchHistory';
import { LANGUAGE_LABELS, type Movie } from '../types';
import './spotlight.css';

export default function SpotlightSearch() {
  const { open, closeSpotlight } = useSpotlight();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [focusIdx, setFocusIdx] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setHistory(getSearchHistory());
      setQuery('');
      setResults([]);
      setFocusIdx(-1);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(() => {
      searchMovies(query, language)
        .then((movies) => {
          setResults(movies);
          setFocusIdx(-1);
          if (movies.length > 0) {
            addSearchHistory(query);
            setHistory(getSearchHistory());
          }
        })
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 280);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, language]);

  // Escape closes
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSpotlight();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, closeSpotlight]);

  const goToMovie = useCallback((movie: Movie) => {
    closeSpotlight();
    navigate(`/watch/${movie.id}?lang=${movie.lang}`);
  }, [closeSpotlight, navigate]);

  const goToQuery = useCallback((q: string) => {
    closeSpotlight();
    navigate(`/search?q=${encodeURIComponent(q)}`);
  }, [closeSpotlight, navigate]);

  // Arrow key navigation
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const items = listRef.current?.querySelectorAll<HTMLElement>('[data-result]');
    if (!items?.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = Math.min(focusIdx + 1, items.length - 1);
      setFocusIdx(next);
      items[next]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (focusIdx <= 0) { inputRef.current?.focus(); setFocusIdx(-1); }
      else { const prev = focusIdx - 1; setFocusIdx(prev); items[prev]?.focus(); }
    } else if (e.key === 'Enter' && query.trim()) {
      goToQuery(query.trim());
    }
  };

  if (!open) return null;

  return (
    <div className="spotlight-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) closeSpotlight(); }}>
      <div className="spotlight-panel" role="dialog" aria-label="Search" aria-modal="true">
        <div className="spotlight-input-row">
          <svg className="spotlight-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
          <input
            ref={inputRef}
            className="spotlight-input"
            type="search"
            placeholder="Search movies…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            aria-label="Search movies"
            autoComplete="off"
            spellCheck={false}
          />
          {loading && <span className="spotlight-spinner" aria-hidden="true" />}
          {query && !loading && (
            <button type="button" className="spotlight-clear" onClick={() => { setQuery(''); inputRef.current?.focus(); }} aria-label="Clear">
              <svg viewBox="0 0 24 24"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
            </button>
          )}
          <button type="button" className="spotlight-close" onClick={closeSpotlight} aria-label="Close search">
            <kbd>esc</kbd>
          </button>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <ul ref={listRef} className="spotlight-results" role="listbox">
            {results.slice(0, 12).map((movie, i) => (
              <li key={`${movie.id}-${movie.lang}`} role="option" aria-selected={focusIdx === i}>
                <button
                  type="button"
                  className="spotlight-result-item"
                  data-result
                  tabIndex={0}
                  onClick={() => goToMovie(movie)}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowDown') { e.preventDefault(); const el = listRef.current?.querySelectorAll<HTMLElement>('[data-result]')[i + 1]; el?.focus(); setFocusIdx(i + 1); }
                    else if (e.key === 'ArrowUp') { e.preventDefault(); if (i === 0) { inputRef.current?.focus(); setFocusIdx(-1); } else { listRef.current?.querySelectorAll<HTMLElement>('[data-result]')[i - 1]?.focus(); setFocusIdx(i - 1); } }
                  }}
                >
                  <img src={movie.poster} alt="" className="spotlight-poster" loading="lazy" />
                  <div className="spotlight-result-info">
                    <span className="spotlight-result-title">{movie.title}</span>
                    <span className="spotlight-result-meta">
                      {movie.year && <span>{movie.year}</span>}
                      <span className="spotlight-lang-chip">{LANGUAGE_LABELS[movie.lang]}</span>
                      {movie.uhd && <span className="spotlight-uhd-chip">UHD</span>}
                    </span>
                  </div>
                  <svg className="spotlight-result-arrow" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
              </li>
            ))}
            {results.length > 12 && (
              <li>
                <button type="button" className="spotlight-see-all" onClick={() => goToQuery(query)}>
                  See all {results.length} results for &ldquo;{query}&rdquo;
                </button>
              </li>
            )}
          </ul>
        )}

        {/* Recent searches */}
        {!query && history.length > 0 && (
          <div className="spotlight-history">
            <div className="spotlight-section-label">
              <span>Recent</span>
              <button type="button" className="spotlight-history-clear" onClick={() => { clearSearchHistory(); setHistory([]); }}>Clear</button>
            </div>
            <div className="spotlight-chips">
              {history.map((h) => (
                <button key={h} type="button" className="spotlight-chip" onClick={() => setQuery(h)}>
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 3a9 9 0 1 0 0 18A9 9 0 0 0 13 3zM11 18V8l7 5-7 5z" /></svg>
                  {h}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Empty query prompt */}
        {!query && history.length === 0 && (
          <p className="spotlight-hint">Type to search Tamil, Hindi &amp; Malayalam movies</p>
        )}

        {/* No results */}
        {query && !loading && results.length === 0 && (
          <p className="spotlight-hint">No results for &ldquo;{query}&rdquo;</p>
        )}
      </div>
    </div>
  );
}
