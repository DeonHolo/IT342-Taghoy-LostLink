import { useState, useEffect, useCallback } from 'react';
import Navbar from '../../../shared/components/Navbar';
import ItemCard, { ItemCardSkeleton } from '../components/ItemCard';
import ItemService from '../../items/services/ItemService';
import CategoryService from '../../items/services/CategoryService';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlineOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import { withOthersLast } from '../utils/categoryOrder';

export default function Feed() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await ItemService.getItems({
        search: search || undefined,
        status: statusFilter || undefined,
        categoryId: categoryFilter || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });

      setItems(data.data || data || []);
    } catch (err) {
      setError('Unable to load items. Please try again.');
      console.error('Feed fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, categoryFilter, dateFrom, dateTo]);

  useEffect(() => {
    CategoryService.getAll()
      .then((data) => setCategories(data.data || data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const timeout = setTimeout(fetchItems, 300);
    return () => clearTimeout(timeout);
  }, [fetchItems]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchItems();
  };

  const statusOptions = [
    { value: '', label: 'All Items' },
    { value: 'LOST', label: 'Lost' },
    { value: 'FOUND', label: 'Found' },
  ];

  const itemList = Array.isArray(items) ? items : [];

  return (
    <div className="min-h-[100dvh] bg-stone-50">
      <Navbar />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-8 pb-16">
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-zinc-900">
            Campus Feed
          </h1>
          <p className="mt-1.5 text-sm text-zinc-500 max-w-[50ch]">
            Browse lost and found reports from across CIT-U. Use search and
            filters to find specific items.
          </p>
        </div>

        <div className="mb-8 space-y-4 animate-fade-in-up stagger-1">
          <form
            onSubmit={handleSearchSubmit}
            className="relative max-w-2xl"
          >
            <SearchIcon
              sx={{ fontSize: 20 }}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, description, or tags..."
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-zinc-300 bg-white text-sm text-zinc-900 placeholder:text-zinc-400 transition-all duration-200 hover:border-zinc-400 focus:border-maroon-600 focus:ring-2 focus:ring-maroon-100"
            />
          </form>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500">
              <FilterListIcon sx={{ fontSize: 16 }} />
              <span>Filter:</span>
            </div>

            <div className="flex gap-1.5">
              {statusOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setStatusFilter(opt.value)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
                    statusFilter === opt.value
                      ? opt.value === 'LOST'
                        ? 'bg-maroon-900 text-white shadow-sm'
                        : opt.value === 'FOUND'
                        ? 'bg-emerald-700 text-white shadow-sm'
                        : 'bg-zinc-900 text-white shadow-sm'
                      : 'bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {categories.length > 0 && (
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 transition-all cursor-pointer"
              >
                <option value="">All Categories</option>
                {withOthersLast(categories).map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name || cat.categoryName}
                  </option>
                ))}
              </select>
            )}

            <div className="flex items-center gap-1.5">
              <label className="text-[11px] text-zinc-400 font-medium">From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-2 py-1.5 rounded-lg text-xs border border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 transition-all cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <label className="text-[11px] text-zinc-400 font-medium">To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-2 py-1.5 rounded-lg text-xs border border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 transition-all cursor-pointer"
              />
            </div>

            {(search || statusFilter || categoryFilter || dateFrom || dateTo) && (
              <button
                onClick={() => {
                  setSearch('');
                  setStatusFilter('');
                  setCategoryFilter('');
                  setDateFrom('');
                  setDateTo('');
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-maroon-700 hover:bg-maroon-50 transition-all cursor-pointer"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <ItemCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in-up">
            <div className="w-14 h-14 rounded-2xl bg-maroon-100 flex items-center justify-center mb-4">
              <ErrorOutlineIcon sx={{ fontSize: 28, color: '#7B1113' }} />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 mb-1">
              Something went wrong
            </h3>
            <p className="text-sm text-zinc-500 max-w-[36ch] mb-4">
              {error}
            </p>
            <button
              onClick={fetchItems}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-maroon-900 text-white hover:bg-maroon-800 transition-all cursor-pointer"
            >
              <RefreshIcon sx={{ fontSize: 16 }} />
              Retry
            </button>
          </div>
        ) : itemList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in-up">
            <div className="w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center mb-4">
              <InboxOutlinedIcon sx={{ fontSize: 28, color: '#a1a1aa' }} />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 mb-1">
              {search || statusFilter || categoryFilter || dateFrom || dateTo
                ? 'No matching items'
                : 'No items posted yet'}
            </h3>
            <p className="text-sm text-zinc-500 max-w-[38ch]">
              {search || statusFilter || categoryFilter || dateFrom || dateTo
                ? 'Try adjusting your search or filter criteria.'
                : 'Be the first to report a lost or found item on campus.'}
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4 animate-fade-in-up stagger-2">
              <p className="text-xs font-medium text-zinc-400">
                {itemList.length} item{itemList.length !== 1 ? 's' : ''} found
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {itemList.map((item, index) => (
                <ItemCard key={item.id} item={item} index={index} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
