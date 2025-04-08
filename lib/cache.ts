import { openDB, IDBPDatabase } from 'idb';

// Define types
type CacheItem<T> = {
  value: T;
  timestamp: number;
  ttl: number;
};

type CacheOptions = {
  ttl?: number; // Time to live in milliseconds
  overwrite?: boolean;
  namespace?: string;
};

// Cache default options
const DEFAULT_OPTIONS: CacheOptions = {
  ttl: 5 * 60 * 1000, // 5 minutes default TTL
  overwrite: true,
  namespace: 'app'
};

// Database name
const DB_NAME = 'airiam-cache-db';
const DB_VERSION = 1;
const STORE_NAME = 'cache-store';

/**
 * A utility class for client-side caching using IndexedDB
 */
class CacheManager {
  private static instance: CacheManager;
  
  /**
   * Get the singleton instance of CacheManager
   */
  public static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }
  private db: Promise<IDBPDatabase>;
  
  constructor() {
    // Initialize IndexedDB
    this.db = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Create the cache object store if it doesn't exist
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      },
    });
  }
  
  /**
   * Set an item in the cache
   * @param key The cache key
   * @param value The value to cache
   * @param options Caching options
   */
  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<void> {
    // Merge default options with provided options
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
    
    // Create the cache item
    const cacheItem: CacheItem<T> = {
      value,
      timestamp: Date.now(),
      ttl: mergedOptions.ttl ?? DEFAULT_OPTIONS.ttl!,
    };
    
    // Construct the full key with namespace
    const fullKey = this.getFullKey(key, mergedOptions.namespace!);
    
    if (!mergedOptions.overwrite) {
      // Check if the item already exists
      const existingItem = await this.get<T>(key, { namespace: mergedOptions.namespace });
      if (existingItem !== null) {
        return;
      }
    }
    
    // Store in IndexedDB
    const dbInstance = await this.db;
    try {
      await dbInstance.put(STORE_NAME, cacheItem, fullKey);
      
      // Also store in memory for faster retrieval
      this.setInMemoryCache(fullKey, cacheItem);
    } catch (error) {
      console.error('Failed to set cache item:', error);
      throw error;
    }
  }
  
  /**
   * Get an item from the cache
   * @param key The cache key
   * @param options Caching options
   * @returns The cached value or null if not found or expired
   */
  async get<T>(key: string, options: CacheOptions = {}): Promise<T | null> {
    // Merge default options with provided options
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
    
    // Construct the full key with namespace
    const fullKey = this.getFullKey(key, mergedOptions.namespace!);
    
    // Try to get from memory cache first
    const memoryItem = this.getFromMemoryCache<T>(fullKey);
    if (memoryItem) {
      // Check if the item has expired
      if (Date.now() - memoryItem.timestamp <= memoryItem.ttl) {
        return memoryItem.value;
      } else {
        // Remove expired item from memory cache
        this.removeFromMemoryCache(fullKey);
      }
    }
    
    // If not in memory or expired, try IndexedDB
    const dbInstance = await this.db;
    try {
      const cacheItem = await dbInstance.get<CacheItem<T>>(STORE_NAME, fullKey);
      
      if (!cacheItem) {
        return null;
      }
      
      // Check if the item has expired
      if (Date.now() - cacheItem.timestamp > cacheItem.ttl) {
        // Remove expired item
        await this.remove(key, { namespace: mergedOptions.namespace });
        return null;
      }
      
      // Store in memory for faster future retrievals
      this.setInMemoryCache(fullKey, cacheItem);
      
      return cacheItem.value;
    } catch (error) {
      console.error('Failed to get cache item:', error);
      return null;
    }
  }
  
  /**
   * Remove an item from the cache
   * @param key The cache key
   * @param options Caching options
   */
  async remove(key: string, options: CacheOptions = {}): Promise<void> {
    // Merge default options with provided options
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
    
    // Construct the full key with namespace
    const fullKey = this.getFullKey(key, mergedOptions.namespace!);
    
    // Remove from memory cache
    this.removeFromMemoryCache(fullKey);
    
    // Remove from IndexedDB
    const dbInstance = await this.db;
    try {
      await dbInstance.delete(STORE_NAME, fullKey);
    } catch (error) {
      console.error('Failed to remove cache item:', error);
      throw error;
    }
  }
  
  /**
   * Clear all items in a namespace or the entire cache
   * @param namespace The namespace to clear, if not provided clears all cache
   */
  async clear(namespace?: string): Promise<void> {
    // Clear memory cache
    if (namespace) {
      const prefix = `${namespace}:`;
      
      // Clear memory cache for this namespace
      this.clearMemoryCacheByPrefix(prefix);
      
      // Clear IndexedDB for this namespace by getting all keys and deleting those that match
      const dbInstance = await this.db;
      try {
        const keys = await dbInstance.getAllKeys(STORE_NAME);
        const keysToDelete = keys.filter(key => 
          typeof key === 'string' && key.startsWith(prefix)
        );
        
        for (const key of keysToDelete) {
          await dbInstance.delete(STORE_NAME, key);
        }
      } catch (error) {
        console.error('Failed to clear cache namespace:', error);
        throw error;
      }
    } else {
      // Clear all memory cache
      this.clearMemoryCache();
      
      // Clear all IndexedDB cache
      const dbInstance = await this.db;
      try {
        await dbInstance.clear(STORE_NAME);
      } catch (error) {
        console.error('Failed to clear entire cache:', error);
        throw error;
      }
    }
  }
  
  /**
   * Check if an item exists in the cache and is not expired
   * @param key The cache key
   * @param options Caching options
   * @returns True if the item exists and is not expired
   */
  async has(key: string, options: CacheOptions = {}): Promise<boolean> {
    const value = await this.get(key, options);
    return value !== null;
  }
  
  /**
   * Get all cached items in a namespace
   * @param namespace The namespace to get items from
   * @returns An object with key-value pairs of cached items
   */
  async getAll(namespace: string = DEFAULT_OPTIONS.namespace!): Promise<Record<string, any>> {
    const prefix = `${namespace}:`;
    const result: Record<string, any> = {};
    
    const dbInstance = await this.db;
    try {
      const keys = await dbInstance.getAllKeys(STORE_NAME);
      const keysInNamespace = keys.filter(key => 
        typeof key === 'string' && key.startsWith(prefix)
      );
      
      for (const fullKey of keysInNamespace) {
        if (typeof fullKey === 'string') {
          const cacheItem = await dbInstance.get(STORE_NAME, fullKey);
          
          if (cacheItem && (Date.now() - cacheItem.timestamp <= cacheItem.ttl)) {
            // Extract the key without namespace
            const keyWithoutNamespace = fullKey.slice(prefix.length);
            result[keyWithoutNamespace] = cacheItem.value;
          } else if (cacheItem) {
            // Remove expired item
            await dbInstance.delete(STORE_NAME, fullKey);
          }
        }
      }
      
      return result;
    } catch (error) {
      console.error('Failed to get all cache items:', error);
      return {};
    }
  }
  
  /**
   * Get the full cache key with namespace
   * @param key The original key
   * @param namespace The namespace
   * @returns The full key with namespace
   */
  private getFullKey(key: string, namespace: string): string {
    return `${namespace}:${key}`;
  }
  
  // Memory cache for faster retrievals
  private memoryCache: Map<string, CacheItem<any>> = new Map();
  
  /**
   * Set an item in the memory cache
   * @param key The full key
   * @param item The cache item
   */
  private setInMemoryCache<T>(key: string, item: CacheItem<T>): void {
    this.memoryCache.set(key, item);
    
    // Periodically clean up expired items from memory
    this.scheduleMemoryCacheCleanup();
  }
  
  /**
   * Get an item from the memory cache
   * @param key The full key
   * @returns The cache item or undefined if not found
   */
  private getFromMemoryCache<T>(key: string): CacheItem<T> | undefined {
    return this.memoryCache.get(key) as CacheItem<T> | undefined;
  }
  
  /**
   * Remove an item from the memory cache
   * @param key The full key
   */
  private removeFromMemoryCache(key: string): void {
    this.memoryCache.delete(key);
  }
  
  /**
   * Clear all items from the memory cache
   */
  private clearMemoryCache(): void {
    this.memoryCache.clear();
  }
  
  /**
   * Clear memory cache items by prefix
   * @param prefix The key prefix to match
   */
  private clearMemoryCacheByPrefix(prefix: string): void {
    for (const key of this.memoryCache.keys()) {
      if (key.startsWith(prefix)) {
        this.memoryCache.delete(key);
      }
    }
  }
  
  // Memory cache cleanup
  private memoryCacheCleanupScheduled = false;
  
  /**
   * Schedule a cleanup of expired items in the memory cache
   */
  private scheduleMemoryCacheCleanup(): void {
    if (this.memoryCacheCleanupScheduled) {
      return;
    }
    
    this.memoryCacheCleanupScheduled = true;
    
    setTimeout(() => {
      this.cleanupMemoryCache();
      this.memoryCacheCleanupScheduled = false;
    }, 60000); // Run cleanup every minute
  }
  
  /**
   * Clean up expired items from the memory cache
   */
  private cleanupMemoryCache(): void {
    const now = Date.now();
    
    for (const [key, item] of this.memoryCache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.memoryCache.delete(key);
      }
    }
  }