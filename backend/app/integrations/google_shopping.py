"""Google Shopping integration using SERP API."""

import logging
from typing import List, Dict, Any, Optional
import httpx
import json

from app.config import settings

logger = logging.getLogger(__name__)

SERP_API_URL = "https://serp-scraper-api.p.rapidapi.com/queries"


class GoogleShoppingClient:
    """Client for Google Shopping integration."""

    def __init__(self):
        self.api_key = settings.RAPIDAPI_KEY
        self.base_url = SERP_API_URL
        self.headers = {
            "x-rapidapi-key": self.api_key,
            "x-rapidapi-host": "serp-scraper-api.p.rapidapi.com",
            "Content-Type": "application/json"
        }

    async def search(self, query: str, limit: int = 20, location: Optional[str] = None) -> List[Dict[str, Any]]:
        """Search for products on Google Shopping."""
        if not self.api_key:
            logger.warning("RapidAPI key not configured")
            return []

        try:
            # Construct payload based on user's snippet
            payload = {
                "source": "google_search", # Using google_search as requested, might need to parse organic results
                "query": query,
                "geo_location": location or "Seattle,Washington,United States",
                "parse": True,
                "limit": limit
            }

            async with httpx.AsyncClient(timeout=settings.HTTP_TIMEOUT) as client:
                response = await client.post(self.base_url, json=payload, headers=self.headers)
                response.raise_for_status()

            data = response.json()
            products = self._parse_search_results(data, query)
            logger.info(f"Found {len(products)} products on Google for query: {query}")
            return products

        except Exception as e:
            logger.error(f"Error searching Google: {e}")
            return []

    def _parse_search_results(self, data: Dict[str, Any], query: str) -> List[Dict[str, Any]]:
        """Parse search results from Google API response."""
        products = []
        try:
            # The response structure depends on "source": "google_search".
            # Usually it has "results" -> "organic" or "shopping_results" if available.
            results = data.get("results", {})
            
            # Try to get shopping results first
            shopping_results = results.get("shopping_results", [])
            if shopping_results:
                for item in shopping_results:
                    product = {
                        "title": item.get("title", ""),
                        "source_id": item.get("product_id", item.get("link", "").split("?")[0]),
                        "url": item.get("link", ""),
                        "image_url": item.get("image", ""),
                        "price": self._parse_price(item.get("price")),
                        "rating": float(item.get("rating", 0)) if item.get("rating") else None,
                        "review_count": int(item.get("review_count", 0)) if item.get("review_count") else 0,
                        "brand": item.get("brand", ""),
                        "source": "google_shopping"
                    }
                    products.append(product)
            
            # If no shopping results, try organic results (might be mixed)
            if not products:
                organic_results = results.get("organic", [])
                for item in organic_results:
                    # Only include if it looks like a product (has price or rating?)
                    # Or just return everything as a "product"
                    product = {
                        "title": item.get("title", ""),
                        "source_id": item.get("position", ""),
                        "url": item.get("url", ""),
                        "image_url": "", # Organic results might not have image easily accessible
                        "description": item.get("snippet", ""),
                        "source": "google_search"
                    }
                    products.append(product)

        except Exception as e:
            logger.error(f"Error parsing Google results: {e}")
        return products

    def _parse_price(self, price_data: Any) -> Optional[float]:
        """Helper to parse price."""
        if not price_data:
            return None
        if isinstance(price_data, (int, float)):
            return float(price_data)
        if isinstance(price_data, str):
            try:
                # Remove currency symbols and commas
                clean_price = price_data.replace("$", "").replace(",", "").strip()
                return float(clean_price)
            except:
                pass
        return None

