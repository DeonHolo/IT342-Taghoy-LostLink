import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

/**
 * Dashboard Page Component
 *
 * **Design Patterns Applied:**
 *
 * 1. **Facade (Structural)** — User data and logout are accessed through the
 *    AuthService facade (via useAuth). No direct localStorage interaction.
 *
 * 2. **Observer (Behavioral)** — Uses useAuth() to subscribe to auth state.
 *    When logout() is called, all Observer components (including ProtectedRoute)
 *    automatically react — ProtectedRoute detects isAuthenticated=false and
 *    redirects to login without this component needing to handle navigation.
 *
 * Before refactoring:
 *   - Read user from localStorage.getItem('user') in useEffect
 *   - Manually navigated to /login if no stored user
 *   - Manually removed localStorage items on logout
 *
 * After refactoring:
 *   - Gets user from auth.user (reactive, always up-to-date)
 *   - Route protection handled by ProtectedRoute (Observer pattern)
 *   - Logout calls auth.logout() — a single method that clears everything
 */
function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Observer pattern: triggers re-render in all auth-aware components
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>LostLink</h1>
        <button onClick={handleLogout} className="btn btn-outline">Logout</button>
      </header>
      <main className="dashboard-main">
        <div className="welcome-card">
          <h2>Welcome, {user.firstName} {user.lastName}!</h2>
          <p>You are logged in as <strong>{user.role}</strong></p>
          <div className="user-details">
            <div className="detail-row">
              <span className="detail-label">Student ID</span>
              <span className="detail-value">{user.studentId}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Email</span>
              <span className="detail-value">{user.email}</span>
            </div>
          </div>
          <p className="placeholder-note">
            🚧 The item feed and full dashboard will be implemented in later phases.
          </p>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
