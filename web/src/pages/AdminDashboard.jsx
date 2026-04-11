import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  adminGetStats,
  adminGetUsers,
  adminGetItems,
  adminUpdateRole,
  adminDeleteUser,
  adminToggleSuspend,
  adminDeleteItem,
  adminResolveItem,
  adminUnresolveItem,
  adminGetClaims,
  adminGetCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
} from '../services/api';
import Navbar from '../components/Navbar';
import AdminConfirmModal from '../components/AdminConfirmModal';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlineOutlined';
import ArticleIcon from '@mui/icons-material/Article';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import UndoOutlinedIcon from '@mui/icons-material/UndoOutlined';
import ListAltIcon from '@mui/icons-material/ListAlt';
import BlockIcon from '@mui/icons-material/Block';
import CheckIcon from '@mui/icons-material/Check';

function MetricTile({ label, value, accent }) {
  return (
    <div className="flex flex-col gap-1 p-5 rounded-2xl bg-white border border-zinc-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:-translate-y-px">
      <span className={`text-3xl font-bold tracking-tight ${accent}`}>{value}</span>
      <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{label}</span>
    </div>
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

function StatusBadge({ status }) {
  const map = {
    LOST: 'bg-red-50 text-red-700 border-red-200/60',
    FOUND: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    RESOLVED: 'bg-zinc-100 text-zinc-500 border-zinc-200/60',
  };
  return (
    <span className={`w-fit px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${map[status] || map.LOST}`}>
      {status}
    </span>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState('users');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [catForm, setCatForm] = useState({ open: false, id: null, name: '' });
  const [catSaving, setCatSaving] = useState(false);
  /** LOST | FOUND — chosen in unresolve modal */
  const [unresolveRestore, setUnresolveRestore] = useState('LOST');

  const currentUserId = user?.id != null ? Number(user.id) : null;
  const isSameUser = useCallback(
    (rowUserId) => currentUserId != null && Number(rowUserId) === currentUserId,
    [currentUserId],
  );

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      navigate('/feed', { replace: true });
      return;
    }
    loadAll();
  }, [user, navigate]);

  useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(() => setFeedback(null), 4000);
    return () => clearTimeout(t);
  }, [feedback]);

  async function loadAll() {
    setLoading(true);
    const results = await Promise.allSettled([
      adminGetStats(),
      adminGetUsers(),
      adminGetItems(),
      adminGetClaims(),
      adminGetCategories(),
    ]);
    const pick = (i) => (results[i].status === 'fulfilled' ? results[i].value : null);
    const failLabels = ['stats', 'users', 'items', 'claims', 'categories'];
    const failed = results
      .map((r, i) => (r.status === 'rejected' ? failLabels[i] : null))
      .filter(Boolean);

    const statsRes = pick(0);
    const usersRes = pick(1);
    const itemsRes = pick(2);
    const claimsRes = pick(3);
    const catsRes = pick(4);

    if (statsRes) setStats(statsRes.data?.data);
    if (usersRes) setUsers(usersRes.data?.data || []);
    if (itemsRes) setItems(itemsRes.data?.data || []);
    if (claimsRes) setClaims(claimsRes.data?.data || []);
    if (catsRes) setCategories(catsRes.data?.data || []);

    if (failed.length > 0) {
      setFeedback({
        type: 'error',
        message: `Could not load: ${failed.join(', ')}. Check that the backend is running the latest version.`,
      });
    }
    setLoading(false);
  }

  function closeConfirm() {
    if (!confirmLoading) setConfirm(null);
  }

  async function executeConfirm() {
    if (!confirm) return;
    setConfirmLoading(true);
    try {
      if (confirm.type === 'deleteUser') {
        await adminDeleteUser(confirm.user.id);
        setUsers((prev) => prev.filter((u) => u.id !== confirm.user.id));
        setFeedback({ type: 'success', message: 'User removed.' });
      } else if (confirm.type === 'role') {
        await adminUpdateRole(confirm.user.id, confirm.nextRole);
        await loadAll();
        setFeedback({ type: 'success', message: `Role updated to ${confirm.nextRole}.` });
      } else if (confirm.type === 'deleteItem') {
        await adminDeleteItem(confirm.item.id);
        setItems((prev) => prev.filter((i) => i.id !== confirm.item.id));
        setFeedback({ type: 'success', message: 'Item removed.' });
      } else if (confirm.type === 'resolveItem') {
        const res = await adminResolveItem(confirm.item.id);
        const dto = res.data?.data;
        setItems((prev) =>
          prev.map((i) =>
            i.id === confirm.item.id
              ? {
                  ...i,
                  status: dto?.status || 'RESOLVED',
                  statusBeforeResolve: dto?.statusBeforeResolve ?? i.status,
                }
              : i,
          ),
        );
        setStats((prev) =>
          prev
            ? {
                ...prev,
                resolvedCount: (prev.resolvedCount || 0) + 1,
              }
            : prev,
        );
        setFeedback({ type: 'success', message: 'Item marked as resolved.' });
      } else if (confirm.type === 'unresolveItem') {
        const res = await adminUnresolveItem(confirm.item.id, unresolveRestore);
        const dto = res.data?.data;
        setItems((prev) =>
          prev.map((i) =>
            i.id === confirm.item.id
              ? {
                  ...i,
                  status: dto?.status || unresolveRestore,
                  statusBeforeResolve: dto?.statusBeforeResolve ?? null,
                }
              : i,
          ),
        );
        setStats((prev) =>
          prev
            ? {
                ...prev,
                resolvedCount: Math.max(0, (prev.resolvedCount || 0) - 1),
              }
            : prev,
        );
        setFeedback({ type: 'success', message: `Item restored as ${unresolveRestore}.` });
      } else if (confirm.type === 'suspendUser') {
        const res = await adminToggleSuspend(confirm.user.id);
        const updated = res.data?.data;
        setUsers((prev) =>
          prev.map((u) =>
            u.id === confirm.user.id ? { ...u, suspended: updated?.suspended ?? !u.suspended } : u,
          ),
        );
        setFeedback({
          type: 'success',
          message: updated?.suspended ? 'User suspended.' : 'User unsuspended.',
        });
      } else if (confirm.type === 'deleteCategory') {
        await adminDeleteCategory(confirm.category.id);
        setCategories((prev) => prev.filter((c) => c.id !== confirm.category.id));
        setFeedback({ type: 'success', message: 'Category deleted.' });
      }
      setConfirm(null);
    } catch {
      const msgs = {
        deleteUser: 'Failed to delete user.',
        role: 'Failed to update role.',
        suspendUser: 'Failed to toggle suspension.',
        deleteItem: 'Failed to delete item.',
        resolveItem: 'Failed to resolve item.',
        unresolveItem: 'Failed to restore item.',
        deleteCategory: 'Failed to delete category.',
      };
      setFeedback({ type: 'error', message: msgs[confirm.type] || 'Action failed.' });
    } finally {
      setConfirmLoading(false);
    }
  }

  async function handleCatSave() {
    if (!catForm.name.trim()) return;
    setCatSaving(true);
    try {
      if (catForm.id) {
        await adminUpdateCategory(catForm.id, catForm.name.trim());
        setCategories((prev) =>
          prev.map((c) => (c.id === catForm.id ? { ...c, name: catForm.name.trim() } : c)),
        );
        setFeedback({ type: 'success', message: 'Category updated.' });
      } else {
        const res = await adminCreateCategory(catForm.name.trim());
        const created = res.data?.data;
        if (created) setCategories((prev) => [...prev, created]);
        setFeedback({ type: 'success', message: 'Category created.' });
      }
      setCatForm({ open: false, id: null, name: '' });
    } catch {
      setFeedback({ type: 'error', message: 'Failed to save category.' });
    } finally {
      setCatSaving(false);
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

  const tabs = [
    { key: 'users', label: 'Users', icon: <PersonOutlineIcon sx={{ fontSize: 16 }} />, count: users.length },
    { key: 'items', label: 'Items', icon: <ArticleIcon sx={{ fontSize: 16 }} />, count: items.length },
    { key: 'claims', label: 'Claims', icon: <VisibilityOutlinedIcon sx={{ fontSize: 16 }} />, count: claims.length },
    { key: 'categories', label: 'Categories', icon: <ListAltIcon sx={{ fontSize: 16 }} />, count: categories.length },
  ];

  const tabClass = (t) =>
    `px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
      tab === t
        ? 'bg-maroon-800 text-white shadow-sm'
        : 'text-zinc-600 hover:bg-zinc-100'
    }`;

  function formatTimestamp(ts) {
    if (!ts) return '-';
    const d = new Date(ts);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  const confirmTitle = {
    deleteUser: 'Delete this user?',
    role: 'Change user role?',
    suspendUser: confirm?.user?.suspended ? 'Unsuspend this user?' : 'Suspend this user?',
    deleteItem: 'Delete this item?',
    resolveItem: 'Resolve this item?',
    unresolveItem: 'Restore item to feed?',
    deleteCategory: 'Delete this category?',
  };

  const confirmLabel = {
    deleteUser: 'Delete user',
    role: 'Change role',
    suspendUser: confirm?.user?.suspended ? 'Unsuspend' : 'Suspend',
    deleteItem: 'Delete item',
    resolveItem: 'Resolve',
    unresolveItem: 'Restore',
    deleteCategory: 'Delete category',
  };

  const confirmVariant =
    confirm?.type === 'role' ||
    confirm?.type === 'resolveItem' ||
    confirm?.type === 'unresolveItem' ||
    (confirm?.type === 'suspendUser' && confirm?.user?.suspended)
      ? 'default'
      : 'danger';

  return (
    <>
      <Navbar />
      <main className="max-w-[1100px] mx-auto px-4 sm:px-6 py-10">
        {/* ─── Header ─── */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Admin Dashboard</h1>
          <p className="text-sm text-zinc-500 mt-1 max-w-2xl leading-relaxed">
            Manage users, items, review contact-info claims, and configure categories.
          </p>
        </div>

        {/* ─── Feedback toast ─── */}
        {feedback && (
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl mb-6 text-sm font-medium transition-all duration-300 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
                : 'bg-red-50 text-red-800 border border-red-200/60'
            }`}
            style={{ animation: 'fadeInUp 0.25s cubic-bezier(0.16,1,0.3,1)' }}
          >
            {feedback.type === 'success' ? (
              <CheckCircleOutlinedIcon sx={{ fontSize: 18 }} />
            ) : (
              <ErrorOutlineOutlinedIcon sx={{ fontSize: 18 }} />
            )}
            {feedback.message}
          </div>
        )}

        {/* ─── Stats row ─── */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
            <MetricTile label="Total Users" value={stats.totalUsers} accent="text-maroon-800" />
            <MetricTile label="Total Items" value={stats.totalItems} accent="text-zinc-900" />
            <MetricTile label="Lost" value={stats.lostCount} accent="text-red-600" />
            <MetricTile label="Found" value={stats.foundCount} accent="text-emerald-600" />
            <MetricTile label="Resolved" value={stats.resolvedCount ?? 0} accent="text-zinc-500" />
            <MetricTile label="Claims" value={stats.claimsCount ?? 0} accent="text-amber-700" />
            <MetricTile label="Suspended" value={stats.suspendedCount ?? 0} accent="text-red-500" />
          </div>
        )}

        {/* ─── Tab bar ─── */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} className={tabClass(t.key)}>
              <span className="flex items-center gap-1.5">
                {t.icon}
                {t.label} ({t.count})
              </span>
            </button>
          ))}
        </div>

        {/* ════════════ USERS TAB ════════════ */}
        {tab === 'users' && (
          <div className="bg-white rounded-2xl border border-zinc-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
            {users.length === 0 ? (
              <EmptyState icon={<PersonOutlineIcon sx={{ fontSize: 40, color: '#d4d4d8' }} />} text="No users found." />
            ) : (
              <div className="divide-y divide-zinc-100">
                <div className="hidden sm:grid grid-cols-[1fr_1fr_120px_100px_100px] gap-4 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 bg-zinc-50/60">
                  <span>Name</span>
                  <span>Email</span>
                  <span>Student ID</span>
                  <span>Role</span>
                  <span className="text-right">Actions</span>
                </div>
                {users.map((u, i) => {
                  const nextRole = u.role === 'ADMIN' ? 'USER' : 'ADMIN';
                  const blockSelfDemote = isSameUser(u.id) && u.role === 'ADMIN' && nextRole === 'USER';
                  const isAdmin = u.role === 'ADMIN';
                  return (
                    <div
                      key={u.id}
                      className={`grid grid-cols-1 sm:grid-cols-[1fr_1fr_120px_100px_100px] gap-2 sm:gap-4 px-5 py-3.5 items-center hover:bg-zinc-50/60 transition-colors ${u.suspended ? 'bg-red-50/40' : ''}`}
                      style={{ animation: `fadeInUp 0.3s cubic-bezier(0.16,1,0.3,1) ${Math.min(i, 12) * 40}ms both` }}
                    >
                      <span className="text-sm font-semibold text-zinc-900 truncate flex items-center gap-2">
                        {u.firstName} {u.lastName}
                        {u.suspended && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-red-100 text-red-700 border border-red-200/60">
                            Suspended
                          </span>
                        )}
                      </span>
                      <span className="text-sm text-zinc-600 truncate">{u.email}</span>
                      <span className="text-sm text-zinc-500 font-mono">{u.studentId || '-'}</span>
                      <button
                        type="button"
                        disabled={blockSelfDemote}
                        onClick={() => setConfirm({ type: 'role', user: u, nextRole })}
                        title={blockSelfDemote ? 'You cannot remove your own admin role here.' : 'Change role'}
                        className={`w-fit px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-200 active:scale-[0.95] border ${
                          blockSelfDemote
                            ? 'opacity-50 cursor-not-allowed bg-zinc-50 text-zinc-400 border-zinc-200'
                            : isAdmin
                              ? 'bg-gold-100 text-gold-800 border-gold-300/60 hover:bg-gold-200 cursor-pointer'
                              : 'bg-zinc-100 text-zinc-600 border-zinc-200/60 hover:bg-zinc-200 cursor-pointer'
                        }`}
                      >
                        {u.role}
                      </button>
                      <div className="flex items-center gap-1 justify-end">
                        {!isSameUser(u.id) && !isAdmin && (
                          <button
                            type="button"
                            onClick={() => setConfirm({ type: 'suspendUser', user: u })}
                            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                              u.suspended
                                ? 'text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50'
                                : 'text-zinc-400 hover:text-amber-600 hover:bg-amber-50'
                            }`}
                            title={u.suspended ? 'Unsuspend user' : 'Suspend user'}
                          >
                            {u.suspended ? <CheckIcon sx={{ fontSize: 16 }} /> : <BlockIcon sx={{ fontSize: 16 }} />}
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={isSameUser(u.id)}
                          onClick={() => setConfirm({ type: 'deleteUser', user: u })}
                          className={`p-1.5 rounded-lg transition-all ${
                            isSameUser(u.id)
                              ? 'text-zinc-200 cursor-not-allowed'
                              : 'text-zinc-400 hover:text-red-600 hover:bg-red-50 cursor-pointer'
                          }`}
                          title={isSameUser(u.id) ? 'You cannot delete your own account' : 'Delete user'}
                        >
                          <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ════════════ ITEMS TAB ════════════ */}
        {tab === 'items' && (
          <div className="bg-white rounded-2xl border border-zinc-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
            {items.length === 0 ? (
              <EmptyState icon={<InboxOutlinedIcon sx={{ fontSize: 40, color: '#d4d4d8' }} />} text="No items posted yet." />
            ) : (
              <div className="divide-y divide-zinc-100">
                <div className="hidden sm:grid grid-cols-[1fr_100px_1fr_80px_120px] gap-4 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 bg-zinc-50/60">
                  <span>Item</span>
                  <span>Status</span>
                  <span>Location</span>
                  <span>Holding</span>
                  <span className="text-right">Actions</span>
                </div>
                {items.map((item, i) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-1 sm:grid-cols-[1fr_100px_1fr_80px_120px] gap-2 sm:gap-4 px-5 py-3.5 items-center hover:bg-zinc-50/60 transition-colors"
                    style={{ animation: `fadeInUp 0.3s cubic-bezier(0.16,1,0.3,1) ${Math.min(i, 12) * 40}ms both` }}
                  >
                    <a
                      href={`/items/${item.id}`}
                      className="text-sm font-semibold text-zinc-900 truncate hover:text-maroon-700 transition-colors"
                    >
                      {item.title || 'Untitled'}
                    </a>
                    <StatusBadge status={item.status} />
                    <span className="text-sm text-zinc-500 truncate">{item.location || '-'}</span>
                    <span className="text-xs text-zinc-500">{item.currentStatus || '-'}</span>
                    <div className="flex items-center gap-1 justify-end">
                      {item.status !== 'RESOLVED' && (
                        <button
                          type="button"
                          onClick={() => setConfirm({ type: 'resolveItem', item })}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all cursor-pointer"
                          title="Mark as resolved"
                        >
                          <CheckCircleIcon sx={{ fontSize: 16 }} />
                        </button>
                      )}
                      {item.status === 'RESOLVED' && (
                        <button
                          type="button"
                          onClick={() => {
                            setUnresolveRestore(item.statusBeforeResolve === 'FOUND' ? 'FOUND' : 'LOST');
                            setConfirm({ type: 'unresolveItem', item });
                          }}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-amber-700 hover:bg-amber-50 transition-all cursor-pointer"
                          title="Restore to public feed"
                        >
                          <UndoOutlinedIcon sx={{ fontSize: 16 }} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setConfirm({ type: 'deleteItem', item })}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                        title="Delete item"
                      >
                        <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ════════════ CLAIMS TAB ════════════ */}
        {tab === 'claims' && (
          <div className="bg-white rounded-2xl border border-zinc-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
            {claims.length === 0 ? (
              <EmptyState
                icon={<VisibilityOutlinedIcon sx={{ fontSize: 40, color: '#d4d4d8' }} />}
                text="No contact-info reveals recorded yet."
              />
            ) : (
              <div className="divide-y divide-zinc-100">
                <div className="hidden sm:grid grid-cols-[1fr_1fr_1fr_160px] gap-4 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 bg-zinc-50/60">
                  <span>Item</span>
                  <span>Revealed By</span>
                  <span>Email</span>
                  <span>Date</span>
                </div>
                {claims.map((c, i) => (
                  <div
                    key={c.id}
                    className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_160px] gap-2 sm:gap-4 px-5 py-3.5 items-center hover:bg-zinc-50/60 transition-colors"
                    style={{ animation: `fadeInUp 0.3s cubic-bezier(0.16,1,0.3,1) ${Math.min(i, 12) * 40}ms both` }}
                  >
                    <a
                      href={`/items/${c.itemId}`}
                      className="text-sm font-semibold text-zinc-900 truncate hover:text-maroon-700 transition-colors"
                    >
                      {c.itemTitle || `Item #${c.itemId}`}
                    </a>
                    <span className="text-sm text-zinc-700 truncate">{c.userName}</span>
                    <span className="text-sm text-zinc-500 truncate">{c.userEmail}</span>
                    <span className="text-xs text-zinc-400 font-mono tabular-nums">
                      {formatTimestamp(c.revealedAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ════════════ CATEGORIES TAB ════════════ */}
        {tab === 'categories' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-500">
                {categories.length} {categories.length === 1 ? 'category' : 'categories'} configured.
              </p>
              <button
                type="button"
                onClick={() => setCatForm({ open: true, id: null, name: '' })}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-maroon-800 text-white hover:bg-maroon-700 transition-all active:scale-[0.97] cursor-pointer shadow-sm"
              >
                <AddCircleOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                Add category
              </button>
            </div>

            {/* Inline form */}
            {catForm.open && (
              <div
                className="bg-white rounded-2xl border border-zinc-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5 flex flex-col sm:flex-row items-stretch sm:items-end gap-3"
                style={{ animation: 'fadeInUp 0.25s cubic-bezier(0.16,1,0.3,1)' }}
              >
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                    {catForm.id ? 'Rename category' : 'New category name'}
                  </label>
                  <input
                    type="text"
                    value={catForm.name}
                    onChange={(e) => setCatForm((prev) => ({ ...prev, name: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && handleCatSave()}
                    placeholder="e.g. Electronics"
                    autoFocus
                    className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-maroon-200 focus:border-maroon-400 transition-all"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCatForm({ open: false, id: null, name: '' })}
                    disabled={catSaving}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-700 border border-zinc-300 hover:bg-zinc-50 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCatSave}
                    disabled={catSaving || !catForm.name.trim()}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-maroon-800 text-white hover:bg-maroon-700 transition-all cursor-pointer disabled:opacity-50 active:scale-[0.97]"
                  >
                    {catSaving ? 'Saving...' : catForm.id ? 'Update' : 'Create'}
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-zinc-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
              {categories.length === 0 ? (
                <EmptyState
                  icon={<ListAltIcon sx={{ fontSize: 40, color: '#d4d4d8' }} />}
                  text="No categories yet. Add one above."
                />
              ) : (
                <div className="divide-y divide-zinc-100">
                  <div className="hidden sm:grid grid-cols-[40px_1fr_100px] gap-4 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 bg-zinc-50/60">
                    <span>ID</span>
                    <span>Name</span>
                    <span className="text-right">Actions</span>
                  </div>
                  {categories.map((cat, i) => (
                    <div
                      key={cat.id}
                      className="grid grid-cols-[40px_1fr_100px] gap-4 px-5 py-3.5 items-center hover:bg-zinc-50/60 transition-colors"
                      style={{ animation: `fadeInUp 0.3s cubic-bezier(0.16,1,0.3,1) ${Math.min(i, 12) * 40}ms both` }}
                    >
                      <span className="text-xs text-zinc-400 font-mono">{cat.id}</span>
                      <span className="text-sm font-semibold text-zinc-900">{cat.name}</span>
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          type="button"
                          onClick={() => setCatForm({ open: true, id: cat.id, name: cat.name })}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-maroon-700 hover:bg-maroon-50 transition-all cursor-pointer"
                          title="Edit category"
                        >
                          <EditOutlinedIcon sx={{ fontSize: 16 }} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirm({ type: 'deleteCategory', category: cat })}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                          title="Delete category"
                        >
                          <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── Confirm modal ─── */}
        <AdminConfirmModal
          open={!!confirm}
          loading={confirmLoading}
          onClose={closeConfirm}
          onConfirm={executeConfirm}
          variant={confirmVariant}
          title={confirm ? confirmTitle[confirm.type] || '' : ''}
          confirmLabel={confirm ? confirmLabel[confirm.type] || 'Confirm' : 'Confirm'}
        >
          {confirm?.type === 'deleteUser' && (
            <p>
              This permanently removes{' '}
              <span className="font-semibold text-zinc-800">
                {confirm.user.firstName} {confirm.user.lastName}
              </span>{' '}
              ({confirm.user.email}) and their data from the system. This cannot be undone.
            </p>
          )}
          {confirm?.type === 'suspendUser' && (
            <p>
              {confirm.user.suspended ? 'Unsuspend' : 'Suspend'}{' '}
              <span className="font-semibold text-zinc-800">
                {confirm.user.firstName} {confirm.user.lastName}
              </span>
              ?{' '}
              {confirm.user.suspended
                ? 'They will be able to post items and reveal contact info again.'
                : 'They will be blocked from posting items and revealing contact info.'}
            </p>
          )}
          {confirm?.type === 'role' && (
            <p>
              Set{' '}
              <span className="font-semibold text-zinc-800">
                {confirm.user.firstName} {confirm.user.lastName}
              </span>{' '}
              from <span className="font-mono text-zinc-800">{confirm.user.role}</span> to{' '}
              <span className="font-mono text-zinc-800">{confirm.nextRole}</span>?
            </p>
          )}
          {confirm?.type === 'deleteItem' && (
            <p>
              Remove{' '}
              <span className="font-semibold text-zinc-800">{confirm.item.title || 'Untitled item'}</span>{' '}
              from the database. This cannot be undone.
            </p>
          )}
          {confirm?.type === 'resolveItem' && (
            <p>
              Mark{' '}
              <span className="font-semibold text-zinc-800">{confirm.item.title || 'Untitled item'}</span>{' '}
              as resolved? It will no longer appear in the public feed.
            </p>
          )}
          {confirm?.type === 'unresolveItem' && (
            <div className="space-y-3">
              <p>
                Put{' '}
                <span className="font-semibold text-zinc-800">{confirm.item.title || 'Untitled item'}</span>{' '}
                back on the public feed as:
              </p>
              {!confirm.item.statusBeforeResolve && (
                <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200/60 rounded-lg px-3 py-2">
                  This item was resolved before the system stored its previous type. Pick Lost or Found below.
                </p>
              )}
              <div className="flex flex-wrap gap-4">
                <label className="inline-flex items-center gap-2 text-sm text-zinc-700 cursor-pointer">
                  <input
                    type="radio"
                    name="unresolveRestore"
                    className="accent-maroon-800"
                    checked={unresolveRestore === 'LOST'}
                    onChange={() => setUnresolveRestore('LOST')}
                  />
                  Lost
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-zinc-700 cursor-pointer">
                  <input
                    type="radio"
                    name="unresolveRestore"
                    className="accent-maroon-800"
                    checked={unresolveRestore === 'FOUND'}
                    onChange={() => setUnresolveRestore('FOUND')}
                  />
                  Found
                </label>
              </div>
            </div>
          )}
          {confirm?.type === 'deleteCategory' && (
            <p>
              Delete the{' '}
              <span className="font-semibold text-zinc-800">{confirm.category.name}</span>{' '}
              category? Items using it will become uncategorized.
            </p>
          )}
        </AdminConfirmModal>
      </main>
    </>
  );
}
