# Book Hunt

Book Hunt is a private, single-user bookstore assistant. We are building it in small, understandable increments.

## Current increment

The Node.js backend has health, book-search, personal-library, taste-profile, and local shelf-image storage endpoints. The React frontend has responsive Discover, Shelf Scan, My Library, and Reader Profile screens. Search results come from Open Library through the Node API; a user can save a result, update its reading status, add a private rating and note, or remove it from My Library. Reader Profile also has a Reading taste editor for genres, themes, pace, writing style, and traits to avoid. Shelf Scan lets the owner select, preview, and upload one JPEG, PNG, or WebP image to the local backend, but does not read spines or identify books yet. PostgreSQL stores the library and reading preferences. The display name and avatar remain in browser IndexedDB on this device.

## Planned structure

- `frontend/` — React and TypeScript browser app
- `backend/` — JavaScript API server running on Node.js
- `database/` — PostgreSQL schema and migrations, introduced when we learn database design
- `docs/` — architecture and learning notes
- `tests/` — verification added alongside features

See [docs/architecture.md](docs/architecture.md) for how a request moves through the system.

For the Netlify frontend build and its current backend limitation, see [docs/deploy-netlify.md](docs/deploy-netlify.md).

For the new local image storage API, see [docs/shelf-image-upload.md](docs/shelf-image-upload.md). The focused Shelf Scan design prompt is Part 7 of [docs/designs/stitch-prompt-sequence.md](docs/designs/stitch-prompt-sequence.md).

The first frontend design prompts are in [docs/designs/stitch-prompt-sequence.md](docs/designs/stitch-prompt-sequence.md). Submit them one at a time in Google Stitch; the design review is recorded in [docs/designs/stitch-review.md](docs/designs/stitch-review.md).

To run the backend locally, open a terminal in `backend/` and run `npm.cmd run migrate` once to apply new database changes, then `npm.cmd start` and visit `http://127.0.0.1:8000/api/v1/health`. To run the frontend, open another terminal in `frontend/`, run `npm.cmd install` once, then `npm.cmd run dev`. The `.cmd` form also works in PowerShell installations that block `npm.ps1`.
