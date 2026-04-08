import './SkeletonCard.css';

export default function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-image skel" />
      <div className="skeleton-body">
        <div className="skel skel-title" />
        <div className="skeleton-badges">
          <div className="skel skel-badge" />
          <div className="skel skel-badge" />
        </div>
        <div className="skeleton-footer">
          <div className="skel skel-text" />
          <div className="skel skel-text-sm" />
        </div>
      </div>
    </div>
  );
}
