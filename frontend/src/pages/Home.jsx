import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getItems, getItemStats } from '../api/client';
import ItemCard from '../components/ItemCard';
import LoadingSpinner from '../components/LoadingSpinner';
import './Home.css';

function useCountUp(target, duration = 1500) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!target) return;
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

const IconReport = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
);

const IconSearch = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const IconHandshake = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const STEPS = [
  { Icon: IconReport,    title: 'Report It',   desc: 'Post your lost or found item with a photo and details.' },
  { Icon: IconSearch,    title: 'Search It',   desc: 'Browse listings and filter by category, type, or location.' },
  { Icon: IconHandshake, title: 'Recover It',  desc: 'Submit a claim and reconnect with your belongings.' },
];

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 2 + Math.random() * 3,
  delay: Math.random() * 4,
  duration: 4 + Math.random() * 4,
}));

export default function Home() {
  const [recentItems, setRecentItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [heroVisible, setHeroVisible] = useState(false);
  const [stepsVisible, setStepsVisible] = useState(false);
  const stepsRef = useRef(null);

  const totalCount    = useCountUp(stats?.total);
  const resolvedCount = useCountUp(stats?.resolved);
  const activeCount   = useCountUp(stats?.active);

  useEffect(() => {
    setTimeout(() => setHeroVisible(true), 100);
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setStepsVisible(true); },
      { threshold: 0.2 }
    );
    if (stepsRef.current) obs.observe(stepsRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);

      // Fetch items and stats in parallel
      const [itemsRes, statsRes] = await Promise.all([
        getItems({ pageNumber: 1 }),
        getItemStats(),
      ]);

      const items = itemsRes.data?.items ?? [];
      setRecentItems(items.slice(0, 6));

      if (statsRes.data && (statsRes.data.total > 0 || statsRes.data.resolved >= 0)) {
        setStats(statsRes.data);
      } else {
        // fallback: derive from items response
        const total = itemsRes.data?.pages
          ? itemsRes.data.pages * 10 - (10 - items.length)
          : items.length;
        setStats({
          total,
          resolved: items.filter(i => i.status === 'Resolved').length,
          active: items.filter(i => i.status === 'Open' || i.status === 'Claimed').length,
        });
      }

      setLoading(false);
    }
    load();
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="hero-particles">
          {PARTICLES.map(p => (
            <span key={p.id} className="hero-particle" style={{
              left: `${p.x}%`, top: `${p.y}%`,
              width: p.size, height: p.size,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }} />
          ))}
        </div>

        <div className={`hero-content${heroVisible ? ' visible' : ''}`}>
          <div className="hero-badge">
            Find what's lost. Return what's found.
          </div>
          <h1>
            Lost something?<br />
            <span className="hero-highlight">We'll help you find it.</span>
          </h1>
          <p>Foundly connects people who've lost items with those who've found them — fast, simple, and free.</p>
          <div className="hero-btns">
            <Link to="/browse" className="btn btn-primary hero-btn-main">Browse Items</Link>
            <Link to="/post-item" className="btn btn-outline">Report an Item</Link>
          </div>
        </div>
      </section>

      {/* Stats bar — always render, shows 0 until data loads */}
      <div className="stats-bar">
        <div className="stat-item">
          <div className="stat-num">{totalCount.toLocaleString()}</div>
          <div className="stat-label">Items Posted</div>
        </div>
        <div className="stat-item">
          <div className="stat-num">{resolvedCount.toLocaleString()}</div>
          <div className="stat-label">Reunited</div>
        </div>
        <div className="stat-item">
          <div className="stat-num">{activeCount.toLocaleString()}</div>
          <div className="stat-label">Active Now</div>
        </div>
      </div>

      {/* How it works */}
      <section className="how-section" ref={stepsRef}>
        <div className="how-label">Simple process</div>
        <h2>How Foundly works</h2>
        <div className="how-steps">
          {STEPS.map(({ Icon, title, desc }, i) => (
            <div
              key={title}
              className={`how-step${stepsVisible ? ' visible' : ''}`}
              style={{ transitionDelay: `${i * 0.15}s` }}
            >
              <div className="how-step-num">{i + 1}</div>
              <div className="how-step-icon"><Icon /></div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent items */}
      <section className="recent-section">
        <div className="section-header">
          <div>
            <h2>Recent Items</h2>
            <p className="section-sub">Latest posts from the community</p>
          </div>
          <Link to="/browse" className="btn btn-ghost btn-sm">View all →</Link>
        </div>

        {loading ? <LoadingSpinner /> : recentItems.length === 0 ? (
          <div className="home-empty">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#3a3a3a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            </svg>
            <p>No items posted yet. Be the first!</p>
            <Link to="/post-item" className="btn btn-primary btn-sm">Post an item</Link>
          </div>
        ) : (
          <div className="items-grid">
            {recentItems.map(item => <ItemCard key={item._id} item={item} />)}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <Link to="/browse" className="btn btn-secondary">View All Items</Link>
        </div>
      </section>
    </>
  );
}
