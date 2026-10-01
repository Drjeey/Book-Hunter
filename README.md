# Book Hunt

Book Hunt is a private, single-user bookstore assistant. We are building it in small, understandable increments.

## Current increment

The Node.js backend has one local health endpoint at `GET /api/v1/health`. No database or frontend screen exists yet.

## Planned structure

- `frontend/` — React and TypeScript browser app
- `backend/` — JavaScript API server running on Node.js
- `database/` — PostgreSQL schema and migrations, introduced when we learn database design
- `docs/` — architecture and learning notes
- `tests/` — verification added alongside features

See [docs/architecture.md](docs/architecture.md) for how a request moves through the system.

The first frontend design prompts are in [docs/designs/stitch-prompt-sequence.md](docs/designs/stitch-prompt-sequence.md). Submit them one at a time in Google Stitch and review the resulting design before we implement the React shell.

To run the backend locally, open a terminal in `backend/` and run `npm start`, then visit `http://127.0.0.1:8000/api/v1/health`.
