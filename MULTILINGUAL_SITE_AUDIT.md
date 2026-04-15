# MathMaster — Multilingual Site Audit

**Last updated:** 2026-04-15  
**Session:** Phase 0 recovery + Phase 1 in progress

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

| Code | Language | Keys | vs EN (579) | Gap |
|---|---|---|---|---|
| `en` | English | 579 | — | 0 |
| `es` | Spanish | 665 | +86 extra | 0 |
| `fr` | French | 665 | +86 extra | 0 |
| `hi` | Hindi | 320 | −259 | **259 missing** |
| `zh` | Chinese | 320 | −259 | **259 missing** |
| `ar` | Arabic | 320 | −259 | **259 missing** |
| `pt` | Portuguese | 320 | −259 | **259 missing** |
| `ja` | Japanese | 320 | −259 | **259 missing** |
| `de` | German | 320 | −259 | **259 missing** |
| `ko` | Korean | 320 | −259 | **259 missing** |
| `ru` | Russian | 320 | −259 | **259 missing** |
| `it` | Italian | 320 | −259 | **259 missing** |
| `vi` | Vietnamese | 320 | −259 | **259 missing** |

> Note: es/fr have 86 extra keys beyond en (dashboard extras, auth extras).
> hi–vi all have the same 320 keys; 259 of the 579 EN keys are absent.

---

## 3. Component Coverage (all use `t()` correctly)

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
| `TestimonialsScroll.tsx` | ❌ 0 | Hardcoded EN — handled by DOM fallback |
| `KeyboardNavigation.tsx` | ❌ 0 | Hardcoded EN — low priority |

---

## 4. Page Coverage

| Page | Route | Coverage |
|---|---|---|
| Home | `/` | ✅ Full `t()` |
| Dashboard | `/dashboard` | ✅ Full `t()` |
| Learn | `/learn` | ✅ Full `t()` |
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

---

## 6. Remaining Work — Phase 1 Translation Batches

**Goal:** Add all 259 missing keys to hi, zh, ar, pt, ja, de, ko, ru, it, vi (10 languages).

Each batch = 20 keys × 10 languages.

### Batch Progress

| Batch | Keys | Status |
|---|---|---|
| Batch 1 (20 keys) | Dashboard stats, page headings, status labels, nav actions | 🔄 In progress |
| Batch 2–13 | Remaining 239 keys | ⏳ Pending |

### Batch 1 Keys (highest visibility)
`Filters`, `Learning Dashboard`, `Hours Studied`, `Problems Solved`, `Current Streak`,
`Math Mastery`, `In Progress`, `Locked`, `Mastered`, `Back`, `Download`, `View all`,
`View Schedule`, `Latest Posts`, `New Post`, `Post Question`, `Discussion Forum`,
`Learning Hub`, `Our Tutors`, `Quick Links`

---

## 7. Strings Intentionally Left Untranslated

| String | Reason |
|---|---|
| "MathMaster" | Brand name — proper noun |
| Tutor names (Sarah Johnson, etc.) | Proper nouns |
| Team member full bios | Personal narrative — API fallback acceptable |
| Quiz math content | Language-neutral mathematical notation |
| "FBLA" | Organization acronym |
| Image alt text for math diagrams | Language-neutral |
