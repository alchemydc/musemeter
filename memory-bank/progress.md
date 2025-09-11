# Progress

## What Works
- User can click on an event and see (some) event details.
- Handle 429 rate limiting errors returned by the Ticketmaster API.
- Allowing the user to search for events in a particular City and State. Note this is US centric and thus needs to be reworked.
- Implemented `/api/events` serverless function for paginated event retrieval.
- Implemented `/api/events/:id` serverless function for event details retrieval.
- Updated `.env.template` with new environment variables (`VERCEL_DEV_PORT`, `RADIUS`, `RADIUS_UNIT`).
- Updated `README.md` with deployment instructions for Vercel.
- Removed Express API proxy server and replaced it with Vercel serverless functions.
- Pulling events for a hardcoded region and radius from ticketmaster API.
- Rendering the events in a simple but styled UI.
- Allowing user to add events of interest to Google Calendar.
- Initialized the memory bank with core files.
- Defined the project scope and goals in projectbrief.md.
- Outlined the product vision and user experience in productContext.md.
- Documented the system architecture and technical decisions in systemPatterns.md.
- Described the technologies used and development setup in techContext.md.
- Implemented the display of event types in the event list
- Implemented debouncing for the search input
- Created ClassificationIcon component
- Created useDebounce hook
- Implemented the display of event types in the event list
- Implemented debouncing for the search input
- Created ClassificationIcon component
- Created useDebounce hook
- Created debug utils
- Modified the src/App.tsx file to return results for Boulder, CO by default, if no default location is stored in LocalStorage
- Configured the default number of events per page using environment variables.
- Removed the hardcoded port for the api_proxy server.
- Removed the state input box from the app because it was making the UI unusable on mobile.
- Modified the src/App.tsx file to return results for Boulder, CO by default, if no default location is stored in LocalStorage
- Implemented saving the city to local storage whenever the user searches for a city.
- Implemented making Boulder, CO the default city on page load (unless stored in local storage).
- Save city to local storage so that the user sees results for the last city they searched for the next time they visit
- Modified the src/App.tsx file to return results for Boulder, CO by default, if no default location is stored in LocalStorage
- Implemented saving the city to local storage whenever the user searches for a city.
- Implemented making Boulder, CO the default city on page load (unless stored in local storage).
- Implemented the ability to search for events by city.
- Added functionality to search for artists, leveraging the attractions endpoint under the hood.
- Introduced a new attractions endpoint to support artist-based searches.
- Updated the API layer to handle both city-based and artist-based search queries seamlessly.
- Enhanced the search interface to display results for both events and artists.
- Adjusted components to accommodate the new search capabilities.
- Added unit tests for the attractions endpoint to ensure reliability.
- Verified the functionality of city-based and artist-based searches through integration tests.
- UI now properly returns to the event in the list closing event details.
- UI was displaying house icon for events of type football game, now has a generic icon for all sports.
- The Ticketmaster API returns 429 rate limit errors for larger cities like Denver.  We are now handling this in code.
- Event dates now display correctly in all timezones (off-by-one bug fixed via src/utils/date.ts; calendar invitations use the corrected local date construction).

## What's Left to Build
- Allow user to "like" an event and store the like status in LocalStorage (for now).
- Allow the user to filter events by event type (e.g., music/concert, sports, film, etc.).
- Rework the search functionality to be less US-centric.
- Implement the backend services for user authentication, music event discovery, and Spotify integration.
- Develop the UI for the web and mobile app.
- Integrate with third-party APIs for music events and Spotify.
- Monitor API rate limits and optimize caching strategies.
- Update documentation to reflect the migration to Vercel serverless functions.

## Current Status
- Memory bank initialized.
- Project setup complete.
- Ticketmaster API  chosen for music event discovery.
- Validation of Ticketmaster API in progress.
- SeatGeek API added to the list of music discovery APIs to explore.
- Migrated the project to Vite with React and TypeScript.
- Implemented a server-side proxy to protect the API key, using `npm-run-all` to start both the Vite development server and the proxy server.
- Determined the pagination parameters and response structure for the Ticketmaster API.
- Implemented pagination support in `src/events.ts`, `api_proxy.cjs`, and `src/App.tsx`.
- Implemented city and state search functionality in `src/App.tsx` and `api_proxy.cjs`. (work in progress)
- Implemented a new endpoint in `api_proxy.cjs` to retrieve event details.
- Created a new component called `EventDetails.tsx` to display event details.
- Modified `src/App.tsx` to display event details when an event is clicked.
- Installed `tailwindcss` and `@tailwindcss/vite` and added `@import "tailwindcss";` to `src/index.css`.
- Search sort of works
- Added docs for the Ticketmaster API into the memory bank.


## Known Issues

- Pagination navigation for events and attractions is being confused. When looking at a multi-page list of events found by first searching for an artist, the next page button browses to the next page of artists rather than the next page of events.
- UI doesn't render properly on mobile.  Need to truncate the descriptors to make the search less clunky on mobile.
- We are getting intermittent HTTP/400 errors when rendering event details but only for some events, and seemingly only when the events have been found by searching for a keyword, after searching for artist/attractions.
- It is unclear whether the radius parameter to the Ticketmaster API is being honored.


## Evolution of Project Decisions
- Not thrilled about the Ticketmaster API but it seems to be one of the few free and relatively open options available.
- Deep research has revealed that to get underground events we'll likely need to do some web scraping.
- Our Seatgeek API key was approved so will be taking a look at that API soonish.
