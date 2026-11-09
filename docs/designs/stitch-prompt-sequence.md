# Book Hunter — Google Stitch Prompt Sequence

Use these prompts one at a time in the same Stitch project. Start with Part 1 and keep the design system it creates. Then submit Part 2 to create the first screen using that system. Do not paste both prompts together.

## Part 1 — Set the shared design system

```text
Create a reusable visual design system for Book Hunter, a private single-user reading companion that helps its owner discover and organize books.

The signature theme is pink: use confident, tasteful pinks for brand accents and primary actions, balanced by warm cream or soft neutral surfaces and dark ink-colored text. Avoid an all-pink interface, pale pink for small text, and a childish/candy-like look. The feeling should be warm, bookish, calm, and contemporary rather than like a retail checkout.

Define reusable semantic color tokens, typography roles, spacing rhythm, surface/border treatments, focus and pressed states, and one consistent icon style. Keep normal text at WCAG AA contrast (at least 4.5:1). Include guidance for mobile and desktop web, visible keyboard focus, reduced motion, and touch targets of at least 44 × 44 px. Do not design a screen or invent app data yet. Return a concise token/style guide we can reuse for each feature.
```

## Part 2 — Design the first app shell screen

After Part 1 has created the style guide, paste this as a separate prompt in the same Stitch project:

```text
Using the Book Hunter design system already established in this project, design the first responsive app screen: Discover, for a first-time user. Keep the screen focused; do not design authentication, checkout, bookstore inventory, camera scanning, recommendation logic, or a completed library feature.

Include:
- Book Hunter name and a short explanation of the app.
- Primary navigation for Discover (selected) and My Library. Use labeled bottom navigation on mobile and a simple sidebar or top navigation on desktop. Show My Library as a future placeholder, not a fake working control.
- A clear welcome heading and a labeled search field for book title or author, with helper text and a visible Search button. Show an example query only as placeholder guidance, not as user data.
- A first-use empty state explaining that no personal books have been added yet, with one obvious next action. Do not invent book covers, ratings, reading history, recommendations, or profile data.

Show four content states: loading, first-use empty, error with plain-language message and Retry, and successful results. Preserve the overall shell and avoid layout jumps between states.

Design mobile first for a phone in portrait, then show the desktop adaptation. Keep the search reachable, respect safe areas, constrain text width on large screens, and prevent horizontal scrolling. Use semantic heading order, visible keyboard focus, accessible names for icon buttons, clear pressed/disabled states, and do not rely on color alone for selection or errors. Respect reduced-motion preferences. Return component boundaries and enough spacing/type/color detail to implement the screen consistently in React.
```

## Part 3 — Design the reader profile

After the app shell is in place, submit this prompt on its own in the same Stitch project:

```text
Using the Book Hunter design system already established in this project, design the next responsive web app screen: Reader Profile. Book Hunter is a private, single-user reading companion, so this screen represents the app's one owner. This is a profile/details step only; do not add sign-in, registration, account switching, social features, billing, or multi-user administration.

Keep the screen deliberately small and useful. Include:
- The shared Book Hunter navigation, with Profile selected. On mobile use the established labeled bottom navigation; on desktop use the established desktop navigation.
- A page title and one brief sentence explaining that these details personalize the reader's own space.
- A simple profile form with a required display name and an optional profile image/avatar chooser. Use a neutral initial-based avatar preview if no image is selected; do not invent a person's photo or personal information.
- Clear Save changes and Cancel actions. Show Save disabled until something changes, and include a concise saved confirmation state plus inline validation for a missing display name.
- A small privacy note that this is the owner's private profile. Do not imply cloud sync, authentication, encryption, or data retention behavior that has not been specified.

Use realistic labels and neutral placeholder guidance, not prefilled personal data. Do not include favorite genres, reading goals, ratings, books, recommendations, or taste questions; those belong to later features. Do not invent settings such as currency or location.

Design mobile first for a phone in portrait, then show the desktop adaptation. Keep the form comfortable to use, respect safe areas, prevent horizontal scrolling, and use clear semantic headings, associated labels, visible keyboard focus, accessible avatar control naming, and at least 44 × 44 px touch targets. Keep error and success states understandable without color alone, and respect reduced-motion preferences. Return component boundaries and the spacing/type/color details needed for a React implementation.
```

## Part 4 — Design My Library

Submit this prompt by itself in the same Stitch project after Part 3. Choose **Web** in Stitch because Book Hunter is a responsive React web app.

