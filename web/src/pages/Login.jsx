import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlineOutlined';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ identifier: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

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
      navigate('/feed');
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
          navigate('/feed');
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
  }, [loginWithGoogle, navigate]);

  return (
    <div className="min-h-[100dvh] flex">
      <div className="hidden lg:flex lg:w-[45%] relative bg-maroon-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-maroon-950 via-maroon-900 to-maroon-800" />
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-gold-500/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-maroon-700/30 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          <div>
            <Link to="/feed" className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gold-500 flex items-center justify-center shadow-[0_4px_16px_rgba(201,162,39,0.35)]">
                <SearchIcon sx={{ fontSize: 24, color: '#44080a' }} />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-white block leading-none">
                  LostLink
                </span>
                <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-gold-400/70 leading-none">
                  CIT-U Campus
                </span>
              </div>
            </Link>
          </div>

          <div className="space-y-6">
            <h1 className="text-4xl xl:text-5xl font-bold tracking-tighter text-white leading-none">
              Find what you lost.
              <br />
              <span className="text-gold-400">Return what you found.</span>
            </h1>
            <p className="text-base text-maroon-200 leading-relaxed max-w-[42ch]">
              CIT-U's centralized lost and found platform. Report, search, and
              recover items across campus in seconds.
            </p>
          </div>

          <div className="flex items-center gap-6 text-sm text-maroon-300">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-gold-400">500+</span>
              <span>Items recovered</span>
            </div>
            <div className="w-px h-10 bg-maroon-700" />
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-gold-400">2k+</span>
              <span>Active users</span>
            </div>
            <div className="w-px h-10 bg-maroon-700" />
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-gold-400">24h</span>
              <span>Avg. recovery</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <Link
            to="/feed"
            className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-maroon-700 transition-colors mb-6 group"
          >
            <ArrowBackOutlinedIcon sx={{ fontSize: 18 }} className="transition-transform group-hover:-translate-x-0.5" />
            Back to Feed
          </Link>

          <div className="lg:hidden mb-6">
            <Link to="/feed" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gold-500 flex items-center justify-center">
                <SearchIcon sx={{ fontSize: 20, color: '#44080a' }} />
              </div>
              <span className="text-lg font-bold tracking-tight text-maroon-900">
                LostLink
              </span>
            </Link>
          </div>

          <div className="space-y-1.5 mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
              Welcome back
            </h2>
            <p className="text-sm text-zinc-500">
              Sign in with your Student ID or email to continue.
            </p>
          </div>

          {error && (
            <div className="mb-6 flex items-start gap-2.5 p-3.5 rounded-xl bg-maroon-50 border border-maroon-200 text-sm text-maroon-800 animate-fade-in-up">
              <ErrorOutlineIcon sx={{ fontSize: 18, marginTop: '1px' }} />
              <span>{error}</span>
            </div>
          )}

          {GOOGLE_CLIENT_ID && (
            <>
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading || loading}
                className="w-full py-3 rounded-xl text-sm font-medium border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 hover:border-zinc-400 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
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

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-stone-50 px-3 text-xs text-zinc-400 uppercase tracking-wider">or</span>
                </div>
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label
                htmlFor="identifier"
                className="block text-sm font-medium text-zinc-700"
              >
                Student ID or Email
              </label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                value={form.identifier}
                onChange={handleChange}
                placeholder="e.g. 20-0649-750"
                className="w-full px-4 py-3 rounded-xl border border-zinc-300 bg-white text-sm text-zinc-900 placeholder:text-zinc-400 transition-all duration-200 hover:border-zinc-400 focus:border-maroon-600 focus:ring-2 focus:ring-maroon-100"
                autoComplete="username"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-zinc-700"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-zinc-300 bg-white text-sm text-zinc-900 placeholder:text-zinc-400 transition-all duration-200 hover:border-zinc-400 focus:border-maroon-600 focus:ring-2 focus:ring-maroon-100"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <VisibilityOffOutlinedIcon sx={{ fontSize: 20 }} />
                  ) : (
                    <VisibilityOutlinedIcon sx={{ fontSize: 20 }} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full py-3 rounded-xl text-sm font-semibold bg-maroon-900 text-white hover:bg-maroon-800 active:scale-[0.98] transition-all duration-200 shadow-[0_2px_12px_rgba(123,17,19,0.25)] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
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

          <p className="mt-8 text-center text-sm text-zinc-500">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-maroon-800 hover:text-maroon-600 transition-colors"
            >
              Create one here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
