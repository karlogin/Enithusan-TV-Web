import { useUserLibrary } from '../context/UserLibraryContext';
import type { Movie } from '../types';
import './movies.css';

interface MyListButtonProps {
  movie: Movie;
  variant?: 'icon' | 'pill';
}

export default function MyListButton({ movie, variant = 'pill' }: MyListButtonProps) {
  const { isInMyList, toggleMyList } = useUserLibrary();
  const inList = isInMyList(movie.id);

  return (
    <button
      type="button"
      className={`my-list-btn ${variant} ${inList ? 'active' : ''}`}
      onClick={() => toggleMyList(movie)}
      aria-pressed={inList}
      aria-label={inList ? 'Remove from My List' : 'Add to My List'}
    >
      {variant === 'icon' ? (
        inList ? (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
        )
      ) : inList ? (
        '✓ In My List'
      ) : (
        '+ My List'
      )}
    </button>
  );
}
