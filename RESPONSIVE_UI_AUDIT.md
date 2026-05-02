# Responsive UI Audit — MathMaster (Round 2: Floating Elements & Overlap)

**Audited:** April 11, 2026  
**Scope:** All pages and shared components — focus on floating/absolute elements, decorative overlaps, mobile clutter, missing utility controls  
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

## Round 3: Missing Mobile Utility Controls

**Audited:** April 11, 2026  
**Issue:** Desktop users have easy access to key controls via the TopBar pill (theme toggle, language selector, color picker) and floating accessibility/tools buttons. On mobile, the TopBar is `hidden md:block` and never renders — these controls were only reachable by opening the FAB → "Theme" → scrolling to the bottom of the ThemeSelector panel. Language change was effectively invisible to mobile users.

### Desktop-only controls found inaccessible on mobile

| Control | Desktop location | Mobile status before fix |
|---------|-----------------|--------------------------|
| **Dark / Light mode toggle** | ThemeSelector in TopBar | Buried 2 levels deep: FAB → "Theme" → toggle at top of panel |
| **Language switcher** | ThemeSelector in TopBar (bottom section) | Buried 3 levels deep: FAB → "Theme" → scroll to bottom of panel |
| **Color accent theme** | ThemeSelector in TopBar | Same panel as above (secondary issue; color themes → panel flow is acceptable) |
| **Accessibility panel** | Fixed `bottom-6 left-6` button (`hidden md:flex`) | Already reachable via FAB → "Accessibility" → fires `open-accessibility` event ✓ |
| **Tools menu** | Fixed `bottom-6 left-[10rem]` button (`hidden md:block`) | Already reachable via FAB → "Tools" → fires `open-tools` event ✓ |

### Root cause

`ThemeSelector` and `TopBar` are hidden entirely on mobile (`hidden md:block`). The ThemeSelector does respond to the `open-theme-selector` custom event (which the FAB fires via its "Theme" quick action), and its panel has a mobile-optimized layout. However, the panel bundles three distinct controls — dark/light toggle, color picker, and language selector — with no top-level shortcut to any of them individually. Language, the most critical discoverability gap, required two taps plus scrolling.

### Fix applied: Inline Settings section in Navbar FAB bottom sheet

A new **Settings** section was added to the Navbar (`src/components/Navbar.tsx`) bottom sheet, placed between Navigation and Quick Actions. It contains:

1. **Dark / Light segmented control** — two large tap-target buttons (Dark | Light) in a rounded pill container. Immediate one-tap effect. Reads state from `mm_dark_mode` localStorage on mount; writes back and applies `document.documentElement.classList` changes directly, exactly like ThemeSelector.

2. **Language row** — a horizontally scrollable row of all 13 language buttons (English, Spanish, French, Hindi, Chinese, Arabic, Portuguese, Japanese, German, Korean, Russian, Italian, Vietnamese). Active language highlighted with the theme gradient. Uses `useLanguage()` hook directly; `setLanguage()` call persists to `mm_language` localStorage via LanguageProvider.

**Additional CSS added to `globals.css`:** `.scrollbar-none` utility class (hides scrollbar on the language row across Firefox, IE/Edge, and WebKit).

### New imports in `Navbar.tsx`

```
lucide-react: Sun, Moon, Globe (added to existing import)
LanguageProvider: useLanguage, LanguageCode (added to existing import)
@/lib/i18n: languages (new import)
```

### Bottom sheet structure after fix

```
[Handle bar]
[Navigation]      — 4-col grid, 8 links
[Settings]        — NEW: Dark/Light toggle + scrollable Language row
[Quick Actions]   — 3×2 grid: Theme, Accessibility, Tools, AI Tutor, Whiteboard, Tutorial
```

### Files changed

| File | Change |
|------|--------|
| `src/components/Navbar.tsx` | Added `useLanguage`, `LanguageCode`, `languages` imports; `isDark` state + init `useEffect`; `handleModeToggle` handler; Settings section in bottom sheet |
| `src/app/globals.css` | Added `.scrollbar-none` utility class |

### Verified at breakpoints

- **375px** — Settings section fits cleanly between Navigation and Quick Actions; language row scrolls horizontally with no overflow
- **390px** — same; Dark/Light toggle fills full width with comfortable tap targets
- **414px** — same
- **768px** — entire Navbar is `md:hidden`; no change to tablet/desktop TopBar

### Success condition confirmed

On mobile, opening the 3-line FAB → Settings section → Dark/Light toggle is 2 taps. Language change is 2 taps. Both controls are now first-class visible in the bottom sheet without navigating into any sub-panel.

---

## Status

- [x] Audit written  
- [x] Round 1 fixes implemented  
- [x] Round 2 fixes implemented  
- [x] Round 3 (missing mobile utility controls) implemented  
- [x] Build verified — `npm run build` passes cleanly after all rounds
