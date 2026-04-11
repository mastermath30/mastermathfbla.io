# Responsive UI Audit — MathMaster (Round 2: Floating Elements & Overlap)

**Audited:** April 11, 2026  
**Scope:** All pages and shared components — focus on floating/absolute elements, decorative overlaps, mobile clutter  
**Breakpoints tested:** 375px · 390px · 414px · 768px · 1024px · 1280px · 1440px

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
