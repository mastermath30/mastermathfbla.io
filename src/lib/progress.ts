import { readLocalStorage, writeLocalStorage, emitStorageEvent } from "@/lib/storage";

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
  completedTopicIds: string[];
  weakTopicIds: string[];
  recentActivity: string[];
  quizAttempts: QuizAttempt[];
  resourcePreference: "videos" | "worksheets" | "mixed";
  intent: "learn" | "practice" | "quiz" | "test-prep";
};

const DEFAULT_PROGRESS: LearningProgress = {
  selectedCourseId: null,
  selectedTopicId: null,
  completedTopicIds: [],
  weakTopicIds: [],
  recentActivity: [],
  quizAttempts: [],
  resourcePreference: "mixed",
  intent: "practice",
};

const STORAGE_KEY = "mm_learning_progress_v1";
const EVENT_NAME = "mm_learning_progress_updated";

export function getLearningProgress(): LearningProgress {
  return readLocalStorage<LearningProgress>(STORAGE_KEY, DEFAULT_PROGRESS);
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
    ...current,
    selectedCourseId: courseId,
    recentActivity: [`Selected ${courseId}`, ...current.recentActivity].slice(0, 10),
  }));
}

export function setSelectedTopic(topicId: string): void {
  updateLearningProgress((current) => ({
    ...current,
    selectedTopicId: topicId,
    recentActivity: [`Opened topic ${topicId}`, ...current.recentActivity].slice(0, 10),
  }));
}

export function setLearningIntent(intent: LearningProgress["intent"]): void {
  updateLearningProgress((current) => ({ ...current, intent }));
}

export function setResourcePreference(preference: LearningProgress["resourcePreference"]): void {
  updateLearningProgress((current) => ({ ...current, resourcePreference: preference }));
}

export function markTopicComplete(topicId: string): void {
  updateLearningProgress((current) => ({
    ...current,
    completedTopicIds: Array.from(new Set([...current.completedTopicIds, topicId])),
    weakTopicIds: current.weakTopicIds.filter((id) => id !== topicId),
    recentActivity: [`Completed topic ${topicId}`, ...current.recentActivity].slice(0, 10),
  }));
}

export function addQuizAttempt(attempt: QuizAttempt): void {
  updateLearningProgress((current) => {
    const weakTopicIds =
      attempt.accuracy < 0.7
        ? Array.from(new Set([...current.weakTopicIds, attempt.topic]))
        : current.weakTopicIds.filter((id) => id !== attempt.topic);

    return {
      ...current,
      quizAttempts: [attempt, ...current.quizAttempts].slice(0, 30),
      weakTopicIds,
      recentActivity: [
        `Quiz ${attempt.slug} ${Math.round(attempt.accuracy * 100)}%`,
        ...current.recentActivity,
      ].slice(0, 10),
    };
  });
}

export const learningProgressEvent = EVENT_NAME;
