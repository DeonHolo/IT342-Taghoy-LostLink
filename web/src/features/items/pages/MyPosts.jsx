import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../../shared/components/Navbar';
import ItemCard, { ItemCardSkeleton } from '../../feed/components/ItemCard';
import ItemService from '../services/ItemService';
import AddIcon from '@mui/icons-material/Add';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlineOutlined';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';

export default function MyPosts() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const data = await ItemService.getMyPosts();
        setItems(data.data || data || []);
      } catch {
        setError('Failed to load your posts.');
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const filteredItems = statusFilter
    ? items.filter((item) => item.status === statusFilter)
    : items;

  const lostCount = items.filter((i) => i.status === 'LOST').length;
  const foundCount = items.filter((i) => i.status === 'FOUND').length;
  const resolvedCount = items.filter((i) => i.status === 'RESOLVED').length;

  return (
    <div className="min-h-[100dvh] bg-stone-50">
      <Navbar />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-8 pb-16">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 animate-fade-in-up">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tighter text-zinc-900">
              My Reports
            </h1>
            <p className="mt-1.5 text-sm text-zinc-500">
              Manage all your lost and found reports.
            </p>
          </div>
          <button
            onClick={() => navigate('/post')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gold-500 text-maroon-950 hover:bg-gold-400 active:scale-[0.98] transition-all duration-200 shadow-[0_2px_12px_rgba(201,162,39,0.3)] cursor-pointer"
          >
            <AddIcon sx={{ fontSize: 18 }} />
            New Report
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-6 animate-fade-in-up stagger-1">
          <button
            onClick={() => setStatusFilter('')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              !statusFilter
                ? 'bg-maroon-900 text-white shadow-sm'
                : 'bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-300'
            }`}
          >
            All ({items.length})
          </button>
          <button
            onClick={() => setStatusFilter('LOST')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'LOST'
                ? 'bg-maroon-900 text-white shadow-sm'
                : 'bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-300'
            }`}
          >
            Lost ({lostCount})
          </button>
          <button
            onClick={() => setStatusFilter('FOUND')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'FOUND'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-300'
            }`}
          >
            Found ({foundCount})
          </button>
          <button
            onClick={() => setStatusFilter('RESOLVED')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'RESOLVED'
                ? 'bg-zinc-700 text-white shadow-sm'
                : 'bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-300'
            }`}
          >
            Resolved ({resolvedCount})
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
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
            <p className="text-sm text-zinc-500 max-w-xs mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-maroon-900 text-white hover:bg-maroon-800 transition-all cursor-pointer"
            >
              Try Again
            </button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in-up">
            <div className="w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center mb-4">
              <InboxOutlinedIcon sx={{ fontSize: 28, color: '#a1a1aa' }} />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 mb-1">
              {statusFilter
                ? `No ${statusFilter.toLowerCase()} reports`
                : 'No reports yet'}
            </h3>
            <p className="text-sm text-zinc-500 max-w-xs mb-4">
              {statusFilter
                ? `You don't have any ${statusFilter.toLowerCase()} items. Create one to get started.`
                : 'You haven\'t posted any lost or found items. Start by creating your first report.'}
            </p>
            <Link
              to="/post"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gold-500 text-maroon-950 hover:bg-gold-400 transition-all"
            >
              <AddIcon sx={{ fontSize: 18 }} />
              Create Report
            </Link>
          </div>
        ) : (
          <>
            <p className="text-xs text-zinc-400 mb-4 animate-fade-in-up stagger-2">
              Showing {filteredItems.length} report
              {filteredItems.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredItems.map((item, index) => (
                <ItemCard key={item.id} item={item} index={index} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
