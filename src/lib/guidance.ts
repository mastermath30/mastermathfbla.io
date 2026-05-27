import { allTopics, courses, studyGroupSpotlights, topicByQuizSlug } from "@/data/courses";
import { LearningProgress } from "@/lib/progress";
import { resolveCommunityGroupFromCourseId, toLearnActionHref } from "@/lib/learnActions";

export type RecommendationKind =
  | "next-best-action"
  | "prerequisite"
  | "practice"
  | "quiz"
  | "video"
  | "ai-help"
  | "community";

export type Recommendation = {
  id: string;
  kind: RecommendationKind;
  title: string;
  reason: string;
  href: string;
  ctaLabel: string;
  priority: number;
  confidence: number;
  sourceSignals: string[];
  primary?: boolean;
};

export type DailyStudyPlanTask = {
  id: string;
  label: string;
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
  tone: "primary" | "practice" | "support";
};

function toLabel(value: string): string {
  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function buildDailyStudyPlan(progress: LearningProgress): DailyStudyPlanTask[] {
  const selectedCourse = courses.find((course) => course.id === progress.selectedCourseId) ?? courses[0];
  const selectedSequence = selectedCourse?.recommendedSequence ?? [];
  const selectedTopic =
    allTopics.find((topic) => topic.id === progress.selectedTopicId) ??
    allTopics.find((topic) => topic.id === selectedSequence[0]);
  const latestWeakTopicId = progress.weakTopicIds[0];
  const weakTopic = latestWeakTopicId ? allTopics.find((topic) => topic.id === latestWeakTopicId) : null;
  const latestQuiz = progress.quizAttempts[0];
  const needsDiagnostic = !progress.diagnosticCompleted && progress.quizAttempts.length === 0;
  const focusTopic = weakTopic ?? selectedTopic;

  if (needsDiagnostic) {
    return [
      {
        id: "diagnostic",
        label: "Start",
        title: "Take the diagnostic quiz",
        description: "Find your best course and starting topic before committing to a path.",
        href: "/resources/quiz/diagnostic",
        ctaLabel: "Start diagnostic",
        tone: "primary",
      },
      {
        id: "choose-course",
        label: "Set up",
        title: "Preview learning paths",
        description: "Compare the available courses while the diagnostic builds your recommendation.",
        href: "/learn",
        ctaLabel: "Open Learn",
        tone: "practice",
      },
      {
        id: "support-ready",
        label: "Support",
        title: "Use AI when you get stuck",
        description: "Ask for a step-by-step explanation once your first topic is selected.",
        href: toLearnActionHref({ action: "open-ai", topicId: selectedTopic?.id }),
        ctaLabel: "Open AI help",
        tone: "support",
      },
    ];
  }

  const activeTopic = focusTopic ?? selectedTopic;
  const quizSlug = activeTopic?.quizSlugs[0];
  const lowRecentScore = latestQuiz && latestQuiz.accuracy < progress.unlockThreshold;

  return [
    {
      id: "main-learning",
      label: "Main",
      title: activeTopic ? `Study ${activeTopic.title}` : "Choose a course",
      description: activeTopic
        ? activeTopic.summary
        : "Pick a learning path so MathMaster can build your next study step.",
      href: toLearnActionHref({ action: "view", tab: "concept", topicId: activeTopic?.id }),
      ctaLabel: activeTopic ? "Open lesson" : "Choose course",
      tone: "primary",
    },
    {
      id: "practice-review",
      label: "Practice",
      title: lowRecentScore && weakTopic ? `Review ${weakTopic.title}` : "Take focused practice",
      description: lowRecentScore
        ? `Your latest score was ${Math.round(latestQuiz.accuracy * 100)}%. Review before retrying.`
        : "Use the topic quiz or practice resources to check understanding.",
      href: quizSlug
        ? toLearnActionHref({ action: "open-quiz", topicId: activeTopic?.id, slug: quizSlug, difficulty: lowRecentScore ? "easy" : "medium" })
        : toLearnActionHref({ action: "view", tab: "practice", topicId: activeTopic?.id }),
      ctaLabel: quizSlug ? (lowRecentScore ? "Retry easy" : "Start quiz") : "Open practice",
      tone: "practice",
    },
    {
      id: "support",
      label: "Support",
      title: lowRecentScore ? "Ask AI for a recovery plan" : "Get unstuck faster",
      description: lowRecentScore
        ? "Use a guided explanation before your next mastery attempt."
        : "Bring the current topic to AI or the community if a step feels unclear.",
      href: toLearnActionHref({ action: lowRecentScore ? "open-ai" : "open-community", topicId: activeTopic?.id }),
      ctaLabel: lowRecentScore ? "Ask AI" : "Ask community",
      tone: "support",
    },
  ];
}

export function buildRecommendations(progress: LearningProgress): Recommendation[] {
  const recommendations: Recommendation[] = [];

  const selectedTopic = allTopics.find((topic) => topic.id === progress.selectedTopicId);
  const selectedCourseId = progress.selectedCourseId;
  const latestQuiz = progress.quizAttempts[0];
  const lowQuiz = progress.quizAttempts.find((attempt) => attempt.accuracy < 0.7);
  const selectedCourse = courses.find((course) => course.id === selectedCourseId);
  const selectedSequence = selectedCourse?.recommendedSequence ?? [];
  const selectedTopicIndex = selectedTopic ? selectedSequence.indexOf(selectedTopic.id) : -1;
  const nextTopicId =
    selectedTopicIndex >= 0 && selectedTopicIndex < selectedSequence.length - 1
      ? selectedSequence[selectedTopicIndex + 1]
      : null;
  const nextTopic = nextTopicId ? allTopics.find((topic) => topic.id === nextTopicId) : null;

  if (selectedTopic) {
    recommendations.push({
      id: "next-action-topic",
      kind: "next-best-action",
      title: nextTopic ? `Next step: ${nextTopic.title}` : `Finish ${selectedTopic.title} mastery check`,
      reason: nextTopic
        ? "Complete the current topic and move forward in sequence."
        : "You are at the end of your sequence. Lock in mastery before changing courses.",
      href: toLearnActionHref({
        action: "open-quiz",
        topicId: selectedTopic.id,
        difficulty: "medium",
      }),
      ctaLabel: "Open topic quiz",
      priority: 100,
      confidence: 0.94,
      sourceSignals: ["selected_topic", "sequence_position"],
    });

    if (selectedTopic.prerequisites.length > 0) {
      recommendations.push({
        id: "prereq-topic",
        kind: "prerequisite",
        title: `Review prerequisite: ${selectedTopic.prerequisites[0]}`,
        reason: "Prerequisite review improves quiz confidence and retention.",
        href: toLearnActionHref({ action: "view", tab: "concept", topicId: selectedTopic.id }),
        ctaLabel: "Review prerequisite",
        priority: 70,
        confidence: 0.86,
        sourceSignals: ["selected_topic", "prerequisites"],
      });
    }
  }

  if (lowQuiz) {
    const weakTopic = topicByQuizSlug[lowQuiz.slug];
    recommendations.push({
      id: "weak-area-practice",
      kind: "practice",
      title: `Targeted practice: ${weakTopic?.title ?? toLabel(lowQuiz.slug)}`,
      reason: `Your recent score was ${Math.round(lowQuiz.accuracy * 100)}%. Focused review can quickly lift this area.`,
      href: toLearnActionHref({
        action: "open-quiz",
        topicId: weakTopic?.id,
        slug: lowQuiz.slug,
        difficulty: "easy",
      }),
      ctaLabel: "Start easy recovery set",
      priority: 95,
      confidence: 0.96,
      sourceSignals: ["quiz_performance", "weak_area"],
    });
    recommendations.push({
      id: "ai-weak-area",
      kind: "ai-help",
      title: "Ask AI for a step-by-step recovery plan",
      reason: "A guided walkthrough is best right after a low-scoring attempt.",
      href: toLearnActionHref({
        action: "open-ai",
        topicId: weakTopic?.id,
      }),
      ctaLabel: "Open AI support path",
      priority: 65,
      confidence: 0.89,
      sourceSignals: ["quiz_performance", "student_intent"],
    });
  }

  if (progress.intent === "test-prep" || progress.testPrepMode) {
    recommendations.push({
      id: "test-prep-mode",
      kind: "quiz",
      title: "Test-prep mode: take an intermediate mixed quiz",
      reason: "You selected test-prep intent. Timed practice is the highest-value next action.",
      href: toLearnActionHref({
        action: "open-quiz",
        topicId: selectedTopic?.id,
        difficulty: "medium",
      }),
      ctaLabel: "Start timed prep",
      priority: 80,
      confidence: 0.91,
      sourceSignals: ["test_prep_mode", "student_intent"],
    });
  }

  if (latestQuiz && latestQuiz.accuracy >= 0.85) {
    const strongerTopic = topicByQuizSlug[latestQuiz.slug];
    recommendations.push({
      id: "level-up",
      kind: "quiz",
      title: `Level up with a harder set in ${strongerTopic?.courseTitle ?? "your course"}`,
      reason: `You scored ${Math.round(latestQuiz.accuracy * 100)}% recently. You're ready for a challenge.`,
      href: toLearnActionHref({
        action: "open-quiz",
        topicId: strongerTopic?.id,
        slug: latestQuiz.slug,
        difficulty: "hard",
      }),
      ctaLabel: "Try harder quiz",
      priority: 64,
      confidence: 0.84,
      sourceSignals: ["quiz_performance", "mastery_signal"],
    });
  }

  if (progress.resourcePreference === "videos") {
    recommendations.push({
      id: "video-first",
      kind: "video",
      title: "Video-first review path",
      reason: "Your preference is set to videos, so we are prioritizing visual lessons.",
      href: toLearnActionHref({
        action: "view",
        tab: "video",
        topicId: selectedTopic?.id,
      }),
      ctaLabel: "Open video resources",
      priority: 50,
      confidence: 0.8,
      sourceSignals: ["resource_preference"],
    });
  } else if (progress.resourcePreference === "worksheets") {
    recommendations.push({
      id: "worksheet-first",
      kind: "practice",
      title: "Worksheet-focused review path",
      reason: "Your preference is worksheets, so we are prioritizing printable drills.",
      href: toLearnActionHref({
        action: "view",
        tab: "practice",
        topicId: selectedTopic?.id,
      }),
      ctaLabel: "Open worksheet path",
      priority: 50,
      confidence: 0.8,
      sourceSignals: ["resource_preference"],
    });
  }

  if (selectedCourseId) {
    const relevantGroupId = resolveCommunityGroupFromCourseId(selectedCourseId);
    const relevantGroup = studyGroupSpotlights.find((group) => group.id === relevantGroupId) ?? studyGroupSpotlights[0];

    recommendations.push({
      id: "community-group",
      kind: "community",
      title: `Join ${relevantGroup.name}`,
      reason: "Peer accountability improves completion and confidence.",
      href: toLearnActionHref({
        action: "open-community",
        topicId: selectedTopic?.id,
        groupId: relevantGroup.id,
      }),
      ctaLabel: "Join community support",
      priority: 45,
      confidence: 0.78,
      sourceSignals: ["selected_course", "community_signal"],
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      id: "default-start",
      kind: "next-best-action",
      title: "Pick a course to unlock your guided plan",
      reason: "We will build your personalized path once you choose a course.",
      href: toLearnActionHref({ action: "view", tab: "concept" }),
      ctaLabel: "Choose your course",
      priority: 30,
      confidence: 0.72,
      sourceSignals: ["missing_context"],
    });
  }

  const ranked = recommendations
    .sort((a, b) => b.priority - a.priority || b.confidence - a.confidence)
    .slice(0, 3);

  return ranked.map((item, index) => ({
    ...item,
    primary: index === 0,
  }));
}
