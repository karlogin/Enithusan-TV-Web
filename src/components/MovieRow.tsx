import { useRef } from 'react';
import type { Movie } from '../types';
import MovieCard from './MovieCard';
import './movies.css';

interface MovieRowProps {
  title: string;
  subtitle?: string;
  movies: Movie[];
}

export default function MovieRow({ title, subtitle, movies }: MovieRowProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  if (!movies.length) return null;

  const scroll = (dir: 'left' | 'right') => {
    const el = trackRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.75;
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <section className="movie-row">
      <div className="movie-row-header">
        <div>
          <h2 className="section-title">{title}</h2>
          {subtitle && <p className="row-subtitle">{subtitle}</p>}
        </div>
      </div>
      <div className="movie-row-track-wrap">
        <button
          type="button"
          className="row-arrow row-arrow-left"
          aria-label="Scroll left"
          onClick={() => scroll('left')}
        >
          ‹
        </button>
        <div className="movie-row-track" ref={trackRef}>
          {movies.map((movie) => (
            <MovieCard key={`${movie.id}-${movie.lang}`} movie={movie} />
          ))}
        </div>
        <button
          type="button"
          className="row-arrow row-arrow-right"
          aria-label="Scroll right"
          onClick={() => scroll('right')}
        >
          ›
        </button>
      </div>
    </section>
  );
}
