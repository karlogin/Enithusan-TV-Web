import { Link } from 'react-router-dom';
import type { Movie } from '../types';
import './movies.css';

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  return (
    <Link to={`/watch/${movie.id}?lang=${movie.lang}`} className="movie-card">
      {movie.uhd && <span className="movie-card-uhd">4K</span>}
      <img
        className="movie-card-poster"
        src={movie.poster}
        alt={`${movie.title} poster`}
        loading="lazy"
        decoding="async"
      />
      <div className="movie-card-overlay">
        <p className="movie-card-title">{movie.title}</p>
        {movie.year && <span className="movie-card-year">{movie.year}</span>}
      </div>
    </Link>
  );
}
