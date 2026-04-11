import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ItemService from '../services/ItemService';
import Navbar from '../components/Navbar';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlaceIcon from '@mui/icons-material/Place';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';

const API_BASE = 'http://localhost:8080';

export default function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [revealing, setRevealing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [error, setError] = useState('');

  const isOwner = user && item && item.posterStudentId === user.studentId;
  const hasRevealed = item?.contactPreference || item?.dropoffLocation;

  useEffect(() => {
    loadItem();
  }, [id]);

  const loadItem = async () => {
    setLoading(true);
    try {
      const res = await ItemService.getItemById(id);
      if (res.success) setItem(res.data);
    } catch (err) {
      setError('Item not found.');
    } finally {
      setLoading(false);
    }
  };

  const handleReveal = async () => {
    setRevealing(true);
    try {
      const res = await ItemService.revealDetails(id);
      if (res.success) setItem(res.data);
    } catch (err) {
      setError('Failed to reveal details. Please try again.');
    } finally {
      setRevealing(false);
    }
  };

  const handleDelete = async () => {
    try {
      await ItemService.deleteItem(id);
      navigate('/my-posts');
    } catch (err) {
      setError('Failed to delete item.');
    }
    setDeleteDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)]">
        <Navbar />
        <div className="flex justify-center py-20">
          <CircularProgress sx={{ color: 'var(--color-primary)' }} />
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)]">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-12 text-center">
          <span className="text-5xl">🔍</span>
          <h2 className="text-xl font-bold mt-4">Item Not Found</h2>
          <p className="text-[var(--color-text-muted)] mt-2">This item may have been removed.</p>
          <Link to="/feed"><Button sx={{ mt: 2 }}>Back to Feed</Button></Link>
        </div>
      </div>
    );
  }

  const isLost = item.status === 'LOST';

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        {/* Back Button */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mb: 3, color: 'var(--color-text-secondary)', fontWeight: 500 }}
        >
          Back
        </Button>

        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>}

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Image Section */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-2xl overflow-hidden border border-[var(--color-border)]">
              {item.imageUrl ? (
                <img
                  src={`${API_BASE}${item.imageUrl}`}
                  alt={item.title}
                  className="w-full max-h-[500px] object-cover"
                />
              ) : (
                <div className="h-64 flex items-center justify-center bg-[var(--color-surface-alt)]">
                  <div className="text-center">
                    <span className="text-6xl">{isLost ? '🔍' : '📦'}</span>
                    <p className="text-sm text-[var(--color-text-muted)] mt-3">No image uploaded</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Info Section */}
          <div className="md:col-span-2 space-y-4">
            {/* Status + Category */}
            <div className="flex gap-2">
              <Chip
                label={item.status}
                sx={{
                  fontWeight: 700,
                  bgcolor: isLost ? 'var(--color-lost)' : 'var(--color-found)',
                  color: 'white',
                }}
              />
              {item.categoryName && (
                <Chip label={item.categoryName} variant="outlined" size="small" />
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-[var(--color-text)] leading-tight">
              {item.title}
            </h1>

            {/* Description */}
            {item.description && (
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                {item.description}
              </p>
            )}

            {/* AI Tags */}
            {item.aiTags && item.aiTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {item.aiTags.map((tag, i) => (
                  <Chip
                    key={i}
                    label={tag.trim()}
                    size="small"
                    sx={{ bgcolor: 'var(--color-bg)', fontSize: '0.75rem' }}
                  />
                ))}
              </div>
            )}

            {/* Meta Info */}
            <div className="bg-white rounded-xl border border-[var(--color-border)] p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <PlaceIcon sx={{ fontSize: 18, color: 'var(--color-text-muted)' }} />
                <span className="text-[var(--color-text-secondary)]">{item.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <PersonIcon sx={{ fontSize: 18, color: 'var(--color-text-muted)' }} />
                <span className="text-[var(--color-text-secondary)]">
                  Posted by {item.posterName || 'Anonymous'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CalendarTodayIcon sx={{ fontSize: 16, color: 'var(--color-text-muted)' }} />
                <span className="text-[var(--color-text-secondary)]">
                  {new Date(item.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </span>
              </div>
              {item.currentStatus && (
                <Chip
                  label={item.currentStatus === 'HOLDING' ? '🤝 Holder has it' : '🏢 Surrendered to office'}
                  size="small"
                  sx={{ bgcolor: 'var(--color-accent-light)/20', fontWeight: 500 }}
                />
              )}
            </div>

            {/* Reveal / Contact Info Section */}
            <div className="bg-white rounded-xl border border-[var(--color-border)] p-4">
              {hasRevealed ? (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-[var(--color-found)] uppercase tracking-wide flex items-center gap-1">
                    <VisibilityIcon sx={{ fontSize: 14 }} /> Retrieval Details
                  </p>
                  {item.contactPreference && (
                    <div className="bg-[var(--color-found-bg)] rounded-lg p-3">
                      <p className="text-xs text-[var(--color-text-muted)]">Contact</p>
                      <p className="font-semibold text-sm">{item.contactPreference}</p>
                    </div>
                  )}
                  {item.dropoffLocation && (
                    <div className="bg-[var(--color-found-bg)] rounded-lg p-3">
                      <p className="text-xs text-[var(--color-text-muted)]">Drop-off Location</p>
                      <p className="font-semibold text-sm">{item.dropoffLocation}</p>
                    </div>
                  )}
                </div>
              ) : isAuthenticated ? (
                <div className="text-center">
                  <LockOpenIcon sx={{ fontSize: 28, color: 'var(--color-text-muted)' }} />
                  <p className="text-sm text-[var(--color-text-muted)] mt-2">
                    Contact info is hidden for privacy.
                  </p>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleReveal}
                    disabled={revealing}
                    startIcon={revealing ? <CircularProgress size={16} /> : <LockOpenIcon />}
                    sx={{
                      mt: 2,
                      bgcolor: 'var(--color-primary)',
                      '&:hover': { bgcolor: 'var(--color-primary-dark)' },
                      boxShadow: '0 2px 8px rgba(26,86,219,0.25)',
                    }}
                  >
                    {revealing ? 'Revealing...' : 'Reveal Details'}
                  </Button>
                  <p className="text-[10px] text-[var(--color-text-muted)] mt-2">
                    This action is logged for security purposes.
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <LockOpenIcon sx={{ fontSize: 28, color: 'var(--color-text-muted)' }} />
                  <p className="text-sm text-[var(--color-text-muted)] mt-2">
                    Log in to view contact details.
                  </p>
                  <Link to="/login">
                    <Button variant="outlined" fullWidth sx={{ mt: 2 }}>
                      Log In to View
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Owner Actions */}
            {isOwner && (
              <div className="flex gap-2">
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  fullWidth
                  onClick={() => navigate(`/items/${id}/edit`)}
                  sx={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                >
                  Edit
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DeleteIcon />}
                  fullWidth
                  onClick={() => setDeleteDialogOpen(true)}
                  sx={{ borderColor: 'var(--color-error)', color: 'var(--color-error)' }}
                >
                  Delete
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete this item?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This action is permanent. The item will be removed from the feed and database.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
