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
