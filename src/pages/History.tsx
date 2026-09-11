import { useState } from 'react';
import MovieCard from '../components/MovieCard';
import MovieModal from '../components/MovieModal';
import { useUserLibrary } from '../context/UserLibraryContext';
import type { Movie } from '../types';
import '../components/movies.css';

function formatDate(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - ts) / 86_400_000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return d.toLocaleDateString(undefined, { weekday: 'long' });
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: diffDays > 365 ? 'numeric' : undefined });
}

export default function History() {
  const { history, clearHistory } = useUserLibrary();
  const [confirming, setConfirming] = useState(false);
  const [modalMovie, setModalMovie] = useState<Movie | null>(null);

  // Group by date label
  const grouped: { label: string; items: typeof history }[] = [];
  for (const item of history) {
    const label = formatDate(item.watchedAt);
    const existing = grouped.find((g) => g.label === label);
    if (existing) existing.items.push(item);
    else grouped.push({ label, items: [item] });
  }

  return (
    <div className="page">
      <div className="page-content">
        <div className="page-header">
          <h1>History</h1>
          <p className="page-subtitle">
            {history.length === 0
              ? 'Nothing watched yet — start a movie to see it here.'
              : `${history.length} title${history.length === 1 ? '' : 's'} watched`}
          </p>
        </div>

        {history.length > 0 && (
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {confirming ? (
              <>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', alignSelf: 'center' }}>
                  Clear all history?
                </span>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ color: 'var(--brand-accent)' }}
                  onClick={() => { clearHistory(); setConfirming(false); }}
                >
                  Yes, clear
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setConfirming(false)}>
                  Cancel
                </button>
              </>
            ) : (
              <button type="button" className="btn btn-secondary" onClick={() => setConfirming(true)}>
                Clear History
              </button>
            )}
          </div>
        )}

        {history.length === 0 ? (
          <div className="empty-state">
            <p>Your watch history is empty.</p>
          </div>
        ) : (
          grouped.map((group) => (
            <section key={group.label} style={{ marginBottom: '2rem' }}>
              <h2 style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                marginBottom: '0.75rem',
              }}>
                {group.label}
              </h2>
              <div className="browse-grid">
                {group.items.map((movie) => (
                  <MovieCard key={`${movie.id}-${movie.watchedAt}`} movie={movie} onMoreInfo={setModalMovie} />
                ))}
              </div>
            </section>
          ))
        )}
      </div>
      {modalMovie && <MovieModal movie={modalMovie} onClose={() => setModalMovie(null)} />}
    </div>
  );
}
