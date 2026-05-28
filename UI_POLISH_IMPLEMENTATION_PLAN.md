# MathMaster UI Polish Implementation Plan

## Summary

This implementation pass will make MathMaster feel more polished, professional, and competition-ready while preserving the real platform features. The goal is not to empty the site, but to fix useful sections that currently feel visually inconsistent, cluttered, or disconnected from the design system.

Main visual problems found:

- Home page sections use mixed card shapes, hardcoded accent colors, beige/light backgrounds, and inconsistent spacing.
- The hero concept is strong, but some decorative math/orb-style visuals compete with the message.
- High contrast mode can make globally bordered buttons and links overflow their containers.
- Theme/accent support exists, but many sections still hardcode `indigo`, `violet`, `green`, and fixed backgrounds.
- Testimonials are weaker in the visible home section than the older richer testimonial treatment.
- Tutor cards need better alignment, stronger information hierarchy, richer details, and a more usable booking modal.
- The Learn page keeps useful functionality, but the top workspace, path, and resource hub need clearer hierarchy and scanability.
- Dashboard progress is too chart-focused and needs learning insights.
- Recent activity, challenges, community cards, notes, and calculator panels need cleaner borders, contrast, and theme integration.

## Section-By-Section Plan

### Home Page

Affected areas: `src/app/page.tsx`, `src/components/TestimonialsScroll.tsx`, `src/components/infinite-moving-cards-demo.tsx`, `src/components/HeroMathScene.tsx`, `src/app/globals.css`.

- Preserve the hero concept, dark math/tutor identity, animated headline, stats, main CTAs, tutor preview, student validation, and final CTA.
- Reduce distracting decorative motion while keeping a subtle math/platform atmosphere.
- Fix hero headline wrapping with safer max widths, normal letter spacing, balanced line-height, and responsive text sizing.
- Replace hardcoded indigo accents with theme variables such as `var(--theme-primary)`, `var(--theme-primary-light)`, `--accent-soft`, and `--accent-border`.
- Normalize visible cards to a shared radius, border, shadow, background, icon treatment, and spacing.
- Strengthen testimonials with readable quote cards, names, roles, and balanced density.
- Keep the CTA, but make it feel connected to the rest of the page.

### Navbar And Accessibility Modes

Affected areas: `src/components/Navbar.tsx`, `src/components/AccessibilityPanel.tsx`, `src/components/ThemeSelector.tsx`, `src/app/globals.css`, `src/app/layout.tsx`.

- Preserve logo/navigation/account/utilities/accessibility controls.
- Add high-contrast layout safety so labels wrap cleanly and controls do not overflow.
- Replace overly broad high-contrast borders with scoped rules that improve readability without changing layout size unexpectedly.
- Ensure menu controls use `box-border`, `min-w-0`, stable icon sizing, and responsive grid behavior.
- Validate dark mode, light mode, high contrast, colorblind mode, accent changes, and longer language labels.

### Learn Page

Affected areas: `src/app/learn/page.tsx`, `src/components/learn/LearnTopStrip.tsx`, `src/components/learn/LearnPathMap.tsx`, `src/components/learn/LearnPathNode.tsx`, `src/app/globals.css`.

- Preserve the learning path, topic selection, lesson workspace, resource hub, quizzes, AI support, community links, diagnostics, progress, and recommendations.
- Make the page feel more like a student dashboard by tightening copy and improving hierarchy.
- Simplify the sticky top strip so it emphasizes current topic, progress, and one next action.
- Give the learning path clear context with labels such as “Current Learning Path” and “Your Next Step.”
- Redesign lesson workspace copy into compact topic/objective/action blocks.
- Keep the resource hub while making tabs and cards easier to scan.
- Improve video fallback states so unavailable embeds look intentional and provide next actions.

### Tutor / Booking Flow

Affected areas: home tutor cards in `src/app/page.tsx`, booking modal in `src/app/page.tsx`, and possibly `src/components/TutorBookingBrowser.tsx`.

- Preserve tutor cards, images, ratings, subjects, specialties, pricing, reviews/students, availability, and booking flow.
- Upgrade home tutor cards to a richer hierarchy with equal-height cards, consistent image crop, chips, rating, price, and aligned booking button.
- Add a “View more tutors” action linking to `/tutors`.
- Increase booking modal desktop width so it feels like a real booking panel while keeping mobile bottom-sheet behavior.

### Dashboard / Activity / Community

