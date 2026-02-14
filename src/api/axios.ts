import axios from 'axios';

// Detect if we are running locally
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

/**
 * Updated BASE_URL:
 * Removed the "3" from the fallback to match your confirmed Render URL:
 * https://gulf-clinic-backend.onrender.com
 */
const BASE_URL = isLocalhost 
  ? 'http://localhost:4000' 
  : (import.meta.env.VITE_API_URL || 'https://gulf-clinic-backend.onrender.com');

console.log("Current API Base URL:", BASE_URL); // Crucial for verifying the fix in the browser console

const API = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request Interceptor: Attach JWT token from LocalStorage for every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Handle session expiration or unauthorized access
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If the backend returns 401 (Unauthorized), clear the token and kick to login
      localStorage.removeItem('admin_token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;