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
- **Result:** The first migration and runner are implemented in Increment 4 below.

## Increment 4 — initial PostgreSQL migration

- **Built:** Added `001_initial_catalog_library.sql` for `users`, `books`, and `user_books`, including primary/foreign keys, uniqueness and check constraints, ISBN and library-query indexes, and one seeded owner row. Added a Node.js runner that records migration versions and applies each migration transactionally under a PostgreSQL advisory lock.
- **Dependencies/configuration:** Added the `pg` Node.js driver and an ignored local `.env` workflow, with `backend/.env.example` as a template.
- **Verification:** `npm run check` passed for the backend files. `npm run migrate` correctly reported that `DATABASE_URL` is missing. Live migration verification is pending because no local PostgreSQL client/server or running Docker engine is available in this environment.
- **Next:** Configure a local PostgreSQL database, apply the migration, and verify the table constraints and safe rerun behavior before wiring database queries into the API.

## Increment 5 — local database setup attempt

- **Attempted:** Set up PostgreSQL 18.6 from the Windows package entry linked by postgresql.org so the migration could be run locally.
- **Result:** The client/server binaries are present, but the installer did not produce a running server. Two cluster initialization attempts stalled before completion; no server responded on `127.0.0.1:5432`.
- **Cleanup:** Removed only the incomplete data directories and generated local connection file created by these attempts. Added `database/.local/` to `.gitignore` for future development database files.
- **Verification status:** No PostgreSQL migration was applied. The runner and SQL remain committed; the live schema/constraint check must be repeated when a local PostgreSQL server is available outside this stalled environment.

## Increment 6 — local PostgreSQL database connected

- **Configured:** Installed PostgreSQL 18.6, started the Windows service, and created a local development database. The existing database is named `book_hunter_dev`; the local `backend/.env` was updated to use that exact name. The password remains local and is not recorded here.
- **Applied:** Ran `npm run migrate`; PostgreSQL recorded and applied `001_initial_catalog_library.sql`.
- **Verified:** Queried the database and confirmed the `books`, `schema_migrations`, `user_books`, and `users` tables exist.
- **Teaching point:** The database name in the connection string must exactly match the database created in PostgreSQL. `.env` keeps machine-specific connection details out of the shared project.
- **Next:** Add a backend book-search endpoint that can look up catalog results, then connect the React Discover form to it.

## Increment 7 — book search

