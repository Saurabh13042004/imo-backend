import { useMemo } from 'react';
import type { Product } from '@/types/search';
import { FilterOptions } from '@/components/search/SearchFilters';

export function useProductFilter(products: Product[], filters: FilterOptions, searchQuery?: string) {
  
  const filteredAndSortedProducts = useMemo(() => {
    if (!products.length) return [];

    // Apply filters
    let filtered = products.filter((product) => {
      // Price range filter
      if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
        return false;
      }

      // IMO Score filter
      if (product.imo_score && product.imo_score < filters.minImoScore) {
        return false;
      }

      // Rating filter - using site_rating if available
      if (product.site_rating && product.site_rating < filters.minRating) {
        return false;
      }

      return true;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'price_low':
          return a.price - b.price;
        
        case 'price_high':
          return b.price - a.price;
        
        case 'imo_score':
          return (b.imo_score || 0) - (a.imo_score || 0);
        
        case 'rating':
          return (b.site_rating || 0) - (a.site_rating || 0);
        
        case 'newest':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return filtered;
  }, [products, filters, isLimitedAccess]);

  return filteredAndSortedProducts;
}