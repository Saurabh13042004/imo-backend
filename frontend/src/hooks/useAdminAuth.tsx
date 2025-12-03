// Simplified admin auth hook - returns false (demo mode has no admins)
export function useAdminAuth() {
  return {
    isAdmin: false,
    loading: false,
  };
}