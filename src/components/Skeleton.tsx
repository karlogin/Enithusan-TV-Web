import './skeleton.css';

export function SkeletonCard() {
  return <div className="skeleton skeleton-card" aria-hidden="true" />;
}

export function SkeletonRow({ count = 6 }: { count?: number }) {
  return (
    <div className="skeleton-row" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton skeleton-poster" />
      ))}
    </div>
  );
}

export function SkeletonHero() {
  return <div className="skeleton skeleton-hero" aria-hidden="true" />;
}

export function SkeletonPage() {
  return (
    <div className="skeleton-page">
      <SkeletonHero />
      <div className="page-content">
        <SkeletonRow />
        <SkeletonRow />
      </div>
    </div>
  );
}
