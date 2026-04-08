import React, { createContext, useContext, useEffect, useState } from 'react';
import { setOnUnauthorized } from '../api/client';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

function decodeToken(token) {
  try {
    const payload = token.split('.')[1];
    // Handle base64url encoding
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');

    if (storedToken) {
      const decoded = decodeToken(storedToken);
      const isExpired = !decoded || decoded.exp < Date.now() / 1000;

      if (isExpired) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } else {
        const stored = localStorage.getItem('user');
        if (stored) {
          setUser(JSON.parse(stored));
        } else {
          const { _id, name, email, role } = decoded;
          setUser({ _id, name, email, role });
        }
        setToken(storedToken);
      }
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    setOnUnauthorized(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setToken(null);
      toast.info('Your session expired. Please log in again.');
      window.location.href = '/login';
    });
  }, []);

  function login(newToken, userData) {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

export default AuthProvider;
