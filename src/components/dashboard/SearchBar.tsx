// SearchBar.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Debounce utility function
function debounce(
  func: (query: string) => void,
  delay: number
): (query: string) => () => void { // <-- Function returns a cleanup function
  let timeoutId: NodeJS.Timeout | undefined;
  
  return (query: string) => {
    // Clear previous timeout on every call
    clearTimeout(timeoutId);
    
    timeoutId = setTimeout(() => func(query), delay);

    // Return a cleanup function
    return () => clearTimeout(timeoutId);
  };
}


interface SearchBarProps {
  currentSearchTerm: string; // The last SUCCESSFULLY searched term (for initialization/external clear)
  onSearch: (query: string) => void; 
  debounceDelay?: number;
}

export function SearchBar({ currentSearchTerm, onSearch, debounceDelay = 300 }: SearchBarProps) {
  // 1. Initialize internal state from the prop. DO NOT use an effect to sync it later.
  //    This means the input value will only match currentSearchTerm on mount/initial load.
  const [query, setQuery] = useState(currentSearchTerm); 

  // 2. We still need to update the visual input when an *external* action changes the term (like the clear button).
  //    We'll handle this by making the handleClear function also reset the query state.

  // 3. Debounce the API call handler (onSearch)
  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      onSearch(searchQuery); 
    }, debounceDelay),
    [onSearch, debounceDelay]
  );

  useEffect(() => {
    // 4. Trigger the debounced function whenever the internal input query changes
    const cleanup = debouncedSearch(query);
    
    // 5. Explicitly return the cleanup function provided by the debouncer
    return cleanup; 
  }, [query, debouncedSearch]); 
  
  // NOTE: REMOVED the problematic useEffect that watched [currentSearchTerm].

  const handleClear = () => {
    setQuery(''); 
    // This immediately calls the parent's state setter and triggers a search for an empty string
    onSearch(''); 
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value); 
  };

  // 6. If the parent state (currentSearchTerm) changes, but the component didn't re-mount,
  //    the input won't update visually. We must handle this scenario specifically for external updates.
  //    Since the only external update is on search execution, the visual input already reflects what the user typed.
  //    The only other place is the initial load. If the user clears the input with handleClear, 
  //    the query state is set to '', the search executes, and the loop is broken.

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