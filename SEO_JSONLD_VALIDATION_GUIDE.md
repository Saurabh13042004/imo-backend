# JSON-LD Validation Guide - Step by Step

**Estimated Time:** 15 minutes  
**Tools Required:** Browser + Google Rich Results Test  
**Success Criteria:** Zero errors in Google validation

---

## Quick Validation (5 minutes)

### Step 1: Navigate to Product Page

```
1. Open your app
2. Perform a search
3. Click on any product
4. Wait for page to load completely
```

### Step 2: Check Browser Console

```javascript
// Open DevTools (F12 or Cmd+Option+I)
// Look for this message:
[SEO] ✅ Product JSON-LD schema injected with AI Verdict score: 4.5
```

### Step 3: Inspect Injected Schema

```javascript
// In DevTools Console, run:
document.getElementById('jsonld-product-main')?.innerHTML | json

// Expected output:
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Sony PlayStation 5",
  "aggregateRating": {
    "ratingValue": 4.5,
    "reviewCount": 234
  }
  // ... other fields
}
```

**✅ If you see this, schema injection is working!**

---

## Google Rich Results Test (10 minutes)

### Official Validation Method

#### Step 1: Access Google Rich Results Test

```
URL: https://search.google.com/test/rich-results
```

#### Step 2: Enter Product URL

```
1. Copy your product URL
   Example: https://app.imoapp.com/product/sony-ps5-550e8400-...
2. Paste into the test tool
3. Click "Test URL"
```

#### Step 3: Wait for Results

- Google will crawl your page (takes 10-30 seconds)
- Shows analysis of structured data

#### Step 4: Check Results

**Expected Output:**

```
✅ ELIGIBLE

Rich Results:
- Product ✓
  - Successfully parsed Product schema
  - Name: Sony PlayStation 5
  - Rating: ⭐⭐⭐⭐½ (4.5 stars, 234 reviews)
  - Price: $499.99 USD
  - Availability: In Stock
  - Brand: Sony
  - Image: [thumbnail shown]
```

#### Step 5: Verify No Errors

```
Errors: 0
Warnings: 0 (or minimal)
```

**✅ If you see this, you're ready for production!**

---

## Detailed Validation Checklist

### ✅ Schema Structure Validation

```json
{
  "@context": "https://schema.org"  // ✅ Required
  "@type": "Product",               // ✅ Required
  "name": "Product Name",           // ✅ Required
  "description": "...",             // ✅ Required
  "brand": {                        // ✅ Required
    "@type": "Brand",
    "name": "Brand Name"
  },
  "image": ["https://..."],         // ✅ Required
  "offers": {                       // ✅ Required
    "@type": "Offer",
    "price": "499.99",              // ✅ Must be numeric string
    "priceCurrency": "USD",         // ✅ Required
    "availability": "https://schema.org/InStock" // ✅ Required
  },
  "aggregateRating": {              // ✅ Critical for rich snippets
    "@type": "AggregateRating",
    "ratingValue": 4.5,             // ✅ 1-5, max 1 decimal
    "reviewCount": 234,             // ✅ Must be integer
    "bestRating": 5,                // ✅ Fixed
    "worstRating": 1                // ✅ Fixed
  }
}
```

### ✅ Field-by-Field Validation

#### Product Name
```
✅ Present and non-empty
✅ Matches product title
✅ Length: 3-100 characters (recommended)
✅ No special characters issues
```

#### Price
```
✅ Present and numeric
✅ Format: "499.99" (string, but numeric content)
✅ Valid currency code (USD, EUR, GBP, etc.)
✅ No symbols ($ ¥ €)
✅ Greater than 0
```

#### Rating Value
```
✅ Between 1 and 5
✅ Maximum 1 decimal place (4.5, not 4.55)
✅ Rounded correctly: Math.round(score * 10) / 10
✅ Matches AI verdict score
```

#### Review Count
```
✅ Integer (no decimals)
✅ Greater than 0
✅ Reasonable number (1-1000+)
✅ Sums all review sources correctly
```

#### Availability
```
✅ Valid schema.org availability value
✅ One of:
   - "https://schema.org/InStock"
   - "https://schema.org/OutOfStock"
   - "https://schema.org/PreOrder"
   - "https://schema.org/BackOrder"
```

