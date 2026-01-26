import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLocation } from '@/contexts/LocationContext';
import { storeCountry } from '@/utils/locationUtils';

export const useSearchUrl = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get location from context (singleton - initialized once at app level)
  const { zipcode: contextZipcode, country: contextCountry, city: contextCity, isDetectingLocation } = useLocation();
  
  // Get query and geo parameters from URL search params
  // Use context location with fallbacks
  const query = searchParams.get('q') || '';
  const country = searchParams.get('country') || contextCountry;
  const city = searchParams.get('city') || contextCity || '';
  const language = searchParams.get('language') || 'en';
  const store = searchParams.get('store') || null;
  const zipcode = searchParams.get('zipcode') || contextZipcode;
  
  const updateSearchUrl = (
    searchQuery: string, 
    newZipcode?: string,
    newCountry?: string,
    newCity?: string,
    newLanguage?: string,
    newStore?: string | null
  ) => {
    const finalZipcode = newZipcode || zipcode;
    const finalCountry = newCountry || country;
    const finalCity = newCity || city;
    const finalLanguage = newLanguage || language;
    const finalStore = newStore !== undefined ? newStore : store;
    
    if (searchQuery.trim()) {
      const trimmedQuery = searchQuery.trim();
      // Persist values to localStorage
      localStorage.setItem('userZipcode', finalZipcode);
      storeCountry(finalCountry);  // Use utility function
      localStorage.setItem('userCity', finalCity);
      localStorage.setItem('userLanguage', finalLanguage);
      if (finalStore) localStorage.setItem('userStore', finalStore);
      
      const params = new URLSearchParams();
      params.set('q', trimmedQuery);
      params.set('country', finalCountry);
      params.set('zipcode', finalZipcode);
      // Only include city if it's explicitly provided in this search
      if (newCity) params.set('city', newCity);
      if (finalLanguage !== 'en') params.set('language', finalLanguage);
      if (finalStore) params.set('store', finalStore);
      
      navigate(`/search?${params.toString()}`);
    } else {
      setSearchParams({});
    }
  };
  
  const clearSearch = () => {
    setSearchParams({});
  };
  
  const setQuery = (newQuery: string | null, newZipcode?: string, newCountry?: string, newCity?: string) => {
    if (newQuery) {
      updateSearchUrl(newQuery, newZipcode, newCountry, newCity);
    } else {
      clearSearch();
    }
  };

  const updateZipcode = (newZipcode: string) => {
    localStorage.setItem('userZipcode', newZipcode);
    if (query) {
      updateSearchUrl(query, newZipcode, country, city, language);
    }
  };

  const updateCountry = (newCountry: string) => {
    storeCountry(newCountry);  // Use utility function
    // Clear city when country changes to avoid mismatch
    localStorage.removeItem('userCity');
    if (query) {
      updateSearchUrl(query, zipcode, newCountry, '', language);
    }
  };

  const updateCity = (newCity: string) => {
    localStorage.setItem('userCity', newCity);
    if (query) {
      updateSearchUrl(query, zipcode, country, newCity, language);
    }
  };

  const updateLanguage = (newLanguage: string) => {
    localStorage.setItem('userLanguage', newLanguage);
    if (query) {
      updateSearchUrl(query, zipcode, country, city, newLanguage);
    }
  };

  const updateStore = (newStore: string | null) => {
    if (newStore) {
      localStorage.setItem('userStore', newStore);
    } else {
      localStorage.removeItem('userStore');
    }
    if (query) {
      updateSearchUrl(query, zipcode, country, city, language, newStore);
    }
  };
  
  return {
    query,
    zipcode,
    country,
    city,
    language,
    store,
    updateSearchUrl,
    clearSearch,
    setQuery,
    updateZipcode,
    updateCountry,
    updateCity,
    updateLanguage,
    updateStore,
    isDetectingLocation
  };
};