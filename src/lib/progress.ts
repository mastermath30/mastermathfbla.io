import { writeLocalStorage, emitStorageEvent } from "@/lib/storage";
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
  recommended?: "retry-easy" | "continue-medium" | "continue-hard" | "ask-ai" | "next-topic";
  result?: "mastered" | "review";
};

export type LearningProgress = {
  selectedCourseId: string | null;
  selectedTopicId: string | null;
  topicStatusById: Record<string, TopicStatus>;
  masteryByTopicId: Record<string, number>;
  lastAttemptByTopicId: Record<string, { score: number; attemptedAt: string }>;
  unlockThreshold: number;
  completedTopicIds: string[];
  topicCheckpointCompletedById: Record<string, boolean>;
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
  progressVersion: number;
  updatedAt: string;
  xpTotal?: number;
  xpToday?: number;
  level?: number;
  lastXpAwardedAt?: string | null;
  lastQuizReturnContext:
    | {
        topicId: string;
        score: number;
        result: "mastered" | "review";
        recommended: "retry-easy" | "continue-medium" | "continue-hard" | "ask-ai" | "next-topic";
        timestamp: string;
      }
    | null;
};

const DEFAULT_PROGRESS: LearningProgress = {
  selectedCourseId: null,
  selectedTopicId: null,
  topicStatusById: {},
  masteryByTopicId: {},
  lastAttemptByTopicId: {},
  unlockThreshold: 0.8,
  completedTopicIds: [],
  topicCheckpointCompletedById: {},
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
  progressVersion: 0,
  updatedAt: new Date(0).toISOString(),
  xpTotal: 0,
  xpToday: 0,
  level: 1,
  lastXpAwardedAt: null,
  lastQuizReturnContext: null,
};

const STORAGE_KEY = "mm_learning_progress_v1";
const EVENT_NAME = "mm_learning_progress_updated";
let lastProgressLoadHadError = false;

export function getProgressStorageKey() {
  return STORAGE_KEY;
}

export function didLastProgressLoadFail() {
  return lastProgressLoadHadError;
}

function normalizeProgress(partial?: Partial<LearningProgress>): LearningProgress {
  const stored = partial ?? {};
  const merged: LearningProgress = {
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
    topicCheckpointCompletedById:
      stored.topicCheckpointCompletedById && typeof stored.topicCheckpointCompletedById === "object"
        ? stored.topicCheckpointCompletedById
        : {},
    weakTopicIds: Array.isArray(stored.weakTopicIds) ? stored.weakTopicIds : [],
    recentActivity: Array.isArray(stored.recentActivity) ? stored.recentActivity : [],
    quizAttempts: Array.isArray(stored.quizAttempts) ? stored.quizAttempts : [],
    progressVersion:
      typeof stored.progressVersion === "number" && Number.isFinite(stored.progressVersion)
        ? stored.progressVersion
        : 0,
    updatedAt:
      typeof stored.updatedAt === "string" && !Number.isNaN(Date.parse(stored.updatedAt))
        ? stored.updatedAt
        : new Date(0).toISOString(),
    xpTotal:
      typeof stored.xpTotal === "number" && Number.isFinite(stored.xpTotal)
        ? Math.max(0, Math.round(stored.xpTotal))
        : 0,
    xpToday:
      typeof stored.xpToday === "number" && Number.isFinite(stored.xpToday)
        ? Math.max(0, Math.round(stored.xpToday))
        : 0,
    level:
      typeof stored.level === "number" && Number.isFinite(stored.level)
        ? Math.max(1, Math.round(stored.level))
        : 1,
    lastXpAwardedAt:
      typeof stored.lastXpAwardedAt === "string" && !Number.isNaN(Date.parse(stored.lastXpAwardedAt))
        ? stored.lastXpAwardedAt
        : null,
    lastQuizReturnContext:
      stored.lastQuizReturnContext &&
      typeof stored.lastQuizReturnContext === "object" &&
      typeof stored.lastQuizReturnContext.topicId === "string" &&
      typeof stored.lastQuizReturnContext.score === "number" &&
      (stored.lastQuizReturnContext.result === "mastered" ||
        stored.lastQuizReturnContext.result === "review") &&
      typeof stored.lastQuizReturnContext.timestamp === "string"
        ? stored.lastQuizReturnContext
        : null,
  };

  return ensureTopicStatuses(merged);
}

function getDateKey(value: string) {
  const date = new Date(value);
  return `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`;
}

function applyXpAward(progress: LearningProgress, xp: number): LearningProgress {
  const safeXp = Math.max(0, Math.round(xp));
  if (safeXp <= 0) return progress;

  const nowIso = new Date().toISOString();
  const sameDay = progress.lastXpAwardedAt ? getDateKey(progress.lastXpAwardedAt) === getDateKey(nowIso) : false;
  const xpToday = sameDay ? (progress.xpToday ?? 0) + safeXp : safeXp;
  const xpTotal = (progress.xpTotal ?? 0) + safeXp;
  return {
    ...progress,
    xpTotal,
    xpToday,
    level: getLevelFromXp(xpTotal),
    lastXpAwardedAt: nowIso,
  };
}

