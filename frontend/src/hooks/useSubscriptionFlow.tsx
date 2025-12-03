import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export function useSubscriptionFlow() {
  const { toast } = useToast();

  const createCheckoutSession = useCallback(async (
    type: 'subscription' | 'unlock',
    searchQuery?: string
  ) => {
    toast({
      title: "Demo Mode",
      description: "Checkout not available in demo mode",
    });
    return null;
  }, [toast]);

  const handlePaymentSuccess = useCallback(async () => {
    toast({
      title: "Payment Successful",
      description: "Welcome!",
    });
  }, [toast]);

  const handlePaymentCancelled = useCallback(async () => {
    toast({
      title: "Payment Cancelled",
      description: "You can try again anytime.",
      variant: "destructive",
    });
  }, [toast]);

  const manageSubscription = useCallback(async () => {
    toast({
      title: "Demo Mode",
      description: "Subscription management not available in demo mode",
    });
  }, [toast]);

  return {
    loading: false,
    error: null,
    checkoutUrl: null,
    createCheckoutSession,
    handlePaymentSuccess,
    handlePaymentCancelled,
    manageSubscription,
    clearError: () => {},
  };
}