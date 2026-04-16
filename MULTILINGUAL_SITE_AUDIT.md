# MathMaster — Multilingual Site Audit

**Last updated:** 2026-04-15  
**Session:** Phase 1 complete + Phase 2 QA complete + language-switch regression reproduced, root-caused, and fixed

---

## 1. Architecture Overview

| Layer | Mechanism | Status |
|---|---|---|
| Primary | Static dictionary `src/lib/i18n.ts` | ✅ Working |
| Fallback | Google Translate API `/api/translate` | ✅ Working |
| Cache | `localStorage` key `mm_i18n_cache_v1` | ✅ Working |
| DOM sweep | `domTranslation.ts` + MutationObserver | ✅ Working |
| Persistence | `localStorage` key `mm_language` | ✅ Working |
| RTL (`dir` attr) | `LanguageProvider` sets `document.documentElement.dir` | ✅ Implemented |
| `lang` attr | `LanguageProvider` sets `document.documentElement.lang` | ✅ Implemented |

Hook: `useTranslations()` → `{ t, tr, language, setLanguage }` from `LanguageProvider`  
Context: `LanguageProvider` wraps entire app in `layout.tsx`

---

## 2. Dictionary Coverage — Current State

| Code | Language | Keys | vs EN (597) | Gap |
|---|---|---|---|---|
| `en` | English | 597 | — | 0 |
| `es` | Spanish | 665 | +68 extra | 0 |
| `fr` | French | 665 | +68 extra | 0 |
| `hi` | Hindi | 597 | — | **0** ✅ |
| `zh` | Chinese | 597 | — | **0** ✅ |
| `ar` | Arabic | 597 | — | **0** ✅ |
| `pt` | Portuguese | 597 | — | **0** ✅ |
| `ja` | Japanese | 597 | — | **0** ✅ |
| `de` | German | 597 | — | **0** ✅ |
| `ko` | Korean | 597 | — | **0** ✅ |
| `ru` | Russian | 597 | — | **0** ✅ |
| `it` | Italian | 597 | — | **0** ✅ |
| `vi` | Vietnamese | 597 | — | **0** ✅ |

> All 13 supported languages now at full EN parity (597 keys).  
> es/fr retain extra dashboard/auth keys added in earlier sessions.

---

## 3. Component Coverage

| Component | t() calls | Status |
|---|---|---|
| `Navbar.tsx` | ✅ 15+ | Full mobile FAB coverage |
| `TopBar.tsx` | ✅ 6+ | Full desktop nav coverage |
| `AccessibilityPanel.tsx` | ✅ 28 | Full |
| `AIMathTutor.tsx` | ✅ 20 | Full |
| `InteractiveWhiteboard.tsx` | ✅ 24 | Full |
| `ToolsMenu.tsx` | ✅ 19 | Full |
| `ThemeSelector.tsx` | ✅ 7 | Full |
| `QuickNotes.tsx` | ✅ 9 | Full |
| `QuickCalculator.tsx` | ✅ 5 | Full |
| `UnitConverter.tsx` | ✅ 7 | Full |
| `FormulaReference.tsx` | ✅ 8 | Full |
| `PomodoroTimer.tsx` | ✅ 8 | Full |
| `ReadingMode.tsx` | ✅ 8 | Full |
| `StudyStreak.tsx` | ✅ 9 | Full |
| `LearnTopStrip.tsx` | ✅ 4 | Fixed in Phase 2 QA |
| `LearnPathNode.tsx` | ✅ 6 | Fixed in Phase 2 QA |
| `LearnLessonPanel.tsx` | ✅ 8 | Fixed in Phase 2 QA |
| `TestimonialsScroll.tsx` | ❌ 0 | Hardcoded EN — handled by DOM fallback |
| `KeyboardNavigation.tsx` | ❌ 0 | Hardcoded EN — low priority |

---

## 4. Page Coverage

| Page | Route | Coverage |
|---|---|---|
| Home | `/` | ✅ Full `t()` |
| Dashboard | `/dashboard` | ✅ Full `t()` |
| Learn | `/learn` | ✅ Full `t()` (components now wired) |
| Resources | `/resources` | ✅ Full `t()` |
| Schedule | `/schedule` | ✅ Full `t()` |
| Tutors | `/tutors` | ✅ Full `t()` |
| Study Groups | `/study-groups` | ✅ Full `t()` |
| Community | `/community` | ✅ Full `t()` |
| Support | `/support` | ✅ Full `t()` |
| Auth | `/auth` | ✅ Full `t()` |
| About | `/about` | ✅ Full `t()` |

---

## 5. RTL (Arabic) Status

`LanguageProvider` sets `document.documentElement.dir = language === "ar" ? "rtl" : "ltr"` on every language change and page load. ✅

Arabic dictionary has 597 keys with correct RTL-appropriate translations. DOM fallback handles any remaining strings not in the static dictionary.

---

## 6. Phase 2 QA Fixes Applied

### Learn Components (previously hardcoded English)

| Component | Strings Fixed |
|---|---|
| `LearnTopStrip.tsx` | "Current Mission", `{streak} day streak`, `{xpToNext} XP to next`, `{xpToday}/100 XP today`, XP progress aria-label |
| `LearnPathNode.tsx` | "Locked", "Mastered", "Review", "Learning", "Start", "Checkpoint", "Milestone", "Lesson" |
| `LearnLessonPanel.tsx` | "Lesson Panel", "Start Lesson", "Continue Lesson", "Recovery Quiz", "Take Quiz", "Ask AI Recovery Help", "Go To Next Topic", "Finish the previous topic to unlock this one.", "Close lesson panel" |

