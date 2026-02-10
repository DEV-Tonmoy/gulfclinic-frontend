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
    try {
      const response = await api.get('/admin/stats');
      if (response.data && response.data.admin) {
        setAdmin(response.data.admin);
      } else {
        // Fallback if stats returns but no admin object
        setAdmin({ id: 'unknown', email: '', role: 'ADMIN' });
      }
    } catch (error) {
      console.error("Authentication check failed. Redirecting to login.");
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return { admin, loading, setAdmin, checkAuth };
};