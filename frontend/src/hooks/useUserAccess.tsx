export function useUserAccess() {
  return {
    hasActiveSubscription: true,
    unlockedSearches: [],
    unlockedCategories: [],
    accessLevel: 'premium' as const,
    subscription: null,
    loading: false,
    error: null,
    canAccessSearch: () => true,
    canAccessCategory: () => true,
    canAccessPremiumFeatures: () => true,
    canViewAllProducts: () => true,
    getMaxProductCount: () => Infinity,
    refreshAccess: () => {},
    refetchAccess: () => {},
  };
}