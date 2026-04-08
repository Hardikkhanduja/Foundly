import { Link } from 'react-router-dom';
import './ItemCard.css';

export default function ItemCard({ item }) {
  const dateStr = item.date
    ? new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : '';

  return (
    <Link to={`/items/${item._id}`} className={`item-card type-${item.type}`}>
      {item.imageUrl ? (
        <img
          src={`http://localhost:5000${item.imageUrl}`}
          alt={item.title}
          className="item-card-image"
        />
      ) : (
        <div className="item-card-no-image">No image</div>
      )}
      <div className="item-card-body">
        <h3 className="item-card-title">{item.title}</h3>
        <div className="item-card-badges">
          <span className={`badge badge-${item.type}`}>{item.type}</span>
          <span className={`badge badge-${item.status?.toLowerCase()}`}>{item.status}</span>
        </div>
        <div className="item-card-footer">
          <span className="item-card-location">{item.location}</span>
          <span className="item-card-date">{dateStr}</span>
        </div>
      </div>
    </Link>
  );
}
