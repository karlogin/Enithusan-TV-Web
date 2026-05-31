import MovieCard from '../components/MovieCard';
import { useUserLibrary } from '../context/UserLibraryContext';
import '../components/movies.css';

export default function MyList() {
  const { myList } = useUserLibrary();

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
