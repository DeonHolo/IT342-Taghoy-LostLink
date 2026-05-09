import { useEffect, useRef } from 'react';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';

export default function AdminConfirmModal({
  open,
  title,
  children,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  loading = false,
  onConfirm,
  onClose,
}) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const confirmClasses =
    variant === 'danger'
      ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-200'
      : 'bg-maroon-800 text-white hover:bg-maroon-700 focus:ring-maroon-200';

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-[2px]"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-confirm-title"
        className="relative w-full max-w-md rounded-2xl bg-white border border-zinc-200/80 shadow-[0_20px_50px_rgba(0,0,0,0.12)] animate-fade-in-up"
      >
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors disabled:opacity-50 cursor-pointer"
          aria-label="Close"
        >
          <CloseOutlinedIcon sx={{ fontSize: 20 }} />
        </button>

        <div className="p-6 pt-8">
          <div className="flex gap-3 mb-3">
            <div
              className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                variant === 'danger' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700'
              }`}
            >
              <WarningAmberOutlinedIcon sx={{ fontSize: 22 }} />
            </div>
            <div className="min-w-0">
              <h2 id="admin-confirm-title" className="text-lg font-bold text-zinc-900 tracking-tight">
                {title}
              </h2>
              <div className="mt-2 text-sm text-zinc-600 leading-relaxed">{children}</div>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-700 border border-zinc-300 hover:bg-zinc-50 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 cursor-pointer ${confirmClasses}`}
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Please wait…
                </span>
              ) : (
                confirmLabel
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
