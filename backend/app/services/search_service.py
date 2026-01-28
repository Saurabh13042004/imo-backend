"""Search service for product aggregation with multi-source support."""

import logging
import json
import hashlib
from datetime import datetime
from uuid import uuid4
from typing import List, Dict, Any, Optional, Set, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading
import time

from app.schemas import SearchRequest, ProductResponse
from app.config import settings
from app.integrations.google_shopping import GoogleShoppingClient
from app.integrations.amazon_shopping import AmazonShoppingClient
from app.utils.error_logger import log_error

logger = logging.getLogger(__name__)

# Thread pool for concurrent API calls
THREAD_POOL = ThreadPoolExecutor(max_workers=3, thread_name_prefix="search_")

# In-memory product cache: maps product_id -> ProductResponse
# This allows us to retrieve products by ID when user clicks on them
PRODUCT_CACHE: Dict[str, ProductResponse] = {}
PRODUCT_BY_SOURCE: Dict[str, ProductResponse] = {}  # Maps "source:source_id" -> ProductResponse


class SearchService:
    """Service for searching products with Google Shopping as canonical source."""

    def __init__(self):
        self.serpapi_key = settings.SERPAPI_KEY
        self.search_timeout = settings.SEARCH_TIMEOUT
        self.total_timeout = settings.SEARCH_TOTAL_TIMEOUT
        
        # Initialize Google Shopping client (required)
        self.google_client = None
        if self.serpapi_key:
            self.google_client = GoogleShoppingClient(self.serpapi_key)
        else:
            logger.warning("SerpAPI key not configured - Google Shopping search will not work")
        
        # Initialize Amazon Shopping client (optional)
        self.amazon_client = None
        if self.serpapi_key:
            self.amazon_client = AmazonShoppingClient(self.serpapi_key)
        else:
            logger.warning("SerpAPI key not configured - Amazon search will not work")

    async def search_all_sources(
        self,
        db: AsyncSession,
        search_request: SearchRequest,
        use_cache: bool = True
    ) -> Tuple[List[ProductResponse], int]:
        """Search using Google Shopping as canonical source.
        
        Args:
            db: Database session
            search_request: Search request with keyword, country, city, language, store
            use_cache: Whether to use cache
            
        Returns:
            Tuple of (product_responses, total_count)
        """
        try:
            start_time = time.time()
            keyword = search_request.keyword.strip()
            country = search_request.country or "United States"
            city = search_request.city
            language = search_request.language or "en"
            store = search_request.store  # Get store preference
            
            # Build location string for SerpAPI
            if city:
                location = f"{city},{country}"
            else:
                location = country
            
            logger.info(
                f"[SearchService] Starting search:\\n"
                f"  Keyword: {keyword}\\n"
                f"  Country: {country}\\n"
                f"  City: {city}\\n"
                f"  Language: {language}\\n"
                f"  Store Filter: {store or 'All Stores'}\\n"
                f"  Location for SerpAPI: {location}"
            )
            
            if not self.google_client:
                logger.error("Google Shopping client not initialized")
                return [], 0
            
            # Search Google Shopping with proper geo parameters and store filter
            results = self._search_google_shopping(keyword, location, country, language, store)
            
            # If store is "amazon" or None (all stores), also search Amazon directly
            if self.amazon_client and (store is None or store.lower() == "amazon"):
                logger.info("[SearchService] Searching Amazon Shopping API for broader coverage")
                try:
                    amazon_results = await self._search_amazon(keyword, country, language)
                    results.extend(amazon_results)
                    logger.info(f"[SearchService] Added {len(amazon_results)} results from Amazon API")
                except Exception as e:
                    logger.warning(f"[SearchService] Amazon search failed (continuing with Google only): {e}")
            
            # De-duplicate results by title and source ID
            results = self._deduplicate_results(results)
            
            # Rank and filter results by relevance
            results = self._rank_by_relevance(results, keyword)
            
            # Convert to ProductResponse objects
            product_responses = self._convert_to_product_responses(results)
            
            # Cache products for later retrieval
            for product in product_responses:
                PRODUCT_CACHE[str(product.id)] = product
                # Also cache by source:source_id
                if product.source_id:
                    cache_key = f"{product.source}:{product.source_id}"
                    PRODUCT_BY_SOURCE[cache_key] = product
            
            elapsed = time.time() - start_time
            logger.info(
                f"[SearchService] Search completed in {elapsed:.2f}s: "
                f"Found {len(product_responses)} unique products"
            )
            
            return product_responses, len(product_responses)

        except Exception as e:
            logger.error(f"[SearchService] Error in search_all_sources: {e}", exc_info=True)
            return [], 0

    def _search_google_shopping(
        self,
        keyword: str,
        location: str,
        country: Optional[str] = None,
        language: str = "en",
        store: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Search Google Shopping with proper geo parameters and store filtering.
        
        Args:
            keyword: Search keyword
            location: Location string (e.g., "India" or "Bengaluru,India")
            country: Country name for geo-targeting
            language: Language code
            store: Preferred store filter (e.g., 'amazon', 'walmart')
            
        Returns:
            List of product results from Google Shopping
        """
        try:
            logger.info(
                f"[SearchService._search] Calling GoogleShoppingClient.search with:\\n"
                f"  Keyword: {keyword}\\n"
                f"  Location: {location}\\n"
                f"  Country: {country}\\n"
                f"  Language: {language}\\n"
                f"  Store: {store or 'All Stores'}"
            )
            results = self.google_client.search(
                query=keyword,
                limit=100,
                location=location,
                country=country,
                language=language,
                store=store
            )
            logger.info(f"[SearchService._search] Retrieved {len(results)} results")
            return results
        except Exception as e:
            logger.error(f"[SearchService._search] Error: {e}", exc_info=True)
            return []

    async def _search_amazon(
        self,
        keyword: str,
        country: str = "United States",
        language: str = "en_US"
    ) -> List[Dict[str, Any]]:
        """Search Amazon using SerpAPI.
        
        Args:
            keyword: Search keyword
            country: Country name
            language: Language/locale code
            
        Returns:
            List of normalized Amazon product results
        """
        try:
            if not self.amazon_client:
                logger.warning("[SearchService._search_amazon] Amazon client not initialized")
                return []
            
            logger.info(f"[SearchService._search_amazon] Searching Amazon for: {keyword}")
            
            # Map country to Amazon domain and language
            domain_map = {
                "United States": ("amazon.com", "en_US"),
                "United Kingdom": ("amazon.co.uk", "en_GB"),
                "India": ("amazon.in", "en_IN"),
                "Canada": ("amazon.ca", "en_CA"),
                "Germany": ("amazon.de", "de_DE"),
                "France": ("amazon.fr", "fr_FR"),
                "Japan": ("amazon.co.jp", "ja_JP"),
            }
            
            amazon_domain, amazon_lang = domain_map.get(country, ("amazon.com", language))
            
            # Search Amazon
            response = await self.amazon_client.search(
                keyword=keyword,
                amazon_domain=amazon_domain,
                language=amazon_lang
            )
            
            # Normalize results
            organic_results = response.get("organic_results", [])
            normalized = [
                AmazonShoppingClient.normalize_search_result(result)
                for result in organic_results
            ]
            
            logger.info(f"[SearchService._search_amazon] Found {len(normalized)} Amazon results")
            return normalized
        
        except Exception as e:
            logger.error(f"[SearchService._search_amazon] Error searching Amazon: {e}")
            return []  # Fallback gracefully

    def _deduplicate_results(
        self,
        results: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Remove duplicate products from merged sources.
        
        Deduplication logic:
        1. Group by title (with fuzzy matching)
        2. Keep Amazon API results over Google Shopping (more accurate pricing)
        3. Keep highest-rated version if available
        
        Args:
            results: Combined results from all sources
            
        Returns:
            Deduplicated list of results
        """
        if not results:
            return []
        
        # Simple deduplication: group by title hash
        seen = {}
        
        for result in results:
            title = result.get("title", "").lower().strip()
            asin = result.get("source_id", "")
            
            # Create composite key: title + asin (if available)
            if asin:
                key = f"{asin}"
            else:
                # Fuzzy title match by removing common words
                key = self._normalize_title_for_dedup(title)
            
            if key not in seen:
                seen[key] = result
            else:
                # Keep Amazon results over Google Shopping
                if result.get("origin") == "amazon_api":
                    seen[key] = result
                # Otherwise keep the one with higher rating
                elif result.get("rating", 0) > seen[key].get("rating", 0):
                    seen[key] = result
        
        logger.info(f"[SearchService._deduplicate_results] Reduced {len(results)} results to {len(seen)}")
        return list(seen.values())

    @staticmethod
    def _normalize_title_for_dedup(title: str) -> str:
        """Normalize title for deduplication matching.
        
        Args:
            title: Product title
            
        Returns:
            Normalized key for comparison
        """
        import re
        # Remove common words and normalize
        common_words = {'for', 'the', 'a', 'an', 'and', 'or', 'with', 'by', 'in'}
        words = re.findall(r'\\w+', title.lower())
        filtered = [w for w in words if w not in common_words]
        # Return hash of key words (first 3-5 words usually unique)
        return hashlib.md5(" ".join(filtered[:5]).encode()).hexdigest()

    def _rank_by_relevance(
        self,
        results: List[Dict[str, Any]],
        keyword: str
    ) -> List[Dict[str, Any]]:
        """Rank and filter results by relevance to the search keyword.
        
        Strategy:
        1. Extract primary keywords (usually first 2-3 words, e.g., "iPhone 17" from long query)
        2. Filter out irrelevant categories (e.g., show iPhones, hide cases/chargers)
        3. Score results based on:
           - Primary keyword match (exact > partial > not present)
           - Title length (shorter = more specific, usually better match)
           - Rating (higher = more trusted)
           - Review count (more reviews = more validated)
        4. Sort by score descending (best results first)
        
        Args:
            results: List of deduplicated results
            keyword: Original search keyword
            
        Returns:
            Results sorted by relevance score (best first)
        """
        if not results:
            return []
        
        # Extract primary keywords (first 2-3 words)
        primary_keywords = self._extract_primary_keywords(keyword)
        
        # Score each result
        scored_results = []
        for result in results:
            title = result.get("title", "").lower()
            
            # Skip obvious low-quality/accessory results if primary keyword is product-specific
            if self._should_filter_result(result, primary_keywords):
                logger.debug(f"[SearchService] Filtering low-quality result: {result.get('title', '')[:60]}")
                continue
            
            # Calculate relevance score
            score = self._calculate_relevance_score(
                result,
                title,
                primary_keywords,
                keyword
            )
            
            scored_results.append((score, result))
        
        # Sort by score (descending - highest score first)
        scored_results.sort(key=lambda x: x[0], reverse=True)
        
        # Extract just the results
        ranked_results = [item[1] for item in scored_results]
        
        top_score = scored_results[0][0] if scored_results else 0
        logger.info(
            f"[SearchService._rank_by_relevance] Ranked {len(results)} results\n"
            f"  Primary keywords: {primary_keywords}\n"
            f"  After filtering: {len(ranked_results)} results\n"
            f"  Top result: {ranked_results[0].get('title', '')[:60] if ranked_results else 'NONE'}\n"
            f"  Score: {top_score:.2f}\n"
        )
        
        return ranked_results

    @staticmethod
    def _extract_primary_keywords(keyword: str) -> List[str]:
        """Extract primary search keywords from full query.
        
        For long queries like:
        "Spigen EZ Fit Tempered Glass Screen Protector Guard For iPhone 17/17 Pro / 16 Pro"
        
        Extracts: ["iPhone", "17", "protector"] (main product indicators)
        
        Args:
            keyword: Full search query
            
        Returns:
            List of primary keywords
        """
        import re
        
        # Keywords that indicate main product vs modifiers
        stop_words = {
            'for', 'the', 'a', 'an', 'and', 'or', 'with', 'by', 'in', 'on', 'to',
            'screen', 'guard', 'protector', 'glass', 'tempered', 'ez', 'fit',
            'pack', 'set', '2023', '2024', '2025', '2026'
        }
        
        # Extract words and filter
        words = re.findall(r'\\b\\w+\\b', keyword.lower())
        primary = [w for w in words[:5] if w not in stop_words and len(w) > 2]
        
        return primary[:3]  # Return top 3 primary keywords

    @staticmethod
    def _should_filter_result(result: Dict[str, Any], primary_keywords: List[str]) -> bool:
        """Determine if a result should be filtered (excluded) based on category.
        
        Filters out:
        - Accessories when searching for main product (case/charger when searching iPhone)
        - Unrelated categories
        - Very low-priced items (likely knockoffs)
        
        Args:
            result: Product result
            primary_keywords: List of primary search keywords
            
        Returns:
            True if result should be filtered, False otherwise
        """
        title = result.get("title", "").lower()
        price = result.get("price", 0)
        
        # If no primary keywords, don't filter
        if not primary_keywords:
            return False
        
        # If result title contains primary keyword, keep it
        for keyword in primary_keywords:
            if keyword in title:
                return False  # Keep it - matches primary keyword
        
        # If title contains accessory indicators and NO primary keyword, filter
        accessory_indicators = [
            'case', 'cover', 'charger', 'cable', 'adapter', 'screen protector',
            'tempered glass', 'sim ejector', 'tool', 'holder', 'stand', 'mount',
            'skin', 'film', 'sleeve', 'pouch', 'bag'
        ]
        
        is_accessory = any(indicator in title for indicator in accessory_indicators)
        
        if is_accessory and len(primary_keywords) > 0:
            # This is clearly an accessory and we're searching for main product
            return True
        
        return False

    @staticmethod
    def _calculate_relevance_score(
        result: Dict[str, Any],
        title_lower: str,
        primary_keywords: List[str],
        full_keyword: str
    ) -> float:
        """Calculate relevance score for a result.
        
        Scoring factors:
        - Primary keyword exact match: +10
        - Primary keyword partial match: +5
        - Title specificity (shorter is better): +5 to +1
        - Rating: +0 to +3
        - Review count: +0 to +2
        - Source (Amazon preferred): +0 or +1
        
        Args:
            result: Product result
            title_lower: Title in lowercase
            primary_keywords: List of primary keywords
            full_keyword: Full search query
            
        Returns:
            Relevance score (higher = more relevant)
        """
        score = 0.0
        
        # 1. Primary keyword matching (heavy weight)
        for keyword in primary_keywords:
            if keyword in title_lower:
                if title_lower.startswith(keyword) or f" {keyword} " in f" {title_lower} ":
                    score += 10.0  # Exact match or word boundary match
                else:
                    score += 5.0  # Contains keyword but not prominent
        
        # 2. Title length bonus (shorter = more specific)
        title_length = len(result.get("title", ""))
        if title_length < 50:
            score += 5.0  # Short & specific
        elif title_length < 100:
            score += 3.0  # Medium
        elif title_length < 150:
            score += 1.0  # Long but acceptable
        # Very long titles (>150) get no bonus
        
        # 3. Rating bonus (validated by users)
        rating = result.get("rating")
        if rating:
            try:
                rating_float = float(rating) if isinstance(rating, str) else rating
                if rating_float >= 4.5:
                    score += 3.0
                elif rating_float >= 4.0:
                    score += 2.0
                elif rating_float >= 3.5:
                    score += 1.0
            except (ValueError, TypeError):
                pass
        
        # 4. Review count bonus (more validated = more trustworthy)
        review_count = result.get("review_count") or result.get("reviews")
        if review_count:
            try:
                reviews_int = int(review_count) if isinstance(review_count, str) else review_count
                if reviews_int >= 1000:
                    score += 2.0
                elif reviews_int >= 100:
                    score += 1.0
            except (ValueError, TypeError):
                pass
        
        # 5. Source bonus (Amazon often has better data)
        if result.get("origin") == "amazon_api":
            score += 1.0
        
        # 6. In-stock/availability bonus
        if result.get("in_stock") or result.get("stock") == "In Stock":
            score += 0.5
        
        return score

    def _convert_to_product_responses(
        self,
        results: List[Dict[str, Any]]
    ) -> List[ProductResponse]:
        """Convert search results from all sources to ProductResponse objects.
        
        Args:
            results: List of results from Google Shopping and/or Amazon
            
        Returns:
            List of ProductResponse objects
        """
        product_responses = []
        
        for result in results:
            try:
                # Detect origin
                origin = result.get("origin", "google_shopping")
                
                if origin == "amazon_api":
                    # Handle Amazon result
                    product_response = ProductResponse(
                        id=str(uuid4()),
                        title=result.get("title", "")[:200],
                        source="Amazon",
                        source_id=result.get("source_id", ""),  # ASIN
                        asin=result.get("source_id", ""),
                        url=result.get("url", ""),
                        image_url=result.get("image_url", ""),
                        price=self._parse_price(result.get("price")),
                        currency=result.get("currency", "USD"),
                        rating=self._parse_rating(result.get("rating")),
                        review_count=int(result.get("review_count", 0)) if result.get("review_count") else 0,
                        description=result.get("title", "")[:500],
                        brand="",
                        category="",
                        availability=result.get("availability", "In Stock"),
                        created_at=datetime.utcnow(),
                        updated_at=datetime.utcnow()
                    )
                else:
                    # Handle Google Shopping result (existing logic)
                    source = result.get("source", "Google Shopping")
                    image_url = result.get("image_url") or result.get("url_image", "")
                    review_count = result.get("review_count") or result.get("reviews_count", 0)
                    rating = result.get("rating") or result.get("rating", None)
                    immersive_api_link = result.get("immersive_product_api_link", "")
                    immersive_page_token = result.get("immersive_product_page_token", "")
                    
                    # Try to fetch immersive link if not present
                    if not immersive_api_link and self.google_client:
                        try:
                            fetched_link = self.google_client.get_immersive_product_data(
                                result.get("title", ""),
                                source
                            )
                            if fetched_link:
                                immersive_api_link = fetched_link
                                logger.debug(f"Fetched immersive link for {source} product")
                        except Exception as e:
                            logger.debug(f"Could not fetch immersive link: {e}")
                    
                    product_response = ProductResponse(
                        id=str(uuid4()),
                        title=result.get("title", "")[:200],
                        source=source,
                        source_id=result.get("source_id", result.get("product_id", "")),
                        asin="",
                        url=result.get("url", ""),
                        image_url=image_url,
                        price=self._parse_price(result.get("price")),
                        currency=result.get("currency", "USD"),
                        rating=self._parse_rating(rating),
                        review_count=int(review_count) if review_count else 0,
                        description=result.get("description", result.get("title", ""))[:500],
                        brand=result.get("brand", result.get("manufacturer", "")),
                        category=result.get("category", ""),
                        availability=result.get("availability", "In Stock"),
                        immersive_product_page_token=immersive_page_token,
                        immersive_product_api_link=immersive_api_link,
                        created_at=datetime.utcnow(),
                        updated_at=datetime.utcnow()
                    )
                
                product_responses.append(product_response)
            except Exception as e:
                logger.error(f"Error converting result to ProductResponse: {e}")
                continue
        
        return product_responses

    @staticmethod
    def _get_product_id(result: Dict[str, Any]) -> Optional[str]:
        """Extract unique product ID from result.
        
        Args:
            result: Product result dict
            
        Returns:
            Unique product ID or None
        """
        # Try different ID fields depending on source
        for id_field in ['source_id', 'product_id', 'asin', 'id']:
            if result.get(id_field):
                return str(result.get(id_field))
        return None

    @staticmethod
    def _hash_title(title: str) -> str:
        """Create hash of title for comparison.
        
        Args:
            title: Product title
            
        Returns:
            SHA256 hash of title
        """
        clean_title = title.lower().strip()
        return hashlib.sha256(clean_title.encode()).hexdigest()

    @staticmethod
    def _titles_similar(title1: str, title2: str, threshold: float = 0.85) -> bool:
        """Check if two titles are similar using simple similarity.
        
        Args:
            title1: First title
            title2: Second title
            threshold: Similarity threshold (0-1)
            
        Returns:
            True if titles are similar
        """
        from difflib import SequenceMatcher
        
        ratio = SequenceMatcher(None, title1.lower(), title2.lower()).ratio()
        return ratio >= threshold

    @staticmethod
    def _parse_price(price: Any) -> Optional[float]:
        """Parse price value.
        
        Args:
            price: Price value (string, float, or int)
            
        Returns:
            Parsed price as float or None
        """
        try:
            if price is None:
                return None
            if isinstance(price, (int, float)):
                return float(price)
            if isinstance(price, str):
                # Remove currency symbols and commas
                clean = price.replace("$", "").replace(",", "").strip()
                return float(clean)
            return None
        except (ValueError, AttributeError):
            return None

    @staticmethod
    def _parse_rating(rating: Any) -> Optional[float]:
        """Parse rating value.
        
        Args:
            rating: Rating value (string, float, or int)
            
        Returns:
            Parsed rating as float or None
        """
        try:
            if rating is None:
                return None
            if isinstance(rating, (int, float)):
                return float(rating)
            if isinstance(rating, str):
                # Take first number (e.g., "4.5 out of 5" -> "4.5")
                return float(rating.split()[0])
            return None
        except (ValueError, IndexError, AttributeError):
            return None

    async def get_product_by_id(self, db: AsyncSession, product_id: str) -> Optional[ProductResponse]:
        """Get product by ID from cache.
        
        Args:
            db: Database session (for compatibility)
            product_id: UUID of the product
            
        Returns:
            ProductResponse if found, None otherwise
        """
        try:
            product = PRODUCT_CACHE.get(product_id)
            if product:
                logger.info(f"Retrieved product from cache: {product_id}")
                return product
            else:
                logger.warning(f"Product not found in cache: {product_id}")
                return None
        except Exception as e:
            logger.error(f"Error getting product by ID: {e}")
            return None

    async def get_product_by_source(
        self,
        db: AsyncSession,
        source: str,
        source_id: str
    ) -> Optional[ProductResponse]:
        """Get product by source and source_id from cache.
        
        Args:
            db: Database session (for compatibility)
            source: Product source (e.g., "amazon", "walmart")
            source_id: Source-specific product ID
            
        Returns:
            ProductResponse if found, None otherwise
        """
        try:
            cache_key = f"{source}:{source_id}"
            product = PRODUCT_BY_SOURCE.get(cache_key)
            if product:
                logger.info(f"Retrieved product from cache: {cache_key}")
                return product
            else:
                logger.warning(f"Product not found in cache: {cache_key}")
                return None
        except Exception as e:
            logger.error(f"Error getting product by source: {e}")
            return None
