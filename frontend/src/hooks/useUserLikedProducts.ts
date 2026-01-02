import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '@/config/api';

interface Product {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  price?: number;
  [key: string]: any;
}

interface UserLikedProductsResponse {
  products: Product[];
  total: number;
  limit: number;
  offset: number;
}

interface UseUserLikedProductsOptions {
  limit?: number;
  offset?: number;
  enabled?: boolean;
}

export function useUserLikedProducts({
  limit = 20,
  offset = 0,
  enabled = true,
}: UseUserLikedProductsOptions = {}) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['userLikedProducts', { limit, offset }],
    queryFn: async () => {
      const authTokens = localStorage.getItem('auth_tokens');
      const token = authTokens ? JSON.parse(authTokens).accessToken : null;
      const searchParams = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      });

      const response = await fetch(
        `${API_BASE_URL}/api/v1/products/likes?${searchParams}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized');
        }
        throw new Error('Failed to fetch liked products');
      }

      return response.json() as Promise<UserLikedProductsResponse>;
    },
    enabled,
    staleTime: 60000, // 1 minute
  });

  return {
    products: data?.products ?? [],
    total: data?.total ?? 0,
    limit: data?.limit ?? limit,
    offset: data?.offset ?? offset,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}
