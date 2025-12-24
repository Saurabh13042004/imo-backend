import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { API_BASE_URL } from '@/config/api';

interface AdminCheckResult {
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
}

export function useAdminCheck(): AdminCheckResult {
  const { user, accessToken, isAuthenticated } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!isAuthenticated || !accessToken) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/profile/admin-check`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setIsAdmin(data.is_admin === true);
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        console.error('Error checking admin status:', err);
        setError(err instanceof Error ? err.message : 'Failed to check admin status');
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [isAuthenticated, accessToken]);

  return { isAdmin, loading, error };
}
