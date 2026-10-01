# AGENTS.md

This file provides guidance to coding agents when working with code in this repository.

## What this is

MuseMeter: a Next.js 15 (App Router, React 19, Tailwind 4) app for finding live events via the Ticketmaster Discovery API. Deployed on Vercel (`vercel.json` pins the Next.js preset).

## Commands

```bash
npm run dev            # next dev
npm run build          # next build
npm run lint           # eslint (only lints .ts/.tsx)
npm test               # jest (ESM via --experimental-vm-modules)
npm run test:api       # only __tests__/api/
npm run test:coverage  # what CI runs (Node 20); uploads to Codecov

# single test file / single test
node --experimental-vm-modules node_modules/jest/bin/jest.js __tests__/api/events.test.js
node --experimental-vm-modules node_modules/jest/bin/jest.js -t "test name substring"
```

`jest.config.js` sets `collectCoverage: true`, so every run prints a coverage report and writes `coverage/`. Add `--coverage=false` for quieter single-test runs.

Copy `.env.template` to `.env.local` for local dev. `API_KEY` (Ticketmaster) is server-only; `NEXT_PUBLIC_DEFAULT_EVENTS_PER_PAGE` is the client-side page size, separate from server-side `DEFAULT_EVENTS_PER_PAGE`. `RADIUS`/`RADIUS_UNIT` apply to city searches.

## Architecture

- **API proxy layer** (`app/api/**/route.ts`): thin Next.js route handlers that inject `API_KEY` and forward to `https://app.ticketmaster.com/discovery/v2/...` via axios. The key never reaches the client. Routes: `events` (requires `city` or `keyword`; optional `segmentId`, `page`, `size`), `events/[id]`, `attractions` (requires `keyword`), `attractions/[id]`. All share the same error shape `{ error }` with special handling for upstream 429 (`retryAfter`) and 404. `events/[id]` validates the ID against `^[a-zA-Z0-9-]+$` before building the upstream URL; `attractions/[id]` does not (and calls `/attractions/{id}` without `.json`). The events route returns 404 (not an empty 200) when Ticketmaster returns no `_embedded.events`.
- **Client fetch layer** (`app/lib/events.ts`): browser-side wrappers that call the local `/api/*` routes and throw on non-OK using the `error` field. Searching events by attraction resolves the attraction name first, then searches events by `keyword=<name>`. Types for Ticketmaster responses live in `app/lib/types.ts`.
- **UI** (`app/page.tsx`): a single large `'use client'` component holding all state — search mode (city vs. attraction), debounced search input, pagination, segment filters (Music/Sports/Arts & Theatre, hard-coded Ticketmaster segment IDs), and the selected event/attraction. City and active segments persist in `localStorage`. `EventDetails` and `AttractionList` are child components.
- **Dates** (`app/utils/date.ts`): build event dates from Ticketmaster's `localDate`/`localTime` components with `new Date(y, m, d, h, min)`. Do not use `new Date('YYYY-MM-DD')` — it parses as UTC and caused an off-by-one-day bug.

## Tests

- Jest tests are plain `.js` ESM files under `__tests__/` that import the TypeScript route handlers directly (e.g. `import { GET } from '../../app/api/events/route.ts'`) and invoke them with a `NextRequest`; `ts-jest` transforms the `.ts` side.
- Ticketmaster is mocked with `nock` against `https://app.ticketmaster.com`; `__tests__/setup/testSetup.js` sets default env vars and resets nock between tests.
- Only API routes and `utils/date` are tested; there are no React component tests.

## Docs

`memory-bank/` (and `.clinerules`, a Cline memory-bank workflow) hold project context and `ticketmaster_api.md` API notes. Parts of these and the README predate the Next.js migration and still describe the old Vite + Vercel serverless (`src/`, `api/`) setup — trust the code over them.
