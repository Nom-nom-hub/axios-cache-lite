# Introducing axios-cache-lite: Zero-Config Caching for Axios in ~100 Lines of Code

![axios-cache-lite logo](https://github.com/Nom-nom-hub/axios-cache-lite/raw/main/logo.png)

Have you ever needed to add caching to your Axios requests but found existing solutions too complex or heavyweight? I faced this problem in a recent project and decided to build a solution that's:

- **Simple**: Zero configuration required
- **Lightweight**: Core functionality in ~100 lines of code
- **Powerful**: TTL, stale-while-revalidate, and retry support
- **Fast**: Cache hits are up to 200x faster than network requests

Meet [axios-cache-lite](https://github.com/Nom-nom-hub/axios-cache-lite), a minimalist caching solution for Axios that just works.

## The Problem with API Requests

API requests are expensive. They:

1. **Consume bandwidth** - especially problematic on mobile networks
2. **Introduce latency** - even fast APIs add 100-300ms to your app's response time
3. **Create dependencies** - your app is only as reliable as your API
4. **Waste resources** - why fetch the same data repeatedly?

Caching solves these problems, but implementing a good caching system is surprisingly complex. You need to handle:

- Cache invalidation (when does data expire?)
- Race conditions (what if multiple components request the same data?)
- Stale data (how to balance freshness vs. performance?)
- Error handling (what happens when the network fails?)

## Existing Solutions

There are several caching libraries for Axios, but they often:

1. Require complex configuration
2. Add many dependencies
3. Include features you don't need
4. Lack features you do need (like stale-while-revalidate)

I wanted something that worked out of the box with sensible defaults, while still being flexible enough for advanced use cases.

## Introducing axios-cache-lite

Here's how simple it is to use:

```javascript
import { cachedAxios } from 'axios-cache-lite';

// Use like regular axios, but with caching
const response = await cachedAxios({
  url: 'https://api.example.com/data'
});

// That's it! Your requests are now cached.
```

Behind the scenes, axios-cache-lite:

1. Checks if the request is in the cache
2. Returns cached data if available and not expired
3. Makes a network request if needed
4. Stores the response in memory and localStorage
5. Handles cache invalidation automatically

## Advanced Features

While the default configuration works for most cases, you can customize the behavior:

```javascript
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

### Stale-While-Revalidate

One of my favorite features is stale-while-revalidate, which:

1. Returns stale data from the cache immediately
2. Fetches fresh data in the background
3. Updates the cache for next time

This gives you the best of both worlds: instant responses for your users and up-to-date data.

### Automatic Retry

Network requests fail. axios-cache-lite includes automatic retry with exponential backoff:

```javascript
// Will retry up to 3 times with increasing delays
const response = await cachedAxios(
  { url: 'https://api.example.com/data' },
  { retry: 3 }
);
```

### Cache Management

You can easily clear the cache when needed:

```javascript
import { clearCache } from 'axios-cache-lite';

// Clear a specific cache entry
clearCache('https://api.example.com/data{"id":123}');

// Clear all cache entries
clearCache();
```

## Pro Features (Free for GitHub Stars!)

For advanced use cases, axios-cache-lite offers Pro features:

- **IndexedDB Storage**: Store more data with IndexedDB instead of localStorage
- **Advanced Cache Strategies**: LRU, LFU, and FIFO eviction strategies
- **Cache Size Management**: Automatically prune old entries when limits are reached
- **Cache Inspector**: Debug and monitor your cache in real-time

To unlock these features, simply star the [GitHub repository](https://github.com/Nom-nom-hub/axios-cache-lite) and use your GitHub username:

```javascript
import { enableProFeatures } from 'axios-cache-lite/pro';

await enableProFeatures({
  licenseKey: '@yourusername', // Your GitHub username with @ prefix
  store: 'indexeddb',
  strategy: 'LRU'
});
```

## Performance Benchmarks

How much faster is cached data? Here are some benchmark results:

| Operation | Average Time |
|-----------|-------------:|
| Direct axios (no cache) | 100.00ms |
| First request (cache miss) | 100.50ms |
| Second request (cache hit) | 0.50ms |
| Stale-while-revalidate | 0.60ms |

**Cache hits are up to 200x faster than direct axios calls!**

## How It Works: The Core in ~20 Lines

The heart of axios-cache-lite is surprisingly simple. Here's a simplified version of the core caching logic:

```javascript
async function cachedAxios(config, options = {}) {
  const cacheKey = getCacheKey(config);
  const cachedData = getFromCache(cacheKey);

  // Return fresh cache hit
  if (cachedData && !isExpired(cachedData)) {
    return cachedData.response;
  }

  // Return stale data while revalidating in background
  if (cachedData && options.staleWhileRevalidate) {
    revalidateInBackground(config, cacheKey, options);
    return cachedData.response;
  }

  // Cache miss or expired data
  const response = await fetchWithRetry(config, options.retry);
  saveToCache(cacheKey, response, options.ttl);
  return response;
}
```

That's it! The rest is just implementation details for handling storage, retries, and cache invalidation.

## TypeScript Support

axios-cache-lite includes TypeScript definitions:

```typescript
import { cachedAxios, CacheOptions } from 'axios-cache-lite';

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

## Installation

Getting started is easy:

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

## Conclusion

axios-cache-lite is designed to be the simplest way to add caching to your Axios requests. It's:

- **Lightweight**: No external dependencies beyond Axios
- **Simple**: Works out of the box with sensible defaults
- **Powerful**: Includes advanced features when you need them
- **Fast**: Makes your app feel significantly more responsive

Give it a try and let me know what you think! Star the [GitHub repository](https://github.com/Nom-nom-hub/axios-cache-lite) to unlock Pro features and support the project.

## Links

- [GitHub Repository](https://github.com/Nom-nom-hub/axios-cache-lite)
- [npm Package](https://www.npmjs.com/package/axios-cache-lite)
- [Documentation](https://axios-cache-lite.js.org)

---

What caching strategies do you use in your projects? Let me know in the comments!
