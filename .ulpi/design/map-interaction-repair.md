# Map clarity and interaction repair

This feature binds to `.ulpi/design/DESIGN.md`.

Every screen must read as the same product if placed side by side.

This is an intentional amendment to `.ulpi/design/food-map.md`. Where the older spec requires simulated 500–800ms loading, a looping location pulse, an adjacent-only sheet snap, or the `NavigationChooser`/route URI flow, this repair spec supersedes it. All other existing data, layout, coordinate-conversion, accessibility, and deployment requirements remain in force.

## Goal and design direction

Repair four linked issues: imprecise-looking marker placement, soft map tiles, overcomplicated/slow feedback, and high-decision-cost external map handoff. Preserve the locked **organic / natural** “潇湘街巷图志” identity while making its wayfinding behavior exact, terse, and calm.

## Primary flow: find a restaurant and inspect it

**User story:** As a person deciding where to eat in Yongzhou, I want to scan nearby restaurants, focus one location, and verify the shop in AMap without being forced into route navigation.

**Entry points:** initial app load, URL query/filter state, search submit, filter change, list item, map marker.

1. Initial load shows a legible city-neighborhood map and results immediately. Do not simulate network latency for local data.
2. Search or filter recomputes results synchronously, updates URL state, clears stale selection, and announces the new count in the existing live region.
3. Selecting a list row focuses the matching marker. Selecting a marker highlights and scrolls its matching list row.
4. The map moves with one short, motivated camera transition. The selected marker is visually distinct without an infinite pulse.
5. On mobile, selecting a result returns the result sheet to the peek state so the focused map location is visible.
6. `查看详情` opens details. `高德看店` directly opens AMap search results for the merchant.

### State behavior

| state | behavior |
|---|---|
| loading | no fake skeleton or map fade for local search/filter operations; tile loading keeps the map background stable |
| empty | existing recoverable empty state remains; clearing conditions is the only primary action |
| partial | failed restaurant images show fallback; failed tiles show the existing inline map warning while list remains usable |
| success | count and selected state update immediately; only one selected restaurant at a time |
| error | geolocation/tile errors use a short toast with a recovery action when one exists |
| offline | announce loss once; keep local search/list usable; tile warning remains non-blocking |
| back/forward | restore URL query/filter state, recompute immediately, and clear stale selection |
| reduced motion | use instant map centering, sheet snapping, list scrolling, and dialog appearance |

## AMap handoff flow

Every restaurant context offers one direct link labeled `高德看店`.

- Use the official URI search endpoint: `https://uri.amap.com/search`.
- Parameters: `keyword=<exact merchant name>`, `center=<lng>,<lat>`, `city=永州`, `view=map`, `src=yongzhou_food`, `callnative=1`.
- The merchant name is the primary identifier. Coordinates only bias the search center; they must never be the visible destination label.
- Do not use `iosamap://navi`, `androidamap://navi`, `/navigation`, or a map-choice dialog in this flow.
- Open in a new browsing context with `rel="noreferrer"`; on supported mobile devices `callnative=1` may hand off to the AMap app while retaining the search-result intent.
- Accessible name: `在高德地图搜索<merchant name>`.

**Success:** AMap opens a merchant-name search results map, does not immediately begin navigation, and does not present raw latitude/longitude as the destination.

## Component: FoodMap

### Purpose

Display map context with crisp tiles and markers whose geometric tip lands exactly on the Leaflet coordinate.

### Specification

- Replace the offset nested 28×36 marker inside a 38×48 wrapper with a single 32×40 SVG inside a matching icon box.
- SVG tip coordinate, `iconAnchor`, and CSS transform origin must be the same pixel: horizontal center and bottom tip.
- Scale only the SVG contents around the bottom-center anchor; never transform Leaflet's positioned marker element.
- Keep the four category encodings and duplicate them in the legend and ARIA label.
- Selected marker may grow once by at most 10% over 120ms and receive a high-contrast outline. No pulsing.
- Enable Leaflet `detectRetina` for high-density screens. Keep tile opacity at 1 during local result changes.
- Initial viewport should prioritize the Cold Water Beach city cluster rather than shrinking to include distant county outliers. Fit all results only after a query/filter narrows the set or when there are no extreme outliers. A robust option is to fit the nearest dense cluster and expose all outliers via list selection.
- On result selection, pan/fly to zoom 16 with a 300ms maximum transition and popup after move completion or immediately in reduced motion.

### Accessibility

Markers remain keyboard-focusable buttons. ARIA name includes merchant, category, rating, and distance. Zoom buttons retain explicit Chinese labels. Focus outline meets 3:1 UI contrast.

## Component: RestaurantResult and popup actions

### Purpose

