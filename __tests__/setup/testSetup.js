import { jest } from '@jest/globals';
import nock from 'nock';

// Set up environment variables for tests
process.env.VERCEL_DEV_PORT = process.env.VERCEL_DEV_PORT || '3000';
process.env.API_KEY = process.env.API_KEY || 'test-api-key';
process.env.DEFAULT_EVENTS_PER_PAGE = process.env.DEFAULT_EVENTS_PER_PAGE || '7';
process.env.RADIUS = process.env.RADIUS || '50';
process.env.RADIUS_UNIT = process.env.RADIUS_UNIT || 'miles';

// Reset mocks and clean up before each test
beforeEach(() => {
  jest.clearAllMocks();
  nock.cleanAll();
});

// Clean up after all tests
afterAll(() => {
  jest.clearAllMocks();
  nock.restore();
});
