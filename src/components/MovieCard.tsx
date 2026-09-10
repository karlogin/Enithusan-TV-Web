import { Link } from 'react-router-dom';
import MyListButton from './MyListButton';
import type { Movie } from '../types';
import './movies.css';

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  return (
    <div className="movie-card">
      <Link to={`/watch/${movie.id}?lang=${movie.lang}`} className="movie-card-link" tabIndex={0}>
        {movie.uhd && <span className="movie-card-uhd">4K</span>}
        <img
          className="movie-card-poster"
          src={movie.poster}
          alt={`${movie.title} poster`}
          loading="lazy"
          decoding="async"
        />
        <div className="movie-card-play-indicator" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
        </div>
        <div className="movie-card-overlay">
          <p className="movie-card-title">{movie.title}</p>
          {movie.year && <span className="movie-card-year">{movie.year}</span>}
        </div>
      </Link>
      <div className="movie-card-quick-actions">
        <MyListButton movie={movie} variant="icon" />
      </div>
    </div>
  );
}
