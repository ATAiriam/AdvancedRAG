import { useState, useEffect } from 'react';

/**
 * Hook to track online/offline status and provide methods to work with offline mode
 */
export function useOfflineStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  
  const [hasReconnected, setHasReconnected] = useState<boolean>(false);
  const [reconnectTimestamp, setReconnectTimestamp] = useState<number | null>(null);
  
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setHasReconnected(true);
      setReconnectTimestamp(Date.now());
      
      // Clear the reconnect status after a while
      setTimeout(() => {
        setHasReconnected(false);
      }, 5000);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };
    
    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Clean up
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  /**
   * Save data to be used offline
   */
  const saveForOffline = async <T>(key: string, data: T): Promise<void> => {
    try {
      // Use localStorage for simple data
      if (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean') {
        localStorage.setItem(`offline_${key}`, JSON.stringify(data));
        return;
      }
      
      // For complex data or large objects, use IndexedDB
      const db = await openIndexedDB();
      
      const transaction = db.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');
      
      await new Promise<void>((resolve, reject) => {
        const request = store.put({ id: key, data, timestamp: Date.now() });
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
      
      db.close();
    } catch (error) {
      console.error('Failed to save data for offline use:', error);
    }
  };
  
  /**
   * Get data that was saved for offline use
   */
  const getOfflineData = async <T>(key: string): Promise<T | null> => {
    try {
      // Try localStorage first for simple data
      const localData = localStorage.getItem(`offline_${key}`);
      if (localData) {
        return JSON.parse(localData) as T;
      }
      
      // If not in localStorage, try IndexedDB
      const db = await openIndexedDB();
      
      const transaction = db.transaction(['offlineData'], 'readonly');
      const store = transaction.objectStore('offlineData');
      
      const data = await new Promise<{ id: string; data: T; timestamp: number } | undefined>((resolve, reject) => {
        const request = store.get(key);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      db.close();
      
      return data ? data.data : null;
    } catch (error) {
      console.error('Failed to get offline data:', error);
      return null;
    }
  };
  
  /**
   * Clear offline data
   */
  const clearOfflineData = async (key?: string): Promise<void> => {
    try {
      if (key) {
        // Remove specific item from localStorage
        localStorage.removeItem(`offline_${key}`);
        
        // Remove from IndexedDB
        const db = await openIndexedDB();
        
        const transaction = db.transaction(['offlineData'], 'readwrite');
        const store = transaction.objectStore('offlineData');
        
        await new Promise<void>((resolve, reject) => {
          const request = store.delete(key);
          
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
        
        db.close();
      } else {
        // Clear all offline data from localStorage
        Object.keys(localStorage)
          .filter(key => key.startsWith('offline_'))
          .forEach(key => localStorage.removeItem(key));
        
        // Clear all from IndexedDB
        const db = await openIndexedDB();
        
        const transaction = db.transaction(['offlineData'], 'readwrite');
        const store = transaction.objectStore('offlineData');
        
        await new Promise<void>((resolve, reject) => {
          const request = store.clear();
          
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
        
        db.close();
      }
    } catch (error) {
      console.error('Failed to clear offline data:', error);
    }
  };
  
  /**
   * Queue an action to be performed when back online
   */
  const queueActionForOnline = async (
    action: string,
    data: any,
    priority: number = 1
  ): Promise<void> => {
    try {
      const db = await openIndexedDB();
      
      const transaction = db.transaction(['actionQueue'], 'readwrite');
      const store = transaction.objectStore('actionQueue');
      
      const id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await new Promise<void>((resolve, reject) => {
        const request = store.add({
          id,
          action,
          data,
          priority,
          timestamp: Date.now(),
          attempts: 0
        });
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
      
      db.close();
    } catch (error) {
      console.error('Failed to queue action for online:', error);
    }
  };
  
  /**
   * Process actions that were queued while offline
   */
  const processQueuedActions = async (): Promise<{ success: number; failed: number }> => {
    if (!isOnline) {
      return { success: 0, failed: 0 };
    }
    
    try {
      const db = await openIndexedDB();
      
      const transaction = db.transaction(['actionQueue'], 'readonly');
      const store = transaction.objectStore('actionQueue');
      
      const actions = await new Promise<Array<{
        id: string;
        action: string;
        data: any;
        priority: number;
        timestamp: number;
        attempts: number;
      }>>((resolve, reject) => {
        const request = store.getAll();
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      db.close();
      
      // Sort actions by priority (higher first) and then by timestamp (older first)
      const sortedActions = actions.sort((a, b) => {
        if (a.priority !== b.priority) {
          return b.priority - a.priority;
        }
        return a.timestamp - b.timestamp;
      });
      
      let success = 0;
      let failed = 0;
      
      for (const action of sortedActions) {
        try {
          // Process action based on type
          switch (action.action) {
            case 'sendMessage':
              await fetch('/api/conversations/' + action.data.conversationId + '/messages', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${action.data.token}`
                },
                body: JSON.stringify({ content: action.data.content })
              });
              break;
              
            case 'uploadFile':
              const formData = new FormData();
              formData.append('file', action.data.file);
              
              await fetch('/api/files/upload', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${action.data.token}`
                },
                body: formData
              });
              break;
              
            // Add more action types as needed
            
            default:
              console.warn(`Unknown action type: ${action.action}`);
              break;
          }
          
          // If successful, remove the action from the queue
          const dbForDelete = await openIndexedDB();
          const deleteTransaction = dbForDelete.transaction(['actionQueue'], 'readwrite');
          const deleteStore = deleteTransaction.objectStore('actionQueue');
          
          await new Promise<void>((resolve, reject) => {
            const request = deleteStore.delete(action.id);
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
          });
          
          dbForDelete.close();
          
          success++;
        } catch (error) {
          console.error(`Failed to process action ${action.action}:`, error);
          
          // Update the attempts count
          const dbForUpdate = await openIndexedDB();
          const updateTransaction = dbForUpdate.transaction(['actionQueue'], 'readwrite');
          const updateStore = updateTransaction.objectStore('actionQueue');
          
          await new Promise<void>((resolve, reject) => {
            const request = updateStore.get(action.id);
            
            request.onsuccess = () => {
              const actionToUpdate = request.result;
              if (actionToUpdate) {
                actionToUpdate.attempts += 1;
                
                // If too many attempts, remove it
                if (actionToUpdate.attempts >= 5) {
                  updateStore.delete(action.id);
                } else {
                  updateStore.put(actionToUpdate);
                }
              }
              resolve();
            };
            
            request.onerror = () => reject(request.error);
          });
          
          dbForUpdate.close();
          
          failed++;
        }
      }
      
      return { success, failed };
    } catch (error) {
      console.error('Failed to process queued actions:', error);
      return { success: 0, failed: 0 };
    }
  };

  return {
    isOnline,
    hasReconnected,
    reconnectTimestamp,
    saveForOffline,
    getOfflineData,
    clearOfflineData,
    queueActionForOnline,
    processQueuedActions
  };
}

// Helper function to open IndexedDB
function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('AiriamOfflineDB', 1);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains('offlineData')) {
        db.createObjectStore('offlineData', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('actionQueue')) {
        db.createObjectStore('actionQueue', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('pendingMessages')) {
        db.createObjectStore('pendingMessages', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('pendingUploads')) {
        db.createObjectStore('pendingUploads', { keyPath: 'id' });
      }
    };
    
    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };
    
    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

export default useOfflineStatus;
