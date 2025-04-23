# Introducing axios-cache-lite: Zero-Config Caching for Axios

![axios-cache-lite logo](https://github.com/Nom-nom-hub/axios-cache-lite/raw/main/logo.png)

I'm excited to announce **axios-cache-lite**, a zero-configuration caching solution for Axios in just ~100 lines of code!

## Key Features

- **Zero Configuration**: Works out of the box with sensible defaults
- **Lightweight**: Core functionality in ~100 lines of code
- **Dual-Layer Caching**: In-memory + localStorage for optimal performance
- **TTL Expiration**: Set time-to-live for cache entries
- **Stale-While-Revalidate**: Return stale data immediately while fetching fresh data
- **Automatic Retry**: Built-in retry mechanism with exponential backoff
- **TypeScript Support**: Full type definitions included

## Basic Usage

```javascript
import { cachedAxios } from 'axios-cache-lite';

// Use like regular axios, but with caching
const response = await cachedAxios({
  url: 'https://api.example.com/data'
});

// That's it! Your requests are now cached.
```

## Pro Features (Free for GitHub Stars!)

Star this repository to unlock Pro features:

- **IndexedDB Storage**: Store more data with IndexedDB
- **Advanced Cache Strategies**: LRU, LFU, and FIFO eviction
- **Cache Size Management**: Auto-prune old entries
- **Cache Inspector**: Debug and monitor your cache

```javascript
import { enableProFeatures } from 'axios-cache-lite/pro';

await enableProFeatures({
  licenseKey: '@yourusername', // Your GitHub username with @ prefix
  store: 'indexeddb',
  strategy: 'LRU'
});
```

## Links

- [Documentation](https://axios-cache-lite.js.org)
- [npm Package](https://www.npmjs.com/package/axios-cache-lite)
- [Dev.to Article](https://dev.to/nomnomhub/introducing-axios-cache-lite-zero-config-caching-for-axios-in-100-lines-of-code-2g4i)

I'd love to hear your feedback and suggestions!
