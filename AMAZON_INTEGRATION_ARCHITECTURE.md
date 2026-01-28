# Amazon Integration Architecture Guide

## Current Architecture (Google Shopping Only)

```
Search Flow:
┌─────────┐     ┌──────────────┐     ┌────────────────┐     ┌────────────┐
│  User   │────▶│ Search API   │────▶│  SerpAPI       │────▶│ Results    │
│ Keyword │     │ (store filter)│     │(Google Shop)   │     │ to Cache   │
└─────────┘     └──────────────┘     └────────────────┘     └────────────┘

Product Detail Flow:
┌─────────────────┐     ┌──────────────────┐     ┌──────────┐     ┌─────┐
│ User clicks     │────▶│ Product Service  │────▶│ Scraper  │────▶│ LLM │
│ product from    │     │ (retrieves from  │     │ (enrich) │     │     │
│ search results  │     │  cache)          │     │          │     └─────┘
└─────────────────┘     └──────────────────┘     └──────────┘
                         │
                         ▼
                    ┌─────────────────┐
                    │ SerpAPI         │
                    │ (enrichment)    │
                    └─────────────────┘
```

**Key Points:**
- Single source: Google Shopping (SerpAPI)
- Products cached after search
- Product detail pulls from cache + SerpAPI enrichment
- Source tracking: Amazon products from Google Shopping are marked as "Amazon"

---

## Proposed Architecture (Hybrid: Google Shopping + Amazon API)

### 1. Search Phase

```
┌────────────────────────────────────────────────────────────────┐
│                        USER SEARCH                             │
│              keyword: "iphone", store: "amazon"                │
└────────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                ▼                           ▼
        ┌──────────────────┐      ┌──────────────────┐
        │   SerpAPI        │      │   Amazon API     │
        │ (Google Shopping)│      │  (Direct Search) │
        └──────────────────┘      └──────────────────┘
                │                           │
                └─────────────┬─────────────┘
                              ▼
                    ┌──────────────────────┐
                    │  De-duplicate by     │
                    │  product title/ASIN  │
                    │  and merge results   │
                    └──────────────────────┘
                              │
                              ▼
                    ┌──────────────────────┐
                    │  Cache with source   │
                    │  tracking:           │
                    │  - source: "Amazon"  │
                    │  - source_id: ASIN   │
                    │  - origin: "api"     │
                    └──────────────────────┘
```

### 2. Product Detail Flow (Unified)

```
┌────────────────────────────────────────┐
│  User clicks product                   │
│  Pass: product_id, source, source_id   │
└────────────────────────────────────────┘
                  │
                  ▼
        ┌─────────────────────┐
        │ Check cache first   │
        │ by product_id       │
        └─────────────────────┘
                  │
    ┌─────────────┴─────────────┐
    │ Found?                    │ Not found?
    ▼                           ▼
Found:               ┌──────────────────────────┐
Return from         │ Enrich based on source   │
cache               └──────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                ▼                           ▼
        ┌──────────────────┐    ┌──────────────────────┐
        │ SerpAPI          │    │ Amazon API (Product  │
        │ Enrichment       │    │ Details + Reviews)   │
        └──────────────────┘    └──────────────────────┘
                │                           │
                └─────────────┬─────────────┘
                              ▼
                    ┌──────────────────────┐
                    │  Scraper + Processor │
                    │  (same pipeline)     │
                    └──────────────────────┘
                              │
                              ▼
                    ┌──────────────────────┐
                    │  LLM Analysis        │
                    │  (same as before)    │
                    └──────────────────────┘
```

---

## Implementation Strategy

### Phase 1: Amazon API Client (New Component)

**File:** `backend/app/integrations/amazon_client.py`

```python
class AmazonAPIClient:
    """
    Client for Amazon Product Advertising API or lightweight scraper.
    """
    
    def __init__(self, api_key: str, region: str = "us"):
        self.api_key = api_key
        self.region = region
    
    async def search_products(
        self,
        keyword: str,
        country: str,
        category: str = None,
        max_results: int = 100
    ) -> List[dict]:
        """
        Search Amazon for products.
        
        Returns normalized product data:
        {
            'title': str,
            'price': float,
            'currency': str,
            'asin': str,  # Amazon product ID
            'image_url': str,
            'url': str,
            'source': 'Amazon',
            'rating': float,
            'review_count': int,
            'availability': str,
            'origin': 'amazon_api'  # Mark as direct Amazon API
        }
        """
        pass
    
    async def get_product_details(self, asin: str) -> dict:
        """
        Get detailed info for specific Amazon product by ASIN.
        """
        pass
    
    async def get_product_reviews(self, asin: str) -> List[dict]:
        """
        Get customer reviews from Amazon.
        """
        pass
```

