import { useState, useEffect } from 'react';

// Screen size breakpoints matching TailwindCSS defaults
export const breakpoints = {
  xs: '475px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
  '3xl': '1920px',
};

type BreakpointKey = keyof typeof breakpoints;

/**
 * Hook to check if a media query matches
 * @param query The media query to check
 * @returns Whether the media query matches
 */
export function useMediaQuery(query: string): boolean {
  // Initialize state with null during SSR (to prevent hydration mismatch)
  const [matches, setMatches] = useState<boolean>(false);
  const [isClient, setIsClient] = useState<boolean>(false);
  
  useEffect(() => {
    setIsClient(true);
    
    // Create media query list and check initial match
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);
    
    // Define callback for change event
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };
    
    // Add event listener with modern API if available
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
      return () => {
        mediaQuery.removeListener(handleChange);
      };
    }
  }, [query]);
  
  // Return false during SSR to avoid hydration mismatch
  return isClient ? matches : false;
}

/**
 * Helper hook to check if screen is at least a certain breakpoint
 * @param breakpoint The minimum breakpoint to check
 * @returns Whether the screen is at least that size
 */
export function useBreakpoint(breakpoint: BreakpointKey): boolean {
  const width = breakpoints[breakpoint];
  return useMediaQuery(`(min-width: ${width})`);
}

/**
 * Helper hook to check if screen is below a certain breakpoint
 * @param breakpoint The maximum breakpoint to check
 * @returns Whether the screen is below that size
 */
export function useBreakpointDown(breakpoint: BreakpointKey): boolean {
  const width = breakpoints[breakpoint];
  return useMediaQuery(`(max-width: ${width})`);
}

/**
 * Helper hook to check if screen is between two breakpoints
 * @param minBreakpoint The minimum breakpoint
 * @param maxBreakpoint The maximum breakpoint
 * @returns Whether the screen is between those sizes
 */
export function useBreakpointBetween(
  minBreakpoint: BreakpointKey,
  maxBreakpoint: BreakpointKey
): boolean {
  const minWidth = breakpoints[minBreakpoint];
  const maxWidth = breakpoints[maxBreakpoint];
  
  return useMediaQuery(
    `(min-width: ${minWidth}) and (max-width: ${maxWidth})`
  );
}

/**
 * Convenient hook to get current breakpoint as a string
 * @returns The current breakpoint name
 */
export function useCurrentBreakpoint(): BreakpointKey | null {
  const isMobile = useMediaQuery(`(max-width: ${breakpoints.sm})`);
  const isTablet = useMediaQuery(
    `(min-width: ${breakpoints.sm}) and (max-width: ${breakpoints.lg})`
  );
  const isDesktop = useMediaQuery(
    `(min-width: ${breakpoints.lg}) and (max-width: ${breakpoints.xl})`
  );
  const isWideDesktop = useMediaQuery(
    `(min-width: ${breakpoints.xl}) and (max-width: ${breakpoints['2xl']})`
  );
  const isUltraWide = useMediaQuery(`(min-width: ${breakpoints['2xl']})`);
  
  if (isMobile) return 'xs';
  if (isTablet) return 'md';
  if (isDesktop) return 'lg';
  if (isWideDesktop) return 'xl';
  if (isUltraWide) return '2xl';
  
  return null;
}

/**
 * Helper hook to check if device is mobile (based on screen size)
 * @returns Whether the device is mobile
 */
export function useIsMobile(): boolean {
  return useMediaQuery(`(max-width: ${breakpoints.md})`);
}

/**
 * Helper hook to check if device is tablet (based on screen size)
 * @returns Whether the device is tablet
 */
export function useIsTablet(): boolean {
  return useMediaQuery(
    `(min-width: ${breakpoints.md}) and (max-width: ${breakpoints.lg})`
  );
}

/**
 * Helper hook to check if device is desktop (based on screen size)
 * @returns Whether the device is desktop
 */
export function useIsDesktop(): boolean {
  return useMediaQuery(`(min-width: ${breakpoints.lg})`);
}

/**
 * Helper hook to check if device supports hover
 * @returns Whether the device supports hover
 */
export function useHasHover(): boolean {
  return useMediaQuery('(hover: hover)');
}

/**
 * Helper hook to check if device prefers reduced motion
 * @returns Whether the device prefers reduced motion
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

/**
 * Helper hook to check if device prefers dark mode
 * @returns Whether the device prefers dark mode
 */
export function usePrefersDarkMode(): boolean {
  return useMediaQuery('(prefers-color-scheme: dark)');
}

/**
 * Helper hook to check if device supports touch
 * @returns Whether the device supports touch
 */
export function useIsTouch(): boolean {
  return useMediaQuery('(pointer: coarse)');
}

/**
 * Hook to detect device orientation
 * @returns Object with isPortrait and isLandscape
 */
export function useOrientation() {
  const isPortrait = useMediaQuery('(orientation: portrait)');
  const isLandscape = useMediaQuery('(orientation: landscape)');
  
  return { isPortrait, isLandscape };
}

export default useMediaQuery;
