# PRODUCT DETAILS API - COMPLETE SETUP & USAGE GUIDE

## What Was Just Implemented

You now have a complete product details system that:
1. Searches for products across Amazon and Google Shopping
2. Caches products with unique IDs during search
3. Allows clicking on products to view detailed information
4. For Amazon products, fetches real-time detailed data from Amazon API
5. Uses localStorage as fallback if API cache is empty

## Quick Start (3 Steps)

### 1. Start the Backend
```bash
cd backend
docker-compose up -d
```

### 2. Start the Frontend
```bash
cd frontend
npm run dev
```

### 3. Open Browser and Test
```
http://localhost:8080
```

## How to Use

### Step 1: Search for a Product
- Go to http://localhost:8080
- In the search bar, type a product name (e.g., "laptop", "phone", "headphones")
- Wait 2-5 seconds for results to load
- Results will show products from multiple sources with prices and images

### Step 2: View Product Details
- Click "View Product" on any search result
- Product details page will load with:
  - Full product title
  - Price
  - Product image
  - Source (Amazon, Best Buy, Walmart, etc.)
  - Rating and review count
  - Brand and category
  - Availability status
  - Link to view on source retailer

### Step 3: Verify It's Working
Open Browser DevTools (Press F12) and go to Network tab:
- You should see requests to `/api/v1/search` when searching
- You should see requests to `/api/v1/product/amazon/{asin}` when viewing Amazon products
- Console should show messages like "Saved search results to localStorage: X products"

## Example Product IDs (Use After Searching)

After performing a search, you can navigate directly to product URLs like:
```
http://localhost:8080/product/618d89a1-aa24-488e-989d-0931aec40f1e
```

**Important**: Product IDs are generated during search, so you MUST search first before navigating directly.

## API Endpoints Reference

### 1. Search for Products
**Endpoint**: `POST /api/v1/search`

**Request**:
```json
{
  "keyword": "laptop"
}
```

**Response**:
```json
{
  "success": true,
  "results": [
    {
      "id": "uuid-string",
      "title": "Product Title",
      "price": 999.99,
      "image_url": "https://...",
      "source": "amazon",
      "source_id": "ASIN",
      "site_rating": 4.5,
      "reviews_count": 120,
      "product_url": "https://...",
      "created_at": "2025-12-08T...",
      "description": "...",
      "url": "https://..."
    }
  ],
  "execution_time": 3.2
}
```

### 2. Get Product from Cache
**Endpoint**: `GET /api/v1/product/{product_id}`

**Response**: Same ProductResponse format as above

### 3. Get Amazon Product Details (Real-time)
**Endpoint**: `GET /api/v1/product/amazon/{asin}`

**Query Parameters** (optional):
- `title`: Product title for context
- `image`: Image URL for fallback

**Response**: ProductResponse with enhanced Amazon data (brand, category, detailed availability)

### 4. Debug Cache Status
**Endpoint**: `GET /api/v1/debug/cache`

**Response**:
```json
{
  "cache_size": 57,
  "cache_keys": ["uuid1", "uuid2", "..."],
  "source_cache_size": 57,
  "source_cache_keys": ["amazon:ASIN1", "google_shopping:id1", "..."]
}
```

## Technical Architecture

### Frontend Flow
```
User clicks "Search"
    ↓
Frontend calls: POST /api/v1/search
    ↓
Backend searches Amazon + Google (2-5 seconds)
    ↓
Results returned with UUIDs and cached
    ↓
localStorage saves results
    ↓
User clicks "View Product"
    ↓
Navigate to /product/{uuid}
    ↓
ProductDetails.tsx loads:
  1. Check localStorage for product info
  2. If Amazon, fetch from /api/v1/product/amazon/{asin}
  3. Render product details
```

### Backend Architecture
```
Search Request
    ↓
ThreadPoolExecutor starts 3 threads:
  - Amazon API search
  - Google Shopping API search
  - [Reserved for future sources]
    ↓
Results combine and deduplicate
    ↓
Each product gets UUID
    ↓
Cache populated with PRODUCT_CACHE dict
    ↓
Return results to frontend
    ↓
Frontend stores in localStorage
```

