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

Netlify is configured here to publish the React frontend only. The Node.js HTTP API in `backend/` and the PostgreSQL service on a personal computer are not deployed by this setting. Vite's `/api` proxy applies to the local development server, not to the production bundle. Search, My Library, and Reading taste need a separately hosted API and database before they can work on the public site.

The backend currently assumes one private owner and has no sign-in protection. Do not expose its library and preference routes on a public host until authentication and storage access are designed and added. Keep database credentials in the host's secret environment settings, never in the repository or frontend build variables.
