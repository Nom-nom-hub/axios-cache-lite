/**
 * axios-cache-lite - Zero-config, in-memory + localStorage TTL cache for Axios requests
 * @module axios-cache-lite
 */

import axios from 'axios';

// In-memory cache store
export const memoryCache = new Map();
export const PREFIX = 'axios-cache-lite:';

/**
 * Performs an Axios request with caching, TTL, stale-while-revalidate, and retry support
 * @param {Object} config - Axios request config
 * @param {Object} opts - Cache options
 * @param {number} [opts.ttl=60000] - Time to live in milliseconds
 * @param {boolean} [opts.staleWhileRevalidate=true] - Return stale data while revalidating
 * @param {number} [opts.retry=2] - Number of retries on network error
 * @param {boolean} [opts.useLocalStorage=true] - Whether to use localStorage as a persistent cache
 * @returns {Promise<Object>} Axios response
 */
export async function cachedAxios(config, opts = {}) {
  const { ttl = 60000, staleWhileRevalidate = true, retry = 2, useLocalStorage = true } = opts;
  const cacheKey = `${config.url}${config.params ? JSON.stringify(config.params) : ''}`;
  const now = Date.now();

  // Try to get from memory cache first, then localStorage if enabled
  let cached = memoryCache.get(cacheKey);
  if (!cached && useLocalStorage) {
    try {
      const stored = localStorage.getItem(`${PREFIX}${cacheKey}`);
      if (stored) {
        cached = JSON.parse(stored);
        memoryCache.set(cacheKey, cached); // Restore in memory
      }
    } catch (e) { /* localStorage might be unavailable */ }
  }

  // Handle cache hit
  if (cached) {
    const isExpired = now > cached.expiresAt;
    if (!isExpired) return cached.response; // Fresh cache hit

    if (staleWhileRevalidate) {
      // Revalidate in background and return stale data
      revalidate(config, cacheKey, ttl, useLocalStorage);
      return cached.response;
    }
  }

  // Cache miss or expired without staleWhileRevalidate
  return fetchWithRetry(config, cacheKey, ttl, useLocalStorage, retry);
}

// Background revalidation
async function revalidate(config, cacheKey, ttl, useLocalStorage) {
  try { await fetchWithRetry(config, cacheKey, ttl, useLocalStorage, 0); }
  catch (e) { /* Silently fail on background revalidation */ }
}

// Fetch with retry logic
async function fetchWithRetry(config, cacheKey, ttl, useLocalStorage, retries, delay = 300) {
  try {
    const response = await axios(config);
    const cacheEntry = { response, expiresAt: Date.now() + ttl };

    // Save to memory cache
    memoryCache.set(cacheKey, cacheEntry);

    // Save to localStorage if enabled
    if (useLocalStorage) {
      try { localStorage.setItem(`${PREFIX}${cacheKey}`, JSON.stringify(cacheEntry)); }
      catch (e) { /* localStorage might be unavailable */ }
    }

    return response;
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(config, cacheKey, ttl, useLocalStorage, retries - 1, delay * 2);
    }
    throw error;
  }
}

/**
 * Clears cache entries
 * @param {string} [key] - Specific cache key to clear, or clear all if not provided
 */
export function clearCache(key) {
  if (key) {
    memoryCache.delete(key);
    try { localStorage.removeItem(`${PREFIX}${key}`); }
    catch (e) { /* localStorage might be unavailable */ }
  } else {
    memoryCache.clear();
    try {
      Object.keys(localStorage)
        .filter(k => k.startsWith(PREFIX))
        .forEach(k => localStorage.removeItem(k));
    } catch (e) { /* localStorage might be unavailable */ }
  }
}
