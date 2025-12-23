import { useEffect, useState, useCallback } from 'react';
import { useAuth } from './useAuth';

interface SubscriptionData {
  plan_type: string;
  is_active: boolean;
  is_trial: boolean;
  billing_cycle?: string;
  subscription_start?: string;
  subscription_end?: string;
  trial_end?: string;
  days_remaining?: number;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function useUserAccess() {
  const { isAuthenticated, user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch subscription from backend
  const fetchSubscription = useCallback(async () => {
    if (!isAuthenticated) {
      setSubscription(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        setSubscription(null);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/payments/subscription`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch subscription');
      }

      const data: SubscriptionData = await response.json();
      setSubscription(data);
      
      // Cache subscription in localStorage
      localStorage.setItem('user_subscription', JSON.stringify(data));
    } catch (err) {
      console.error('Error fetching subscription:', err);
      // Fallback to cached subscription
      const cached = localStorage.getItem('user_subscription');
      if (cached) {
        setSubscription(JSON.parse(cached));
      }
      setError(err instanceof Error ? err.message : 'Failed to fetch subscription');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch on mount and when auth changes
  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription, isAuthenticated]);

  // Determine access level based on subscription
  const accessLevel = subscription?.plan_type === 'free' || !subscription?.is_active 
    ? ('free' as const)
    : ('premium' as const);

  const hasActiveSubscription = subscription?.is_active === true && (
    subscription.plan_type === 'premium' || subscription.plan_type === 'trial'
  );

  return {
    hasActiveSubscription,
    subscription,
    accessLevel,
    loading,
    error,
    unlockedSearches: [],
    unlockedCategories: [],
    canAccessSearch: () => hasActiveSubscription,
    canAccessCategory: () => hasActiveSubscription,
    canAccessPremiumFeatures: () => hasActiveSubscription,
    canViewAllProducts: () => hasActiveSubscription,
    getMaxProductCount: () => hasActiveSubscription ? Infinity : 10,
    refreshAccess: () => fetchSubscription(),
    refetchAccess: () => fetchSubscription(),
  };
}