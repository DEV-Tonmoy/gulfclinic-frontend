import axios from 'axios';

// Detect if we are running locally
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

/**
 * FIXED BASE_URL:
 * We are removing the environment variable fallback to stop the "3" URL from appearing.
 * This forces the frontend to use the correct dashed URL on Render.
 */
const BASE_URL = isLocalhost 
  ? 'http://localhost:4000' 
  : 'https://gulf-clinic-backend.onrender.com';

console.log("Current API Base URL:", BASE_URL); 

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
      localStorage.removeItem('admin_token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;