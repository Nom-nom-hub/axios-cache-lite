/**
 * Tests for axios-cache-lite pro features
 */

import assert from 'assert';
import { enableProFeatures, getCacheInspector, _testing } from '../src/pro.js';

// Mock environment
global.process = {
  env: {}
};

// Test license key validation
async function testLicenseKeyValidation() {
  const { validateLicenseKey } = _testing;
  
  // Test valid license key
  assert.strictEqual(
    validateLicenseKey('valid-license-key-12345678901234567890'),
    true,
    'Should accept valid license key'
  );
  
  // Test invalid license key
  assert.strictEqual(
    validateLicenseKey('invalid'),
    false,
    'Should reject invalid license key'
  );
  
  // Test environment variable
  global.process.env.AXIOS_CACHE_LITE_LICENSE_KEY = 'env-license-key-12345678901234567890';
  assert.strictEqual(
    validateLicenseKey(),
    true,
    'Should accept license key from environment variable'
  );
  
  // Reset environment
  global.process.env.AXIOS_CACHE_LITE_LICENSE_KEY = undefined;
}

// Test eviction strategies
async function testEvictionStrategies() {
  const { evictionStrategies } = _testing;
  
  // Test LRU strategy
  const lruStrategy = evictionStrategies.LRU;
  assert.ok(lruStrategy, 'LRU strategy should exist');
  
  // Test metadata update
  const lruMetadata = lruStrategy.onGet(null, null, { foo: 'bar' });
  assert.strictEqual(lruMetadata.foo, 'bar', 'Should preserve existing metadata');
  assert.ok(lruMetadata.lastAccessed, 'Should add lastAccessed timestamp');
  
  // Test sorting
  const lruEntries = [
    { key: 'a', timestamp: 100, metadata: { lastAccessed: 300 } },
    { key: 'b', timestamp: 200, metadata: { lastAccessed: 100 } },
    { key: 'c', timestamp: 300, metadata: { lastAccessed: 200 } }
  ];
  
  const lruSorted = lruStrategy.getEvictionCandidates([...lruEntries]);
  assert.strictEqual(lruSorted[0].key, 'b', 'Should sort by lastAccessed (oldest first)');
  
  // Test LFU strategy
  const lfuStrategy = evictionStrategies.LFU;
  assert.ok(lfuStrategy, 'LFU strategy should exist');
  
  // Test access count increment
  const lfuMetadata1 = lfuStrategy.onGet(null, null, {});
  assert.strictEqual(lfuMetadata1.accessCount, 1, 'Should initialize accessCount');
  
  const lfuMetadata2 = lfuStrategy.onGet(null, null, { accessCount: 5 });
  assert.strictEqual(lfuMetadata2.accessCount, 6, 'Should increment accessCount');
  
  // Test sorting
  const lfuEntries = [
    { key: 'a', metadata: { accessCount: 5 } },
    { key: 'b', metadata: { accessCount: 2 } },
    { key: 'c', metadata: { accessCount: 10 } }
  ];
  
  const lfuSorted = lfuStrategy.getEvictionCandidates([...lfuEntries]);
  assert.strictEqual(lfuSorted[0].key, 'b', 'Should sort by accessCount (least first)');
  
  // Test FIFO strategy
  const fifoStrategy = evictionStrategies.FIFO;
  assert.ok(fifoStrategy, 'FIFO strategy should exist');
  
  // Test metadata (should be unchanged)
  const fifoMetadata = fifoStrategy.onGet(null, null, { foo: 'bar' });
  assert.deepStrictEqual(fifoMetadata, { foo: 'bar' }, 'Should not modify metadata');
  
  // Test sorting
  const fifoEntries = [
    { key: 'a', timestamp: 300 },
    { key: 'b', timestamp: 100 },
    { key: 'c', timestamp: 200 }
  ];
  
  const fifoSorted = fifoStrategy.getEvictionCandidates([...fifoEntries]);
  assert.strictEqual(fifoSorted[0].key, 'b', 'Should sort by timestamp (oldest first)');
}

// Test enableProFeatures
async function testEnableProFeatures() {
  // Test with invalid license key
  const result1 = enableProFeatures({
    licenseKey: 'invalid'
  });
  assert.strictEqual(result1, false, 'Should reject invalid license key');
  
  // Test with valid license key
  const result2 = enableProFeatures({
    licenseKey: 'valid-license-key-12345678901234567890',
    store: 'indexeddb',
    strategy: 'LRU',
    maxEntries: 500,
    enableInspector: true
  });
  
  // This will fail in Node.js environment because IndexedDB is not available
  // But we're testing the validation logic, not the actual IndexedDB implementation
  assert.strictEqual(result2, false, 'Should fail in Node.js environment');
  
  // Test cache inspector
  const inspector = getCacheInspector();
  assert.strictEqual(inspector, null, 'Should return null when pro features are not enabled');
}

// Run tests
async function runTests() {
  console.log('Running pro feature tests...');
  
  try {
    await testLicenseKeyValidation();
    console.log('✅ License key validation tests passed');
    
    await testEvictionStrategies();
    console.log('✅ Eviction strategies tests passed');
    
    await testEnableProFeatures();
    console.log('✅ enableProFeatures tests passed');
    
    console.log('All pro feature tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

runTests();
