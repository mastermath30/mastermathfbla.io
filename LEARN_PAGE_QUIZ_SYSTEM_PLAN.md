# Learn Page Quiz System Plan

## Goal

Replace the current shallow quiz behavior with a topic-specific quiz system that supports real learning:

`Start Lesson -> Learn -> Take Quiz -> Retake with variation -> Improve`

The UI and layout should stay intact. The work should focus on quiz logic, question quality, topic specificity, and retake variation.

## Current Quiz System Behavior

The Learn page launches quizzes through the route:

- `src/app/resources/quiz/[slug]/page.tsx`

The current quiz system works in two modes:

1. A small set of hardcoded quizzes in `quizzesBySlug`
2. A generic fallback generator in `buildTopicFallbackQuiz(topic)`

The Learn page itself correctly routes users to topic quiz slugs, but the actual quiz experience depends on what the quiz page returns for that slug.

## Current Problems

### 1. Generic fallback quizzes are the main source of low-quality repetition

For any quiz slug that does not have a hand-authored quiz in `quizzesBySlug`, the system uses `buildTopicFallbackQuiz(topic)`.

That fallback currently produces generic questions like:

- first step when studying the topic
- which habit helps most
- how to verify an answer
- what shows mastery

These are not topic questions. They are study-habit questions with the topic name inserted into the prompt.

This creates the exact bad behavior the user described:

- different topics feel structurally identical
- answers repeat across unrelated topics
- retakes feel fake
- the quiz does not test the concept itself

### 2. Most hardcoded quizzes are static and always repeat the same set

Even where topic-specific quizzes exist, they currently:

- use fixed question arrays
- do not vary across retakes
- do not sample from a larger bank

This makes repeat attempts too predictable.

### 3. The current system lacks a real question-bank model

There is no real quiz bank architecture yet:

- no per-topic template bank
- no selection strategy across attempts
- no concept coverage strategy
- no retake variation logic

### 4. The fallback generator is not topic-aware enough

The current fallback only uses:

- topic title
- topic difficulty
- topic course title

It does not use:

- topic concept family
- topic summary meaningfully
- question types specific to the topic
- realistic distractors tied to common mistakes

### 5. Some topics share the same learning route but do not share the same skills

Examples:

- Arithmetic / Pre-Algebra topics should feel very different from Algebra or Geometry topics
- Fractions should not feel like equations
- Coordinate plane should not feel like percent change
- Probability should not feel like polynomial factoring

The current generic fallback collapses those distinctions.

### 6. Retake flow reinforces memorization more than learning

The current retake experience often becomes:

- same slug
- same question set
- same answer positions or near-identical answers

That encourages answer memorization instead of conceptual improvement.

## Required Design Direction

## Chosen approach: Topic-specific question-bank system with structured generators

The best fit is a question-bank layer that sits behind the existing quiz page.

This should:

- preserve the current quiz UI
- preserve the quiz route and flow
- improve content quality without redesigning the product

## New quiz architecture

Each topic quiz should be produced from:

1. A topic-specific quiz profile
   - concept family
   - supported skills
   - question types
   - common mistakes

2. A bank of question templates
   - multiple templates per topic family
   - multiple skills per topic
   - multiple difficulty tiers

3. A runtime selection step
   - choose a varied subset of templates
   - generate question content
   - shuffle options
   - avoid duplicate structures within one attempt

## Topic-specific system requirements

### Topic specificity

Each topic must feel like its own quiz domain.

Examples:

- Arithmetic / fractions / percents:
  - number operations
  - converting forms
  - part-whole reasoning
  - percent of quantity

- Pre-Algebra / expressions:
  - evaluating expressions
  - translating words to algebra
  - variable substitution

- Algebra / linear functions:
  - slope
  - intercepts
  - forms of equations
  - interpreting graphs/tables

- Geometry / circles:
  - radius, diameter, circumference, area
  - sectors and arc relationships

- Statistics:
  - mean, median, spread
  - interpreting data
  - variability and distribution

The quiz should test those actual skills, not generic “good study habits.”

### True variation

Variation must not only be:

- changing numbers
- shuffling choices

It must also include:

- different prompt wording
- different task types
- different skill slices within the same topic
- different distractor logic

### Answer quality

Wrong answers should reflect realistic mistakes for that topic.

Examples:

- equation solving:
  - sign errors
  - incomplete inverse operations

- fractions:
  - adding numerators and denominators directly
  - failing to simplify

- slope:
  - inverted rise/run
  - using y-intercept as slope

- geometry:
  - confusing radius and diameter
  - mixing circumference and area

