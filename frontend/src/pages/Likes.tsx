import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Heart } from 'lucide-react';

export default function Likes() {
  const [likedProducts] = useState([]);
  const [loading] = useState(false);

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
              {likedProducts.length} {likedProducts.length === 1 ? 'product' : 'products'}
            </Badge>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : likedProducts.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-medium mb-2">No liked products yet</h3>
            <p className="text-muted-foreground">Products you like will appear here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {likedProducts.map((product: any) => (
              <div key={product.id} className="border rounded-lg p-4">
                <p>{product.title}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}