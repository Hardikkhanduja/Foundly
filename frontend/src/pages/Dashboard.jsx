import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyItems, getMyClaims, deleteItem } from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('items');
  const [items, setItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [claimsLoading, setClaimsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      const [ir, cr] = await Promise.all([getMyItems(), getMyClaims()]);
      if (ir.error) setError(ir.error.message); else setItems(ir.data);
      setItemsLoading(false);
      if (cr.error) setError(cr.error.message); else setClaims(cr.data);
      setClaimsLoading(false);
    }
    load();
  }, []);

  async function handleDelete(id) {
    if (!window.confirm('Delete this item?')) return;
    const { error: err } = await deleteItem(id);
    if (err) setError(err.message);
    else setItems(prev => prev.filter(i => i._id !== id));
  }

  return (
    <div className="dash-wrap">
      <div className="dash-header">
        <h1>Dashboard</h1>
        <span className="dash-user">{user?.name}</span>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="tabs">
        <button className={`tab-btn${tab === 'items' ? ' active' : ''}`} onClick={() => setTab('items')}>
          My items {!itemsLoading && `(${items.length})`}
        </button>
        <button className={`tab-btn${tab === 'claims' ? ' active' : ''}`} onClick={() => setTab('claims')}>
          My claims {!claimsLoading && `(${claims.length})`}
        </button>
      </div>

      {tab === 'items' && (
        itemsLoading ? <LoadingSpinner /> : items.length === 0 ? (
          <div className="empty">
            <h3>No items yet</h3>
            <p>Start by posting a lost or found item</p>
            <Link to="/post-item">Post an item</Link>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Status</th>
                <th>Posted</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item._id}>
                  <td><Link to={`/items/${item._id}`}>{item.title}</Link></td>
                  <td><span className={`badge badge-${item.type}`}>{item.type}</span></td>
                  <td>
                    <span className="status-cell">
                      <span className={`status-dot dot-${item.status?.toLowerCase()}`} />
                      <span className={`badge badge-${item.status?.toLowerCase()}`}>{item.status}</span>
                    </span>
                  </td>
                  <td style={{ color: '#71717a', fontSize: 13 }}>{new Date(item.createdAt).toLocaleDateString()}</td>
                  <td><button className="btn-del" onClick={() => handleDelete(item._id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      )}

      {tab === 'claims' && (
        claimsLoading ? <LoadingSpinner /> : claims.length === 0 ? (
          <div className="empty">
            <h3>No claims yet</h3>
            <p>Browse items and submit a claim if you find something that belongs to you</p>
          </div>
        ) : (
          <div className="claims-list">
            {claims.map(claim => (
              <div key={claim._id} className="claim-card">
                <div className="claim-card-main">
                  <Link to={`/items/${claim.item._id}`} className="claim-card-title">{claim.item.title}</Link>
                  <p className="claim-card-msg">{claim.message.length > 120 ? claim.message.slice(0, 120) + '…' : claim.message}</p>
                </div>
                <span className={`badge badge-${claim.status}`}>{claim.status}</span>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
