import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AuthService from '../services/AuthService';

/**
 * Authentication Context (Observer Pattern)
 *
 * **Design Pattern: Observer (Behavioral)**
 *
 * React's Context API implements the Observer pattern where:
 * - AuthProvider is the **Subject** (Observable) — it manages auth state
 *   and notifies all subscribers when state changes.
 * - Components using useAuth() are **Observers** — they automatically
 *   re-render whenever the auth state (user, isAuthenticated) changes.
 *
 * Before this pattern, each page component independently read localStorage
 * to determine auth state, leading to:
 * - No reactivity (state changes in one component didn't propagate)
 * - Duplicated localStorage access logic in every component
 * - No single source of truth for auth state
 *
 * Now, AuthProvider maintains a centralized auth state. When login() or
 * logout() are called, React automatically notifies all subscribed
 * components (Observers), causing them to re-render with the latest state.
 */

const AuthContext = createContext(null);

/**
 * AuthProvider component — the Subject (Observable) in the Observer pattern.
 *
 * Wraps the application and provides auth state + operations to all child
 * components via React Context. Any component calling useAuth() becomes
 * an Observer and will automatically re-render when auth state changes.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // Initial auth check

  // On mount, check for existing session (hydrate from localStorage)
  useEffect(() => {
    const storedUser = AuthService.getCurrentUser();
    if (storedUser && AuthService.isAuthenticated()) {
      setUser(storedUser);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  /**
   * Login — authenticates the user and notifies all Observers.
   * When setUser/setIsAuthenticated are called, all components
   * using useAuth() automatically re-render with the new state.
   */
  const login = useCallback(async (credentials) => {
    const result = await AuthService.login(credentials);
    if (result.success) {
      setUser(result.user);
      setIsAuthenticated(true);
    }
    return result;
  }, []);

  /**
   * Register — creates an account (delegates to Facade).
   * Does not auto-login; the user navigates to login after registration.
   */
  const register = useCallback(async (userData) => {
    return await AuthService.register(userData);
  }, []);

  /**
   * Logout — clears auth state and notifies all Observers.
   * All components using useAuth() will see isAuthenticated become false.
   */
  const logout = useCallback(() => {
    AuthService.logout();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  // Context value provided to all Observers (consuming components)
  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth hook — subscribes a component as an Observer.
 *
 * Any component calling this hook will automatically re-render
 * whenever the auth state changes (login, logout, etc.).
 *
 * @returns {{ user: object|null, isAuthenticated: boolean, loading: boolean, login: Function, register: Function, logout: Function }}
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
