# Active Context

## Current Development Focus
- Converting Express API to Vercel serverless functions
- Configuring local development environment to use Vercel dev server
- Integrating frontend with serverless functions

## Latest Changes
- Converted API endpoints to ES module syntax for Vercel serverless functions
- Updated Vite configuration to proxy API requests to Vercel dev server
- Added CORS headers and API route rewrites in vercel.json
- Implemented `/api/events` serverless function for paginated event retrieval
- Implemented `/api/events/:id` serverless function for event details retrieval
- Updated `.env.template` with new environment variables (`VERCEL_DEV_PORT`, `RADIUS`, `RADIUS_UNIT`)
- Updated `README.md` with deployment instructions for Vercel
- Removed Express API proxy server and replaced it with Vercel serverless functions

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
- Serverless functions in `/api` directory

## Known Issues and Solutions
- Issue: HTML parsing in Vercel dev server
  - Solution: Added `assetsInclude: ['**/*.html']` to Vite config
- Issue: ES module compatibility
  - Solution: Converted serverless functions to use ES module syntax

## Next Steps
1. Test local development setup with `vercel dev`
2. Verify API endpoints and frontend integration
3. Deploy to production and configure environment variables
4. Remove deprecated Express server files
5. Update documentation to reflect the migration to Vercel serverless functions
6. Monitor API rate limits and optimize caching strategies

## Development Workflow
1. Start Vercel dev server: `vercel dev`
2. Frontend automatically proxies API requests to Vercel dev server
3. Use browser dev tools to verify API requests and responses
