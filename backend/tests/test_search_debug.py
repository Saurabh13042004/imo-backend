from app.services.search_service import SearchService

def test_instantiation():
    service = SearchService()
    assert service is not None
