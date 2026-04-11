import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  adminGetStats,
  adminGetUsers,
  adminGetItems,
  adminUpdateRole,
  adminDeleteUser,
  adminDeleteItem,
} from '../services/api';
import Navbar from '../components/Navbar';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlineOutlined';
import ArticleIcon from '@mui/icons-material/Article';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';

function MetricTile({ label, value, accent }) {
  return (
    <div className="flex flex-col gap-1 p-5 rounded-2xl bg-white border border-zinc-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <span className={`text-3xl font-bold tracking-tight ${accent}`}>{value}</span>
      <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{label}</span>
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState('users');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      navigate('/feed', { replace: true });
      return;
    }
    loadAll();
  }, [user, navigate]);

  async function loadAll() {
    setLoading(true);
    try {
      const [statsRes, usersRes, itemsRes] = await Promise.all([
        adminGetStats(),
        adminGetUsers(),
        adminGetItems(),
      ]);
      setStats(statsRes.data?.data);
      setUsers(usersRes.data?.data || []);
      setItems(itemsRes.data?.data || []);
    } catch {
      setFeedback({ type: 'error', message: 'Failed to load admin data.' });
    } finally {
      setLoading(false);
    }
  }

  async function handleRoleToggle(userId, currentRole) {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    try {
      await adminUpdateRole(userId, newRole);
      await loadAll();
      setFeedback({ type: 'success', message: `Role updated to ${newRole}.` });
    } catch {
      setFeedback({ type: 'error', message: 'Failed to update role.' });
    }
  }

  async function handleDeleteUser(userId) {
    if (!window.confirm('Remove this user and all their data?')) return;
    try {
      await adminDeleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setFeedback({ type: 'success', message: 'User removed.' });
    } catch {
      setFeedback({ type: 'error', message: 'Failed to delete user.' });
    }
  }

  async function handleDeleteItem(itemId) {
    if (!window.confirm('Remove this item post?')) return;
    try {
      await adminDeleteItem(itemId);
      setItems((prev) => prev.filter((i) => i.id !== itemId));
      setFeedback({ type: 'success', message: 'Item removed.' });
    } catch {
      setFeedback({ type: 'error', message: 'Failed to delete item.' });
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-[80dvh] flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-3 border-maroon-200 border-t-maroon-700 animate-spin" />
        </div>
      </>
    );
  }

  const tabClass = (t) =>
    `px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
      tab === t
        ? 'bg-maroon-800 text-white shadow-sm'
        : 'text-zinc-600 hover:bg-zinc-100'
    }`;

  return (
    <>
      <Navbar />
      <main className="max-w-[1100px] mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Admin Dashboard</h1>
            <p className="text-sm text-zinc-500 mt-1">Manage users, items, and system health.</p>
          </div>
        </div>

        {feedback && (
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl mb-6 text-sm font-medium animate-fade-in-up ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
                : 'bg-red-50 text-red-800 border border-red-200/60'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircleOutlinedIcon sx={{ fontSize: 18 }} />
            ) : (
              <ErrorOutlineOutlinedIcon sx={{ fontSize: 18 }} />
            )}
            {feedback.message}
          </div>
        )}

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <MetricTile label="Total Users" value={stats.totalUsers} accent="text-maroon-800" />
            <MetricTile label="Total Items" value={stats.totalItems} accent="text-zinc-900" />
            <MetricTile label="Lost Reports" value={stats.lostCount} accent="text-red-600" />
            <MetricTile label="Found Reports" value={stats.foundCount} accent="text-emerald-600" />
          </div>
        )}

        <div className="flex items-center gap-2 mb-6">
          <button onClick={() => setTab('users')} className={tabClass('users')}>
            <span className="flex items-center gap-1.5">
              <PersonOutlineIcon sx={{ fontSize: 16 }} />
              Users ({users.length})
            </span>
          </button>
          <button onClick={() => setTab('items')} className={tabClass('items')}>
            <span className="flex items-center gap-1.5">
              <ArticleIcon sx={{ fontSize: 16 }} />
              Items ({items.length})
            </span>
          </button>
        </div>

        {tab === 'users' && (
          <div className="bg-white rounded-2xl border border-zinc-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
            {users.length === 0 ? (
              <EmptyState icon={<PersonOutlineIcon sx={{ fontSize: 40, color: '#d4d4d8' }} />} text="No users found." />
            ) : (
              <div className="divide-y divide-zinc-100">
                <div className="hidden sm:grid grid-cols-[1fr_1fr_120px_100px_80px] gap-4 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 bg-zinc-50/60">
                  <span>Name</span>
                  <span>Email</span>
                  <span>Student ID</span>
                  <span>Role</span>
                  <span />
                </div>
                {users.map((u, i) => (
                  <div
                    key={u.email}
                    className={`grid grid-cols-1 sm:grid-cols-[1fr_1fr_120px_100px_80px] gap-2 sm:gap-4 px-5 py-3.5 items-center hover:bg-zinc-50/60 transition-colors animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}
                  >
                    <span className="text-sm font-semibold text-zinc-900 truncate">
                      {u.firstName} {u.lastName}
                    </span>
                    <span className="text-sm text-zinc-600 truncate">{u.email}</span>
                    <span className="text-sm text-zinc-500 font-mono">{u.studentId || '-'}</span>
                    <button
                      onClick={() => handleRoleToggle(u.id, u.role)}
                      className={`w-fit px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-all duration-200 active:scale-[0.95] ${
                        u.role === 'ADMIN'
                          ? 'bg-gold-100 text-gold-800 border border-gold-300/60 hover:bg-gold-200'
                          : 'bg-zinc-100 text-zinc-600 border border-zinc-200/60 hover:bg-zinc-200'
                      }`}
                    >
                      {u.role}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      className="w-fit p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                      title="Delete user"
                    >
                      <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'items' && (
          <div className="bg-white rounded-2xl border border-zinc-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
            {items.length === 0 ? (
              <EmptyState icon={<InboxOutlinedIcon sx={{ fontSize: 40, color: '#d4d4d8' }} />} text="No items posted yet." />
            ) : (
              <div className="divide-y divide-zinc-100">
                <div className="hidden sm:grid grid-cols-[1fr_120px_1fr_80px_60px] gap-4 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 bg-zinc-50/60">
                  <span>Item Name</span>
                  <span>Lost/Found</span>
                  <span>Location</span>
                  <span>Holding</span>
                  <span />
                </div>
                {items.map((item, i) => (
                  <div
                    key={item.id}
                    className={`grid grid-cols-1 sm:grid-cols-[1fr_120px_1fr_80px_60px] gap-2 sm:gap-4 px-5 py-3.5 items-center hover:bg-zinc-50/60 transition-colors animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}
                  >
                    <a
                      href={`/items/${item.id}`}
                      className="text-sm font-semibold text-zinc-900 truncate hover:text-maroon-700 transition-colors"
                    >
                      {item.name}
                    </a>
                    <span
                      className={`w-fit px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                        item.status === 'LOST'
                          ? 'bg-red-50 text-red-700 border border-red-200/60'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                      }`}
                    >
                      {item.status}
                    </span>
                    <span className="text-sm text-zinc-500 truncate">{item.location || '-'}</span>
                    <span className="text-xs text-zinc-500">{item.currentStatus || '-'}</span>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="w-fit p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                      title="Delete item"
                    >
                      <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
}

function EmptyState({ icon, text }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 px-4">
      {icon}
      <p className="text-sm text-zinc-400 font-medium">{text}</p>
    </div>
  );
}
