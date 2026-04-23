import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const PAGE_SIZE = 25;
const UNDO_WINDOW_MS = 15000;
const EMPTY_LOG_FILTERS = {
  action: '',
  actor: '',
  target: '',
  from: '',
  to: '',
  sortBy: 'createdAt',
  sortOrder: 'desc'
};

const EMPTY_USER_FILTERS = {
  accountType: '',
  sortBy: 'createdAt',
  sortOrder: 'desc'
};

const ACCOUNT_TYPE_BADGE_CLASSES = {
  student: 'border border-academy-soft bg-academy-soft-secondary text-academy-deep',
  instructor: 'border border-accent-secondary/30 bg-accent/10 text-accent-secondary',
  admin: 'border border-error/30 bg-error/10 text-error'
};

const RECENT_CHANGE_ACTION_LABELS = {
  PROMOTE_USER: 'Promoted',
  DEMOTE_USER: 'Demoted',
  CHANGE_ACCOUNT_TYPE: 'Changed role for'
};

const formatRelativeTime = (dateValue) => {
  const timestamp = new Date(dateValue).getTime();
  if (Number.isNaN(timestamp)) return 'Unknown time';

  const seconds = Math.max(1, Math.floor((Date.now() - timestamp) / 1000));
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;

  const years = Math.floor(months / 12);
  return `${years}y ago`;
};

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [criticalChanges, setCriticalChanges] = useState([]);
  const [search, setSearch] = useState('');
  const [usersPage, setUsersPage] = useState(1);
  const [usersPagination, setUsersPagination] = useState({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 });
  const [userFilters, setUserFilters] = useState(EMPTY_USER_FILTERS);
  const [showUserFilters, setShowUserFilters] = useState(false);
  const [roleCounts, setRoleCounts] = useState({ student: 0, instructor: 0, admin: 0, totalUsers: 0 });
  const [loading, setLoading] = useState(true);
  const [logsPage, setLogsPage] = useState(1);
  const [logsPagination, setLogsPagination] = useState({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 });
  const [logsFilters, setLogsFilters] = useState(EMPTY_LOG_FILTERS);
  const [showLogFilters, setShowLogFilters] = useState(false);
  const [logsLoading, setLogsLoading] = useState(true);
  const [savingUserId, setSavingUserId] = useState(null);
  const [error, setError] = useState('');
  const [logsError, setLogsError] = useState('');
  const [criticalLoading, setCriticalLoading] = useState(true);
  const [criticalError, setCriticalError] = useState('');
  const [actionError, setActionError] = useState('');
  const [reasonModal, setReasonModal] = useState({
    isOpen: false,
    userId: '',
    nextType: 'student',
    previousType: 'student',
    userLabel: ''
  });
  const [reasonText, setReasonText] = useState('');
  const [reasonError, setReasonError] = useState('');
  const [undoAction, setUndoAction] = useState(null);
  const [undoTimeLeft, setUndoTimeLeft] = useState(0);

  const fetchUsers = async (page = 1, searchTerm = '', filters = userFilters) => {
    try {
      setLoading(true);
      setError('');
      setActionError('');
      const query = new URLSearchParams();
      if (searchTerm.trim()) query.set('search', searchTerm.trim());
      if (filters.accountType) query.set('accountType', filters.accountType);
      query.set('sortBy', filters.sortBy || 'createdAt');
      query.set('sortOrder', filters.sortOrder || 'desc');
      query.set('page', String(page));
      query.set('limit', String(PAGE_SIZE));

      const response = await fetch(`/api/admin/users?${query.toString()}`, {
        credentials: 'include'
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load users');
      }

      setUsers(data.users || []);
      setUsersPagination(data.pagination || { page, limit: PAGE_SIZE, total: 0, totalPages: 1 });
      setUsersPage(page);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1, search, EMPTY_USER_FILTERS);
    fetchLogs(1, EMPTY_LOG_FILTERS);
    fetchUserStats();
    fetchCriticalChanges();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCriticalChanges = async () => {
    try {
      setCriticalLoading(true);
      setCriticalError('');

      const response = await fetch('/api/admin/audit-logs/critical?limit=5', {
        credentials: 'include'
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load critical changes');
      }

      setCriticalChanges(data.logs || []);
    } catch (err) {
      console.error(err);
      setCriticalError(err.message || 'Failed to load critical changes');
    } finally {
      setCriticalLoading(false);
    }
  };

  useEffect(() => {
    if (!undoAction?.expiresAt) {
      setUndoTimeLeft(0);
      return undefined;
    }

    const tick = () => {
      const nextMs = Math.max(0, undoAction.expiresAt - Date.now());
      setUndoTimeLeft(nextMs);
      if (nextMs <= 0) {
        setUndoAction(null);
      }
    };

    tick();
    const intervalId = setInterval(tick, 250);
    return () => clearInterval(intervalId);
  }, [undoAction]);

  const fetchUserStats = async () => {
    try {
      const response = await fetch('/api/admin/user-stats', {
        credentials: 'include'
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load user stats');
      }

      setRoleCounts({
        student: data.roleCounts?.student || 0,
        instructor: data.roleCounts?.instructor || 0,
        admin: data.roleCounts?.admin || 0,
        totalUsers: data.totalUsers || 0
      });
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLogs = async (page = 1, filters = logsFilters) => {
    try {
      setLogsLoading(true);
      setLogsError('');

      const query = new URLSearchParams();
      query.set('page', String(page));
      query.set('limit', String(PAGE_SIZE));

      if (filters.action.trim()) query.set('action', filters.action.trim());
      if (filters.actor.trim()) query.set('actor', filters.actor.trim());
      if (filters.target.trim()) query.set('target', filters.target.trim());
      if (filters.from) query.set('from', filters.from);
      if (filters.to) query.set('to', filters.to);
      query.set('sortBy', filters.sortBy || 'createdAt');
      query.set('sortOrder', filters.sortOrder || 'desc');

      const response = await fetch(`/api/admin/audit-logs?${query.toString()}`, {
        credentials: 'include'
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load admin activity');
      }

      setLogs(data.logs || []);
      setLogsPagination(data.pagination || { page, limit: PAGE_SIZE, total: 0, totalPages: 1 });
      setLogsPage(page);
    } catch (err) {
      console.error(err);
      setLogsError(err.message || 'Failed to load admin activity');
    } finally {
      setLogsLoading(false);
    }
  };

  const onSearch = async (event) => {
    event.preventDefault();
    await fetchUsers(1, search);
  };

  const clearSearch = async () => {
    setSearch('');
    await fetchUsers(1, '', userFilters);
  };

  const onUserFilterChange = (event) => {
    const { name, value } = event.target;
    setUserFilters((prev) => ({ ...prev, [name]: value }));
  };

  const onApplyUserFilters = async (event) => {
    event.preventDefault();
    await fetchUsers(1, search, userFilters);
  };

  const onClearUserFilters = async () => {
    setUserFilters(EMPTY_USER_FILTERS);
    await fetchUsers(1, search, EMPTY_USER_FILTERS);
  };

  const onLogsFilterChange = (event) => {
    const { name, value } = event.target;
    setLogsFilters((prev) => ({ ...prev, [name]: value }));
  };

  const onApplyLogFilters = async (event) => {
    event.preventDefault();
    await fetchLogs(1, logsFilters);
  };

  const onClearLogFilters = async () => {
    setLogsFilters(EMPTY_LOG_FILTERS);
    await fetchLogs(1, EMPTY_LOG_FILTERS);
  };

  const hasUserFilterOverrides =
    userFilters.accountType !== EMPTY_USER_FILTERS.accountType
    || userFilters.sortBy !== EMPTY_USER_FILTERS.sortBy
    || userFilters.sortOrder !== EMPTY_USER_FILTERS.sortOrder;

  const hasLogFilterOverrides =
    logsFilters.action !== EMPTY_LOG_FILTERS.action
    || logsFilters.actor !== EMPTY_LOG_FILTERS.actor
    || logsFilters.target !== EMPTY_LOG_FILTERS.target
    || logsFilters.from !== EMPTY_LOG_FILTERS.from
    || logsFilters.to !== EMPTY_LOG_FILTERS.to
    || logsFilters.sortBy !== EMPTY_LOG_FILTERS.sortBy
    || logsFilters.sortOrder !== EMPTY_LOG_FILTERS.sortOrder;

  const openReasonModal = (user, nextType) => {
    if (!user || !nextType || user.accountType === nextType) return;

    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    const userLabel = fullName || user.username || user.email || 'this user';

    setActionError('');
    setReasonError('');
    setReasonText('');
    setReasonModal({
      isOpen: true,
      userId: user._id,
      nextType,
      previousType: user.accountType || 'student',
      userLabel
    });
  };

  const closeReasonModal = () => {
    if (savingUserId) return;

    setReasonModal({
      isOpen: false,
      userId: '',
      nextType: 'student',
      previousType: 'student',
      userLabel: ''
    });
    setReasonText('');
    setReasonError('');
  };

  const updateAccountType = async (userId, nextType, reason, options = {}) => {
    const { previousType = '', userLabel = '', fromUndo = false } = options;

    try {
      setSavingUserId(userId);
      setActionError('');
      const response = await fetch(`/api/admin/users/${userId}/account-type`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ accountType: nextType, reason })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update account type');
      }

      await fetchUsers(usersPage, search, userFilters);
      fetchLogs(1, logsFilters);
      fetchUserStats();
      fetchCriticalChanges();

      if (fromUndo) {
        setUndoAction(null);
      } else {
        setUndoAction({
          userId,
          previousType: previousType || reasonModal.previousType,
          nextType,
          userLabel: userLabel || reasonModal.userLabel,
          expiresAt: Date.now() + UNDO_WINDOW_MS
        });
      }

      closeReasonModal();
    } catch (err) {
      if (!fromUndo) {
        setReasonError(err.message || 'Failed to update account type');
      }
      setActionError(err.message || 'Failed to update account type');
    } finally {
      setSavingUserId(null);
    }
  };

  const submitAccountTypeUpdate = async (event) => {
    event.preventDefault();
    const trimmedReason = reasonText.trim();

    if (!trimmedReason) {
      setReasonError('Reason is required.');
      return;
    }

    await updateAccountType(reasonModal.userId, reasonModal.nextType, trimmedReason, {
      previousType: reasonModal.previousType,
      userLabel: reasonModal.userLabel
    });
  };

  const onUndoLastRoleChange = async () => {
    if (!undoAction || savingUserId) return;

    const undoReason = `Undo recent admin role change (${undoAction.nextType} -> ${undoAction.previousType}).`;
    await updateAccountType(undoAction.userId, undoAction.previousType, undoReason, {
      fromUndo: true
    });
  };

  return (
    <div className="min-h-screen bg-main-bg px-4 py-9">
      <div className="mx-auto flex w-full max-w-[1160px] flex-col gap-5">
        <div className="flex flex-col gap-4 rounded-xl border border-light-secondary border-t-4 border-t-accent-secondary bg-white p-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-accent-secondary">Control Center</p>
            <h1 className="mt-1 text-2xl font-bold text-dark">Admin Dashboard</h1>
            <p className="mt-2 max-w-[700px] text-sm text-dark-tertiary">
              Manage tutorial publishing access, account roles, and admin activity in one place.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <button
              type="button"
              className="rounded-md border border-light-primary bg-white px-3 py-2 text-sm font-semibold text-dark-secondary transition hover:bg-light-tertiary"
              onClick={() => fetchUsers(usersPage, search)}
            >
              Refresh Users
            </button>
            <Link
              to="/academy/create/tutorial"
              className="rounded-md bg-accent px-3 py-2 text-sm font-semibold text-white transition hover:bg-accent-secondary"
            >
              Create Tutorial
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-light-secondary bg-white p-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.04em] text-dark-tertiary">Students</h3>
            <p className="mt-2 text-3xl font-extrabold text-dark">{roleCounts.student}</p>
          </div>
          <div className="rounded-xl border border-light-secondary bg-white p-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.04em] text-dark-tertiary">Instructors</h3>
            <p className="mt-2 text-3xl font-extrabold text-dark">{roleCounts.instructor}</p>
          </div>
          <div className="rounded-xl border border-light-secondary bg-white p-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.04em] text-dark-tertiary">Admins</h3>
            <p className="mt-2 text-3xl font-extrabold text-dark">{roleCounts.admin}</p>
          </div>
          <div className="rounded-xl border border-accent-secondary bg-accent/10 p-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.04em] text-dark">Total Users</h3>
            <p className="mt-2 text-3xl font-extrabold text-dark">{roleCounts.totalUsers}</p>
          </div>
        </div>

        <div className="rounded-xl border border-light-secondary bg-white p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-dark">Recent Changes</h2>
              <p className="mt-1 text-sm text-dark-tertiary">Latest role changes across admin activity.</p>
            </div>
            <button
              type="button"
              className="rounded-md border border-light-primary bg-white px-3 py-1.5 text-sm font-semibold text-dark-secondary transition hover:bg-light-tertiary"
              onClick={fetchCriticalChanges}
            >
              Refresh
            </button>
          </div>

          {criticalLoading ? (
            <p className="rounded-lg border border-dashed border-light-primary bg-light-tertiary px-4 py-3 text-sm text-dark-tertiary">
              Loading critical changes...
            </p>
          ) : criticalError ? (
            <p className="rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">{criticalError}</p>
          ) : criticalChanges.length === 0 ? (
            <p className="rounded-lg border border-dashed border-light-primary bg-light-tertiary px-4 py-3 text-sm text-dark-tertiary">
              No critical role changes logged yet.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {criticalChanges.map((log) => {
                const actorName = log.actor?.email || log.actor?.username || log.actor?.identifier || 'Unknown actor';
                const targetName = log.target?.email || log.target?.username || 'Target user';
                const absoluteTime = new Date(log.createdAt).toLocaleString();
                const relativeTime = formatRelativeTime(log.createdAt);
                const actionLabel = RECENT_CHANGE_ACTION_LABELS[log.action] || log.action;

                return (
                  <div key={log._id} className="rounded-lg border border-light-secondary bg-white px-3 py-2">
                    <p className="text-sm text-dark-secondary">
                      <strong>{actionLabel}</strong> {targetName} by {actorName}
                    </p>
                    <p className="mt-0.5 text-xs text-dark-tertiary">
                      Role: {log.before?.accountType || 'n/a'} -&gt; {log.after?.accountType || 'n/a'}
                    </p>
                    <span className="mt-0.5 inline-block text-xs text-dark-tertiary" title={absoluteTime}>
                      {relativeTime}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-light-secondary bg-white p-4">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-bold text-dark">User Access</h2>
              <p className="mt-1 text-sm text-dark-tertiary">Search users and update account roles with audit reasons.</p>
            </div>
            <form onSubmit={onSearch} className="flex flex-col gap-2">
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, username, or email"
                className="min-w-[360px] rounded-md border border-light-primary px-3 py-2 text-sm text-dark outline-none transition focus:border-accent"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="submit"
                  className="rounded-md bg-accent px-3 py-2 text-sm font-semibold text-white transition hover:bg-accent-secondary"
                >
                  Search
                </button>
                <button
                  type="button"
                  className="rounded-md border border-light-primary bg-light-tertiary px-3 py-2 text-sm font-semibold text-dark-secondary transition hover:bg-light-secondary disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-light-tertiary"
                  onClick={clearSearch}
                  disabled={!search.trim()}
                >
                  Clear
                </button>
                <button
                  type="button"
                  className="rounded-md border border-light-primary bg-white px-3 py-2 text-sm font-semibold text-dark-secondary transition hover:bg-light-tertiary"
                  onClick={() => setShowUserFilters((prev) => !prev)}
                >
                  {showUserFilters ? 'Hide Filters' : 'Filters'}
                </button>
              </div>
            </form>

            {showUserFilters ? (
              <form onSubmit={onApplyUserFilters} className="mt-1 flex flex-wrap items-center gap-2">
                <select
                  name="accountType"
                  value={userFilters.accountType}
                  onChange={onUserFilterChange}
                  className="rounded-md border border-light-primary bg-white px-3 py-2 text-sm text-dark-secondary outline-none transition focus:border-accent"
                >
                  <option value="">All account types</option>
                  <option value="student">Student</option>
                  <option value="instructor">Instructor</option>
                  <option value="admin">Admin</option>
                </select>
                <select
                  name="sortBy"
                  value={userFilters.sortBy}
                  onChange={onUserFilterChange}
                  className="rounded-md border border-light-primary bg-white px-3 py-2 text-sm text-dark-secondary outline-none transition focus:border-accent"
                >
                  <option value="createdAt">Sort: Created Date</option>
                  <option value="firstName">Sort: First Name</option>
                  <option value="username">Sort: Username</option>
                  <option value="email">Sort: Email</option>
                  <option value="accountType">Sort: Account Type</option>
                </select>
                <select
                  name="sortOrder"
                  value={userFilters.sortOrder}
                  onChange={onUserFilterChange}
                  className="rounded-md border border-light-primary bg-white px-3 py-2 text-sm text-dark-secondary outline-none transition focus:border-accent"
                >
                  <option value="desc">Newest / Z-A</option>
                  <option value="asc">Oldest / A-Z</option>
                </select>
                <button
                  type="submit"
                  className="rounded-md bg-accent px-3 py-2 text-sm font-semibold text-white transition hover:bg-accent-secondary"
                >
                  Apply
                </button>
                <button
                  type="button"
                  onClick={onClearUserFilters}
                  disabled={!hasUserFilterOverrides}
                  className="rounded-md border border-light-primary bg-white px-3 py-2 text-sm font-semibold text-dark-secondary transition hover:bg-light-tertiary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Clear Filters
                </button>
              </form>
            ) : null}
          </div>

          {actionError ? (
            <p className="mb-4 rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">{actionError}</p>
          ) : null}

          {undoAction && undoTimeLeft > 0 ? (
            <div className="mb-4 flex flex-col gap-2 rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-dark-secondary">
                Role updated for <span className="font-semibold">{undoAction.userLabel}</span>. Undo available for {Math.ceil(undoTimeLeft / 1000)}s.
              </p>
              <button
                type="button"
                onClick={onUndoLastRoleChange}
                disabled={Boolean(savingUserId)}
                className="w-fit rounded-md border border-warning/50 bg-white px-3 py-1.5 text-sm font-semibold text-dark-secondary transition hover:bg-warning/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Undo
              </button>
            </div>
          ) : null}

          {loading ? (
            <p className="rounded-lg border border-dashed border-light-primary bg-light-tertiary px-4 py-3 text-sm text-dark-tertiary">Loading users...</p>
          ) : error ? (
            <p className="rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">{error}</p>
          ) : users.length === 0 ? (
            <p className="rounded-lg border border-dashed border-light-primary bg-light-tertiary px-4 py-3 text-sm text-dark-tertiary">
              No users found for the current filters.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-light-tertiary">
                  <tr>
                    <th className="border-b border-light-secondary px-2 py-3 text-left text-sm font-bold text-dark-tertiary">Name</th>
                    <th className="border-b border-light-secondary px-2 py-3 text-left text-sm font-bold text-dark-tertiary">Username</th>
                    <th className="border-b border-light-secondary px-2 py-3 text-left text-sm font-bold text-dark-tertiary">Email</th>
                    <th className="border-b border-light-secondary px-2 py-3 text-left text-sm font-bold text-dark-tertiary">Account Type</th>
                    <th className="border-b border-light-secondary px-2 py-3 text-left text-sm font-bold text-dark-tertiary">Change Type</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown';
                    const disabled = savingUserId === user._id;

                    return (
                      <tr key={user._id}>
                        <td className="border-b border-light-tertiary px-2 py-3 text-sm text-dark-secondary">{fullName}</td>
                        <td className="border-b border-light-tertiary px-2 py-3 text-sm text-dark-secondary">{user.username}</td>
                        <td className="border-b border-light-tertiary px-2 py-3 text-sm text-dark-secondary">{user.email}</td>
                        <td className="border-b border-light-tertiary px-2 py-3">
                          <span
                            className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                              ACCOUNT_TYPE_BADGE_CLASSES[user.accountType] || 'border border-light-primary bg-light-tertiary text-dark'
                            }`}
                          >
                            {user.accountType}
                          </span>
                        </td>
                        <td className="border-b border-light-tertiary px-2 py-3">
                          <select
                            value={user.accountType}
                            disabled={disabled}
                            aria-label={`Change role for ${fullName}`}
                            onChange={(event) => openReasonModal(user, event.target.value)}
                            className={`rounded-md border px-2.5 py-2 text-sm font-semibold capitalize outline-none transition focus:ring-2 focus:ring-offset-1 ${
                              disabled ? 'cursor-not-allowed opacity-60' : ''
                            } border-light-primary bg-white text-dark-secondary`}
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

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 lg:justify-end">
            <button
              type="button"
              onClick={() => fetchUsers(usersPage - 1, search)}
              disabled={loading || usersPage <= 1}
              className="rounded-md border border-light-primary bg-white px-3 py-1.5 text-sm font-semibold text-dark-secondary transition hover:bg-light-tertiary disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-dark-tertiary">
              Page {usersPagination.page} of {Math.max(usersPagination.totalPages || 1, 1)}
            </span>
            <button
              type="button"
              onClick={() => fetchUsers(usersPage + 1, search)}
              disabled={loading || usersPage >= (usersPagination.totalPages || 1)}
              className="rounded-md border border-light-primary bg-white px-3 py-1.5 text-sm font-semibold text-dark-secondary transition hover:bg-light-tertiary disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-light-secondary bg-white p-4">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-bold text-dark">Admin Activity</h2>
              <p className="mt-1 text-sm text-dark-tertiary">Recent role and moderation actions with reasons and timestamps.</p>
            </div>
            <button
              type="button"
              className="w-fit rounded-md border border-light-primary bg-white px-3 py-2 text-sm font-semibold text-dark-secondary transition hover:bg-light-tertiary"
              onClick={() => fetchLogs(logsPage, logsFilters)}
            >
              Refresh
            </button>
            <button
              type="button"
              className="w-fit rounded-md border border-light-primary bg-white px-3 py-2 text-sm font-semibold text-dark-secondary transition hover:bg-light-tertiary"
              onClick={() => setShowLogFilters((prev) => !prev)}
            >
              {showLogFilters ? 'Hide Filters' : 'Filters'}
            </button>
          </div>

          {showLogFilters ? (
            <form onSubmit={onApplyLogFilters} className="mb-4 grid grid-cols-1 gap-2 lg:grid-cols-6">
              <select
                name="action"
                value={logsFilters.action}
                onChange={onLogsFilterChange}
                className="rounded-md border border-light-primary bg-white px-3 py-2 text-sm text-dark-secondary outline-none transition focus:border-accent"
              >
                <option value="">All actions</option>
                <option value="PROMOTE_USER">Promotions</option>
                <option value="DEMOTE_USER">Demotions</option>
                <option value="CHANGE_ACCOUNT_TYPE">Role changes</option>
              </select>
              <input
                type="text"
                name="actor"
                value={logsFilters.actor}
                onChange={onLogsFilterChange}
                placeholder="Actor"
                className="rounded-md border border-light-primary bg-white px-3 py-2 text-sm text-dark-secondary outline-none transition focus:border-accent"
              />
              <input
                type="text"
                name="target"
                value={logsFilters.target}
                onChange={onLogsFilterChange}
                placeholder="Target"
                className="rounded-md border border-light-primary bg-white px-3 py-2 text-sm text-dark-secondary outline-none transition focus:border-accent"
              />
              <input
                type="date"
                name="from"
                value={logsFilters.from}
                onChange={onLogsFilterChange}
                className="rounded-md border border-light-primary bg-white px-3 py-2 text-sm text-dark-secondary outline-none transition focus:border-accent"
              />
              <input
                type="date"
                name="to"
                value={logsFilters.to}
                onChange={onLogsFilterChange}
                className="rounded-md border border-light-primary bg-white px-3 py-2 text-sm text-dark-secondary outline-none transition focus:border-accent"
              />
              <select
                name="sortBy"
                value={logsFilters.sortBy}
                onChange={onLogsFilterChange}
                className="rounded-md border border-light-primary bg-white px-3 py-2 text-sm text-dark-secondary outline-none transition focus:border-accent"
              >
                <option value="createdAt">Sort: Timestamp</option>
                <option value="action">Sort: Action</option>
                <option value="actor.email">Sort: Actor</option>
                <option value="target.email">Sort: Target</option>
              </select>
              <select
                name="sortOrder"
                value={logsFilters.sortOrder}
                onChange={onLogsFilterChange}
                className="rounded-md border border-light-primary bg-white px-3 py-2 text-sm text-dark-secondary outline-none transition focus:border-accent"
              >
                <option value="desc">Newest / Z-A</option>
                <option value="asc">Oldest / A-Z</option>
              </select>
              <div className="flex items-center justify-end gap-2 lg:justify-start">
                <button
                  type="submit"
                  className="rounded-md bg-accent px-3 py-2 text-sm font-semibold text-white transition hover:bg-accent-secondary"
                >
                  Apply
                </button>
                <button
                  type="button"
                  onClick={onClearLogFilters}
                  disabled={!hasLogFilterOverrides}
                  className="rounded-md border border-light-primary bg-white px-3 py-2 text-sm font-semibold text-dark-secondary transition hover:bg-light-tertiary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Clear
                </button>
              </div>
            </form>
          ) : null}

          {logsLoading ? (
            <p className="rounded-lg border border-dashed border-light-primary bg-light-tertiary px-4 py-3 text-sm text-dark-tertiary">Loading activity...</p>
          ) : logsError ? (
            <p className="rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">{logsError}</p>
          ) : logs.length === 0 ? (
            <p className="rounded-lg border border-dashed border-light-primary bg-light-tertiary px-4 py-3 text-sm text-dark-tertiary">No admin activity logged yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {logs.map((log) => {
                const actorName = log.actor?.email || log.actor?.username || log.actor?.identifier || 'Unknown actor';
                const targetName = log.target?.email || log.target?.username || log.target?.title || log.target?.tutorialId || 'Target';
                const targetId = log.target?.tutorialId;

                return (
                  <div key={log._id} className="rounded-lg border border-light-secondary bg-white px-3 py-2.5">
                    <p className="text-sm text-dark-secondary">
                      <strong>{log.action}</strong> by <strong>{actorName}</strong>
                    </p>
                    {targetName && <p className="mt-0.5 text-sm text-dark-secondary">Target: {targetName}</p>}
                    {targetId && targetName !== targetId && (
                      <p className="mt-0.5 text-xs text-dark-tertiary">ID: {targetId}</p>
                    )}
                    {log.before?.accountType || log.after?.accountType ? (
                      <p className="mt-0.5 text-sm text-dark-secondary">
                        Role: {log.before?.accountType || 'n/a'} -&gt; {log.after?.accountType || 'n/a'}
                      </p>
                    ) : null}
                    {log.reason ? <p className="mt-0.5 text-sm text-dark-secondary">Reason: {log.reason}</p> : null}
                    <span className="mt-1 inline-block text-xs text-dark-tertiary">{new Date(log.createdAt).toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 lg:justify-end">
            <button
              type="button"
              onClick={() => fetchLogs(logsPage - 1, logsFilters)}
              disabled={logsLoading || logsPage <= 1}
              className="rounded-md border border-light-primary bg-white px-3 py-1.5 text-sm font-semibold text-dark-secondary transition hover:bg-light-tertiary disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-dark-tertiary">
              Page {logsPagination.page} of {Math.max(logsPagination.totalPages || 1, 1)}
            </span>
            <button
              type="button"
              onClick={() => fetchLogs(logsPage + 1, logsFilters)}
              disabled={logsLoading || logsPage >= (logsPagination.totalPages || 1)}
              className="rounded-md border border-light-primary bg-white px-3 py-1.5 text-sm font-semibold text-dark-secondary transition hover:bg-light-tertiary disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {reasonModal.isOpen ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-dark/50 px-4" onClick={closeReasonModal}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="audit-reason-title"
            className="w-full max-w-md rounded-xl border border-light-secondary bg-white p-5 shadow-lg"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 id="audit-reason-title" className="text-lg font-bold text-dark">Reason Required</h3>
            <p className="mt-2 text-sm text-dark-tertiary">
              Enter a reason for changing <span className="font-semibold text-dark">{reasonModal.userLabel}</span> to
              <span className="ml-1 font-semibold capitalize text-dark">{reasonModal.nextType}</span>.
            </p>

            <form className="mt-4" onSubmit={submitAccountTypeUpdate}>
              <label htmlFor="audit-reason-input" className="mb-1 block text-sm font-semibold text-dark-secondary">
                Audit reason
              </label>
              <textarea
                id="audit-reason-input"
                value={reasonText}
                onChange={(event) => {
                  setReasonText(event.target.value);
                  if (reasonError) setReasonError('');
                }}
                rows={4}
                placeholder="State why this account type change is needed"
                className="w-full resize-none rounded-md border border-light-primary px-3 py-2 text-sm text-dark outline-none transition focus:border-accent"
              />
              {reasonError ? <p className="mt-2 text-sm text-error">{reasonError}</p> : null}

              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={closeReasonModal}
                  disabled={Boolean(savingUserId)}
                  className="rounded-md border border-light-primary bg-white px-3 py-2 text-sm font-semibold text-dark-secondary transition hover:bg-light-tertiary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={Boolean(savingUserId)}
                  className="rounded-md bg-accent px-3 py-2 text-sm font-semibold text-white transition hover:bg-accent-secondary disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingUserId ? 'Saving...' : 'Save Change'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default AdminDashboard;
