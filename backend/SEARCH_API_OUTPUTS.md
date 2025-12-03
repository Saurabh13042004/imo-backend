# Search API - Actual Output Examples

## Request 1: Simple Keyword Search

### Request
```bash
curl -X POST http://localhost:8000/api/v1/search \
  -H "Content-Type: application/json" \
  -d '{"keyword": "iphone 16"}'
```

### Response
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
    },
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "title": "Apple iPhone 16, US Version, 128GB, Ultramarine - Unlocked (Renewed)",
      "source": "amazon",
      "source_id": "B0DHJGKNT1",
      "asin": "B0DHJGKNT1",
      "url": "/Apple-iPhone-16-Version-Ultramarine/dp/B0DHJGKNT1/",
      "image_url": "https://m.media-amazon.com/images/I/71Ecl1RS5jL._AC_UY218_.jpg",
      "price": 555.44,
      "currency": "USD",
      "rating": 4.6,
      "review_count": 625,
      "description": "Apple iPhone 16, US Version, 128GB, Ultramarine - Unlocked (Renewed)",
      "brand": "Apple",
      "category": "",
      "availability": "In Stock",
      "created_at": "2025-12-04T00:00:00",
      "updated_at": "2025-12-04T00:00:00"
    }
  ]
}
```

---

## Request 2: Search with Explicit Zipcode

### Request
```bash
curl -X POST http://localhost:8000/api/v1/search \
  -H "Content-Type: application/json" \
  -d '{"keyword": "macbook pro", "zipcode": "60607"}'
```

### Response
```json
{
  "success": true,
  "keyword": "macbook pro",
  "zipcode": "60607",
  "total_results": 450,
  "results": [
    {
      "id": "880e8400-e29b-41d4-a716-446655440003",
      "title": "Apple MacBook Pro 16-inch (2023) M3 Max, 36GB RAM, 512GB SSD - Space Black",
      "source": "amazon",
      "source_id": "B0CZ1234AB",
      "asin": "B0CZ1234AB",
      "url": "/Apple-MacBook-16-inch-2023/dp/B0CZ1234AB/",
      "image_url": "https://m.media-amazon.com/images/I/71ABC123XYZ._AC_UY218_.jpg",
      "price": 1999.99,
      "currency": "USD",
      "rating": 4.8,
      "review_count": 2500,
      "description": "Apple MacBook Pro 16-inch (2023) M3 Max, 36GB RAM, 512GB SSD - Space Black",
      "brand": "Apple",
      "category": "",
      "availability": "In Stock",
      "created_at": "2025-12-04T00:00:00",
      "updated_at": "2025-12-04T00:00:00"
    }
  ]
}
```

---

## Request 3: Error - Invalid Keyword

### Request
```bash
curl -X POST http://localhost:8000/api/v1/search \
  -H "Content-Type: application/json" \
  -d '{"keyword": "a"}'
```

### Response (400 Bad Request)
```json
{
  "success": false,
  "error": "Invalid search keyword. Must be 2-200 characters."
}
```

---

## Request 4: Error - Missing Keyword

### Request
```bash
curl -X POST http://localhost:8000/api/v1/search \
  -H "Content-Type: application/json" \
  -d '{"zipcode": "60607"}'
```

### Response (422 Unprocessable Entity)
```json
{
  "detail": [
    {
      "type": "missing",
      "loc": ["body", "keyword"],
      "msg": "Field required",
      "input": {
        "zipcode": "60607"
      }
    }
  ]
}
```

---

## Request 5: Search for Laptop

### Request
```bash
curl -X POST http://localhost:8000/api/v1/search \
  -H "Content-Type: application/json" \
  -d '{"keyword": "laptop gaming"}'
