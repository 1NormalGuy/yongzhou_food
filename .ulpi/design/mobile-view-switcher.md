# Mobile shop and map view switcher

This feature binds to `.ulpi/design/DESIGN.md` and supersedes the mobile sheet sections in `.ulpi/design/map-interaction-repair.md`.

Every screen must read as the same product if placed side by side.

## Goal

Decouple browsing restaurants from reading the map on mobile. A floating bottom switcher moves between two calm, task-specific views:

- `店家`: an independent, scrollable restaurant index sorted by the current distance origin.
- `地图`: a full map canvas with no restaurant sheet covering it.

The user can search, request their location, and filter from the shared fixed header in either view. The map remains the default entry view and desktop/tablet retain their existing split layout.

## Primary flow

**User story:** As a person looking for food nearby, I want to alternate between a distance-sorted shop index and an unobstructed map so I can decide with either list or spatial context.

**Entry points:** initial mobile load, `店家` bottom tab, `地图` bottom tab, restaurant selection, restored search/filter URL.

1. Initial mobile load opens `地图`. The fixed search, location, and filter controls remain available.
2. Tapping `店家` replaces the visible map canvas with a full-height results surface above the switcher. It is a separate view, not a raised or draggable map sheet.
3. Results are already sorted nearest-first by the active origin. Before location permission, the context says `永州中心 · 按距离排序`; after successful user-triggered location, it says `离你最近 · 按距离排序`.
4. Tapping the existing location control requests permission and immediately reorders the visible list on success. Do not request location on page load.
5. Filter remains the existing shared header action and uses the existing Radix mobile sheet. Applying filters updates the current view without forcing a view change.
6. Tapping a restaurant row selects it, switches to `地图`, focuses the exact marker, and opens its popup. Tapping `查看详情` keeps the current view and opens details.
7. Tapping `地图` explicitly returns to the unobstructed map. The selected marker remains selected.

## State model

```ts
type MobileView = 'shops' | 'map'
```

- Default and refresh: `map`. View state is ephemeral and is not added to the URL.
- Search/filter: preserve the current view; update count and results synchronously.
- Restaurant selection from `shops`: set selected ID, increment the existing selection version, then set view to `map`.
- Marker selection: remains in `map`.
- Location success: update origin, preserve current view, reorder list, announce success.
- Location failure/offline: preserve current view and existing recoverable toast behavior.
- Empty result: show the existing empty state in `shops`; the `店家` segment still shows a zero count.

## Component: MobileViewSwitcher

### Purpose

Provide a persistent, thumb-reachable choice between the independent shop index and map.

### Visual specification

- Mobile only, fixed `12px` from the left/right and `12px + env(safe-area-inset-bottom)` from the bottom.
- Height `64px`, radius `xl` (`20px`), one `border` line, locked `md` shadow.
- This is the only glass exception: `rgba(252,254,253,.78)`, `blur(18px) saturate(1.2)`, with a solid-surface fallback when backdrop filters are unsupported.
- Two equal 48px-minimum tab targets. Use Lucide `Store` for `店家` and `Map` for `地图`.
- Active tab uses an opaque `elevated` pill, `text`, and `sm` shadow. An accent-colored icon or 2px inset indicator may carry selection. No gradient, glow, bounce, or moving highlight.
- `店家` may display the current numeric result count in the utility type. Keep count subordinate and do not turn it into a decorative status dot.
- One 120ms color/background transition communicates selection. Respect reduced motion.

### Accessibility

- Container `role="tablist"` with `aria-label="移动视图切换"`.
- Buttons use `role="tab"`, `aria-selected`, `aria-controls`, and stable IDs.
- Both targets are at least 48px high. Visible focus uses the locked accent outline.
- Left/Right arrows move focus and activate the adjacent tab; Home/End choose first/last.
- Hidden view content uses the native `hidden` attribute or equivalent so its controls leave the focus and accessibility trees.
- The result count and switch-to-map selection result are announced by the existing polite live region; avoid duplicate announcements.

## Component: MobileShopView

### Purpose

Show the same result data as desktop in an independent mobile browsing surface.

### Visual specification

