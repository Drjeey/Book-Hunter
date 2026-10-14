# Development log

## Increment 0 — architecture and repository foundation

- **Built:** Git repository, initial project folders, README, architecture/setup notes, architecture decisions, and a Node.js HTTP health endpoint.
- **Concepts:** Browser/client, frontend, HTTP/API, backend, database, JSON, and modular monolith.
- **Database changes:** None. The existing backend health API is unchanged. The React Discover shell is the first UI increment.
- **Verification:** Confirmed the target folder was empty before creating the foundation. `npm run check` passed. `GET /api/v1/health` returned HTTP 200 with `{"status":"ok","service":"book-hunt-api"}`; an unknown route returned HTTP 404. Git flagged an ownership mismatch in this environment when checking status; no global Git settings were changed.
- **Stack decision:** React frontend and Node.js backend; Python/FastAPI removed at the user's direction. Node.js v26.5.0 and npm v11.17.0 are available.
- **Frontend design review:** Reviewed the provided Stitch export. Accepted the paper/raspberry palette and editorial typography; noted the export is desktop-only and contains preview tabs and fictional external-catalog content. Kept those out of the shipped screen and added a responsive mobile adaptation.
- **Frontend built:** Created the React + TypeScript + Vite app shell with Tailwind tokens and PWA manifest/service worker. The Discover search control is visibly disabled until the book-search increment.
- **Verification:** `npm run build` passed TypeScript checking and production bundling; Vite PWA generated the manifest and service worker with 6 precached assets. npm reported 0 vulnerabilities.
- **Browser review:** Opened the local preview at 681px wide. Confirmed the mobile navigation is visible at full viewport width and the document has no horizontal overflow. A stylesheet rename briefly interrupted hot reload; a page reload restored the screen, and the production build passes. Responsive desktop rules are in place; this preview surface is currently mobile-sized.
- **Next:** Continue with the user-profile increment, preparing a separate Stitch prompt before designing that screen.

## Increment 1 — reader profile design brief

- **Prepared:** A feature-sized Google Stitch prompt for the Reader Profile screen, reusing the shared pink Book Hunt design system.
- **Scope:** A single private owner profile with display name and optional avatar. The prompt excludes authentication, multiple accounts, taste questions, and unspecified settings.
- **Teaching point:** Separate a feature's UX/data scope from implementation; get a reviewable screen design before coding its form and persistence.
- **Result:** The user supplied the generated profile design in the updated Stitch archive; it is reviewed in Increment 2 below.

## Increment 2 — reader profile

- **Reviewed:** The supplied Stitch export provides a desktop form, a mobile concept, validation and saved-state ideas, plus reviewer-only mockups. Kept the form and responsive navigation; omitted the duplicated phone preview, reviewer controls, sample personal data, and promises not backed by the app.
- **Built:** Added a Profile route to desktop and mobile navigation, a required display name, optional PNG/JPG avatar (up to 2 MB), dirty-state-aware Save and Cancel actions, inline validation, and success/error feedback.
- **Storage:** One profile is stored in IndexedDB in the current browser on this device. Avatar image bytes are kept as a Blob; no profile data is sent to the backend.
- **Teaching point:** IndexedDB stores structured browser data and image blobs; the UI owns draft state while the storage module persists only after Save.
- **Verification:** `npm run build` passed TypeScript and Vite production bundling. The local browser preview showed the profile screen and navigation; whitespace-only input produced the required-name validation message, and Cancel restored the pristine form.
- **Next:** Plan the book database schema as the next roadmap increment before connecting search or library features.

## Increment 3 — database schema plan

- **Learned and documented:** Tables, rows, columns, primary and foreign keys, one-to-many and many-to-many relationships, normalization, constraints, indexes, transactions, and migrations.
- **Designed:** A first PostgreSQL model with `users`, `books`, and `user_books`. Catalog metadata is stored once; the join table stores the reader's relationship and shelf status. One owner row supports the single-user app without adding authentication fields.
- **Scope:** Ratings, notes, taste preferences, author entities, scanner data, and bookstore visits are deferred until their features need them. The browser-only Reader Profile remains in IndexedDB and is not synchronized to PostgreSQL.
- **Verification:** Reviewed the schema plan against the existing PostgreSQL architecture decision and the single-user scope. No tables were created in this design increment.
- **Next:** Implement and verify the first small PostgreSQL migration for the three planned tables.
