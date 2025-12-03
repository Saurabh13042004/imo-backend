interface SearchAccessResponse {
  showUpgradeBanner: boolean;
  hasActiveSubscription: boolean;
  hasSearchUnlock: boolean;
}

export function useSearchAccess(searchQuery?: string) {
  return {
    data: {
      showUpgradeBanner: false,
      hasActiveSubscription: true,
      hasSearchUnlock: false,
    } as SearchAccessResponse,
    isLoading: false,
    isError: false,
    error: null,
  };
}