import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { registerUser } from '../api/client';
import './Register.css';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const auth = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    const errors = {};
    if (!name.trim()) errors.name = 'Name is required.';
    if (!email.trim()) errors.email = 'Email is required.';
    if (!password) errors.password = 'Password is required.';
    else if (password.length < 6) errors.password = 'Password must be at least 6 characters.';
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }

    setFieldErrors({});
    setLoading(true);
    const { data, error: apiError } = await registerUser(name, email, password);
    setLoading(false);

    if (apiError) { toast.error(apiError.message); return; }

    auth.login(data.token, { _id: data._id, name: data.name, email: data.email, role: data.role });
    toast.success('Account created! Welcome to Foundly.');
    navigate('/');
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create account</h2>
        <p className="auth-subtitle">Join the community</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
            />
            {fieldErrors.name && <span className="field-error">{fieldErrors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
            {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              autoComplete="new-password"
            />
            {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
