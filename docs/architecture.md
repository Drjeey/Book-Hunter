# Book Hunt architecture

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
        ↓ SQL query
PostgreSQL
```

The frontend collects input and displays results. The backend validates a request, applies application rules, and looks up or changes data. PostgreSQL stores durable data. The browser never connects directly to PostgreSQL, so database credentials and access rules stay on the server.

## Example: searching for a book

1. The user enters a title and submits the search form.
2. React sends a request such as `GET /api/v1/books?query=The%20Hobbit`.
3. The Node.js API checks the request and asks PostgreSQL for matching books.
4. The Node.js API returns matching records as JSON (or an empty list when there are no matches).
5. React displays the response, including a helpful empty or error state.

## Architecture choice

Book Hunt starts as a modular monolith: one frontend, one backend, and one PostgreSQL database. The pieces have separate responsibilities, but we avoid the operational overhead of multiple services for a private single-user app.

## Current scope

This is the planned architecture. We will introduce API routes, screens, database tables, and deployment configuration in later increments and document them as they are built.
