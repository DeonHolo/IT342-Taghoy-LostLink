import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Protected Route Component
 *
 * **Design Pattern: Observer (Behavioral)**
 *
 * This component acts as an Observer of the auth state via useAuth().
 * It automatically reacts to changes in isAuthenticated:
 * - When isAuthenticated is true → renders the protected children
 * - When isAuthenticated is false → redirects to login
 * - When loading (initial auth check) → shows nothing (prevents flash)
 *
 * Usage in App.jsx:
 *   <Route path="/dashboard" element={
 *     <ProtectedRoute><Dashboard /></ProtectedRoute>
 *   } />
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  // While checking initial auth state, render nothing to prevent flash
  if (loading) {
    return null;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated — render the protected content
  return children;
}

export default ProtectedRoute;
