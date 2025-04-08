import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    // Handle the initial match
    if (typeof window !== 'undefined') {
      const media = window.matchMedia(query);
      setMatches(media.matches);

      // Create a listener that updates the state
      const listener = (event: MediaQueryListEvent) => {
        setMatches(event.matches);
      };

      // Add the listener
      media.addEventListener('change', listener);

      // Clean up the listener on unmount
      return () => {
        media.removeEventListener('change', listener);
      };
    }
    
    return undefined;
  }, [query]);

  return matches;
}
