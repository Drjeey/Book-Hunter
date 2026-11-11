# Netlify deployment

Book Hunter's React site lives in `frontend/`. The root `netlify.toml` tells Netlify to build from that directory and publish `frontend/dist`, which contains `index.html` and the production assets. A site pointed at the repository root instead can publish without the app's `index.html` and show Netlify's 404 page.

## Frontend build settings

- Base directory: `frontend`
- Build command: `npm run build`
- Publish directory: `dist` (relative to the base directory)
- Node.js: version 22, set in `netlify.toml`

The app currently uses hash navigation (`#discover`, `#library`, `#profile`), so it does not need a catch-all page rewrite. An absent `/api` route should remain an error instead of returning the app's HTML.

## Publishing a new deploy

When Netlify shows **Auto Publishing Locked**, a Git push can build a new deploy without replacing the live one. In the Netlify project's **Deploys** page, inspect the successful new deploy, publish it, and unlock auto publishing if you want future Git pushes to go live automatically. Netlify documents this behavior in [Manage deploys](https://docs.netlify.com/deploy/manage-deploys/manage-deploys-overview/).

## Backend availability

Netlify builds the React frontend and a small serverless `GET /api/v1/books` function. The function reuses the Node backend's Open Library search logic, so catalog search works on the public site once its deploy is published. Netlify's function path is defined in `frontend/netlify/functions/books.mjs`; functions in `frontend/netlify/functions/` are discovered relative to the configured `frontend` base directory. Vite's `/api` proxy still applies only to local development.

The PostgreSQL service and private Node HTTP API are not deployed by this setting. The public build explains that saving books, ratings, reading taste, and shelf images require a private backend. It disables those actions instead of presenting broken requests. Profile name and avatar remain browser-local. A public, persistent library needs a hosted database and owner authentication before those routes can be exposed.

The backend currently assumes one private owner and has no sign-in protection. Do not expose its library and preference routes on a public host until authentication and storage access are designed and added. Keep database credentials in the host's secret environment settings, never in the repository or frontend build variables.
