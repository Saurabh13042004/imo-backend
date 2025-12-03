# Search API - Revamped (Simplified)

## Overview
The search API has been revamped to be **simpler and more focused**:
- Takes only **keyword** and **zipcode** as parameters
- Uses **Chicago only** (default zipcode: 60607)
- Calls the **Amazon Data Scraper API** via RapidAPI
- Returns clean, standardized product data

---

## API Request

### Endpoint
```
POST /api/v1/search
```

### Request Body
```json
{
  "keyword": "iphone 16",
  "zipcode": "60607"
}
```

### Parameters
- **keyword** (string, required): Search keyword (2-200 characters)
- **zipcode** (string, optional): Chicago zipcode (default: "60607")

---

## API Response

### Success Response (200 OK)
```json
{
  "success": true,
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
```

### Error Response (400 Bad Request)
```json
{
  "success": false,
  "error": "Invalid search keyword. Must be 2-200 characters."
}
```

### Error Response (500 Internal Server Error)
```json
{
  "success": false,
  "error": "Search failed. Please try again."
}
```

---

## Amazon Data Scraper API - Raw Response

The backend calls this API internally:

```python
import http.client
import json

conn = http.client.HTTPSConnection("amazon-data-scraper-api3.p.rapidapi.com")

payload = json.dumps({
    "source": "amazon_search",
    "query": "iphone 16",
    "geo_location": "60607",
    "domain": "com",
    "parse": True
})

headers = {
    'x-rapidapi-key': "9d7f7a5ca9msh85dd59553e7e17cp171e5cjsn0b4d14459d19",
    'x-rapidapi-host': "amazon-data-scraper-api3.p.rapidapi.com",
    'Content-Type': "application/json"
}

conn.request("POST", "/queries", payload, headers)
res = conn.getresponse()
data = res.read()

response = json.loads(data.decode("utf-8"))
```

### Raw API Response Structure
```json
{
  "results": [
    {
      "content": {
        "url": "https://www.amazon.com/s?k=iphone+16&page=1",
        "query": "iphone 16",
        "results": {
          "paid": [
            {
              "asin": "B0BW5VKLQD",
              "price": 22.99,
              "title": "iPhone 17 16 Charger Fast Charging...",
              "rating": 4.7,
              "currency": "USD",
              "url_image": "https://...",
              "reviews_count": 289,
              "sales_volume": "1K+ bought in past month"
            }
          ],
          "organic": [
            {
              "asin": "B0DHJDPYYR",
              "price": 751.54,
              "title": "Apple iPhone 16 Pro...",
              "rating": 4.4,
              "currency": "USD",
              "url": "/Apple-iPhone-Version-256GB-Titanium/dp/B0DHJDPYYR/",
              "url_image": "https://...",
              "reviews_count": 1200,
              "shipping_information": "FREE delivery Mon, Dec 8"
            }
          ]
        },
        "total_results_count": 720
      }
    }
  ]
}
```

---

## Changes Made

### Removed
- ❌ Multiple source support (walmart, google_shopping)
- ❌ Pagination (page, page_size)
- ❌ Filters (min_rating, max_price)
- ❌ Database integrations (ProductClient, AmazonClient, WalmartClient, GoogleShoppingClient)
- ❌ Cache service calls

### Added
- ✅ Direct Amazon Data Scraper API integration
- ✅ Simpler request schema (keyword + zipcode)
- ✅ Chicago-only support (zipcode: 60607)
- ✅ Clean response structure

### Files Modified
1. **app/schemas/__init__.py** - Updated SearchRequest and SearchResponse
2. **app/services/search_service.py** - Completely rewritten to use Amazon API
3. **app/api/routes/search.py** - Simplified endpoint with new parameters

---

## Example Usage

### cURL
```bash
curl -X POST "http://localhost:8000/api/v1/search" \
  -H "Content-Type: application/json" \
  -d '{"keyword": "iphone 16", "zipcode": "60607"}'
```

### Python
```python
import requests

response = requests.post(
    "http://localhost:8000/api/v1/search",
    json={
        "keyword": "iphone 16",
        "zipcode": "60607"
    }
)

data = response.json()
print(data)
```

### JavaScript
```javascript
fetch('http://localhost:8000/api/v1/search', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    keyword: 'iphone 16',
    zipcode: '60607'
  })
})
.then(res => res.json())
.then(data => console.log(data))
```

---

## Notes
- The API returns up to 720 total results from Amazon
- Results are sorted by relevance (Amazon's default)
- Both paid (sponsored) and organic results are included
- All prices are in USD
- Rating scale is 0-5 stars
- Availability is hardcoded to "In Stock" (can be enhanced later)
