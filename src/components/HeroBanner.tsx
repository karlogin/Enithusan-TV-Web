import { Link } from 'react-router-dom';
import type { Movie } from '../types';
import { LANGUAGE_LABELS } from '../types';
import './hero.css';

interface HeroBannerProps {
  movie: Movie;
}

export default function HeroBanner({ movie }: HeroBannerProps) {
  return (
    <section className="hero">
      <div
        className="hero-backdrop"
        style={{ backgroundImage: `url(${movie.poster})` }}
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
          <Link to={`/watch/${movie.id}?lang=${movie.lang}`} className="btn btn-secondary">
            More Info
          </Link>
        </div>
      </div>
      <div className="hero-vignette" />
    </section>
  );
}
