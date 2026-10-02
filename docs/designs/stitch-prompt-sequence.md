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

We will write a separate, similarly scoped prompt when each new feature is ready for design. Book Search, Personal Library, Ratings and Notes, and Scanner Upload will each have their own UX brief and Stitch prompt. Reuse Part 1's design system for every later feature instead of restating the entire product description.

## Part 3 — Design the reader profile

After the app shell is in place, submit this prompt on its own in the same Stitch project:

```text
Using the Book Hunt design system already established in this project, design the next responsive web app screen: Reader Profile. Book Hunt is a private, single-user reading companion, so this screen represents the app's one owner. This is a profile/details step only; do not add sign-in, registration, account switching, social features, billing, or multi-user administration.

Keep the screen deliberately small and useful. Include:
- The shared Book Hunt navigation, with Profile selected. On mobile use the established labeled bottom navigation; on desktop use the established desktop navigation.
- A page title and one brief sentence explaining that these details personalize the reader's own space.
- A simple profile form with a required display name and an optional profile image/avatar chooser. Use a neutral initial-based avatar preview if no image is selected; do not invent a person's photo or personal information.
- Clear Save changes and Cancel actions. Show Save disabled until something changes, and include a concise saved confirmation state plus inline validation for a missing display name.
- A small privacy note that this is the owner's private profile. Do not imply cloud sync, authentication, encryption, or data retention behavior that has not been specified.

Use realistic labels and neutral placeholder guidance, not prefilled personal data. Do not include favorite genres, reading goals, ratings, books, recommendations, or taste questions; those belong to later features. Do not invent settings such as currency or location.

Design mobile first for a phone in portrait, then show the desktop adaptation. Keep the form comfortable to use, respect safe areas, prevent horizontal scrolling, and use clear semantic headings, associated labels, visible keyboard focus, accessible avatar control naming, and at least 44 × 44 px touch targets. Keep error and success states understandable without color alone, and respect reduced-motion preferences. Return component boundaries and the spacing/type/color details needed for a React implementation.
```

## Review gate

After Stitch generates each part, review its responsive layout, states, and consistency with the shared design system. Share the generated design or screenshots here. We will inspect the component structure and agree on any adjustments before implementing that feature.
