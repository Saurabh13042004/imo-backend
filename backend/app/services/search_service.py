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

logger = logging.getLogger(__name__)

# Thread pool for concurrent API calls
THREAD_POOL = ThreadPoolExecutor(max_workers=3, thread_name_prefix="search_")

# In-memory product cache: maps product_id -> ProductResponse
# This allows us to retrieve products by ID when user clicks on them
PRODUCT_CACHE: Dict[str, ProductResponse] = {}
PRODUCT_BY_SOURCE: Dict[str, ProductResponse] = {}  # Maps "source:source_id" -> ProductResponse


class SearchService:
    """Service for searching products across multiple sources with multi-threading."""

    def __init__(self):
        self.rapidapi_key = settings.RAPIDAPI_KEY
        self.serpapi_key = settings.SERPAPI_KEY
        self.search_timeout = settings.SEARCH_TIMEOUT
        self.total_timeout = settings.SEARCH_TOTAL_TIMEOUT
        
        # Initialize Google Shopping client if API key is available
        self.google_client = None
        if self.serpapi_key:
            self.google_client = GoogleShoppingClient(self.serpapi_key)

    async def search_all_sources(
        self,
        db: AsyncSession,
        search_request: SearchRequest,
        use_cache: bool = True
    ) -> Tuple[List[ProductResponse], int]:
        """Search multiple sources in parallel and combine results.
        
        Args:
            db: Database session
            search_request: Search request with keyword and optional zipcode
            use_cache: Whether to use cache
            
        Returns:
            Tuple of (product_responses, total_count)
        """
        try:
            start_time = time.time()
            zipcode = search_request.zipcode or "60607"
            keyword = search_request.keyword.strip()
            
            logger.info(f"Starting parallel search for keyword: {keyword}, zipcode: {zipcode}")
            
            # Run searches in parallel
            results = self._search_parallel(keyword, zipcode)
            
            # Combine and deduplicate results
            combined_results = self._combine_and_deduplicate(results)
            
            # Convert to ProductResponse objects
            product_responses = self._convert_to_product_responses(combined_results)
            
            # Cache products for later retrieval
            for product in product_responses:
                PRODUCT_CACHE[str(product.id)] = product
                # Also cache by source:source_id
                if product.source_id:
                    cache_key = f"{product.source}:{product.source_id}"
                    PRODUCT_BY_SOURCE[cache_key] = product
            
            elapsed = time.time() - start_time
            logger.info(
                f"Search completed in {elapsed:.2f}s: "
                f"Found {len(product_responses)} unique products from {len(results)} sources"
            )
            
            return product_responses, len(product_responses)

        except Exception as e:
            logger.error(f"Error in search_all_sources: {e}", exc_info=True)
            return [], 0

    def _search_parallel(self, keyword: str, zipcode: str) -> Dict[str, List[Dict[str, Any]]]:
        """Execute searches in parallel using thread pool.
        
        Args:
            keyword: Search keyword
            zipcode: Geographic location
            
        Returns:
            Dictionary with results from each source
        """
        results = {}
        futures = {}
        
        # Submit Amazon search
        if self.rapidapi_key:
            future = THREAD_POOL.submit(
                self._call_amazon_api_safe,
                keyword,
                zipcode
            )
            futures['amazon'] = future
        
        # Submit Google Shopping search
        if self.google_client:
            future = THREAD_POOL.submit(
                self._call_google_shopping_safe,
                keyword,
                zipcode
            )
            futures['google_shopping'] = future
        
        # Collect results with timeout
        timeout_per_source = self.total_timeout / max(len(futures), 1)
        
        for source, future in futures.items():
            try:
                result = future.result(timeout=timeout_per_source + 1)
                results[source] = result
                logger.info(f"Retrieved {len(result)} results from {source}")
            except Exception as e:
                logger.error(f"Error getting results from {source}: {e}")
                results[source] = []
        
        return results

    def _call_amazon_api_safe(self, keyword: str, zipcode: str) -> List[Dict[str, Any]]:
        """Thread-safe wrapper for Amazon API calls.
        
        Args:
            keyword: Search keyword
            zipcode: Geographic location
            
        Returns:
            List of product results
        """
        try:
            return self._call_amazon_api(keyword, zipcode)
        except Exception as e:
            logger.error(f"Error in Amazon API call: {e}")
            return []

    def _call_google_shopping_safe(self, keyword: str, zipcode: str) -> List[Dict[str, Any]]:
        """Thread-safe wrapper for Google Shopping API calls.
        
        Args:
            keyword: Search keyword
            zipcode: Geographic location (converted to location string)
            
        Returns:
            List of product results
        """
        try:
            if not self.google_client:
                return []
            
            # Convert zipcode to location string (e.g., "60607" -> "Chicago, Illinois")
            # For now, we'll just use the zipcode as-is, SerpAPI handles it
            results = self.google_client.search(
                query=keyword,
                limit=100,
                location=None  # SerpAPI can work with just the query
            )
            return results
        except Exception as e:
            logger.error(f"Error in Google Shopping API call: {e}")
            return []

    def _combine_and_deduplicate(
        self, 
        results: Dict[str, List[Dict[str, Any]]]
    ) -> List[Dict[str, Any]]:
        """Combine results from multiple sources and deduplicate.
        
        Args:
            results: Dictionary of results by source
            
        Returns:
            Combined and deduplicated list of results
        """
        combined = []
        seen_ids: Set[str] = set()
        seen_titles: Dict[str, str] = {}  # title hash -> original title
        
        # Process Amazon results first (preferred source)
        for result in results.get('amazon', []):
            product_id = self._get_product_id(result)
            title_hash = self._hash_title(result.get('title', ''))
            
            # Ensure source is set to amazon
            result['source'] = 'amazon'
            
            if product_id and product_id not in seen_ids:
                combined.append(result)
                seen_ids.add(product_id)
                seen_titles[title_hash] = result.get('title', '')
        
        # Process Google Shopping results
        for result in results.get('google_shopping', []):
            product_id = self._get_product_id(result)
            title_hash = self._hash_title(result.get('title', ''))
            
            # Get source from result (retailer name like "Walmart", "Best Buy", etc.)
            # If not set, default to google_shopping as fallback
            source = result.get('source', 'google_shopping')
            result['source'] = source
            
            # Skip if already have this product ID
            if product_id and product_id in seen_ids:
                continue
            
            # Skip if title is very similar to existing one (fuzzy dedup)
            if title_hash in seen_titles and self._titles_similar(
                seen_titles[title_hash],
                result.get('title', '')
            ):
                continue
            
            combined.append(result)
            if product_id:
                seen_ids.add(product_id)
            seen_titles[title_hash] = result.get('title', '')
        
        logger.info(f"Deduplicated: {sum(len(v) for v in results.values())} -> {len(combined)} unique products")
        return combined

    def _convert_to_product_responses(
        self,
        results: List[Dict[str, Any]]
    ) -> List[ProductResponse]:
        """Convert raw results to ProductResponse objects.
        
        Args:
            results: List of combined results
            
        Returns:
            List of ProductResponse objects
        """
        product_responses = []
        
        for result in results:
            try:
                # Ensure source is properly set
                source = result.get("source", "unknown")
                if not source or source == "unknown":
                    # Try to determine source from context
                    if result.get("asin"):
                        source = "amazon"
                    else:
                        source = "Unknown Retailer"
                
                # Handle both Amazon API field names and standard names
                image_url = result.get("image_url") or result.get("url_image", "")
                review_count = result.get("review_count") or result.get("reviews_count", 0)
                
                # Get immersive product data
                immersive_api_link = result.get("immersive_product_api_link", "")
                immersive_page_token = result.get("immersive_product_page_token", "")
                
                # If immersive link is missing and it's not Amazon, try to fetch it
                if not immersive_api_link and source.lower() != "amazon":
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
                    title=result.get("title", "")[:200],  # Limit title length
                    source=source,
                    source_id=result.get("source_id", result.get("product_id", result.get("asin", ""))),
                    asin=result.get("asin", ""),
                    url=result.get("url", ""),
                    image_url=image_url,
                    price=self._parse_price(result.get("price")),
                    currency=result.get("currency", "USD"),
                    rating=self._parse_rating(result.get("rating")),
                    review_count=int(review_count) if review_count else 0,
                    description=result.get("description", result.get("title", ""))[:500],
                    brand=result.get("brand", result.get("manufacturer", "")),
                    category=result.get("category", ""),
                    availability=result.get("availability", "In Stock"),
                    # Google Shopping immersive product details
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

    def _call_amazon_api(self, query: str, zipcode: str) -> List[Dict[str, Any]]:
        """Call Amazon data scraper API via RapidAPI.
        
        Args:
            query: Search query
            zipcode: Geographic location
            
        Returns:
            List of product results from Amazon
        """
        import http.client
        
        try:
            conn = http.client.HTTPSConnection("amazon-data-scraper-api3.p.rapidapi.com")

            payload = json.dumps({
                "source": "amazon_search",
                "query": query,
                "geo_location": zipcode,
                "domain": "com",
                "parse": True
            })

            headers = {
                'x-rapidapi-key': self.rapidapi_key,
                'x-rapidapi-host': "amazon-data-scraper-api3.p.rapidapi.com",
                'Content-Type': "application/json"
            }

            conn.request("POST", "/queries", payload, headers)
            res = conn.getresponse()
            data = res.read()
            
            response_data = json.loads(data.decode("utf-8"))
            
            # Extract results from API response
            if response_data.get("results") and len(response_data["results"]) > 0:
                content = response_data["results"][0].get("content", {})
                results_data = content.get("results", {})
                
                # Combine paid and organic results
                all_results = []
                all_results.extend(results_data.get("paid", []))
                all_results.extend(results_data.get("organic", []))
                
                return all_results
            
            return []

        except Exception as e:
            logger.error(f"Error calling Amazon API: {e}", exc_info=True)
            return []

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
