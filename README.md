<h1 align="center">
  <img src="logo.png" alt="axios-cache-lite" width="200" height="200"><br>
  axios-cache-lite
</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/axios-cache-lite"><img src="https://img.shields.io/npm/v/axios-cache-lite.svg" alt="npm version"></a>
  <a href="https://github.com/Nom-nom-hub/axios-cache-lite/actions"><img src="https://github.com/Nom-nom-hub/axios-cache-lite/workflows/CI/badge.svg" alt="Build Status"></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT"></a>
  <a href="https://bundlephobia.com/package/axios-cache-lite@1.0.0"><img src="https://img.shields.io/bundlephobia/minzip/axios-cache-lite@1.0.0" alt="Bundle Size"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-Ready-blue" alt="TypeScript"></a>
  <a href="https://github.com/Nom-nom-hub/axios-cache-lite#benchmark"><img src="https://img.shields.io/badge/Performance-⚡️%20Fast-brightgreen" alt="Performance: Fast"></a>
</p>

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

## Pro Features

For advanced use cases, axios-cache-lite offers Pro features:

```javascript
import { cachedAxios } from 'axios-cache-lite';
import { enableProFeatures, getCacheInspector } from 'axios-cache-lite/pro';

// First, star our GitHub repo: https://github.com/Nom-nom-hub/axios-cache-lite

// Then enable pro features with your GitHub username
const enabled = await enableProFeatures({
  store: 'indexeddb', // 'indexeddb' or 'custom'
  strategy: 'LRU',    // 'LRU', 'LFU', or 'FIFO'
  licenseKey: '@yourusername', // Your GitHub username with @ prefix
  maxEntries: 1000,   // Maximum number of entries to keep in cache
  enableInspector: true // Enable cache inspector
});

if (enabled) {
  console.log('Pro features enabled successfully!');
}

// Use cachedAxios as normal
const response = await cachedAxios({
  url: 'https://api.example.com/data'
});

// Use cache inspector
const inspector = getCacheInspector();
const stats = await inspector.getStats();
console.log(stats);
```

### Pro Features Include:

- **IndexedDB Storage**: Store more data with IndexedDB instead of localStorage
- **Advanced Cache Strategies**: LRU, LFU, and FIFO eviction strategies
- **Cache Size Management**: Automatically prune old entries when limits are reached
- **Cache Inspector**: Debug and monitor your cache in real-time
- **Custom Storage Adapters**: Create your own storage implementations

### How to Get Pro Features (Free!)

1. Star our [GitHub repository](https://github.com/Nom-nom-hub/axios-cache-lite)
2. Use your GitHub username to enable Pro features:

```javascript
await enableProFeatures({
  licenseKey: '@yourusername', // Your GitHub username with @ prefix
  // other options...
});
```

**Note:** The `enableProFeatures` function is async and returns a Promise.

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
