# Progress

## What Works
- An API proxy server implemented in node/express to prevent API keys from ending up in client side code
- Pulling events for a hardcoded region and radius from ticketmaster API.
- Rendering the events in a simple but styled UI.
- Allowing user to add events of interest to Google Calendar.
- Allowing the user to see more about an event of interest by linking them to a perplexity search.
- Initialized the memory bank with core files.
- Defined the project scope and goals in projectbrief.md.
- Outlined the product vision and user experience in productContext.md.
- Documented the system architecture and technical decisions in systemPatterns.md.
- Described the technologies used and development setup in techContext.md.

## What's Left to Build
- Handle 429 rate limiting errors returned by the Ticketmaster API
- Implement the backend services for user authentication, music event discovery, and Spotify integration.
- Develop the UI for the web and mobile app.
- Integrate with third-party APIs for music events and Spotify.
- Deploy the app to Vercel.

## Current Status
- Memory bank initialized.
- Project setup complete.
- Ticketmaster API tentatively chosen for music event discovery, pending validation.
- Validation of Ticketmaster API in progress.
- SeatGeek API added to the list of music discovery APIs to explore.
- Migrated the project to Vite with React and TypeScript.
- Implemented a server-side proxy to protect the API key, using `npm-run-all` to start both the Vite development server and the proxy server.
- Determined the pagination parameters and response structure for the Ticketmaster API.
- Implemented pagination support in `src/events.ts`, `server.cjs`, and `src/App.tsx`.
- Implemented city and state search functionality in `src/App.tsx` and `server.cjs`. (work in progress)
- Installed `tailwindcss` and `@tailwindcss/vite` and added `@import "tailwindcss";` to `src/index.css`.

## Known Issues
- It is unclear whether the radius parameter to the Ticketmaster API is being honored.
- The Ticketmaster API returns 429 rate limit errors for larger cities like Denver.

## Evolution of Project Decisions
- The initial plan was to use a microservices architecture, but this may be reevaluated based on the complexity of the project.
- The choice of Supabase for the backend may be revisited if it does not meet the project's needs.
