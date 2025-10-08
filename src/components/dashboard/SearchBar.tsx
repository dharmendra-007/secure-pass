'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

function debounce(
  func: (query: string) => void,
  delay: number

): (query: string) => void {
  let timeoutId: NodeJS.Timeout | undefined;
  
  return (query: string) => {
    clearTimeout(timeoutId);
    
    timeoutId = setTimeout(() => func(query), delay);
  };
}


interface SearchBarProps {
  currentSearchTerm: string; 
  onSearch: (query: string) => void; 
  debounceDelay?: number;
}

export function SearchBar({ currentSearchTerm, onSearch, debounceDelay = 1000 }: SearchBarProps) {
  const [query, setQuery] = useState(currentSearchTerm); 
  useEffect(() => {

      if (currentSearchTerm !== query) {
          setQuery(currentSearchTerm);
      }
  }, [currentSearchTerm]);


  
  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      onSearch(searchQuery);
    }, debounceDelay),
    [onSearch, debounceDelay]
  );

  useEffect(() => {
    debouncedSearch(query);
    
    return () => {
    };
  }, [query, debouncedSearch]); 

  const handleClear = () => {
    setQuery(''); 
    onSearch(''); 
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value); 
  };

  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      <Input
        type="text"
        placeholder="Search passwords... "
        value={query}
        onChange={handleChange} 
        className="pl-10 pr-10"
      />
      {query && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
        >
          ×
        </Button>
      )}
    </div>
  );
}