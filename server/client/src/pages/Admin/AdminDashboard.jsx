import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import './AdminDashboard.css';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(true);
  const [savingUserId, setSavingUserId] = useState(null);
  const [error, setError] = useState('');
  const [logsError, setLogsError] = useState('');

  const fetchUsers = async (searchTerm = '') => {
    try {
      setLoading(true);
      setError('');
      const query = new URLSearchParams();
      if (searchTerm.trim()) query.set('search', searchTerm.trim());

      const response = await fetch(`/api/admin/users?${query.toString()}`, {
        credentials: 'include'
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load users');
      }

      setUsers(data.users || []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLogsLoading(true);
      setLogsError('');

      const response = await fetch('/api/admin/audit-logs?limit=20', {
        credentials: 'include'
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load admin activity');
      }

      setLogs(data || []);
    } catch (err) {
      console.error(err);
      setLogsError(err.message || 'Failed to load admin activity');
    } finally {
      setLogsLoading(false);
    }
  };

  const onSearch = async (event) => {
    event.preventDefault();
    await fetchUsers(search);
  };

  const roleCounts = useMemo(() => {
    return users.reduce(
      (acc, user) => {
        const type = user.accountType || 'student';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      },
      { student: 0, instructor: 0, admin: 0 }
    );
  }, [users]);

  const updateAccountType = async (userId, nextType) => {
    try {
      const reason = window.prompt('Reason for account type change (required for audit log):');
      if (!reason || !reason.trim()) {
        return;
      }

      setSavingUserId(userId);
      const response = await fetch(`/api/admin/users/${userId}/account-type`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ accountType: nextType, reason: reason.trim() })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update account type');
      }

      setUsers((prev) => prev.map((user) => (
        user._id === userId ? { ...user, accountType: data.user.accountType } : user
      )));
      fetchLogs();
    } catch (err) {
      alert(err.message || 'Failed to update account type');
    } finally {
      setSavingUserId(null);
    }
  };

  return (
    <div className="admin-dashboard-page">
      <div className="admin-dashboard-container">
        <div className="admin-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Manage tutorial content access and user account types.</p>
          </div>
          <Link to="/academy/create/tutorial" className="admin-primary-link">
            + Create Tutorial
          </Link>
        </div>

        <div className="admin-summary-grid">
          <div className="summary-card">
            <h3>Students</h3>
            <p>{roleCounts.student}</p>
          </div>
          <div className="summary-card">
            <h3>Instructors</h3>
            <p>{roleCounts.instructor}</p>
          </div>
          <div className="summary-card">
            <h3>Admins</h3>
            <p>{roleCounts.admin}</p>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h2>User Access</h2>
            <form onSubmit={onSearch} className="admin-search-form">
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, username, or email"
              />
              <button type="submit">Search</button>
            </form>
          </div>

          {loading ? (
            <p>Loading users...</p>
          ) : error ? (
            <p className="admin-error">{error}</p>
          ) : users.length === 0 ? (
            <p>No users found.</p>
          ) : (
            <div className="admin-users-table-wrapper">
              <table className="admin-users-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Account Type</th>
                    <th>Change Type</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown';
                    const disabled = savingUserId === user._id;

                    return (
                      <tr key={user._id}>
                        <td>{fullName}</td>
                        <td>{user.username}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`account-badge ${user.accountType}`}>{user.accountType}</span>
                        </td>
                        <td>
                          <select
                            value={user.accountType}
                            disabled={disabled}
                            onChange={(event) => updateAccountType(user._id, event.target.value)}
                          >
                            <option value="student">student</option>
                            <option value="instructor">instructor</option>
                            <option value="admin">admin</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h2>Admin Activity</h2>
            <button type="button" className="refresh-activity-btn" onClick={fetchLogs}>
              Refresh
            </button>
          </div>

          {logsLoading ? (
            <p>Loading activity...</p>
          ) : logsError ? (
            <p className="admin-error">{logsError}</p>
          ) : logs.length === 0 ? (
            <p>No activity logged yet.</p>
          ) : (
            <div className="activity-list">
              {logs.map((log) => {
                const actorName = log.actor?.email || log.actor?.username || log.actor?.identifier || 'Unknown actor';
                const targetName = log.target?.email || log.target?.username || log.target?.tutorialId || 'Target';

                return (
                  <div className="activity-item" key={log._id}>
                    <p>
                      <strong>{log.action}</strong> by <strong>{actorName}</strong>
                    </p>
                    <p>Target: {targetName}</p>
                    {log.before?.accountType || log.after?.accountType ? (
                      <p>
                        Role: {log.before?.accountType || 'n/a'} -&gt; {log.after?.accountType || 'n/a'}
                      </p>
                    ) : null}
                    {log.reason ? <p>Reason: {log.reason}</p> : null}
                    <span>{new Date(log.createdAt).toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
