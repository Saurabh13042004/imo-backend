import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface ShortVideo {
  id: string;
  platform: string; // "YouTube Shorts", "TikTok", "Instagram Reels"
  video_url: string;
  thumbnail_url?: string;
  creator: string;
  caption?: string;
  likes: number;
  views: number;
  duration?: number;
}

interface UseShortVideoReviewsReturn {
  videos: ShortVideo[];
  status: "idle" | "loading" | "ready" | "error";
  error: string | null;
  isLoading: boolean;
}

/**
 * Hook to fetch and manage short-form video reviews for a product.
 * 
 * Non-blocking: page renders immediately, videos load in background.
 * Triggers ONLY after product details are available.
 */
export const useShortVideoReviews = (
  productId: string | undefined,
  productTitle?: string
): UseShortVideoReviewsReturn => {
  const [videos, setVideos] = useState<ShortVideo[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Only trigger if we have a productId and productTitle
    if (!productId || !productTitle) {
      return;
    }

    const fetchVideos = async () => {
      try {
        setStatus("loading");
        setIsLoading(true);
        setError(null);

        // Pass product title as query parameter
        const url = new URL(`/api/v1/product/${productId}/short-video-reviews`, window.location.origin);
        url.searchParams.append("title", productTitle);

        const response = await fetch(url.toString());
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Product not found");
          }
          throw new Error(`Failed to fetch short videos: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.success && data.videos) {
          setVideos(data.videos);
          setStatus("ready");
          
          if (data.total > 0) {
            console.log(`[useShortVideoReviews] Loaded ${data.total} short video reviews`);
          }
        } else {
          setVideos([]);
          setStatus("ready");
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        setStatus("error");
        console.error("[useShortVideoReviews] Error:", errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    // Non-blocking fetch with small delay
    const timeoutId = setTimeout(fetchVideos, 300);
    
    return () => clearTimeout(timeoutId);
  }, [productId, productTitle]);

  return {
    videos,
    status,
    error,
    isLoading
  };
};