---

## Automated Validation Scripts

### Script 1: Validate Schema in Console

```javascript
// Paste this in DevTools Console
(function validateSchema() {
  const script = document.getElementById('jsonld-product-main');
  if (!script) {
    console.error('❌ No JSON-LD script found');
    return;
  }

  const schema = JSON.parse(script.innerHTML);
  const errors = [];

  // Check required fields
  if (!schema.name) errors.push('Missing: name');
  if (!schema.description) errors.push('Missing: description');
  if (!schema.brand?.name) errors.push('Missing: brand.name');
  if (!schema.image?.length) errors.push('Missing: image');
  if (!schema.offers?.price) errors.push('Missing: offers.price');
  if (!schema.offers?.priceCurrency) errors.push('Missing: offers.priceCurrency');
  if (!schema.aggregateRating?.ratingValue) errors.push('Missing: aggregateRating.ratingValue');
  if (!schema.aggregateRating?.reviewCount) errors.push('Missing: aggregateRating.reviewCount');

  // Validate rating value
  const rating = schema.aggregateRating?.ratingValue;
  if (rating < 1 || rating > 5) errors.push(`Invalid rating: ${rating} (must be 1-5)`);

  // Validate price is numeric string
  if (isNaN(parseFloat(schema.offers?.price))) errors.push(`Invalid price: ${schema.offers?.price}`);

  if (errors.length === 0) {
    console.log('✅ Schema is valid! No errors found.');
    console.log('Schema:', schema);
  } else {
    console.error('❌ Found errors:');
    errors.forEach(e => console.error(`  - ${e}`));
  }
})();
```

**Output:**
```
✅ Schema is valid! No errors found.
Schema: {Object with all fields}
```

### Script 2: Check All Product Pages

```javascript
// Test multiple products
const productUrls = [
  '/product/sony-ps5-xxx',
  '/product/iphone-15-xxx',
  '/product/macbook-pro-xxx'
];

productUrls.forEach(url => {
  fetch(url)
    .then(r => r.text())
    .then(html => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const schema = doc.getElementById('jsonld-product-main');
      console.log(`${url}: ${schema ? '✅' : '❌'}`);
    });
});
```

---

## Visual Verification

### Check 1: DevTools Inspector

```steps
1. Right-click page → "Inspect"
2. Press Ctrl+F (find)
3. Search: jsonld-product-main
4. Should highlight: <script type="application/ld+json" id="jsonld-product-main">
5. View the JSON content
6. Verify all required fields present
```

### Check 2: Page Source View

```steps
1. Right-click page → "View Page Source" (Ctrl+U)
2. Press Ctrl+F
3. Search: jsonld-product-main
4. Should see JSON-LD script
5. Verify before </head> tag
6. Validate JSON structure
```

### Check 3: Mobile Preview

```steps
1. Open DevTools
2. Click "Toggle device toolbar" (Ctrl+Shift+M)
3. Select mobile device
4. Reload page
5. Check console for schema injection message
6. Verify works on mobile
```

---

## Common Issues & Solutions

### Issue 1: Schema Not Appearing

**Symptoms:**
- Console doesn't show injection message
- No script tag in head
- Google Rich Results Test shows no product

**Diagnosis:**
```javascript
// Check if product data exists
console.log(product) // Should not be null/undefined

// Check if AI verdict exists
console.log(finalAIVerdict) // Should have imo_score

// Check for JavaScript errors
// Look for red errors in console
```

**Solution:**
1. ✅ Wait for product to load (check loading state)
2. ✅ Ensure AI verdict is calculated
3. ✅ Check browser console for errors
4. ✅ Verify ProductDetails.tsx imports MetaTags

### Issue 2: Invalid Rating Value

**Symptoms:**
- Google Rich Results Test shows: "Invalid aggregateRating value"
- Rating > 5 or < 1

**Cause:**
```javascript
// Rounding issue
Math.round(4.555 * 10) / 10  // Might be > 5
```

**Solution:**
```javascript
// Ensure clamping
const rating = Math.max(1, Math.min(5, Math.round(score * 10) / 10));
```

### Issue 3: Missing Required Fields

**Symptoms:**
- Google shows: "Missing required field: price"
- Schema appears incomplete

