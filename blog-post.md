# How I Solved Axios Caching in 20 LOC

Caching HTTP requests is a common requirement in web applications. It helps reduce network traffic, improve performance, and provide a better user experience. However, implementing a robust caching solution can be complex, especially when you need features like TTL expiration, stale-while-revalidate, and retry logic.

In this post, I'll show you how I built **axios-cache-lite**, a zero-config caching solution for Axios that implements these features in just ~100 lines of code, with the core functionality in about 20 lines.

## The Problem

Axios is a fantastic HTTP client for JavaScript, but it doesn't include built-in caching. When building web applications, you often need to:

1. Cache API responses to avoid redundant network requests
2. Set expiration times for cached data (TTL)
3. Return stale data while fetching fresh data in the background (stale-while-revalidate)
4. Retry failed requests automatically

There are existing solutions like `axios-cache-adapter` and others, but they often come with complex configurations, large bundle sizes, or lack modern features.

## The Solution: axios-cache-lite

I wanted to create a minimal, zero-config solution that would:

1. Work out of the box with sensible defaults
2. Have a tiny footprint (~100 lines of code)
3. Support modern patterns like stale-while-revalidate
4. Be framework-agnostic

Let's look at how to use it:

```javascript
import { cachedAxios } from 'axios-cache-lite';

// Use like regular axios, but with caching
const response = await cachedAxios({
  url: 'https://api.example.com/data',
  method: 'GET'
});

// With custom options
const response = await cachedAxios(
  { url: 'https://api.example.com/data' },
  {
    ttl: 300000, // 5 minutes
    staleWhileRevalidate: true,
    retry: 3
  }
);
```

## The Core Implementation (20 LOC)

Here's the essence of the implementation, simplified to about 20 lines:

```javascript
// In-memory cache
const memoryCache = new Map();

export async function cachedAxios(config, opts = {}) {
  const { ttl = 60000, staleWhileRevalidate = true, retry = 2 } = opts;
  const cacheKey = `${config.url}${config.params ? JSON.stringify(config.params) : ''}`;
  const now = Date.now();

  // Check cache
  const cached = memoryCache.get(cacheKey);
  if (cached) {
    const isExpired = now > cached.expiresAt;
    if (!isExpired) return cached.response; // Fresh cache hit

    if (staleWhileRevalidate) {
      // Revalidate in background and return stale data
      fetchAndCache(config, cacheKey, ttl).catch(() => {});
      return cached.response;
    }
  }

  // Cache miss or expired without SWR
  return fetchAndCache(config, cacheKey, ttl, retry);
}
```

That's it! The core logic is remarkably simple. Of course, the full implementation includes additional features like localStorage persistence, proper error handling, and retry logic, but the essence is captured in these 20 lines.

## How It Works

Let's break down how this works:

1. **Cache Key Generation**: We create a unique key based on the URL and query parameters.
2. **Cache Lookup**: We check if we have a cached response for this key.
3. **TTL Check**: If we have a cached response, we check if it's expired.
4. **Stale-While-Revalidate**: If the cache is expired but stale-while-revalidate is enabled, we return the stale data immediately while triggering a background refresh.
5. **Cache Miss**: If there's no cached data or it's expired without SWR, we fetch fresh data.

## Advanced Features

The full implementation includes:

- **localStorage Persistence**: Cache survives page refreshes
- **Retry Logic**: Automatically retry failed requests with exponential backoff
- **Cache Clearing**: Utilities to clear specific or all cache entries
- **Pro Features**: IndexedDB storage, LRU/LFU/FIFO eviction strategies, and more

## Performance Benefits

Caching HTTP requests can dramatically improve performance. In our benchmarks, cached responses are returned up to 200x faster than making a new network request!

| Operation | Average Time |
|-----------|-------------:|
| Direct axios (no cache) | 100.00ms |
| Cache hit | 0.50ms |

## Conclusion

Building a simple, effective caching solution for Axios doesn't have to be complicated. With just ~100 lines of code (and the core in about 20), we've created a powerful tool that can significantly improve the performance of your web applications.

Check out [axios-cache-lite on GitHub](https://github.com/Nom-nom-hub/axios-cache-lite) and give it a try in your next project!

```bash
npm install axios-cache-lite
```

What caching strategies do you use in your projects? Let me know in the comments!
