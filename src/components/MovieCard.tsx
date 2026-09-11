import { Link } from 'react-router-dom';
import MyListButton from './MyListButton';
import type { Movie } from '../types';
import './movies.css';

interface MovieCardProps {
  movie: Movie;
  onMoreInfo?: (movie: Movie) => void;
}

export default function MovieCard({ movie, onMoreInfo }: MovieCardProps) {
  const cardContent = (
    <>
      {movie.uhd && <span className="movie-card-uhd">4K</span>}
      <img
        className="movie-card-poster"
        src={movie.poster}
        alt={`${movie.title} poster`}
        loading="lazy"
        decoding="async"
      />
      <div className="movie-card-play-indicator" aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z" /></svg>
      </div>
      <div className="movie-card-overlay">
        <p className="movie-card-title">{movie.title}</p>
        {movie.year && <span className="movie-card-year">{movie.year}</span>}
      </div>
    </>
  );

  return (
    <div className="movie-card">
      {onMoreInfo ? (
        <button
          type="button"
          className="movie-card-link"
          onClick={() => onMoreInfo(movie)}
          aria-label={`More info about ${movie.title}`}
        >
          {cardContent}
        </button>
      ) : (
        <Link to={`/watch/${movie.id}?lang=${movie.lang}`} className="movie-card-link" tabIndex={0}>
          {cardContent}
        </Link>
      )}
      <div className="movie-card-quick-actions">
        <MyListButton movie={movie} variant="icon" />
      </div>
    </div>
  );
}
