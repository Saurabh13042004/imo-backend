/**
 * Hook to detect and load demo product data
 * This allows featured products to have full product detail pages without API calls
 */

import { useEffect, useState } from 'react';
import { DEMO_PRODUCTS, DemoProductId } from '@/data/demoProducts';

export const useDemoProduct = (productId: string | undefined) => {
  const [isDemoProduct, setIsDemoProduct] = useState(false);
  const [demoProduct, setDemoProduct] = useState<any>(null);

  useEffect(() => {
    if (!productId) {
      setIsDemoProduct(false);
      setDemoProduct(null);
      return;
    }

    // Check if this is a demo product ID
    if (productId in DEMO_PRODUCTS) {
      const product = DEMO_PRODUCTS[productId as DemoProductId];
      setDemoProduct(product);
      setIsDemoProduct(true);
    } else {
      setIsDemoProduct(false);
      setDemoProduct(null);
    }
  }, [productId]);

  return {
    isDemoProduct,
    demoProduct,
    isLoading: false,
    error: null
  };
};
