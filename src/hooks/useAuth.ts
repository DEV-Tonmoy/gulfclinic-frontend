import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

interface Admin {
  id: string;
  email: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
}

export const useAuth = () => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    // If there is no token at all, don't even bother calling the API
    const token = localStorage.getItem('admin_token');
    if (!token) {
      setAdmin(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // We use /admin/me or /admin/stats to verify the token is still valid
      const response = await api.get('/admin/stats');
      
      if (response.data && response.data.success) {
        // Map the admin data from the response
        setAdmin(response.data.admin);
      } else {
        // If API returns success: false, clear the local token
        localStorage.removeItem('admin_token');
        setAdmin(null);
      }
    } catch (error) {
      console.error("Auth check failed:", (error as any).message);
      localStorage.removeItem('admin_token');
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('admin_token');
    setAdmin(null);
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return { admin, loading, setAdmin, checkAuth, logout };
};