import axios from 'axios';

/**
 * This instance is used for all API calls.
 * withCredentials: true is MANDATORY for Railway to accept the 'token' cookie.
 */
const API = axios.create({
  // Use the environment variable if it exists, otherwise fallback to your Railway backend
  baseURL: import.meta.env.VITE_API_URL || 'https://gulf-clinic-backend-production.up.railway.app',
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json',
  }
});

// Response Interceptor: Automatically handles errors globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Detailed logging to help find the issue
    console.error("API Error details:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    if (error.response?.status === 401) {
      console.warn("Session expired or unauthorized.");
    }
    return Promise.reject(error);
  }
);

export default API;