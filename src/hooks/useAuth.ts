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
      // If we already have a session, don't trigger the global loading spinner
      if (!isInitialMount.current) setLoading(false);

      // Attempt to verify the session with the backend
      // Using /admin/settings or /admin/me as a verification endpoint
      const response = await api.get('/admin/settings'); 
      
      if (response.data) {
        // Support both response formats (direct admin object or nested)
        setAdmin(response.data.admin || response.data);
      }
    } catch (error: any) {
      console.error("Auth verification failed:", error.message);
      
      // Only wipe the session if the backend explicitly says the token is dead
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

  // We return checkAuth so LoginPage.tsx can trigger a refresh after login
  return { admin, loading, setAdmin, checkAuth, logout };
};