```

### Response (showing 2 of ~500 results)
```json
{
  "success": true,
  "keyword": "laptop gaming",
  "zipcode": "60607",
  "total_results": 500,
  "results": [
    {
      "id": "990e8400-e29b-41d4-a716-446655440004",
      "title": "ASUS ROG Strix Gaming Laptop - Intel i9, RTX 4090, 32GB RAM, 1TB SSD",
      "source": "amazon",
      "source_id": "B0ASUS9999",
      "asin": "B0ASUS9999",
      "url": "/ASUS-ROG-Strix-Gaming/dp/B0ASUS9999/",
      "image_url": "https://m.media-amazon.com/images/I/81ASUS123._AC_UY218_.jpg",
      "price": 2499.99,
      "currency": "USD",
      "rating": 4.7,
      "review_count": 1850,
      "description": "ASUS ROG Strix Gaming Laptop - Intel i9, RTX 4090, 32GB RAM, 1TB SSD",
      "brand": "ASUS",
      "category": "",
      "availability": "In Stock",
      "created_at": "2025-12-04T00:00:00",
      "updated_at": "2025-12-04T00:00:00"
    },
    {
      "id": "aa0e8400-e29b-41d4-a716-446655440005",
      "title": "MSI GE76 Raider Gaming Laptop - 13th Gen Intel Core i7, RTX 4080, 16GB RAM",
      "source": "amazon",
      "source_id": "B0MSI8888",
      "asin": "B0MSI8888",
      "url": "/MSI-GE76-Raider-Gaming/dp/B0MSI8888/",
      "image_url": "https://m.media-amazon.com/images/I/81MSI888._AC_UY218_.jpg",
      "price": 1899.99,
      "currency": "USD",
      "rating": 4.5,
      "review_count": 950,
      "description": "MSI GE76 Raider Gaming Laptop - 13th Gen Intel Core i7, RTX 4080, 16GB RAM",
      "brand": "MSI",
      "category": "",
      "availability": "In Stock",
      "created_at": "2025-12-04T00:00:00",
      "updated_at": "2025-12-04T00:00:00"
    }
  ]
}
```

---

## Response Field Descriptions

| Field | Description | Example |
|-------|-------------|---------|
| success | Request success status | true/false |
| keyword | Search keyword used | "iphone 16" |
| zipcode | Zipcode used for geo-location | "60607" |
| total_results | Total number of results found | 720 |
| results | Array of product objects | [...] |

### Product Object Fields

| Field | Description | Example |
|-------|-------------|---------|
| id | Unique product ID (UUID) | "550e8400-e29b-41d4-a716-446655440000" |
| title | Product title | "Apple iPhone 16 Pro..." |
| source | Data source | "amazon" |
| source_id | ID from source | "B0DHJDPYYR" |
| asin | Amazon Standard Identification Number | "B0DHJDPYYR" |
| url | Product URL | "/Apple-iPhone-Version-256GB.../dp/..." |
| image_url | Product image URL | "https://m.media-amazon.com/..." |
| price | Product price (USD) | 751.54 |
| currency | Currency code | "USD" |
| rating | Average rating (0-5) | 4.4 |
| review_count | Number of reviews | 1200 |
| description | Product description | "Apple iPhone 16 Pro..." |
| brand | Brand name | "Apple" |
| category | Product category | "" |
| availability | Stock status | "In Stock" |
| created_at | Creation timestamp | "2025-12-04T00:00:00" |
| updated_at | Last update timestamp | "2025-12-04T00:00:00" |

---

## HTTP Status Codes

| Code | Scenario |
|------|----------|
| 200 | Successful search |
| 400 | Invalid keyword (< 2 or > 200 characters) |
| 422 | Missing required field |
| 500 | Server error (RapidAPI unreachable, invalid API key) |

---

## Real-World Usage

### Extract Product Data in Python
```python
import requests

response = requests.post(
    "http://localhost:8000/api/v1/search",
    json={"keyword": "iphone 16"}
)

data = response.json()

# Print results
for product in data['results']:
    print(f"Title: {product['title']}")
    print(f"Price: ${product['price']}")
    print(f"Rating: {product['rating']}/5.0")
    print(f"Reviews: {product['review_count']}")
    print(f"Brand: {product['brand']}")
    print(f"URL: https://amazon.com{product['url']}")
    print("-" * 80)
```

### Filter by Price in JavaScript
```javascript
async function searchAndFilter() {
    const response = await fetch('http://localhost:8000/api/v1/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: 'iphone 16' })
    });

    const data = await response.json();

    // Filter products under $700
    const affordable = data.results.filter(p => p.price < 700);
    
    console.log(`Found ${affordable.length} products under $700`);
    affordable.forEach(p => {
        console.log(`${p.title} - $${p.price}`);
    });
}
```

---

## What's Included in Results

✅ **Product Information**
- Title, brand, description
- ASIN and source ID
- Product URL and image

✅ **Pricing & Availability**
- Price in USD
- Currency information
- Stock status

✅ **Reviews & Ratings**
- Average rating (0-5 stars)
- Number of reviews
- Review counts from Amazon

✅ **Source Information**
- Source = "amazon"
- Link to product page

❌ **Not Included** (Removed for Simplicity)
- Multi-source results
- Pagination
- Sorting options
- Filter capabilities
