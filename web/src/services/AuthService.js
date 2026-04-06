import { loginUser, registerUser } from './api';

/**
 * Authentication Service Facade
 *
 * **Design Pattern: Facade (Structural)**
 *
 * This service provides a simplified, unified interface for all authentication
 * operations, hiding the complexity of the underlying subsystems:
 *
 *   - Axios API calls (HTTP layer)
 *   - localStorage (persistence layer)
 *   - Error response parsing (error handling layer)
 *
 * Before this Facade, each React page component (Login, Register, Dashboard)
 * independently performed:
 *   1. Direct API calls via Axios
 *   2. Manual localStorage read/write operations
 *   3. Inline error response parsing with multiple conditionals
 *
 * Now, components simply call AuthService methods and receive clean results,
 * reducing coupling and eliminating duplicated logic across pages.
 *
 * Usage:
 *   const result = await AuthService.login({ identifier, password });
 *   if (result.success) { navigate('/dashboard'); }
 *   else { showError(result.error); }
 */
const AuthService = {
  /**
   * Authenticate a user with their Student ID/Email and password.
   *
   * Handles the full login flow:
   * 1. Sends credentials to the backend API
   * 2. Stores user data and token in localStorage on success
   * 3. Parses error responses on failure
   *
   * @param {{ identifier: string, password: string }} credentials
   * @returns {Promise<{ success: boolean, user?: object, error?: string, fieldErrors?: object }>}
   */
  async login(credentials) {
    try {
      const res = await loginUser(credentials);
      if (res.data.success) {
        const { user, accessToken } = res.data.data;
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', accessToken);
        return { success: true, user };
      }
      return { success: false, error: 'Login failed.' };
    } catch (err) {
      return { success: false, error: this._parseError(err, 'Login failed. Please check your credentials.') };
    }
  },

  /**
   * Register a new user account.
   *
   * Handles the full registration flow:
   * 1. Sends registration data to the backend API
   * 2. Parses validation errors and duplicate entry errors
   *
   * @param {{ studentId: string, email: string, firstName: string, lastName: string, password: string }} userData
   * @returns {Promise<{ success: boolean, error?: string, fieldErrors?: object }>}
   */
  async register(userData) {
    try {
      const res = await registerUser(userData);
      if (res.data.success) {
        return { success: true };
      }
      return { success: false, error: 'Registration failed.' };
    } catch (err) {
      const data = err.response?.data;

      // Handle validation errors (field-specific)
      if (data?.error?.code === 'VALID-001' && typeof data.error.details === 'object') {
        return { success: false, fieldErrors: data.error.details };
      }

      return { success: false, error: this._parseError(err, 'Registration failed. Please try again.') };
    }
  },

  /**
   * Log out the current user.
   * Clears all stored authentication data from localStorage.
   */
  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  },

  /**
   * Get the currently stored user data.
   *
   * @returns {object|null} The stored user object, or null if not logged in.
   */
  getCurrentUser() {
    const stored = localStorage.getItem('user');
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },

  /**
   * Check if a user is currently authenticated.
   *
   * @returns {boolean} True if a token exists in localStorage.
   */
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  /**
   * Internal helper to parse error responses from the API.
   * Extracts the most specific error message available.
   *
   * @param {Error} err - The Axios error object
   * @param {string} fallback - Fallback message if parsing fails
   * @returns {string} The parsed error message
   * @private
   */
  _parseError(err, fallback) {
    const data = err.response?.data;
    if (data?.error?.details && typeof data.error.details === 'string') {
      return data.error.details;
    }
    if (data?.error?.message) {
      return data.error.message;
    }
    return fallback;
  },
};

export default AuthService;
