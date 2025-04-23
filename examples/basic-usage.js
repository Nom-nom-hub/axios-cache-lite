/**
 * Basic usage example for axios-cache-lite
 */

import { cachedAxios, clearCache } from 'axios-cache-lite';

// Example 1: Basic usage
async function basicExample() {
  console.log('Example 1: Basic usage');
  
  // First request will hit the network
  console.log('Making first request...');
  const response1 = await cachedAxios({
    url: 'https://jsonplaceholder.typicode.com/todos/1',
    method: 'GET'
  });
  console.log('Response 1:', response1.data);
  
  // Second request will use cache
  console.log('Making second request (should use cache)...');
  const response2 = await cachedAxios({
    url: 'https://jsonplaceholder.typicode.com/todos/1',
    method: 'GET'
  });
  console.log('Response 2:', response2.data);
}

// Example 2: Custom TTL and stale-while-revalidate
async function ttlExample() {
  console.log('\nExample 2: Custom TTL and stale-while-revalidate');
  
  // Clear cache from previous example
  clearCache();
  
  // First request
  console.log('Making first request...');
  const response1 = await cachedAxios({
    url: 'https://jsonplaceholder.typicode.com/todos/2',
    method: 'GET'
  }, {
    ttl: 5000, // 5 seconds
    staleWhileRevalidate: true
  });
  console.log('Response 1:', response1.data);
  
  // Wait for 6 seconds (TTL expired)
  console.log('Waiting for TTL to expire...');
  await new Promise(resolve => setTimeout(resolve, 6000));
  
  // Second request will return stale data but trigger revalidation
  console.log('Making second request (should return stale data but revalidate)...');
  const response2 = await cachedAxios({
    url: 'https://jsonplaceholder.typicode.com/todos/2',
    method: 'GET'
  }, {
    ttl: 5000,
    staleWhileRevalidate: true
  });
  console.log('Response 2 (stale):', response2.data);
  
  // Wait a bit for background revalidation
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Third request will use fresh cache
  console.log('Making third request (should use fresh cache)...');
  const response3 = await cachedAxios({
    url: 'https://jsonplaceholder.typicode.com/todos/2',
    method: 'GET'
  });
  console.log('Response 3 (fresh):', response3.data);
}

// Example 3: Retry logic
async function retryExample() {
  console.log('\nExample 3: Retry logic');
  
  // Clear cache from previous examples
  clearCache();
  
  try {
    // Request to non-existent endpoint (will fail)
    console.log('Making request to non-existent endpoint (will retry 2 times)...');
    const response = await cachedAxios({
      url: 'https://jsonplaceholder.typicode.com/non-existent',
      method: 'GET'
    }, {
      retry: 2
    });
  } catch (error) {
    console.log('Request failed after retries:', error.message);
  }
}

// Run examples
async function runExamples() {
  try {
    await basicExample();
    await ttlExample();
    await retryExample();
    console.log('\nAll examples completed!');
  } catch (error) {
    console.error('Example error:', error);
  }
}

runExamples();
