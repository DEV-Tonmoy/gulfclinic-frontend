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
    const token = localStorage.getItem('admin_token');
    
    if (!token) {
      setAdmin(null);
      setLoading(false);
      return;
    }

    try {
      // TEMPORARY FIX: If we have a token, set a temporary admin state 
      // so the UI lets us in while the API check happens.
      if (!admin) {
        setAdmin({ id: 'temp', email: '', role: 'ADMIN' }); 
      }

      // Change this to a simpler health check or profile endpoint if /stats is broken
      const response = await api.get('/admin/settings'); 
      
      if (response.data) {
        setAdmin(response.data.admin || response.data);
      }
    } catch (error) {
      console.error("Auth check failed:", (error as any).message);
      // Only remove token if it's a 401 Unauthorized error
      if ((error as any).response?.status === 401) {
        localStorage.removeItem('admin_token');
        setAdmin(null);
      }
    } finally {
      setLoading(false);
    }
  }, [admin]);

  const logout = useCallback(() => {
    localStorage.removeItem('admin_token');
    setAdmin(null);
    window.location.href = '/login';
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return { admin, loading, setAdmin, checkAuth, logout };
};