Provide two unambiguous actions: inspect locally or inspect the merchant in AMap.

### Specification

- `查看详情` remains the local primary action within a restaurant card/popup.
- `高德看店` is a visually secondary external link using the existing external-link/navigation icon family.
- Remove the intermediate platform chooser and its nested modal. This eliminates one decision and one animation before the intended handoff.
- External links stop row/marker event propagation.
- Long merchant names wrap or truncate only in the local UI; the full exact name is passed to the URI.

### States

Default, hover, focus, active, and selected states use only locked tokens. External opening has no success toast because the browser/app handoff is itself the feedback.

## Component: MobileResultsSheet

### Purpose

Allow quick browsing without fighting the map.

### Specification

- Preserve peek, half, and full snap points.
- Drag release selects the nearest snap point from the actual sheet offset, not merely the adjacent point based on drag direction.
- A light tap toggles peek ↔ half. Full is reached by an upward drag or ArrowUp; tapping full returns to half.
- Base snap duration is 220ms; dragging has no transition.
- Selecting a restaurant snaps to peek so its map marker and popup are visible.
- The handle exposes current level and keyboard instructions; ArrowUp/ArrowDown move one level.

## Feedback rules

- Local search/filter: immediate state change, no 650ms timer, skeleton, or global map opacity fade.
- Geolocation: spinner only on the location button; success message lasts about 3.2s; failure includes `使用市中心`.
- Tile/offline errors: deduplicate repeated toasts.
- Toast enter 220ms and exit 160ms; no infinite animation.
- The location indicator may use a static halo. If accuracy changes, a single 300ms emphasis is allowed; no looping pulse.

## Responsive behavior

Mobile is the primary product surface for this repair. Engineering and QA decisions must optimize 320px, 390px, and 430px widths first; tablet and desktop are regression targets.

| viewport | behavior |
|---|---|
| mobile `<768` | full map canvas, compact header that does not obscure the focused marker, 44px minimum targets, snapping result sheet, no horizontal overflow; selection reveals map |
| tablet `768–1023` | 360px list plus map, compact controls |
| desktop `≥1024` | 432px ruled list plus map; no navigation-choice modal |

## Implementation handoff

**Target agent:** `react-vite-tailwind-engineer`

**Design system:** Existing Radix primitives + Leaflet. Remove the now-unneeded navigation Dialog; theme retained primitives with `.ulpi/design/DESIGN.md`. Implement exactly this spec. Theme the design system with our locked tokens; do NOT redesign or re-implement its components.

### Acceptance criteria

- [ ] Marker SVG tip, icon anchor, and transform origin are pixel-aligned at every zoom.
- [ ] Retina screens request higher-density Leaflet tiles.
- [ ] Initial map remains useful around the main Yongzhou/Cold Water Beach cluster instead of zooming out for remote outliers.
- [ ] Local search/filter operations have no artificial timer, skeleton, or map fade.
- [ ] Mobile result selection reveals the matching map marker.
- [ ] Sheet release snaps to the nearest of three levels within 220ms.
- [ ] Every `高德看店` link uses the exact merchant name in the official AMap `/search` URI.
- [ ] No external-map flow uses a navigation URI or displays coordinates as the destination name.
- [ ] Build and TypeScript checks pass.
- [ ] 320px, 390px, and 430px mobile browser checks show no console errors, clipping, blocked map target, or horizontal overflow.
- [ ] Desktop remains usable with no regression in search, list/marker linking, detail, or external search.
- [ ] Keyboard focus, reduced motion, and 44px mobile targets remain intact.

## Design pre-flight

- [x] Identity lock: zero off-system values; one accent family, radius scale, icon family, and type pairing.
- [x] Anti-slop: no purple glow, cream default, gradient text, nested cards, fake claims, buzzwords, or decorative infinite motion.
- [x] Signature: the precisely anchored street-sign marker carries identity without competing decoration.
- [x] State coverage: loading, empty, partial, success, error, offline, history, and reduced motion are specified.
- [x] Accessibility: contrast ratios are recorded in `DESIGN.md`; focus, keyboard, live announcements, and mobile targets are specified.
- [x] Layout: the single product view uses two necessary families, a ruled results index and a spatial map canvas. The three-family marketing-page check is not applicable.
- [x] Cognitive load: search is the only page-level primary action; each restaurant offers only two contextual actions.

Scores after revision: distinctiveness 3, hierarchy & focus 4, consistency 4, accessibility 4, state/edge coverage 4, copy quality 4, restraint 4, motion motivation 4. Total 31/32.

Revision applied: the initial draft retained a map-choice dialog and a looping location pulse; both were removed because they added a decision and motion without helping the user verify a shop.
