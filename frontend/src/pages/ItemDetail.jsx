import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { getItemById, getItemClaims, deleteItem, updateClaimStatus, updateItem } from '../api/client';
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [dismissedClaims, setDismissedClaims] = useState([]);

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
    setDeleting(true);
    const { error: err } = await deleteItem(id);
    setDeleting(false);
    setShowDeleteModal(false);
    if (err) { toast.error(err.message); return; }
    toast.success('Item deleted.');
    navigate('/dashboard');
  }

  async function handleClaimAction(claimId, status) {
    const { error: err } = await updateClaimStatus(claimId, status);
    if (err) { toast.error(err.message); return; }
    toast.success(status === 'approved' ? 'Claim approved.' : 'Claim rejected.');
    fetchClaims();
    fetchItem();
    // Auto-dismiss the claim row after 4 seconds
    setTimeout(() => {
      setDismissedClaims(prev => [...prev, claimId]);
    }, 4000);
  }

  async function handleMarkResolved() {
    const { error: err } = await updateItem(id, { status: 'Resolved' });
    if (err) { toast.error(err.message); return; }
    toast.success('Item marked as resolved!');
    fetchItem();
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <div style={{ padding: 32 }}><div className="error-message">{error}</div></div>;
  if (!item) return null;

  const isOwner = user && user._id === item.postedBy._id;
  const canClaim = user && !isOwner && item.status !== 'Resolved';
  const canResolve = isOwner && item.status === 'Claimed';

  return (
    <div className="item-detail-wrap">
      {item.imageUrl ? (
        <img
          className="item-detail-image"
          src={`${UPLOADS_URL}${item.imageUrl}`}
          alt={item.title}
          onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder.svg'; }}
        />
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

      {/* Contact details — visible to logged-in non-owners only */}
      {user && !isOwner && (item.contactPhone || item.contactEmail) && (
        <div className="contact-info-box">
          <div className="contact-info-title">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:6}}>
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5 19.79 19.79 0 0 1 1.61 4.9 2 2 0 0 1 3.6 2.69h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.09a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 17.5z"/>
            </svg>
            Contact the poster
          </div>
          <div className="contact-info-items">
            {item.contactPhone && (
              <div className="contact-info-row">
                <a href={`tel:${item.contactPhone}`} className="contact-info-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
                  </svg>
                  {item.contactPhone}
                </a>
                <a
                  href={`https://wa.me/${item.contactPhone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="whatsapp-btn"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </a>
              </div>
            )}
            {item.contactEmail && (
              <a href={`mailto:${item.contactEmail}`} className="contact-info-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                </svg>
                {item.contactEmail}
              </a>
            )}
          </div>
        </div>
      )}

      {user && !isOwner && !item.contactPhone && !item.contactEmail && (
        <div className="contact-info-box contact-info-empty">
          No contact details provided for this item.
        </div>
      )}

      <div className="item-detail-actions">
        {isOwner ? (
          <>
            {canResolve && (
              <button className="btn btn-success btn-sm" onClick={handleMarkResolved}>
                ✅ Mark as Resolved
              </button>
            )}
            <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/items/${id}/edit`)}>Edit</button>
            <button className="btn btn-danger btn-sm" onClick={() => setShowDeleteModal(true)}>Delete</button>
          </>
        ) : canClaim ? (
          <button className="btn btn-primary btn-sm" onClick={() => setShowClaimForm(true)}>Submit a claim</button>
        ) : !user ? (
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/login')}>Login to claim</button>
        ) : null}
      </div>

      {showClaimForm && (
        <ClaimForm
          itemId={id}
          contactPhone={item.contactPhone}
          onSuccess={() => { setShowClaimForm(false); toast.success('Claim submitted!'); fetchItem(); }}
          onCancel={() => setShowClaimForm(false)}
        />
      )}

      {isOwner && (
        <div className="claims-section">
          <h2>Claims ({claims.length})</h2>
          {claimsLoading ? <LoadingSpinner /> : claims.length === 0 ? (
            <p className="no-claims">No claims yet.</p>
          ) : claims.filter(c => !dismissedClaims.includes(c._id)).map(claim => (
            <div key={claim._id} className={`claim-row${dismissedClaims.includes(claim._id) ? ' claim-row-dismissed' : ''}`}>
              <div className="claim-row-info">
                <div className="claim-row-name">{claim.claimant?.name}</div>
                <div className="claim-row-msg">{claim.message}</div>
                <span className={`badge badge-${claim.status}`}>{claim.status}</span>
                {claim.status === 'approved' && claim.claimant?.email && (
                  <div className="claim-contact-hint">
                    Contact claimant: <a href={`mailto:${claim.claimant.email}`}>{claim.claimant.email}</a>
                  </div>
                )}
                {claim.status === 'approved' && item.contactPhone && (
                  <div className="claim-contact-hint">
                    Your number shared: <strong>{item.contactPhone}</strong>
                  </div>
                )}
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

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3>Delete this item?</h3>
            <p>This cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn btn-secondary btn-sm" onClick={() => setShowDeleteModal(false)} disabled={deleting}>
                Cancel
              </button>
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
