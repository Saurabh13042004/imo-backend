import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Heart from 'lucide-react/dist/esm/icons/heart';
import { useUserLikedProducts } from '@/hooks/useUserLikedProducts';
import { ProductGrid } from '@/components/search/ProductGrid';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function Likes() {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [limit] = useState(20);
  const [offset, setOffset] = useState(0);
  
  const { products, total, isLoading, error, refetch } = useUserLikedProducts({
    limit,
    offset,
    enabled: isAuthenticated && !authLoading,
  });

  // Redirect to login if not authenticated
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
          <h2 className="text-2xl font-bold mb-2">Sign in to view your likes</h2>
          <p className="text-muted-foreground mb-6">You need to be logged in to view your liked products</p>
          <Button onClick={() => navigate('/login')}>Sign In</Button>
        </div>
      </div>
    );
  }

  const hasNextPage = offset + limit < total;
  const hasPreviousPage = offset > 0;

  return (
    <div className="bg-background">
      <div className="container mx-auto py-12 px-6 max-w-7xl">
        <div className="flex items-center space-x-4 mb-8">
          <div className="bg-gradient-to-br from-red-500/20 to-pink-500/20 p-3 rounded-2xl">
            <Heart className="h-8 w-8 text-red-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Your Liked Products</h1>
            <Badge variant="secondary" className="mt-2">
              <Heart className="h-3 w-3 mr-1" />
              {total} {total === 1 ? 'product' : 'products'}
            </Badge>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <Heart className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-medium mb-2">Error loading liked products</h3>
            <p className="text-muted-foreground mb-6">{error.message}</p>
            <Button onClick={() => refetch()}>Retry</Button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-medium mb-2">No liked products yet</h3>
            <p className="text-muted-foreground mb-6">Products you like will appear here</p>
            <Button onClick={() => navigate('/search')}>Browse Products</Button>
          </div>
        ) : (
          <>
            <ProductGrid products={products} />
            
            {/* Pagination Controls */}
            <div className="flex justify-center items-center gap-4 mt-8">
              <Button
                variant="outline"
                disabled={!hasPreviousPage}
                onClick={() => setOffset(Math.max(0, offset - limit))}
              >
                Previous
              </Button>
              
              <div className="text-sm text-muted-foreground">
                Showing {offset + 1} - {Math.min(offset + limit, total)} of {total}
              </div>
              
              <Button
                variant="outline"
                disabled={!hasNextPage}
                onClick={() => setOffset(offset + limit)}
              >
                Next
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}