import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function Register() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [form, setForm] = useState({
    studentId: '',
    email: '',
    firstName: '',
    lastName: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setSuccess('');
    setLoading(true);

    const result = await auth.register(form);
    if (result.success) {
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } else if (result.fieldErrors) {
      setFieldErrors(result.fieldErrors);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-[var(--color-bg)]">
      {/* Left — Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[var(--color-primary-dark)] via-[var(--color-primary)] to-[var(--color-primary-light)] text-white flex-col justify-center px-16 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full bg-white/5" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <SearchIcon sx={{ color: 'white', fontSize: 28 }} />
            </div>
            <span className="text-3xl font-bold tracking-tight">LostLink</span>
          </div>
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Join the campus<br />community.
          </h1>
          <p className="text-blue-100 text-lg max-w-md">
            Help fellow students find their lost items. Report, browse, and connect through LostLink.
          </p>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center">
              <SearchIcon sx={{ color: 'white', fontSize: 18 }} />
            </div>
            <span className="text-xl font-bold text-[var(--color-primary-dark)]">
              Lost<span className="text-[var(--color-primary)]">Link</span>
            </span>
          </div>

          <h2 className="text-2xl font-bold text-[var(--color-text)]">Create Account</h2>
          <p className="text-sm text-[var(--color-text-muted)] mt-1 mb-6">
            Join LostLink to report and find lost items on campus.
          </p>

          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }} icon={<CheckCircleIcon />}>{success}</Alert>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <TextField
              label="Student ID"
              name="studentId"
              value={form.studentId}
              onChange={handleChange}
              fullWidth
              required
              placeholder="XX-XXXX-XXX"
              size="small"
              error={!!fieldErrors.studentId}
              helperText={fieldErrors.studentId}
            />
            <div className="grid grid-cols-2 gap-3">
              <TextField
                label="First Name"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                fullWidth
                required
                size="small"
                error={!!fieldErrors.firstName}
                helperText={fieldErrors.firstName}
              />
              <TextField
                label="Last Name"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                fullWidth
                required
                size="small"
                error={!!fieldErrors.lastName}
                helperText={fieldErrors.lastName}
              />
            </div>
            <TextField
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              fullWidth
              required
              placeholder="you@cit.edu"
              size="small"
              error={!!fieldErrors.email}
              helperText={fieldErrors.email}
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              fullWidth
              required
              placeholder="Minimum 8 characters"
              size="small"
              error={!!fieldErrors.password}
              helperText={fieldErrors.password}
            />
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
                mt: 1,
                boxShadow: '0 4px 14px rgba(26,86,219,0.3)',
              }}
            >
              {loading ? 'Creating Account...' : 'Register'}
            </Button>
          </form>

          <p className="text-center text-sm text-[var(--color-text-muted)] mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-[var(--color-primary)] font-semibold hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
