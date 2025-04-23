/**
 * Pro features for axios-cache-lite (requires license key)
 * @module axios-cache-lite/pro
 */

import { memoryCache, PREFIX } from './index.js';

// Pro features state
let proEnabled = false;
let currentStore = null;
let currentStrategy = null;
let maxEntries = 1000;

// Environment variable for license key
const ENV_LICENSE_KEY = process.env.AXIOS_CACHE_LITE_LICENSE_KEY;

/**
 * Validates a license key
 * @private
 * @param {string} key - License key to validate
 * @returns {boolean} Whether the key is valid
 */
function validateLicenseKey(key) {
  // Accept any of these formats:
  // 1. Environment variable
  if (ENV_LICENSE_KEY && ENV_LICENSE_KEY.length > 5) {
    return true;
  }

  // 2. No key provided
  if (!key) {
    return false;
  }

  // 3. Standard key format (simple check)
  if (key.length >= 8) {
    return true;
  }

  return false;
}

/**
 * IndexedDB storage adapter
 * @private
 */
class IndexedDBStore {
  constructor() {
    this.dbName = 'axios-cache-lite-pro';
    this.storeName = 'cache';
    this.db = null;
    this.ready = this.initDB();
  }

  async initDB() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        reject(new Error('IndexedDB is not supported in this browser'));
        return;
      }

      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'key' });
        }
      };
    });
  }

  async get(key) {
    await this.ready;
    return new Promise((resolve) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(request.result ? request.result.value : null);
      };

      request.onerror = () => {
        resolve(null);
      };
    });
  }

  async set(key, value, metadata = {}) {
    await this.ready;
    return new Promise((resolve) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put({
        key,
        value,
        metadata,
        timestamp: Date.now()
      });

      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    });
  }

  async delete(key) {
    await this.ready;
    return new Promise((resolve) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    });
  }

  async clear() {
    await this.ready;
    return new Promise((resolve) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    });
  }

  async getAll() {
    await this.ready;
    return new Promise((resolve) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        resolve([]);
      };
    });
  }
}

/**
 * Cache eviction strategies
 * @private
 */
const evictionStrategies = {
  // Least Recently Used
  LRU: {
    onGet(_, __, metadata) {
      // Update access time
      return { ...metadata, lastAccessed: Date.now() };
    },
    getEvictionCandidates(entries) {
      // Sort by last accessed time (oldest first)
      return entries.sort((a, b) => {
        const aTime = a.metadata?.lastAccessed || a.timestamp;
        const bTime = b.metadata?.lastAccessed || b.timestamp;
        return aTime - bTime;
      });
    }
  },
  // Least Frequently Used
  LFU: {
    onGet(_, __, metadata) {
      // Increment access count
      const accessCount = (metadata?.accessCount || 0) + 1;
      return { ...metadata, accessCount };
    },
    getEvictionCandidates(entries) {
      // Sort by access count (least first)
      return entries.sort((a, b) => {
        const aCount = a.metadata?.accessCount || 0;
        const bCount = b.metadata?.accessCount || 0;
        return aCount - bCount;
      });
    }
  },
  // First In First Out
  FIFO: {
    onGet(_, __, metadata) {
      // No changes needed for FIFO
      return metadata;
    },
    getEvictionCandidates(entries) {
      // Sort by timestamp (oldest first)
      return entries.sort((a, b) => a.timestamp - b.timestamp);
    }
  }
};

/**
 * Manages cache eviction based on the selected strategy
 * @private
 */
async function evictCache() { // Used when adding new entries
  if (!currentStore || !currentStrategy) return;

  const strategy = evictionStrategies[currentStrategy];
  if (!strategy) return;

  // Get all entries
  const entries = await currentStore.getAll();

  // If we're under the limit, no need to evict
  if (entries.length <= maxEntries) return;

  // Get candidates for eviction
  const candidates = strategy.getEvictionCandidates(entries);

  // Evict entries until we're under the limit
  const toEvict = candidates.slice(0, entries.length - maxEntries);

  for (const entry of toEvict) {
    await currentStore.delete(entry.key);
  }
}

/**
 * CLI inspector for cache
 * @private
 */
class CacheInspector {
  constructor() {
    this.enabled = false;
  }

  enable() {
    this.enabled = true;
    console.log('Cache inspector enabled. Use `window.axioscacheinspector` in browser console.');

    // Expose inspector to global scope in browser
    if (typeof window !== 'undefined') {
      window.axioscacheinspector = {
        stats: () => this.getStats(),
        list: () => this.listEntries(),
        clear: () => this.clearAll()
      };
    }
  }

  async getStats() {
    if (!this.enabled) return 'Inspector not enabled';

    const memoryEntries = memoryCache.size;
    let persistentEntries = 0;

    if (currentStore) {
      const entries = await currentStore.getAll();
      persistentEntries = entries.length;
    } else {
      try {
        persistentEntries = Object.keys(localStorage)
          .filter(k => k.startsWith(PREFIX))
          .length;
      } catch (e) { /* localStorage might be unavailable */ }
    }

    return {
      memoryEntries,
      persistentEntries,
      totalEntries: memoryEntries + persistentEntries,
      store: currentStore ? 'indexeddb' : 'localStorage',
      strategy: currentStrategy || 'none',
      proEnabled
    };
  }

