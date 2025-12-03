# Search API - Revamped Edition

## Quick Start

### Make a Search Request

```bash
curl -X POST http://localhost:8000/api/v1/search \
  -H "Content-Type: application/json" \
  -d '{"keyword": "iphone 16"}'
```

### Get Results

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
      "price": 751.54,
      "currency": "USD",
      "rating": 4.4,
      "review_count": 1200,
      "brand": "Apple",
      "availability": "In Stock"
    }
  ]
}
```

---

## What Was Removed

We removed everything that wasn't essential:

- ❌ Multiple sources (Walmart, Google Shopping)
- ❌ Pagination parameters (page, page_size)
- ❌ Filtering options (min_rating, max_price)
- ❌ Complex integrations
- ❌ Cache layer
- ❌ Database operations

---

## What We Added

- ✅ **Direct Amazon API integration** via RapidAPI Data Scraper
- ✅ **Simple request**: Just keyword + optional zipcode
- ✅ **Chicago-focused**: Default zipcode is 60607
- ✅ **Clean response**: Only the essential data
- ✅ **Live results**: Up to 720 products from Amazon

---

## How It Works

```
User Request
    ↓
POST /api/v1/search
{
  "keyword": "iphone 16",
  "zipcode": "60607"
}
    ↓
Validate keyword (2-200 chars)
    ↓
Call Amazon Data Scraper API
amazon-data-scraper-api3.p.rapidapi.com/queries
    ↓
Parse Response
- Extract paid results
- Extract organic results
- Get product details (price, rating, reviews, image, etc.)
    ↓
Transform to ProductResponse
- Map asin → source_id
- Map url_image → image_url
- Add UUID, source, availability
    ↓
