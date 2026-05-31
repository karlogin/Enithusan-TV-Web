import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Movie } from '../types';
import { LANGUAGE_LABELS } from '../types';
import './hero.css';

interface HeroBannerProps {
  movies: Movie[];
  onMoreInfo: (movie: Movie) => void;
}

export default function HeroBanner({ movies, onMoreInfo }: HeroBannerProps) {
  const [index, setIndex] = useState(0);
  const movie = movies[index] ?? movies[0];

  useEffect(() => {
    if (movies.length <= 1) return;
    const t = window.setInterval(() => {
      setIndex((i) => (i + 1) % movies.length);
    }, 8000);
    return () => clearInterval(t);
  }, [movies.length]);

  if (!movie) return null;

  return (
    <section className="hero">
      <div
        className="hero-backdrop"
        style={{ backgroundImage: `url(${movie.poster})` }}
        key={movie.id}
      />
      <div className="hero-content">
        <h1 className="hero-title">{movie.title}</h1>
        <div className="hero-meta">
          {movie.uhd && <span className="hero-badge">ULTRA HD</span>}
          {movie.year && <span>{movie.year}</span>}
          <span>{LANGUAGE_LABELS[movie.lang]}</span>
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
        </div>
        {movies.length > 1 && (
          <div className="hero-dots" aria-label="Featured titles">
            {movies.map((m, i) => (
              <button
                key={m.id}
                type="button"
                className={i === index ? 'active' : ''}
                aria-label={`Show ${m.title}`}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        )}
      </div>
      <div className="hero-vignette" />
    </section>
  );
}
