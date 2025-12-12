#!/usr/bin/env python3
"""
Test script to verify Google Shopping immersive product fields are captured.
Run this after searching for a product to verify the fields are present.
"""

import asyncio
import json
from app.services.search_service import SearchService
from app.schemas import SearchRequest

async def test_google_shopping_fields():
    """Test that Google Shopping results include immersive product fields."""
    service = SearchService()
    
    # Search for a product that will return Google Shopping results
    search_request = SearchRequest(keyword="office chair", zipcode="60607")
    results, count = await service.search_all_sources(None, search_request)
    
    print(f"\n{'='*80}")
    print(f"Google Shopping Integration Test")
    print(f"{'='*80}\n")
    print(f"Total products found: {count}\n")
    
    # Check for Google Shopping results with immersive product fields
    google_shopping_products = [p for p in results if p.source != "amazon"]
    
    if not google_shopping_products:
        print("⚠️  No Google Shopping products found in results")
        return
    
    print(f"Found {len(google_shopping_products)} Google Shopping products\n")
    
    # Check first 3 products for immersive fields
    for i, product in enumerate(google_shopping_products[:3]):
        print(f"\nProduct {i+1}:")
        print(f"  Title: {product.title[:60]}...")
        print(f"  Source: {product.source}")
        print(f"  Price: ${product.price:.2f}" if product.price else "  Price: N/A")
        print(f"  Rating: {product.rating}/5" if product.rating else "  Rating: N/A")
        print(f"  Reviews: {product.review_count:,}")
        print(f"  Image URL: {product.image_url[:70]}..." if product.image_url else "  Image URL: None")
        
        # Check for immersive product fields
        has_token = bool(product.immersive_product_page_token)
        has_link = bool(product.immersive_product_api_link)
        
        print(f"\n  Immersive Product Fields:")
        print(f"    ✅ Token present: {has_token}")
        if has_token:
            token_preview = product.immersive_product_page_token[:50] + "..."
            print(f"       {token_preview}")
        
        print(f"    ✅ API Link present: {has_link}")
        if has_link:
            link_preview = product.immersive_product_api_link[:80] + "..."
            print(f"       {link_preview}")
        
        if has_token and has_link:
            print(f"\n  ✅ READY FOR DETAILED PRODUCT FETCH")
        else:
            print(f"\n  ⚠️  Missing immersive product fields")

    print(f"\n{'='*80}\n")

if __name__ == "__main__":
    print("Testing Google Shopping immersive product field capture...\n")
    asyncio.run(test_google_shopping_fields())
