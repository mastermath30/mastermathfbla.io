import { readLocalStorage, writeLocalStorage, emitStorageEvent } from "@/lib/storage";
import { courses } from "@/data/courses";

export type TopicStatus = "locked" | "in_progress" | "mastered" | "needs_review";

export type QuizAttempt = {
  slug: string;
  topic: string;
  score: number;
  totalQuestions: number;
  accuracy: number;
  difficulty: "easy" | "medium" | "hard";
  completedAt: string;
};

export type LearningProgress = {
  selectedCourseId: string | null;
  selectedTopicId: string | null;
  topicStatusById: Record<string, TopicStatus>;
  masteryByTopicId: Record<string, number>;
  lastAttemptByTopicId: Record<string, { score: number; attemptedAt: string }>;
  unlockThreshold: number;
  completedTopicIds: string[];
  weakTopicIds: string[];
  recentActivity: string[];
  quizAttempts: QuizAttempt[];
  resourcePreference: "videos" | "worksheets" | "mixed";
  intent: "learn" | "practice" | "quiz" | "test-prep";
  tutorialCompleted: boolean;
  lastTutorialStep: number;
  globalTutorialCompleted: boolean;
  globalTutorialStep: number;
  globalTutorialLastRoute: string | null;
  testPrepMode: boolean;
  activeTopicView: "concept" | "video" | "practice" | "quiz" | "ai" | "community";
};

const DEFAULT_PROGRESS: LearningProgress = {
  selectedCourseId: null,
  selectedTopicId: null,
  topicStatusById: {},
  masteryByTopicId: {},
  lastAttemptByTopicId: {},
  unlockThreshold: 0.8,
  completedTopicIds: [],
  weakTopicIds: [],
  recentActivity: [],
  quizAttempts: [],
  resourcePreference: "mixed",
  intent: "practice",
  tutorialCompleted: false,
  lastTutorialStep: 0,
  globalTutorialCompleted: false,
  globalTutorialStep: 0,
  globalTutorialLastRoute: null,
  testPrepMode: false,
  activeTopicView: "concept",
};

const STORAGE_KEY = "mm_learning_progress_v1";
const EVENT_NAME = "mm_learning_progress_updated";

export function getLearningProgress(): LearningProgress {
  const stored = readLocalStorage<Partial<LearningProgress>>(STORAGE_KEY, {});
  const merged = {
    ...DEFAULT_PROGRESS,
    ...stored,
    topicStatusById:
      stored.topicStatusById && typeof stored.topicStatusById === "object" ? stored.topicStatusById : {},
    masteryByTopicId:
      stored.masteryByTopicId && typeof stored.masteryByTopicId === "object" ? stored.masteryByTopicId : {},
    lastAttemptByTopicId:
      stored.lastAttemptByTopicId && typeof stored.lastAttemptByTopicId === "object"
        ? stored.lastAttemptByTopicId
        : {},
    completedTopicIds: Array.isArray(stored.completedTopicIds) ? stored.completedTopicIds : [],
    weakTopicIds: Array.isArray(stored.weakTopicIds) ? stored.weakTopicIds : [],
    recentActivity: Array.isArray(stored.recentActivity) ? stored.recentActivity : [],
    quizAttempts: Array.isArray(stored.quizAttempts) ? stored.quizAttempts : [],
  };
  return ensureTopicStatuses(merged);
}

export function updateLearningProgress(
  updater: (current: LearningProgress) => LearningProgress
): LearningProgress {
  const current = getLearningProgress();
  const next = updater(current);
  writeLocalStorage(STORAGE_KEY, next);
  emitStorageEvent(EVENT_NAME);
  return next;
}

export function setSelectedCourse(courseId: string): void {
  updateLearningProgress((current) => ({
    ...ensureTopicStatuses({
      ...current,
      selectedCourseId: courseId,
      recentActivity: [`Selected ${courseId}`, ...current.recentActivity].slice(0, 10),
    }),
  }));
}

export function setSelectedTopic(topicId: string): void {
  updateLearningProgress((current) => ({
    ...current,
    selectedTopicId: topicId,
    topicStatusById: {
      ...current.topicStatusById,
      [topicId]: current.topicStatusById[topicId] === "locked" ? "in_progress" : current.topicStatusById[topicId] ?? "in_progress",
    },
    recentActivity: [`Opened topic ${topicId}`, ...current.recentActivity].slice(0, 10),
  }));
}

export function setLearningIntent(intent: LearningProgress["intent"]): void {
  updateLearningProgress((current) => ({
    ...current,
    intent,
    testPrepMode: intent === "test-prep" ? true : current.testPrepMode,
  }));
}

export function setResourcePreference(preference: LearningProgress["resourcePreference"]): void {
  updateLearningProgress((current) => ({ ...current, resourcePreference: preference }));
}

