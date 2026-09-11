import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import MyListButton from './MyListButton';
import type { Movie } from '../types';
import { LANGUAGE_LABELS } from '../types';
import './hero.css';

const SLIDE_DURATION = 8000;

interface HeroBannerProps {
  movies: Movie[];
  onMoreInfo: (movie: Movie) => void;
}

export default function HeroBanner({ movies, onMoreInfo }: HeroBannerProps) {
  const [index, setIndex] = useState(0);
  const [tickKey, setTickKey] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const timerRef = useRef<number | null>(null);
  const touchStartX = useRef(0);
  const movie = movies[index] ?? movies[0];

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const goTo = (i: number) => {
    setIndex(i);
    setTickKey((k) => k + 1);
    if (timerRef.current !== null) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setIndex((prev) => {
        const next = (prev + 1) % movies.length;
        setTickKey((k) => k + 1);
        return next;
      });
    }, SLIDE_DURATION);
  };

  useEffect(() => {
    if (movies.length <= 1) return;

    const start = () => {
      timerRef.current = window.setInterval(() => {
        setIndex((prev) => {
          const next = (prev + 1) % movies.length;
          setTickKey((k) => k + 1);
          return next;
        });
      }, SLIDE_DURATION);
    };
    const stop = () => {
      if (timerRef.current !== null) { clearInterval(timerRef.current); timerRef.current = null; }
    };
    const onVisibility = () => { document.hidden ? stop() : start(); };

    start();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [movies.length]);

  if (!movie) return null;

  const parallax = scrollY * 0.22;

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 48) {
      const next = dx < 0
        ? (index + 1) % movies.length
        : (index - 1 + movies.length) % movies.length;
      goTo(next);
    }
  };

  return (
    <section
      className="hero"
      aria-label="Featured titles"
      aria-live="polite"
      aria-atomic="true"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div
        className="hero-backdrop hero-backdrop--fill"
        style={{
          backgroundImage: movie.poster ? `url(${movie.poster})` : undefined,
          transform: `scale(1.3) translateY(${parallax}px)`,
        }}
        key={movie.id}
      />
      {/* Desktop: poster inset right side */}
      {movie.poster && (
        <img
          className="hero-poster-inset"
          src={movie.poster}
          alt=""
          aria-hidden="true"
          style={{ transform: `translateY(calc(-50% + ${scrollY * -0.06}px))` }}
        />
      )}
      {/* Mobile: poster card centered at top */}
      {movie.poster && (
        <img
          className="hero-poster-mobile"
          src={movie.poster}
          alt=""
          aria-hidden="true"
          key={`mobile-${movie.id}`}
        />
      )}
      <div className="hero-content" key={movie.id} style={{ transform: `translateY(${scrollY * 0.06}px)` }}>
        <p className="hero-lang">{LANGUAGE_LABELS[movie.lang]}</p>
        <h1 className="hero-title">{movie.title}</h1>
        <div className="hero-meta">
          {movie.uhd && <span className="hero-badge">ULTRA HD</span>}
          {movie.year && <span>{movie.year}</span>}
        </div>
        <div className="hero-actions">
          <Link to={`/watch/${movie.id}?lang=${movie.lang}`} className="btn btn-play">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
            Play
          </Link>
          <button type="button" className="btn btn-secondary" onClick={() => onMoreInfo(movie)}>
            More Info
          </button>
          <MyListButton movie={movie} variant="icon" />
        </div>
        {movies.length > 1 && (
          <div className="hero-indicators" role="tablist" aria-label="Featured titles">
            {movies.map((m, i) => (
              <button
                key={m.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Show ${m.title}`}
                className={`hero-indicator-btn ${i === index ? 'active' : ''}`}
                onClick={() => goTo(i)}
              >
                <span
                  className="hero-indicator-fill"
                  key={i === index ? tickKey : `static-${i}`}
                  style={i === index ? { animationDuration: `${SLIDE_DURATION}ms` } : undefined}
                />
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="hero-vignette" />
    </section>
  );
}
