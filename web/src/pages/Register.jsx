import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';

function Register() {
  const navigate = useNavigate();
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
    // Clear field-specific error on change
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

    try {
      const res = await registerUser(form);
      if (res.data.success) {
        setSuccess('Registration successful! Redirecting to login...');
        setTimeout(() => navigate('/login'), 1500);
      }
    } catch (err) {
      const data = err.response?.data;
      if (data?.error?.code === 'VALID-001' && typeof data.error.details === 'object') {
        setFieldErrors(data.error.details);
      } else if (data?.error?.message) {
        setError(data.error.details || data.error.message);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Join LostLink to report and find lost items on campus</p>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="studentId">Student ID</label>
            <input
              id="studentId"
              name="studentId"
              type="text"
              placeholder="XX-XXXX-XXX"
              value={form.studentId}
              onChange={handleChange}
              required
            />
            {fieldErrors.studentId && <span className="field-error">{fieldErrors.studentId}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="Ron Luigi"
                value={form.firstName}
                onChange={handleChange}
                required
              />
              {fieldErrors.firstName && <span className="field-error">{fieldErrors.firstName}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Taghoy"
                value={form.lastName}
                onChange={handleChange}
                required
              />
              {fieldErrors.lastName && <span className="field-error">{fieldErrors.lastName}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@cit.edu"
              value={form.email}
              onChange={handleChange}
              required
            />
            {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Minimum 8 characters"
              value={form.password}
              onChange={handleChange}
              required
            />
            {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
