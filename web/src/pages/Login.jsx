import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Login Page Component
 *
 * **Design Patterns Applied:**
 *
 * 1. **Facade (Structural)** — Login logic is delegated to the AuthService facade
 *    (accessed indirectly via useAuth). The component no longer makes direct API
 *    calls or manages localStorage — all that complexity is hidden behind
 *    AuthService's simple interface.
 *
 * 2. **Observer (Behavioral)** — Uses the useAuth() hook to subscribe to auth
 *    state changes. The login() function from AuthContext internally updates the
 *    auth state, which causes all Observer components to re-render automatically.
 *
 * Before refactoring, this component directly:
 *   - Called loginUser() from the API module
 *   - Parsed error responses inline with multiple conditionals
 *   - Managed localStorage reads/writes manually
 *
 * After refactoring:
 *   - Calls auth.login() — a single, clean method from the AuthContext
 *   - Error handling is returned as a simple { success, error } result
 *   - No localStorage interaction at all
 */
function Login() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Facade + Observer: single method call replaces API + localStorage + error parsing
    const result = await auth.login(form);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Log in to LostLink with your Student ID or Email</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="identifier">Student ID or Email</label>
            <input
              id="identifier"
              name="identifier"
              type="text"
              placeholder="XX-XXXX-XXX or you@cit.edu"
              value={form.identifier}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
