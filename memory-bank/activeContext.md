# Active Context

## Current Development Focus
- Setting up automated testing infrastructure
- Implementing test coverage reporting and monitoring
- Improving API endpoint input validation and error handling

## Latest Changes
- Set up Jest testing framework with ES module support
- Created comprehensive test suite for API endpoints
- Configured GitHub Actions for automated testing
- Integrated Codecov for test coverage reporting
- Added input validation and error handling to serverless functions
- Fixed off-by-one event date bug by replacing naive Date('YYYY-MM-DD') parsing with component-based local construction (src/utils/date.ts) and updated calendar URL generation; added unit tests for the new date utilities.
- Updated documentation with testing instructions
- Added GitHub Actions and Codecov badges to README

## Testing Infrastructure
### Local Testing
- Jest runs tests with ESM support
- Mock API responses using `nock`
- Environment variables configured in test setup
- Added unit tests for date utilities (src/utils/date.ts) to validate local date construction and formatting.

### CI/CD Pipeline
- GitHub Actions runs tests on push and pull requests
- Coverage reports uploaded to Codecov
- Branch-specific coverage tracking
- Coverage thresholds set at 70%

### Test Files
- `__tests__/api/events.test.js`: Event listing endpoint tests
- `__tests__/api/eventDetails.test.js`: Event details endpoint tests
- `__tests__/setup/testSetup.js`: Global test configuration
- `__tests__/utils/testUtils.js`: Shared test utilities

## Environment Setup
### Local Development
- Frontend runs on Vite dev server
- Backend uses Vercel dev server for serverless functions
- Environment variables defined in `.env.template`:
  - `VERCEL_DEV_PORT=3000`
  - `RADIUS=50`
  - `RADIUS_UNIT=miles`
  - `DEFAULT_EVENTS_PER_PAGE=7`

### Configuration Files
- `vercel.json`: Routes API requests and handles CORS
- `vite.config.ts`: Proxies API requests during development
- `jest.config.js`: Test configuration with ESM support
- `codecov.yml`: Coverage reporting configuration
- Serverless functions in `/api` directory

## Known Issues and Solutions
- Issue: HTML parsing in Vercel dev server
  - Solution: Added `assetsInclude: ['**/*.html']` to Vite config
- Issue: ES module compatibility
  - Solution: Converted serverless functions to use ES module syntax
- Issue: Test environment setup
  - Solution: Added proper ESM support and test utilities

## Next Steps
1. Monitor test coverage and maintain/improve coverage levels
2. Add more edge case tests for API endpoints
3. Set up component testing for frontend
4. Implement API response caching
5. Add integration tests for frontend-API interaction
6. Consider adding end-to-end testing with Cypress or Playwright

## Development Workflow
1. Start Vercel dev server: `vercel dev`
2. Run tests: `npm run test:api`
3. Check coverage: `npm run test:coverage`
4. Frontend automatically proxies API requests to Vercel dev server
5. Use browser dev tools to verify API requests and responses
