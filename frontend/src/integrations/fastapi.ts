/**
 * FastAPI Backend Configuration
 * Centralized API endpoint configuration and HTTP client
 */

const API_URL =
  process.env.NODE_ENV === "production"
    ? "https://api.yourdomain.com"
    : "http://localhost:8000";

/**
 * Generic fetch wrapper for API calls
 */
async function apiCall<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        errorText || `API Error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API call failed: ${endpoint}`, error);
    throw error;
  }
}

/**
 * Search Products
 */
export interface SearchRequest {
  query: string;
  sources?: string[];
  max_products?: number;
  deduplicate?: boolean;
  use_cache?: boolean;
}

export interface SearchResponse {
  success: boolean;
  query: string;
  total_products: number;
  products: Array<{
    id?: string;
    title: string;
    price: string | number;
    image?: string;
    url: string;
    source: string;
    rating?: string | number;
    reviews?: string;
    reviews_count?: number;
    pros?: string[];
    cons?: string[];
    imo_score?: number;
    is_prime?: boolean;
    analysis?: {
      title?: string;
      price?: string | number;
      rating?: string | number;
      reviews?: string;
      url?: string;
      source?: string;
      imo_score?: number;
      pros?: string[];
      cons?: string[];
    };
  }>;
  took_seconds: number;
  from_cache: boolean;
}

export async function searchProducts(
  request: SearchRequest
): Promise<SearchResponse> {
  return apiCall<SearchResponse>("/api/search", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

/**
 * Get Trending Products
 */
export async function getTrendingProducts(limit: number = 10) {
  return apiCall(`/api/products/trending?limit=${limit}`, {
    method: "GET",
  });
}

/**
 * List Products
 */
export interface ListProductsResponse {
  success: boolean;
  products: Array<any>;
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export async function listProducts(
  page: number = 1,
  limit: number = 20,
  category?: string,
  sortBy: string = "relevance"
): Promise<ListProductsResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    sort_by: sortBy,
  });

  if (category) {
    params.append("category", category);
  }

  return apiCall<ListProductsResponse>(`/products?${params.toString()}`, {
    method: "GET",
  });
}

/**
 * Get Product Details
 */
export async function getProductDetail(productId: string) {
  return apiCall(`/products/${productId}`, {
    method: "GET",
  });
}

/**
 * Get Product Basic Info
 */
export async function getProductBasic(productId: string) {
  return apiCall(`/products/${productId}`, {
    method: "GET",
  });
}

/**
 * Get Product Reviews
 */
export async function getProductReviews(productId: string) {
  return apiCall(`/products/${productId}/reviews`, {
    method: "GET",
  });
}

/**
 * Get Product Videos
 */
export async function getProductVideos(productId: string) {
  return apiCall(`/products/${productId}/videos`, {
    method: "GET",
  });
}

/**
 * Authentication
 */
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  full_name: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    email: string;
    full_name: string;
    subscription: string;
  };
}

export async function login(request: LoginRequest): Promise<AuthResponse> {
  return apiCall<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function signup(request: SignupRequest): Promise<AuthResponse> {
  return apiCall<AuthResponse>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function getCurrentUser(token: string) {
  return apiCall("/auth/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Products - Likes
 */
export async function likeProduct(productId: string, userId: string) {
  return apiCall(`/products/${productId}/like?user_id=${userId}`, {
    method: "POST",
  });
}

export async function unlikeProduct(productId: string, userId: string) {
  return apiCall(`/products/${productId}/unlike?user_id=${userId}`, {
    method: "POST",
  });
}

export async function getUserLikedProducts(userId: string) {
  return apiCall(`/products/likes?user_id=${userId}`, {
    method: "GET",
  });
}

/**
 * Health Check
 */
export async function checkHealth() {
  return apiCall("/health", {
    method: "GET",
  });
}

/**
 * API URL getter (useful for dynamic configuration)
 */
export function getApiUrl(): string {
  return API_URL;
}

export default {
  searchProducts,
  getTrendingProducts,
  listProducts,
  getProductDetail,
  login,
  signup,
  getCurrentUser,
  likeProduct,
  unlikeProduct,
  getUserLikedProducts,
  checkHealth,
  getApiUrl,
};
