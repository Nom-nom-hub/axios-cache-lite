# axios-cache-lite

[![npm version](https://img.shields.io/npm/v/axios-cache-lite.svg)](https://www.npmjs.com/package/axios-cache-lite)
[![Build Status](https://github.com/Nom-nom-hub/axios-cache-lite/workflows/CI/badge.svg)](https://github.com/Nom-nom-hub/axios-cache-lite/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/axios-cache-lite)](https://bundlephobia.com/package/axios-cache-lite)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)](https://www.typescriptlang.org/)
[![Performance: Fast](https://img.shields.io/badge/Performance-⚡️%20Fast-brightgreen)](https://github.com/Nom-nom-hub/axios-cache-lite#benchmark)

A zero-config, lightweight caching solution for Axios requests with TTL, stale-while-revalidate, and retry support.

- ✅ In-memory + localStorage caching
- ✅ TTL (Time-to-Live) expiration
- ✅ Stale-while-revalidate pattern
- ✅ Automatic retry with exponential backoff
- ✅ Zero dependencies (except axios)
- ✅ ~100 lines of code for core functionality
- ✅ TypeScript support
- ✅ Pro features: IndexedDB, LRU/LFU/FIFO cache strategies

## Installation

```bash
npm install axios-cache-lite
# or
yarn add axios-cache-lite
```

Make sure you have axios installed as a peer dependency:

```bash
npm install axios
# or
yarn add axios
```

## Usage

### Basic Usage

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

### Clearing Cache

```javascript
import { clearCache } from 'axios-cache-lite';

// Clear a specific cache entry
clearCache('https://api.example.com/data{"id":123}');

// Clear all cache entries
clearCache();
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `ttl` | number | 60000 | Time to live in milliseconds |
| `staleWhileRevalidate` | boolean | true | Return stale data while revalidating in background |
| `retry` | number | 2 | Number of retries on network error |
| `useLocalStorage` | boolean | true | Whether to use localStorage as a persistent cache |

## Pro Features (requires license key)

For advanced use cases, axios-cache-lite offers Pro features:

```javascript
import { cachedAxios } from 'axios-cache-lite';
import { enableProFeatures, getCacheInspector } from 'axios-cache-lite/pro';

// Enable pro features
enableProFeatures({
  store: 'indexeddb', // 'indexeddb' or 'custom'
  strategy: 'LRU',    // 'LRU', 'LFU', or 'FIFO'
  licenseKey: 'your-license-key',
  maxEntries: 1000,   // Maximum number of entries to keep in cache
  enableInspector: true // Enable cache inspector
});

// Use cachedAxios as normal
const response = await cachedAxios({
  url: 'https://api.example.com/data'
});

// Use cache inspector
const inspector = getCacheInspector();
const stats = await inspector.getStats();
console.log(stats);
```

Pro features include:
- IndexedDB storage for larger cache capacity
- Advanced cache eviction strategies (LRU, LFU, FIFO)
- Cache size limits with automatic pruning
- Cache inspector for debugging
- Custom storage adapters

### Cache Inspector

The cache inspector provides tools for debugging and monitoring your cache:

```javascript
const inspector = getCacheInspector();

// Get cache statistics
const stats = await inspector.getStats();
// { memoryEntries: 10, persistentEntries: 15, totalEntries: 25, ... }

// List all cache entries
const entries = await inspector.listEntries();
// { memory: [...], persistent: [...] }

// Clear all cache
await inspector.clearAll();
```

In browser environments, the inspector is also available as a global object when enabled:

```javascript
// In browser console
window.axioscacheinspector.stats()
```

## Benchmark

axios-cache-lite is designed for performance. Here are some benchmark results:

| Operation | Average Time |
|-----------|-------------:|
| Direct axios (no cache) | 100.00ms |
| First request (cache miss) | 100.50ms |
| Second request (cache hit) | 0.50ms |
| Stale-while-revalidate | 0.60ms |
| Pro: IndexedDB + LRU (first) | 105.00ms |
| Pro: IndexedDB + LRU (hit) | 1.00ms |

**Cache hits are up to 200x faster than direct axios calls!**

Run the benchmark yourself:

```bash
npm run benchmark
```

## TypeScript Support

axios-cache-lite includes TypeScript definitions for both core and pro features:

```typescript
import { cachedAxios, CacheOptions } from 'axios-cache-lite';
import { enableProFeatures, ProFeatureOptions } from 'axios-cache-lite/pro';

const options: CacheOptions = {
  ttl: 60000,
  staleWhileRevalidate: true
};

const response = await cachedAxios<{ id: number, name: string }>(
  { url: 'https://api.example.com/data' },
  options
);

console.log(response.data.name); // TypeScript knows this is a string
```

## Blog Post: How I Solved Axios Caching in 20 LOC

Check out our [blog post on Dev.to](https://dev.to/nomnom/how-i-solved-axios-caching-in-20-loc) to learn about the design decisions behind axios-cache-lite and how we implemented the core functionality in just 20 lines of code.

## License

MIT
