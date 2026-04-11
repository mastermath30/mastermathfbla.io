# Responsive UI Audit — MathMaster

**Audited:** April 11, 2026  
**Scope:** All pages and shared components under `src/`  
**Breakpoints tested:** 375px · 390px · 414px · 768px · 1024px · 1280px · 1440px

---

## Summary of Root Problems

| # | Problem | Severity | Affected Files |
|---|---------|----------|---------------|
| 1 | `px-6` without mobile `px-4` fallback — content hits screen edges on phones | **High** | `page.tsx` (4 sections) |
| 2 | `py-24` section padding not reduced on mobile — makes sections feel cramped | **High** | `page.tsx` (How It Works, CTA, Testimonials, Footer) |
| 3 | Booking modal calendar nav buttons use `p-1` — tap target ~24px, too small | **High** | `page.tsx` (booking modal) |
| 4 | Dashboard stats grid uses `-mt-8` (negative margin) — stat cards overlap header on mobile | **High** | `dashboard/page.tsx` |
| 5 | Navbar utilities (`grid-cols-4` with 3 items) — asymmetric layout, blank slot | **Medium** | `Navbar.tsx` |
| 6 | Multiple H2 headings use `text-4xl md:text-5xl` without `text-3xl sm:text-4xl` — too large for 375px | **Medium** | `page.tsx` |
| 7 | `space-x-6` on desktop nav links — no `lg:` scoping, collides on 1024px breakpoint | **Medium** | `TopBar.tsx` |
| 8 | `ToolsMenu` close button `p-1.5` — too small tap target on mobile | **Medium** | `ToolsMenu.tsx` |
| 9 | Booking modal time-slot grid may overflow on smallest phones (320px) | **Medium** | `page.tsx` |
| 10 | `Card.tsx` default padding `p-6` on mobile can feel excessive on phones | **Low** | `Card.tsx` |
| 11 | `pb-32 md:pb-32` dashboard — overshoots needed bottom padding on mobile | **Low** | `dashboard/page.tsx` |
| 12 | Footer `grid-cols-2` on mobile may force narrow columns on 320px | **Low** | `page.tsx` |

---

## Repeated Design-System Issues

- Many `max-w-N mx-auto` containers use `px-6` directly — should always be `px-4 sm:px-6`
- Section vertical rhythm: `py-24` is fine on desktop but should reduce to `py-14 md:py-24` on mobile
- H2 typography scale: pattern should be `text-3xl sm:text-4xl md:text-5xl` not just `text-4xl md:text-5xl`
- Button tap targets generally handled by globals.css `@media (pointer: coarse)` but explicit close buttons (icon-only, small) still need `min-w-[44px] min-h-[44px]`

---

## Planned Fixes

### `src/app/page.tsx`
- [ ] Fix `px-6` → `px-4 sm:px-6` in "How It Works", Testimonials, CTA, Footer sections
- [ ] Fix `py-24` → `py-14 md:py-24` for major sections  
- [ ] Fix H2 headings in "How It Works", Testimonials, CTA
- [ ] Fix calendar nav buttons `p-1` → `p-2 min-w-[44px] min-h-[44px]`
- [ ] Fix booking modal time slot grid to wrap properly on narrow phones

### `src/app/dashboard/page.tsx`
- [ ] Fix `-mt-8` → `-mt-4 sm:-mt-8` on stats grid

### `src/components/Navbar.tsx`
- [ ] Fix utilities grid: `grid-cols-4` → `grid-cols-3` (3 items, not 4)

### `src/components/TopBar.tsx`
- [ ] Tighten `space-x-6` → `space-x-4 xl:space-x-6`

### `src/components/ToolsMenu.tsx`
- [ ] Fix close button from `p-1.5` → `p-2.5 min-w-[44px] min-h-[44px]`

### `src/app/globals.css`
- [ ] Add `overflow-x: hidden` to `html` element to match `body`
- [ ] Add responsive container utility class

---

## Status

- [x] Audit written  
- [x] Fixes implemented  
- [x] Build verified — `npm run build` passes cleanly  
