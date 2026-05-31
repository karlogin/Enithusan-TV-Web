import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="page">
      <div className="page-content error-screen" style={{ minHeight: '70vh' }}>
        <h1 style={{ fontSize: '4rem', margin: 0 }}>404</h1>
        <p>Lost your way? This page doesn&apos;t exist.</p>
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
          <Link to="/" className="btn btn-primary">
            Go Home
          </Link>
          <Link to="/browse" className="btn btn-secondary">
            Browse
          </Link>
        </div>
      </div>
    </div>
  );
}
