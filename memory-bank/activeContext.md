# Active Context

## Current Work Focus
Reading and updating the memory bank.
# Active Context


## Recent Changes
- Created projectbrief.md with core project details.
- Created productContext.md outlining the product vision and goals.
- Created systemPatterns.md to define the system architecture and key technical decisions.
- Created techContext.md to document the technologies used and development setup.
- Created progress.md to track the project's status and known issues.
- Retrieve and display the name, date, time, and venue for all events from the Ticketmaster API for a given city and radius using Vite and React, with a server-side proxy to protect the API key.
- Added dark mode support to the event view
- Added a google calendar link to allow the user to add an event of interest to their calendar
- Rendered each event name as a link to perplexity search with the event name and venue as search parameters.
- Renamed `src/index.ts` to `src/events.ts` and moved the code related to fetching events to `src/events.ts`.
- Updated the import statement in `src/main.tsx`.
- Removed `src/App.css` and updated `src/App.tsx` to remove the import of `src/App.css`.

## Next Steps

- Add support for handling pagination of the ticketmaster api in events.ts
- Add support for navigating pagination of events in the UI
- Continue to validate the API usage and pricing of the Ticketmaster API.
- Investigate whether the radius parameter to the Ticketmaster API is being honored.
- Handle 429 rate limit errors from the Ticketmaster API.
- Determine the best way to integrate with Spotify for user preferences.
- Validate Vite+React as UI framework for the web and mobile app.

## Important Patterns and Preferences
- Following the memory bank structure defined in .clinerules.
- Documenting all decisions and changes in the memory bank.
- Using `npm-run-all` to start both the Vite development server and the proxy server simultaneously.

## Learnings and Project Insights
- The project requires a strong focus on personalization and user experience.
- Integration with external APIs (music events, Spotify) will be crucial.
- The SeatGeek API also looks interesting and has been added to the list of music discovery APIs to explore.
- We can use perplexity to create links for events we are interested in so we don't have to use ticketmaster links. The syntax is `https://www.perplexity.ai/search?q=boulder%20theater `
