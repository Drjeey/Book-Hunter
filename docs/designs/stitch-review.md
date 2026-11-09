# Stitch design review — Book Hunt Discover

## Design system

- Accepted the warm paper background, mature raspberry/pink accents, deep ink text, editorial serif headings, and restrained card borders.
- The generated token file and narrative describe slightly different color values. The React theme uses the screenshot-oriented tokens: `#fff8f6` paper, `#971643` deep primary, `#b8325a` rose, and `#211a17` ink.
- The exported screen does not include a mobile layout. The implementation adapts the navigation and search form for narrow screens while keeping the same color and type hierarchy.

## Screen scope for this increment

- Implement the Book Hunt header, Discover navigation, first-use introduction, disabled search field, empty-state panel, privacy note, and footer.
- Do not implement the design preview tabs, catalog API, search results, retry behavior, or library saving yet. The shown OpenLibrary results and HTTP 503 message are demo content, not Book Hunt data or an approved API contract.
- Keep My Library visibly marked as coming soon. Omit the profile icon until the profile feature exists.

## Responsive adaptation

- Desktop keeps the horizontal header navigation and centered content column shown in Stitch.
- Mobile uses a compact header, stacked search controls, a labeled bottom navigation, and safe-area padding.

## Review outcome

The desktop composition matches the design brief and provides clear component boundaries (`Brand`, `PrimaryNavigation`, `SearchPanel`, and `EmptyState`). Implementation proceeds with the first-use shell only; book search will be implemented as a later feature.

## Reader Profile

- **Accepted:** A focused profile form with a required display name, optional avatar, disabled save until edits exist, cancel, inline validation, and a save confirmation. Added Profile to desktop and mobile navigation.
- **Adapted for the current app:** Reused the existing Book Hunt brand mark and responsive shell rather than the export's remote logo and second, simulated phone canvas. The reviewer state switcher and architecture showcase are Stitch presentation aids and are not part of the product UI.
- **Removed unsupported details:** The export contained prefilled example names and portrait imagery, and made claims about telemetry and other features the app does not have. The implemented profile starts empty and explains only the storage behavior we provide.
- **Storage decision:** Store one owner's profile in browser IndexedDB on the current device. This supports an optional image without placing image data in localStorage. The name and image are not uploaded to the Node API.
- **Validation:** Production build passed TypeScript and Vite bundling. Browser preview showed Profile in the shared navigation; submitting a whitespace-only name announced the required-name error, and Cancel returned the form to its pristine state.

## Book Search

- **Reference:** Reused the provided Discover states export for the search form, result-card layout, loading placeholders, and error treatment.
- **Adapted:** Result cards display live Open Library metadata and link to the source record. The export's sample books remain examples; the app does not hard-code them.
- **Deferred:** The export's add-to-library interaction remains out of scope until My Library is implemented. Search does not write records to PostgreSQL.
- **Responsive behavior:** Use a two-column result grid on wider screens and a single-column list on phone widths.

## My Library

- **Accepted:** The warm editorial style, status filters, saved-book cards, empty shelf concept, and responsive phone adaptation. The desktop card grid is adapted to the app's content width; mobile uses a single-column list.
- **Removed from the export:** Reviewer state controls, sample saved titles and covers, publication/completion dates, the literary quotation, and unsupported offline/telemetry claims. These are mockup content, not the owner's data or app guarantees. Reused Book Hunt's local mark and typography/colors rather than the export's broken remote logo asset.
- **Implemented behavior:** Results saved from Discover appear in My Library with Want to read as the initial status. The owner can filter by status, change status, and remove a title after a browser confirmation. Missing covers and authors have neutral fallbacks.
- **Storage:** Saved catalog records and owner statuses live in PostgreSQL through the Node.js API. Removing a title deletes the library relationship but keeps catalog metadata. The existing Reader Profile remains in browser IndexedDB.
- **Scope:** No ratings, notes, reading dates, goals, recommendations, purchase links, multi-user controls, or offline-storage promise.

## Ratings and Notes

- **Current UI:** A compact editor inside each saved-book card uses the existing warm paper and raspberry styles. It shows a saved rating and a short note preview when collapsed.
- **Interaction:** One optional 1–5 star rating and one optional note per saved book. Save is disabled until the draft changes; Cancel discards the draft; a failed save leaves the editor open.
- **Stitch refinement:** Part 5 of the prompt sequence is ready if a separate Stitch design is desired for this interaction. No new Stitch export was supplied for this increment.

## Reading taste

- **Current UI:** A separate section beneath Reader Profile uses the same warm paper surfaces, raspberry selection chips, form controls, and responsive spacing.
- **Interaction:** The owner chooses up to five genres, themes, and traits to avoid, along with pace, writing style, and optional interest levels. Save is available only after changes; errors preserve the draft.
- **Storage clarity:** The profile name and avatar stay in browser IndexedDB. Taste choices are saved through the Node API to PostgreSQL for later recommendation scoring.
- **Stitch refinement:** Part 6 is ready for an optional feature-sized Stitch design. No generated Taste Profile screen was supplied for this increment.

## Shelf Scan — Local Archive

- **Reviewed:** The live [Stitch project](https://stitch.withgoogle.com/projects/14223034854353239220) has a Shelf Scan screen with responsive desktop and 390px phone previews. Its warm paper, deep pink action color, serif heading, and four-item navigation fit Book Hunt. The ready, selected, uploading, error, and success states cover the intended first upload increment.
- **Use in React:** Keep the image chooser, optional camera capture, 8 MB and format guidance, selected-image preview, Replace/Remove, indeterminate uploading feedback, retry with the selected file retained, and success summary. Do not ship Stitch's state switcher, architecture tables, sample shelf photograph, or capture tips as required product content.
- **Correct the success state:** The mockup's `shelf-scan-20250518-8f2a.webp`, `./storage/scans/...` path, date, and “disk commit” are examples, not API values. The backend returns a UUID, size, content type, and retrieval URL; show only those actual values. Do not reveal internal filesystem paths.
- **Correct storage wording:** The image is stored on the computer running the local Node backend, which may be different from the phone taking the photo. Do not say it is saved on the phone or promise cloud sync. The current Netlify frontend has no hosted upload backend.
- **Correct feedback:** Replace technical copy such as “write stream timed out” and “writing disk sectors” with plain language. Disable Replace and Remove during an active upload so the selected file cannot change mid-request. Validate JPEG, PNG, and WebP before upload; some phone cameras may produce HEIC, which this API does not accept.
- **Outcome:** Suitable as the visual reference for the React upload screen with these data, wording, and interaction corrections. OCR and book identification remain later increments.
