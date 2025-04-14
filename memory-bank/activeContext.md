# Active Context


## Current Work Focus
- Make the landing page return results for Boulder, CO by default, if no default location is stored in LocalStorage


## Recent Changes
- Created projectbrief.md with core project details.
- Created productContext.md outlining the product vision and goals.
- Created systemPatterns.md to define the system architecture and key technical decisions.
- Created techContext.md to document the technologies used and development setup.
- Created progress.md to track the project's status and known issues.
- Create a separate Node/Express proxy server to handle authenticated API calls to third party API's (starting with Ticketmaster). This design was chosen to prevent putting API keys in client side code.
- Retrieve and display the name, date, time, and venue for all events from the Ticketmaster API for a given city and radius using Vite and React.
- Added dark mode support to the event view
- Added a google calendar link to allow the user to add an event of interest to their calendar
- Removed the link to Perplexity that was serving as the title for each event.
- Added a new component called `EventDetails.tsx` to display the event details.
- Modified the `src/App.tsx` file to display the `EventDetails.tsx` component when an event is clicked.
- Modified the `api_proxy.cjs` file to add a new endpoint to retrieve the details of a specific event.
- Added some detail about the type of event (eg sports vs music etc) in the event list (using styled icons)
- Implemented first stab at city and state search functionality. (work in progress).  States are very US centric so we want to move on from that pattern.
- Handled 429 rate limit errors from the Ticketmaster API.  There's probably a better way to do this, as we are presently surfacing the 429 in the UI. Going forward we should consider quietly retrying the request and showing a loading spinner while waiting for the retry.
- Updated the api_proxy.cjs and vite.config.ts files to use the API_PROXY_PORT variable.
- Updated the .env file to include DEFAULT_EVENTS_PER_PAGE=7 and VITE_DEFAULT_EVENTS_PER_PAGE=7.
- Updated the api_proxy.cjs file to access the DEFAULT_EVENTS_PER_PAGE variable from process.env.
- Updated the src/App.tsx file to read the VITE_DEFAULT_EVENTS_PER_PAGE variable from import.meta.env.
- Removed the state input from the app because it was making the UI unreadable on mobile.

## Next Steps
- Allow the user to filter events by event type (eg music/concert, sports, film, etc.)
- Investigate whether the radius parameter to the Ticketmaster API is being honored.
- Determine the best way to integrate with Spotify for user preferences.

## Important Patterns and Preferences
- Following the memory bank structure defined in .clinerules.
- Documenting all decisions and changes in the memory bank.
- Using `npm-run-all` to start both the Vite development server and the proxy server simultaneously.
- Using Tailwind to style HTML output

## Learnings and Project Insights
- The project requires a strong focus on personalization and user experience.
- Integration with external APIs (music events, Spotify) will be crucial.
- The SeatGeek API also looks interesting and has been added to the list of music discovery APIs to explore.
