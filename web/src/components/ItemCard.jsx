import { Link } from 'react-router-dom';
import Chip from '@mui/material/Chip';
import PlaceIcon from '@mui/icons-material/Place';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const API_BASE = 'http://localhost:8080';

export default function ItemCard({ item }) {
  const isLost = item.status === 'LOST';
  const timeAgo = getTimeAgo(item.createdAt);

  return (
    <Link
      to={`/items/${item.id}`}
      className="block group no-underline"
    >
      <div className="bg-white rounded-2xl overflow-hidden border border-[var(--color-border)] hover:border-[var(--color-primary-light)] transition-all duration-300 hover:shadow-lg hover:shadow-[var(--color-primary)]/5 hover:-translate-y-0.5">
        {/* Image */}
        <div className="relative h-48 bg-[var(--color-surface-alt)] overflow-hidden">
          {item.imageUrl ? (
            <img
              src={`${API_BASE}${item.imageUrl}`}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <span className="text-4xl">{isLost ? '🔍' : '📦'}</span>
                <p className="text-xs text-[var(--color-text-muted)] mt-2">No image</p>
              </div>
            </div>
          )}

          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            <Chip
              label={item.status}
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: '0.7rem',
                letterSpacing: '0.05em',
                bgcolor: isLost ? 'var(--color-lost)' : 'var(--color-found)',
                color: 'white',
                height: 24,
              }}
            />
          </div>

          {/* Category */}
          {item.categoryName && (
            <div className="absolute top-3 right-3">
              <Chip
                label={item.categoryName}
                size="small"
                variant="filled"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.9)',
                  backdropFilter: 'blur(4px)',
                  fontWeight: 500,
                  fontSize: '0.65rem',
                  height: 22,
                }}
              />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-[var(--color-text)] text-sm leading-snug line-clamp-1 group-hover:text-[var(--color-primary)] transition-colors">
            {item.title}
          </h3>

          {item.description && (
            <p className="text-xs text-[var(--color-text-secondary)] mt-1 line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          )}

          {/* AI Tags */}
          {item.aiTags && item.aiTags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {item.aiTags.slice(0, 3).map((tag, i) => (
                <span
                  key={i}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-bg)] text-[var(--color-text-muted)] font-medium"
                >
                  {tag.trim()}
                </span>
              ))}
            </div>
          )}

          {/* Meta */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--color-border-light)]">
            <div className="flex items-center gap-1 text-[var(--color-text-muted)]">
              <PlaceIcon sx={{ fontSize: 14 }} />
              <span className="text-xs truncate max-w-[120px]">{item.location}</span>
            </div>
            <div className="flex items-center gap-1 text-[var(--color-text-muted)]">
              <AccessTimeIcon sx={{ fontSize: 13 }} />
              <span className="text-[11px]">{timeAgo}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function getTimeAgo(dateString) {
  if (!dateString) return '';
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}
