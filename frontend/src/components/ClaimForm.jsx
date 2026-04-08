import { useState } from 'react';
import { createClaim } from '../api/client';
import './ClaimForm.css';

export default function ClaimForm({ itemId, onSuccess, onCancel }) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!message.trim()) { setError('Please describe your claim.'); return; }
    setLoading(true);
    setError('');
    const { error: apiError } = await createClaim(itemId, message);
    setLoading(false);
    if (apiError) setError(apiError.message);
    else onSuccess();
  }

  return (
    <form className="claim-form" onSubmit={handleSubmit}>
      <h3>Submit a claim</h3>
      {error && <div className="error-message">{error}</div>}
      <label className="claim-form-label" htmlFor="claim-msg">
        Why do you think this item belongs to you?
      </label>
      <textarea
        id="claim-msg"
        className="claim-form-textarea"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Describe identifying details, when and where you lost it..."
      />
      <div className="claim-form-actions">
        <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit claim'}
        </button>
        <button type="button" className="btn btn-secondary btn-sm" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
      </div>
    </form>
  );
}
