"""Product routes."""

import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
import json
import httpx

from app.schemas import (
    ProductResponse,
    ProductDetailResponse,
    ErrorResponse,
    EnrichedProductRequest,
    AmazonProductAnalysis,
    AmazonReview
)
from app.services import SearchService, ReviewService, VideoService, AIService, ProductService
from app.api.dependencies import get_db
from app.config import Settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1", tags=["products"])

search_service = SearchService()
review_service = ReviewService()
video_service = VideoService()
ai_service = AIService()
product_service = ProductService()


@router.get(
    "/product/{product_id}",
    response_model=ProductResponse,
    responses={404: {"model": ErrorResponse}, 500: {"model": ErrorResponse}}
)
async def get_product_details(
    product_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Get detailed product information by product ID.
    First tries cache, then fetches fresh data if needed.

    - **product_id**: UUID of the product
    """
    try:
        logger.info(f"Fetching product with ID: {product_id}")
        # Get product from cache
        product = await search_service.get_product_by_id(db, str(product_id))

        if product:
            logger.info(f"Found product in cache: {product_id}")
            return product

        logger.warning(f"Product {product_id} not found in cache")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found. Please search for it first."
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching product details: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch product details: {str(e)}"
        )


@router.get(
    "/product/amazon/{asin}",
    response_model=ProductResponse,
    responses={404: {"model": ErrorResponse}, 500: {"model": ErrorResponse}}
)
async def get_amazon_product_details(
    asin: str,
    title: Optional[str] = Query(None),
    image: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Get detailed product information from Amazon by ASIN.
    Fetches fresh data from Amazon API.

    - **asin**: Amazon Standard Identification Number
    - **title**: Optional product title from search results
    - **image**: Optional product image from search results
    """
    try:
        logger.info(f"Fetching Amazon product details for ASIN: {asin}")
        
        product = await product_service.get_amazon_product_details(
            db,
            asin,
            product_title=title,
            product_image=image
        )
        
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Failed to fetch product details from Amazon for ASIN: {asin}"
            )
        
        logger.info(f"Successfully fetched Amazon product: {product.title[:50]}")
        return product

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching Amazon product: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch Amazon product details: {str(e)}"
        )


