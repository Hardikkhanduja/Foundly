import { Link } from 'react-router-dom';

const LogoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="footerPinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3b82f6"/>
        <stop offset="100%" stopColor="#1d4ed8"/>
      </linearGradient>
    </defs>
    <path d="M50 8 C34 8 22 20 22 35 C22 54 50 88 50 88 C50 88 78 54 78 35 C78 20 66 8 50 8Z"
          fill="url(#footerPinGrad)"/>
    <circle cx="50" cy="35" r="13" fill="rgba(255,255,255,0.15)" stroke="white" strokeWidth="2.5"/>
    <circle cx="47" cy="32" r="5" fill="none" stroke="white" strokeWidth="2.5"/>
    <line x1="51" y1="36" x2="55" y2="40" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div className="footer-col">
            <div className="footer-brand">
              <LogoIcon />
              Foundly
            </div>
            <div className="footer-tagline">Connecting people through lost and found. Free, simple, community-driven.</div>
          </div>

          <div className="footer-col">
            <h4>Navigate</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/browse">Browse Items</Link></li>
              <li><Link to="/post-item">Report Item</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Account</h4>
            <ul>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Register</Link></li>
              <li><Link to="/dashboard">Dashboard</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Info</h4>
            <ul>
              <li><Link to="/">About</Link></li>
              <li><Link to="/">How it works</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          © 2026 Foundly — Built with React, Node.js &amp; MongoDB.
        </div>
      </div>
    </footer>
  );
}
