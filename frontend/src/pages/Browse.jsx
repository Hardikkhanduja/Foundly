import { useState, useEffect, useMemo } from 'react';
import { getItems } from '../api/client';
import ItemCard from '../components/ItemCard';
import SkeletonCard from '../components/SkeletonCard';
import Pagination from '../components/Pagination';

const CATEGORIES = ['Electronics', 'Documents', 'Clothing', 'Keys', 'Bags', 'Others'];
const PAGE_SIZE = 8;

export default function Browse() {
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('Open');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await getItems({ pageNumber: 1 });
      if (data) {
        let items = data.items ?? [];
        if (data.pages > 1) {
          const rest = await Promise.all(
            Array.from({ length: data.pages - 1 }, (_, i) => getItems({ pageNumber: i + 2 }))
          );
          rest.forEach(r => { if (r.data) items = [...items, ...(r.data.items ?? [])]; });
        }
        setAllItems(items);
      }
      setLoading(false);
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let result = allItems.filter(item => {
      if (q && !item.title.toLowerCase().includes(q) && !item.description?.toLowerCase().includes(q)) return false;
      if (category && item.category !== category) return false;
      if (type && item.type !== type) return false;
      if (status && item.status !== status) return false;
      return true;
    });

    if (sort === 'newest') result = [...result].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    else if (sort === 'oldest') result = [...result].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    else if (sort === 'az') result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    else if (sort === 'za') result = [...result].sort((a, b) => b.title.localeCompare(a.title));

    return result;
  }, [allItems, search, category, type, status, sort]);

  const pages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function clearFilters() {
    setSearch(''); setCategory(''); setType(''); setStatus('Open'); setSort('newest'); setPage(1);
  }

  const hasFilters = search || category || type || status !== 'Open' || sort !== 'newest';

  function onFilterChange(setter) {
    return (e) => { setter(e.target.value); setPage(1); };
  }

  return (
    <div className="browse-wrap">
      <div className="browse-header">
        <h1>Browse Items</h1>
        {!loading && <p>Showing {filtered.length} item{filtered.length !== 1 ? 's' : ''}</p>}
      </div>

      <div className="browse-toolbar">
        <div className="browse-search">
          <input
            type="text"
            placeholder="Search by title or description..."
            value={search}
            onChange={onFilterChange(setSearch)}
          />
        </div>

        <div className="browse-filters">
          <select value={category} onChange={onFilterChange(setCategory)}>
            <option value="">All categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select value={type} onChange={onFilterChange(setType)}>
            <option value="">Lost & Found</option>
            <option value="lost">Lost</option>
            <option value="found">Found</option>
          </select>

          <select value={status} onChange={onFilterChange(setStatus)}>
            <option value="Open">Open only</option>
            <option value="">All statuses</option>
            <option value="Claimed">Claimed</option>
            <option value="Resolved">Resolved</option>
          </select>

          <select value={sort} onChange={onFilterChange(setSort)}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="az">A → Z</option>
            <option value="za">Z → A</option>
          </select>

          {hasFilters && (
            <button className="btn btn-ghost btn-sm" onClick={clearFilters}>Clear filters</button>
          )}
        </div>
      </div>

      {loading && (
        <div className="items-grid">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="browse-empty">
          <p>🔍</p>
          <span>No items found. Try adjusting your search or filters.</span>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <>
          <div className="items-grid">
            {paginated.map(item => <ItemCard key={item._id} item={item} />)}
          </div>
          <Pagination page={page} pages={pages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