- Mobile only, fixed below the `72px` header-clearance line and above the switcher-clearance line.
- Opaque locked `surface`; no backdrop blur, glass card, floating sheet, top handle, rounded top edge, or shadow against the map.
- Flex column with a compact results heading and independently scrollable existing `RestaurantList`.
- Results heading includes one utility line:
  - with user location: `离你最近 · 按距离排序`
  - without user location: `永州中心 · 按距离排序`
- Existing restaurant row, detail action, empty state, and AMap search action remain unchanged.

### Responsive behavior

| viewport | behavior |
|---|---|
| 320px | bar insets reduce to `8px`; labels and icons remain visible; no horizontal overflow |
| 390px | standard `12px` insets and 64px bar |
| 430px | standard mobile composition; list keeps compact row density |
| 768–1023px | existing list/map split; no bottom bar |
| ≥1024px | existing desktop list/map split; no bottom bar |

## Map behavior while decoupled

- In `地图`, the map is the only page body layer beneath the shared header and switcher.
- Raise the legend and Leaflet attribution above the bar plus safe area. The switcher must not cover zoom controls, popup actions, or attribution.
- In `店家`, the mobile map container is hidden from layout, pointer input, and the accessibility tree. Do not unmount the map, so its selection and viewport persist.
- When a list selection switches to map, existing marker focus behavior runs after the map becomes visible; invalidate Leaflet size if necessary before opening the popup.

## Engineering handoff

**Target agent:** `react-vite-tailwind-engineer`

Use existing React state, Radix filter/detail primitives, Lucide icons, Leaflet map, and locked tokens. Replace `MobileResultsSheet`; do not layer a second navigation system or introduce a new dependency. Theme the existing system with our locked tokens and do not re-implement its primitives.

Suggested files:

- `src/App.tsx`: own `mobileView`, route list selections back to the map, pass origin context.
- `src/components/MobileViewSwitcher.tsx`: accessible bottom tabs.
- `src/components/MobileShopView.tsx`: independent results surface, or a semantic wrapper around the shared result content.
- `src/components/FoodMap.tsx`: invalidate size when the mobile map becomes active only if needed.
- `src/index.css`: remove drag/snap sheet rules; add the single glass exception and independent view layout.

## Acceptance criteria

- [ ] At 320px, 390px, and 430px, a floating two-choice bar exposes `店家` and `地图` without overflow or safe-area collision.
- [ ] Mobile map view contains no draggable result sheet and leaves markers, popup actions, zoom controls, legend, and attribution usable.
- [ ] Shop view is a separate opaque list surface, not a glass overlay on the map.
- [ ] Results are nearest-first to the active origin and clearly identify whether that origin is the user's position or Yongzhou center.
- [ ] Location permission is user-triggered; successful location reorders the list without changing views.
- [ ] Filter/search updates preserve the current mobile view.
- [ ] Selecting a restaurant row switches to map, selects the correct marker, and opens its popup even when the same restaurant is chosen again.
- [ ] Detail and AMap search actions do not unexpectedly switch views.
- [ ] Bottom tabs have complete keyboard and screen-reader semantics and 48px touch targets.
- [ ] Desktop/tablet layout and current AMap URI behavior do not regress.
- [ ] TypeScript/build pass with no console errors or horizontal overflow.

## Design pre-flight

- [x] Identity lock: only existing palette, type, radius, motion, icon family, and elevations are used.
- [x] Explicit anti-slop exception: glass appears only on the user-requested functional switcher; every content surface stays opaque.
- [x] Signature remains the precise four-color map pin; the bar is intentionally quiet.
- [x] States include default, selected, empty, geolocation success/failure, offline, refresh, and reduced motion.
- [x] Accessibility includes tab semantics, keyboard movement, focus, live feedback, 48px targets, and safe areas.
- [x] Cognitive load is two mutually exclusive top-level choices; search and filter remain shared instead of duplicated.

Scores after revision: distinctiveness 3, hierarchy and focus 4, consistency 4, accessibility 4, state and edge coverage 4, copy quality 4, restraint 4, motion motivation 4. Total 31/32.

Revision applied: the first concept retained a draggable peek sheet under the new tabs; it was removed because that would preserve the exact coupling this feature is meant to eliminate.
