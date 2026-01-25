/**
 * Product API Service
 * Handles all product-related API calls with proper error handling and SSR support
 */

import { API_BASE_URL } from '@/config/api';
import type { Product } from '@/types/search';

class ProductApiService {
  /**
   * Fetch product data by ID from the backend API
   * This supports server-side rendering (SSR) and search engine crawling
   * 
   * @param productId - The product UUID from the URL slug
   * @returns Promise<Product> - The complete product data
   * @throws Error if product not found or API fails
   */
  async fetchProductById(productId: string): Promise<Product> {
    if (!productId || productId === 'undefined' || productId === 'null') {
      throw new Error('Invalid product ID provided');
    }

    const url = `${API_BASE_URL}/api/v1/product/${productId}`;
    
    console.log(`[ProductApi] Fetching product data for ID: ${productId}`);
    console.log(`[ProductApi] URL: ${url}`);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Don't include credentials for public product data
        // This allows better caching by CDNs and search engines
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Product not found (ID: ${productId})`);
        }
        throw new Error(`Failed to fetch product: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[ProductApi] Successfully fetched product:', data.title || data.id);
      
      // Transform backend response to match Product interface
      return this.transformProductResponse(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[ProductApi] Error fetching product ${productId}:`, message);
      throw error;
    }
  }

  /**
   * Transform backend ProductResponse to frontend Product interface
   * Maps database field names to frontend expected names
   */
  private transformProductResponse(backendProduct: any): Product {
    const product: Product = {
      id: backendProduct.id,
      title: backendProduct.title,
      description: backendProduct.description,
      price: backendProduct.price ? Number(backendProduct.price) : 0,
      image_url: backendProduct.image_url,
      product_url: backendProduct.url || backendProduct.product_url,
      url: backendProduct.url || backendProduct.product_url,
      source: backendProduct.source,
      source_id: backendProduct.source_id,
      asin: backendProduct.asin,
      brand: backendProduct.brand,
      category: backendProduct.category,
      availability: backendProduct.availability,
      currency: backendProduct.currency || 'USD',
      rating: backendProduct.rating ? Number(backendProduct.rating) : undefined,
      review_count: backendProduct.review_count || 0,
      reviews_count: backendProduct.review_count || 0,
      site_rating: backendProduct.rating ? Number(backendProduct.rating) : undefined,
      reviews_summary: backendProduct.reviews_summary,
      is_detailed_fetched: backendProduct.is_detailed_fetched || false,
      created_at: backendProduct.created_at,
      updated_at: backendProduct.updated_at,
      immersive_product_api_link: backendProduct.immersive_product_api_link,
      immersive_product_page_token: backendProduct.immersive_product_page_token,
      // Preserve any additional fields from API response
      ...backendProduct,
    };

    return product;
  }

  /**
   * Fetch enriched product data (SerpAPI)
   * This is the second step after getting basic product data
   */
  async fetchEnrichedProductData(
    productId: string,
    immersiveApiLink: string
  ): Promise<any> {
    const url = `${API_BASE_URL}/api/v1/product/enriched/${productId}`;
    
    console.log('[ProductApi] Fetching enriched data for product:', productId);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          immersive_api_link: immersiveApiLink,
        }),
      });

      if (!response.ok) {
        console.warn(
          '[ProductApi] Failed to fetch enriched data:',
          response.status,
          response.statusText
        );
        return null;
      }

      const data = await response.json();
      console.log('[ProductApi] Successfully fetched enriched data');
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('[ProductApi] Error fetching enriched data:', message);
      return null;
    }
  }
}

export const productApiService = new ProductApiService();
