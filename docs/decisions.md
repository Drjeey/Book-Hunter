# Architecture decisions

## ADR-001 — Start as a modular monolith

**Decision:** Build one frontend, one backend, and one PostgreSQL database with clear module boundaries.

**Reason:** Book Hunt is a private single-user application. Separate responsibilities help us learn and maintain the system without adding unnecessary deployment and operations work.

**Alternative considered:** Multiple independently deployed services.

**Why not chosen:** They add coordination and operational complexity without a current requirement.

## ADR-002 — Use Node.js only for the backend runtime

**Decision:** Use React for the frontend and Node.js for the backend API. Do not add Python or FastAPI.

**Reason:** One backend runtime is simpler to learn and operate. Node.js also lets us use JavaScript on both sides of the HTTP boundary.

**Alternative considered:** A separate Python/FastAPI backend alongside Node.js.

**Why not chosen:** There is no current feature that requires a second backend runtime.
