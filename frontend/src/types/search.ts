export interface Product {
  // Core fields
  id: string;
  title: string;
  description?: string;
  price: number | string;
  image_url: string;
  image_urls?: string[];
  product_url?: string;
  url?: string;
  
  // Source/Retailer info
  source: string;  // Can be "amazon", "walmart", "best_buy", "target", "staples", "office_depot", etc.
  source_id: string | null;
  
  // Product metadata
  asin?: string;
  brand?: string;
  category?: string;
  availability?: string;
  currency?: string;
  
  // Ratings and reviews
  imo_score?: number;
  pro?: string[];
  cons?: string[];
  reviews_summary?: string;
  site_rating?: number;
  reviews_count?: number;
  rating?: number;
  review_count?: number;
  
  // Timestamps
  created_at: string;
  updated_at?: string;
  
  // Additional fields
  query?: string;
  is_detailed_fetched?: boolean;
  
  // Like data to prevent individual API calls
  like_count?: number;
  liked_by_user?: boolean;
  
  // Google Shopping / SerpAPI immersive product fields
  immersive_product_api_link?: string;
  immersive_product_page_token?: string;
  
  // Catch-all for any additional API fields
  [key: string]: any;
}

export interface Video {
  id: string;
  title: string;
  video_url: string;
  thumbnail_url: string;
  views: number;
  likes: number;
}