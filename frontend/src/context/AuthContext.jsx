import React, { createContext, useContext, useEffect, useState } from 'react';
import { setOnUnauthorized } from '../api/client';

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
      } else {
        const { _id, name, email, role } = decoded;
        setUser({ _id, name, email, role });
        setToken(storedToken);
      }
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    setOnUnauthorized(() => {
      localStorage.removeItem('token');
      setUser(null);
      setToken(null);
      window.location.href = '/login';
    });
  }, []);

  function login(newToken, userData) {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem('token');
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
