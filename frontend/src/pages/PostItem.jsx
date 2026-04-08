import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createItem, uploadImage } from '../api/client';
import './PostItem.css';

const CATEGORIES = ['Electronics', 'Documents', 'Clothing', 'Keys', 'Bags', 'Others'];

export default function PostItem() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', category: '', type: '', location: '', date: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  function set(key) { return (e) => setForm(f => ({ ...f, [key]: e.target.value })); }

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function validate() {
    const e = {};
    if (!form.title.trim()) e.title = 'Required';
    if (!form.description.trim()) e.description = 'Required';
    if (!form.category) e.category = 'Required';
    if (!form.type) e.type = 'Required';
    if (!form.location.trim()) e.location = 'Required';
    if (!form.date) e.date = 'Required';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setFieldErrors({});
    setError('');
    setLoading(true);

    let imageUrl = '';
    if (imageFile) {
      const { data: up, error: upErr } = await uploadImage(imageFile);
      if (upErr) { setError(upErr.message); setLoading(false); return; }
      imageUrl = up.imageUrl;
    }

    const { data, error: createErr } = await createItem({ ...form, imageUrl });
    setLoading(false);
    if (createErr) { setError(createErr.message); return; }
    navigate(`/items/${data._id}`);
  }

  return (
    <div className="post-wrap">
      <h2>Post an item</h2>
      <p className="page-subtitle">Report a lost or found item to the community</p>

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input id="title" type="text" value={form.title} onChange={set('title')} placeholder="e.g. Black wallet with ID cards" />
          {fieldErrors.title && <span className="field-error">{fieldErrors.title}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="desc">Description</label>
          <textarea id="desc" value={form.description} onChange={set('description')} placeholder="Describe the item — color, brand, any identifying features..." />
          {fieldErrors.description && <span className="field-error">{fieldErrors.description}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select id="category" value={form.category} onChange={set('category')}>
              <option value="">Select...</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {fieldErrors.category && <span className="field-error">{fieldErrors.category}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="type">Type</label>
            <select id="type" value={form.type} onChange={set('type')}>
              <option value="">Select...</option>
              <option value="lost">Lost</option>
              <option value="found">Found</option>
            </select>
            {fieldErrors.type && <span className="field-error">{fieldErrors.type}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input id="location" type="text" value={form.location} onChange={set('location')} placeholder="Where was it lost/found?" />
            {fieldErrors.location && <span className="field-error">{fieldErrors.location}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input id="date" type="date" value={form.date} onChange={set('date')} />
            {fieldErrors.date && <span className="field-error">{fieldErrors.date}</span>}
          </div>
        </div>

        <div className="form-group">
          <label>Photo (optional)</label>
          <label className="file-upload-label" htmlFor="image">
            {imageFile
              ? <><strong>{imageFile.name}</strong><span>Click to change</span></>
              : <><strong>Click to upload a photo</strong><span>JPEG, PNG, WebP</span></>
            }
          </label>
          <input id="image" type="file" accept="image/*" className="file-upload-input" onChange={handleFile} />
          {imagePreview && <img src={imagePreview} alt="Preview" className="image-preview" />}
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Posting...' : 'Post item'}
        </button>
      </form>
    </div>
  );
}
