import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getItemById, getItemClaims, deleteItem, updateClaimStatus } from '../api/client';
import { UPLOADS_URL } from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import ClaimForm from '../components/ClaimForm';
import './ItemDetail.css';

export default function ItemDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [claimsLoading, setClaimsLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [claimSuccess, setClaimSuccess] = useState('');

  useEffect(() => { fetchItem(); }, [id]); // eslint-disable-line

  async function fetchItem() {
    setLoading(true);
    const { data, error: err } = await getItemById(id);
    setLoading(false);
    if (err) { setError(err.message); return; }
    setItem(data);
    if (user && user._id === data.postedBy._id) fetchClaims();
  }

  async function fetchClaims() {
    setClaimsLoading(true);
    const { data } = await getItemClaims(id);
    setClaimsLoading(false);
    if (data) setClaims(data);
  }

  async function handleDelete() {
    if (!window.confirm('Delete this item?')) return;
    const { error: err } = await deleteItem(id);
    if (err) setActionError(err.message);
    else navigate('/dashboard');
  }

  async function handleClaimAction(claimId, status) {
    const { error: err } = await updateClaimStatus(claimId, status);
    if (err) setActionError(err.message);
    else fetchClaims();
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <div style={{ padding: 32 }}><div className="error-message">{error}</div></div>;
  if (!item) return null;

  const isOwner = user && user._id === item.postedBy._id;
  const canClaim = user && !isOwner && item.status !== 'Resolved';

  return (
    <div className="item-detail-wrap">
      {item.imageUrl ? (
        <img className="item-detail-image" src={`${UPLOADS_URL}${item.imageUrl}`} alt={item.title} />
      ) : (
        <div className="item-detail-no-image">No image provided</div>
      )}

      <div className="item-detail-badges">
        <span className={`badge badge-${item.type}`}>{item.type}</span>
        <span className={`badge badge-${item.status?.toLowerCase()}`}>{item.status}</span>
        <span className="badge" style={{ background: '#f4f4f5', color: '#52525b' }}>{item.category}</span>
      </div>

      <h1 className="item-detail-title">{item.title}</h1>
      <p className="item-detail-desc">{item.description}</p>

      <div className="item-detail-meta">
        <div className="meta-item">
          <div className="meta-label">Location</div>
          <div className="meta-value">{item.location}</div>
        </div>
        <div className="meta-item">
          <div className="meta-label">Date</div>
          <div className="meta-value">{new Date(item.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
        </div>
        <div className="meta-item">
          <div className="meta-label">Posted by</div>
          <div className="meta-value">{item.postedBy?.name}</div>
        </div>
        <div className="meta-item">
          <div className="meta-label">Posted on</div>
          <div className="meta-value">{new Date(item.createdAt).toLocaleDateString()}</div>
        </div>
      </div>

      <div className="item-detail-actions">
        {isOwner ? (
          <>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/items/${id}/edit`)}>Edit</button>
            <button className="btn btn-danger btn-sm" onClick={handleDelete}>Delete</button>
          </>
        ) : canClaim ? (
          <button className="btn btn-primary btn-sm" onClick={() => setShowClaimForm(true)}>Submit a claim</button>
        ) : !user ? (
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/login')}>Login to claim</button>
        ) : null}
      </div>

      {claimSuccess && <div className="success-message">{claimSuccess}</div>}
      {actionError && <div className="error-message">{actionError}</div>}

      {showClaimForm && (
        <ClaimForm
          itemId={id}
          onSuccess={() => { setShowClaimForm(false); setClaimSuccess('Claim submitted.'); fetchItem(); }}
          onCancel={() => setShowClaimForm(false)}
        />
      )}

      {isOwner && (
        <div className="claims-section">
          <h2>Claims ({claims.length})</h2>
          {claimsLoading ? <LoadingSpinner /> : claims.length === 0 ? (
            <p className="no-claims">No claims yet.</p>
          ) : claims.map(claim => (
            <div key={claim._id} className="claim-row">
              <div className="claim-row-info">
                <div className="claim-row-name">{claim.claimant?.name}</div>
                <div className="claim-row-msg">{claim.message}</div>
                <span className={`badge badge-${claim.status}`}>{claim.status}</span>
              </div>
              {claim.status === 'pending' && (
                <div className="claim-row-actions">
                  <button className="btn btn-primary btn-sm" onClick={() => handleClaimAction(claim._id, 'approved')}>Approve</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleClaimAction(claim._id, 'rejected')}>Reject</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
