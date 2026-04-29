# Learn Page Functionality Plan

## Goal

Turn the Learn page into a real learning flow without redesigning the page:

`Start Lesson` -> actual lesson content -> practice/review/quiz -> next topic

The current layout, design system, and responsive structure should remain intact. The work should focus on behavior, clarity, and making every visible action meaningful.

## Current Learn Page Behavior

The Learn page currently provides:

- a course selector
- a chapter list
- a path map with topic states
- a topic side panel
- a resource hub for lessons, videos, worksheets, practice, and quizzes
- quiz launching
- AI tutor opening
- community routing

### Current topic-state model

The page already has a strong progression model driven by stored progress:

- `locked`
- `available`
- `in_progress`
- `quiz_ready`
- `needs_review`
- `mastered`

This is useful and should be preserved.

### Current topic data available

Each topic already includes enough metadata to support a structured lesson experience:

- `title`
- `summary`
- `difficulty`
- `prerequisites`
- `resources`
- `quizSlugs`
- `aiPrompt`
- `communityThread`
- `estimatedMinutes`
- `masteryGoal`
- `readinessSignals`
- `nextTopicIds`
- `reviewTopicIds`
- `recommendedActions`

## Current Problems

### 1. `Start Lesson` does not actually start a lesson

This is the primary usability problem.

Current behavior:

- in most cases, `Start Lesson` calls `completeCheckpoint()`
- `completeCheckpoint()` marks the topic checkpoint complete immediately
- that makes the topic quiz-ready without any lesson content being shown

This is misleading because the button promises instruction but performs progress mutation.

### 2. `Review lesson` is also misleading

When the topic is `quiz_ready`, the button may open an external lesson resource in a new tab. That is not a consistent lesson experience and does not feel integrated into the product.

### 3. The main primary action is misaligned with the actual learning flow

The top strip primary action currently becomes:

- `Continue` for available or in-progress topics
- but it also completes the checkpoint instead of continuing a lesson

So the page suggests progression, but the underlying action skips the teaching step.

### 4. The lesson tab is only a list of links

The current resource hub lessons tab:

- lists external lesson resources
- does not provide an in-app explanation
- contains empty-state copy that tells users to use `Start Lesson`, even though `Start Lesson` does not teach anything

### 5. Some controls are functional but not meaningfully integrated

These actions work technically, but the flow is not coherent:

- `Start built-in quiz`
- `Ask AI support`
- `Ask community`
- quick resource buttons

They need clearer placement within an actual sequence:

- learn first
- then reinforce
- then quiz
- then review or move on

### 6. The page feels like a resource launcher, not a learning system

The page already has good structure and progression scaffolding, but it does not currently deliver an actual lesson inside the experience.

## Recommended Solution

## Chosen approach: In-app lesson view

Use an in-app lesson view inside the existing Learn page.

This is the best fit because it:

- preserves the current page layout
- avoids a larger routing redesign
- keeps the learning flow in one place
- works well with the current side panel and resource hub
- makes `Start Lesson` immediately meaningful

### Why not dedicated lesson pages

Dedicated lesson pages would work, but they would introduce:

- more routing complexity
- more layout duplication
- a larger UX change than needed for this fix

That is unnecessary for the current issue.

### Why not resource-only lessons

A purely external-resource approach would keep the same problem:

- users click a product CTA
- then leave the product or jump into raw links

That does not feel like a real guided lesson system.

## Lesson Structure

Each topic should generate a simple, consistent lesson experience using existing topic metadata.

### Lesson sections

Each lesson should include:

1. Lesson header
   - topic title
   - estimated minutes
   - difficulty
   - lesson progress/status badge

2. What you will learn
   - concise explanation based on the topic summary
   - clear statement of the mastery goal

3. Before you start
   - prerequisites, if present

4. Key ideas
   - use `readinessSignals` as lesson checkpoints
   - if the topic has no signals, generate a compact fallback list from available metadata

5. Worked example / guided application
   - provide a structured “how to approach this topic” section
   - derive content from the topic title, summary, and mastery goal
   - keep it lightweight but useful

6. Next steps
   - suggested actions after finishing the lesson:
     - practice
     - watch video
     - take quiz
     - ask AI
     - ask community

### Lesson completion behavior

The lesson should not mark a checkpoint complete when opened.

Instead:

- `Start Lesson` opens the in-app lesson view
- the user reads the lesson
- a dedicated completion action marks the lesson/checkpoint complete
- only then does the topic move to `quiz_ready`

This aligns the UI with the actual user journey.

## How This Integrates with Existing UI

The existing Learn page layout should stay intact.

### Existing layout to preserve

- top strip
- path map and chapter browser
- side action panel
- resource hub
- recommendations
- community spotlight

### Integration plan

Add a lesson content card to the main content area above the resource hub.

Behavior:

