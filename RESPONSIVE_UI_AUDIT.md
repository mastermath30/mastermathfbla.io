# Responsive UI Audit — MathMaster (Round 2: Floating Elements & Overlap)

**Audited:** April 11, 2026  
**Scope:** All pages and shared components — focus on floating/absolute elements, decorative overlaps, mobile clutter  
**Breakpoints tested:** 375px · 390px · 414px · 768px · 1024px · 1280px · 1440px

---

## Mobile UX Refactor: Collapse All Floating Actions Into Single FAB Menu

**Issue:** On mobile, every floating quick-action rendered as its own independent fixed button, creating a cluster of overlapping controls that competed with page content:
- `AIMathTutor` — brain circle at `bottom-24 right-[84px]` (always visible)
- `InteractiveWhiteboard` — pencil circle at `bottom-24 right-[156px]` (always visible)
- `SiteTutorialController` — "Tutorial" pill at `bottom-24 left-4` (always visible)
- `StudyStreak` — flame pill at `top-20 right-4` (always visible)
- `Navbar` FAB — `bottom-6 right-6` (correct; the primary trigger)

**Mobile UX rule:** On mobile (< md), only the single 3-line Navbar FAB is visible. All other floating quick actions are hidden and accessed through the FAB's expandable bottom sheet.

**Files changed:**
- `AIMathTutor.tsx` — floating button: `fixed bottom-24 md:bottom-6 right-[84px] flex` → `hidden md:flex fixed md:bottom-6 right-[84px]`; stays at desktop position unchanged; already listens to `open-ai-tutor` event
- `InteractiveWhiteboard.tsx` — same pattern; added `useEffect` listener for `open-whiteboard` event
- `SiteTutorialController.tsx` — mobile pill button removed entirely; added `useEffect` listener for `open-tutorial` event; desktop side tab unchanged
- `Navbar.tsx` — added `Brain`, `Pencil`, `HelpCircle` to lucide imports; added AI Tutor (`open-ai-tutor`), Whiteboard (`open-whiteboard`), Tutorial (`open-tutorial`) to the `utilities` quick-actions array; renders as a clean 2-row × 3-col grid in the bottom sheet

**Result on mobile (375px / 390px / 414px):**
- Only 1 visible floating control: the 3-line Navbar FAB at bottom-right
- Tap FAB → bottom sheet slides up with Navigation links + 6 Quick Actions (Theme, Accessibility, Tools, AI Tutor, Whiteboard, Tutorial)
- All actions reachable with one extra tap; no floating controls visible by default

---

## CRITICAL FIND (Round 2 correction): Fixed-Layer UI Clustering Over Feature Cards

**Component:** `src/components/SiteTutorialController.tsx` + `src/components/StudyStreak.tsx` + `src/app/page.tsx` (feature card image gradient)

**Affected section:** Landing page features section (`id="features"`) — cards with "Interactive Learning", "Track Progress", "Peer Tutoring", "Community Forum"

**Exact root cause:** Three persistent `fixed`-position elements all lived on the **right side** of the mobile viewport simultaneously:
1. `StudyStreak` — `fixed top-20 right-4 z-[89]` — orange/red flame pill, always rendered, blocked top-right of visible card
2. `SiteTutorialController` mobile button — `fixed bottom-24 right-4 z-[92]` — white "Tutorial" pill, always rendered, formed a cluster with the Navbar FAB below it
3. Navbar FAB — `fixed bottom-6 right-6 z-[102]` — expected navigation, but the Tutorial pill directly above it amplified the visual mess

When any feature card fills the mobile viewport, all three right-side fixed elements appear visually **inside** the card, looking like floating decorative chips layered over card content. The Tutorial pill + FAB stacked vertically in the bottom-right are exactly the "cluttered overlapping floating icons/chips/buttons near the bottom-right" the user described.

**Additional issue in `src/app/page.tsx`:** The feature card image has `bg-gradient-to-r from-transparent via-transparent to-white/40 dark:to-slate-950/40` — a right-to-white horizontal fade designed for desktop (content to the right of image). On mobile (content below image), this gradient creates an unexplained right-edge fade artifact on every feature card image.

**Fixes applied:**
- `SiteTutorialController.tsx`: moved mobile Tutorial button from `right-4` → `left-4` — separates it from the right-side FAB cluster
- `StudyStreak.tsx`: changed streak button to `hidden md:flex` — removes it from mobile where it blocked card content top-right
- `StudyStreak.tsx`: changed celebration popup to `hidden md:block` — same right-side clutter fix
- `page.tsx`: changed right-fade image gradient to `hidden md:block` — removes visual artifact on mobile; desktop-only makes sense since the content side transition only applies in side-by-side layout

