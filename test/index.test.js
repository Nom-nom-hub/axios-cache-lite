/**
 * Tests for axios-cache-lite
 */

import assert from 'assert';

// Set up mocks before importing the module under test
let mockResponses = [];
let requestCount = 0;

// Mock axios
global.axios = async (config) => {
  requestCount++;

  // Simulate network error if configured
  if (mockResponses.some(r => r.url === config.url && r.error)) {
    const error = new Error('Network Error');
    error.config = config;
    throw error;
  }

  const response = mockResponses.find(r => r.url === config.url)?.response || {
    data: { message: 'Default mock response' }
  };

  return { ...response, config };
};

// Mock localStorage
const mockStorage = new Map();
global.localStorage = {
  getItem: (key) => mockStorage.get(key),
  setItem: (key, value) => mockStorage.set(key, value),
  removeItem: (key) => mockStorage.delete(key),
  clear: () => mockStorage.clear()
};

// Now import the module under test
import { cachedAxios, clearCache } from '../src/index.js';

// Reset mocks before each test
function resetMocks() {
  mockResponses = [];
  requestCount = 0;
  mockStorage.clear();
  clearCache();
}



// Test helper function
async function test(name, testFn) {
  try {
    await testFn();
    console.log(`✅ ${name}`);
    return true;
  } catch (error) {
    console.error(`❌ ${name}: ${error.message}`);
    throw error;
  }
}

// Run tests
async function runTests() {
  console.log('Running tests...');
  resetMocks();

  try {
    await test('should cache responses', async () => {
      mockResponses.push({
        url: 'https://api.example.com/data',
        response: { data: { id: 1, name: 'Test' } }
      });

      // First request should hit the network
      await cachedAxios({ url: 'https://api.example.com/data' });
      assert.strictEqual(requestCount, 1, 'First request should hit the network');

      // Second request should use cache
      await cachedAxios({ url: 'https://api.example.com/data' });
      assert.strictEqual(requestCount, 1, 'Second request should use cache');
    });

    resetMocks();
    await test('should respect TTL', async () => {
      mockResponses.push({
        url: 'https://api.example.com/data',
        response: { data: { id: 1, name: 'Test' } }
      });

      // First request
      await cachedAxios({ url: 'https://api.example.com/data' }, { ttl: 100 });
      assert.strictEqual(requestCount, 1);

      // Wait for TTL to expire
      await new Promise(resolve => setTimeout(resolve, 150));

      // Second request should hit network again
      await cachedAxios({ url: 'https://api.example.com/data' }, { ttl: 100, staleWhileRevalidate: false });
      assert.strictEqual(requestCount, 2, 'Cache should expire after TTL');
    });

    resetMocks();
    await test('should implement stale-while-revalidate', async () => {
      mockResponses.push({
        url: 'https://api.example.com/data',
        response: { data: { id: 1, name: 'Test' } }
      });

      // First request
      const firstResponse = await cachedAxios({ url: 'https://api.example.com/data' }, { ttl: 100 });
      assert.strictEqual(requestCount, 1);

      // Wait for TTL to expire
      await new Promise(resolve => setTimeout(resolve, 150));

      // Second request should return stale data immediately
      const secondResponse = await cachedAxios({ url: 'https://api.example.com/data' });
      assert.deepStrictEqual(secondResponse.data, firstResponse.data, 'Should return stale data');

      // But trigger a background refresh
      await new Promise(resolve => setTimeout(resolve, 50));
      assert.strictEqual(requestCount, 2, 'Should revalidate in background');
    });

    resetMocks();
    await test('should retry on network error', async () => {
      mockResponses.push({
        url: 'https://api.example.com/error',
        error: true
      });

      try {
        await cachedAxios({ url: 'https://api.example.com/error' }, { retry: 2 });
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert.strictEqual(requestCount, 3, 'Should retry twice (3 requests total)');
      }
    });

    resetMocks();
    await test('should clear cache', async () => {
      mockResponses.push({
        url: 'https://api.example.com/data',
        response: { data: { id: 1, name: 'Test' } }
      });

      // First request
      await cachedAxios({ url: 'https://api.example.com/data' });
      assert.strictEqual(requestCount, 1);

      // Clear cache
      clearCache();

      // Second request should hit network again
      await cachedAxios({ url: 'https://api.example.com/data' });
      assert.strictEqual(requestCount, 2, 'Should hit network after clearing cache');
    });

    console.log('All tests passed!');
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

runTests();