### Retake variation

A retake should produce:

- different questions
- different concepts within the topic when possible
- different structures within the same difficulty

The same exact set should only happen if the bank is too small, which the implementation should avoid.

## Full Audit of Current Learn + Quiz Flow

### Learn page quiz button

Current status:

- routes correctly to `/resources/quiz/[slug]`

Required behavior:

- keep routing
- ensure the quiz content behind the route actually matches the selected topic

### Start Lesson

Current status:

- already improved to an in-app lesson workspace

Required behavior:

- keep as-is
- make sure lesson -> quiz progression remains coherent

### Quiz route

Current status:

- UI works
- progress tracking works
- score and completion logic work
- question source quality is the real problem

Required behavior:

- preserve score/progression UI
- replace shallow question sourcing with a real bank

### Difficulty behavior

Current status:

- easy / medium / hard modes exist

Required behavior:

- keep difficulty routing
- ensure difficulty changes actual question style, not just superficial wording

### Retake behavior

Current status:

- restart reuses the same in-memory question set

Required behavior:

- regenerate a new quiz attempt
- vary content on restart and between repeated attempts

## Proposed Implementation

### Step 1. Create a dedicated quiz-bank helper module

Create a new quiz-generation layer outside the route page.

This module should:

- define quiz question types
- define topic profiles
- define template banks
- generate difficulty-specific question sets

This will separate content logic from UI logic.

### Step 2. Map topics to quiz families

Create a topic-family resolver using topic metadata such as:

- topic id
- title
- summary
- course

Examples of families:

- arithmetic-operations
- fractions-decimals-percents
- variables-expressions
- linear-equations
- linear-functions
- quadratics
- geometry-circles
- geometry-angles-triangles
- statistics-basics
- probability
- trig-ratios
- calculus-derivatives

This lets generated quizzes stay topic-specific at scale.

### Step 3. Build multiple templates per family and difficulty

For each family, create several template types such as:

- direct concept question
- interpretation question
- application question
- error-analysis question
- comparison question

Each family should have enough templates to support variation.

### Step 4. Use realistic distractor generators

For each family/template:

- compute the correct answer
- generate wrong answers from common mistakes for that skill

This removes generic repeated answer patterns.

### Step 5. Generate a fresh quiz set per attempt

Each attempt should:

- choose a subset of question templates
- avoid duplicate prompt structures in the same run
- shuffle options

The attempt key can be regenerated:

- on page load
- on difficulty change
- on restart

### Step 6. Replace the generic fallback with a real generator

`buildTopicFallbackQuiz(topic)` should be replaced or redesigned so it creates real concept questions from the new bank.

This is the most important fix in the system.

### Step 7. Improve the hardcoded quiz path

Existing hardcoded quizzes should either:

- be migrated into the same bank structure

or

- be wrapped in a selection layer so the user does not always receive the same fixed order and same exact subset

Using one unified system is preferable.

### Step 8. Preserve current UI and progress behavior

Keep:

- current quiz page UI
- scoring
- result screen
- progression back to Learn
- quiz attempt recording

Only improve:

- question generation
- topic specificity
- variation

## Question Structure Standard

Each generated question should include:

- prompt
- 4 options
- correct index

And should satisfy:

- one unambiguously correct answer
- three plausible distractors
- topic-specific wording
- difficulty-appropriate skill

## Minimum Quality Standard Per Topic

Each topic should have:

- multiple possible question templates
- multiple concepts or subskills represented
- multiple retake paths

The user should feel:

- “this quiz matches the topic I studied”
- “this retake is different”
- “wrong answers are believable”
- “the quiz is helping me improve”

## Verification Plan

After implementation, test:

### 1. Multiple topics

Examples:

- an arithmetic or fraction topic
- a pre-algebra / expression topic
- an algebra / linear topic
- a geometry topic
- a statistics topic

Confirm they feel distinct.

### 2. Multiple attempts on the same topic

Confirm:

- restart produces different questions or structures
- not just shuffled answer order

### 3. Difficulty changes

Confirm:

- easy, medium, and hard actually feel different
- not just relabeled versions of the same question

### 4. Learn page flow

Confirm:

- Start Lesson still works
- quiz launch still works
- topic slug matches quiz content
- progression remains coherent

## Success Criteria

The system is successful when:

- different topics no longer feel like the same quiz
- fallback quizzes are truly concept-based
- retakes provide real variation
- distractors reflect realistic topic mistakes
- quiz content feels intelligent and tied to the lesson
- the existing UI remains intact
