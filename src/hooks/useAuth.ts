import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/axios';

export const useAuth = () => {
  const [admin, setAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const isInitialMount = useRef(true);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      setAdmin(null);
      setLoading(false);
      return;
    }

    try {
      // If we already have an admin state, don't show the loading screen again
      if (!isInitialMount.current) setLoading(false);

      // Use a more reliable endpoint for checking auth status
      const response = await api.get('/admin/me'); 
      
      if (response.data && response.data.admin) {
        setAdmin(response.data.admin);
      }
    } catch (error: any) {
      // ONLY logout if the server explicitly says the token is invalid (401)
      if (error.response?.status === 401) {
        localStorage.removeItem('admin_token');
        setAdmin(null);
      }
      console.error("Auth sync error:", error.message);
    } finally {
      setLoading(false);
      isInitialMount.current = false;
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return { admin, loading, logout: () => {
    localStorage.removeItem('admin_token');
    setAdmin(null);
    window.location.href = '/login';
  }};
};