### Data Flow: Product Details
```
User clicks product → Product ID in URL
    ↓
Frontend checks localStorage (from search)
    ↓
If Amazon product:
  → Fetch from /api/v1/product/amazon/{asin}
  → Get real-time data from Amazon
  → Merge with cached data
    ↓
Display product details
```

## File Structure

```
backend/
  app/
    api/
      routes/
        products.py          [UPDATED] Product detail endpoints
    services/
      product_service.py    [NEW] Amazon product fetching
      search_service.py     [Cache management]
frontend/
  src/
    pages/
      ProductDetails.tsx    [UPDATED] Product detail page with smart loading
    components/search/
      ProductGrid.tsx       [UPDATED] Saves results to localStorage
  vite.config.ts           [UPDATED] Added API proxy
```

## Troubleshooting

### Issue: "Invalid Product ID" Error
**Cause**: Navigating directly to `/product/{id}` without searching first
**Solution**: 
1. Go to http://localhost:8080/search
2. Search for a product
3. Click on a result
4. Then you can navigate between products

### Issue: No API Calls in Network Tab
**Check**:
1. Is backend running? `docker-compose ps` in backend folder
2. Is frontend running? Should see "ready in Xms" in terminal
3. Open browser console (F12) - check for error messages
4. Look in Network tab for requests to `/api/v1/search`

### Issue: Product Shows but Missing Details
**Cause**: Amazon API fetch failed (slow network or API issue)
**Solution**:
1. Page shows cached data from search
2. Refresh the page to retry Amazon API
3. Check backend logs: `docker-compose logs api`

### Issue: Backend not responding
**Solution**:
```bash
cd backend
docker-compose ps                  # Check if containers running
docker-compose logs api            # Check API logs
docker-compose restart api         # Restart API container
```

### Issue: Frontend not hot-reloading
**Cause**: Changes to vite.config.ts require restart
**Solution**:
1. Stop: Press Ctrl+C in frontend terminal
2. Start: `npm run dev`

## Performance Notes

- **Search**: 2-5 seconds (parallel execution of 2+ APIs)
- **Product Details from Cache**: <100ms
- **Amazon API Fetch**: 1-3 seconds (depends on network)
- **localStorage**: Instant (available while browser tab open)

## Browser DevTools Usage

### To verify search is working:
1. Open http://localhost:8080
2. Press F12 to open DevTools
3. Go to Network tab
4. Clear network log (Ctrl+L)
5. Type search query and search
6. Look for POST request to `/api/v1/search`
7. Click on it and view Response to see product list

### To verify product details API:
1. Click on a product from search results
2. In DevTools Network tab (should still be open)
3. Look for GET request to `/api/v1/product/amazon/{asin}`
4. View Response to see detailed product data
5. In Console tab, should see log messages about localStorage

## Success Indicators

✅ You'll know it's working when:
- Search results appear in 2-5 seconds
- Clicking "View Product" navigates to detail page
- Product details load with title, price, image, brand, category
- DevTools shows API calls happening
- Console shows "Saved search results to localStorage: X products"
- Page refresh still shows product details
- Amazon products show additional details (rating, reviews, availability)

## Next Development Steps

Consider adding:
1. **Caching Layer**: Redis for persistent cache across restarts
2. **Reviews**: Fetch and display product reviews
3. **Price Tracking**: Store historical prices
4. **Comparisons**: Compare multiple products side-by-side
5. **Wishlist**: Save favorite products
6. **Search History**: Remember past searches
7. **Filters**: Filter by price, rating, brand
8. **Pagination**: Show more results

## Support

If something isn't working:
1. Check backend logs: `docker-compose logs api -f`
2. Check browser console (F12)
3. Check Network tab for failed requests
4. Restart backend: `docker-compose restart`
5. Restart frontend: Stop (Ctrl+C) and `npm run dev`

Enjoy your product details API!
