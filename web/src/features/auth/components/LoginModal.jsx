/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlineOutlined';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function LoginModal({ open, onClose, onSuccess }) {
  const { login, loginWithGoogle } = useAuth();
  const backdropRef = useRef(null);

  const [form, setForm] = useState({ identifier: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({ identifier: '', password: '' });
      setError('');
      setShowPassword(false);
      setLoading(false);
      setGoogleLoading(false);
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && open) onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === backdropRef.current) onClose();
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.identifier.trim() || !form.password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');

    const result = await login(form);
    setLoading(false);

    if (result.success) {
      onSuccess?.();
      onClose();
    } else {
      setError(result.error || 'Login failed. Check your credentials.');
    }
  };

  const handleGoogleLogin = useCallback(() => {
    if (!GOOGLE_CLIENT_ID || !window.google) {
      setError('Google Sign-In is not available right now.');
      return;
    }

    setError('');
    setGoogleLoading(true);

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async (response) => {
        const result = await loginWithGoogle(response.credential);
        setGoogleLoading(false);
        if (result.success) {
          onSuccess?.();
          onClose();
        } else {
          setError(result.error || 'Google login failed.');
        }
      },
    });

    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        setGoogleLoading(false);
        setError('Google popup was blocked. Please allow popups and try again.');
      }
    });
  }, [loginWithGoogle, onClose, onSuccess]);

  if (!open) return null;

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in-up"
      style={{ animationDuration: '200ms' }}
    >
      <div
        className="relative w-full max-w-[420px] bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-all cursor-pointer"
        >
          <CloseOutlinedIcon sx={{ fontSize: 20 }} />
        </button>

        <div className="space-y-1 mb-6">
          <h2 className="text-xl font-bold tracking-tight text-zinc-900">
            Sign in to continue
          </h2>
          <p className="text-sm text-zinc-500">
            You need an account to do that.
          </p>
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-2.5 p-3 rounded-xl bg-maroon-50 border border-maroon-200 text-sm text-maroon-800 animate-fade-in-up">
            <ErrorOutlineIcon sx={{ fontSize: 16, marginTop: '1px' }} />
            <span>{error}</span>
          </div>
        )}

        {GOOGLE_CLIENT_ID && (
          <>
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading || loading}
              className="w-full py-2.5 rounded-xl text-sm font-medium border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 hover:border-zinc-400 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {googleLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin" />
                  Connecting...
                </span>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                    <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9.003 18z" fill="#34A853"/>
                    <path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                    <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.428 0 9.002 0 5.48 0 2.438 2.017.956 4.958L3.964 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </>
              )}
            </button>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-xs text-zinc-400 uppercase tracking-wider">or</span>
              </div>
            </div>
          </>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="modal-identifier" className="block text-sm font-medium text-zinc-700">
              Student ID or Email
            </label>
            <input
              id="modal-identifier"
              name="identifier"
              type="text"
              value={form.identifier}
              onChange={handleChange}
              placeholder="e.g. 20-0649-750"
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 bg-white text-sm text-zinc-900 placeholder:text-zinc-400 transition-all duration-200 hover:border-zinc-400 focus:border-maroon-600 focus:ring-2 focus:ring-maroon-100"
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="modal-password" className="block text-sm font-medium text-zinc-700">
              Password
            </label>
            <div className="relative">
              <input
                id="modal-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full px-4 py-2.5 pr-11 rounded-xl border border-zinc-300 bg-white text-sm text-zinc-900 placeholder:text-zinc-400 transition-all duration-200 hover:border-zinc-400 focus:border-maroon-600 focus:ring-2 focus:ring-maroon-100"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? (
                  <VisibilityOffOutlinedIcon sx={{ fontSize: 18 }} />
                ) : (
                  <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full py-2.5 rounded-xl text-sm font-semibold bg-maroon-900 text-white hover:bg-maroon-800 active:scale-[0.98] transition-all duration-200 shadow-[0_2px_12px_rgba(123,17,19,0.25)] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-zinc-500">
          No account?{' '}
          <Link
            to="/register"
            onClick={onClose}
            className="font-semibold text-maroon-800 hover:text-maroon-600 transition-colors"
          >
            Create one here
          </Link>
        </p>
      </div>
    </div>
  );
}
