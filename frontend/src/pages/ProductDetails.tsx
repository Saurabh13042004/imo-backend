import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useParallax } from "@/hooks/useParallax";
import type { Product } from "@/types/search";

const MOCK_PRODUCT = {
  id: "1",
  title: "Sample Product",
  description: "This is a sample product for demonstration",
  price: 49.99,
  image_url: "https://via.placeholder.com/500",
  product_url: "#",
  source: "Amazon" as const,
  source_id: null,
  imo_score: 8.5,
  pros: ["Good quality", "Fast delivery", "Great price"],
  cons: ["Limited colors"],
  created_at: new Date().toISOString(),
  site_rating: 4.5,
  reviews_count: 150,
} satisfies Product;

const ProductDetails = () => {
  useParallax();
  const { productId } = useParams<{ productId: string }>();

  if (!productId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-medium mb-2">Invalid Product ID</h3>
          <p className="text-muted-foreground mb-4">The product link appears to be broken.</p>
          <Button asChild>
            <Link to="/search">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Search
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const product = MOCK_PRODUCT;

  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-clip">
        <div className="absolute inset-0 bg-gradient-background opacity-35"></div>
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-primary rounded-full mix-blend-multiply filter blur-3xl opacity-[0.35]"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <img
                  src={product.image_url}
                  alt={product.title}
                  className="w-full h-auto rounded-lg"
                />
              </div>

              <div className="space-y-4">
                <h1 className="text-3xl font-bold">{product.title}</h1>
                <p className="text-xl font-semibold text-primary">${product.price}</p>
                <div className="flex items-center space-x-2">
                  <span className="text-yellow-500">★</span>
                  <span className="font-semibold">{product.site_rating}/5</span>
                  <span className="text-muted-foreground">({product.reviews_count} reviews)</span>
                </div>
                <p className="text-muted-foreground">{product.description}</p>
                <Button size="lg" asChild>
                  <a href={product.product_url} target="_blank" rel="noopener noreferrer">
                    View on {product.source}
                  </a>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mt-12">
              <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
                <h3 className="font-semibold mb-4 text-green-900 dark:text-green-100">Pros</h3>
                <ul className="space-y-2">
                  {product.pros.map((pro, i) => (
                    <li key={i} className="text-sm flex items-start">
                      <span className="text-green-600 mr-2">✓</span>
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg">
                <h3 className="font-semibold mb-4 text-red-900 dark:text-red-100">Cons</h3>
                <ul className="space-y-2">
                  {product.cons.map((con, i) => (
                    <li key={i} className="text-sm flex items-start">
                      <span className="text-red-600 mr-2">✗</span>
                      {con}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;