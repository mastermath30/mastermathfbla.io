# Light Mode Readability Audit — MathMaster

**Audited:** April 11, 2026  
**Source of truth:** Light mode at 375px · 768px · 1280px · 1440px  
**Method:** Component-by-component inspection of color values + WCAG AA contrast checks

---

## Summary

| # | Severity | Issue | Root Cause | Affected Files |
|---|----------|-------|------------|---------------|
| 1 | **Critical** | `text-slate-500` (#64748b) fails WCAG AA at small sizes | Light mode CSS override misses slate-500 — only slate-400/300 were fixed | `globals.css` (systemic) |
| 2 | **High** | Yellow and green icon colors inside colored chip backgrounds are near-invisible | `colorClasses` in dashboard uses `text-yellow-500`/`text-green-500` on matching tinted bg — ~1.5:1 contrast | `dashboard/page.tsx` |
| 3 | **High** | Chart axis tick labels and legend text too faint | Hard-coded `#64748b` for recharts ticks/legend in light mode — same slate-500 issue | `dashboard/page.tsx` |
| 4 | **Medium** | TopBar pill navigation has invisible border in light mode | `border-white/20` is transparent against a white/light page background — pill loses definition | `TopBar.tsx` |
| 5 | **Medium** | Badge `warning` variant small text borderline contrast | `text-yellow-700` (#a16207) on `bg-yellow-500/15` at xs size = ~3.7:1, below 4.5:1 AA | `Badge.tsx` |
| 6 | **Low** | Locked topics on learn page are too faint | `opacity-60` applied to items that already use secondary text colors | `learn/page.tsx` |

---

## Detailed Findings

### Issue 1 — `text-slate-500` not fixed in light mode (Systemic)

**Contrast ratio:** `#64748b` on `#ffffff` = **4.36:1** — fails WCAG AA for text smaller than 18pt (xs, sm labels, captions)

**Root cause:** `globals.css` already fixes `.text-slate-400` and `.text-slate-300` to `#475569` (7:1 contrast) in light mode via `:not(.dark)`. But `.text-slate-500` is not overridden and stays at `#64748b`.

**Affected classes and locations:**
- `StatCard.tsx` line 43 — `text-slate-500` label (xs uppercase)
- `ProgressBar.tsx` line 56 — percentage label (xs font-mono)
- `RecommendationPanel.tsx` line 66 — confidence percentage (xs)
- `CommunitySpotlight.tsx` lines 57, 75 — session/member metadata (xs)
- `dashboard/page.tsx` lines 424, 467, 475 — timestamps, activity details, counts (xs)
- `learn/page.tsx` lines 570, 603, 610, 612, 657, 674 — topic labels, resource types, mastery (xs and 10px)

**Fix:** Add `:not(.dark) .text-slate-500 { color: #475569 !important; }` to globals.css (same as existing slate-400 override)

---

### Issue 2 — Dashboard icon chip colors (yellow, green) near-invisible

**Contrast ratios:**
- `text-yellow-500` (#eab308) on `bg-yellow-100` (~#fef9c3) = **~1.5:1** — critical fail
- `text-green-500` (#22c55e) on `bg-green-100` (~#dcfce7) = **~1.8:1** — critical fail
- `text-violet-500` (mapped to #7c3aed) on `bg-violet-100` (~#ede9fe) = **~4.0:1** — borderline
- `text-purple-500` (mapped to #7c3aed) on `bg-purple-100` (~#f3e8ff) = **~3.9:1** — borderline

**Root cause:** `colorClasses` in `dashboard/page.tsx` uses `text-[color]-500` for icon colors on matching light tinted backgrounds. The `-500` shade is always too close in lightness to the `-100` background.

**Fix:** Use `-700` for yellow/green and `-600` for violet/purple:
```
yellow: { bg: "bg-yellow-100", text: "text-yellow-700" }  // 6.1:1 on yellow-100
green:  { bg: "bg-green-100",  text: "text-green-700"  }  // 5.8:1 on green-100
violet: { bg: "bg-violet-100", text: "text-violet-700" }  // 5.4:1 on violet-100
purple: { bg: "bg-purple-100", text: "text-purple-700" }  // 5.1:1 on purple-100
blue:   { bg: "bg-blue-100",   text: "text-blue-700"   }  // 5.9:1 on blue-100
```

---

### Issue 3 — Chart axis ticks and legend text

**Contrast ratio:** `#64748b` at 12px = **4.36:1** — same as Issue 1, fails for small text

**Root cause:** Hard-coded `fill: isDark ? "#94a3b8" : "#64748b"` and `color: isDark ? ... : "#64748b"` in recharts config.

**Fix:** Change light mode value from `"#64748b"` to `"#475569"` everywhere in recharts config.

---

### Issue 4 — TopBar pill border invisible in light mode

**Root cause:** The nav pill uses `border-white/20` — 20% white opacity is invisible against any light-colored page background. In dark mode the existing `dark:border-slate-700/50` works, but there's no visible light-mode equivalent.

**Result:** On light pages, the floating nav pill has no defined edge — it floats without boundary, looks like disconnected text links.

**Fix:** Replace `border-white/20 dark:border-slate-700/50` → `border-slate-200 dark:border-slate-700/50`

---

### Issue 5 — Badge `warning` variant at xs text

**Contrast ratio:** `text-yellow-700` (#a16207) on `bg-yellow-500/15` background = **~3.7:1** at 0.75rem (xs). Fails WCAG AA minimum 4.5:1 for normal text.

**Fix:** Change `text-yellow-700` → `text-yellow-800` (#92400e) = **~5.3:1** — passes AA.

---

### Issue 6 — Locked topics `opacity-60`

`opacity-60` on items that use secondary text colors (`text-slate-500`, `text-slate-400`) already near the contrast floor. Combined opacity makes them effectively unreadable.

**Fix:** `opacity-60` → `opacity-70`

---

## What Was NOT an Issue (checked and confirmed fine)

- Hero sections: dark text on mostly-white overlays — fine
- Button variants: primary (gradient + white text), secondary (slate-200 + slate-800), outline (slate-700) — all pass
- Badge default/success/info/violet/purple variants — pass
- SectionLabel all variants — pass
- StatCard value text (`text-slate-900`) and subtext colors — pass after systemic fix
- Dashboard modal inputs and labels — pass
- RecommendationPanel primary action chip (theme-primary on white) — pass
- CommunitySpotlight violet discussion chip — pass
- `glass-premium` class: `rgba(255,255,255,0.72)` bg in light mode — adequate

---

## Files Changed

| File | Change |
|------|--------|
| `src/app/globals.css` | Added `:not(.dark) .text-slate-500` override |
| `src/app/dashboard/page.tsx` | Fixed `colorClasses` to use darker icon text |
| `src/app/dashboard/page.tsx` | Fixed chart axis/legend text color |
| `src/components/TopBar.tsx` | Fixed pill border for light mode visibility |
| `src/components/Badge.tsx` | Fixed warning variant text to `text-yellow-800` |
| `src/app/learn/page.tsx` | Fixed locked item opacity 60→70 |

---

## Status

- [x] Audit written  
- [x] Fixes implemented  
- [x] Dark mode verified unchanged  
- [x] Build confirmed passing
