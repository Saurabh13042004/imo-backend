import requests

# Get search results
response = requests.post('http://localhost:8000/api/v1/search', json={'keyword': 'laptop'}, timeout=30)
results = response.json()['results']
print(f'Found {len(results)} products\n')

# Test with first product
product = results[0]
print(f'Testing with: {product["title"][:60]}...')
print(f'Product ID: {product["id"]}')
print(f'Source: {product["source"]}\n')

# Try to get from cache
response = requests.get(f'http://localhost:8000/api/v1/product/{product["id"]}', timeout=5)
print(f'Cache API status: {response.status_code}')
if response.status_code == 200:
    cached = response.json()
    print(f'  Title: {cached.get("title", "N/A")[:50]}...')
    print(f'  Price: ${cached.get("price", "N/A")}')
    print(f'  Source: {cached.get("source", "N/A")}')
    print('\nSUCCESS: Product cache is working!')
else:
    print(f'  Error: {response.text}')
