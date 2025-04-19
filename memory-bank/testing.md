# Testing Documentation

## Overview
This project uses Jest as its testing framework, along with additional tools:
- `supertest` for HTTP assertions
- `nock` for mocking HTTP requests
- Custom test utilities for common testing scenarios

## Test Structure
```
__tests__/
├── api/                    # API endpoint tests
│   ├── events.test.js     # Tests for /api/events
│   └── eventDetails.test.js # Tests for /api/events/:id
├── setup/
│   └── testSetup.js       # Global test configuration
└── utils/
    └── testUtils.js       # Shared test utilities
```

## Running Tests

### All Tests
```bash
npm test
```

### Watch Mode
Run tests in watch mode (tests re-run when files change):
```bash
npm run test:watch
```

### API Tests Only
Run only the API endpoint tests:
```bash
npm run test:api
```

Watch mode for API tests:
```bash
npm run test:api:watch
```

### Coverage Report
Generate a test coverage report:
```bash
npm run test:coverage
```
The coverage report will be available in the `coverage/` directory.

## Test Environment

### Environment Variables
Tests use the following environment variables (with defaults):
- `VERCEL_DEV_PORT`: Port for the development server (default: 3000)
- `API_KEY`: Ticketmaster API key (default: 'test-api-key')
- `DEFAULT_EVENTS_PER_PAGE`: Number of events per page (default: 7)
- `RADIUS`: Search radius (default: 50)
- `RADIUS_UNIT`: Unit for search radius (default: 'miles')

These defaults are set in `__tests__/setup/testSetup.js`.

### Mocking
The project uses `nock` to mock HTTP requests to external APIs. Mock implementations are centralized in `__tests__/utils/testUtils.js`.

Example of mocking an API call:
```javascript
const { mockTicketmasterEvents } = require('../utils/testUtils');

describe('Events API', () => {
  beforeEach(() => {
    mockTicketmasterEvents();
  });

  it('returns events', async () => {
    // Test implementation
  });
});
```

## Writing Tests

### API Tests
For API endpoints, follow this pattern:
1. Import necessary utilities
2. Set up mocks in `beforeEach`
3. Clean up mocks in `afterEach`
4. Test happy path
5. Test edge cases
6. Test error scenarios

Example:
```javascript
const supertest = require('supertest');
const {
  TEST_API_URL,
  mockTicketmasterEvents,
  mockTicketmasterError
} = require('../utils/testUtils');

describe('GET /api/events', () => {
  beforeEach(() => {
    mockTicketmasterEvents();
  });

  it('returns events for a city', async () => {
    const response = await supertest(TEST_API_URL)
      .get('/api/events')
      .query({ city: 'Denver' });

    expect(response.status).toBe(200);
    expect(response.body._embedded.events).toBeTruthy();
  });

  it('handles errors', async () => {
    mockTicketmasterError(500);
    const response = await supertest(TEST_API_URL)
      .get('/api/events')
      .query({ city: 'Denver' });

    expect(response.status).toBe(500);
  });
});
```

## Best Practices
1. Use the shared test utilities for common operations
2. Clean up mocks after each test
3. Test both success and error cases
4. Keep tests focused and meaningful
5. Use descriptive test names
6. Maintain test isolation (no test should depend on another)

## Adding New Tests
1. Create test files in the appropriate directory
2. Import required utilities from `testUtils.js`
3. Follow the existing patterns for consistency
4. Add new utilities to `testUtils.js` if needed
5. Update this documentation when adding new patterns or conventions
