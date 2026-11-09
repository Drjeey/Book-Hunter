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

## Part 4 — Design My Library

Submit this prompt by itself in the same Stitch project after Part 3. Choose **Web** in Stitch because Book Hunt is a responsive React web app.

```text
Using the Book Hunt design system already established in this project, design the next responsive web app screen: My Library. Book Hunt is a private, single-user reading companion. This screen manages books the owner has chosen to save; it is not a bookstore or a public catalog.

Include:
- The shared Book Hunt navigation, with My Library selected. Use the established labeled bottom navigation on mobile and desktop navigation on wide screens.
- A clear My Library page title and a concise count or summary area that can be omitted when there are no saved books.
- A compact filter for the four supported reading statuses: Want to read, Reading, Read, and Did not finish. Make the selected filter clear without relying on color alone.
- A responsive list/grid of saved book cards. Each card may show the book cover when available, title, author, and a clearly labeled status control. Include an overflow or secondary action to remove a book, with a confirmation step before removal.
- A first-use empty state that says the library is empty and offers a clear Discover books action leading back to Discover.
- Loading and error states with a plain-language retry action. Keep the shared page shell stable across states.

Do not invent saved books, ratings, notes, reading dates, goals, recommendations, purchase links, social activity, or multi-user features. Do not imply cloud sync. Book records come from the owner's explicit save action in Discover and may have incomplete cover or author metadata; show a graceful cover fallback and handle missing author text.

Design mobile first for a phone in portrait, then show the desktop adaptation. Prevent horizontal scrolling, use comfortable card spacing, semantic heading order and labels, visible keyboard focus, clear disabled/error states, and touch targets of at least 44 × 44 px. Respect reduced-motion preferences and WCAG AA text contrast. Return component boundaries and enough spacing/type/color detail to implement the screen consistently in React.
```

## Part 5 — Design ratings and notes

Use this prompt on its own in the same Stitch project to refine the ratings and notes controls in My Library. Choose **Web**.

```text
Using the established Book Hunt design system, design a small Ratings and Notes interaction for one saved book in My Library. This is a private, single-user React web app. Keep the current library card, status control, and mobile/desktop navigation consistent with the existing design.

The owner may set one optional rating from 1 to 5 stars and write one optional private note of up to 2000 characters per saved book. Both can be edited or cleared later. Show the collapsed card summary, the open editing state, a disabled Save when nothing has changed, Cancel, a successful save state, and a plain-language save error that keeps the draft intact. Label the rating and note controls, show the note length, and make the empty rating choice clear.

Use no sample personal opinions, invented ratings, social reviews, public sharing, recommendations, reading dates, or cloud-sync claims. Design phone and desktop states, visible keyboard focus, WCAG AA text contrast, accessible names, and at least 44 × 44 px touch targets. Return component boundaries and concise spacing, type, and color details for React implementation.
```

## Later prompts

Book Search reuses the supplied Discover states export. Taste Profile and Scanner Upload will each have their own feature-sized UX brief and Stitch prompt when those features are ready. Reuse Part 1's design system for every later feature instead of restating the full product description.

## Review gate

After Stitch generates each part, review its responsive layout, states, and consistency with the shared design system. Share the generated design or screenshots here. We will inspect the component structure and agree on any adjustments before implementing that feature.
