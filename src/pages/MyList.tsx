import MovieCard from '../components/MovieCard';
import { exportLibrary } from '../utils/libraryExport';
import { useUserLibrary } from '../context/UserLibraryContext';
import '../components/movies.css';

export default function MyList() {
  const { myList, continueWatching } = useUserLibrary();

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
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
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
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
