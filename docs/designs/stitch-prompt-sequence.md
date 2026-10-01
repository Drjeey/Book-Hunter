# Book Hunt — Google Stitch Prompt Sequence

Use these prompts one at a time in the same Stitch project. Start with Part 1 and keep the design system it creates. Then submit Part 2 to create the first screen using that system. Do not paste both prompts together.

## Part 1 — Set the shared design system

```text
Create a reusable visual design system for Book Hunt, a private single-user reading companion that helps its owner discover and organize books.

The signature theme is pink: use confident, tasteful pinks for brand accents and primary actions, balanced by warm cream or soft neutral surfaces and dark ink-colored text. Avoid an all-pink interface, pale pink for small text, and a childish/candy-like look. The feeling should be warm, bookish, calm, and contemporary rather than like a retail checkout.

Define reusable semantic color tokens, typography roles, spacing rhythm, surface/border treatments, focus and pressed states, and one consistent icon style. Keep normal text at WCAG AA contrast (at least 4.5:1). Include guidance for mobile and desktop web, visible keyboard focus, reduced motion, and touch targets of at least 44 × 44 px. Do not design a screen or invent app data yet. Return a concise token/style guide we can reuse for each feature.
```

## Part 2 — Design the first app shell screen

After Part 1 has created the style guide, paste this as a separate prompt in the same Stitch project:

```text
Using the Book Hunt design system already established in this project, design the first responsive app screen: Discover, for a first-time user. Keep the screen focused; do not design authentication, checkout, bookstore inventory, camera scanning, recommendation logic, or a completed library feature.

Include:
- Book Hunt name and a short explanation of the app.
- Primary navigation for Discover (selected) and My Library. Use labeled bottom navigation on mobile and a simple sidebar or top navigation on desktop. Show My Library as a future placeholder, not a fake working control.
- A clear welcome heading and a labeled search field for book title or author, with helper text and a visible Search button. Show an example query only as placeholder guidance, not as user data.
- A first-use empty state explaining that no personal books have been added yet, with one obvious next action. Do not invent book covers, ratings, reading history, recommendations, or profile data.

Show four content states: loading, first-use empty, error with plain-language message and Retry, and successful results. Preserve the overall shell and avoid layout jumps between states.

Design mobile first for a phone in portrait, then show the desktop adaptation. Keep the search reachable, respect safe areas, constrain text width on large screens, and prevent horizontal scrolling. Use semantic heading order, visible keyboard focus, accessible names for icon buttons, clear pressed/disabled states, and do not rely on color alone for selection or errors. Respect reduced-motion preferences. Return component boundaries and enough spacing/type/color detail to implement the screen consistently in React.
```

## Later prompts

We will write a separate, similarly scoped prompt when each new feature is ready for design. For example, Book Search, Personal Library, Ratings and Notes, and Scanner Upload will each have their own UX brief and Stitch prompt. Reuse Part 1's design system for every later feature instead of restating the entire product description.

## Review gate

After Stitch generates Part 2, review the mobile and desktop layouts and the four states. Share the generated design or screenshots here. We will inspect its component structure and agree on any adjustments before implementing the React shell.
