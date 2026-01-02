import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProductLikes } from '@/hooks/useProductLikes';
import { cn } from '@/lib/utils';

interface ProductLikeButtonProps {
  productId: string;
  className?: string;
  showCount?: boolean;
  // Initial values from backend to prevent extra API calls
  initialLikeCount?: number;
  initialLikedByUser?: boolean;
  // Product data to save when creating/updating product on like
  productData?: {
    title?: string;
    image_url?: string;
    price?: number;
    currency?: string;
    source?: string;
    source_id?: string;
    brand?: string;
    description?: string;
    url?: string;
    category?: string;
    availability?: string;
  };
}

export function ProductLikeButton({ 
  productId, 
  className, 
  showCount = true,
  initialLikeCount,
  initialLikedByUser,
  productData
}: ProductLikeButtonProps) {
  const { isLiked, likeCount, toggleLike, loading } = useProductLikes({
    productId, 
    initialLikeCount, 
    initialLikedByUser,
    productData
  });

  return (
    <Button
      onClick={toggleLike}
      disabled={loading}
      variant="outline"
      size="sm"
      className={cn(
        "gap-2 transition-colors",
        isLiked && "text-red-500 border-red-200 bg-red-50 hover:bg-red-100",
        className
      )}
    >
      <Heart 
        className={cn(
          "h-4 w-4",
          isLiked && "fill-current"
        )} 
      />
      {showCount && <span>{likeCount}</span>}
    </Button>
  );
}