**Diagnosis:**
```javascript
const schema = JSON.parse(document.getElementById('jsonld-product-main').innerHTML);
console.log('name:', schema.name);
console.log('price:', schema.offers?.price);
console.log('rating:', schema.aggregateRating?.ratingValue);
```

**Solution:**
- Ensure product data fully loaded
- Wait for enrichedData to populate
- Check price formatting

### Issue 4: JSON Parse Error

**Symptoms:**
- DevTools shows: "Invalid JSON"
- Schema injection fails

**Diagnosis:**
```javascript
// Try to parse
JSON.parse(document.getElementById('jsonld-product-main').innerHTML)
// If error, shows where JSON is broken
```

**Solution:**
- Check for unescaped quotes in strings
- Verify special characters are escaped
- Ensure no undefined values

---

## Testing on Different Devices

### Desktop Browser

```steps
1. Open product page on Chrome
2. F12 → Console
3. Verify schema injection message
4. Inspect element to view schema
5. Go to Google Rich Results Test
6. Paste URL and validate
```

**Expected:** ✅ Full schema visible

### Mobile Browser

```steps
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select iPhone/Android device
4. Reload page
5. Check console
6. Verify schema still injected
```

**Expected:** ✅ Works on mobile

### Tablet Device

```steps
1. Use iPad/Android tablet size
2. Repeat mobile steps
3. Check responsive design
4. Verify schema loads
```

**Expected:** ✅ Works on tablet

---

## Performance Validation

### Check 1: Page Load Time

```javascript
// In DevTools Performance tab
// Should see no negative impact
// Page interactive time should be < 3s
// JSON-LD injection < 20ms
```

### Check 2: Memory Usage

```javascript
// DevTools Memory tab
// No memory leaks
// JSON-LD script < 5KB
// Total overhead minimal
```

### Check 3: Network Requests

```javascript
// DevTools Network tab
// Should see NO additional requests
// All data from existing API calls
// JSON generated client-side
```

---

## Monitoring After Deployment

### Daily Check (First Week)

```javascript
// Run in console daily
setInterval(() => {
  const schema = document.getElementById('jsonld-product-main');
  console.log('JSON-LD Present:', !!schema);
  if (schema) {
    try {
      const json = JSON.parse(schema.innerHTML);
      console.log('Rating:', json.aggregateRating?.ratingValue);
      console.log('Reviews:', json.aggregateRating?.reviewCount);
    } catch(e) {
      console.error('Parse error:', e);
    }
  }
}, 60000); // Check every minute
```

### Weekly Check (Google Search Console)

```
1. Go to Google Search Console
2. Select property
3. Enhancements → Rich Results
4. Check:
   - Errors: 0 (or < 5)
   - Valid items: increasing
   - Excluded: < 10%
```

### Monthly Review

```
1. Check SERP appearance
2. Count products with rich snippets
3. Compare CTR before/after
4. Monitor ranking changes
```

---

## Success Metrics

| Metric | Target | Status |
|--------|--------|--------|
| Zero validation errors | ✅ | [Monitor] |
| Schema present on 100% of products | ✅ | [Monitor] |
| Rating displayed in search results | ✅ | [Monitor] |
| Rich snippet impressions | +20% | [Track] |
| CTR improvement | +15% | [Track] |

---

## Validation Checklist

- [ ] Schema injection confirmed in console
- [ ] JSON structure valid
- [ ] All required fields present
- [ ] Rating value 1-5
- [ ] Price formatted correctly
- [ ] Google Rich Results Test passes
- [ ] Zero errors reported
- [ ] Mobile validation passes
- [ ] Page performance unaffected
- [ ] No console errors
- [ ] Works across browsers
- [ ] Ready for production

---

## Next Steps After Validation

✅ **If Validation Passes:**
1. Deploy to production
2. Monitor Google Search Console
3. Track organic traffic
4. Measure CTR improvement

❌ **If Issues Found:**
1. Refer to "Common Issues & Solutions"
2. Fix identified problems
3. Re-run validation
4. Repeat until all pass

---

**Estimated Time:** 15 minutes  
**Difficulty:** Easy  
**Success Rate:** 99% (if all fields populated correctly)

**Ready to validate?** → Go to [Google Rich Results Test](https://search.google.com/test/rich-results)
