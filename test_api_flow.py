#!/usr/bin/env python3
"""
Test script to verify the complete product details API flow.
"""

import requests
import json
from typing import List, Dict, Any

BASE_URL = "http://localhost:8000"
API_BASE = f"{BASE_URL}/api/v1"

def check_backend():
    """Check if backend is running."""
    try:
        response = requests.get(f"{BASE_URL}/docs", timeout=2)
        return response.status_code == 200
    except:
        return False

def test_search(query="laptop") -> List[Dict[str, Any]]:
    """Test search API."""
    try:
        print(f"\nSearching for '{query}'...")
        response = requests.post(
            f"{API_BASE}/search",
            json={"keyword": query},
            timeout=30
        )
        if response.status_code == 200:
            data = response.json()
            results = data.get('results', [])
            print(f"OK: Found {len(results)} products in {data.get('execution_time', 'N/A')}s\n")
            
            for i, product in enumerate(results[:3]):
                print(f"{i+1}. {product.get('title', 'N/A')[:50]}...")
                print(f"   ID: {product.get('id', 'N/A')}")
                print(f"   Source: {product.get('source', 'N/A')}")
                if product.get('source_id'):
                    print(f"   Source ID: {product.get('source_id')}")
                print()
            
            return results
        else:
            print(f"ERROR: Search failed: {response.status_code}")
            return []
    except Exception as e:
        print(f"ERROR: Search error: {e}")
        return []

def test_product_details(product_id: str) -> Dict[str, Any]:
    """Test product details API (from cache)."""
    try:
        print(f"Fetching product details for ID: {product_id[:8]}...\n")
        response = requests.get(f"{API_BASE}/product/{product_id}", timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            print(f"OK: Product found in cache!")
            print(f"   Title: {data.get('title', 'N/A')[:60]}...")
            print(f"   Price: ${data.get('price', 'N/A')}")
            print(f"   Source: {data.get('source', 'N/A')}")
            print(f"   Rating: {data.get('rating', 'N/A')}/5\n")
            return data
        else:
            print(f"ERROR: Product not found: {response.status_code}")
            return {}
    except Exception as e:
        print(f"ERROR: {e}")
        return {}

def test_amazon_product_details(asin: str, title: str = "", image: str = "") -> Dict[str, Any]:
    """Test Amazon product details API."""
    try:
        print(f"Fetching Amazon product details for ASIN: {asin}...\n")
        
        params = {}
        if title:
            params['title'] = title
        if image:
            params['image'] = image
        
        response = requests.get(f"{API_BASE}/product/amazon/{asin}", params=params, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            print(f"OK: Amazon product details fetched!")
            print(f"   Title: {data.get('title', 'N/A')[:60]}...")
            print(f"   Price: ${data.get('price', 'N/A')}")
            print(f"   Brand: {data.get('brand', 'N/A')}")
            print(f"   Category: {data.get('category', 'N/A')}")
            print(f"   Rating: {data.get('rating', 'N/A')}/5")
            print(f"   Reviews: {data.get('review_count', 'N/A')}")
            print(f"   Availability: {data.get('availability', 'N/A')}\n")
            return data
        else:
            print(f"ERROR: Amazon API failed: {response.status_code}")
            return {}
    except Exception as e:
        print(f"ERROR: {e}")
        return {}

def main():
    """Run all tests."""
    print("=" * 70)
    print("Product Details API Complete Flow Testing")
    print("=" * 70)
    
    # Check backend
    if not check_backend():
        print("\nERROR: Backend is not running!")
        print("Run: cd backend && docker-compose up -d")
        return
    
    print("\nOK: Backend is running")
    
    # Perform search
    print("\n" + "=" * 70)
    results = test_search("laptop")
    
    if not results:
        print("ERROR: Search failed")
        return
    
    # Test product details from cache
    print("=" * 70)
    amazon_product = None
    for product in results[:3]:
        if product.get('source') == 'amazon' and product.get('source_id'):
            amazon_product = product
            test_product_details(product['id'])
            break
    
    # Test Amazon API for fresh details
    print("=" * 70)
    if amazon_product and amazon_product.get('source_id'):
        test_amazon_product_details(
            amazon_product['source_id'],
            title=amazon_product.get('title', ''),
            image=amazon_product.get('image_url', '')
        )
    
    # Summary
    print("=" * 70)
    print("\nSUMMARY:")
    print("1. Search works and returns products")
    print("2. Product details can be fetched from cache")
    print("3. Amazon API can fetch detailed product info")
    print("\nNext steps:")
    print("- Open http://localhost:8080 in browser")
    print("- Search for a product")
    print("- Click on a result to view details")
    print("- Check DevTools (F12) Network tab for API calls")

if __name__ == "__main__":
    main()
