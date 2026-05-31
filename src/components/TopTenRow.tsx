import MovieCard from './MovieCard';
import type { Movie } from '../types';
import './movies.css';

interface TopTenRowProps {
  movies: Movie[];
}

export default function TopTenRow({ movies }: TopTenRowProps) {
  const top = movies.slice(0, 10);
  if (top.length === 0) return null;

  return (
    <section className="movie-row top-ten-row">
      <div className="movie-row-header">
        <div>
          <h2 className="section-title">Top 10 Today</h2>
          <p className="row-subtitle">Most popular in your language</p>
        </div>
      </div>
      <div className="top-ten-track">
        {top.map((movie, i) => (
          <div key={movie.id} className="top-ten-item">
            <span className="top-ten-num" aria-hidden="true">
              {i + 1}
            </span>
            <MovieCard movie={movie} />
          </div>
        ))}
      </div>
    </section>
  );
}