**Why previous audit missed it:** The previous audit searched for `absolute` positioned elements inside components and sections. These three elements are `fixed` positioned at the layout level — they are not inside any card or section's DOM. A DOM-level search of the feature section finds no absolute children. The clutter is caused by fixed-layer elements Z-compositing over the scrollable content, which is only visible by examining all `fixed` elements across the entire component tree simultaneously.

---

## Root Problem: Decorative Absolute Elements Breaking Out of Containers on Mobile

Several pages use `absolute` positioned floating badges, cards, and orbs that extend beyond their parent's bounding box. When the layout collapses to a single column on mobile, these elements collide with adjacent content, creating visible clutter.

**Design rule applied:** If a decorative element makes the UI cluttered or interferes with readability at any breakpoint, it must be repositioned, resized, or hidden using responsive utilities.

---

## Issues Found

| # | Severity | File | Issue | Root Cause |
|---|----------|------|-------|------------|
| 1 | **Critical** | `src/app/about/page.tsx` | Mission section floating badge overflows container on mobile | `absolute -bottom-6 -right-6` with no `hidden sm:block` guard; parent has no `overflow-hidden` |
| 2 | **High** | `src/app/about/page.tsx` | All H2 headings use `text-4xl` with no mobile scale | Missing `text-3xl sm:text-4xl` pattern (4 occurrences) |
| 3 | **High** | `src/app/study-groups/page.tsx` | Hero section `pt-32` (128px) too large on mobile — pushes content far down | No responsive reduction; should be `pt-20 md:pt-32` |
| 4 | **High** | `src/app/study-groups/page.tsx` | Stats row `gap-8` (32px) too wide on small phones — forces horizontal scroll or clipping | No responsive reduction; should be `gap-4 md:gap-8` |
| 5 | **High** | `src/app/study-groups/page.tsx` | H1 heading starts at `text-4xl` with no `text-3xl` mobile floor | Should be `text-3xl sm:text-4xl md:text-5xl lg:text-6xl` |
| 6 | **Medium** | `src/components/StudyStreak.tsx` | Modal close button `p-1` — tap target ~28px, well below 44px minimum | Should be `p-2.5 min-w-[44px] min-h-[44px]` |
| 7 | **Medium** | `src/app/about/page.tsx` | `How It Works` and `Team` section H2 duplicate label text ("Meet the Team" appears twice: SectionLabel + H2) | Copy issue — H2 should read differently or be removed as redundant |

---

## Repeated Design-System Issues

- **Floating badges with negative offsets** — badges using `-bottom-N -right-N` or `-top-N -left-N` must either have `hidden sm:block` or be repositioned to stay inside the container bounds on mobile
- **H2 typography scale** — the pattern `text-3xl sm:text-4xl md:text-5xl` must be applied consistently; bare `text-4xl` looks oversized on 375px
- **Hero section top padding** — any section with `pt-24` or higher should reduce to at least `pt-16 md:pt-24` on mobile

---

## Safe (Not an issue)

- `page.tsx` hero floating cards (`-top-4 -left-4`, `-bottom-4 -right-4`, `top-1/2 -right-8`) — all wrapped in `hidden lg:block`, never render on mobile ✓
- `GlowingOrbs` in all sections — parent sections have `overflow-hidden`, orbs are contained ✓  
- `TopBar.tsx` — `hidden md:block` — never renders on mobile, no collision ✓
- `ToolsMenu.tsx` — `hidden md:block` — never renders on mobile ✓
- `Navbar.tsx` mobile FAB — bottom-safe, uses `env(safe-area-inset-bottom)` ✓

---

## Planned Fixes

### `src/app/about/page.tsx`
- [x] Add `hidden sm:block` to Mission section floating badge (`absolute -bottom-6 -right-6`)
- [x] Fix all 4 H2 headings: `text-4xl` → `text-3xl sm:text-4xl`

### `src/app/study-groups/page.tsx`
- [x] Fix hero `pt-32` → `pt-20 md:pt-32`
- [x] Fix stats `gap-8` → `gap-4 md:gap-8`
- [x] Fix H1 `text-4xl` → `text-3xl sm:text-4xl`

### `src/components/StudyStreak.tsx`
- [x] Fix modal close button: `p-1` → `p-2.5 min-w-[44px] min-h-[44px]`

---

## Status

- [x] Audit written  
- [x] Fixes implemented  
- [x] Build verified — `npm run build` passes cleanly
