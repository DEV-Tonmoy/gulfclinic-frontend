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
      // We use a specific profile/me endpoint instead of 'stats' for clarity
      // but for now, we'll keep your endpoint to avoid backend changes
      const response = await api.get('/admin/stats');
      
      if (response.data && response.data.admin) {
        setAdmin(response.data.admin);
      } else {
        // If the backend returns success but no admin data, we shouldn't assume logged in
        setAdmin(null);
      }
    } catch (error) {
      // This happens if the cookie is missing or expired (401/403)
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