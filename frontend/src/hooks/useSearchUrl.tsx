import { useNavigate, useSearchParams } from 'react-router-dom';

export const useSearchUrl = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get query from URL search params
  const query = searchParams.get('q') || '';
  
  const updateSearchUrl = (searchQuery: string) => {
    if (searchQuery.trim()) {
      const trimmedQuery = searchQuery.trim();
      setSearchParams({ q: trimmedQuery });
      // Navigate to search page if not already there
      navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`);
    } else {
      setSearchParams({});
    }
  };
  
  const clearSearch = () => {
    setSearchParams({});
  };
  
  const setQuery = (newQuery: string | null) => {
    if (newQuery) {
      updateSearchUrl(newQuery);
    } else {
      clearSearch();
    }
  };
  
  return {
    query,
    updateSearchUrl,
    clearSearch,
    setQuery
  };
};