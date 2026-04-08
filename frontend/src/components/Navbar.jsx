import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Logo = () => (
  <svg width="22" height="22" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="navPinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3b82f6"/>
        <stop offset="100%" stopColor="#1d4ed8"/>
      </linearGradient>
    </defs>
    <path d="M50 8 C34 8 22 20 22 35 C22 54 50 88 50 88 C50 88 78 54 78 35 C78 20 66 8 50 8Z"
          fill="url(#navPinGrad)"/>
    <circle cx="50" cy="35" r="13" fill="rgba(255,255,255,0.15)" stroke="white" strokeWidth="2.5"/>
    <circle cx="47" cy="32" r="5" fill="none" stroke="white" strokeWidth="2.5"/>
    <line x1="51" y1="36" x2="55" y2="40" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  function handleLogout() {
    logout();
    toast.success('Logged out.');
    navigate('/');
    setOpen(false);
  }

  const displayName = user?.name?.split(' ')[0] || user?.email?.split('@')[0];

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand" onClick={() => setOpen(false)}>
          <Logo />
          Foundly
        </Link>

        <button className="navbar-menu-btn" onClick={() => setOpen(o => !o)} aria-label="Toggle menu">
          {open
            ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          }
        </button>

        <div className={`navbar-links${open ? ' open' : ''}`}>
          <NavLink to="/browse" onClick={() => setOpen(false)}>Browse</NavLink>

          {!user ? (
            <>
              <NavLink to="/login" onClick={() => setOpen(false)}>Login</NavLink>
              <NavLink to="/register" className="navbar-cta" onClick={() => setOpen(false)}>Sign up</NavLink>
            </>
          ) : (
            <>
              {user.role === 'admin' && (
                <NavLink to="/admin" onClick={() => setOpen(false)}>Admin</NavLink>
              )}
              <NavLink to="/dashboard" onClick={() => setOpen(false)}>Dashboard</NavLink>
              <NavLink to="/post-item" className="navbar-post" onClick={() => setOpen(false)}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Post item
              </NavLink>
              {displayName && <span className="navbar-username">Hi, {displayName}</span>}
              <button className="navbar-logout" onClick={handleLogout}>Logout</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
