# Book Hunter architecture

## Planned technologies

- **React** builds the user interface in the browser.
- **Node.js** runs the JavaScript backend on the server. We will start with Node's built-in HTTP module so the request/response mechanics stay visible.
- **React** will use Node.js-based development tools when we set up the frontend; that is separate from Node.js running the backend.
- **PostgreSQL** stores durable application data.

Python and FastAPI are not part of the current plan. This keeps the app on one backend runtime and avoids splitting business rules across servers.

## First request path

```text
Browser / installed PWA
        ↓
React frontend
        ↓ HTTP request / JSON response
Node.js backend API
        ├── HTTPS search request → Open Library
        └── SQL for saved records → PostgreSQL
```

The frontend collects input and displays results. The backend validates a request, applies application rules, and looks up or changes data. PostgreSQL stores durable data. The browser never connects directly to PostgreSQL, so database credentials and access rules stay on the server.

## Example: searching for a book

1. The user enters a title and submits the search form.
2. React sends a request such as `GET /api/v1/books?query=The%20Hobbit`.
3. The Node.js API validates the request and searches the Open Library Search API for matching catalog records.
4. The Node.js API maps provider fields to a small Book Hunter response and returns JSON (or an empty list when there are no matches). It caches search pages briefly and spaces provider requests to respect its low-volume API guidance.
5. React displays the response, including loading, empty, and error states. The user can explicitly save a selected result through `POST /api/v1/library`; the backend stores catalog metadata and the owner's initial `want_to_read` status together in PostgreSQL.

## Personal library requests

- `GET /api/v1/library` lists the owner's saved books; `?status=reading` optionally filters by one of the supported statuses.
- `POST /api/v1/library` validates and upserts Open Library metadata, then creates the owner-to-book relationship in a database transaction.
- `PATCH /api/v1/library/:id` changes a saved book's reading status.
- `PATCH /api/v1/library/:id/reflection` saves or clears the owner's optional 1–5 star rating and private note (up to 2000 characters).
- `DELETE /api/v1/library/:id` removes the owner's relationship while leaving reusable catalog metadata intact.

## Reading taste requests

- `GET /api/v1/taste-profile` returns the owner's saved preferences or an empty profile, plus the currently supported choices.
- `PUT /api/v1/taste-profile` validates and saves favorite genres/themes, traits to avoid, pace, writing style, and optional 1–5 interest levels for twists and psychological depth.
- `taste_preferences` has one row per owner in PostgreSQL. The profile name and avatar remain separate in browser IndexedDB. Future recommendation scoring can read the structured preferences from the backend.

## Shelf image storage (first scanner increment)

The local API accepts a raw JPEG, PNG, or WebP body at `POST /api/v1/shelf-images` (maximum 8 MB). It checks the declared type and file signature, assigns a random ID, and writes the bytes to the ignored `backend/.local/shelf-images/` directory. `GET /api/v1/shelf-images/:id` reads the stored image for a later preview or OCR step. The ID is a filename-safe UUID; the browser never chooses a storage path. This storage step does not itself run OCR or write a database row, and it provides no cloud backup. The Node server stays bound to `127.0.0.1` because these private routes have no authentication.

## OCR request (raw text only)

`POST /api/v1/shelf-images/:id/ocr` loads an already stored image and runs Tesseract.js in the local Node process. A single reusable English OCR worker handles one image at a time; its language data is cached under ignored local storage. The response contains the image ID and extracted text, including an empty string when no text is found. The Shelf Scan review panel shows this raw output. The API does not decide which words are titles or authors and does not save any books.

## Architecture choice

Book Hunter starts as a modular monolith: one frontend, one backend, and one PostgreSQL database. The pieces have separate responsibilities, but we avoid the operational overhead of multiple services for a private single-user app.

## Current scope

PostgreSQL contains the catalog/library schema and the API uses it for personal library operations. Search uses Open Library for live book lookups. Deployment configuration is still deferred.