```text
Using the Book Hunter design system already established in this project, design the next responsive web app screen: My Library. Book Hunter is a private, single-user reading companion. This screen manages books the owner has chosen to save; it is not a bookstore or a public catalog.

Include:
- The shared Book Hunter navigation, with My Library selected. Use the established labeled bottom navigation on mobile and desktop navigation on wide screens.
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
Using the established Book Hunter design system, design a small Ratings and Notes interaction for one saved book in My Library. This is a private, single-user React web app. Keep the current library card, status control, and mobile/desktop navigation consistent with the existing design.

The owner may set one optional rating from 1 to 5 stars and write one optional private note of up to 2000 characters per saved book. Both can be edited or cleared later. Show the collapsed card summary, the open editing state, a disabled Save when nothing has changed, Cancel, a successful save state, and a plain-language save error that keeps the draft intact. Label the rating and note controls, show the note length, and make the empty rating choice clear.

Use no sample personal opinions, invented ratings, social reviews, public sharing, recommendations, reading dates, or cloud-sync claims. Design phone and desktop states, visible keyboard focus, WCAG AA text contrast, accessible names, and at least 44 × 44 px touch targets. Return component boundaries and concise spacing, type, and color details for React implementation.
```

## Part 6 — Design reading taste

Use this prompt by itself in the same Stitch project to refine the Reading taste section in Reader Profile. Choose **Web**.

```text
Using the established warm pink Book Hunter design system, design the Reading taste section of the existing Reader Profile page for a private single-user web app. Keep the current navigation, profile form, and responsive styling coherent. This section collects structured preferences for a future recommendation feature; it does not generate recommendations yet.

Include multi-select controls for favorite genres and themes and traits to avoid (at most five choices in each group). Include choices for preferred pace and writing style, plus optional 1–5 interest levels for plot twists and psychological depth. Show a clear empty first-use state, saved selections, Save disabled until changes exist, Cancel, save confirmation, loading, and a retryable error. Keep the choices understandable without assuming the owner has already rated any books.

Do not invent personal preferences or recommend books. Do not imply that the name and avatar use the same storage as reading preferences: the former remain in this browser, while reading preferences are saved in Book Hunter's local PostgreSQL database. Avoid claims about public sharing, login, cloud sync, or AI inference.

Design phone and desktop states with visible keyboard focus, accessible labels, WCAG AA text contrast, 44 × 44 px touch targets, and restrained use of pink. Return component boundaries and concise spacing, type, and color details for a React implementation.
```

## Later prompts

Book Search reuses the supplied Discover states export. Later scanning features will each have their own feature-sized UX brief and Stitch prompt. Reuse Part 1's design system for every later feature instead of restating the full product description.

## Part 7 — Design shelf image upload

Choose **Web** in Stitch. Submit this prompt on its own in the same Book Hunter project:

```text
Using the existing warm pink Book Hunter design system, design one responsive Shelf Scan screen for a private, single-user React web app. This increment only uploads and stores a photograph of a bookstore shelf. It does not perform OCR, identify books, recommend titles, or add anything to My Library.

Include the established navigation, with Shelf Scan selected. Show a brief instruction to photograph book spines clearly, a labeled image chooser that accepts JPEG, PNG, or WebP, and a camera capture option on phones where the browser supports it. Explain the 8 MB limit. After selecting an image, show a preview, filename, size, Replace and Remove actions, and a clear Upload image button. Show uploading progress as a busy state without inventing an exact percentage, a retryable upload error that preserves the selected image, and a success state with the stored image preview and its ID. Explain that identification will come in a later step.

Do not show fake OCR text, detected titles, confidence scores, recommendations, saved books, or sample personal photos. Do not imply cloud backup: images are currently stored by the local Node backend on this device. Keep the image private and avoid social sharing controls.

Design mobile first and adapt to desktop. Use a visible focus state, associated labels, meaningful alternative text, clear disabled states, 44 × 44 px touch targets, WCAG AA text contrast, and no horizontal scrolling. Return component boundaries and concise spacing, type, and color details for React implementation.
```

## Review gate

After Stitch generates each part, review its responsive layout, states, and consistency with the shared design system. Share the generated design or screenshots here. We will inspect the component structure and agree on any adjustments before implementing that feature.

## Part 8 — Design OCR text review

Choose **Web** in Stitch. Submit this prompt on its own in the same Book Hunter project:

```text
Using the existing warm pink Book Hunter design system and the Shelf Scan screen already created in this project, design one small OCR Text Review addition to the Shelf Scan screen. Keep the current upload and stored-image states. After an image is stored, the owner can choose “Read text from image.” The local Node backend may take time to initialize its English OCR worker on first use and returns raw extracted text. This step does not identify books, infer titles or authors, recommend anything, or add records to My Library.

Show the stored image preview and real image ID, a clear Read text from image action, an indeterminate reading state, a plain-language failure with Retry, an empty-text state, and a raw-text result in a readable scrollable area. Explain that OCR can misread narrow or rotated spines and that the owner should review the text. Do not invent detected titles, fake confidence scores, bounding boxes, book cards, or sample personal images. Use neutral placeholder text only in the design demonstration, clearly marked as sample UI content.

On desktop, place the text review near the stored image without crowding the existing screen. On a phone, stack it below the image and keep the primary action reachable above the bottom navigation. Keep the four-item navigation, pink/cream palette, visible keyboard focus, accessible status announcements, 44 × 44 px touch targets, WCAG AA contrast, and no horizontal scrolling. Return concise component boundaries and spacing/type details for React implementation.
```
