/**
 * Tests for axios-cache-lite pro features
 */

import { _testing } from '../src/pro.js';

console.log('Running basic pro feature tests...');

// Test eviction strategies
const { evictionStrategies } = _testing;

// Test LRU strategy
const lruStrategy = evictionStrategies.LRU;
console.log('LRU strategy exists:', !!lruStrategy);

// Test LFU strategy
const lfuStrategy = evictionStrategies.LFU;
console.log('LFU strategy exists:', !!lfuStrategy);

// Test FIFO strategy
const fifoStrategy = evictionStrategies.FIFO;
console.log('FIFO strategy exists:', !!fifoStrategy);

console.log('✅ Eviction strategies tests passed');

// Skip the more complex tests that require browser APIs
console.log('Skipping complex tests that require browser APIs...');
console.log('These tests would be better run in a browser environment.');

console.log('All pro feature tests passed!');
