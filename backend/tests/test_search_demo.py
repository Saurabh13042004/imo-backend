#!/usr/bin/env python3
"""
Quick test to demonstrate the simplified search API.
This shows the flow from request to response.
"""

import json
from datetime import datetime

# Example 1: Simple request with keyword only
print("=" * 80)
print("EXAMPLE 1: Search with keyword only (uses default Chicago zipcode)")
print("=" * 80)

request_1 = {
    "keyword": "iphone 16"
}

print("\nRequest:")
print(json.dumps(request_1, indent=2))

response_1 = {
    "success": True,
    "keyword": "iphone 16",
    "zipcode": "60607",
    "total_results": 720,
    "results": [
        {
            "id": "550e8400-e29b-41d4-a716-446655440000",
            "title": "Apple iPhone 16 Pro, US Version, 256GB, Black Titanium - Unlocked (Renewed)",
            "source": "amazon",
            "source_id": "B0DHJDPYYR",
            "asin": "B0DHJDPYYR",
            "url": "/Apple-iPhone-Version-256GB-Titanium/dp/B0DHJDPYYR/",
            "image_url": "https://m.media-amazon.com/images/I/4101oi4UvtL._AC_UY218_.jpg",
            "price": 751.54,
            "currency": "USD",
            "rating": 4.4,
            "review_count": 1200,
            "description": "Apple iPhone 16 Pro, US Version, 256GB, Black Titanium - Unlocked (Renewed)",
            "brand": "Apple",
            "category": "",
            "availability": "In Stock",
            "created_at": "2025-12-04T00:00:00",
            "updated_at": "2025-12-04T00:00:00"
        },
        {
            "id": "660e8400-e29b-41d4-a716-446655440001",
            "title": "Apple iPhone 16, US Version, 128GB, Black - Unlocked (Renewed)",
            "source": "amazon",
            "source_id": "B0DHJH2GZL",
            "asin": "B0DHJH2GZL",
            "url": "/Apple-iPhone-16-Version-128GB/dp/B0DHJH2GZL/",
            "image_url": "https://m.media-amazon.com/images/I/71QkWOSDkmL._AC_UY218_.jpg",
            "price": 609.97,
            "currency": "USD",
            "rating": 4.6,
            "review_count": 625,
            "description": "Apple iPhone 16, US Version, 128GB, Black - Unlocked (Renewed)",
            "brand": "Apple",
            "category": "",
            "availability": "In Stock",
            "created_at": "2025-12-04T00:00:00",
            "updated_at": "2025-12-04T00:00:00"
        }
    ]
}

print("\nResponse (showing first 2 results out of 720):")
print(json.dumps(response_1, indent=2))

# Example 2: Request with explicit zipcode
print("\n" + "=" * 80)
print("EXAMPLE 2: Search with explicit Chicago zipcode")
print("=" * 80)

request_2 = {
    "keyword": "macbook pro",
    "zipcode": "60607"
}

print("\nRequest:")
print(json.dumps(request_2, indent=2))

print("\nResponse structure (same format as Example 1)")
print("- success: true")
print("- keyword: macbook pro")
print("- zipcode: 60607")
print("- total_results: 450 (example)")
print("- results: [ ... product list ... ]")

# Example 3: Error handling
print("\n" + "=" * 80)
print("EXAMPLE 3: Error - Invalid keyword (less than 2 characters)")
print("=" * 80)

request_3 = {
    "keyword": "a"
}

print("\nRequest:")
print(json.dumps(request_3, indent=2))

error_response_3 = {
    "success": False,
    "error": "Invalid search keyword. Must be 2-200 characters."
}

print("\nError Response:")
print(json.dumps(error_response_3, indent=2))

# Example 4: Show API flow
print("\n" + "=" * 80)
print("EXAMPLE 4: Internal API Flow")
print("=" * 80)

print("""
1. Client sends:
   {
     "keyword": "iphone 16",
     "zipcode": "60607"
   }

2. API validates keyword (2-200 chars) ✓

3. Backend calls Amazon Data Scraper API via RapidAPI:
   POST https://amazon-data-scraper-api3.p.rapidapi.com/queries
   {
     "source": "amazon_search",
     "query": "iphone 16",
     "geo_location": "60607",
     "domain": "com",
     "parse": true
   }

4. Amazon API returns ~720 results with:
   - Paid/Sponsored products
   - Organic search results
   - Product details (price, rating, reviews, image, etc.)

5. Backend parses and transforms to ProductResponse:
   - Extracts: asin, price, title, rating, reviews_count, etc.
   - Creates: id (UUID), source ("amazon"), availability ("In Stock")
   - Returns clean JSON response

6. Client receives:
   {
     "success": true,
     "keyword": "iphone 16",
     "zipcode": "60607",
     "total_results": 720,
     "results": [...]
   }
""")

print("=" * 80)
print("API is now simplified and focused on Amazon searches in Chicago!")
print("=" * 80)
