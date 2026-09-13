import { useState } from 'react';
import MovieCard from '../components/MovieCard';
import MovieModal from '../components/MovieModal';
import { exportLibrary } from '../utils/libraryExport';
import { useUserLibrary } from '../context/UserLibraryContext';
import type { Movie } from '../types';
import '../components/movies.css';

function encodeList(movies: Movie[]): string {
  const minimal = movies.map(({ id, title, lang, poster, year, uhd }) => ({ id, title, lang, poster, year, uhd }));
  return btoa(JSON.stringify(minimal));
}

function shareList(movies: Movie[]) {
  const encoded = encodeList(movies);
  const url = `${window.location.origin}/shared-list?list=${encoded}`;
  if (navigator.share) {
    void navigator.share({ title: 'My Watchlist', url });
  } else {
    void navigator.clipboard.writeText(url);
    alert('Link copied to clipboard');
  }
}

export default function MyList() {
  const { myList, continueWatching } = useUserLibrary();
  const [modalMovie, setModalMovie] = useState<Movie | null>(null);

  return (
    <div className="page">
      <div className="page-content">
        <div className="page-header">
          <h1>My List</h1>
          <p className="page-subtitle">
            {myList.length === 0
              ? 'Save titles to watch later — tap + My List on any movie page.'
              : `${myList.length} title${myList.length === 1 ? '' : 's'} saved`}
          </p>
        </div>
        {myList.length > 0 && (
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => shareList(myList)}
            >
              Share List
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => exportLibrary({ myList, continueWatching, exportedAt: Date.now() })}
            >
              Export JSON
            </button>
          </div>
        )}
        {myList.length === 0 ? (
          <div className="empty-state">
            <p>Your list is empty.</p>
          </div>
        ) : (
          <div className="browse-grid">
            {myList.map((movie) => (
              <MovieCard key={movie.id} movie={movie} onMoreInfo={setModalMovie} />
            ))}
          </div>
        )}
      </div>
      {modalMovie && <MovieModal movie={modalMovie} onClose={() => setModalMovie(null)} />}
    </div>
  );
}
