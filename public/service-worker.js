// This service worker can be customized
// See https://developers.google.com/web/tools/workbox/modules

// Force development builds
// workbox.setConfig({ debug: true });

const CACHE_NAME = 'airiam-rag-cache-v1';
const DATA_CACHE_NAME = 'airiam-rag-data-cache-v1';

// Default precache
self.__WB_MANIFEST = self.__WB_MANIFEST || [];

// Precache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/dashboard',
        '/offline',
        '/icons/icon-192x192.png',
        '/icons/icon-512x512.png',
        '/favicon.ico',
        '/logo.svg',
      ]);
    })
  );
});

// Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return (
              cacheName !== CACHE_NAME && cacheName !== DATA_CACHE_NAME
            );
          })
          .map((cacheName) => {
            return caches.delete(cacheName);
          })
      );
    })
  );
});

// Network first, falling back to cache strategy for page navigations
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (event.request.url.startsWith(self.location.origin)) {
    // API requests - Network first with cache fallback
    if (event.request.url.includes('/api/')) {
      event.respondWith(
        fetch(event.request)
          .then((response) => {
            // If successful response, clone and store in cache
            if (response.status === 200) {
              const clonedResponse = response.clone();
              caches.open(DATA_CACHE_NAME).then((cache) => {
                cache.put(event.request, clonedResponse);
              });
            }
            return response;
          })
          .catch(() => {
            // If network fails, try to get from cache
            return caches.match(event.request);
          })
      );
    } 
    // Static assets and page navigations - Cache first with network fallback
    else {
      event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          return fetch(event.request)
            .then((response) => {
              // If valid response, clone and store in cache
              if (response && response.status === 200) {
                const clonedResponse = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(event.request, clonedResponse);
                });
              }
              return response;
            })
            .catch(() => {
              // If both network and cache fail for a navigation request, show offline page
              if (event.request.mode === 'navigate') {
                return caches.match('/offline');
              }
              return null;
            });
        })
      );
    }
  }
});

// Background sync for offline message sending
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-messages') {
    event.waitUntil(syncMessages());
  } else if (event.tag === 'sync-file-uploads') {
    event.waitUntil(syncFileUploads());
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-icon.png',
    data: {
      url: data.url
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handler to open the app at the right place
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  } else {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Helper function for syncing file uploads
async function syncFileUploads() {
  try {
    const db = await openIndexedDB();
    const pendingUploads = await getAllPendingUploads(db);
    
    for (const upload of pendingUploads) {
      try {
        const formData = new FormData();
        formData.append('file', upload.file);
        
        const response = await fetch('/api/files/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${upload.token}`
          },
          body: formData
        });
        
        if (response.ok) {
          await deletePendingUpload(db, upload.id);
        }
      } catch (error) {
        console.error('Failed to sync file upload:', error);
      }
    }
    
    db.close();
  } catch (error) {
    console.error('Error syncing file uploads:', error);
  }
}

// IndexedDB Helper Functions
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('AiriamOfflineDB', 1);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains('pendingMessages')) {
        db.createObjectStore('pendingMessages', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('pendingUploads')) {
        db.createObjectStore('pendingUploads', { keyPath: 'id' });
      }
    };
    
    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
    
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

function getAllPendingMessages(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingMessages'], 'readonly');
    const store = transaction.objectStore('pendingMessages');
    const request = store.getAll();
    
    request.onsuccess = () => {
      resolve(request.result);
    };
    
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

function deletePendingMessage(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingMessages'], 'readwrite');
    const store = transaction.objectStore('pendingMessages');
    const request = store.delete(id);
    
    request.onsuccess = () => {
      resolve();
    };
    
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

function getAllPendingUploads(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingUploads'], 'readonly');
    const store = transaction.objectStore('pendingUploads');
    const request = store.getAll();
    
    request.onsuccess = () => {
      resolve(request.result);
    };
    
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

function deletePendingUpload(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingUploads'], 'readwrite');
    const store = transaction.objectStore('pendingUploads');
    const request = store.delete(id);
    
    request.onsuccess = () => {
      resolve();
    };
    
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
} for syncing offline messages
async function syncMessages() {
  try {
    const db = await openIndexedDB();
    const pendingMessages = await getAllPendingMessages(db);
    
    for (const message of pendingMessages) {
      try {
        const response = await fetch('/api/conversations/' + message.conversationId + '/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${message.token}`
          },
          body: JSON.stringify({ content: message.content })
        });
        
        if (response.ok) {
          await deletePendingMessage(db, message.id);
        }
      } catch (error) {
        console.error('Failed to sync message:', error);
      }
    }
    
    db.close();
  } catch (error) {
    console.error('Error syncing messages:', error);
  }
}

// Helper function