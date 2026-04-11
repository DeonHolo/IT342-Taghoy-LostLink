import { useState, useEffect } from 'react';
import ItemService from '../services/ItemService';
import CategoryService from '../services/CategoryService';
import ItemCard from '../components/ItemCard';
import Navbar from '../components/Navbar';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';

export default function Feed() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    loadCategories();
    loadItems();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await CategoryService.getAll();
      if (res.success) setCategories(res.data);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const loadItems = async (params = {}) => {
    setLoading(true);
    try {
      const res = await ItemService.getItems(params);
      if (res.success) setItems(res.data);
    } catch (err) {
      console.error('Failed to load items', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadItems({ search, status: statusFilter, categoryId: selectedCategory });
  };

  const handleStatusChange = (_, newStatus) => {
    setStatusFilter(newStatus || '');
    loadItems({ search, status: newStatus || '', categoryId: selectedCategory });
  };

  const handleCategoryClick = (catId) => {
    const newCat = selectedCategory === catId ? null : catId;
    setSelectedCategory(newCat);
    loadItems({ search, status: statusFilter, categoryId: newCat });
  };

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setSelectedCategory(null);
    loadItems();
  };

  const hasFilters = search || statusFilter || selectedCategory;

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[var(--color-primary-dark)] via-[var(--color-primary)] to-[var(--color-primary-light)] text-white">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-16">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Campus Lost & Found
          </h1>
          <p className="text-blue-100 mt-2 text-sm md:text-base max-w-lg">
            Browse reported items across campus. Search by name, description, or use filters to find what you&apos;re looking for.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mt-6 max-w-2xl">
            <TextField
              fullWidth
              placeholder="Search by name, description, or tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="small"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'var(--color-text-muted)' }} />
                    </InputAdornment>
                  ),
                  sx: {
                    bgcolor: 'white',
                    borderRadius: '12px',
                    fontSize: '0.9rem',
                    '& fieldset': { border: 'none' },
                    boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
                  }
                }
              }}
            />
          </form>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
            <FilterListIcon sx={{ fontSize: 18 }} />
            <span className="text-sm font-medium">Filter:</span>
          </div>

          {/* Status Toggle */}
          <ToggleButtonGroup
            value={statusFilter}
            exclusive
            onChange={handleStatusChange}
            size="small"
            sx={{
              '& .MuiToggleButton-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.8rem',
                borderRadius: '8px !important',
                border: '1px solid var(--color-border) !important',
                px: 2,
                '&.Mui-selected': {
                  bgcolor: 'var(--color-primary)',
                  color: 'white',
                  '&:hover': { bgcolor: 'var(--color-primary-dark)' },
                },
              }
            }}
          >
            <ToggleButton value="LOST">🔍 Lost</ToggleButton>
            <ToggleButton value="FOUND">📦 Found</ToggleButton>
          </ToggleButtonGroup>

          {/* Category Chips */}
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <Chip
                key={cat.id}
                label={cat.name}
                size="small"
                onClick={() => handleCategoryClick(cat.id)}
                sx={{
                  fontWeight: 500,
                  fontSize: '0.75rem',
                  bgcolor: selectedCategory === cat.id ? 'var(--color-primary)' : 'white',
                  color: selectedCategory === cat.id ? 'white' : 'var(--color-text-secondary)',
                  border: selectedCategory === cat.id ? 'none' : '1px solid var(--color-border)',
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: selectedCategory === cat.id ? 'var(--color-primary-dark)' : 'var(--color-bg)',
                  },
                }}
              />
            ))}
          </div>

          {hasFilters && (
            <Chip
              label="Clear all"
              size="small"
              onDelete={clearFilters}
              onClick={clearFilters}
              sx={{ fontWeight: 500, fontSize: '0.75rem' }}
            />
          )}
        </div>
      </div>

      {/* Items Grid */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 pb-12">
        {loading ? (
          <div className="flex justify-center py-20">
            <CircularProgress sx={{ color: 'var(--color-primary)' }} />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-5xl">📭</span>
            <h3 className="text-lg font-semibold text-[var(--color-text)] mt-4">No items found</h3>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              {hasFilters ? 'Try adjusting your search or filters.' : 'No items have been reported yet.'}
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-[var(--color-text-muted)] mb-4">
              Showing <span className="font-semibold text-[var(--color-text)]">{items.length}</span> items
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {items.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
