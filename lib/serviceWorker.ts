import { Workbox } from 'workbox-window';

export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator && window.workbox !== undefined) {
    const wb = new Workbox('/service-worker.js');
    
    // Add event listeners for various service worker lifecycle states
    wb.addEventListener('installed', (event) => {
      console.log('Service Worker installed:', event);
      if (!event.isUpdate) {
        // First-time install
        console.log('Service Worker installed for the first time');
      }
    });
    
    wb.addEventListener('controlling', () => {
      console.log('Service Worker now controlling the page');
      // You might want to refresh the page here to ensure everything works with the new service worker
      // window.location.reload();
    });
    
    wb.addEventListener('waiting', (event) => {
      console.log('New Service Worker waiting to activate:', event);
      
      // This is a good place to show a "New version available" notification
      // You can use this to prompt the user to refresh for the latest version
      const updateNotification = {
        title: 'Update Available',
        message: 'A new version of the app is available. Refresh to update?',
        type: 'info',
        refreshAction: () => {
          wb.messageSkipWaiting();
        }
      };
      
      // Dispatch a custom event with the notification details
      window.dispatchEvent(new CustomEvent('appUpdate', { detail: updateNotification }));
    });
    
    // Register the service worker
    wb.register()
      .then((registration) => {
        console.log('Service Worker registered successfully:', registration);
        
        // Check for updates periodically
        setInterval(() => {
          wb.update();
        }, 60 * 60 * 1000); // Check every hour
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
    
    return wb;
  }
  
  return null;
}

export function unregisterServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}

// Sync messages that were created while offline
export async function syncMessages() {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('sync-messages');
      return true;
    } catch (error) {
      console.error('Background sync failed:', error);
      return false;
    }
  }
  return false;
}

// Sync file uploads that were created while offline
export async function syncFileUploads() {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('sync-file-uploads');
      return true;
    } catch (error) {
      console.error('Background sync failed:', error);
      return false;
    }
  }
  return false;
}

// Subscribe to push notifications
export async function subscribeToPushNotifications() {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Get the server's public key
      const response = await fetch('/api/push/public-key');
      const { publicKey } = await response.json();
      
      // Convert the public key to Uint8Array
      const applicationServerKey = urlBase64ToUint8Array(publicKey);
      
      // Subscribe the user
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });
      
      // Send the subscription to the server
      await fetch('/api/push/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscription }),
      });
      
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }
  return null;
}

// Unsubscribe from push notifications
export async function unsubscribeFromPushNotifications() {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        // Unsubscribe from the push service
        await subscription.unsubscribe();
        
        // Notify the server
        await fetch('/api/push/unregister', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ subscription }),
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    }
  }
  return false;
}

// Helper function to convert base64 string to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}
