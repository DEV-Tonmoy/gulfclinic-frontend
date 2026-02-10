import axios from 'axios';

/**
 * This instance is used for all API calls.
 * withCredentials: true is MANDATORY for Railway to accept the 'token' cookie.
 */
const API = axios.create({
  // Pointing to the root of your Railway backend
  baseURL: 'https://gulf-clinic-backend-production.up.railway.app',
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json',
  }
});

// Response Interceptor: Automatically handles errors globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the backend returns 401 (Unauthorized), the session is dead
    if (error.response?.status === 401) {
      console.warn("Session expired or unauthorized. Redirecting...");
      // Optional: window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;