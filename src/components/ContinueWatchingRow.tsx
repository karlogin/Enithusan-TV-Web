import { Link } from 'react-router-dom';
import type { ContinueWatchingItem } from '../types';
import { useUserLibrary } from '../context/UserLibraryContext';
import './movies.css';

interface ContinueWatchingRowProps {
  items: ContinueWatchingItem[];
}

export default function ContinueWatchingRow({ items }: ContinueWatchingRowProps) {
  const { removeFromContinueWatching } = useUserLibrary();

  if (items.length === 0) return null;

  return (
    <section className="movie-row continue-row">
      <div className="row-header">
        <div>
          <h2 className="row-title">Continue Watching</h2>
          <p className="row-subtitle">Pick up where you left off</p>
        </div>
      </div>
      <div className="row-scroll">
        {items.map((item) => {
          const pct = item.duration ? Math.min(100, (item.progress / item.duration) * 100) : 0;
          return (
            <div key={item.id} className="continue-card-wrap">
              <Link to={`/watch/${item.id}?lang=${item.lang}`} className="continue-card">
                <img src={item.poster} alt={item.title} loading="lazy" />
                <div className="continue-progress">
                  <span style={{ width: `${pct}%` }} />
                </div>
                <div className="continue-overlay">
                  <p>{item.title}</p>
                </div>
              </Link>
              <button
                type="button"
                className="continue-remove"
                aria-label={`Remove ${item.title} from Continue Watching`}
                onClick={() => removeFromContinueWatching(item.id)}
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
