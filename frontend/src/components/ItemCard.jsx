import { Link } from 'react-router-dom';
import { UPLOADS_URL } from '../api/client';
import './ItemCard.css';

const CategoryIcon = ({ category }) => {
  const props = { width: 12, height: 12, fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', style: { marginRight: 4, flexShrink: 0 } };
  switch (category) {
    case 'Electronics':
      return <svg {...props} viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>;
    case 'Documents':
      return <svg {...props} viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
    case 'Clothing':
      return <svg {...props} viewBox="0 0 24 24"><path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z"/></svg>;
    case 'Keys':
      return <svg {...props} viewBox="0 0 24 24"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>;
    case 'Bags':
      return <svg {...props} viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>;
    default:
      return <svg {...props} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
  }
};

export default function ItemCard({ item }) {
  const dateStr = item.date
    ? new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : '';

  return (
    <Link to={`/items/${item._id}`} className={`item-card type-${item.type}`}>
      {item.imageUrl ? (
        <img
          src={`${UPLOADS_URL}${item.imageUrl}`}
          alt={item.title}
          className="item-card-image"
          loading="lazy"
          onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder.svg'; }}
        />
      ) : (
        <div className="item-card-no-image">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3a3a3a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
        </div>
      )}
      <div className="item-card-body">
        <h3 className="item-card-title">{item.title}</h3>
        <div className="item-card-badges">
          <span className={`badge badge-${item.type}`}>{item.type}</span>
          <span className={`badge badge-${item.status?.toLowerCase()}`}>{item.status}</span>
          {item.category && (
            <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: '#6b6b6b', display: 'inline-flex', alignItems: 'center' }}>
              <CategoryIcon category={item.category} />
              {item.category}
            </span>
          )}
        </div>
        <div className="item-card-footer">
          <span className="item-card-location">{item.location}</span>
          <span className="item-card-date">{dateStr}</span>
        </div>
      </div>
    </Link>
  );
}
