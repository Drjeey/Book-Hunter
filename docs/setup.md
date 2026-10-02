# Setup

Node.js and npm are available in the development environment. The backend's first health endpoint uses Node's built-in HTTP module and does not need third-party packages. The React frontend uses Vite, TypeScript, Tailwind CSS, and the Vite PWA plugin.

## Project areas

- `frontend/` will contain the React + TypeScript app.
- `backend/` contains the JavaScript API server running on Node.js.
- `database/` will contain PostgreSQL schema and migration material when we introduce persistence.
- `docs/` contains project design and learning records.
- `tests/` will hold automated checks added with working features.

## Run locally

1. In `backend/`, run `npm start` to start the API at `http://127.0.0.1:8000`.
2. In a second terminal, open `frontend/`, run `npm install` once, then `npm run dev` to start the React app.
3. Open the local URL printed by Vite (normally `http://127.0.0.1:5173`).
