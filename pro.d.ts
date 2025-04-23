/**
 * Type definitions for axios-cache-lite/pro
 */

/**
 * Pro feature options
 */
export interface ProFeatureOptions {
  /**
   * Storage strategy
   * @default 'indexeddb'
   */
  store?: 'indexeddb' | 'custom';
  
  /**
   * Cache eviction strategy
   * @default 'LRU'
   */
  strategy?: 'LRU' | 'LFU' | 'FIFO';
  
  /**
   * Your pro license key
   */
  licenseKey?: string;
  
  /**
   * Maximum number of entries to keep in cache
   * @default 1000
   */
  maxEntries?: number;
  
  /**
   * Whether to enable the cache inspector
   * @default false
   */
  enableInspector?: boolean;
  
  /**
   * Custom store implementation
   */
  customStore?: CustomStore;
}

/**
 * Custom store interface
 */
export interface CustomStore {
  get(key: string): Promise<any>;
  set(key: string, value: any, metadata?: any): Promise<boolean>;
  delete(key: string): Promise<boolean>;
  clear(): Promise<boolean>;
  getAll(): Promise<any[]>;
}

/**
 * Cache inspector interface
 */
export interface CacheInspector {
  getStats(): Promise<{
    memoryEntries: number;
    persistentEntries: number;
    totalEntries: number;
    store: string;
    strategy: string;
    proEnabled: boolean;
  }>;
  
  listEntries(): Promise<{
    memory: Array<{
      key: string;
      expiresAt: number;
      size: number;
    }>;
    persistent: Array<{
      key: string;
      timestamp?: number;
      expiresAt?: number;
      metadata?: any;
      size: number;
    }>;
  }>;
  
  clearAll(): Promise<string>;
}

/**
 * Enables pro features for axios-cache-lite
 * @param options - Pro feature options
 * @returns Whether pro features were successfully enabled
 */
export function enableProFeatures(options?: ProFeatureOptions): boolean;

/**
 * Gets the cache inspector
 * @returns The cache inspector or null if pro features are not enabled
 */
export function getCacheInspector(): CacheInspector | null;