Affected areas: `src/app/dashboard/page.tsx`, `src/components/CommunitySpotlight.tsx`, shared card styling where appropriate.

- Preserve stats, goals, challenges, recent activity, community spotlight, recommendations, and chart.
- Add learning insight cards around the progress chart: strongest skill, weakest skill, quiz readiness, recent improvement, recommended next lesson, and practice streak.
- Keep the chart as supporting evidence.
- Improve activity icon contrast and replace awkward wording like “Completed:” with natural labels.
- Fix header/footer background strips so rounded corners look clean.
- Polish challenges and community cards with one clean border, subtle accent hover states, and better spacing.

### Floating Notes / Calculator Tools

Affected areas: `src/components/QuickNotes.tsx`, `src/components/QuickCalculator.tsx`, `src/components/ToolsMenu.tsx`, `src/app/layout.tsx`.

- Preserve notes, calculator, tools menu access, keyboard shortcuts, saved notes, Desmos calculator, and fullscreen/size controls.
- Replace harsh standalone yellow/amber/emerald headers with theme-aware treatments.
- Remove error-looking red borders unless they represent real destructive/error states.
- Ensure panels do not cover important content and remain stable on mobile and desktop.
- Make note cards readable in dark, light, and high-contrast modes.

### Theme / Color System

Affected areas: `src/app/globals.css`, `src/components/Button.tsx`, `src/components/Card.tsx`, and page-level hardcoded styles.

- Preserve the theme selector, dark/light mode, colorblind mode, language selector, and accessibility panel.
- Prefer CSS variables and reusable component patterns over page-specific hardcoded colors.
- Add small reusable surface/icon/card utility patterns where helpful.
- Use accent color for buttons, links, chips, icons, rings, and subtle highlights rather than large readability-sensitive backgrounds.

## Preserve Vs. Change

Preserve:

- Core platform pages and user flows.
- Hero concept, animated headline, stats, and main calls to action.
- Tutor booking and checkout simulation.
- Testimonials/student validation.
- Learning path, lesson workspace, resource hub, quizzes, AI help, and community links.
- Dashboard stats, progress, goals, activity, challenge, recommendation, and community modules.
- Floating notes, calculator, tools menu, accessibility controls, theme controls, and language controls.

Change and polish:

- Inconsistent card styling, one-off hardcoded colors, rough section spacing, tiny icons, awkward outlines, and visual clutter.
- Hero decorative effects where they distract.
- Wordy Learn page copy where it blocks scanning.
- Weak testimonial presentation and undersized tutor/booking UI.
- Dashboard chart-only progress section.
- Video unavailable states.

Remove only if clearly demo/broken:

- Hidden duplicate legacy home sections that are not rendered and only make maintenance risky.
- Broken demo placeholders or unavailable embeds, but only after adding a better fallback/resource.
- Purely decorative orb layers that distract from the math/tutor identity.
- Random filler content that is not useful proof, guidance, navigation, or platform functionality.

Do not change:

- Authentication/session behavior.
- Supabase schema or data model.
- Payment/backend integration.
- Real student-facing platform features.
- Theme controls in ways that bypass user customization.

## Accessibility And Theme Safety

- Use theme variables for accents and surfaces instead of hardcoded accent colors where possible.
- Check text contrast in dark mode, light mode, high contrast mode, colorblind mode, and available accent colors.
- Keep focus indicators visible.
- Ensure long translated text can wrap without breaking cards, buttons, navbar items, or modal layouts.
- Use stable dimensions for icon buttons, cards, tutor images, path nodes, tabs, and modal regions.
- Respect reduced-motion behavior for decorative motion.

## Testing Checklist

- `npm run lint`
- `npm run build`
- `npm run verify:learning`
- `npm run verify:i18n`
- Home page in dark mode and light mode.
- Home page with each accent color.
- High contrast mode, especially navbar/menu, CTAs, cards, and floating tools.
- Mobile and desktop widths for navbar/menu, hero headline, home cards, tutor cards, and footer.
- Tutor booking modal on desktop and mobile.
- Learn page top strip, learning path context, lesson workspace, resource hub tabs, video fallback, and Next Best Actions.
- Dashboard insight cards, chart, recent activity, challenges, community spotlight, and goals.
- Floating notes and calculator open/close behavior, placement, and high-contrast readability.
- Card border and outline consistency across home, learn, dashboard, community, and tools.

## Approval Checkpoint

This file is the required pre-implementation plan artifact. Broad UI changes should happen only after explicit approval to continue from this plan.