export function getLevelFromXp(xpTotal: number): number {
  const safe = Math.max(0, Math.floor(xpTotal));
  return Math.floor(safe / 100) + 1;
}

export function awardLearningXp(
  eventType: "checkpoint-complete" | "quiz-pass" | "quiz-fail" | "next-topic-unlock",
  topicId?: string
): LearningProgress {
  const amountByEvent = {
    "checkpoint-complete": 10,
    "quiz-pass": 20,
    "quiz-fail": 5,
    "next-topic-unlock": 15,
  } as const;

  return updateLearningProgress((current) => {
    const next = applyXpAward(current, amountByEvent[eventType]);
    return {
      ...next,
      recentActivity: [
        `XP +${amountByEvent[eventType]} (${eventType})${topicId ? ` on ${topicId}` : ""}`,
        ...next.recentActivity,
      ].slice(0, 10),
    };
  });
}

function withMetadataBump(next: LearningProgress, previous: LearningProgress): LearningProgress {
  const prevVersion = typeof previous.progressVersion === "number" ? previous.progressVersion : 0;
  return {
    ...next,
    progressVersion: prevVersion + 1,
    updatedAt: new Date().toISOString(),
  };
}

export function getLearningProgress(): LearningProgress {
  if (typeof window === "undefined") {
    lastProgressLoadHadError = false;
    return ensureTopicStatuses(DEFAULT_PROGRESS);
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      lastProgressLoadHadError = false;
      return ensureTopicStatuses(DEFAULT_PROGRESS);
    }
    const parsed = JSON.parse(raw) as Partial<LearningProgress>;
    lastProgressLoadHadError = false;
    return normalizeProgress(parsed);
  } catch {
    lastProgressLoadHadError = true;
    return ensureTopicStatuses(DEFAULT_PROGRESS);
  }
}

export function updateLearningProgress(
  updater: (current: LearningProgress) => LearningProgress
): LearningProgress {
  const current = getLearningProgress();
  const updated = updater(current);
  const next = withMetadataBump(updated, current);
  writeLocalStorage(STORAGE_KEY, next);
  emitStorageEvent(EVENT_NAME);
  return next;
}

export function compareProgressRecency(a: LearningProgress | null | undefined, b: LearningProgress | null | undefined): number {
  if (!a && !b) return 0;
  if (a && !b) return 1;
  if (!a && b) return -1;
  const left = a as LearningProgress;
  const right = b as LearningProgress;

  const leftTs = Date.parse(left.updatedAt || new Date(0).toISOString()) || 0;
  const rightTs = Date.parse(right.updatedAt || new Date(0).toISOString()) || 0;
  if (leftTs !== rightTs) return leftTs > rightTs ? 1 : -1;

  const leftVersion = Number.isFinite(left.progressVersion) ? left.progressVersion : 0;
  const rightVersion = Number.isFinite(right.progressVersion) ? right.progressVersion : 0;
  if (leftVersion !== rightVersion) return leftVersion > rightVersion ? 1 : -1;
  return 0;
}

export function saveLearningProgressSnapshot(progress: LearningProgress): void {
  writeLocalStorage(STORAGE_KEY, normalizeProgress(progress));
  emitStorageEvent(EVENT_NAME);
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
  completeTopicCheckpoint(topicId);
}

export function completeTopicCheckpoint(topicId: string): void {
  updateLearningProgress((current) => {
    const alreadyCompleted = Boolean(current.topicCheckpointCompletedById[topicId]);
    const topicStatusById: Record<string, TopicStatus> = {
      ...current.topicStatusById,
      [topicId]:
        current.topicStatusById[topicId] === "mastered" ? "mastered" : "in_progress",
    };
    const base: LearningProgress = {
      ...current,
      topicStatusById,
      topicCheckpointCompletedById: {
        ...current.topicCheckpointCompletedById,
        [topicId]: true,
      },
      weakTopicIds: current.weakTopicIds.filter((id) => id !== topicId),
      recentActivity: [`Completed checkpoint ${topicId}`, ...current.recentActivity].slice(0, 10),
    };
    return alreadyCompleted ? base : applyXpAward(base, 10);
  });
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

    const withAttempt: LearningProgress = {
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
      lastQuizReturnContext: {
        topicId: attempt.topic,
        score: Math.round(attempt.accuracy * 100),
        result: attempt.result ?? (mastered ? "mastered" : "review"),
        recommended: attempt.recommended ?? (mastered ? "next-topic" : "retry-easy"),
        timestamp: attempt.completedAt,
      },
    };
    return applyXpAward(withAttempt, mastered ? 20 : 5);
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
