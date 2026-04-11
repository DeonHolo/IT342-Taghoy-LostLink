import axios from 'axios';

/**
 * Singleton Axios Instance
 *
 * **Design Pattern: Singleton (Creational)**
 *
 * This module creates a single, shared Axios instance configured with the backend
 * base URL and default headers. JavaScript's module system guarantees that this
 * file is executed only once — all importers receive the same instance.
 *
 * The Singleton pattern ensures:
 * - Consistent base URL and headers across all API calls
 * - Centralized request interceptor for automatic auth token injection
 * - Centralized response interceptor for unified error handling and auto-logout on 401
 * - Single point of configuration (timeouts, CORS, etc.)
 */
const API = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000, // 30 second timeout matching the mobile client
});

/**
 * Request Interceptor — Automatic Auth Token Injection
 *
 * Before every outgoing request, this interceptor checks localStorage for a
 * stored auth token and attaches it as a Bearer token in the Authorization header.
 * This eliminates the need for each component to manually include auth headers.
 */
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor — Centralized Error Handling
 *
 * Intercepts all responses to provide unified error handling:
 * - 401 Unauthorized: Automatically clears session and redirects to login
 * - Other errors: Passes through for component-level handling
 */
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Auto-logout on unauthorized response
      localStorage.removeItem('user');
      localStorage.removeItem('token');

      // Only redirect if not already on the login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const googleLogin = (token) => API.post('/auth/google', { token });

export default API;
