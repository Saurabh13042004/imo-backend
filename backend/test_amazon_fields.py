#!/usr/bin/env python3
"""Test script to verify Amazon API fields are being captured correctly."""

import asyncio
import json
import sys
sys.path.insert(0, '/app')

from app.services.search_service import SearchService
from app.schemas import SearchRequest

async def test_amazon_search():
    """Test search to verify url_image and reviews_count are captured."""
    service = SearchService()
    
    # Search for a product
    search_request = SearchRequest(keyword="laptop", zipcode="60607")
    results, count = await service.search_all_sources(None, search_request)
    
    print(f"\n{'='*80}")
    print(f"Found {count} products from Amazon search")
    print(f"{'='*80}\n")
    
    # Check first 3 products
    for i, product in enumerate(results[:3]):
        print(f"Product {i+1}: {product.title}")
        print(f"  Source: {product.source}")
        print(f"  Price: ${product.price}")
        print(f"  Rating: {product.rating}/5")
        print(f"  Reviews: {product.review_count:,}")
        print(f"  Image URL: {product.image_url[:80]}..." if product.image_url else "  Image URL: None")
        print(f"  ASIN: {product.asin}")
        print()

if __name__ == "__main__":
    asyncio.run(test_amazon_search())