@router.get(
    "/product/intelligent/{asin}",
    response_model=AmazonProductAnalysis,
    responses={404: {"model": ErrorResponse}, 500: {"model": ErrorResponse}}
)
async def get_intelligent_product_analysis(
    asin: str,
    title: Optional[str] = Query(None),
    image: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Get intelligent product analysis combining three layers:
    
    LAYER 1 - DATA (Amazon = Canonical Truth):
      - Title, images, variants, specs, pricing, rating, reviews
      - Source: Amazon API via Oxylabs RapidAPI
    
    LAYER 2 - ENRICHMENT (SerpAPI Optional, Non-blocking):
      - External reviews from blogs, forums, Reddit
      - Cross-store pricing comparisons
      - Doesn't override Amazon data, only supplements
    
    LAYER 3 - INTELLIGENCE (Gemini Analysis):
      - Synthesizes pros/cons from all sources
      - Generates verdict_score (1-10)
      - Identifies deal-breakers and target customers
      - Never modifies raw data, only analyzes
    
    Returns single unified JSON with all three layers integrated.
    Frontend reads from predictable paths: .amazon_reviews, .external_reviews, .analysis

    - **asin**: Amazon Standard Identification Number
    - **title**: Optional product title from search results
    - **image**: Optional product image from search results
    """
    try:
        import asyncio
        import time
        
        start_time = time.time()
        logger.info(f"[Intelligent] Fetching product analysis for ASIN: {asin}")
        
        # ====== LAYER 1: DATA ======
        # Fetch complete Amazon product data (canonical source)
        layer1_start = time.time()
        amazon_product = await product_service.get_amazon_product_details(
            db,
            asin,
            product_title=title,
            product_image=image
        )
        layer1_time = time.time() - layer1_start
        logger.info(f"[Intelligent] Layer 1 (Amazon fetch) completed in {layer1_time:.2f}s")
        
        # ====== LAYER 1: DATA ======
        # Fetch complete Amazon product data (canonical source)
        amazon_product = await product_service.get_amazon_product_details(
            db,
            asin,
            product_title=title,
            product_image=image
        )
        
        if not amazon_product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product not found on Amazon for ASIN: {asin}"
            )
        
        logger.info(f"[Intelligent] Fetched Amazon product: {amazon_product.title[:50]}")
        
        # Get raw Amazon content for detailed extraction
        raw_amazon_data = product_service._fetch_amazon_product_details(asin)
        amazon_content = {}
        if raw_amazon_data and "results" in raw_amazon_data and raw_amazon_data["results"]:
            amazon_content = raw_amazon_data["results"][0].get("content", {})
        
        # Extract reviews from Amazon (canonical source)
        amazon_reviews = []
        if "reviews" in amazon_content:
            for review in amazon_content.get("reviews", []):
                try:
                    amazon_reviews.append(AmazonReview(
                        id=review.get("id", ""),
                        author=review.get("author", "Anonymous"),
                        rating=int(review.get("rating", 0)),
                        title=review.get("title", ""),
                        content=review.get("content", ""),
                        timestamp=review.get("timestamp", ""),
                        is_verified=review.get("is_verified", False),
                        helpful_count=int(review.get("helpful_count", 0))
                    ))
                except Exception as e:
                    logger.warning(f"Failed to parse Amazon review: {e}")
        
        logger.info(f"[Intelligent] Extracted {len(amazon_reviews)} reviews from Amazon")
        
        # ====== LAYER 2 & 3: ENRICHMENT + INTELLIGENCE (PARALLEL) ======
        # Run SerpAPI enrichment and Gemini analysis in parallel
        # Both are non-blocking and can run concurrently
        
        parallel_start = time.time()
        
        async def fetch_serp_enrichment():
            """Fetch SerpAPI enrichment data"""
            try:
                data = await product_service._fetch_serpapi_enrichment(
                    title or amazon_product.title,
                    asin=asin
                )
                logger.info("[Intelligent] Successfully fetched SerpAPI enrichment")
                return data
            except Exception as e:
                logger.warning(f"[Intelligent] SerpAPI enrichment failed (non-blocking): {e}")
                return None
        
        async def fetch_ai_analysis():
            """Generate AI analysis using Gemini"""
            try:
                analysis = await ai_service.analyze_amazon_product(
                    amazon_data=amazon_content,
                    serp_data=None,  # Will be updated after SerpAPI completes
                    product_title=amazon_product.title
                )
                logger.info(f"[Intelligent] Generated AI analysis for {amazon_product.title[:50]}")
                return analysis
            except Exception as e:
                logger.warning(f"[Intelligent] AI analysis failed (non-blocking): {e}")
                return None
        
        # RUN BOTH IN PARALLEL (key optimization)
        logger.info("[Intelligent] Starting parallel SerpAPI + Gemini fetch")
        serp_data, ai_analysis = await asyncio.gather(
            fetch_serp_enrichment(),
            fetch_ai_analysis(),
            return_exceptions=True
        )
        
        parallel_time = time.time() - parallel_start
        logger.info(f"[Intelligent] Layer 2+3 (Parallel SerpAPI + Gemini) completed in {parallel_time:.2f}s")
        
        # Handle any exceptions from gather
        if isinstance(serp_data, Exception):
            logger.warning(f"[Intelligent] SerpAPI exception: {serp_data}")
            serp_data = None
        if isinstance(ai_analysis, Exception):
            logger.warning(f"[Intelligent] AI analysis exception: {ai_analysis}")
            ai_analysis = None
        
        # ====== EXTRACT ENRICHMENT DATA ======
        # Parse SerpAPI response for reviews and store info
        external_reviews = []
        external_stores = []
        external_rating = None
        external_ratings_distribution = []
        
        if serp_data:
            try:
                if serp_data and "product_results" in serp_data:
                    product_results = serp_data.get("product_results", {})
                    
                    # Extract user reviews from the immersive product response
                    # These are reviews from various sources (eBay, Amazon, Sony.com, etc.)
                    user_reviews = product_results.get("user_reviews", [])
                    for review in user_reviews:
                        try:
                            from app.schemas import ExternalReview
                            external_reviews.append(ExternalReview(
                                source=review.get("source", "SerpAPI"),
                                author=review.get("user_name", "Anonymous"),
                                rating=float(review.get("rating", 0)) if review.get("rating") else None,
                                title=review.get("title", ""),
                                content=review.get("text", review.get("snippet", ""))
                            ))
                        except Exception as e:
                            logger.warning(f"Failed to parse external review: {e}")
                    
                    # Extract cross-store pricing (enrichment)
                    stores = product_results.get("stores", [])
                    external_stores = stores  # Store the full store data as-is
                    logger.info(f"[Intelligent] Extracted {len(stores)} cross-store offers from SerpAPI")
                    
                    # Extract external rating and ratings distribution
                    external_rating = product_results.get("rating")
                    external_ratings_distribution = product_results.get("ratings", [])
                    
                    logger.info(f"[Intelligent] Extracted {len(external_reviews)} external reviews from immersive product")
            except Exception as e:
                logger.warning(f"[Intelligent] Failed to extract SerpAPI enrichment data: {e}")
        
        # ====== BUILD UNIFIED RESPONSE ======
        # Single schema with all three layers integrated
        response = AmazonProductAnalysis(
            # Layer 1: Base data from Amazon
            asin=asin,
            parent_asin=amazon_content.get("parent_asin"),
            title=amazon_product.title,
            brand=amazon_content.get("brand"),
            manufacturer=amazon_content.get("manufacturer"),
            images=amazon_content.get("images", []),
            bullet_points=amazon_content.get("bullet_points", ""),
            description=amazon_content.get("description", ""),
            category=amazon_content.get("category", ""),
            price=float(amazon_content.get("price", 0)),
            price_strikethrough=float(amazon_content.get("price_strikethrough", 0)) if amazon_content.get("price_strikethrough") else None,
            discount_percentage=int(amazon_content.get("discount_percentage", 0)) if amazon_content.get("discount_percentage") else None,
            currency=amazon_content.get("currency", "USD"),
            buybox=amazon_content.get("buybox", []),
            variants=amazon_content.get("variation", []),
            rating=float(amazon_content.get("rating", 0)),
            rating_distribution=amazon_content.get("rating_distribution", []),
            total_reviews=int(amazon_content.get("total_reviews", 0)),
            sales_rank=amazon_content.get("sales_rank"),
            sales_volume=amazon_content.get("sales_volume"),
            
            # Layer 2: Reviews separated by source
            amazon_reviews=amazon_reviews,
            external_reviews=external_reviews,
            
            # Layer 2.5: Enrichment data from SerpAPI
            external_stores=external_stores,
            external_rating=external_rating,
            external_ratings_distribution=external_ratings_distribution,
            
            # Layer 3: Intelligence from Gemini
            analysis=ai_analysis
        )
        
        total_time = time.time() - start_time
        logger.info(f"[Intelligent] Built unified response for {asin} (reviews: {len(amazon_reviews)} Amazon + {len(external_reviews)} external)")
        logger.info(f"[Intelligent] ⚡ TOTAL TIME: {total_time:.2f}s (Layer1: {layer1_time:.2f}s + Parallel: {parallel_time:.2f}s)")
        return response

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[Intelligent] Error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate product analysis: {str(e)}"
        )


@router.post(
    "/product/details",
    response_model=ProductResponse,
    responses={404: {"model": ErrorResponse}, 400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}}
)
async def get_product_details_by_source(
    source: str,
    source_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get product details by source and source_id.

    - **source**: Product source (e.g., "amazon", "walmart")
    - **source_id**: Source-specific product ID
    """
    try:
        product = await search_service.get_product_by_source(db, source, source_id)

        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )

        logger.info(f"Fetched product by source: {source}/{source_id}")
        return product

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching product: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch product"
        )


