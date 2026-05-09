import { Link } from 'react-router-dom';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ImageNotSupportedOutlinedIcon from '@mui/icons-material/ImageNotSupportedOutlined';

export default function ItemCard({ item, index = 0 }) {
  const isLost = item.status === 'LOST';
  const isResolved = item.status === 'RESOLVED';
  const staggerClass = `stagger-${Math.min(index + 1, 6)}`;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hrs < 24) return `${hrs}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Link
      to={`/items/${item.id}`}
      className={`group block rounded-2xl bg-white border border-zinc-200/60 overflow-hidden transition-all duration-300 hover:shadow-[0_12px_40px_-12px_rgba(123,17,19,0.12)] hover:-translate-y-[2px] animate-fade-in-up ${staggerClass}`}
      style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
    >
      <div className="relative aspect-[4/3] bg-zinc-100 overflow-hidden">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-zinc-300">
            <ImageNotSupportedOutlinedIcon sx={{ fontSize: 48 }} />
            <span className="text-xs mt-2 text-zinc-400">No image</span>
          </div>
        )}

        <div className="absolute top-3 left-3">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold tracking-wide uppercase shadow-sm ${
              isResolved
                ? 'bg-zinc-600 text-white'
                : isLost
                  ? 'bg-maroon-900 text-white'
                  : 'bg-emerald-700 text-white'
            }`}
          >
            {item.status}
          </span>
        </div>

        {item.category && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-zinc-900/60 text-white backdrop-blur-sm">
              {item.category}
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-base font-semibold text-zinc-900 leading-snug line-clamp-2 group-hover:text-maroon-800 transition-colors duration-200">
          {item.title}
        </h3>

        {item.description && (
          <p className="mt-1.5 text-sm text-zinc-500 leading-relaxed line-clamp-2">
            {item.description}
          </p>
        )}

        <div className="mt-3 flex items-center gap-3 text-xs text-zinc-400">
          {item.location && (
            <span className="flex items-center gap-1">
              <PlaceOutlinedIcon sx={{ fontSize: 14 }} />
              <span className="truncate max-w-[140px]">{item.location}</span>
            </span>
          )}
          {item.createdAt && (
            <span className="flex items-center gap-1">
              <AccessTimeIcon sx={{ fontSize: 13 }} />
              {formatDate(item.createdAt)}
            </span>
          )}
        </div>

        {item.aiTags && item.aiTags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {item.aiTags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-gold-100 text-gold-800 border border-gold-200/60"
              >
                {tag}
              </span>
            ))}
            {item.aiTags.length > 4 && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-medium text-zinc-400">
                +{item.aiTags.length - 4}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

export function ItemCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white border border-zinc-200/60 overflow-hidden">
      <div className="aspect-[4/3] animate-shimmer" />
      <div className="p-4 space-y-3">
        <div className="h-5 w-3/4 rounded-md animate-shimmer" />
        <div className="h-4 w-full rounded-md animate-shimmer" />
        <div className="h-4 w-1/2 rounded-md animate-shimmer" />
        <div className="flex gap-2 mt-2">
          <div className="h-5 w-14 rounded-md animate-shimmer" />
          <div className="h-5 w-14 rounded-md animate-shimmer" />
        </div>
      </div>
    </div>
  );
}
