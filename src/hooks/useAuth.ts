import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/axios';

interface Admin {
  id: string;
  email: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
}

export const useAuth = () => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const isInitialMount = useRef(true);

  const checkAuth = useCallback(async () => {
    try {
      const response = await api.get('/admin/me');
      if (response.data && response.data.success) {
        setAdmin(response.data.admin);
      } else {
        setAdmin(null);
      }
    } catch (error: any) {
      setAdmin(null);
    } finally {
      setLoading(false);
      isInitialMount.current = false;
    }
  }, []);

  const logout = useCallback(() => {
    setAdmin(null);
    window.location.href = '/login';
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return { admin, loading, setAdmin, checkAuth, logout };
};