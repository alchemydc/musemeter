# System Patterns

## System Architecture

### Frontend Layer
- React application using TypeScript
- Component-based UI architecture
- Client-side routing with React Router
- State management with React Query for server state
- Dark mode support via Tailwind CSS

### API Layer
- Vercel serverless functions for third-party API calls
- RESTful endpoints for event data
    - `/api/events`: Retrieves a paginated list of events based on city and radius.
    - `/api/events/:id`: Retrieves details for a specific event.
- Rate limiting and caching implementation
- Error handling and logging strategy
- Request validation middleware

### Integration Layer
- Ticketmaster API integration for event discovery
- Google Calendar API for event scheduling
- Future Spotify API integration planned

### Data Layer
- Supabase PostgreSQL for structured data
- Real-time subscriptions for live updates
- Row Level Security for data access control
- Event data caching strategy

## Technical Decisions & Rationales

### API Security
- Express proxy server to protect API keys
- CORS configuration for secure client access
- Rate limiting to prevent abuse
- Request validation for data integrity

### Frontend Architecture
- Vite for fast development and optimal builds
  - The Vite dev server is configured using the `vite.config.ts` file.
  - The `allowedHosts` setting is configured using the `ALLOWED_HOSTNAMES` environment variable.
  - The `proxy` setting is configured using the `API_PROXY_PORT` environment variable. This configures Vite to use the API Proxy for authenticated API requests.
  - The Vite dev server is configured using the `vite.config.ts` file.
  - The `allowedHosts` setting is configured using the `ALLOWED_HOSTNAMES` environment variable.
  - The `proxy` setting is configured using the `API_PROXY_PORT` environment variable. This configures Vite to use the API Proxy for authenticated API requests.
- TypeScript for type safety and better DX
- Tailwind CSS for maintainable styling
- Component-driven development with atomic design

### State Management
- React Query for server state
- Local state with useState/useReducer
- URL state for shareable routes
- Persistent state in localStorage where needed

### Testing Strategy
- Unit tests with Jest and React Testing Library
- Integration tests for API endpoints
- E2E tests with Cypress (planned)
- Continuous testing in CI/CD pipeline

## Design Patterns

### Frontend Patterns
- Custom hooks for reusable logic
- Render props for component composition
- Container/Presenter pattern for separation of concerns
- Error boundaries for graceful failure handling

### Backend Patterns
- Repository pattern for data access
- Middleware pattern for request processing
- Strategy pattern for API integrations
- Observer pattern for event handling

## Component Architecture

### Core Components
- EventList: Main event display component
- EventCard: Individual event display
- SearchFilters: Event filtering interface
- CalendarIntegration: Google Calendar integration
- EventDetails: Displays detailed information about a specific event.

### Shared Components
- Button: Reusable button component
- Modal: Popup dialog component
- ErrorBoundary: Error handling wrapper
- LoadingSpinner: Loading state indicator

## Implementation Roadmap

### Phase 1 (Current)
- ✅ Basic event discovery with Ticketmaster API
- ✅ Event display with dark mode support
- ✅ Google Calendar integration
- ✅ Implemented event details view [work in progress]

### Phase 2 (Next)
- User authentication with Supabase
- Personalized event recommendations
- Event favoriting and saving
- Email notifications for saved events

### Phase 3 (Future)
- Spotify integration for music preferences
- Social sharing features
- Mobile app development
- Advanced event filtering and search
