import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/');
    setOpen(false);
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand" onClick={() => setOpen(false)}>
          Foundly
        </Link>

        <button className="navbar-menu-btn" onClick={() => setOpen(o => !o)} aria-label="Toggle menu">
          {open ? '✕' : '☰'}
        </button>

        <div className={`navbar-links${open ? ' open' : ''}`}>
          <NavLink to="/" end onClick={() => setOpen(false)}>Browse</NavLink>

          {!user ? (
            <>
              <NavLink to="/login" onClick={() => setOpen(false)}>Login</NavLink>
              <NavLink to="/register" onClick={() => setOpen(false)}>Sign up</NavLink>
            </>
          ) : (
            <>
              {user.role === 'admin' && (
                <NavLink to="/admin" onClick={() => setOpen(false)}>Admin</NavLink>
              )}
              <NavLink to="/dashboard" onClick={() => setOpen(false)}>Dashboard</NavLink>
              <NavLink to="/post-item" className="navbar-post" onClick={() => setOpen(false)}>
                Post item
              </NavLink>
              <button className="navbar-logout" onClick={handleLogout}>Logout</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
