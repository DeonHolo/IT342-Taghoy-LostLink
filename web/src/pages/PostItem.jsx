import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function PostItem() {
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
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await CategoryService.getAll();
      if (res.success) setCategories(res.data);
    } catch (err) {
      console.error('Failed to load categories');
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleStatusChange = (_, newStatus) => {
    if (newStatus) {
      setForm({ ...form, status: newStatus });
    }
  };

  const handleCurrentStatusChange = (_, newCS) => {
    if (newCS) {
      setForm({ ...form, currentStatus: newCS });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate type
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        setError('Only JPEG and PNG images are accepted.');
        return;
      }
      // Validate size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be smaller than 5MB.');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate: Found items should have an image
    if (form.status === 'FOUND' && !imageFile) {
      setError('An image is required when reporting a found item.');
      return;
    }

    setLoading(true);
    try {
      const res = await ItemService.createItem(form);
      if (res.success) {
        const itemId = res.data.id;

        // Upload image if provided
        if (imageFile) {
          await ItemService.uploadImage(itemId, imageFile);
        }

        setSuccess('Item posted successfully! Redirecting...');
        setTimeout(() => navigate('/feed'), 1500);
      }
    } catch (err) {
      const data = err.response?.data;
      setError(data?.error?.details || data?.error?.message || 'Failed to post item.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 md:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Report an Item</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Fill out the form below to report a lost or found item.
          </p>
        </div>

        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }} icon={<CheckCircleIcon />}>{success}</Alert>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="bg-white rounded-2xl border border-[var(--color-border)] p-6 space-y-5">
            {/* Status Toggle */}
            <div>
              <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">
                What happened?
              </label>
              <ToggleButtonGroup
                value={form.status}
                exclusive
                onChange={handleStatusChange}
                fullWidth
                sx={{
                  '& .MuiToggleButton-root': {
                    textTransform: 'none',
                    fontWeight: 600,
                    py: 1.5,
                    '&.Mui-selected': {
                      bgcolor: form.status === 'LOST' ? 'var(--color-lost)' : 'var(--color-found)',
                      color: 'white',
                      '&:hover': {
                        bgcolor: form.status === 'LOST' ? 'var(--color-lost)' : 'var(--color-found)',
                      },
                    },
                  },
                }}
              >
                <ToggleButton value="LOST">🔍 I Lost Something</ToggleButton>
                <ToggleButton value="FOUND">📦 I Found Something</ToggleButton>
              </ToggleButtonGroup>
            </div>

            {/* Title */}
            <TextField
              label="Item Name"
              name="title"
              value={form.title}
              onChange={handleChange}
              fullWidth
              required
              placeholder="e.g., Black Casio Calculator"
              size="small"
            />

            {/* Description */}
            <TextField
              label="Description"
              name="description"
              value={form.description}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
              placeholder="Describe the item, any distinguishing features..."
              size="small"
            />

            {/* Category */}
            <FormControl fullWidth size="small" required>
              <InputLabel>Category</InputLabel>
              <Select
                name="categoryId"
                value={form.categoryId}
                onChange={handleChange}
                label="Category"
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Location */}
            <TextField
              label="Location"
              name="location"
              value={form.location}
              onChange={handleChange}
              fullWidth
              required
              placeholder="e.g., 3rd Floor Library"
              size="small"
            />
          </div>

          {/* Item Status - Dynamic Fields */}
          <div className="bg-white rounded-2xl border border-[var(--color-border)] p-6 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">
                Current Item Status
              </label>
              <ToggleButtonGroup
                value={form.currentStatus}
                exclusive
                onChange={handleCurrentStatusChange}
                fullWidth
                size="small"
                sx={{
                  '& .MuiToggleButton-root': {
                    textTransform: 'none',
                    fontWeight: 500,
                    '&.Mui-selected': { bgcolor: 'var(--color-primary)', color: 'white' },
                  },
                }}
              >
                <ToggleButton value="HOLDING">🤝 I&apos;m holding it</ToggleButton>
                <ToggleButton value="SURRENDERED">🏢 Surrendered to office</ToggleButton>
              </ToggleButtonGroup>
            </div>

            {/* Dynamic fields based on currentStatus */}
            {form.currentStatus === 'HOLDING' ? (
              <TextField
                label="Contact Preference"
                name="contactPreference"
                value={form.contactPreference}
                onChange={handleChange}
                fullWidth
                placeholder="e.g., MS Teams: @ron.taghoy or 09XX-XXX-XXXX"
                size="small"
                helperText="How should the owner reach you?"
              />
            ) : (
              <TextField
                label="Drop-off Location"
                name="dropoffLocation"
                value={form.dropoffLocation}
                onChange={handleChange}
                fullWidth
                placeholder="e.g., Library Lost & Found Desk"
                size="small"
                helperText="Where was the item surrendered?"
              />
            )}
          </div>

          {/* Image Upload */}
          <div className="bg-white rounded-2xl border border-[var(--color-border)] p-6">
            <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">
              Photo {form.status === 'FOUND' && <span className="text-[var(--color-error)]">*</span>}
            </label>
            <p className="text-xs text-[var(--color-text-muted)] mb-3">
              {form.status === 'FOUND'
                ? 'An image is required for found items to prove possession.'
                : 'Optional for lost items.'}
            </p>

            {imagePreview ? (
              <div className="relative">
                <img src={imagePreview} alt="Preview" className="w-full max-h-48 object-cover rounded-xl" />
                <Button
                  size="small"
                  onClick={() => { setImageFile(null); setImagePreview(null); }}
                  sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.6)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' } }}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-36 border-2 border-dashed border-[var(--color-border)] rounded-xl cursor-pointer hover:border-[var(--color-primary)] hover:bg-[var(--color-bg)] transition-colors">
                <CloudUploadIcon sx={{ fontSize: 32, color: 'var(--color-text-muted)' }} />
                <span className="text-sm text-[var(--color-text-muted)] mt-2">Click to upload (JPEG/PNG, max 5MB)</span>
                <input type="file" accept="image/jpeg,image/png" onChange={handleImageChange} className="hidden" />
              </label>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            size="large"
            sx={{
              bgcolor: 'var(--color-primary)',
              '&:hover': { bgcolor: 'var(--color-primary-dark)' },
              py: 1.5,
              boxShadow: '0 4px 14px rgba(26,86,219,0.3)',
            }}
          >
            {loading ? 'Posting...' : 'Post Item'}
          </Button>
        </form>
      </div>
    </div>
  );
}
