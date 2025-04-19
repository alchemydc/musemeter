# Tech Context

## Technologies Used

### Frontend
- React: Component-based UI library for building interactive web interfaces
- Vite: Modern build tool and dev server offering fast HMR and optimized builds
- Tailwind CSS: Utility-first CSS framework for rapid UI development
- TypeScript: Static typing for improved code reliability and developer experience

### Backend & Infrastructure
- Node.js: Server-side JavaScript runtime for building scalable network applications
- Express: Minimal and flexible Node.js web application framework
- Supabase: Open source Firebase alternative providing:
  - PostgreSQL database
  - Authentication with multiple providers
  - Real-time subscriptions
  - Edge functions
- Vercel: Edge network deployment platform optimized for React applications

### APIs & Integration
- Ticketmaster API: Primary source for music event discovery and ticket information
- SeatGeek API: Secondary source for event validation and price comparison
- Spotify API: Music artist information and user playlist integration

#### Ticketmaster API Pagination

The Ticketmaster Discovery API uses the following structure for pagination:

- The response includes `_links`, `_embedded`, and `page` objects.
- The `page` object contains information about the current page in the data source.

### Development Tools
- Git: Distributed version control system for code management
- GitHub: Collaboration platform for code hosting and CI/CD
- VS Code: Primary IDE with extensions for:
  - TypeScript
  - Tailwind CSS
  - ESLint
  - Prettier

### Testing & Quality
- Jest: JavaScript testing framework
- React Testing Library: Component testing utilities
- ESLint: Static code analysis
- Prettier: Code formatting

## Environment Variables

The project uses environment variables to configure various settings. A `.env.template` file is provided to define the required environment variables.

The following environment variables are used:

- `API_KEY`: The API key for the Ticketmaster API.
- `DEFAULT_EVENTS_PER_PAGE`: The default number of events to display per page.
- `VITE_DEFAULT_EVENTS_PER_PAGE`: The default number of events to display per page (for Vite).
- `API_PROXY_PORT`: The port to run the Express API Proxy server on.
- `ALLOWED_HOSTNAMES`: A comma-separated list of hostnames to allow the Vite dev server to respond to.
- `VERCEL_ENV`: The environment variable for Vercel deployment (e.g., production, preview, development).

## Technical Constraints
- Limited budget for third-party APIs and services.
