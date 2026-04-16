# MathMaster — Multilingual Site Audit

**Last updated:** 2026-04-15  
**Session:** Phase 1 complete + Phase 2 QA complete + Critical language-switching bug fixed

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

## 7. Critical Language-Switching Bug — Root Cause & Fix

### Root Causes (3 bugs, all fixed)

**Bug 1 — Async race condition (primary cause of "UI stays in old language")**

`translateDocumentContent` calls the Google Translate API via `trBatch` (a `fetch` call). This is async. When the user switched language, the `useEffect` cleanup disconnected the MutationObserver and cleared the debounce timeout, but did NOT abort the in-flight `fetch`. The stale API response would resolve 200–2000 ms later and overwrite the already-correct DOM with the old language's text. Rapid switching (e.g., FR → DE → AR) could leave the UI stuck in any of the intermediate languages.

**Bug 2 — WeakMap storing non-English "originals" after page navigation**

`originalTextByNode` is a module-level `WeakMap<Text, string>` that stores the first-seen text of each DOM text node (intended to be the English original). After client-side page navigation in a non-English language, React creates new text nodes pre-populated with `t()` output (non-English). The DOM sweep visited these nodes for the first time and stored the non-English text as "original". Future language switches then sent this wrong-language text to the translate API, getting garbage results that overwrote the correct `t()` text.

**Bug 3 — MutationObserver feedback loop**

The DOM sweep modifies `characterData` on text nodes (`textNode.nodeValue = translated`). The MutationObserver was watching `characterData: true`. Each sweep modification triggered the observer, which debounced another sweep, which modified nodes again — creating a loop that could interfere with rapid language switching.

### Affected Files

| File | Change |
|---|---|
| `src/components/LanguageProvider.tsx` | Added AbortController per language effect; signal threaded to sweep; abort on cleanup; observer paused during sweep |
| `src/lib/domTranslation.ts` | Added `signal?: AbortSignal` param; check signal before applying translations; `readOriginalText` now only stores new WeakMap entries during EN sweeps |
| `src/lib/translation.ts` | Added `signal?: AbortSignal` to `TranslationOptions`; signal forwarded to `fetch` in `trBatch` for true network cancellation |

### Exact Fixes Applied

1. **AbortController per language effect** (`LanguageProvider.tsx`):  
   Every DOM sweep `useEffect` now creates a fresh `AbortController`. Its signal is passed to `translateDocumentContent` and threaded into the `trBatch` adapter. The effect cleanup calls `abortController.abort()` BEFORE the new language's effect runs. This cancels the network request AND prevents stale results from being applied even if the fetch already completed.

2. **Signal check before DOM write** (`domTranslation.ts`):  
   After `await translator.trBatch(...)` returns, the function checks `if (signal?.aborted) return` before writing anything to the DOM. This is the critical guard — even if the network layer doesn't cancel in time, stale translations are never painted.

3. **WeakMap guarded by `isEnSweep` flag** (`domTranslation.ts`):  
   `readOriginalText(node, isEnSweep)` now only stores new entries in the WeakMap when `isEnSweep === true` (i.e., `locale === "en"`). Non-EN sweeps skip nodes not already in the WeakMap instead of storing translated text as "original". This ensures the WeakMap always holds English source text regardless of page navigation order.

4. **MutationObserver paused during sweep** (`LanguageProvider.tsx`):  
   `runTranslation` disconnects the observer before awaiting `translateDocumentContent`, then reconnects it after (in the `finally` block, only if not aborted). This eliminates the characterData feedback loop.

### Verification

- `npx tsc --noEmit --skipLibCheck` → clean
- `npm run build` → 17/17 routes, 0 errors
- Switching EN → FR → HI → DE → AR → ZH → EN: each switch applies immediately via React `t()` (synchronous, no API delay). The DOM sweep for non-`t()` content uses the AbortController to ensure only the most-recently-selected language's API results are applied.
- Refresh: persisted language read from `mm_language` localStorage key; `t()` immediately renders in correct language on hydration.
- Desktop selector (ThemeSelector) and mobile selector (Navbar) both call the same `setLanguage` from context → identical behavior.

---

## 8. Build Status

```
✓ Compiled successfully
✓ TypeScript clean (npx tsc --noEmit --skipLibCheck)
✓ 17 routes generated (0 errors)
✓ npm run build — PASSED
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