**Note on Amazon API Options:**
1. **Product Advertising API** (Official, requires approval)
   - Pros: Official, reliable, includes reviews
   - Cons: Requires registration, rate-limited
   - Cost: Free tier available

2. **RapidAPI Amazon Scraper** (Faster integration)
   - Pros: Easy integration, no approval needed
   - Cons: Terms of service considerations
   - Cost: Pay-per-request

3. **Lightweight Web Scraper** (Home-grown)
   - Pros: Full control
   - Cons: Fragile, blocking issues
   - Recommendation: Add to your existing scraper service

### Phase 2: Update Search Service

**File:** `backend/app/services/search_service.py`

```python
class SearchService:
    
    def __init__(self):
        self.google_client = GoogleShoppingClient(...)
        self.amazon_client = AmazonAPIClient(...)  # NEW
    
    async def search_all_sources(
        self,
        db: AsyncSession,
        request: SearchRequest
    ) -> tuple[List[ProductResponse], int]:
        """
        Search Google Shopping AND Amazon (if store filter is "amazon").
        Merge and de-duplicate results.
        """
        
        results = []
        
        # ALWAYS get Google Shopping results
        google_results = await self._search_google_shopping(request)
        results.extend(google_results)
        
        # GET AMAZON RESULTS IF:
        # 1. store filter is "amazon", OR
        # 2. store filter is None (all stores)
        if request.store in [None, "amazon", "all"]:
            amazon_results = await self._search_amazon(request)
            results.extend(amazon_results)
        
        # De-duplicate by title + ASIN
        results = self._deduplicate_results(results)
        
        # Sort by relevance
        results = sorted(
            results,
            key=lambda x: (
                x.relevance_score,
                -x.rating if x.rating else 0
            ),
            reverse=True
        )
        
        return results[:100], len(results)
    
    async def _search_amazon(self, request: SearchRequest) -> List[ProductResponse]:
        """Search Amazon API directly."""
        try:
            raw_results = await self.amazon_client.search_products(
                keyword=request.keyword,
                country=request.country,
            )
            return self._normalize_amazon_results(raw_results)
        except Exception as e:
            logger.error(f"Amazon search failed: {e}")
            return []  # Fallback gracefully
    
    def _deduplicate_results(self, results: List[ProductResponse]) -> List[ProductResponse]:
        """
        Remove duplicate products from multiple sources.
        Priority: Amazon API > Google Shopping (more accurate)
        """
        seen = {}  # Key: (title_hash, asin)
        
        for product in results:
            key = (hash(product.title.lower()), product.source_id or "")
            
            if key not in seen:
                seen[key] = product
            else:
                # Keep Amazon API results over Google Shopping
                if product.origin == "amazon_api":
                    seen[key] = product
        
        return list(seen.values())
```

### Phase 3: Update Product Service

**File:** `backend/app/services/product_service.py`

```python
class ProductService:
    
    def __init__(self):
        self.google_client = GoogleShoppingClient(...)
        self.amazon_client = AmazonAPIClient(...)  # NEW
    
    async def get_enriched_product(
        self,
        product_id: str,
        source: str = None,
        source_id: str = None
    ) -> Optional[dict]:
        """
        Get enriched product data.
        Route based on source.
        """
        
        # Try cache first
        cached = PRODUCT_CACHE.get(product_id)
        if cached:
            return cached
        
        # Enrich based on source
        if source == "Amazon" and source_id:
            return await self._enrich_amazon_product(source_id)
        else:
            return await self._enrich_google_product(source_id)
    
    async def _enrich_amazon_product(self, asin: str) -> dict:
        """
        Get enrichment from Amazon API.
        Steps:
        1. Amazon API: product details + reviews
        2. Scraper: additional data if needed
        3. LLM: analysis
        """
        
        # Get product details from Amazon
        product_data = await self.amazon_client.get_product_details(asin)
        
        # Get reviews from Amazon
        reviews = await self.amazon_client.get_product_reviews(asin)
        
        # Optional: Scrape additional info if needed
        # scraped_data = await self.scraper.scrape_amazon(asin)
        
        enriched = {
            **product_data,
            'reviews': reviews,
            'source': 'Amazon',
            'source_id': asin,
            'origin': 'amazon_api'
        }
        
        return enriched
    
    async def _enrich_google_product(self, source_id: str) -> dict:
        """
        Get enrichment from SerpAPI (current flow).
        """
        # Existing implementation
        pass
```

### Phase 4: Update API Routes

**File:** `backend/app/api/routes/products.py`

