// Simple auth context - no real authentication
export function useAuth() {
  return {
    user: null,
    session: null,
    loading: false,
    signOut: async () => {
      console.log('Sign out requested (demo mode)');
    },
  };
}