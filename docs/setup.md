# Setup

Node.js and npm are available in the development environment. The health endpoint uses Node's built-in HTTP module. The database migration runner uses the `pg` driver to connect to PostgreSQL. The React frontend uses Vite, TypeScript, Tailwind CSS, and the Vite PWA plugin.

## Project areas

- `frontend/` will contain the React + TypeScript app.
- `backend/` contains the JavaScript API server running on Node.js.
- `database/` contains versioned PostgreSQL migrations.
- `docs/` contains project design and learning records.
- `tests/` will hold automated checks added with working features.

## Run locally

1. In `backend/`, run `npm install` once, then `npm start` to start the API at `http://127.0.0.1:8000`.
2. In a second terminal, open `frontend/`, run `npm install` once, then `npm run dev` to start the React app.
3. Open the local URL printed by Vite (normally `http://127.0.0.1:5173`).

## Apply database migrations

Have a local PostgreSQL server running and create a development database named `book_hunt_dev`. In `backend/`, copy `.env.example` to `.env` and replace `YOUR_LOCAL_PASSWORD` with the password for your local PostgreSQL role. Then run `npm run migrate`. The runner applies each numbered SQL migration once and records it in `schema_migrations`.

Do not commit `.env`; it is ignored by Git. The example file contains only a placeholder connection string. See [database-design.md](database-design.md) for the current migration and verification status.
