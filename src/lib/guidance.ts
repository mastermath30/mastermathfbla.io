import { allTopics, topicByQuizSlug, studyGroupSpotlights } from "@/data/courses";
import { LearningProgress } from "@/lib/progress";

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
};

function toLabel(value: string): string {
  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function buildRecommendations(progress: LearningProgress): Recommendation[] {
  const recommendations: Recommendation[] = [];

  const selectedTopic = allTopics.find((topic) => topic.id === progress.selectedTopicId);
  const selectedCourseId = progress.selectedCourseId;
  const latestQuiz = progress.quizAttempts[0];
  const lowQuiz = progress.quizAttempts.find((attempt) => attempt.accuracy < 0.7);

  if (selectedTopic) {
    recommendations.push({
      id: "next-action-topic",
      kind: "next-best-action",
      title: `Next step: ${selectedTopic.title} practice sprint`,
      reason: "You are currently focused on this topic. Momentum matters.",
      href: `/resources/quiz/${selectedTopic.quizSlugs[0]}`,
    });

    if (selectedTopic.prerequisites.length > 0) {
      recommendations.push({
        id: "prereq-topic",
        kind: "prerequisite",
        title: `Review prerequisite: ${selectedTopic.prerequisites[0]}`,
        reason: "Prerequisite review improves quiz confidence and retention.",
        href: "/learn",
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
      href: `/resources/quiz/${lowQuiz.slug}?difficulty=easy`,
    });
    recommendations.push({
      id: "ai-weak-area",
      kind: "ai-help",
      title: "Ask AI for a step-by-step recovery plan",
      reason: "A guided walkthrough is best right after a low-scoring attempt.",
      href: "/learn#ai-help",
    });
  }

  if (progress.intent === "test-prep") {
    recommendations.push({
      id: "test-prep-mode",
      kind: "quiz",
      title: "Test-prep mode: take an intermediate mixed quiz",
      reason: "You selected test-prep intent. Timed practice is the highest-value next action.",
      href: "/resources#quizzes",
    });
  }

  if (latestQuiz && latestQuiz.accuracy >= 0.85) {
    const strongerTopic = topicByQuizSlug[latestQuiz.slug];
    recommendations.push({
      id: "level-up",
      kind: "quiz",
      title: `Level up with a harder set in ${strongerTopic?.courseTitle ?? "your course"}`,
      reason: `You scored ${Math.round(latestQuiz.accuracy * 100)}% recently. You're ready for a challenge.`,
      href: `/resources/quiz/${latestQuiz.slug}?difficulty=hard`,
    });
  }

  if (progress.resourcePreference === "videos") {
    recommendations.push({
      id: "video-first",
      kind: "video",
      title: "Video-first review path",
      reason: "Your preference is set to videos, so we are prioritizing visual lessons.",
      href: "/learn#videos",
    });
  } else if (progress.resourcePreference === "worksheets") {
    recommendations.push({
      id: "worksheet-first",
      kind: "practice",
      title: "Worksheet-focused review path",
      reason: "Your preference is worksheets, so we are prioritizing printable drills.",
      href: "/learn#worksheets",
    });
  }

  if (selectedCourseId) {
    const relevantGroup =
      studyGroupSpotlights.find((group) =>
        group.name.toLowerCase().includes(selectedCourseId.split("-")[0] ?? "")
      ) ?? studyGroupSpotlights[0];

    recommendations.push({
      id: "community-group",
      kind: "community",
      title: `Join ${relevantGroup.name}`,
      reason: "Peer accountability improves completion and confidence.",
      href: relevantGroup.href,
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      id: "default-start",
      kind: "next-best-action",
      title: "Pick a course to unlock your guided plan",
      reason: "We will build your personalized path once you choose a course.",
      href: "/learn",
    });
  }

  return recommendations.slice(0, 5);
}
