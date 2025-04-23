/**
 * Simple benchmark for axios-cache-lite
 */

import { cachedAxios, clearCache } from '../src/index.js';
import { enableProFeatures } from '../src/pro.js';

// Polyfill for performance.now() in Node.js
if (typeof performance === 'undefined') {
  global.performance = {
    now: () => Date.now()
  };
}

// Mock axios for consistent results
global.axios = async (config) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100));
  return { data: { id: 1, name: 'Test' }, config };
};

// Mock localStorage
const mockStorage = new Map();
global.localStorage = {
  getItem: (key) => mockStorage.get(key),
  setItem: (key, value) => mockStorage.set(key, value),
  removeItem: (key) => mockStorage.delete(key),
  clear: () => mockStorage.clear()
};

// Mock window for IndexedDB
global.window = {
  indexedDB: {
    open: () => {
      const request = {
        onupgradeneeded: null,
        onsuccess: null,
        onerror: null
      };

      // Simulate async open
      setTimeout(() => {
        if (request.onupgradeneeded) {
          request.onupgradeneeded({
            target: {
              result: {
                objectStoreNames: {
                  contains: () => false
                },
                createObjectStore: () => ({
                  keyPath: 'key'
                })
              }
            }
          });
        }

        if (request.onsuccess) {
          request.onsuccess({
            target: {
              result: {
                transaction: () => ({
                  objectStore: () => ({
                    get: () => {
                      const req = {};
                      setTimeout(() => {
                        if (req.onsuccess) req.onsuccess({ target: { result: null } });
                      }, 5);
                      return req;
                    },
                    put: () => {
                      const req = {};
                      setTimeout(() => {
                        if (req.onsuccess) req.onsuccess();
                      }, 5);
                      return req;
                    },
                    delete: () => {
                      const req = {};
                      setTimeout(() => {
                        if (req.onsuccess) req.onsuccess();
                      }, 5);
                      return req;
                    },
                    clear: () => {
                      const req = {};
                      setTimeout(() => {
                        if (req.onsuccess) req.onsuccess();
                      }, 5);
                      return req;
                    },
                    getAll: () => {
                      const req = {};
                      setTimeout(() => {
                        if (req.onsuccess) req.onsuccess({ target: { result: [] } });
                      }, 5);
                      return req;
                    }
                  })
                })
              }
            }
          });
        }
      }, 5);

      return request;
    }
  }
};

/**
 * Run a benchmark
 * @param {string} name - Benchmark name
 * @param {Function} fn - Function to benchmark
 * @param {number} iterations - Number of iterations
 */
async function runBenchmark(name, fn, iterations = 100) {
  console.log(`Running benchmark: ${name} (${iterations} iterations)`);

  const start = performance.now();

  for (let i = 0; i < iterations; i++) {
    await fn(i);
  }

  const end = performance.now();
  const totalTime = end - start;
  const avgTime = totalTime / iterations;

  console.log(`Total time: ${totalTime.toFixed(2)}ms`);
  console.log(`Average time per operation: ${avgTime.toFixed(2)}ms`);
  console.log('---');

  return { name, totalTime, avgTime, iterations };
}

/**
 * Run all benchmarks
 */
async function runAllBenchmarks() {
  console.log('Starting axios-cache-lite benchmarks...');
  console.log('===================================');

  const results = [];

  // Clear cache before each benchmark
  clearCache();

  // Benchmark 1: Direct axios (no cache)
  results.push(await runBenchmark('Direct axios (no cache)', async () => {
    await global.axios({ url: 'https://api.example.com/data' });
  }, 10));

  // Benchmark 2: First request (cache miss)
  results.push(await runBenchmark('First request (cache miss)', async (i) => {
    clearCache();
    await cachedAxios({ url: `https://api.example.com/data/${i}` });
  }, 10));

  // Benchmark 3: Second request (cache hit)
  results.push(await runBenchmark('Second request (cache hit)', async () => {
    const url = 'https://api.example.com/data';
    // First request to populate cache
    await cachedAxios({ url });
    // Second request should hit cache
    await cachedAxios({ url });
  }, 10));

  // Benchmark 4: Stale-while-revalidate
  results.push(await runBenchmark('Stale-while-revalidate', async () => {
    const url = 'https://api.example.com/data';
    // First request to populate cache with short TTL
    await cachedAxios({ url }, { ttl: 1 }); // 1ms TTL
    // Wait for TTL to expire
    await new Promise(resolve => setTimeout(resolve, 5));
    // Second request should use stale data but revalidate
    await cachedAxios({ url });
  }, 10));

  // Benchmark 5: Pro features with IndexedDB
  console.log('Enabling Pro features...');
  enableProFeatures({
    store: 'indexeddb',
    strategy: 'LRU',
    licenseKey: 'test-license-key-12345678901234567890',
    maxEntries: 1000
  });

  results.push(await runBenchmark('Pro: IndexedDB + LRU (first request)', async (i) => {
    clearCache();
    await cachedAxios({ url: `https://api.example.com/data/${i}` });
  }, 10));

  results.push(await runBenchmark('Pro: IndexedDB + LRU (cache hit)', async () => {
    const url = 'https://api.example.com/data';
    // First request to populate cache
    await cachedAxios({ url });
    // Second request should hit cache
    await cachedAxios({ url });
  }, 10));

  // Summary
  console.log('Benchmark Summary:');
  console.log('=================');

  results.forEach(result => {
    console.log(`${result.name}:`);
    console.log(`  Average time: ${result.avgTime.toFixed(2)}ms`);
  });

  // Calculate speedup
  const directAxios = results.find(r => r.name === 'Direct axios (no cache)');
  const cacheHit = results.find(r => r.name === 'Second request (cache hit)');

  if (directAxios && cacheHit) {
    const speedup = directAxios.avgTime / cacheHit.avgTime;
    console.log(`\nCache hit is ${speedup.toFixed(1)}x faster than direct axios!`);
  }

  return results;
}

// Run benchmarks
runAllBenchmarks().catch(console.error);
