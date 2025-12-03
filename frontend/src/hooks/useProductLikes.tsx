import { useState, useEffect } from 'react';
import { useToast } from './use-toast';

export function useProductLikes(
  productId?: string, 
  initialLikeCount?: number, 
  initialLikedByUser?: boolean
) {
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(initialLikedByUser ?? false);
  const [likeCount, setLikeCount] = useState(initialLikeCount ?? 0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialLikeCount !== undefined) {
      setLikeCount(initialLikeCount);
    }
    if (initialLikedByUser !== undefined) {
      setIsLiked(initialLikedByUser);
    }
  }, [initialLikeCount, initialLikedByUser]);

  const toggleLike = async () => {
    setLoading(true);
    try {
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? Math.max(0, prev - 1) : prev + 1);
      toast({
        title: "Success",
        description: isLiked ? "Product removed from likes" : "Product added to likes",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update like status",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    isLiked,
    likeCount,
    toggleLike,
    loading
  };
}