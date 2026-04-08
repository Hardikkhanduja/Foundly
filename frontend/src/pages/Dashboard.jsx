import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
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
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      const [ir, cr] = await Promise.all([getMyItems(), getMyClaims()]);
      if (ir.error) toast.error(ir.error.message); else setItems(ir.data);
      setItemsLoading(false);
      if (cr.error) toast.error(cr.error.message); else setClaims(cr.data);
      setClaimsLoading(false);
    }
    load();
  }, []);

  async function handleDelete() {
    setDeleting(true);
    const { error: err } = await deleteItem(deleteTarget);
    setDeleting(false);
    setDeleteTarget(null);
    if (err) { toast.error(err.message); return; }
    toast.success('Item deleted.');
    setItems(prev => prev.filter(i => i._id !== deleteTarget));
  }

  return (
    <div className="dash-wrap">
      <div className="dash-header">
        <h1>Dashboard</h1>
        <span className="dash-user">{user?.name}</span>
      </div>

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
            <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
            <h3>No items yet</h3>
            <p>You haven't posted any items yet.</p>
            <Link to="/post-item" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>Post an item</Link>
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
                  <td><button className="btn-del" onClick={() => setDeleteTarget(item._id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      )}

      {tab === 'claims' && (
        claimsLoading ? <LoadingSpinner /> : claims.length === 0 ? (
          <div className="empty">
            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
            <h3>No claims yet</h3>
            <p>You haven't claimed any items yet.</p>
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

      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3>Delete this item?</h3>
            <p>This cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn btn-secondary btn-sm" onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</button>
              <button className="btn btn-danger btn-sm" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
