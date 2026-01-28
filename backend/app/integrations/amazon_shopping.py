"""Amazon Shopping integration using SerpAPI."""

import logging
from typing import List, Optional, Dict, Any
import httpx

from app.config import settings

logger = logging.getLogger(__name__)


class AmazonShoppingClient:
    """Client for Amazon product search using SerpAPI."""

    def __init__(self, api_key: str):
        """
        Initialize Amazon Shopping client.
        
        Args:
            api_key: SerpAPI key
        """
        self.api_key = api_key
        self.base_url = "https://serpapi.com/search"
        self.timeout = 30

    async def search(
        self,
        keyword: str,
        amazon_domain: str = "amazon.com",
        language: str = "en_US",
        delivery_zip: Optional[str] = None,
        page: int = 1,
        sort: str = "relevanceblender",
        device: str = "desktop"
    ) -> Dict[str, Any]:
        """
        Search Amazon for products.
        
        Args:
            keyword: Search query (e.g., "coffee maker")
            amazon_domain: Amazon domain (default: amazon.com)
            language: Language/locale (default: en_US)
            delivery_zip: ZIP code for shipping filter
            page: Page number for pagination
            sort: Sort order (relevanceblender, price-asc-rank, price-desc-rank, review-rank, date-desc-rank)
            device: Device type (desktop, tablet, mobile)
            
        Returns:
            Dict containing search results with structure:
            {
                'search_metadata': {...},
                'organic_results': [
                    {
                        'position': int,
                        'title': str,
                        'link': str,
                        'image': str,
                        'price': str,  # e.g., "$19.99"
                        'currency': str,  # e.g., "USD"
                        'rating': float,  # e.g., 4.5
                        'reviews': int,
                        'asin': str,
                        'is_prime': bool
                    },
                    ...
                ],
                'related_searches': [...]
            }
        """
        try:
            params = {
                "engine": "amazon",
                "k": keyword,
                "amazon_domain": amazon_domain,
                "language": language,
                "api_key": self.api_key,
                "device": device,
                "page": page,
                "s": sort
            }
            
            if delivery_zip:
                params["delivery_zip"] = delivery_zip

            logger.info(
                f"[AmazonShoppingClient] Searching Amazon:\n"
                f"  Keyword: {keyword}\n"
                f"  Domain: {amazon_domain}\n"
                f"  Language: {language}\n"
                f"  Page: {page}"
            )

            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(self.base_url, params=params)
                response.raise_for_status()
                data = response.json()

                # Log response status
                status = data.get("search_metadata", {}).get("status")
                result_count = len(data.get("organic_results", []))
                
                logger.info(
                    f"[AmazonShoppingClient] Amazon search completed:\n"
                    f"  Status: {status}\n"
                    f"  Results: {result_count}\n"
                    f"  Query: {keyword} on {amazon_domain}"
                )

                if status == "Error":
                    error_msg = data.get("search_metadata", {}).get("error")
                    logger.error(f"[AmazonShoppingClient] Search error: {error_msg}")
                    return {"organic_results": [], "related_searches": []}

                return data

        except httpx.HTTPError as e:
            logger.error(f"[AmazonShoppingClient] HTTP error during search: {e}")
            raise
        except Exception as e:
            logger.error(f"[AmazonShoppingClient] Error searching Amazon: {e}", exc_info=True)
            raise

    async def get_product(
        self,
        asin: str,
        amazon_domain: str = "amazon.com",
        language: str = "en_US",
        delivery_zip: Optional[str] = None,
        include_other_sellers: bool = True,
        device: str = "desktop"
    ) -> Dict[str, Any]:
        """
        Get detailed product information by ASIN.
        
        Args:
            asin: Amazon Standard Identification Number (e.g., "B072MQ5BRX")
            amazon_domain: Amazon domain
            language: Language/locale
            delivery_zip: ZIP code for shipping
            include_other_sellers: Include other sellers data
            device: Device type
            
        Returns:
            Dict containing product details:
            {
                'product_result': {
                    'title': str,
                    'price': str,
                    'currency': str,
                    'rating': float,
                    'reviews': int,
                    'asin': str,
                    'url': str,
                    'image': str,
                    'images': [str],
                    'description': str,
                    'specifications': {...},
                    'seller': {...}
                },
                'reviews': [
                    {
                        'title': str,
                        'body': str,
                        'rating': int,
                        'reviewer': str,
                        'date': str
                    },
                    ...
                ]
            }
        """
        try:
            params = {
                "engine": "amazon_product",
                "asin": asin,
                "amazon_domain": amazon_domain,
                "language": language,
                "api_key": self.api_key,
                "device": device
            }
            
            if include_other_sellers:
                params["other_sellers"] = "true"
            
            if delivery_zip:
                params["delivery_zip"] = delivery_zip

            logger.info(
                f"[AmazonShoppingClient] Fetching product details:\n"
                f"  ASIN: {asin}\n"
                f"  Domain: {amazon_domain}"
            )

            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(self.base_url, params=params)
                response.raise_for_status()
                data = response.json()

                status = data.get("search_metadata", {}).get("status")
                logger.info(
                    f"[AmazonShoppingClient] Product details retrieved:\n"
                    f"  Status: {status}\n"
                    f"  ASIN: {asin}"
                )

                if status == "Error":
                    error_msg = data.get("search_metadata", {}).get("error")
                    logger.error(f"[AmazonShoppingClient] Product fetch error: {error_msg}")
                    return {}

                return data

        except httpx.HTTPError as e:
            logger.error(f"[AmazonShoppingClient] HTTP error fetching product: {e}")
            raise
        except Exception as e:
            logger.error(f"[AmazonShoppingClient] Error fetching product {asin}: {e}", exc_info=True)
            raise

    @staticmethod
    def normalize_search_result(result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Normalize Amazon search result to standard ProductResponse format.
        
        Args:
            result: Raw Amazon search result from SerpAPI
            
        Returns:
            Normalized product data
        """
        try:
            # Extract price
            price_str = result.get("price", "0")
            try:
                price = float(price_str.replace("$", "").replace(",", ""))
            except:
                price = 0.0

            return {
                "title": result.get("title", ""),
                "price": price,
                "currency": result.get("currency", "USD"),
                "source": "Amazon",
                "source_id": result.get("asin", ""),
                "image_url": result.get("image", ""),
                "url": result.get("link", ""),
                "rating": result.get("rating", None),
                "review_count": result.get("reviews", 0),
                "is_prime": result.get("is_prime", False),
                "availability": "In Stock" if result.get("reviews", 0) > 0 else "Unknown",
                "origin": "amazon_api",  # Track source
            }
        except Exception as e:
            logger.error(f"Error normalizing Amazon result: {e}")
            return {}

    @staticmethod
    def normalize_product_details(data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Normalize Amazon product details to standard format.
        Handles both amazon_product (detail) and amazon (search) response formats.
        
        Args:
            data: Raw product response from SerpAPI amazon_product or amazon engine
            
        Returns:
            Normalized product details with rating and review_count
        """
        try:
            # Try to get product_results (from amazon_product endpoint)
            product = data.get("product_results", {})
            
            # Fallback to product_result if not found
            if not product:
                product = data.get("product_result", {})
            
            # Extract reviews - could be in different places
            reviews_info = data.get("reviews_information", {})
            authors_reviews = reviews_info.get("authors_reviews", [])
            if not authors_reviews:
                authors_reviews = data.get("reviews", [])

            # Extract price - handle string or float
            price_str = product.get("price") or product.get("extracted_price", "0")
            if isinstance(price_str, str):
                try:
                    price = float(price_str.replace("$", "").replace(",", ""))
                except:
                    price = 0.0
            else:
                price = float(price_str)

            # Extract rating and review count
            # Try product_results first (from amazon_product endpoint)
            rating = product.get("rating", None)
            review_count = product.get("reviews", 0)
            
            # Also check product_details section
            product_details = product.get("product_details", {})
            if not rating and "rating" in product_details:
                rating = product_details.get("rating")
            if not review_count and "review" in product_details:
                review_count = product_details.get("review", 0)

            # Build normalized response
            return {
                "title": product.get("title", ""),
                "price": price,
                "currency": product.get("currency") or product.get("extracted_price") and "USD" or "USD",
                "asin": product.get("asin", ""),
                "url": product.get("link") or product.get("url", ""),
                "image": product.get("thumbnail", "") or product.get("image", ""),
                "images": product.get("thumbnails", []) or product.get("images", []),
                "rating": rating,  # 4.3 (float)
                "review_count": review_count,  # 20626 (int)
                "description": product.get("description", ""),
                "specifications": product.get("item_specifications", {}) or product.get("specifications", {}),
                "badges": product.get("badges", []),  # ["Amazon's Choice"]
                "prime": product.get("prime", False),
                "reviews": [
                    {
                        "title": r.get("title", ""),
                        "body": r.get("text", ""),
                        "rating": r.get("rating", 0),
                        "reviewer": r.get("author", ""),
                        "date": r.get("date", ""),
                        "verified": r.get("verified_purchase", False)
                    }
                    for r in authors_reviews[:10]  # First 10 reviews
                ],
                "source": "Amazon",
                "origin": "amazon_api",
            }
        except Exception as e:
            logger.error(f"Error normalizing product details: {e}")
            return {}
