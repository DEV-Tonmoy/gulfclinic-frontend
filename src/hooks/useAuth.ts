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
    const token = localStorage.getItem('admin_token');
    
    if (!token) {
      setAdmin(null);
      setLoading(false);
      return;
    }

    try {
      if (!isInitialMount.current) setLoading(false);

      // FIXED: Removed /api prefix to match Backend app.use("/admin", adminAuthRoutes)
      const response = await api.get('/admin/me'); 
      
      if (response.data && response.data.success) {
        setAdmin(response.data.admin);
      } else if (response.data && !response.data.success) {
        throw new Error("Unauthorized");
      }
    } catch (error: any) {
      console.error("Auth verification failed:", error.message);
      
      // If backend rejects the token, clear it and redirect
      if (error.response?.status === 401) {
        localStorage.removeItem('admin_token');
        setAdmin(null);
      }
    } finally {
      setLoading(false);
      isInitialMount.current = false;
    }
  }, []);

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