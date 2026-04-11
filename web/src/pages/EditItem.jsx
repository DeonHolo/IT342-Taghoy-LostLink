import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ItemService from '../services/ItemService';
import CategoryService from '../services/CategoryService';
import Navbar from '../components/Navbar';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Alert from '@mui/material/Alert';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import CircularProgress from '@mui/material/CircularProgress';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function EditItem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'FOUND',
    currentStatus: 'HOLDING',
    location: '',
    dropoffLocation: '',
    contactPreference: '',
    categoryId: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [itemRes, catRes] = await Promise.all([
        ItemService.getItemById(id),
        CategoryService.getAll(),
      ]);
      if (catRes.success) setCategories(catRes.data);
      if (itemRes.success) {
        const item = itemRes.data;
        setForm({
          title: item.title || '',
          description: item.description || '',
          status: item.status || 'FOUND',
          currentStatus: item.currentStatus || 'HOLDING',
          location: item.location || '',
          dropoffLocation: item.dropoffLocation || '',
          contactPreference: item.contactPreference || '',
          categoryId: item.categoryId || '',
        });
      }
    } catch (err) {
      setError('Failed to load item.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const res = await ItemService.updateItem(id, form);
      if (res.success) {
        setSuccess('Item updated! Redirecting...');
        setTimeout(() => navigate(`/items/${id}`), 1200);
      }
    } catch (err) {
      const data = err.response?.data;
      setError(data?.error?.details || data?.error?.message || 'Failed to update item.');
    } finally {
      setSaving(false);
    }
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

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 md:px-8 py-8">
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mb: 3, color: 'var(--color-text-secondary)' }}
        >
          Back
        </Button>

        <h1 className="text-2xl font-bold text-[var(--color-text)] mb-6">Edit Item</h1>

        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }}>{success}</Alert>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="bg-white rounded-2xl border border-[var(--color-border)] p-6 space-y-5">
            <TextField label="Item Name" name="title" value={form.title} onChange={handleChange} fullWidth required size="small" />
            <TextField label="Description" name="description" value={form.description} onChange={handleChange} fullWidth multiline rows={3} size="small" />
            <FormControl fullWidth size="small" required>
              <InputLabel>Category</InputLabel>
              <Select name="categoryId" value={form.categoryId} onChange={handleChange} label="Category">
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField label="Location" name="location" value={form.location} onChange={handleChange} fullWidth required size="small" />
          </div>

          <div className="bg-white rounded-2xl border border-[var(--color-border)] p-6 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">Status</label>
              <ToggleButtonGroup value={form.status} exclusive onChange={(_, v) => v && setForm({ ...form, status: v })} fullWidth size="small"
                sx={{ '& .MuiToggleButton-root': { textTransform: 'none', '&.Mui-selected': { bgcolor: form.status === 'LOST' ? 'var(--color-lost)' : 'var(--color-found)', color: 'white' } } }}>
                <ToggleButton value="LOST">🔍 Lost</ToggleButton>
                <ToggleButton value="FOUND">📦 Found</ToggleButton>
              </ToggleButtonGroup>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">Current Item Status</label>
              <ToggleButtonGroup value={form.currentStatus} exclusive onChange={(_, v) => v && setForm({ ...form, currentStatus: v })} fullWidth size="small"
                sx={{ '& .MuiToggleButton-root': { textTransform: 'none', '&.Mui-selected': { bgcolor: 'var(--color-primary)', color: 'white' } } }}>
                <ToggleButton value="HOLDING">🤝 Holding</ToggleButton>
                <ToggleButton value="SURRENDERED">🏢 Surrendered</ToggleButton>
              </ToggleButtonGroup>
            </div>

            {form.currentStatus === 'HOLDING' ? (
              <TextField label="Contact Preference" name="contactPreference" value={form.contactPreference} onChange={handleChange} fullWidth size="small" />
            ) : (
              <TextField label="Drop-off Location" name="dropoffLocation" value={form.dropoffLocation} onChange={handleChange} fullWidth size="small" />
            )}
          </div>

          <Button type="submit" variant="contained" fullWidth disabled={saving} size="large"
            sx={{ bgcolor: 'var(--color-primary)', '&:hover': { bgcolor: 'var(--color-primary-dark)' }, py: 1.5 }}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </div>
    </div>
  );
}
