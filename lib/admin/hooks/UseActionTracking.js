'use client';

/**
 * Hook and utility functions for tracking admin actions
 * This enables analytics on admin user behavior
 */

// Track an admin action
export const trackAdminAction = (action, metadata = {}) => {
  try {
    // In a real implementation, this would send analytics data to your backend
    console.log(`[Admin Action]`, { action, timestamp: new Date().toISOString(), metadata });
    
    // Example of sending to an analytics endpoint
    // fetch('/api/admin/analytics/actions', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     action,
    //     timestamp: new Date().toISOString(),
    //     metadata
    //   })
    // }).catch(error => {
    //   // Silently fail tracking to not disrupt the user experience
    //   console.error('Failed to track admin action:', error);
    // });
  } catch (error) {
    // Silently fail tracking to not disrupt the user experience
    console.error('Failed to track admin action:', error);
  }
};

// Hook for tracking component mount/unmount and other lifecycle events
const useActionTracking = (componentName, initialData = {}) => {
  const trackEvent = (eventName, additionalData = {}) => {
    trackAdminAction(`${componentName}_${eventName}`, {
      ...initialData,
      ...additionalData
    });
  };
  
  // Track component mount
  // useEffect(() => {
  //   trackEvent('mounted');
  //   
  //   return () => {
  //     trackEvent('unmounted');
  //   };
  // }, []);  // eslint-disable-line react-hooks/exhaustive-deps
  
  return {
    trackEvent
  };
};

export default useActionTracking;