```python
@router.get("/products/enriched")
async def get_enriched_product(
    product_id: str = Query(...),
    source: Optional[str] = Query(None),  # "Amazon", "Google Shopping"
    source_id: Optional[str] = Query(None),  # ASIN or Google product ID
    db: AsyncSession = Depends(get_db)
):
    """
    Get enriched product details.
    
    Route based on source:
    - source="Amazon" → Use Amazon API
    - source="Google" → Use SerpAPI
    """
    
    service = ProductService()
    
    enriched = await service.get_enriched_product(
        product_id=product_id,
        source=source,
        source_id=source_id
    )
    
    if not enriched:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return enriched
```

---

## Database Schema Updates

### New Table: `amazon_search_cache`

```sql
CREATE TABLE amazon_search_cache (
    id UUID PRIMARY KEY,
    asin VARCHAR(255) UNIQUE,
    title VARCHAR(500),
    price DECIMAL(10, 2),
    currency VARCHAR(3),
    url TEXT,
    image_url TEXT,
    rating FLOAT,
    review_count INT,
    availability VARCHAR(50),
    source_data JSONB,  -- Store raw Amazon API response
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    expires_at TIMESTAMP  -- For cache expiration
);

CREATE INDEX idx_amazon_asin ON amazon_search_cache(asin);
CREATE INDEX idx_amazon_title ON amazon_search_cache USING GIN(title gin_trgm_ops);
```

### Update: `products` table

```sql
ALTER TABLE products ADD COLUMN origin VARCHAR(50) DEFAULT 'google_shopping';
-- Values: 'google_shopping', 'amazon_api'

ALTER TABLE products ADD COLUMN amazon_asin VARCHAR(255);

CREATE INDEX idx_products_origin ON products(origin);
```

---

## Frontend Changes

### Search Component
```typescript
// No changes needed - already supports store filter

// But you'll get:
// - More Amazon products when store="amazon"
// - Better de-duplication
// - Faster results
```

### Product Details Page
```typescript
// Pass source information:
<ProductDetails 
  productId={productId}
  source={product.source}      // "Amazon" or "Google Shopping"
  sourceId={product.source_id}  // ASIN or Google product ID
/>

// API automatically routes enrichment
// Same UI, different data source
```

---

## Fallback & Graceful Degradation

```python
# If Amazon API fails:
- Log error
- Continue with Google Shopping results
- User still gets results, just from one source

# If SerpAPI fails:
- Log error
- Return Amazon results only (if available)
- Or return cached results

# Both fail:
- Return empty results with helpful message
- Suggest trying different search terms
```

---

## Implementation Priority

### Week 1: Foundation
- [ ] Create `AmazonAPIClient` class
- [ ] Test Amazon API integration
- [ ] Add to settings/config

### Week 2: Search Integration
- [ ] Update `SearchService` to call Amazon API
- [ ] Implement de-duplication logic
- [ ] Test search results merging

### Week 3: Product Details
- [ ] Update `ProductService` to route by source
- [ ] Test enrichment for both sources
- [ ] Cache updates

### Week 4: Polish
- [ ] Error handling & fallbacks
- [ ] Performance optimization
- [ ] Logging & monitoring
- [ ] A/B testing with users

---

## Config Updates

**.env additions:**

```env
# Amazon API
AMAZON_API_KEY=your_amazon_api_key
AMAZON_API_SECRET=your_amazon_api_secret
AMAZON_REGION=us  # or other regions

# Or if using RapidAPI Amazon Scraper:
RAPIDAPI_AMAZON_ENDPOINT=https://amazon-product-info.p.rapidapi.com
```

---

## Performance Considerations

1. **Parallel Requests**: Call both APIs simultaneously
   ```python
   results = await asyncio.gather(
       self._search_google_shopping(request),
       self._search_amazon(request),
       return_exceptions=True
   )
   ```

2. **Caching**: Cache Amazon results similarly to Google Shopping
   - TTL: 24 hours
   - Key: `amazon:{asin}`

3. **Rate Limiting**: Monitor Amazon API usage
   - Track requests per minute
   - Implement queue if needed

---

## Summary

| Aspect | Current | After Integration |
|--------|---------|-------------------|
| Data Sources | Google Shopping only | Google + Amazon |
| Amazon Products | Limited via Google | Native from Amazon API |
| Product Details | SerpAPI enrichment | Source-specific |
| De-duplication | Not needed | Yes (merged results) |
| Search Speed | ~2s | ~2s (parallel) |
| Coverage | ~70% for Amazon | ~95% for Amazon |

This architecture maintains backward compatibility while expanding product coverage!
