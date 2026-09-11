import { Link } from 'react-router-dom';
import MyListButton from './MyListButton';
import type { Movie } from '../types';
import './movies.css';

interface MovieCardProps {
  movie: Movie;
  onMoreInfo?: (movie: Movie) => void;
}

export default function MovieCard({ movie, onMoreInfo }: MovieCardProps) {
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
        {onMoreInfo && (
          <button
            type="button"
            className="movie-card-info-btn"
            aria-label={`More info about ${movie.title}`}
            onClick={(e) => { e.stopPropagation(); onMoreInfo(movie); }}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
