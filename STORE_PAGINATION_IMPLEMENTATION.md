# Store Pagination Implementation

## Overview
Implemented automatic store pagination in the `/api/v1/product/enriched/{product_id}` endpoint to fetch more stores from SerpAPI based on user type and subscription status.

## Key Features

### 1. **Pagination Function** (`fetch_stores_with_pagination`)
- Fetches stores from SerpAPI with automatic pagination
- Uses `next_page_token` from SerpAPI response to fetch subsequent pages
- Stops when reaching the user's store limit or when no more pages are available
- Includes comprehensive logging for debugging

**Parameters:**
- `client`: httpx AsyncClient for making HTTP requests
- `base_api_link`: Initial SerpAPI endpoint URL
- `api_key`: SerpAPI API key
- `max_stores`: Maximum number of stores to fetch (based on user type)
- `product_id`: Product ID for logging

**Returns:**
- List of store dictionaries (up to max_stores limit)

### 2. **Store Limit Function** (`get_store_limit`)
Determines maximum stores based on user type:
- **Guest users** (no authentication): **10 stores**
- **Free registered users**: **25 stores**
- **Premium/Trial users**: **100 stores**

Uses the same pattern as `SearchLimitService` to check subscription status.

### 3. **Enhanced Endpoint** (`get_enriched_product_details`)

**Changes:**
- Added `db` dependency to access database for user subscription checks
- Added `current_user` dependency for user authentication
- Determines store limit based on user type
- Automatically fetches paginated stores if initial response doesn't meet the limit

**Request Flow:**
1. User requests enriched product details
2. Endpoint checks user authentication and subscription status
3. Determines appropriate store limit
4. Makes initial SerpAPI call
5. If more stores are needed, uses pagination to fetch additional pages
6. Stops when reaching the limit or no more pages available
7. Returns enriched data with all fetched stores

## How SerpAPI Pagination Works

```
Initial Request:
GET https://serpapi.com/search.json?engine=google_immersive_product&page_token=...&api_key=...

Response includes:
{
  "product_results": {
    "stores": [... 2-5 stores ...],
    "stores_next_page_token": "FzEnmnica15aklmSk7o1ODG3uDQvXcE9MSexolIh2MhEwdR9SXF-USbz4ty8fC4ATaQPNA"
  }
}

Next Page Request:
GET https://serpapi.com/search.json?engine=google_immersive_product&page_token=...&next_page_token=FzEnmnica15aklmSk7o1ODG3uDQvXcE9MSexolIh2MhEwdR9SXF-USbz4ty8fC4ATaQPNA&api_key=...

This returns more stores with a new token for the next page
```

## Logging
All pagination activity is logged with `[Pagination]` and `[Enriched]` prefixes for easy debugging:
- Page number and number of stores fetched
- Total stores accumulated
- When limit is reached or no more pages available
- Any errors during pagination (with fallback to returning partial results)

## Benefits

1. **User-aware store limits**: Different user types get different numbers of stores
2. **Automatic pagination**: No need for frontend to handle pagination logic
3. **Efficient fetching**: Stops as soon as the limit is reached
4. **Graceful degradation**: If pagination fails after initial fetch, returns partial results
5. **Comprehensive logging**: Easy to monitor and debug
6. **Database integration**: Properly checks user subscription status

## Example Usage

### Guest User
```typescript
// Frontend makes request without authentication
const response = await fetch('/api/v1/product/enriched/product-id', {
  method: 'POST',
  body: JSON.stringify({
    immersive_api_link: 'https://serpapi.com/search.json?...'
  })
});
// Returns up to 10 stores
```

### Premium User
```typescript
// Frontend makes authenticated request with Premium subscription
const response = await fetch('/api/v1/product/enriched/product-id', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer token...'
  },
  body: JSON.stringify({
    immersive_api_link: 'https://serpapi.com/search.json?...'
  })
});
// Returns up to 100 stores (as many as available)
```

## Testing Checklist

- [ ] Guest user receives 10 stores maximum
- [ ] Free registered user receives 25 stores maximum
- [ ] Premium user receives 100 stores (or all available)
- [ ] Pagination correctly uses `stores_next_page_token`
- [ ] Stops pagination when limit is reached
- [ ] Logs are informative for debugging
- [ ] Error handling works correctly
- [ ] Review date normalization still works after pagination