- **Built:** Added `GET /api/v1/books?query=...&page=...` to the Node.js API. It validates the query/page, requests one page of metadata from Open Library, maps it into a small Book Hunt response, and returns clear provider errors.
- **Provider care:** The backend requests only the fields used by the screen, caches each query page in memory for five minutes, coalesces matching in-flight requests, and spaces uncached provider calls at least one second apart.
- **Frontend:** Enabled the Discover search form and connected it through the Vite `/api` proxy. Added result cards with cover fallbacks and source links, loading placeholders, no-match and error states, retry, and paging. My Library remains a placeholder; search does not save records yet.
- **Teaching point:** The backend is an API boundary: it protects the provider integration from the UI and turns provider-specific fields into a stable shape React can use. Search metadata is distinct from a saved catalog row and a personal-library relationship.
- **Source:** Open Library documents the `/search.json` endpoint, selected fields, and page/limit parameters. Its guidance recommends caching, application identification, and low request rates; see [Search API](https://openlibrary.org/dev/docs/api/search) and [API usage guidelines](https://openlibrary.org/developers/api).
- **Next:** Design and implement My Library as a separate feature increment.

## Increment 8 — My Library

- **Reviewed:** Used the supplied Stitch My Library export for its pink editorial style, shelf filters, and responsive card layout. Removed the review-only state controls, invented saved books/dates/quote, broken remote logo, and unsupported offline-storage claims.
- **Built:** Added PostgreSQL-backed Node API routes to list, save, update status, and remove books. Search results now have an Add to My Library action; saved books start at Want to read. The React library screen supports status filters, cover/author fallbacks, loading/error/empty states, status changes, and confirmed removal.
- **Storage:** Book metadata and owner statuses persist in PostgreSQL. Removing a book deletes its owner relationship while preserving catalog metadata. Reader Profile continues to use browser IndexedDB.
- **Next:** Build Ratings and Notes when its design is ready.

## Increment 9 — ratings and notes

- **Built:** Added one optional 1–5 star rating and one editable private note (up to 2000 characters) per saved book. The My Library card now opens an inline editor with Save, Cancel, and clearing options.
- **Database:** `002_library_reflections.sql` adds two nullable fields to `user_books` with check constraints. The migration was applied to the local `book_hunter_dev` database; the earlier migration was already present.
- **API:** `PATCH /api/v1/library/:id/reflection` validates the rating and note, updates only the owner's saved book, and returns their stored values. `GET /api/v1/library` includes them.
- **UI:** Drafts stay open on save failure. The collapsed card displays the saved rating and note. Ratings and notes are private to the single-user library.
- **Build check:** Backend syntax check passed. TypeScript and Vite produced a successful build output; the combined command remained open after that output and was stopped. The generated files were checked separately.

## Increment 10 — reading taste profile

- **Built:** Added a Reading taste section below Reader Profile. The owner can select favorite genres and themes, preferred pace and writing style, interest levels for twists and psychological depth, and traits to avoid. Save, Cancel, first-use, retry, and error states are included.
- **Storage:** `003_taste_preferences.sql` adds one PostgreSQL row per owner. The migration was applied to the local database. Name and avatar still live in browser IndexedDB; the new structured preferences are stored in PostgreSQL for later backend recommendation scoring.
- **API:** `GET /api/v1/taste-profile` returns the saved or empty profile and supported choices. `PUT /api/v1/taste-profile` validates the choices and saves them.
- **Verification:** The backend syntax check, TypeScript compilation, and Vite production build passed. A read-only database call successfully loaded the empty first-use profile.
- **Next:** Build shelf image upload as its own increment, then add OCR and book identification in later increments.

## Increment 11a — shelf image storage API

- **Built:** Added `POST /api/v1/shelf-images` for a raw JPEG, PNG, or WebP image up to 8 MB and `GET /api/v1/shelf-images/:id` for retrieval. Images are stored under random server-generated IDs in ignored local storage. The API checks the declared MIME type against the file's opening bytes and never uses a client-supplied filename as a path.
- **Design:** Added a feature-sized Google Stitch prompt for the responsive Shelf Scan upload screen. The frontend screen follows review of that design.
- **Teaching point:** An upload request carries bytes rather than JSON. The server sets a size limit, verifies the file type, writes it to a private directory, and returns an ID for later OCR processing.
- **Verification:** Backend syntax check and four upload-storage tests passed. The tests cover a round trip, mismatched file bytes, an oversized body, and a path-like ID.
- **Limit:** This is local-only storage. File signatures do not prove an image is fully decodable; later OCR must handle invalid image data. The API has no login and must not be exposed on a public host as-is.

## Increment 11b — Shelf Scan frontend

- **Design source:** Reviewed the supplied Shelf Scan Stitch export and used its pink upload card, file/camera actions, and responsive layout. Omitted the reviewer state controls, sample photograph, sample ID/path/date, and engineering showcase.
- **Built:** Added Shelf Scan to desktop and phone navigation. The screen selects or captures a supported image, validates its type and 8 MB limit, previews it, permits replacement or removal, and posts the raw file to the local Node API. The selected file remains available after a failed upload. Success displays the actual returned ID, type, size, and stored preview URL.
- **Copy corrections:** The screen says storage is on the computer running the local backend. It does not promise that a phone holds the image or that Netlify hosts uploads. The busy and error messages use plain language.
- **Verification:** TypeScript and Vite production build passed. Browser visual inspection of the local preview was unavailable because this environment blocked access to its loopback server; inspect the page in a local browser when running the app.
- **Next:** Add OCR as a separate increment, after the upload flow is verified with a real shelf photograph on the user's machine.

## Product name correction — Book Hunter

- **Changed:** The visible app name, page title, PWA manifest, user-facing copy, README, and current architecture notes now say Book Hunter.
- **Preserved:** Existing browser storage, event names, package identifiers, and the supplied Stitch export retain their earlier internal names to avoid disrupting saved local data or rewriting the historical design source.
- **Verification:** Frontend production bundle and PWA manifest were generated with the Book Hunter name; backend syntax check passed.

## Increment 12a — raw OCR backend

- **Built:** Added `POST /api/v1/shelf-images/:id/ocr`. It loads a stored image and returns its ID plus raw text from a local Tesseract.js English OCR worker. Recognition jobs are serialized through one reusable worker. English language data is cached in ignored local storage.
- **Scope:** No title extraction, author inference, book matching, database write, or My Library update. Empty OCR text is a valid result for an unreadable image.
- **Verification:** Backend syntax check and existing four upload tests passed. A real OCR smoke check on the supplied Shelf Scan screenshot returned 865 characters, including “Shelf Scan”; several smaller words were misread, showing why human review is needed.
- **Design:** Added a focused Stitch prompt for the raw-text review addition before implementing that frontend feature.
- **Next:** Review the generated OCR Text Review design, connect the React screen to this endpoint, and test with a real shelf photo.

## Increment 12b — OCR text review frontend

- **Design source:** Reviewed the [Part 8 Stitch OCR Text Review screen](https://stitch.withgoogle.com/projects/14223034854353239220). Kept its stored-image and review layout, pink and cream palette, and idle, busy, failed, empty, and raw-text states. The design's sample IDs, photographs, and OCR lines are demonstration content only; the app shows actual API values.
- **Built:** After upload, Shelf Scan sends the stored image ID to `POST /api/v1/shelf-images/:id/ocr`. It shows an indeterminate reading state, a retryable error, an empty result, or the unaltered extracted text in a scrollable viewer. The owner can copy or re-run OCR. The review component cancels its request when its image is replaced.
- **Verification:** Frontend TypeScript and Vite production build passed. The backend OCR smoke check was completed in Increment 12a. A real shelf photo has not yet been tested on this machine.
- **Scope:** No automatic title or author inference and no My Library changes. The local backend is still required; Netlify hosts the frontend only.

## Increment 13 — public catalog search on Netlify

- **Finding:** The public `bookhunte.netlify.app` URL still served an older Book Hunt build, although the latest Part 8 commit had a successful Netlify build. The deployment list showed `d087be4` as the published version and `c984493` as completed but unpublished. The Netlify dashboard was read-only in the available Chrome session, so this code cannot make that version live by itself.
- **Built:** Added a Netlify function for `GET /api/v1/books` that reuses the existing Open Library search module. The Netlify build marks itself as a public search-only version: catalog search remains available, while library saving, shelf image upload/OCR, and database-backed reading taste show clear availability notices. Local development continues to use the private Node backend for all features.
- **Verification:** The Netlify handler's invalid-query and normalized-result tests pass with a mocked catalog response. The Vite/TypeScript production build passes. A successful Netlify build and public function check remain to be verified after GitHub push and publication.
- **Next:** Publish the completed Netlify deploy; then test a real catalog query on the live site. Plan hosted owner authentication and durable storage before exposing private library or shelf routes.

## Increment 14 — browser library on the public site

- **Built:** The Netlify build now keeps saved books, reading statuses, ratings, and notes in the current browser's IndexedDB. Discover's Save action and My Library use one storage client; local development continues to use the existing Node/PostgreSQL routes. The public library clearly states its browser-only storage limit.
- **Verification:** Both public and local TypeScript/Vite builds passed. The existing Netlify search tests passed. The local browser preview could not be reached from the browser automation environment; an end-to-end save/edit/remove check remains for the successful Netlify deploy preview after GitHub push.
- **Limit:** Browser data is specific to each origin and device. A deploy preview has different storage from the main Netlify domain. There is no account, sync, or cloud backup. Shelf Scan and database-backed reading taste still require local Node.
