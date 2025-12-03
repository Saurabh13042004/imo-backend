import asyncio
import pytest
from unittest.mock import AsyncMock, patch
from app.services.search_service import SearchService
from app.schemas import SearchRequest

@pytest.fixture
def mock_amazon_client():
    client = AsyncMock()
    client.search.return_value = [
        {"title": "Amazon Product 1", "source_id": "a1", "price": 10.0, "rating": 4.5},
        {"title": "Amazon Product 2", "source_id": "a2", "price": 20.0, "rating": 4.0}
    ]
    return client

@pytest.fixture
def mock_walmart_client():
    client = AsyncMock()
    client.search.return_value = [] # Walmart disabled
    return client

@pytest.fixture
def mock_google_client():
    client = AsyncMock()
    client.search.return_value = [
        {"title": "Google Product 1", "source_id": "g1", "price": 12.0, "rating": 4.8}
    ]
    return client

def test_search_aggregation(mock_amazon_client, mock_walmart_client, mock_google_client):
    async def run_test():
        with patch("app.services.search_service.AmazonClient", return_value=mock_amazon_client), \
             patch("app.services.search_service.WalmartClient", return_value=mock_walmart_client), \
             patch("app.services.search_service.GoogleShoppingClient", return_value=mock_google_client):
            
            service = SearchService()
            request = SearchRequest(query="test", sources=["amazon", "walmart", "google_shopping"])
            
            results, total = await service.search_all_sources(None, request)
            
            # Should have Amazon and Google results, but NO Walmart results
            assert total == 3
            assert len(results) == 3
            assert results[0].source == "amazon"
            # results[2] was walmart, now it should be google
            assert results[2].source == "google_shopping"
    
    asyncio.run(run_test())

def test_search_pagination(mock_amazon_client):
    async def run_test():
        # Mock returning many results
        mock_amazon_client.search.return_value = [
            {"title": f"Product {i}", "source_id": f"p{i}", "price": 10.0} for i in range(50)
        ]
        
        with patch("app.services.search_service.AmazonClient", return_value=mock_amazon_client), \
             patch("app.services.search_service.WalmartClient", return_value=AsyncMock(search=AsyncMock(return_value=[]))), \
             patch("app.services.search_service.GoogleShoppingClient", return_value=AsyncMock(search=AsyncMock(return_value=[]))):
            
            service = SearchService()
            
            # Page 1
            request = SearchRequest(query="test", sources=["amazon"], page=1, page_size=20)
            results, total = await service.search_all_sources(None, request)
            assert total == 50
            assert len(results) == 20
            assert results[0].title == "Product 0"
            assert results[19].title == "Product 19"
            
            # Page 2
            request = SearchRequest(query="test", sources=["amazon"], page=2, page_size=20)
            results, total = await service.search_all_sources(None, request)
            assert total == 50
            assert len(results) == 20
            assert results[0].title == "Product 20"
            
            # Page 3 (partial)
            request = SearchRequest(query="test", sources=["amazon"], page=3, page_size=20)
            results, total = await service.search_all_sources(None, request)
            assert total == 50
            assert len(results) == 10
            assert results[0].title == "Product 40"

    asyncio.run(run_test())

def test_search_location(mock_amazon_client):
    async def run_test():
        with patch("app.services.search_service.AmazonClient", return_value=mock_amazon_client), \
             patch("app.services.search_service.WalmartClient", return_value=AsyncMock(search=AsyncMock(return_value=[]))), \
             patch("app.services.search_service.GoogleShoppingClient", return_value=AsyncMock(search=AsyncMock(return_value=[]))):
            
            service = SearchService()
            request = SearchRequest(query="test", sources=["amazon"], location="10001")
            
            await service.search_all_sources(None, request)
            
            mock_amazon_client.search.assert_called_with("test", 50, "10001")

    asyncio.run(run_test())
