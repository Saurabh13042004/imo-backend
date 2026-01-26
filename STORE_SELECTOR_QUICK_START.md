# Store Selector - Quick Reference

## What Was Added

A store filtering feature that lets users select a preferred retailer (Amazon, Walmart, eBay, etc.) when searching for products.

## User Flow

1. **Open Search Page** → Click the 🌐 globe icon
2. **Location Panel Opens** → 4 dropdowns appear:
   - Country (existing)
   - City (existing)
   - Language (existing)
   - **Store** (NEW) ← select Amazon, Walmart, etc.
3. **Select Store** → Default is "All Stores"
4. **Search** → Results filtered to selected store

## Available Stores

- 🏪 **All Stores** (default - no filter)
- 🛍️ **Amazon**
- 🛒 **Walmart**
- 📦 **eBay**
- 📱 **Best Buy**
- 🏗️ **Home Depot**
- 🔨 **Lowe's**
- 🎯 **Target**
- 📊 **Costco**

## How It Works

### Frontend → Backend
```
User selects: Amazon
     ↓
URL becomes: /search?q=laptop&store=amazon
     ↓
Search request sent: {"keyword": "laptop", "store": "amazon"}
```

### Backend → SerpAPI
```
Store parameter: amazon
     ↓
Query modified: "laptop site:amazon.com"
     ↓
SerpAPI searches: Google Shopping for "laptop site:amazon.com"
     ↓
Results returned: Only Amazon products
```

## Testing

### Quick Test - Amazon Only
```bash
curl -X POST http://localhost:8000/api/v1/search \
  -H "Content-Type: application/json" \
  -d '{"keyword": "iphone", "store": "amazon"}'
```

### Quick Test - All Stores
```bash
curl -X POST http://localhost:8000/api/v1/search \
  -H "Content-Type: application/json" \
  -d '{"keyword": "iphone", "store": null}'
```

## Files Changed

### Backend (3 files)
- `backend/app/schemas/__init__.py` - Add `store` field
- `backend/app/integrations/google_shopping.py` - Filter by store
- `backend/app/services/search_service.py` - Pass store through
- `backend/app/api/routes/search.py` - Log store in response

### Frontend (5 files)
- `frontend/src/components/search/SharedSearchInput.tsx` - Store selector UI
- `frontend/src/hooks/useSearchUrl.tsx` - Store in URL
- `frontend/src/hooks/useProductSearch.tsx` - Pass to API
- `frontend/src/integrations/fastapi.ts` - API schema
- `frontend/src/pages/Search.tsx` - Use store in search

## Key Features

✅ Store selector in location panel  
✅ Default to "All Stores"  
✅ URL parameter persistence  
✅ localStorage caching  
✅ Works with geo-targeting (country, city, language)  
✅ Works with all search limits  
✅ SerpAPI integration via domain filtering  

## Adding More Stores

To add a new store:

1. **Frontend** (`SharedSearchInput.tsx`):
   ```tsx
   const STORES = [
     // ... existing ...
     { value: 'new_store', label: '🏷️ New Store Name' },
   ];
   ```

2. **Backend** (`google_shopping.py`):
   ```python
   store_mapping = {
       # ... existing ...
       "new_store": "New Store Name",
   }
   
   store_domains = {
       # ... existing ...
       "new_store": "newstore.com",
   }
   ```

## Logs to Check

When debugging, look for these log messages:

```
[SearchService] Starting search:
  Keyword: iphone
  Store Filter: amazon

[GoogleShoppingClient] Applying store filter: Amazon

[SerpAPI Request] Final parameters:
  q: iphone site:amazon.com
  ...
```

## Notes

- Store filtering doesn't affect search limits (you still have 3 free searches)
- Works in all countries and languages
- Results may vary by store availability in the selected location
- Store filter is optional (null/None = all stores)
- "All Stores" is the default behavior

---

## Need More Details?

See: `STORE_SELECTOR_IMPLEMENTATION.md` for complete technical documentation.
