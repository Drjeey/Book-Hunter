# Architecture decisions

## ADR-001 — Start as a modular monolith

**Decision:** Build one frontend, one backend, and one PostgreSQL database with clear module boundaries.

**Reason:** Book Hunter is a private single-user application. Separate responsibilities help us learn and maintain the system without adding unnecessary deployment and operations work.

**Alternative considered:** Multiple independently deployed services.

**Why not chosen:** They add coordination and operational complexity without a current requirement.

## ADR-002 — Use Node.js only for the backend runtime

**Decision:** Use React for the frontend and Node.js for the backend API. Do not add Python or FastAPI.

**Reason:** One backend runtime is simpler to learn and operate. Node.js also lets us use JavaScript on both sides of the HTTP boundary.

**Alternative considered:** A separate Python/FastAPI backend alongside Node.js.

**Why not chosen:** There is no current feature that requires a second backend runtime.

## ADR-003 — Store reading taste with the backend

**Decision:** Save the owner's structured reading preferences in PostgreSQL through the Node API. Keep the display name and avatar in browser IndexedDB.

**Reason:** The later recommendation engine will run in the backend and needs access to genres, themes, pace, and traits to avoid. The name and avatar only personalize the current browser screen. A single `taste_preferences` row per owner keeps the first version simple.
