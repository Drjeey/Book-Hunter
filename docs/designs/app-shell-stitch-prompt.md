# Book Hunt — App Shell Design

## UX brief

**Purpose:** Give the single user a calm, clear starting point for Book Hunt, their personal bookstore assistant. This is the first application shell, not the full search, library, scanner, or recommendation feature.

**Primary user action:** Begin book discovery by entering a title or author in the prominent search field. The search can be shown as a designed interaction, but the first implementation may use a clearly labeled demonstration state until the real search feature is built.

**Information shown:** Book Hunt name and short purpose; a prominent search field; simple navigation for Discover and My Library; a welcoming first-use empty state that explains the app is ready to grow with the reader; one clear next action. Do not invent reading history, recommendations, ratings, profile data, or book catalog results.

**Navigation:** Discover and My Library. On mobile, use a compact bottom navigation with text labels and recognizable icons. On desktop, use a restrained left sidebar or top navigation. Clearly mark the active section. My Library may be a visual placeholder until that feature is built.

**States:**

- Loading: preserve the shell and show a small, labeled progress treatment in the main content area; avoid layout jumps.
- Empty / first use: welcoming copy, concise explanation, and a single next action; no fake book cards.
- Error: plain-language message near the affected area and a Retry action; preserve navigation and entered search text.
- Success: show a compact confirmation and the resulting content area without a celebratory modal.

**Responsive behavior:** Design mobile first for a phone held in portrait. Keep the search action reachable, respect safe areas, and prevent horizontal scrolling. At tablet/desktop widths, constrain the reading measure and use extra space for a calm sidebar or wider content grid rather than stretching text edge-to-edge.

**Visual hierarchy:** Brand → page title and one-sentence purpose → search → first-use guidance → navigation. Create a warm, bookish, contemporary feel without looking like an online retailer checkout. Use a restrained, cohesive palette, readable typography, consistent spacing, and one icon family. Establish reusable color, type, spacing, border, and focus tokens for later Book Hunt screens.

**Accessibility:** Semantic heading order; visible field label (not placeholder-only); keyboard-operable controls with visible focus; accessible names for icon buttons; minimum 44 × 44 px touch areas; text contrast of at least 4.5:1 for normal text; do not use color alone to show selected or error states; reduced-motion friendly feedback.

**Interaction:** Search submits on Enter and via a visible button; clear pressed, focus, disabled, loading, and error states; avoid hover-only behavior. Navigation is reachable by keyboard and touch. Do not make placeholder controls look functional if they are not.

## Google Stitch prompt

Design the first responsive web app shell for **Book Hunt**, a private single-user bookstore assistant that helps its owner discover and organize books they may love. This is the first-use Discover screen only. Do not design authentication, checkout, bookstore inventory, camera scanning, recommendation logic, or a completed library feature.

Create a polished, warm, bookish but contemporary interface. It should feel like a thoughtful personal reading companion, not a commercial bookstore. Use mobile-first composition, then show how the same design expands to desktop. Establish a reusable design system with semantic color tokens, readable typography, a consistent spacing rhythm, clear surface hierarchy, and one coherent icon style. Do not use emoji as icons.

### Screen content

- A compact Book Hunt wordmark/title and concise subtitle explaining that it helps the reader find books suited to their taste.
- Primary navigation: **Discover** (selected) and **My Library**. On mobile, use bottom navigation with icons and text labels; on desktop, use a simple sidebar or top navigation.
- Main heading and a short welcoming introduction for a first-time user.
- A clearly labeled search field with helper text, a visible Search button, and a keyboard-focus treatment. The field accepts a book title or author. Include a sample query only as an example, not as prefilled real user data.
- A first-use empty state that explains no personal books have been added yet and provides one obvious next action. Do not display invented books, ratings, reading history, profile details, or recommendation scores.

### Required states

Show separate design variants or clearly annotated states for:

1. **Loading:** keep the shell stable and show progress in the content area.
2. **Empty / first use:** welcoming guidance and one next step, with no fake catalog data.
3. **Error:** plain-language feedback near search/content and a Retry action; preserve the query.
4. **Success:** a quiet confirmation and a clear place for returned content.

### Layout and behavior

- At phone width, prioritize the search task, keep controls thumb reachable, respect safe areas, and avoid horizontal scrolling.
- At desktop widths, constrain text width, add breathing room, and maintain hierarchy without scaling everything up.
- Navigation must clearly show the active section. Any not-yet-implemented destination should look disabled or be annotated as a future placeholder rather than acting like a fake control.
- Provide visible focus and pressed states, accessible names for icon-only controls, and touch areas of at least 44 × 44 px.
- Maintain at least 4.5:1 contrast for normal text. Do not rely on color alone for errors or selected navigation.
- Respect reduced-motion preferences; use restrained transitions only when they help explain a state change.

Return the screen design with component boundaries and key spacing, type, and color decisions visible enough to implement consistently in React. Keep the interface focused: this screen is the starting shell, while book search, library management, scanning, and recommendations will be built in later increments.
