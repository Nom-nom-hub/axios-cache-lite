/**
 * Mock implementation of axios for testing
 */

// Track request count and mock responses
export let requestCount = 0;
export let mockResponses = [];

// Mock axios implementation
const mockAxios = async (config) => {
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

// Reset mocks
export function resetMocks() {
  requestCount = 0;
  mockResponses = [];
}

export default mockAxios;
