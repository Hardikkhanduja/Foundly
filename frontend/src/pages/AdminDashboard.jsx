import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
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
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      const [sr, ur] = await Promise.all([getAdminStats(), getAdminUsers()]);
      if (sr.error) toast.error(sr.error.message); else setStats(sr.data);
      setStatsLoading(false);
      if (!ur.error) setUsers(ur.data);
      setUsersLoading(false);
    }
    load();
  }, []);

  async function handleDelete() {
    setDeleting(true);
    const { error: err } = await deleteAdminUser(deleteTarget);
    setDeleting(false);
    setDeleteTarget(null);
    if (err) { toast.error(err.message); return; }
    toast.success('User deleted.');
    setUsers(prev => prev.filter(u => u._id !== deleteTarget));
  }

  return (
    <div className="admin-wrap">
      <h1>Admin</h1>

      <div className="admin-section">
        <div className="section-title">Overview</div>
        {statsLoading ? <LoadingSpinner /> : !stats ? null : (
          <div className="stats-grid">
            <div className="stat-card stat-card-blue">
              <div className="stat-card-num">{stats.totalItems}</div>
              <div className="stat-card-label">Total items</div>
            </div>
            <div className="stat-card stat-card-green">
              <div className="stat-card-num">{stats.resolvedItems}</div>
              <div className="stat-card-label">Resolved</div>
            </div>
            <div className="stat-card stat-card-yellow">
              <div className="stat-card-num">{stats.pendingClaims}</div>
              <div className="stat-card-label">Pending claims</div>
            </div>
            <div className="stat-card stat-card-purple">
              <div className="stat-card-num">{stats.totalUsers}</div>
              <div className="stat-card-label">Users</div>
            </div>
          </div>
        )}
      </div>

      <div className="admin-section">
        <div className="section-title">Users</div>
        {usersLoading ? <LoadingSpinner /> : users.length === 0 ? (
          <div className="empty" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-2)' }}>
            ✅ No users in the system yet.
          </div>
        ) : (
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
                  <td style={{ fontWeight: 500 }}>{u.name}</td>
                  <td style={{ color: 'var(--text-2)' }}>{u.email}</td>
                  <td><span className={`role-badge role-${u.role}`}>{u.role}</span></td>
                  <td style={{ color: '#71717a', fontSize: 13 }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    {user._id !== u._id && (
                      <button className="btn-del" onClick={() => setDeleteTarget(u._id)}>Delete</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3>Delete this user?</h3>
            <p>This cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn btn-secondary btn-sm" onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</button>
              <button className="btn btn-danger btn-sm" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
