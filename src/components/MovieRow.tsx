import { useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import type { Movie } from '../types';
import MovieCard from './MovieCard';
import './movies.css';

interface MovieRowProps {
  title: string;
  subtitle?: string;
  movies: Movie[];
  onMoreInfo?: (movie: Movie) => void;
}

export default function MovieRow({ title, subtitle, movies, onMoreInfo }: MovieRowProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  if (!movies.length) return null;

  const scroll = (dir: 'left' | 'right') => {
    const el = trackRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.75;
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  // D-pad horizontal navigation between cards
  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (!track) return;
    const cards = Array.from(track.querySelectorAll<HTMLElement>('.movie-card-link'));
    const focused = document.activeElement as HTMLElement;
    const idx = cards.indexOf(focused);
    if (idx === -1) return;

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const next = cards[idx + 1];
      if (next) { next.focus(); next.scrollIntoView({ inline: 'nearest', block: 'nearest', behavior: 'smooth' }); }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev = cards[idx - 1];
      if (prev) { prev.focus(); prev.scrollIntoView({ inline: 'nearest', block: 'nearest', behavior: 'smooth' }); }
    }
  }, []);

  return (
    <section className="movie-row">
      <div className="movie-row-header">
        <div>
          <h2 className="section-title">{title}</h2>
          {subtitle && <p className="row-subtitle">{subtitle}</p>}
        </div>
        <Link to="/browse" className="see-all-link" tabIndex={0}>See All</Link>
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
        <div className="movie-row-track" ref={trackRef} onKeyDown={onKeyDown}>
          {movies.map((movie) => (
            <MovieCard key={`${movie.id}-${movie.lang}`} movie={movie} onMoreInfo={onMoreInfo} />
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