- when a topic is selected, the lesson card shows a structured overview
- when the user clicks `Start Lesson`, the card switches into active lesson mode
- when the lesson is completed, the card exposes the next recommended action
- the resource hub remains available as supporting material

This keeps the page familiar while making the central action real.

## Full Audit of Learn Page Elements

### Top strip primary action

Current issue:

- action label is reasonable
- action behavior is wrong for lesson states

Expected behavior:

- if topic is locked: explain unlock requirement
- if topic is available or in progress: open/continue in-app lesson
- if topic is quiz ready: start quiz
- if topic needs review: start recovery quiz
- if topic is mastered and there is a next topic: move to next topic

### Topic side panel main button

Current issue:

- `Start Lesson` completes checkpoint instead of starting lesson

Expected behavior:

- always opens lesson view for unlocked topics
- if lesson already started, label becomes `Continue Lesson`
- if quiz-ready, label becomes `Review Lesson`

### Start built-in quiz

Current issue:

- functional, but available too early in the mental model

Expected behavior:

- remain functional
- continue to open quiz
- stay disabled for locked topics
- feel secondary to lesson completion for available topics

### Ask AI support

Current status:

- functional

Expected behavior:

- remain functional
- use topic prompt
- positioned as support during or after lesson

### Ask community

Current status:

- functional

Expected behavior:

- remain functional
- continue routing to the community page
- framed as help/discussion after or during study

### Quick resources

Current status:

- functional

Expected behavior:

- remain as scroll shortcuts to resource sections

### Study Resource Hub

Current issue:

- lessons tab is just links
- empty-state messaging is misleading

Expected behavior:

- remain a supporting resource area
- lessons tab should complement the in-app lesson, not replace it
- empty-state copy should refer to the built-in lesson, not imply missing core functionality

### Quiz cards

Current status:

- functional

Expected behavior:

- remain functional
- stay attached to the current topic

### Recommendation panel and community spotlight

Current status:

- functional

Expected behavior:

- no structural changes needed

## Implementation Plan

### Step 1. Add explicit in-app lesson state

Add Learn-page state for the lesson experience, such as:

- whether lesson view is open
- whether the user has started the lesson for the current topic
- whether the current topic lesson has been acknowledged/completed in the current session

This state should reset or update cleanly when the selected topic changes.

### Step 2. Build lesson-content helpers from existing topic data

Create helper functions to derive a structured lesson model from `activeTopic`, including:

- intro summary
- prerequisites
- mastery goal
- key ideas
- guided steps
- recommended next actions

Use existing topic metadata first and sensible fallbacks second.

### Step 3. Add a dedicated lesson card to the Learn page

Add a new card above the resource hub that:

- presents a lesson overview when idle
- expands into a structured lesson when started
- shows the lesson completion action at the end

This must fit the existing visual system and spacing.

### Step 4. Rewire `Start Lesson`

Change all lesson-oriented buttons so they:

- open or focus the in-app lesson view
- never mutate progress immediately

This includes:

- side panel primary lesson button
- top strip primary action for available/in-progress topics

### Step 5. Move checkpoint completion to the end of the lesson

Update the completion flow so:

- completing a lesson marks the checkpoint complete
- the result banner explains that the lesson is complete and the quiz is ready
- the user is guided into practice/review/quiz next

### Step 6. Improve button labels and sequencing

Refine labels to match actual behavior, for example:

- `Start Lesson`
- `Continue Lesson`
- `Review Lesson`
- `Mark Lesson Complete`
- `Start Quiz`
- `Try Practice First`

The exact labels should stay simple and consistent with the product tone.

### Step 7. Fix misleading resource-hub copy

Replace lesson-tab empty and helper copy so it no longer implies that the core lesson lives in external links.

### Step 8. Verify all Learn-page actions

Audit and confirm:

- topic switching
- unit switching
- lesson start
- lesson completion
- quiz launch
- AI support
- community navigation
- resource hub tabs
- next-topic progression

### Step 9. Re-test responsive behavior

Ensure the new lesson card and action flow work on:

- mobile
- tablet
- desktop

Without breaking the current page structure.

## Expected Final Flow

For an unlocked topic:

1. User selects a topic
2. User clicks `Start Lesson`
3. In-app lesson content opens
4. User reads lesson sections
5. User clicks `Mark Lesson Complete`
6. Topic becomes quiz-ready
7. User takes quiz or reviews resources
8. If mastered, the next topic unlocks

For a quiz-ready topic:

1. User can review the in-app lesson again
2. User can take the quiz
3. User can use AI/community/resources for reinforcement

## Success Criteria

The Learn page is successful after this work if:

- `Start Lesson` actually starts a lesson
- no primary Learn-page buttons are misleading
- every visible action does something meaningful
- the learning flow feels coherent
- the existing design and responsiveness stay intact
- users can move naturally from lesson to quiz to next topic
