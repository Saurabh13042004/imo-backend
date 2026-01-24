import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';
import ChevronLeft from 'lucide-react/dist/esm/icons/chevron-left';
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right';
import ShoppingBag from 'lucide-react/dist/esm/icons/shopping-bag';
import Loader2 from 'lucide-react/dist/esm/icons/loader-2';
import { motion } from "framer-motion";
import useEmblaCarousel from 'embla-carousel-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useParallax } from "@/hooks/useParallax";
import { useSearchUrl } from "@/hooks/useSearchUrl";
import { useAIVerdict } from "@/hooks/useAIVerdict";
import { useCommunityReviews } from "@/hooks/useCommunityReviews";
import { useStoreReviews } from "@/hooks/useStoreReviews";
import { useGoogleReviews } from "@/hooks/useGoogleReviews";
import { useDemoProduct } from "@/hooks/useDemoProduct";
import { formatPriceWithCurrency } from "@/utils/currencyUtils";
import { API_BASE_URL } from "@/config/api";
import { extractIdFromSlug } from "@/utils/slugUtils";
// import { useProductBasic, useProductReviews, useProductVideos } from "@/hooks/useProductDetails";

import { ProductLikeButton } from "@/components/product/ProductLikeButton";
import { ProductImages } from "@/components/product/ProductImages";
import { ProductInfo } from "@/components/product/ProductInfo";
import { ProductInfoSkeleton } from "@/components/product/ProductInfoSkeleton";
import { ProductProsAndCons } from "@/components/product/ProductProsAndCons";
import { ProductReviews } from "@/components/product/ProductReviews";
import { ShortVideoReviews } from "@/components/product/ShortVideoReviews";
import { PriceAlertModal } from "@/components/product/PriceAlertModal";
import { IMOAIChat } from "@/components/product/IMOAIChat";
// import { ProductReviewsSkeleton } from "@/components/product/ProductReviewsSkeleton";
import { VideoReviews } from "@/components/product/VideoReviews";

// import { YouTubeVideosSkeleton } from "@/components/product/YouTubeVideosSkeleton";
import { SearchAccessGate } from "@/components/product/SearchAccessGate";
import { Product } from "@/types/search";
import { useSearchAccess } from "@/hooks/useSearchAccess";
// import { useProductPriceComparison } from "@/hooks/useProductPriceComparison";

