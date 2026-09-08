import { useRef } from 'react';
import MovieCard from './MovieCard';
import type { Movie } from '../types';
import './movies.css';

interface TopTenRowProps {
  movies: Movie[];
}

export default function TopTenRow({ movies }: TopTenRowProps) {
  const top = movies.slice(0, 10);
  const trackRef = useRef<HTMLDivElement>(null);

  if (top.length === 0) return null;

  const scroll = (dir: 'left' | 'right') => {
    const el = trackRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.75;
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <section className="movie-row top-ten-row">
      <div className="movie-row-header">
        <div>
          <h2 className="section-title">Top {top.length} Today</h2>
          <p className="row-subtitle">Most popular in your language</p>
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
        <div className="top-ten-track" ref={trackRef}>
          {top.map((movie, i) => (
            <div key={movie.id} className="top-ten-item">
              <span className="top-ten-num" aria-hidden="true">
                {i + 1}
              </span>
              <MovieCard movie={movie} />
            </div>
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