  async listEntries() {
    if (!this.enabled) return 'Inspector not enabled';

    const memoryEntries = Array.from(memoryCache.entries()).map(([key, value]) => ({
      key,
      expiresAt: value.expiresAt,
      size: JSON.stringify(value).length
    }));

    let persistentEntries = [];

    if (currentStore) {
      const entries = await currentStore.getAll();
      persistentEntries = entries.map(entry => ({
        key: entry.key,
        timestamp: entry.timestamp,
        metadata: entry.metadata,
        size: JSON.stringify(entry).length
      }));
    } else {
      try {
        persistentEntries = Object.keys(localStorage)
          .filter(k => k.startsWith(PREFIX))
          .map(key => {
            const value = JSON.parse(localStorage.getItem(key));
            return {
              key: key.substring(PREFIX.length),
              expiresAt: value.expiresAt,
              size: localStorage.getItem(key).length
            };
          });
      } catch (e) { /* localStorage might be unavailable */ }
    }

    return {
      memory: memoryEntries,
      persistent: persistentEntries
    };
  }

  async clearAll() {
    if (!this.enabled) return 'Inspector not enabled';

    memoryCache.clear();

    if (currentStore) {
      await currentStore.clear();
    } else {
      try {
        Object.keys(localStorage)
          .filter(k => k.startsWith(PREFIX))
          .forEach(k => localStorage.removeItem(k));
      } catch (e) { /* localStorage might be unavailable */ }
    }

    return 'Cache cleared';
  }
}

// Create inspector instance
const inspector = new CacheInspector();

/**
 * Enables pro features for axios-cache-lite
 * @param {Object} options - Pro feature options
 * @param {string} [options.store='indexeddb'] - Storage strategy ('indexeddb', 'custom')
 * @param {string} [options.strategy='LRU'] - Cache eviction strategy ('LRU', 'LFU', 'FIFO')
 * @param {string} [options.licenseKey] - Your pro license key
 * @param {number} [options.maxEntries=1000] - Maximum number of entries to keep in cache
 * @param {boolean} [options.enableInspector=false] - Whether to enable the cache inspector
 * @returns {boolean} Whether pro features were successfully enabled
 */
export function enableProFeatures({
  store = 'indexeddb',
  strategy = 'LRU',
  licenseKey,
  maxEntries: maxEntriesOption = 1000,
  enableInspector = false
} = {}) {
  // Validate license key
  if (!validateLicenseKey(licenseKey)) {
    console.warn('⚠️ axios-cache-lite Pro features require a license key');
    console.warn('Purchase at: https://teckmaster.gumroad.com/l/axios-cache-lite-pro');
    console.warn('After purchase, use your license key or Gumroad purchase ID');
    return false;
  }

  // Set max entries
  maxEntries = maxEntriesOption;

  // Initialize store
  if (store === 'indexeddb') {
    try {
      currentStore = new IndexedDBStore();
    } catch (e) {
      console.warn('Failed to initialize IndexedDB store:', e);
      console.warn('IndexedDB may not be available in this environment');
      console.warn('Pro features will be partially enabled with limited functionality');
      // Continue with limited functionality
    }
  } else if (store === 'custom' && arguments[0]?.customStore) {
    currentStore = arguments[0].customStore;
  } else if (store !== 'indexeddb') {
    console.warn(`Invalid store option: ${store}. Using 'indexeddb' instead.`);
    try {
      currentStore = new IndexedDBStore();
    } catch (e) {
      // Silently fail and continue with limited functionality
    }
  }

  // Set strategy
  if (!evictionStrategies[strategy]) {
    console.warn(`Invalid strategy option: ${strategy}. Using 'LRU' instead.`);
    strategy = 'LRU';
  }
  currentStrategy = strategy;

  // Enable inspector if requested
  if (enableInspector) {
    inspector.enable();
  }

  // Mark as enabled
  proEnabled = true;

  // Run initial cache eviction if needed
  if (currentStore) {
    evictCache().catch(e => console.warn('Initial cache eviction failed:', e));
  }

  console.log('✅ axios-cache-lite Pro features enabled!');
  console.log(`   - Storage: ${currentStore ? store : 'memory-only (IndexedDB unavailable)'}`);
  console.log(`   - Strategy: ${strategy}`);
  console.log(`   - Max entries: ${maxEntries}`);
  console.log(`   - Inspector: ${enableInspector ? 'enabled' : 'disabled'}`);

  return true;
}

/**
 * Gets the cache inspector
 * @returns {Object} The cache inspector
 */
export function getCacheInspector() {
  if (!proEnabled) {
    console.warn('Pro features are not enabled');
    return null;
  }
  return inspector;
}

// Export for testing
export const _testing = {
  validateLicenseKey,
  evictionStrategies,
  IndexedDBStore
};
