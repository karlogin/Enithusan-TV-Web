import { useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import MovieModal from '../components/MovieModal';
import type { Movie } from '../types';
import '../components/movies.css';

function decodeList(encoded: string): Movie[] {
  try {
    const json = atob(encoded);
    const parsed = JSON.parse(json) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (m): m is Movie =>
        typeof m === 'object' &&
        m !== null &&
        typeof (m as Movie).id === 'string' &&
        typeof (m as Movie).title === 'string',
    );
  } catch {
    return [];
  }
}

export default function SharedList() {
  const [params] = useSearchParams();
  const [modalMovie, setModalMovie] = useState<Movie | null>(null);

  const movies = useMemo(() => {
    const encoded = params.get('list');
    return encoded ? decodeList(encoded) : [];
  }, [params]);

  return (
    <div className="page">
      <div className="page-content">
        <div className="page-header">
          <h1>Shared Watchlist</h1>
          <p className="page-subtitle">
            {movies.length === 0
              ? 'This list is empty or the link is invalid.'
              : `${movies.length} title${movies.length === 1 ? '' : 's'} · Add them to your own list to keep track`}
          </p>
        </div>
        {movies.length === 0 ? (
          <div className="empty-state">
            <p>Nothing to show.</p>
            <Link to="/" className="btn btn-primary" style={{ display: 'inline-flex', marginTop: '1rem' }}>
              Go Home
            </Link>
          </div>
        ) : (
          <div className="browse-grid">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} onMoreInfo={setModalMovie} />
            ))}
          </div>
        )}
      </div>
      {modalMovie && <MovieModal movie={modalMovie} onClose={() => setModalMovie(null)} />}
    </div>
  );
}
