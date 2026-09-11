import { useRef } from 'react';
import MovieCard from './MovieCard';
import type { Movie } from '../types';
import './movies.css';

interface TopTenRowProps {
  movies: Movie[];
  onMoreInfo?: (movie: Movie) => void;
}

export default function TopTenRow({ movies, onMoreInfo }: TopTenRowProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  if (movies.length === 0) return null;

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
          <h2 className="section-title">Top {movies.length} Today</h2>
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
          {movies.map((movie, i) => (
            <div key={movie.id} className="top-ten-item">
              <span className="top-ten-num" aria-hidden="true">
                {i + 1}
              </span>
              <MovieCard movie={movie} onMoreInfo={onMoreInfo} />
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
