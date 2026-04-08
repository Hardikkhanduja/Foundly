import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAdminStats, getAdminUsers, deleteAdminUser } from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [statsError, setStatsError] = useState('');
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    async function load() {
      const [sr, ur] = await Promise.all([getAdminStats(), getAdminUsers()]);
      if (sr.error) setStatsError(sr.error.message); else setStats(sr.data);
      setStatsLoading(false);
      if (!ur.error) setUsers(ur.data);
      setUsersLoading(false);
    }
    load();
  }, []);

  async function handleDelete(id) {
    if (!window.confirm('Delete this user?')) return;
    setDeleteError('');
    const { error: err } = await deleteAdminUser(id);
    if (err) setDeleteError(err.message);
    else setUsers(prev => prev.filter(u => u._id !== id));
  }

  return (
    <div className="admin-wrap">
      <h1>Admin</h1>

      <div className="admin-section">
        <div className="section-title">Overview</div>
        {statsLoading ? <LoadingSpinner /> : statsError ? (
          <div className="error-message">{statsError}</div>
        ) : (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-card-num">{stats.totalItems}</div>
              <div className="stat-card-label">Total items</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-num">{stats.resolvedItems}</div>
              <div className="stat-card-label">Resolved</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-num">{stats.pendingClaims}</div>
              <div className="stat-card-label">Pending claims</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-num">{stats.totalUsers}</div>
              <div className="stat-card-label">Users</div>
            </div>
          </div>
        )}
      </div>

      <div className="admin-section">
        <div className="section-title">Users</div>
        {deleteError && <div className="error-message">{deleteError}</div>}
        {usersLoading ? <LoadingSpinner /> : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td style={{ fontWeight: 500, color: '#0a0a0a' }}>{u.name}</td>
                  <td style={{ color: '#52525b' }}>{u.email}</td>
                  <td><span className={`role-badge role-${u.role}`}>{u.role}</span></td>
                  <td style={{ color: '#71717a', fontSize: 13 }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    {user._id !== u._id && (
                      <button className="btn-del" onClick={() => handleDelete(u._id)}>Delete</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
