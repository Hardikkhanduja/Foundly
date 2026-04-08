import { useState, useEffect } from 'react';
import { getItems } from '../api/client';
import ItemCard from '../components/ItemCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';
import './Home.css';

const CATEGORIES = ['Electronics', 'Documents', 'Clothing', 'Keys', 'Bags', 'Others'];

export default function Home() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [inputVal, setInputVal] = useState('');
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    const t = setTimeout(() => { setKeyword(inputVal); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [inputVal]);

  useEffect(() => { load(page); }, [page, keyword, category, type, status]); // eslint-disable-line

  async function load(p) {
    setLoading(true);
    const { data, error: err } = await getItems({ keyword, category, type, status, pageNumber: p });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setItems(data.items ?? []);
    setPages(data.pages ?? 1);
  }

  function onFilter(setter) {
    return (e) => { setter(e.target.value); setPage(1); };
  }

  return (
    <>
      <div className="home-header">
        <div className="home-header-inner">
          <h1>Foundly</h1>
          <p>Find what's lost. Return what's found.</p>
          <div className="home-search">
            <input
              type="text"
              placeholder="Search items..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="home-body">
        <div className="home-toolbar">
          <select value={category} onChange={onFilter(setCategory)}>
            <option value="">All categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select value={type} onChange={onFilter(setType)}>
            <option value="">Lost & found</option>
            <option value="lost">Lost</option>
            <option value="found">Found</option>
          </select>

          <select value={status} onChange={onFilter(setStatus)}>
            <option value="">All statuses</option>
            <option value="Open">Open</option>
            <option value="Claimed">Claimed</option>
            <option value="Resolved">Resolved</option>
          </select>

          <div className="toolbar-divider" />

          {!loading && (
            <span className="results-info">
              {items.length === 0 ? 'No results' : `${items.length} item${items.length !== 1 ? 's' : ''}`}
            </span>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}
        {loading && <LoadingSpinner />}

        {!loading && !error && items.length === 0 && (
          <div className="empty-state">
            <h3>No items found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="items-grid">
            {items.map(item => <ItemCard key={item._id} item={item} />)}
          </div>
        )}

        <Pagination page={page} pages={pages} onPageChange={setPage} />
      </div>
    </>
  );
}
