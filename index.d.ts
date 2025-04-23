/**
 * Type definitions for axios-cache-lite
 */

import { AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * Cache options for cachedAxios
 */
export interface CacheOptions {
  /**
   * Time to live in milliseconds
   * @default 60000
   */
  ttl?: number;
  
  /**
   * Whether to return stale data while revalidating in background
   * @default true
   */
  staleWhileRevalidate?: boolean;
  
  /**
   * Number of retries on network error
   * @default 2
   */
  retry?: number;
  
  /**
   * Whether to use localStorage as a persistent cache
   * @default true
   */
  useLocalStorage?: boolean;
}

/**
 * Performs an Axios request with caching, TTL, stale-while-revalidate, and retry support
 * @param config - Axios request config
 * @param opts - Cache options
 * @returns Promise resolving to Axios response
 */
export function cachedAxios<T = any>(
  config: AxiosRequestConfig,
  opts?: CacheOptions
): Promise<AxiosResponse<T>>;

/**
 * Clears cache entries
 * @param key - Specific cache key to clear, or clear all if not provided
 */
export function clearCache(key?: string): void;

/**
 * In-memory cache store
 */
export const memoryCache: Map<string, any>;

/**
 * Cache key prefix
 */
export const PREFIX: string;
