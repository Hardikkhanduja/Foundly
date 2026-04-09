import { useState } from 'react';
import { toast } from 'react-toastify';
import { createClaim } from '../api/client';
import './ClaimForm.css';

export default function ClaimForm({ itemId, contactPhone, onSuccess, onCancel }) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!message.trim() || message.trim().length < 20) {
      setError('Please describe your claim in at least 20 characters.');
      return;
    }
    setLoading(true);
    setError('');
    const { error: apiError } = await createClaim(itemId, message);
    setLoading(false);
    if (apiError) { setError(apiError.message); return; }
    toast.success('Claim submitted!');
    onSuccess();
  }

  return (
    <form className="claim-form" onSubmit={handleSubmit}>
      <h3>Submit a claim</h3>
      {error && <div className="error-message">{error}</div>}
      <label className="claim-form-label" htmlFor="claim-msg">
        Your reason for claiming this item
      </label>
      <textarea
        id="claim-msg"
        className="claim-form-textarea"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Describe identifying details — when and where you lost it, any unique features..."
      />
      <div className="claim-form-actions">
        <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit claim'}
        </button>
        <button type="button" className="btn btn-secondary btn-sm" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
        {contactPhone && contactPhone.replace(/\D/g, '').length >= 7 && (
          <a
            href={`https://wa.me/${contactPhone.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-whatsapp btn-sm"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: 5 }}>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
            </svg>
            WhatsApp
          </a>
        )}
      </div>
    </form>
  );
}