const ProductDetails = () => {
  useParallax();
  const { slug } = useParams<{ slug: string }>();
  // Extract product ID from slug
  const productId = slug ? extractIdFromSlug(slug) : undefined;
  const { zipcode, country } = useSearchUrl();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrichedData, setEnrichedData] = useState<any>(null);
  const [enrichmentLoading, setEnrichmentLoading] = useState(false);
  const [enableAnimations, setEnableAnimations] = useState(false);
  const [refreshReviews, setRefreshReviews] = useState(0);
  const [isPriceAlertModalOpen, setIsPriceAlertModalOpen] = useState(false);
  const [finalAIVerdict, setFinalAIVerdict] = useState<any>(null);
  const { trackProductView } = useAnalytics();
  const { isAuthenticated, user } = useAuth();

  // Check if this is a demo product
  const { isDemoProduct, demoProduct } = useDemoProduct(productId);

  // Use AI Verdict hook ONLY for non-demo products
  // Demo products already have hardcoded verdicts
  const { verdict: aiVerdict, status: verdictStatus } = useAIVerdict(
    isDemoProduct ? undefined : productId,
    enrichedData
  );

  // Use demo product's AI verdict immediately, otherwise wait for API verdict
  useEffect(() => {
    if (isDemoProduct && demoProduct?.aiVerdict) {
      setFinalAIVerdict({
        ...demoProduct.aiVerdict,
        imo_score: demoProduct.aiVerdict.verdict_score
      });
    } else if (aiVerdict) {
      setFinalAIVerdict(aiVerdict);
    }
  }, [isDemoProduct, demoProduct, aiVerdict]);

  // Defer animations until after first paint
  useEffect(() => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => setEnableAnimations(true));
    } else {
      setTimeout(() => setEnableAnimations(true), 0);
    }
  }, []);

  // Memoize store URLs - wait for enrichedData
  const storeUrls = enrichedData?.immersive_data?.product_results?.stores
    ?.filter((s: any) => s.link)
    ?.map((s: any) => s.link) || [];

  // Use Community Reviews hook - start ONLY after enrichedData arrives
  const communityReviews = useCommunityReviews(
    enrichedData ? (product?.title || '') : null,
    product?.brand
  );

  // Use Store Reviews hook - start ONLY after enrichedData arrives with store URLs
  const storeReviews = useStoreReviews(
    enrichedData && storeUrls.length > 0 ? (product?.title || '') : null,
    storeUrls.length > 0 ? storeUrls : undefined
  );

  // Use Google Reviews hook - start ONLY after enrichedData and product data arrives
  const googleReviews = useGoogleReviews(
    enrichedData && product?.title ? product.title : null,
    enrichedData && product?.product_url ? product.product_url : null
  );

  // Show notification when community reviews arrive
  useEffect(() => {
    if (communityReviews.reviews && communityReviews.reviews.length > 0 && communityReviews.status === 'ready') {
      console.log('[ProductDetails] Showing community reviews toast:', communityReviews.reviews.length);
      toast.success(
        `IMO AI Just added ${communityReviews.reviews.length} community reviews! Happy Shopping!`,
        {
          position: "bottom-left",
          duration: 3000,
        }
      );
    }
  }, [communityReviews.reviews?.length, communityReviews.status]);

  // Show notification when store reviews arrive
  useEffect(() => {
    if (storeReviews.reviews && storeReviews.reviews.length > 0 && storeReviews.status === 'ready') {
      console.log('[ProductDetails] Showing store reviews toast:', storeReviews.reviews.length);
      toast.success(
        `IMO AI Just added ${storeReviews.reviews.length} store reviews! Happy Shopping!`,
        {
          position: "bottom-left",
          duration: 3000,
        }
      );
    }
  }, [storeReviews.reviews?.length, storeReviews.status]);

  // Validate productId early
  const isValidProductId = productId && 
    typeof productId === 'string' && 
    productId !== 'undefined' && 
    productId !== 'null' &&
    productId.length > 0;

  // Load demo product if available
  useEffect(() => {
    if (isDemoProduct && demoProduct) {
      console.log('[ProductDetails] Loading demo product:', demoProduct.title);
      setProduct(demoProduct);
      setEnrichedData(demoProduct.enrichedData);
      setLoading(false);
    }
  }, [isDemoProduct, demoProduct]);

  // Load product from localStorage (only for non-demo products)
  useEffect(() => {
    if (!isValidProductId || isDemoProduct) {
      if (!isDemoProduct) {
        setLoading(false);
      }
      return;
    }

    try {
      setLoading(true);
      
      // Try currentProduct first
      let foundProduct = null;
      const currentProductStr = localStorage.getItem("currentProduct");
      
      if (currentProductStr) {
        const parsedProduct = JSON.parse(currentProductStr);
        if (parsedProduct.id === productId) {
          foundProduct = parsedProduct;
        }
      }
      
      // If not found, search in lastSearchResults
      if (!foundProduct) {
        const searchResults = localStorage.getItem("lastSearchResults");
        if (searchResults) {
          const results = JSON.parse(searchResults);
          foundProduct = results.find((p: any) => p.id === productId);
        }
      }
      
      if (foundProduct) {
        setProduct(foundProduct);
        // Track product view
        if (trackProductView && productId) {
          trackProductView(productId, foundProduct.query);
        }
      }
    } catch (error) {
      console.error("Error loading product from localStorage:", error);
      toast.error("Could not load product data");
    } finally {
      setLoading(false);
    }
  }, [isValidProductId, productId, trackProductView, isDemoProduct]);

  // Fetch enriched data for all products (product-agnostic)
  // Skip for demo products since they already have enriched data
  useEffect(() => {
    if (!product || !productId || isDemoProduct) return;
    
    const fetchEnrichedData = async () => {
      try {
        setEnrichmentLoading(true);
        console.log(`Fetching enriched product data for: ${productId}`);
        
        // For all products - fetch from enriched endpoint
        const immersiveApiLink = (product as any).immersive_product_api_link;
        
        if (!immersiveApiLink) {
          console.log("No immersive_product_api_link found, using base product data");
          setEnrichmentLoading(false);
          return;
        }

        const response = await fetch(
          `${API_BASE_URL}/api/v1/product/enriched/${productId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              immersive_api_link: immersiveApiLink
            })
          }
        );

        if (!response.ok) {
          console.warn(`Failed to fetch enriched data: ${response.status}`);
          return;
        }

        const data = await response.json();
        console.log("Enriched product data received:", data);
        
        if (data) {
          setEnrichedData(data);
          console.log("Enriched data loaded successfully");
        }
      } catch (error) {
        console.error("Error fetching enriched product data:", error);
      } finally {
        setEnrichmentLoading(false);
      }
    };

    fetchEnrichedData();
  }, [product, productId, isDemoProduct]);

  // Handle invalid product ID
  if (!isValidProductId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-medium mb-2">Invalid Product ID</h3>
          <p className="text-muted-foreground mb-4">
            The product link appears to be broken or invalid.
          </p>
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

  return (
    <div className="min-h-screen bg-background">

      {!product && !loading ? (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-medium mb-2">Product not found</h3>
            <p className="text-muted-foreground mb-4">
              The product you're looking for doesn't exist.
            </p>
            <Button asChild>
              <Link to="/search">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Search
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="relative overflow-clip">
          <div className="absolute inset-0 bg-gradient-background opacity-35 parallax-background"></div>
          
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-primary rounded-full mix-blend-multiply filter blur-3xl opacity-[0.35] dark:opacity-[0.15] dark:mix-blend-normal parallax-slow"></div>
          <div className="absolute top-1/3 -right-32 w-80 h-80 bg-gradient-secondary rounded-full mix-blend-multiply filter blur-3xl opacity-[0.4] dark:opacity-[0.18] dark:mix-blend-normal parallax-medium"></div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={enableAnimations ? { y: 0, opacity: 1 } : { y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              {/* Product Header */}
              {loading ? (
                <ProductInfoSkeleton />
              ) : product ? (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-6">
                      <ProductImages 
                        title={product.title}
                        imageUrl={product.image_url}
                        imageUrls={
                          enrichedData?.immersive_data?.product_results?.thumbnails?.length > 0
                            ? enrichedData.immersive_data.product_results.thumbnails
                            : (product as any).image_urls
                        }
                      />
                    </div>

                    <div className="space-y-4">
                      <ProductInfo 
                        title={product.title}
                        price={product.price}
                        imoScore={product.imo_score}
                        aiVerdictScore={finalAIVerdict?.imo_score}
                        verdictStatus={isDemoProduct ? "ready" : verdictStatus}
                        description={enrichedData?.bullet_points ? enrichedData.bullet_points.split('\n')[0] : (enrichedData?.description || product.description)}
                        productUrl={product.product_url}
                        source={product.source as any}
                        priceRange={enrichedData?.immersive_data?.product_results?.price_range}
                        enrichedProductDescription={enrichedData?.immersive_data?.product_results?.about_the_product?.description}
                      />
                      <div className="flex justify-start gap-3">
                        <ProductLikeButton 
                          productId={product.id}
                          productData={{
                            title: product.title,
                            image_url: product.image_url || product.image_urls?.[0],
                            price: product.price,
                            currency: product.currency,
                            brand: product.brand,
                            description: product.description,
                            source: product.source,
                            source_id: product.source_id,
                            url: product.url,
                            category: product.category,
                          }}
                        />
                        <button
                          onClick={() => setIsPriceAlertModalOpen(true)}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                          title="Get notified when the price drops"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10.5 1.5H9.5V.5h1v1zm-8 1a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-11a1 1 0 0 0-1-1h-16zm0-1.5h16a2.5 2.5 0 0 1 2.5 2.5v11a2.5 2.5 0 0 1-2.5 2.5h-1.5v2h-1v-2h-11v2h-1v-2h-1.5a2.5 2.5 0 0 1-2.5-2.5v-11a2.5 2.5 0 0 1 2.5-2.5z" />
                          </svg>
                          Price Alert
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Reviews and Videos Sections - Ready for API integration */}
                </>
              ) : null}

              {product && (
                <div className="space-y-8 border-t border-border/50 pt-8">
                  {/* AI Verdict Section (for ALL products) */}
                  {finalAIVerdict && (isDemoProduct || verdictStatus === "ready") && (
                    <>
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={enableAnimations ? { y: 0, opacity: 1 } : { y: 0, opacity: 1 }}
                        transition={{ duration: 0.4 }}
                        className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg border border-primary/20 p-6 space-y-4"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h2 className="text-2xl font-bold text-foreground mb-2">
                              IMO AI Verdict
                            </h2>
                            <p className="text-muted-foreground">
                              {finalAIVerdict.summary}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-4xl font-bold text-primary">
                              {finalAIVerdict.imo_score?.toFixed(1) || "N/A"}
                            </div>
                            <p className="text-xs text-muted-foreground">out of 10</p>
                          </div>
                        </div>

                        {(finalAIVerdict.who_should_buy || finalAIVerdict.who_should_avoid) && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border/30">
                            <div>
                              <p className="text-sm font-semibold text-green-600 dark:text-green-400 mb-1">✓ Who should buy</p>
                              <p className="text-sm text-muted-foreground">
                                {Array.isArray(finalAIVerdict.who_should_buy) 
                                  ? finalAIVerdict.who_should_buy.join(', ')
                                  : finalAIVerdict.who_should_buy}
                              </p>
                            </div>
                            {finalAIVerdict.who_should_avoid && (
                              <div>
                                <p className="text-sm font-semibold text-orange-600 dark:text-orange-400 mb-1">✗ Who should avoid</p>
                                <p className="text-sm text-muted-foreground">
                                  {Array.isArray(finalAIVerdict.who_should_avoid) 
                                    ? finalAIVerdict.who_should_avoid.join(', ')
                                    : finalAIVerdict.who_should_avoid}
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {finalAIVerdict.deal_breakers && finalAIVerdict.deal_breakers.length > 0 && (
                          <div className="pt-4 border-t border-border/30">
                            <p className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">⚠ Deal Breakers</p>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {finalAIVerdict.deal_breakers.map((issue: string, idx: number) => (
                                <li key={idx}>• {issue}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </motion.div>

                      {/* AI Verdict Pros and Cons */}
                      {(finalAIVerdict.pros?.length > 0 || finalAIVerdict.cons?.length > 0) && (
                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.4, delay: 0.1 }}
                        >
                          <ProductProsAndCons 
                            pros={finalAIVerdict.pros}
                            cons={finalAIVerdict.cons}
                          />
                        </motion.div>
                      )}
                    </>
                  )}

                  {/* AI Verdict Processing State */}
                  {verdictStatus === "processing" && !aiVerdict && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={enableAnimations ? { opacity: 1 } : { opacity: 1 }}
                      className="flex items-center justify-center py-12 gap-3 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg border border-border/30 p-6"
                    >
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground">AI is analyzing this product...</p>
                    </motion.div>
                  )}
                  
                  {/* Detailed Product Information - For Products with Enriched Data */}
                  {enrichedData && !enrichmentLoading && (
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={enableAnimations ? { y: 0, opacity: 1 } : { y: 0, opacity: 1 }}
                      transition={{ duration: 0.4 }}
                      className="space-y-6"
                    >
                      {/* <div className="border-b border-border/50 pb-4">
                        <h2 className="text-2xl font-bold text-foreground">
                          Product Details
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                          Complete specifications from Amazon
                        </p>
                      </div> */}

                      {/* Price Comparison - Amazon buybox */}
                      {enrichedData.buybox && enrichedData.buybox.filter((offer: any) => offer.price && offer.price > 0).length > 0 && (
                        <div className="bg-card rounded-lg border border-border/50 p-6 space-y-4">
                          <h3 className="font-semibold text-lg">Where to Buy</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {enrichedData.buybox.filter((offer: any) => offer.price && offer.price > 0).map((offer: any, idx: number) => (
                              <div
                                key={idx}
                                className="p-4 bg-background rounded-lg border border-border/30"
                              >
                                <p className="font-medium text-sm mb-2">Amazon.com</p>
                                <p className="text-lg font-bold text-primary">{formatPriceWithCurrency(offer.price, country)}</p>
                                <p className="text-xs text-muted-foreground mt-2">{offer.stock}</p>
                                {offer.delivery_details && (
                                  <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                                    {offer.delivery_details.slice(0, 2).map((delivery: any, i: number) => (
                                      <li key={i}>• {delivery.type}</li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* External Stores from SerpAPI */}
                      {enrichedData.external_stores && enrichedData.external_stores.filter((store: any) => store.extracted_price > 0 || store.price > 0).length > 0 && (
                        <div className="bg-card rounded-lg border border-border/50 p-6 space-y-4">
                          <h3 className="font-semibold text-lg">Other Retailers</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {enrichedData.external_stores.filter((store: any) => store.extracted_price > 0 || store.price > 0).slice(0, 4).map((store: any, idx: number) => (
                              <a
                                key={idx}
                                href={store.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-4 bg-background rounded-lg border border-border/30 hover:border-primary/50 transition-colors"
                              >
                                <p className="font-medium text-sm mb-2">{store.name}</p>
                                <p className="text-lg font-bold text-primary">{formatPriceWithCurrency(store.extracted_price || store.price, country)}</p>
                                {store.details_and_offers && (
                                  <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                                    {store.details_and_offers.slice(0, 2).map((offer: string, i: number) => (
                                      <li key={i}>• {offer}</li>
                                    ))}
                                  </ul>
                                )}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Product Description/Features */}
                      {enrichedData.bullet_points && (
                        <div className="bg-card rounded-lg border border-border/50 p-6 space-y-4">
                          <h3 className="font-semibold text-lg">About This Product</h3>
                          <ul className="text-sm text-muted-foreground leading-relaxed space-y-2">
                            {(typeof enrichedData.bullet_points === 'string' 
                              ? enrichedData.bullet_points.split('\n') 
                              : enrichedData.bullet_points
                            ).filter((p: string) => p?.trim()).map((point: string, idx: number) => (
                              <li key={idx} className="flex gap-2">
                                <span className="text-primary">•</span>
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Rating Distribution */}
                      {enrichedData.rating_distribution && enrichedData.rating_distribution.length > 0 && (
                        <div className="bg-card rounded-lg border border-border/50 p-6 space-y-4">
                          <h3 className="font-semibold text-lg">Rating Distribution</h3>
                          <div className="space-y-3">
                            {enrichedData.rating_distribution.map((rating: any) => (
                              <div key={rating.rating} className="flex items-center gap-3">
                                <span className="text-sm font-medium w-12">{rating.rating} ★</span>
                                <div className="flex-1 bg-background rounded-full h-2">
                                  <div 
                                    className="bg-primary rounded-full h-2"
                                    style={{ width: `${rating.percentage}%` }}
                                  />
                                </div>
                                <span className="text-xs text-muted-foreground w-8">{rating.percentage}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                  {/* Enriched Product Data Section - for non-Amazon products */}
                  {enrichedData?.immersive_data && !enrichmentLoading && (
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.4 }}
                      className="space-y-6"
                    >
                      <div className="border-b border-border/50 pb-4">
                        <h2 className="text-2xl font-bold text-foreground">
                          Detailed Product Information
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                          Aggregated from multiple retailers
                        </p>
                      </div>

                      {/* Price Comparison - SerpAPI stores */}
                      {enrichedData.immersive_data.product_results?.stores && enrichedData.immersive_data.product_results.stores.filter((store: any) => store.extracted_price > 0 || store.price > 0).length > 0 && (
                        <div className="bg-card rounded-lg border border-border/50 p-6 space-y-4" id="whereToBuy">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-lg">Where to Buy</h3>
                            <div className="text-xs px-2.5 py-1.5 bg-primary/10 text-primary rounded-full">
                              {!isAuthenticated && "10 stores visible"}
                              {isAuthenticated && !user?.is_premium && "25 stores visible"}
                              {isAuthenticated && user?.is_premium && "100+ stores"}
                            </div>
                          </div>
                          
                          {/* Store Limit Messages */}
                          {!isAuthenticated && (
                            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3">
                              <div className="text-blue-600 dark:text-blue-400 mt-0.5">💡</div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">See 25 stores instead of 10</p>
                                <p className="text-xs text-blue-800 dark:text-blue-300 mb-3">Sign up to get access to 25+ retailers and find the best deals</p>
                                <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                                  <Link to="/auth/signup">Create Account</Link>
                                </Button>
                              </div>
                            </div>
                          )}
                          
                          {isAuthenticated && !user?.is_premium && (
                            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex items-start gap-3">
                              <div className="text-amber-600 dark:text-amber-400 mt-0.5">✨</div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-amber-900 dark:text-amber-200 mb-2">Get 100+ stores with Premium</p>
                                <p className="text-xs text-amber-800 dark:text-amber-300 mb-3">Unlock unlimited store listings and find deals from 100+ retailers worldwide</p>
                                <Button asChild size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
                                  <Link to="/subscribe">Upgrade to Premium</Link>
                                </Button>
                              </div>
                            </div>
                          )}
                          
                          {/* SerpAPI stores - Carousel with 2x2 grid */}
                          <StoreCarousel 
                            stores={enrichedData.immersive_data.product_results.stores.filter((store: any) => store.extracted_price > 0 || store.price > 0)}
                            country={country}
                            enableAnimations={enableAnimations}
                          />
                        </div>
                      )}

                      {/* Product Description/Features */}
                      {enrichedData.immersive_data?.product_results?.about_the_product?.description && (
                        <div className="bg-card rounded-lg border border-border/50 p-6 space-y-4">
                          <h3 className="font-semibold text-lg">About This Product</h3>
                          
                          {/* SerpAPI description */}
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {enrichedData.immersive_data.product_results.about_the_product.description.substring(0, 500)}
                            {enrichedData.immersive_data.product_results.about_the_product.description.length > 500 && "..."}
                          </p>
                        </div>
                      )}

                      {/* Product Features */}
                      {enrichedData.immersive_data.product_results?.about_the_product?.features && enrichedData.immersive_data.product_results.about_the_product.features.length > 0 && (
                        <div className="bg-card rounded-lg border border-border/50 p-6 space-y-4">
                          <h3 className="font-semibold text-lg">Key Specifications</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {enrichedData.immersive_data.product_results.about_the_product.features.slice(0, 8).map((feature: any, idx: number) => (
                              <div key={idx} className="py-2 border-b border-border/30 last:border-0">
                                <p className="text-xs font-medium text-muted-foreground">{feature.title}</p>
                                <p className="text-sm font-semibold text-foreground mt-1">{feature.value}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Rating Distribution */}
                      {enrichedData.immersive_data.product_results?.ratings && enrichedData.immersive_data.product_results.ratings.length > 0 && (
                        <div className="bg-card rounded-lg border border-border/50 p-6 space-y-4">
                          <h3 className="font-semibold text-lg">Rating Distribution</h3>
                          <div className="space-y-3">
                            {/* SerpAPI ratings */}
                            {enrichedData.immersive_data.product_results.ratings.map((rating: any) => (
                              <div key={rating.stars} className="flex items-center gap-3">
                                <span className="text-sm font-medium w-12">{rating.stars} ★</span>
                                <div className="flex-1 bg-background rounded-full h-2">
                                  <div 
                                    className="bg-primary rounded-full h-2"
                                    style={{ 
                                      width: enrichedData.immersive_data.product_results.ratings.length > 0 
                                        ? `${(rating.amount / Math.max(...enrichedData.immersive_data.product_results.ratings.map((r: any) => r.amount))) * 100}%`
                                        : '0%'
                                    }}
                                  />
                                </div>
                                <span className="text-xs text-muted-foreground w-8">{rating.amount}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Enrichment Loading State */}
                  {enrichmentLoading && !enrichedData && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={enableAnimations ? { opacity: 1 } : { opacity: 1 }}
                      className="flex items-center justify-center py-12 gap-3"
                    >
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground">Loading detailed product information...</p>
                    </motion.div>
                  )}

                  {/* YouTube Videos Section */}
                  {enrichedData?.immersive_data?.product_results?.videos && (
                    <VideoReviews
                      productId={productId || ""} 
                      videos={(enrichedData.immersive_data.product_results.videos as any[]).map((video: any) => ({
                        id: video.link || `${video.title}-${Math.random()}`,
                        title: video.title || '',
                        description: video.description || '',
                        video_url: video.link || '',
                        thumbnail_url: video.thumbnail || '',
                        views: 0,
                        likes: 0,
                        platform: 'YouTube'
                      }))}
                    />
                  )}

                  {/* Short Video Reviews (YouTube Shorts / TikTok / Instagram Reels) */}
                  {productId && enrichedData && (
                    <ShortVideoReviews 
                      productId={productId} 
                      productTitle={enrichedData.immersive_data.product_results.title}
                    />
                  )}

                  {/* User Reviews Section - Combined All Sources */}
                  <ProductReviews 
                    productId={productId || ""}
                    productTitle={product?.title || "Product"}
                    productSource={product?.source || "google_shopping"}
                    reviews={[
                      // 1. ENRICHMENT DATA (Amazon + External + User reviews from SerpAPI)
                      // 1a. Amazon reviews from unified response (canonical source)
                      ...(enrichedData?.amazon_reviews?.map((review: any) => ({
                        id: review.id,
                        external_review_id: review.id,
                        reviewer_name: review.author,
                        rating: review.rating,
                        title: review.title,
                        review_text: review.content,
                        verified_purchase: review.is_verified,
                        review_date: review.timestamp,
                        positive_feedback: review.helpful_count || 0,
                        negative_feedback: 0,
                        source: "Amazon"
                      })) || []),
                      // 1b. External reviews from enrichment layer (SerpAPI intelligent endpoint)
                      ...(enrichedData?.external_reviews?.map((review: any) => ({
                        id: `${review.source}-${review.author}-${review.title}`,
                        external_review_id: `${review.source}-${review.author}`,
                        reviewer_name: review.author,
                        rating: review.rating || 0,
                        title: review.title,
                        review_text: review.content,
                        verified_purchase: false,
                        review_date: new Date().toISOString(),
                        positive_feedback: 0,
                        negative_feedback: 0,
                        source: review.source
                      })) || []),
                      // 1c. User reviews from immersive product endpoint (non-Amazon products)
                      ...(enrichedData?.immersive_data?.product_results?.user_reviews?.map((review: any) => ({
                        id: `${review.source}-${review.user_name}-${review.title}`,
                        external_review_id: `${review.source}-${review.user_name}`,
                        reviewer_name: review.user_name || "Anonymous",
                        rating: review.rating || 0,
                        title: review.title,
                        review_text: review.text,
                        verified_purchase: false,
                        review_date: review.date || new Date().toISOString(),
                        positive_feedback: 0,
                        negative_feedback: 0,
                        source: review.source || "SerpAPI"
                      })) || []),
                      // 2. STORE REVIEWS (Celery async task)
                      ...(storeReviews.reviews?.map((review: any) => ({
                        id: `store-${review.store}-${review.text?.substring(0, 20)}`,
                        external_review_id: `store-${review.store}`,
                        reviewer_name: review.reviewer_name || review.author || "Store Reviewer",
                        rating: review.rating || 0,
                        title: review.title || `Review from ${review.store}`,
                        review_text: review.text,
                        verified_purchase: review.verified_purchase || false,
                        review_date: review.date || new Date().toISOString(),
                        positive_feedback: 0,
                        negative_feedback: 0,
                        source: review.store || "Store"
                      })) || []),
                      // 3. GOOGLE SHOPPING REVIEWS (Celery async task)
                      ...(googleReviews?.reviews?.map((review: any) => ({
                        id: `google-${review.reviewer_name}-${review.title}`,
                        external_review_id: `google-${review.reviewer_name}`,
                        reviewer_name: review.reviewer_name,
                        rating: review.rating,
                        title: review.title || "Google Shopping Review",
                        review_text: review.text,
                        verified_purchase: false,
                        review_date: review.date || new Date().toISOString(),
                        positive_feedback: 0,
                        negative_feedback: 0,
                        source: review.source || "Google Shopping"
                      })) || []),
                      // 4. COMMUNITY REVIEWS (Reddit + Forums - Celery async task)
                      ...(communityReviews.reviews?.map((review: any) => ({
                        id: `community-${review.source}-${review.text?.substring(0, 20)}`,
                        external_review_id: `community-${review.source}`,
                        reviewer_name: review.reviewer_name || "Community Member",
                        rating: review.rating || 0,
                        title: `${review.source} Discussion`,
                        review_text: review.text,
                        verified_purchase: false,
                        review_date: review.date || new Date().toISOString(),
                        positive_feedback: 0,
                        negative_feedback: 0,
                        source: review.source
                      })) || [])
                    ]}
                    reviewsSummary={googleReviews?.summary || undefined}
                    refreshReviews={refreshReviews}
                    onRefreshReviews={() => setRefreshReviews(prev => prev + 1)}
                    isLoadingReviews={enrichmentLoading}
                  />
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}

      {/* Price Alert Modal */}
      {product && (
        <PriceAlertModal
          isOpen={isPriceAlertModalOpen}
          onClose={() => setIsPriceAlertModalOpen(false)}
          product={{
            id: product.id,
            title: product.title,
            product_url: product.product_url,
            price: product.price,
          }}
          country={country}
        />
      )}

      {/* IMO AI Chat Assistant */}
      {product && (
        <IMOAIChat 
          productTitle={product?.title || "Product"}
          productDescription={enrichedData?.description || product?.description || ""}
          productPrice={product?.price}
          productRating={product?.rating}
          productReviewsCount={product?.reviews_count}
          aiVerdict={aiVerdict || undefined}
        />
      )}
    </div>
  );
};

// Store Carousel Component - Shows 2x2 grid with navigation
interface StoreCarouselProps {
  stores: any[];
  country: string;
  enableAnimations: boolean;
}

// Helper function to add affiliate parameters to Amazon links
const getAmazonAffiliateLink = (link: string): string => {
  console.log("🔗 Original Amazon Link:", link);
  const amazonAffiliateParams = {
    linkCode: "ll2",
    tag: "imoapp01-20",
    linkId: "708c207bd38dd36f41c4f0b78338782e",
    language: "en_US",
    ref_: "as_li_ss_tl"
  };

  try {
    const url = new URL(link);
    // Add affiliate parameters
    url.searchParams.set("linkCode", amazonAffiliateParams.linkCode);
    url.searchParams.set("tag", amazonAffiliateParams.tag);
    url.searchParams.set("linkId", amazonAffiliateParams.linkId);
    url.searchParams.set("language", amazonAffiliateParams.language);
    url.searchParams.set("ref_", amazonAffiliateParams.ref_);
    const finalUrl = url.toString();
    console.log("✅ Affiliate Link Generated:", finalUrl);
    return finalUrl;
  } catch (error) {
    // If URL parsing fails, return original link
    console.error("❌ Error parsing Amazon link:", error);
    return link;
  }
};

const StoreCarousel = ({ stores, country, enableAnimations }: StoreCarouselProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    align: 'start',
    slidesToScroll: 1,
    containScroll: 'trimSnaps'
  });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  const handleScrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const handleScrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // Sort stores: "Best price" first, then others
  const sortedStores = [...stores].sort((a, b) => {
    const aIsBestPrice = a.tag?.toLowerCase().includes('price');
    const bIsBestPrice = b.tag?.toLowerCase().includes('price');
    if (aIsBestPrice && !bIsBestPrice) return -1;
    if (!aIsBestPrice && bIsBestPrice) return 1;
    return 0;
  });

  return (
    <div className="space-y-4">
      {/* Carousel Container - 2x1 Grid (1 row, 2 cards) */}
      <div className="relative">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {sortedStores.map((store, idx) => (
              <div 
                key={idx} 
                className="flex-[0_0_50%] h-[300px] p-2"
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={enableAnimations ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="border border-border rounded-lg p-4 hover:border-primary/50 hover:bg-primary/5 transition-all h-full flex flex-col"
                >
                  {/* Store Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      {store.logo && (
                        <img
                          src={store.logo}
                          alt={store.name}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <h4 className="font-semibold text-foreground text-sm">{store.name}</h4>
                        {store.rating && (
                          <p className="text-xs text-muted-foreground">
                            ⭐ {store.rating} ({store.reviews} reviews)
                          </p>
                        )}
                      </div>
                    </div>

                    {store.tag && (
                      <Badge 
                        variant={store.tag.toLowerCase().includes("price") ? "destructive" : "default"}
                        className="whitespace-nowrap text-xs"
                      >
                        {store.tag}
                      </Badge>
                    )}
                  </div>

                  {/* Price Info */}
                  <div className="mb-3 space-y-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold text-primary">
                        {store.price || formatPriceWithCurrency(store.extracted_price, country)}
                      </span>
                      {store.original_price && (
                        <span className="text-xs text-muted-foreground line-through">
                          {store.original_price || formatPriceWithCurrency(store.extracted_original_price, country)}
                        </span>
                      )}
                    </div>
                    {store.shipping && (
                      <p className="text-xs">
                        {store.shipping === "Free" ? (
                          <span className="text-green-600 dark:text-green-400 font-semibold">✓ {store.shipping} Shipping</span>
                        ) : (
                          <span className="text-muted-foreground">Shipping: {store.shipping}</span>
                        )}
                      </p>
                    )}
                  </div>

                  {/* Details and Offers - Show ALL benefits */}
                  {store.details_and_offers && store.details_and_offers.length > 0 && (
                    <div className="mb-4 space-y-1 flex-1 overflow-y-auto max-h-[120px]">
                      {store.details_and_offers.map((detail: string, i: number) => (
                        <p key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                          <span className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5">✓</span>
                          <span>{detail}</span>
                        </p>
                      ))}
                    </div>
                  )}

                  {/* View Button */}
                  <Button
                    asChild
                    size="sm"
                    className="w-full rounded-lg bg-primary hover:bg-primary/90 text-xs h-8 mt-auto"
                  >
                    <a
                      href={(store.name?.toLowerCase().includes('amazon') ? (console.log("🛒 Amazon Store Found:", store.name, "Link:", store.link), getAmazonAffiliateLink(store.link)) : (console.log("🛍️ Non-Amazon Store:", store.name), store.link))}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View on {store.name}
                    </a>
                  </Button>
                </motion.div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        {sortedStores.length > 2 && (
          <>
            <button
              onClick={handleScrollPrev}
              disabled={!canScrollPrev}
              className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 bg-white dark:bg-slate-900 border border-border rounded-full p-2 hover:bg-primary hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg"
              aria-label="Previous stores"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={handleScrollNext}
              disabled={!canScrollNext}
              className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 bg-white dark:bg-slate-900 border border-border rounded-full p-2 hover:bg-primary hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg"
              aria-label="Next stores"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* Store Count Info */}
      <div className="text-center text-xs text-muted-foreground">
        Showing {Math.min(2, sortedStores.length)} of {sortedStores.length} available stores
        {sortedStores.length > 2 && " • Use arrows to see more"}
      </div>
    </div>
  );
};

export default ProductDetails;