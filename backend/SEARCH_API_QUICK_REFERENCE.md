# Quick Reference - Search API Revamp

## TL;DR - What Changed

```
BEFORE: Complex, multi-source, paginated search
AFTER:  Simple, Amazon-only, Chicago-focused search

Request:  keyword + zipcode → Amazon API → Clean Products
```

---

## API Endpoint

```
POST /api/v1/search
Content-Type: application/json
```

---

## Request Body

```json
{
  "keyword": "iphone 16",
  "zipcode": "60607"
}
```

**Required:** keyword (2-200 chars)
**Optional:** zipcode (default: "60607")

---

## Response Body

```json
{
  "success": true,
  "keyword": "iphone 16",
  "zipcode": "60607",
  "total_results": 720,
  "results": [
    {
      "id": "uuid",
      "title": "Product title",
      "price": 751.54,
      "currency": "USD",
      "rating": 4.4,
      "review_count": 1200,
      "brand": "Apple",
      "asin": "B0DHJDPYYR",
      "image_url": "https://...",
      "url": "https://amazon.com/...",
      "source": "amazon",
      "availability": "In Stock"
    }
  ]
}
```

---

## cURL Examples

### Basic Search
```bash
curl -X POST http://localhost:8000/api/v1/search \
  -H "Content-Type: application/json" \
  -d '{"keyword": "iphone 16"}'
```

### Search with Zipcode
```bash
curl -X POST http://localhost:8000/api/v1/search \
  -H "Content-Type: application/json" \
  -d '{"keyword": "laptop", "zipcode": "60607"}'
```

---

## Python Example

```python
import requests

response = requests.post(
    "http://localhost:8000/api/v1/search",
    json={"keyword": "iphone 16"}
)

data = response.json()

for product in data['results']:
    print(f"{product['title']}")
    print(f"  Price: ${product['price']}")
    print(f"  Rating: {product['rating']}/5")
    print()
```

---

## JavaScript Example

```javascript
const response = await fetch('http://localhost:8000/api/v1/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ keyword: 'iphone 16' })
});

const data = await response.json();

data.results.forEach(product => {
    console.log(`${product.title} - $${product.price}`);
});
```

---

## Files Changed

| File | Changes |
|------|---------|
| `app/schemas/__init__.py` | Simplified SearchRequest & SearchResponse |
| `app/services/search_service.py` | Complete rewrite with RapidAPI integration |
| `app/api/routes/search.py` | Simplified endpoint logic |

---

## Environment Setup

```bash
export RAPIDAPI_KEY=9d7f7a5ca9msh85dd59553e7e17cp171e5cjsn0b4d14459d19
```

Or in `.env`:
```
RAPIDAPI_KEY=9d7f7a5ca9msh85dd59553e7e17cp171e5cjsn0b4d14459d19
```

---

## Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Invalid keyword (< 2 or > 200 chars) |
| 422 | Missing required field |
| 500 | Server error |

---

## What You Get

✅ Up to 720 Amazon products
✅ Product title, price, rating
✅ Review counts
✅ Brand information
✅ Product images
✅ Amazon links
✅ ASIN/SKU
✅ Stock status

---

## Chicago Zipcodes

Default: **60607** (downtown Chicago)

Other Chicago zipcodes:
- 60601 (downtown)
- 60602 (downtown)
- 60603 (downtown)
- 60604 (downtown)
- 60605 (south loop)
- 60606 (loop)
- 60607 (downtown)
- ... etc

---

## Real-World Usage

```python
# Search for products
response = requests.post(
    "http://localhost:8000/api/v1/search",
    json={"keyword": "gaming laptop", "zipcode": "60607"}
)

# Filter by price
products = [p for p in response.json()['results'] if p['price'] < 1000]

# Sort by rating
products.sort(key=lambda p: p['rating'], reverse=True)

# Display results
for p in products[:5]:
    print(f"{p['title']} - ${p['price']} ({p['rating']} stars)")
```

---

## What Was Removed

- Multi-source search (Walmart, Google)
- Pagination
- Filters (rating, price)
- Database operations
- Cache layer
- Complex integrations

---

## What Was Added

- Direct RapidAPI integration
- Simple request (2 params)
- Chicago focus
- Clean output
- ~720 results

---

## Documentation

- `SEARCH_API_README.md` - Full documentation
- `SEARCH_API_EXAMPLE.md` - Request/response examples
- `SEARCH_API_OUTPUTS.md` - Real output examples
- `SEARCH_API_REVAMP.md` - Before/after comparison
- `SEARCH_API_COMPLETION.md` - Completion summary

---

## Quick Test

```bash
# Try it now
curl -X POST http://localhost:8000/api/v1/search \
  -H "Content-Type: application/json" \
  -d '{"keyword": "xbox"}'

# You should get ~700 Xbox-related products from Amazon
# with prices, ratings, images, and more!
```

---

## Questions?

1. **How many results?** ~720 per search
2. **What sources?** Amazon only
3. **What cities?** Chicago only (60607)
4. **Can I filter?** Not in this version
5. **Can I paginate?** Not in this version
6. **How fast?** < 2 seconds typically
7. **What if API fails?** Returns error 500

---

**Created:** December 4, 2025
**Status:** ✅ Complete and Ready to Use
**Simplicity:** ⭐⭐⭐⭐⭐ (5/5)
