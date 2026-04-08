import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getItemById, updateItem, uploadImage } from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import './EditItem.css';

const CATEGORIES = ['Electronics', 'Documents', 'Clothing', 'Keys', 'Bags', 'Others'];

export default function EditItem() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    async function fetchItem() {
      const { data, error: fetchError } = await getItemById(id);
      setFetchLoading(false);
      if (fetchError) {
        setError(fetchError.message);
        return;
      }
      setTitle(data.title || '');
      setDescription(data.description || '');
      setCategory(data.category || '');
      setType(data.type || '');
      setLocation(data.location || '');
      // Normalize date to YYYY-MM-DD for the date input
      setDate(data.date ? data.date.slice(0, 10) : '');
      setImageUrl(data.imageUrl || '');
      if (data.imageUrl) setImagePreview(data.imageUrl);
    }
    fetchItem();
  }, [id]);

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function validate() {
    const errors = {};
    if (!title.trim()) errors.title = 'Title is required.';
    if (!description.trim()) errors.description = 'Description is required.';
    if (!category) errors.category = 'Category is required.';
    if (!type) errors.type = 'Type is required.';
    if (!location.trim()) errors.location = 'Location is required.';
    if (!date) errors.date = 'Date is required.';
    return errors;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setError('');
    setLoading(true);

    let finalImageUrl = imageUrl;

    if (imageFile) {
      const { data: uploadData, error: uploadError } = await uploadImage(imageFile);
      if (uploadError) {
        setError(uploadError.message);
        setLoading(false);
        return;
      }
      finalImageUrl = uploadData.imageUrl;
    }

    const { data, error: updateError } = await updateItem(id, {
      title,
      description,
      category,
      type,
      location,
      date,
      imageUrl: finalImageUrl,
    });

    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    navigate(`/items/${id}`);
  }

  if (fetchLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="post-wrap">
      <h2>Edit item</h2>
      <p className="page-subtitle">Update the details for this item</p>

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Blue backpack" />
          {fieldErrors.title && <span className="field-error">{fieldErrors.title}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the item in detail..." />
          {fieldErrors.description && <span className="field-error">{fieldErrors.description}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Select...</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {fieldErrors.category && <span className="field-error">{fieldErrors.category}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="type">Type</label>
            <select id="type" value={type} onChange={(e) => setType(e.target.value)}>
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
            <input id="location" type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Central Park" />
            {fieldErrors.location && <span className="field-error">{fieldErrors.location}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
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
          <input id="image" type="file" accept="image/*" className="file-upload-input" onChange={handleFileChange} />
          {imagePreview && <img src={imagePreview} alt="Preview" className="image-preview" />}
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}
