// Test setup file for Jest
// This file runs before all tests

// Set test environment variables
process.env.API_URL = process.env.API_URL || 'http://localhost:3000/api';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';

// Mock fetch if needed (Node.js doesn't have fetch by default in older versions)
if (typeof global.fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

// Increase timeout for API tests
jest.setTimeout(30000);