Return JSON Response
{
  "success": true,
  "keyword": "iphone 16",
  "zipcode": "60607",
  "total_results": 720,
  "results": [...]
}
```

---

## API Specification

### Endpoint
```
POST /api/v1/search
Content-Type: application/json
```

### Request Body

```json
{
  "keyword": "string (required, 2-200 chars)",
  "zipcode": "string (optional, default: 60607)"
}
```

### Response (200 OK)

```json
{
  "success": true,
  "keyword": "iphone 16",
  "zipcode": "60607",
  "total_results": 720,
  "results": [
    {
      "id": "uuid",
      "title": "string",
      "source": "amazon",
      "source_id": "asin",
      "asin": "asin",
      "url": "string",
      "image_url": "url",
      "price": 751.54,
      "currency": "USD",
      "rating": 4.4,
      "review_count": 1200,
      "description": "string",
      "brand": "string",
      "category": "string",
      "availability": "In Stock",
      "created_at": "ISO8601",
      "updated_at": "ISO8601"
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

## Code Changes

### 1. SearchRequest Schema (`app/schemas/__init__.py`)

**Old:**
```python
class SearchRequest(BaseModel):
    query: str
    sources: List[str] = Field(default=["amazon", "walmart", "google_shopping"])
    limit: int = Field(default=20, le=100)
    min_rating: Optional[float] = Field(default=None, ge=0, le=5)
    max_price: Optional[float] = Field(default=None, gt=0)
    location: Optional[str] = None
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)
```

**New:**
```python
class SearchRequest(BaseModel):
    keyword: str = Field(..., description="Search keyword (2-200 characters)")
    zipcode: Optional[str] = Field(default="60607", description="Chicago zipcode (default: 60607)")
```

### 2. SearchResponse Schema (`app/schemas/__init__.py`)

**Old:**
```python
class SearchResponse(BaseModel):
    success: bool
    query: str
    total_results: int
    page: int = 1
    page_size: int = 20
    total_pages: int = 1
    results: List[ProductResponse] = Field(default_factory=list)
```

**New:**
```python
class SearchResponse(BaseModel):
    success: bool
    keyword: str
    zipcode: str
    total_results: int
    results: List[ProductResponse] = Field(default_factory=list)
```

### 3. SearchService (`app/services/search_service.py`)

**Key Changes:**
- Removed: `AmazonClient`, `WalmartClient`, `GoogleShoppingClient` integrations
- Removed: `CacheService` usage
- Removed: All database operations
- Removed: Async orchestration for multiple sources
- Added: Direct HTTP client to RapidAPI

**Main Method:**
```python
async def search_all_sources(
    db: AsyncSession,
    search_request: SearchRequest,
    use_cache: bool = True
) -> tuple[List[ProductResponse], int]:
    """Search Amazon using RapidAPI data scraper."""
```

**New Private Method:**
```python
def _call_amazon_api(self, query: str, zipcode: str) -> List[Dict[str, Any]]:
    """Call Amazon data scraper API via RapidAPI."""
```

### 4. Search Route (`app/api/routes/search.py`)

**Simplified endpoint:**
- Removed: Source validation
- Removed: Complex filter handling
- Removed: Pagination logic
- Kept: Basic keyword validation
- Kept: Error handling

---

## Internal API Flow

### RapidAPI Request
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
    'x-rapidapi-key': settings.RAPIDAPI_KEY,
    'x-rapidapi-host': "amazon-data-scraper-api3.p.rapidapi.com",
    'Content-Type': "application/json"
}

conn.request("POST", "/queries", payload, headers)
res = conn.getresponse()
data = res.read()
response = json.loads(data.decode("utf-8"))
```

### RapidAPI Response Structure
```json
{
  "results": [
    {
      "content": {
        "results": {
          "paid": [
            {
              "asin": "B0BW5VKLQD",
              "price": 22.99,
              "title": "...",
              "rating": 4.7,
              "currency": "USD",
              "url_image": "...",
              "reviews_count": 289
            }
          ],
          "organic": [
            {
              "asin": "B0DHJDPYYR",
              "price": 751.54,
              "title": "...",
              "rating": 4.4,
              "currency": "USD",
              "url": "...",
              "url_image": "...",
              "reviews_count": 1200
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

## Configuration

### Environment Variable

Set your RapidAPI key:

```bash
export RAPIDAPI_KEY=9d7f7a5ca9msh85dd59553e7e17cp171e5cjsn0b4d14459d19
```

Or in `.env`:
```
RAPIDAPI_KEY=9d7f7a5ca9msh85dd59553e7e17cp171e5cjsn0b4d14459d19
```

---

## Examples

### Example 1: Search for iPhones
```bash
curl -X POST http://localhost:8000/api/v1/search \
  -H "Content-Type: application/json" \
  -d '{"keyword": "iphone 16"}'
```

### Example 2: Search for laptops in Chicago
```bash
curl -X POST http://localhost:8000/api/v1/search \
  -H "Content-Type: application/json" \
  -d '{
    "keyword": "laptop",
    "zipcode": "60607"
  }'
```

### Example 3: Python
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
for product in data['results']:
    print(f"{product['title']} - ${product['price']}")
```

### Example 4: JavaScript
```javascript
const response = await fetch('http://localhost:8000/api/v1/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    keyword: 'iphone 16',
    zipcode: '60607'
  })
});

const data = await response.json();
console.log(data);
```

---

## Documentation Files

- `SEARCH_API_EXAMPLE.md` - Full API documentation with request/response examples
- `SEARCH_API_REVAMP.md` - Before/after comparison and implementation details
- `tests/test_search_demo.py` - Interactive demo showing the API flow

---

## Benefits of This Revamp

1. **Simpler**: Only 2 parameters instead of 8
2. **Faster**: No database, no caching complexity
3. **Cleaner**: Direct API integration
4. **Focused**: Amazon only, Chicago only
5. **Maintainable**: Less code, fewer moving parts
6. **Testable**: Predictable, single data source
7. **Scalable**: Can easily add more zipcodes or sources later

---

## Next Steps (Optional)

If you want to extend this API later:
- Add multiple zipcodes support
- Add result sorting options
- Add category filters
- Add rating filters
- Add price range filters
- Cache results for performance
- Add pagination support
- Support multiple cities

But for now, it's **simple, clean, and focused** - which is exactly what you asked for! 🎉
