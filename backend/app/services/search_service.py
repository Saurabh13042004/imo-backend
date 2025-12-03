"""Search service for product aggregation."""

import logging
import http.client
import json
from datetime import datetime
from uuid import uuid4
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas import SearchRequest, ProductResponse
from app.config import settings

logger = logging.getLogger(__name__)


class SearchService:
    """Service for searching products across multiple sources."""

    def __init__(self):
        self.rapidapi_key = settings.RAPIDAPI_KEY

    async def search_all_sources(
        self,
        db: AsyncSession,
        search_request: SearchRequest,
        use_cache: bool = True
    ) -> tuple[List[ProductResponse], int]:
        """Search Amazon using RapidAPI data scraper."""
        try:
            # Use default Chicago zipcode if not provided
            zipcode = search_request.zipcode or "60607"
            
            # Call Amazon data scraper API
            results = self._call_amazon_api(search_request.keyword, zipcode)
            
            # Convert results to ProductResponse objects
            product_responses = []
            for result in results:
                try:
                    product_response = ProductResponse(
                        id=str(uuid4()),
                        title=result.get("title", ""),
                        source="amazon",
                        source_id=result.get("asin", ""),
                        asin=result.get("asin"),
                        url=result.get("url"),
                        image_url=result.get("url_image"),
                        price=result.get("price"),
                        currency=result.get("currency", "USD"),
                        rating=result.get("rating"),
                        review_count=result.get("reviews_count", 0),
                        description=result.get("title"),
                        brand=result.get("manufacturer", ""),
                        category="",
                        availability="In Stock",
                        created_at=datetime.utcnow(),
                        updated_at=datetime.utcnow()
                    )
                    product_responses.append(product_response)
                    logger.debug(f"Created ProductResponse: {product_response.title}")
                except Exception as item_error:
                    logger.error(f"Error creating ProductResponse: {item_error}", exc_info=True)
                    continue

            logger.info(f"Retrieved {len(product_responses)} products for keyword: {search_request.keyword}")
            return product_responses, len(product_responses)

        except Exception as e:
            logger.error(f"Error in search_all_sources: {e}", exc_info=True)
            return [], 0

    def _call_amazon_api(self, query: str, zipcode: str) -> List[Dict[str, Any]]:
        """Call Amazon data scraper API via RapidAPI."""
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
        """Get product by ID."""
        return None

    async def get_product_by_source(
        self,
        db: AsyncSession,
        source: str,
        source_id: str
    ) -> Optional[ProductResponse]:
        """Get product by source and source_id."""
        return None