export function markTopicComplete(topicId: string): void {
  updateLearningProgress((current) => ({
    ...current,
    topicStatusById: {
      ...current.topicStatusById,
      [topicId]:
        current.topicStatusById[topicId] === "mastered" ? "mastered" : "in_progress",
    },
    completedTopicIds: Array.from(new Set([...current.completedTopicIds, topicId])),
    weakTopicIds: current.weakTopicIds.filter((id) => id !== topicId),
    recentActivity: [`Completed topic ${topicId}`, ...current.recentActivity].slice(0, 10),
  }));
}

export function addQuizAttempt(attempt: QuizAttempt): void {
  updateLearningProgress((current) => {
    const unlockThreshold = current.unlockThreshold || 0.8;
    const mastered = attempt.accuracy >= unlockThreshold;
    const selectedCourse = courses.find((course) => course.id === current.selectedCourseId);
    const sequence = selectedCourse?.recommendedSequence ?? [];
    const idx = sequence.indexOf(attempt.topic);
    const nextTopicId = idx >= 0 && idx < sequence.length - 1 ? sequence[idx + 1] : null;
    const weakTopicIds =
      attempt.accuracy < unlockThreshold
        ? Array.from(new Set([...current.weakTopicIds, attempt.topic]))
        : current.weakTopicIds.filter((id) => id !== attempt.topic);

    const nextStatusById: Record<string, TopicStatus> = {
      ...current.topicStatusById,
      [attempt.topic]: mastered ? "mastered" : "needs_review",
    };
    if (mastered && nextTopicId && nextStatusById[nextTopicId] === "locked") {
      nextStatusById[nextTopicId] = "in_progress";
    }

    return {
      ...current,
      topicStatusById: nextStatusById,
      masteryByTopicId: {
        ...current.masteryByTopicId,
        [attempt.topic]: Math.max(current.masteryByTopicId[attempt.topic] ?? 0, attempt.accuracy),
      },
      lastAttemptByTopicId: {
        ...current.lastAttemptByTopicId,
        [attempt.topic]: {
          score: attempt.accuracy,
          attemptedAt: attempt.completedAt,
        },
      },
      completedTopicIds: mastered
        ? Array.from(new Set([...current.completedTopicIds, attempt.topic]))
        : current.completedTopicIds,
      quizAttempts: [attempt, ...current.quizAttempts].slice(0, 30),
      weakTopicIds,
      recentActivity: [
        `Quiz ${attempt.slug} ${Math.round(attempt.accuracy * 100)}% ${mastered ? "(mastered)" : "(review needed)"}`,
        ...current.recentActivity,
      ].slice(0, 10),
    };
  });
}

export function setTutorialCompleted(completed: boolean): void {
  updateLearningProgress((current) => ({
    ...current,
    tutorialCompleted: completed,
    lastTutorialStep: completed ? 0 : current.lastTutorialStep,
  }));
}

export function setTutorialStep(step: number): void {
  updateLearningProgress((current) => ({
    ...current,
    lastTutorialStep: Math.max(0, step),
  }));
}

export function setGlobalTutorialCompleted(completed: boolean): void {
  updateLearningProgress((current) => ({
    ...current,
    globalTutorialCompleted: completed,
    globalTutorialStep: completed ? 0 : current.globalTutorialStep,
    globalTutorialLastRoute: completed ? null : current.globalTutorialLastRoute,
    tutorialCompleted: completed || current.tutorialCompleted,
  }));
}

export function setGlobalTutorialStep(step: number): void {
  updateLearningProgress((current) => ({
    ...current,
    globalTutorialStep: Math.max(0, step),
  }));
}

export function setGlobalTutorialLastRoute(route: string | null): void {
  updateLearningProgress((current) => ({
    ...current,
    globalTutorialLastRoute: route,
  }));
}

export function setTestPrepMode(enabled: boolean): void {
  updateLearningProgress((current) => ({
    ...current,
    testPrepMode: enabled,
    intent: enabled ? "test-prep" : current.intent === "test-prep" ? "practice" : current.intent,
  }));
}

export function setActiveTopicView(view: LearningProgress["activeTopicView"]): void {
  updateLearningProgress((current) => ({
    ...current,
    activeTopicView: view,
  }));
}

export const learningProgressEvent = EVENT_NAME;

function ensureTopicStatuses(progress: LearningProgress): LearningProgress {
  const next = {
    ...progress,
    topicStatusById: { ...progress.topicStatusById },
  };
  const selectedCourse = courses.find((course) => course.id === next.selectedCourseId) ?? courses[0];
  if (!selectedCourse) return next;

  const sequence = selectedCourse.recommendedSequence;
  sequence.forEach((topicId, index) => {
    const currentStatus = next.topicStatusById[topicId];
    if (currentStatus) return;
    if (index === 0) {
      next.topicStatusById[topicId] = "in_progress";
      return;
    }
    const priorTopicId = sequence[index - 1];
    const priorMastered =
      next.topicStatusById[priorTopicId] === "mastered" ||
      next.completedTopicIds.includes(priorTopicId);
    next.topicStatusById[topicId] = priorMastered ? "in_progress" : "locked";
  });

  return next;
}
