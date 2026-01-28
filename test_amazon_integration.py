"""Test script for Amazon integration."""

import asyncio
import httpx
from app.integrations.amazon_shopping import AmazonShoppingClient


async def test_amazon_search():
    """Test Amazon search functionality."""
    
    # Replace with your actual SerpAPI key
    API_KEY = "465ff37a096004d0ce887825818f671b53cc49df588cd8ef6a47b5c992920efa"
    
    client = AmazonShoppingClient(API_KEY)
    
    # Test 1: Search for products
    print("\n" + "="*70)
    print("TEST 1: Amazon Product Search")
    print("="*70)
    
    try:
        results = await client.search(
            keyword="coffee maker",
            amazon_domain="amazon.com",
            language="en_US",
            page=1
        )
        
        print(f"\nStatus: {results.get('search_metadata', {}).get('status')}")
        print(f"Total Results: {len(results.get('organic_results', []))}")
        
        # Show first 3 products
        for i, product in enumerate(results.get('organic_results', [])[:3], 1):
            print(f"\n{i}. {product.get('title', 'N/A')}")
            print(f"   Price: {product.get('price', 'N/A')}")
            print(f"   Rating: {product.get('rating', 'N/A')} ⭐")
            print(f"   Reviews: {product.get('reviews', 0)}")
            print(f"   ASIN: {product.get('asin', 'N/A')}")
            print(f"   Prime: {product.get('is_prime', False)}")
            
    except Exception as e:
        print(f"❌ Search test failed: {e}")
    
    # Test 2: Get product details by ASIN
    print("\n" + "="*70)
    print("TEST 2: Amazon Product Details by ASIN")
    print("="*70)
    
    try:
        # Using a real product ASIN (coffee maker)
        product_data = await client.get_product(
            asin="B072MQ5BRX",
            amazon_domain="amazon.com"
        )
        
        status = product_data.get('search_metadata', {}).get('status')
        print(f"\nStatus: {status}")
        
        if status == "Success":
            product = product_data.get('product_result', {})
            print(f"\nTitle: {product.get('title', 'N/A')}")
            print(f"Price: {product.get('price', 'N/A')}")
            print(f"Rating: {product.get('rating', 'N/A')} ⭐")
            print(f"Reviews: {product.get('reviews', 0)}")
            print(f"Description: {product.get('description', 'N/A')[:200]}...")
            
            # Show reviews
            reviews = product_data.get('reviews', [])
            print(f"\nTop Reviews ({len(reviews)} total):")
            for i, review in enumerate(reviews[:2], 1):
                print(f"\n  {i}. {review.get('title', 'No title')}")
                print(f"     Rating: {review.get('rating', 0)} ⭐")
                print(f"     By: {review.get('reviewer', 'Anonymous')}")
        
    except Exception as e:
        print(f"❌ Product details test failed: {e}")
    
    # Test 3: Normalization
    print("\n" + "="*70)
    print("TEST 3: Result Normalization")
    print("="*70)
    
    try:
        results = await client.search(
            keyword="laptop",
            amazon_domain="amazon.com",
            page=1
        )
        
        sample_result = results.get('organic_results', [{}])[0]
        if sample_result:
            normalized = AmazonShoppingClient.normalize_search_result(sample_result)
            print(f"\nOriginal Result Keys: {list(sample_result.keys())}")
            print(f"\nNormalized Result:")
            print(f"  Title: {normalized.get('title')}")
            print(f"  Price: {normalized.get('price')}")
            print(f"  Currency: {normalized.get('currency')}")
            print(f"  Source: {normalized.get('source')}")
            print(f"  ASIN (source_id): {normalized.get('source_id')}")
            print(f"  Origin: {normalized.get('origin')}")
        
    except Exception as e:
        print(f"❌ Normalization test failed: {e}")
    
    print("\n" + "="*70)
    print("All tests completed!")
    print("="*70)


if __name__ == "__main__":
    asyncio.run(test_amazon_search())
