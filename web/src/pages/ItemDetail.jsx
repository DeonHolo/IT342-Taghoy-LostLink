import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import LoginModal from '../components/LoginModal';
import { useAuth } from '../context/AuthContext';
import ItemService from '../services/ItemService';
import { formatContactLine } from '../utils/contactPreference';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import UndoOutlinedIcon from '@mui/icons-material/UndoOutlined';
import ImageNotSupportedOutlinedIcon from '@mui/icons-material/ImageNotSupportedOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlineOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlineOutlined';

export default function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [revealData, setRevealData] = useState(null);
  const [revealing, setRevealing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        const data = await ItemService.getItemById(id);
        setItem(data.data || data);
      } catch {
        setError('Item not found or failed to load.');
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  const handleReveal = async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    setRevealing(true);
    try {
      const data = await ItemService.revealDetails(id);
      setRevealData(data.data || data);
      setRevealed(true);
    } catch {
      setError('Failed to reveal details. Please try again.');
    } finally {
      setRevealing(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await ItemService.deleteItem(id);
      navigate('/my-posts');
    } catch {
      setError('Failed to delete item.');
      setDeleting(false);
    }
  };

  const handleToggleResolve = async () => {
    setResolving(true);
    try {
      const data = await ItemService.toggleResolve(id);
      const updated = data.data || data;
      setItem((prev) => ({ ...prev, status: updated.status }));
    } catch {
      setError('Failed to update item status.');
    } finally {
      setResolving(false);
    }
  };

  const isOwner =
    user &&
    item &&
    (user.studentId === item.posterId || user.identifier === item.posterId);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-stone-50">
        <Navbar />
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 aspect-[4/3] rounded-2xl animate-shimmer" />
            <div className="lg:col-span-2 space-y-4">
              <div className="h-8 w-3/4 rounded-lg animate-shimmer" />
              <div className="h-5 w-1/2 rounded-lg animate-shimmer" />
              <div className="h-24 w-full rounded-lg animate-shimmer" />
              <div className="h-12 w-full rounded-lg animate-shimmer" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !item) {
    return (
      <div className="min-h-[100dvh] bg-stone-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="w-14 h-14 rounded-2xl bg-maroon-100 flex items-center justify-center mb-4">
            <ErrorOutlineIcon sx={{ fontSize: 28, color: '#7B1113' }} />
          </div>
          <h3 className="text-lg font-semibold text-zinc-900 mb-1">
            Item not found
          </h3>
          <p className="text-sm text-zinc-500 mb-4">{error}</p>
          <Link
            to="/feed"
            className="px-4 py-2 rounded-xl text-sm font-medium bg-maroon-900 text-white hover:bg-maroon-800 transition-all"
          >
            Back to Feed
          </Link>
        </div>
      </div>
    );
  }

  const isLost = item?.status === 'LOST';
  const isResolved = item?.status === 'RESOLVED';

  const contactDisplayText = formatContactLine(
    revealData?.contactPlatform ?? item?.contactPlatform,
    revealData?.contactDetails ?? item?.contactDetails,
    revealData?.contactPreference ?? item?.contactPreference
  );

  return (
    <div className="min-h-[100dvh] bg-stone-50">
      <Navbar />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-6 pb-16">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-700 transition-colors mb-6 cursor-pointer"
        >
          <ArrowBackIcon sx={{ fontSize: 18 }} />
          Back
        </button>

        {error && (
          <div className="mb-6 flex items-start gap-2.5 p-3.5 rounded-xl bg-maroon-50 border border-maroon-200 text-sm text-maroon-800 animate-fade-in-up">
            <ErrorOutlineIcon sx={{ fontSize: 18, marginTop: '1px' }} />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 animate-fade-in-up">
          <div className="lg:col-span-3">
            <div className="rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200/60">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full max-h-[480px] object-contain bg-zinc-50"
                />
              ) : (
                <div className="w-full aspect-[4/3] flex flex-col items-center justify-center text-zinc-300">
                  <ImageNotSupportedOutlinedIcon sx={{ fontSize: 64 }} />
                  <span className="text-sm mt-3 text-zinc-400">
                    No image available
                  </span>
                </div>
              )}
            </div>

            {item.aiTags && item.aiTags.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2">
                  AI-Generated Tags
                </p>
                <div className="flex flex-wrap gap-2">
                  {item.aiTags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-lg text-xs font-medium bg-gold-100 text-gold-800 border border-gold-200/60"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold tracking-wide uppercase ${
                    isResolved
                      ? 'bg-zinc-600 text-white'
                      : isLost
                        ? 'bg-maroon-900 text-white'
                        : 'bg-emerald-700 text-white'
                  }`}
                >
                  {item.status}
                </span>
                {item.category && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-zinc-100 text-zinc-600 border border-zinc-200">
                    {item.category}
                  </span>
                )}
                {item.currentStatus && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gold-100 text-gold-800 border border-gold-200/60">
                    {item.currentStatus}
                  </span>
                )}
              </div>

              <h1 className="text-2xl md:text-3xl font-bold tracking-tighter text-zinc-900 leading-tight">
                {item.title}
              </h1>
            </div>

            <p className="text-sm text-zinc-600 leading-relaxed">
              {item.description}
            </p>

            <div className="space-y-2.5 pt-2 border-t border-zinc-200">
              {item.location && (
                <div className="flex items-center gap-2.5 text-sm text-zinc-600">
                  <PlaceOutlinedIcon
                    sx={{ fontSize: 18, color: '#7B1113' }}
                  />
                  <span>{item.location}</span>
                </div>
              )}
              {item.createdAt && (
                <div className="flex items-center gap-2.5 text-sm text-zinc-600">
                  <AccessTimeIcon sx={{ fontSize: 18, color: '#7B1113' }} />
                  <span>{formatDate(item.createdAt)}</span>
                </div>
              )}
              {item.posterId && (
                <div className="flex items-center gap-2.5 text-sm text-zinc-600">
                  <PersonOutlineIcon
                    sx={{ fontSize: 18, color: '#7B1113' }}
                  />
                  <span>Posted by {item.posterId}</span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-zinc-200">
              {!isAuthenticated ? (
                <div className="p-4 rounded-xl bg-zinc-100 border border-zinc-200 text-center">
                  <LockOutlinedIcon
                    sx={{ fontSize: 24, color: '#a1a1aa' }}
                  />
                  <p className="text-sm text-zinc-600 mt-2 mb-3">
                    Sign in to view retrieval details.
                  </p>
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="inline-flex px-5 py-2.5 rounded-xl text-sm font-semibold bg-maroon-900 text-white hover:bg-maroon-800 transition-all cursor-pointer"
                  >
                    Sign In to Reveal
                  </button>
                </div>
              ) : revealed && revealData ? (
                <div className="p-4 rounded-xl bg-gold-50 border border-gold-200 animate-fade-in-up">
                  <div className="flex items-center gap-2 mb-3">
                    <LockOpenIcon sx={{ fontSize: 18, color: '#C9A227' }} />
                    <span className="text-sm font-semibold text-gold-800">
                      Retrieval Details Revealed
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-zinc-700">
                    {contactDisplayText && (
                      <p>
                        <span className="font-medium">Contact:</span>{' '}
                        {contactDisplayText}
                      </p>
                    )}
                    {(revealData?.dropoffLocation ?? item?.dropoffLocation) && (
                      <p>
                        <span className="font-medium">Drop-off:</span>{' '}
                        {revealData?.dropoffLocation ?? item?.dropoffLocation}
                      </p>
                    )}
                    {revealData?.email && (
                      <p>
                        <span className="font-medium">Email:</span>{' '}
                        {revealData.email}
                      </p>
                    )}
                    {revealData?.firstname && (
                      <p>
                        <span className="font-medium">Posted by:</span>{' '}
                        {revealData.firstname} {revealData.lastname}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleReveal}
                  disabled={revealing}
                  className="w-full py-3.5 rounded-xl text-sm font-semibold bg-gold-500 text-maroon-950 hover:bg-gold-400 active:scale-[0.98] transition-all duration-200 shadow-[0_2px_12px_rgba(201,162,39,0.3)] disabled:opacity-60 cursor-pointer"
                >
                  {revealing ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-maroon-950/30 border-t-maroon-950 rounded-full animate-spin" />
                      Revealing...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <LockOpenIcon sx={{ fontSize: 18 }} />
                      Reveal Contact / Drop-off Info
                    </span>
                  )}
                </button>
              )}
            </div>

            {isOwner && (
              <div className="space-y-3 pt-2">
                <button
                  onClick={handleToggleResolve}
                  disabled={resolving}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer disabled:opacity-60 ${
                    isResolved
                      ? 'border border-gold-300 text-gold-800 hover:bg-gold-50'
                      : 'bg-emerald-700 text-white hover:bg-emerald-600'
                  }`}
                >
                  {resolving ? (
                    <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                  ) : isResolved ? (
                    <>
                      <UndoOutlinedIcon sx={{ fontSize: 16 }} />
                      Reopen Report
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon sx={{ fontSize: 16 }} />
                      Mark as Resolved
                    </>
                  )}
                </button>
                <div className="flex gap-3">
                  <Link
                    to={`/items/${item.id}/edit`}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border border-zinc-300 text-zinc-700 hover:bg-zinc-50 hover:border-zinc-400 transition-all"
                  >
                    <EditOutlinedIcon sx={{ fontSize: 16 }} />
                    Edit
                  </Link>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border border-maroon-200 text-maroon-700 hover:bg-maroon-50 hover:border-maroon-300 transition-all cursor-pointer"
                  >
                    <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-fade-in-up">
            <h3 className="text-lg font-bold text-zinc-900 mb-2">
              Delete this item?
            </h3>
            <p className="text-sm text-zinc-500 mb-6">
              This action is permanent and cannot be undone. The item will be
              removed from the campus feed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-zinc-300 text-zinc-700 hover:bg-zinc-50 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-maroon-900 text-white hover:bg-maroon-800 transition-all disabled:opacity-60 cursor-pointer"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <LoginModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
}