@router.get(
    "/product/immersive/{product_id}",
    responses={404: {"model": ErrorResponse}, 500: {"model": ErrorResponse}}
)
async def get_immersive_product_details(
    product_id: str,
):
    """
    Get detailed product information using SerpAPI Immersive Product API.
    This endpoint is used for non-Amazon products to get rich details.

    - **product_id**: UUID of the product from our database
    """
    try:
        logger.info(f"Fetching immersive product details for product: {product_id}")
        
        # For now, we'll return a placeholder
        # The frontend will pass the immersive_product_api_link from the search results
        return {
            "status": "immersive_details",
            "message": "Use the immersive_product_api_link from search results for detailed data"
        }

    except Exception as e:
        logger.error(f"Error fetching immersive product details: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch immersive product details: {str(e)}"
        )


@router.post(
    "/product/enriched/{product_id}",
    responses={404: {"model": ErrorResponse}, 500: {"model": ErrorResponse}}
)
async def get_enriched_product_details(
    product_id: str,
    request: EnrichedProductRequest,
):
    """
    Get enriched product details for non-Amazon products.
    Uses the immersive_api_link from search results to fetch detailed data.

    - **product_id**: UUID of the product from our database
    - **request**: Request body containing immersive_api_link from SerpAPI
    """
    try:
        logger.info(f"Fetching enriched details for product: {product_id}")
        
        immersive_api_link = request.immersive_api_link
        
        if not immersive_api_link:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="immersive_api_link is required"
            )

        # Fetch from SerpAPI using the provided link
        async with httpx.AsyncClient(timeout=30.0) as client:
            # Add API key to the immersive_api_link if it's a SerpAPI endpoint
            from app.config import settings
            
            api_link = immersive_api_link
            
            # Check if API key is already in the URL
            if "api_key=" not in api_link and settings.SERPAPI_KEY:
                # Add API key to the URL
                separator = "&" if "?" in api_link else "?"
                api_link = f"{api_link}{separator}api_key={settings.SERPAPI_KEY}"
            
            logger.info(f"Calling SerpAPI immersive product endpoint: {api_link[:100]}...")
            
            response = await client.get(api_link)
            response.raise_for_status()
            immersive_data = response.json()
            
            logger.info(f"Successfully fetched immersive data for product: {product_id}")
            return {
                "product_id": product_id,
                "immersive_data": immersive_data
            }

    except httpx.HTTPError as e:
        logger.error(f"HTTP error fetching immersive product details: {e}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to fetch data from external API"
        )
    except Exception as e:
        logger.error(f"Error fetching enriched product details: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch enriched product details: {str(e)}"
        )


@router.get("/debug/cache")
async def debug_cache():
    """Debug endpoint to check cache contents."""
    from app.services.search_service import PRODUCT_CACHE, PRODUCT_BY_SOURCE
    return {
        "cache_size": len(PRODUCT_CACHE),
        "cache_keys": list(PRODUCT_CACHE.keys()),
        "source_cache_size": len(PRODUCT_BY_SOURCE),
        "source_cache_keys": list(PRODUCT_BY_SOURCE.keys())
    }
