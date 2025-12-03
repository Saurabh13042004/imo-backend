import { useCallback, useRef, useEffect } from 'react';

export type AnalyticsEventType = 
  | 'unlock_attempt'
  | 'checkout_started' 
  | 'checkout_success'
  | 'checkout_cancelled'
  | 'content_unlocked'
  | 'subscription_active'
  | 'product_view'
  | 'search_performed'
  | 'category_interest'
  | 'affiliate_click'
  | 'upgrade_prompt_shown'
  | 'free_limit_reached';

export type InteractionType = 
  | 'content_view'
  | 'unlock_prompt_shown'
  | 'unlock_attempt'
  | 'content_unlocked'
  | 'category_blocked'
  | 'search_blocked'
  | 'product_limit_reached';

interface AnalyticsEventData {
  category?: string;
  product_id?: string;
  amount?: number;
  currency?: string;
  plan_type?: string;
  source?: string;
  search_query?: string;
  total_results?: number;
  user_limit?: number;
  [key: string]: any;
}

interface InteractionData {
  category?: string;
  product_id?: string;
  product_title?: string;
  limit_reached?: boolean;
  subscription_status?: string;
  [key: string]: any;
}

export function useAnalytics() {
  const sessionIdRef = useRef<string>('');

  useEffect(() => {
    if (!sessionIdRef.current) {
      sessionIdRef.current = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  }, []);

  const trackEvent = useCallback(async (
    eventType: AnalyticsEventType,
    eventData: AnalyticsEventData = {}
  ) => {
    // Demo mode - log to console only
    console.log('Analytics event:', eventType, eventData);
  }, []);

  const trackInteraction = useCallback(async (
    interactionType: InteractionType,
    contentType: string,
    contentId: string,
    metadata: InteractionData = {}
  ) => {
    // Demo mode - log to console only
    console.log('Interaction:', interactionType, contentType, contentId, metadata);
  }, []);

  const trackAffiliateClick = useCallback(async (
    productId: string,
    retailer: string,
    subscriptionStatus: string = 'free',
    conversionValue: number = 0
  ) => {
    console.log('Affiliate click:', productId, retailer);
  }, []);

  const trackUnlockAttempt = useCallback((category: string, planType: string) => {
    return trackEvent('unlock_attempt', { category, plan_type: planType });
  }, [trackEvent]);

  const trackCheckoutStarted = useCallback((price: number, category: string, method: 'one-time' | 'subscription') => {
    return trackEvent('checkout_started', { price, category, method, currency: 'usd' });
  }, [trackEvent]);

  const trackCheckoutSuccess = useCallback((type: string, price: number) => {
    return trackEvent('checkout_success', { type, price, timestamp: new Date().toISOString(), currency: 'usd' });
  }, [trackEvent]);

  const trackContentUnlocked = useCallback((method: string, category: string) => {
    return trackEvent('content_unlocked', { method, category });
  }, [trackEvent]);

  const trackSubscriptionActive = useCallback((plan: string) => {
    return trackEvent('subscription_active', { plan, timestamp: new Date().toISOString() });
  }, [trackEvent]);

  const trackCheckoutCancelled = useCallback((type: 'subscription' | 'unlock', category?: string) => {
    return trackEvent('checkout_cancelled', { plan_type: type, category });
  }, [trackEvent]);

  const trackProductView = useCallback((productId: string, category?: string) => {
    return trackEvent('product_view', { product_id: productId, category });
  }, [trackEvent]);

  const trackSearchPerformed = useCallback((query: string, totalResults: number, userLimit?: number) => {
    return trackEvent('search_performed', { search_query: query, total_results: totalResults, user_limit: userLimit });
  }, [trackEvent]);

  const trackUpgradePromptShown = useCallback((location: string, category?: string) => {
    return trackEvent('upgrade_prompt_shown', { source: location, category });
  }, [trackEvent]);

  const trackFreeLimitReached = useCallback((limit: number, totalAvailable: number) => {
    return trackEvent('free_limit_reached', { user_limit: limit, total_results: totalAvailable });
  }, [trackEvent]);

  return {
    trackEvent,
    trackInteraction,
    trackAffiliateClick,
    trackUnlockAttempt,
    trackCheckoutStarted,
    trackCheckoutSuccess,
    trackCheckoutCancelled,
    trackContentUnlocked,
    trackSubscriptionActive,
    trackProductView,
    trackSearchPerformed,
    trackUpgradePromptShown,
    trackFreeLimitReached,
    sessionId: sessionIdRef.current,
  };
}