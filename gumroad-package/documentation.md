# axios-cache-lite Pro Documentation

## Table of Contents

1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Basic Usage](#basic-usage)
4. [Pro Features](#pro-features)
   - [IndexedDB Storage](#indexeddb-storage)
   - [Cache Eviction Strategies](#cache-eviction-strategies)
   - [Cache Inspector](#cache-inspector)
5. [API Reference](#api-reference)
6. [Troubleshooting](#troubleshooting)
7. [Support](#support)

## Introduction

axios-cache-lite is a zero-config, lightweight caching solution for Axios requests with TTL, stale-while-revalidate, and retry support. The Pro version adds advanced features like IndexedDB storage, cache eviction strategies, and a cache inspector.

## Installation

```bash
npm install axios-cache-lite
```

## Basic Usage

```javascript
import { cachedAxios } from 'axios-cache-lite';

// Use like regular axios, but with caching
const response = await cachedAxios({
  url: 'https://api.example.com/data',
  method: 'GET',
  params: { id: 123 }
});

// With custom cache options
const response = await cachedAxios(
  {
    url: 'https://api.example.com/data',
    method: 'GET',
    params: { id: 123 }
  },
  {
    ttl: 300000, // 5 minutes in milliseconds
    staleWhileRevalidate: true,
    retry: 3,
    useLocalStorage: true
  }
);
```

## Pro Features

To enable Pro features, you need to use your license key:

```javascript
import { cachedAxios } from 'axios-cache-lite';
import { enableProFeatures } from 'axios-cache-lite/pro';

// Enable pro features
enableProFeatures({
  store: 'indexeddb', // 'indexeddb' or 'custom'
  strategy: 'LRU',    // 'LRU', 'LFU', or 'FIFO'
  licenseKey: 'YOUR-LICENSE-KEY-HERE',
  maxEntries: 1000,   // Maximum number of entries to keep in cache
  enableInspector: true // Enable cache inspector
});

// Use cachedAxios as normal
const response = await cachedAxios({
  url: 'https://api.example.com/data'
});
```

### IndexedDB Storage

The Pro version uses IndexedDB for persistent storage, which offers several advantages over localStorage:

- Larger storage capacity (typically 50MB+ vs 5MB for localStorage)
- Better performance for large datasets
- Structured storage with indexing capabilities
- Asynchronous API that doesn't block the main thread

### Cache Eviction Strategies

The Pro version supports three cache eviction strategies:

1. **LRU (Least Recently Used)** - Removes the least recently accessed items first
2. **LFU (Least Frequently Used)** - Removes the least frequently accessed items first
3. **FIFO (First In First Out)** - Removes the oldest items first

You can specify the strategy when enabling Pro features:

```javascript
enableProFeatures({
  strategy: 'LRU', // 'LRU', 'LFU', or 'FIFO'
  maxEntries: 1000, // Maximum number of entries before eviction
  // other options...
});
```

### Cache Inspector

The Pro version includes a cache inspector that helps you debug and monitor your cache:

```javascript
import { getCacheInspector } from 'axios-cache-lite/pro';

// Get the cache inspector
const inspector = getCacheInspector();

// Get cache statistics
const stats = await inspector.getStats();
console.log(stats);
// { memoryEntries: 10, persistentEntries: 15, totalEntries: 25, ... }

// List all cache entries
const entries = await inspector.listEntries();
console.log(entries);
// { memory: [...], persistent: [...] }

// Clear all cache
await inspector.clearAll();
```

In browser environments, the inspector is also available as a global object when enabled:

```javascript
// In browser console
window.axioscacheinspector.stats()
```

## API Reference

### Core API

#### `cachedAxios(config, options)`

Performs an Axios request with caching.

- `config`: Axios request config
- `options`: Cache options
  - `ttl`: Time to live in milliseconds (default: 60000)
  - `staleWhileRevalidate`: Whether to return stale data while revalidating (default: true)
  - `retry`: Number of retries on network error (default: 2)
  - `useLocalStorage`: Whether to use localStorage as a persistent cache (default: true)

Returns: Promise resolving to Axios response

#### `clearCache(key)`

Clears cache entries.

- `key`: Specific cache key to clear, or clear all if not provided

### Pro API

#### `enableProFeatures(options)`

Enables pro features.

- `options`: Pro feature options
  - `store`: Storage strategy ('indexeddb' or 'custom') (default: 'indexeddb')
  - `strategy`: Cache eviction strategy ('LRU', 'LFU', or 'FIFO') (default: 'LRU')
  - `licenseKey`: Your pro license key (required)
  - `maxEntries`: Maximum number of entries to keep in cache (default: 1000)
  - `enableInspector`: Whether to enable the cache inspector (default: false)
  - `customStore`: Custom store implementation (only when store='custom')

Returns: Boolean indicating whether pro features were successfully enabled

#### `getCacheInspector()`

Gets the cache inspector.

Returns: Cache inspector object or null if pro features are not enabled

## Troubleshooting

### Common Issues

#### "Invalid or missing license key"

Make sure you're using the correct license key format and that it matches the key provided in your purchase confirmation.

#### "Failed to initialize IndexedDB store"

This can happen if:
- The browser doesn't support IndexedDB
- The user has disabled IndexedDB
- There's an issue with the browser's IndexedDB implementation

In these cases, the library will fall back to localStorage.

#### "Pro features are not enabled"

Make sure you call `enableProFeatures()` before using any Pro features or the cache inspector.

## Support

If you encounter any issues or have questions, please:

1. Check the [GitHub repository](https://github.com/Nom-nom-hub/axios-cache-lite) for known issues
2. Contact support at support@youremail.com with your license key and a description of the issue

For priority support, please include:
- Your license key
- Browser/environment information
- Steps to reproduce the issue
- Any error messages or console output