### Dictionary Learn-Flow Keys Added (21 keys × 10 languages)

Keys added to hi, zh, ar, pt, ja, de, ko, ru, it, vi:
`Current Mission`, `day streak`, `XP to next`, `XP today`, `Start`, `Review`, `Learning`,
`Lesson`, `Checkpoint`, `Milestone`, `Lesson Panel`, `Start Lesson`, `Continue Lesson`,
`Recovery Quiz`, `Take Quiz`, `Go To Next Topic`, `Ask AI Recovery Help`,
`Finish the previous topic to unlock this one.`, `Learning path`, `XP progress`, `Close lesson panel`

### Previous Batch Language Mix-Up Fixes

- Batch 6: zh had Arabic content, ar had Portuguese, pt had Japanese — all corrected
- Batches 4+5 in de block: had Korean content — replaced with correct German
- ko was missing Batches 4+5+6 — added retroactively
- Batch 11: ko had Russian, ru had Italian, it had Vietnamese — all corrected

---

## 7. Critical Language-Switching Regression — Actual Root Cause & Fix

### Reproduced Failure

The bug was reproduced in the live app, not just inferred from code.

Most revealing repro:

`English → Hindi → refresh → German`

Observed state before the fix:

- selected language / provider state: `de`
- `localStorage.mm_language`: `de`
- `document.documentElement.lang`: `de`
- rendered UI: mixed Hindi + German

Example: top nav showed German for `Support`, `About`, and `Sign In`, but `Learn` and other fallback-translated nodes stayed in Hindi.

### Actual Remaining Root Cause

The instability was still coming from the mixed translation architecture:

- primary UI text uses dictionary-based `t()`
- missing keys and hardcoded text rely on the DOM/API fallback sweep

The previous fix handled stale async responses, but one important fallback case still broke:

**Nodes first encountered while a non-English language was already active were skipped by the DOM sweep and never got a stable source text.**

That meant:

- dictionary-backed UI updated correctly on language change
- fallback-only nodes could stay in the previous language forever
- after refresh or late client rendering, the page could become a mix of old and new languages

This is why the app still drifted even when the selected language code, provider state, and persisted storage were already correct.

### Fix Applied

| File | Change |
|---|---|
| `src/lib/domTranslation.ts` | Fallback translator now handles two source modes: stored English originals when available, and live current-text fallback with source auto-detection when a node was first seen in a non-English UI |
| `src/lib/translation.ts` | Added `sourceLocale` support to translation requests and cache keys so `en` and `auto` source modes are deterministic and do not collide |
| `src/app/api/translate/route.ts` | Translation API now accepts `source`, including `auto`, instead of always forcing English as the source language |
| `src/components/ThemeSelector.tsx` | Marked language selector controls as `data-no-auto-translate` and added `data-language-code` attributes |
| `src/components/Navbar.tsx` | Marked mobile language selector controls as `data-no-auto-translate` and added `data-language-code` attributes |
| `src/components/LanguageProvider.tsx` | Kept the immediate `setLanguage` persistence / `html[lang]` update path so the clicked language is applied synchronously at the document level |
| `src/components/TopBar.tsx` | Marked the brand link `data-no-auto-translate` so the fallback sweep does not mutate the brand label |

### Why This Fix Works

1. If a node has a known English original, the fallback still translates from English.
2. If a node first appears while the app is already in French/Hindi/etc., the fallback now translates from the node’s current visible text with source auto-detection instead of skipping it.
3. Language selector controls are excluded from post-render DOM translation, so the selector itself no longer mutates or becomes a moving target.
4. The provider, storage, and `html[lang]` update immediately when the user clicks a language, so the selected language state is no longer lagging behind the DOM.

### Live Verification After Fix

Verified against the running app on 2026-04-15:

- Desktop selector:
  `English → French → Hindi → German → Arabic → Chinese → English`
- Desktop selector:
  `French → Spanish → French → Japanese`
- Desktop selector + refresh:
  `English → Hindi → refresh → German`
- Mobile menu selector:
  `English → French → Hindi → German → Arabic → Chinese → English`
- Mobile menu selector:
  `French → Spanish → French → Japanese`

Verified conditions:

- clicked language code persisted to `mm_language`
- `document.documentElement.lang` matched the clicked language
- rendered UI text switched to the clicked language and stayed there after repeated changes
- refresh preserved the selected language and subsequent switches continued working
- no remaining mixed Hindi/German-style stale UI after the refresh repro

---

## 8. Build Status

```
✓ TypeScript clean (npx tsc --noEmit --skipLibCheck)
⚠ `npm run build` blocked in this environment by `next/font` fetching Inter from Google Fonts
✓ Live dev server verification completed against the running app
```

---

## 9. Strings Intentionally Left Untranslated

| String | Reason |
|---|---|
| "MathMaster" | Brand name — proper noun |
| Tutor names (Sarah Johnson, etc.) | Proper nouns |
| Team member full bios | Personal narrative — API fallback acceptable |
| Quiz math content | Language-neutral mathematical notation |
| "FBLA" | Organization acronym |
| Image alt text for math diagrams | Language-neutral |
| `support@mathmaster.com` | Email address — not translatable |
| "Level {n}" | Universal format (Level stays as-is, number is dynamic) |
| "Mastery {n}%" | Percentage format |
| "Practice" (LearnLessonPanel) | Left for DOM fallback (low priority) |
| `TestimonialsScroll` testimonial text | Personal quotes — DOM fallback handles |
