import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ItemService from '../services/ItemService';
import Navbar from '../components/Navbar';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PlaceIcon from '@mui/icons-material/Place';

const API_BASE = 'http://localhost:8080';

export default function MyPosts() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    loadMyPosts();
  }, []);

  const loadMyPosts = async () => {
    setLoading(true);
    try {
      const res = await ItemService.getMyPosts();
      if (res.success) setItems(res.data);
    } catch (err) {
      console.error('Failed to load posts', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await ItemService.deleteItem(deleteId);
      setItems(items.filter((i) => i.id !== deleteId));
    } catch (err) {
      console.error('Failed to delete item', err);
    }
    setDeleteId(null);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text)]">My Posts</h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">Manage your reported items.</p>
          </div>
          <Link to="/post">
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{
                bgcolor: 'var(--color-primary)',
                '&:hover': { bgcolor: 'var(--color-primary-dark)' },
                boxShadow: '0 2px 8px rgba(26,86,219,0.25)',
              }}
            >
              New Post
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <CircularProgress sx={{ color: 'var(--color-primary)' }} />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-[var(--color-border)]">
            <span className="text-5xl">📝</span>
            <h3 className="text-lg font-semibold text-[var(--color-text)] mt-4">No posts yet</h3>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              You haven&apos;t reported any items. Start by posting one!
            </p>
            <Link to="/post">
              <Button variant="contained" startIcon={<AddIcon />} sx={{ mt: 3, bgcolor: 'var(--color-primary)' }}>
                Post Your First Item
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const isLost = item.status === 'LOST';
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-[var(--color-border)] p-4 flex gap-4 hover:border-[var(--color-primary-light)] transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-[var(--color-surface-alt)]">
                    {item.imageUrl ? (
                      <img
                        src={`${API_BASE}${item.imageUrl}`}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">
                        {isLost ? '🔍' : '📦'}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm text-[var(--color-text)] truncate">{item.title}</h3>
                          <Chip
                            label={item.status}
                            size="small"
                            sx={{
                              fontWeight: 700,
                              fontSize: '0.65rem',
                              height: 20,
                              bgcolor: isLost ? 'var(--color-lost)' : 'var(--color-found)',
                              color: 'white',
                            }}
                          />
                        </div>
                        <div className="flex items-center gap-1 text-xs text-[var(--color-text-muted)] mt-1">
                          <PlaceIcon sx={{ fontSize: 13 }} />
                          <span>{item.location}</span>
                          <span className="mx-1">·</span>
                          <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-1 flex-shrink-0">
                        <IconButton size="small" onClick={() => navigate(`/items/${item.id}`)}>
                          <VisibilityIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                        <IconButton size="small" onClick={() => navigate(`/items/${item.id}/edit`)}>
                          <EditIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                        <IconButton size="small" onClick={() => setDeleteId(item.id)}>
                          <DeleteIcon sx={{ fontSize: 18, color: 'var(--color-error)' }} />
                        </IconButton>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Dialog */}
      <Dialog open={deleteId !== null} onClose={() => setDeleteId(null)}>
        <DialogTitle>Delete this item?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This action is permanent. The item will be removed from the feed and database.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
