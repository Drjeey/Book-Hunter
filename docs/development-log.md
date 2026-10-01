# Development log

## Increment 0 — architecture and repository foundation

- **Built:** Git repository, initial project folders, README, architecture/setup notes, architecture decisions, and a Node.js HTTP health endpoint.
- **Concepts:** Browser/client, frontend, HTTP/API, backend, database, JSON, and modular monolith.
- **Database/API/UI changes:** None yet.
- **Verification:** Confirmed the target folder was empty before creating the foundation. `npm run check` passed. `GET /api/v1/health` returned HTTP 200 with `{"status":"ok","service":"book-hunt-api"}`; an unknown route returned HTTP 404. Git flagged an ownership mismatch in this environment when checking status; no global Git settings were changed.
- **Stack decision:** React frontend and Node.js backend; Python/FastAPI removed at the user's direction. Node.js v26.5.0 and npm v11.17.0 are available.
- **Next:** Learn the React/Vite frontend foundation and create the Google Stitch design prompt before implementing the first screen.
