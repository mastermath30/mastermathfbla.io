"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, BookOpen, CheckCircle2, ExternalLink, ListChecks, Sparkles, Target, Users } from "lucide-react";
import { PageWrapper } from "@/components/motion";
import { RecommendationPanel } from "@/components/RecommendationPanel";
import { CommunitySpotlight } from "@/components/CommunitySpotlight";
import { GuidedOnboarding } from "@/components/GuidedOnboarding";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { LearnPathMap } from "@/components/learn/LearnPathMap";
import { LearnTopStrip } from "@/components/learn/LearnTopStrip";
import { PathNodeVM } from "@/components/learn/types";
import { triggerConfetti } from "@/components/Confetti";
import { useTranslations } from "@/components/LanguageProvider";
import { allTopics, courses } from "@/data/courses";
import {
  buildCommunityHref,
  normalizeResourcePlaybackTarget,
  parseLearnActionFromSearchParams,
  resolveQuizDisplayTitle,
  resolveQuizSlug,
} from "@/lib/learnActions";
import {
  awardLearningXp,
  compareProgressRecency,
  completeTopicCheckpoint,
  didLastProgressLoadFail,
  getLearningProgress,
  getProgressStorageKey,
  learningProgressEvent,
  saveLearningProgressSnapshot,
  setActiveTopicView,
  setSelectedCourse,
  setSelectedTopic,
  updateLearningProgress,
  type LearningProgress,
  type TopicStatus,
} from "@/lib/progress";
import { buildRecommendations } from "@/lib/guidance";
import { getSupabaseUserId, loadLearningProgressFromCloud, saveLearningProgressToCloud } from "@/lib/cloud";

type ResourceHubTab = "lessons" | "videos" | "worksheets" | "practice" | "quizzes";

const resourceHubTabs: Array<{ id: ResourceHubTab; label: string }> = [
  { id: "lessons", label: "Lessons" },
  { id: "videos", label: "Videos" },
  { id: "worksheets", label: "Worksheets" },
  { id: "practice", label: "Practice" },
  { id: "quizzes", label: "Quizzes" },
];

type FlowState =
  | "locked"
  | "not_started"
  | "in_progress"
  | "checkpoint_complete"
  | "quiz_ready"
  | "needs_review"
  | "mastered";

type ResultBanner = {
  tone: "success" | "warning";
  title: string;
  description: string;
  topicId?: string;
  recommendation?: "retry-easy" | "continue-medium" | "continue-hard" | "ask-ai" | "next-topic";
};

type QuizDifficultyPickerState = {
  topicId?: string;
  slug?: string;
} | null;

function getCourseSequence(courseId: string) {
  const course = courses.find((item) => item.id === courseId);
  if (!course) return [];
  const validIds = new Set(course.units.flatMap((unit) => unit.topics.map((topic) => topic.id)));
  return course.recommendedSequence.filter((topicId) => validIds.has(topicId));
}

function resolveCourseAndTopic(progress: LearningProgress, requestedTopicId?: string) {
  const requestedTopic = requestedTopicId ? allTopics.find((topic) => topic.id === requestedTopicId) ?? null : null;

  if (requestedTopic) {
    return {
      courseId: requestedTopic.courseId,
      topicId: requestedTopic.id,
    };
  }

  const selectedCourse = courses.find((course) => course.id === progress.selectedCourseId) ?? courses[0] ?? null;
  const selectedSequence = selectedCourse ? getCourseSequence(selectedCourse.id) : [];

  if (progress.selectedTopicId && selectedSequence.includes(progress.selectedTopicId)) {
    return {
      courseId: selectedCourse?.id ?? null,
      topicId: progress.selectedTopicId,
    };
  }

  return {
    courseId: selectedCourse?.id ?? null,
    topicId: selectedSequence[0] ?? null,
  };
}

function deriveTopicFlowState(
  topicStatus: TopicStatus,
  checkpointComplete: boolean,
  hasAttempt: boolean,
  mastery: number
): FlowState {
  if (topicStatus === "locked") return "locked";
  if (topicStatus === "mastered") return "mastered";
  if (topicStatus === "needs_review") return "needs_review";
  if (checkpointComplete && !hasAttempt) return "checkpoint_complete";
  if (checkpointComplete) return "quiz_ready";
  if (!checkpointComplete && !hasAttempt && mastery === 0) return "not_started";
  return "in_progress";
}

function toPathNodeState(flow: FlowState): PathNodeVM["state"] {
  if (flow === "locked") return "locked";
  if (flow === "mastered") return "mastered";
  if (flow === "needs_review") return "needs_review";
  if (flow === "quiz_ready" || flow === "checkpoint_complete") return "quiz_ready";
  if (flow === "in_progress") return "in_progress";
  return "available";
}

const laneCycle: Array<PathNodeVM["lane"]> = ["left", "center", "right", "center", "left"];

function deriveNodeType(index: number, unitTopicCount: number): PathNodeVM["nodeType"] {
  if (unitTopicCount > 1 && index === unitTopicCount - 1) return "mastery";
  if (unitTopicCount > 2 && index === unitTopicCount - 2) return "checkpoint";
  return "lesson";
}

function getLessonButtonLabel(
  state: PathNodeVM["state"] | undefined,
  hasStartedLesson: boolean,
  t: (key: string, params?: Record<string, string | number>) => string
) {
  if (state === "quiz_ready" || state === "needs_review" || state === "mastered") {
    return t("Review Lesson");
  }
  if (state === "locked") {
    return t("Lesson locked");
  }
  return hasStartedLesson ? t("Continue Lesson") : t("Start Lesson");
}

function LearnPageClient() {
  const { t } = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [progress, setProgress] = useState<LearningProgress>(() => getLearningProgress());
  const [isCloudHydrated, setIsCloudHydrated] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [loadWarning, setLoadWarning] = useState<string | null>(didLastProgressLoadFail() ? "progress-load-failed" : null);
  const [isReady] = useState(true);
  const [resultBanner, setResultBanner] = useState<ResultBanner | null>(null);
  const [panelNodeId, setPanelNodeId] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [xpToast, setXpToast] = useState<string | null>(null);
  const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(null);
  const [resourceHubTab, setResourceHubTab] = useState<ResourceHubTab>("lessons");
  const [selectedVideoByTopicId, setSelectedVideoByTopicId] = useState<Record<string, string>>({});
  const [startedLessonByTopicId, setStartedLessonByTopicId] = useState<Record<string, boolean>>({});
  const [quizDifficultyPicker, setQuizDifficultyPicker] = useState<QuizDifficultyPickerState>(null);
  const [pickedDifficultyBySlug, setPickedDifficultyBySlug] = useState<Record<string, "easy" | "medium" | "hard">>({});

  const previousXpRef = useRef<number>(progress.xpTotal ?? 0);
  const lastHandledQueryRef = useRef<string>("");
  const resourceHubRef = useRef<HTMLDivElement | null>(null);
  const lessonCardRef = useRef<HTMLDivElement | null>(null);
  const lessonVideoRef = useRef<HTMLDivElement | null>(null);

  const refreshProgress = useCallback(() => {
    const next = getLearningProgress();
    setProgress(next);
    setLoadWarning(didLastProgressLoadFail() ? "progress-load-failed" : null);
    return next;
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      refreshProgress();
      setHasHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [refreshProgress]);

  useEffect(() => {
    if (!hasHydrated) return;
    const timer = window.setTimeout(() => {
      try {
        const raw = window.localStorage.getItem("mathmaster-streak");
        if (!raw) return;
        const parsed = JSON.parse(raw) as { currentStreak?: number };
        setStreak(parsed.currentStreak ?? 0);
      } catch {
        setStreak(0);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [hasHydrated]);

  useEffect(() => {
    const before = previousXpRef.current;
    const now = progress.xpTotal ?? 0;
    if (now > before) {
      const delta = now - before;
      setXpToast(`+${delta} XP`);
      window.setTimeout(() => setXpToast(null), 1800);
    }
    previousXpRef.current = now;
  }, [progress.xpTotal]);

  const selectedCourse = useMemo(
    () => courses.find((course) => course.id === progress.selectedCourseId) ?? courses[0],
    [progress.selectedCourseId]
  );

  const selectedSequence = useMemo(() => (selectedCourse ? getCourseSequence(selectedCourse.id) : []), [selectedCourse]);

  const selectedTopic = useMemo(() => {
    if (!selectedSequence.length) return null;
    const preferred = progress.selectedTopicId && selectedSequence.includes(progress.selectedTopicId)
      ? progress.selectedTopicId
      : selectedSequence[0];
    return allTopics.find((topic) => topic.id === preferred) ?? null;
  }, [progress.selectedTopicId, selectedSequence]);

  const selectedTopicId = selectedTopic?.id ?? null;
  const selectedIndex = selectedTopicId ? selectedSequence.indexOf(selectedTopicId) : -1;
  const nextTopicId =
    selectedIndex >= 0 && selectedIndex < selectedSequence.length - 1
      ? selectedSequence[selectedIndex + 1]
      : null;

  const selectedTopicAttempt = useMemo(() => {
    if (!selectedTopic?.quizSlugs?.length) return null;
    return (
      progress.quizAttempts
        .filter((attempt) => selectedTopic.quizSlugs.includes(attempt.slug))
        .sort((left, right) => Date.parse(right.completedAt) - Date.parse(left.completedAt))[0] ?? null
    );
  }, [progress.quizAttempts, selectedTopic]);

  const selectedTopicCheckpointComplete = selectedTopicId ? Boolean(progress.topicCheckpointCompletedById[selectedTopicId]) : false;
  const selectedTopicStatus = selectedTopicId ? progress.topicStatusById[selectedTopicId] ?? "locked" : "locked";

  const selectedFlowState: FlowState = useMemo(
    () => deriveTopicFlowState(
      selectedTopicStatus,
      selectedTopicCheckpointComplete,
      Boolean(selectedTopicAttempt),
      selectedTopicId ? progress.masteryByTopicId[selectedTopicId] ?? 0 : 0
    ),
    [progress.masteryByTopicId, selectedTopicAttempt, selectedTopicCheckpointComplete, selectedTopicId, selectedTopicStatus]
  );

  const flowLabelByState: Record<FlowState, string> = {
    locked: t("Locked"),
    not_started: t("Not started"),
    in_progress: t("In progress"),
    checkpoint_complete: t("Checkpoint complete"),
    quiz_ready: t("Quiz ready"),
    needs_review: t("Needs review"),
    mastered: t("Mastered"),
  };

  const nodeViewModels = useMemo(() => {
    return selectedSequence.map((topicId, index) => {
      const topic = allTopics.find((item) => item.id === topicId);
      if (!topic) return null;
      const unitTopics = selectedCourse?.units.find((unit) => unit.id === topic.unitId)?.topics ?? [];
      const unitTopicIndex = unitTopics.findIndex((entry) => entry.id === topic.id);
      const unitIndex = selectedCourse?.units.findIndex((unit) => unit.id === topic.unitId) ?? -1;

      const rawStatus = progress.topicStatusById[topicId] ?? "locked";
      const topicAttempt = progress.quizAttempts.find((attempt) => topic.quizSlugs.includes(attempt.slug));
      const flowState = deriveTopicFlowState(
        rawStatus,
        Boolean(progress.topicCheckpointCompletedById[topicId]),
        Boolean(topicAttempt),
        progress.masteryByTopicId[topicId] ?? 0
      );

      return {
        id: topic.id,
        title: topic.title,
        unitTitle: topic.unitTitle,
        estimatedMinutes: topic.estimatedMinutes,
        difficulty: topic.difficulty,
        summary: topic.summary,
        masteryGoal: topic.masteryGoal,
        readinessSignals: topic.readinessSignals,
        state: toPathNodeState(flowState),
        masteryPercent: Math.round((progress.masteryByTopicId[topic.id] ?? 0) * 100),
        lockedReason: rawStatus === "locked" ? `Requires ${Math.round(progress.unlockThreshold * 100)}% on previous quiz` : undefined,
        checkpointComplete: Boolean(progress.topicCheckpointCompletedById[topic.id]),
        hasQuizAttempt: Boolean(topicAttempt),
        isFocus: false,
        index,
        nodeType: deriveNodeType(Math.max(0, unitTopicIndex), unitTopics.length),
        chapterIndex: Math.max(0, unitIndex),
        chapterTitle: topic.unitTitle,
        lane: laneCycle[index % laneCycle.length],
      } as PathNodeVM;
    }).filter(Boolean) as PathNodeVM[];
  }, [progress.masteryByTopicId, progress.quizAttempts, progress.topicCheckpointCompletedById, progress.topicStatusById, progress.unlockThreshold, selectedCourse?.units, selectedSequence]);

  const focusNodeId = useMemo(() => {
    const byIdx = nodeViewModels.slice().sort((a, b) => a.index - b.index);
    const firstProgress = byIdx.find((node) => node.state === "in_progress" || node.state === "available");
    if (firstProgress) return firstProgress.id;

    const firstReview = byIdx.find((node) => node.state === "needs_review");
    if (firstReview) return firstReview.id;

    const firstLocked = byIdx.find((node) => node.state === "locked");
    if (firstLocked) {
      const predecessor = byIdx[firstLocked.index - 1];
      if (predecessor) return predecessor.id;
      return firstLocked.id;
    }

    const mastered = byIdx.filter((node) => node.state === "mastered");
    return mastered[mastered.length - 1]?.id ?? byIdx[0]?.id ?? null;
  }, [nodeViewModels]);

  const mappedNodes = useMemo(
    () => nodeViewModels.map((node) => ({ ...node, isFocus: node.id === focusNodeId })),
    [focusNodeId, nodeViewModels]
  );

  const selectedNode = useMemo(() => {
    const effectiveId = panelNodeId ?? selectedTopicId ?? focusNodeId;
    if (!effectiveId) return null;
    return mappedNodes.find((node) => node.id === effectiveId) ?? null;
  }, [focusNodeId, mappedNodes, panelNodeId, selectedTopicId]);

  const activeTopic = useMemo(() => {
    const activeId = selectedNode?.id ?? selectedTopicId ?? null;
    return activeId ? allTopics.find((topic) => topic.id === activeId) ?? selectedTopic : selectedTopic;
  }, [selectedNode?.id, selectedTopic, selectedTopicId]);

  const activeTopicId = activeTopic?.id ?? null;
  const activeUnitId = activeTopic?.unitId ?? selectedCourse?.units[0]?.id ?? null;
  const selectedCourseUnits = selectedCourse?.units ?? [];
  const activeQuizCount = activeTopic?.quizSlugs?.length ?? 0;
  const activeTopicAttempt = useMemo(() => {
    if (!activeTopic?.quizSlugs?.length) return null;
    return (
      progress.quizAttempts
        .filter((attempt) => activeTopic.quizSlugs.includes(attempt.slug))
        .sort((left, right) => Date.parse(right.completedAt) - Date.parse(left.completedAt))[0] ?? null
    );
  }, [activeTopic, progress.quizAttempts]);
  const activeTopicCheckpointComplete = activeTopicId ? Boolean(progress.topicCheckpointCompletedById[activeTopicId]) : false;
  const activeTopicStatus = activeTopicId ? progress.topicStatusById[activeTopicId] ?? "locked" : "locked";
  const activeFlowState: FlowState = useMemo(
    () => deriveTopicFlowState(
      activeTopicStatus,
      activeTopicCheckpointComplete,
      Boolean(activeTopicAttempt),
      activeTopicId ? progress.masteryByTopicId[activeTopicId] ?? 0 : 0
    ),
    [activeTopicAttempt, activeTopicCheckpointComplete, activeTopicId, activeTopicStatus, progress.masteryByTopicId]
  );
  const hasStartedActiveLesson = activeTopicId ? Boolean(startedLessonByTopicId[activeTopicId]) : false;

  const selectedCourseTopicIds = selectedCourse
    ? selectedCourse.units.flatMap((unit) => unit.topics.map((topic) => topic.id))
    : [];
  const masteredInCourse = selectedCourseTopicIds.filter((topicId) => progress.topicStatusById[topicId] === "mastered").length;
  const courseCompletionPercent = selectedCourseTopicIds.length
    ? Math.round((masteredInCourse / selectedCourseTopicIds.length) * 100)
    : 0;

  const selectedUnitComplete = useMemo(() => {
    if (!activeTopic) return false;
    const unit = selectedCourse?.units.find((entry) => entry.id === activeTopic.unitId);
    if (!unit) return false;
    return unit.topics.every((topic) => (progress.topicStatusById[topic.id] ?? "locked") === "mastered");
  }, [activeTopic, progress.topicStatusById, selectedCourse?.units]);

  const recommendations = useMemo(() => buildRecommendations(progress), [progress]);

  const selectedTopicCommunityHref = useMemo(
    () =>
      buildCommunityHref({
        thread: activeTopic?.communityThread,
      }),
    [activeTopic?.communityThread]
  );

  const openAiTutor = useCallback((opts?: { prompt?: string; autoSend?: boolean }) => {
    window.dispatchEvent(
      new CustomEvent("open-ai-tutor", {
        detail: {
          prompt: opts?.prompt,
          autoSend: opts?.autoSend,
        },
      })
    );
  }, []);

  const openQuiz = useCallback((opts?: { topicId?: string; slug?: string; difficulty?: "easy" | "medium" | "hard" }) => {
    const slug = resolveQuizSlug(opts?.topicId ?? activeTopicId ?? selectedTopicId ?? undefined, opts?.slug);
    if (!slug) return;
    const difficulty = opts?.difficulty ?? "medium";
    setActiveTopicView("quiz");
    router.push(`/resources/quiz/${slug}?difficulty=${difficulty}`);
  }, [activeTopicId, router, selectedTopicId]);

  const openQuizDifficultyPicker = useCallback((opts?: { topicId?: string; slug?: string }) => {
    const resolvedTopicId = opts?.topicId ?? activeTopicId ?? selectedTopicId ?? undefined;
    const resolvedSlug = resolveQuizSlug(resolvedTopicId, opts?.slug);
    if (!resolvedSlug) return;
    setQuizDifficultyPicker({
      topicId: resolvedTopicId,
      slug: resolvedSlug,
    });
  }, [activeTopicId, selectedTopicId]);

  const jumpToResourceHub = useCallback((tab: ResourceHubTab) => {
    setResourceHubTab(tab);
    if (tab === "lessons") setActiveTopicView("concept");
    if (tab === "videos") setActiveTopicView("video");
    if (tab === "practice" || tab === "worksheets") setActiveTopicView("practice");
    if (tab === "quizzes") setActiveTopicView("quiz");
    window.setTimeout(() => {
      resourceHubRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }, []);

  const openLessonVideo = useCallback(() => {
    if (!activeTopicId) return;
    setStartedLessonByTopicId((current) => ({
      ...current,
      [activeTopicId]: true,
    }));
    setActiveTopicView("video");
    setResourceHubTab("videos");
    window.setTimeout(() => {
      lessonVideoRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }, [activeTopicId]);

  const openLesson = useCallback(() => {
    if (!activeTopicId) return;
    const locked = (progress.topicStatusById[activeTopicId] ?? "locked") === "locked";
    if (locked) {
      setResultBanner({
        tone: "warning",
        title: t("Topic locked"),
        description: t("Master the previous topic first, then this lesson will unlock."),
        topicId: activeTopicId,
      });
      return;
    }
    setStartedLessonByTopicId((current) => ({
      ...current,
      [activeTopicId]: true,
    }));
    setActiveTopicView("concept");
    setResourceHubTab("lessons");
    setResultBanner(null);
    window.setTimeout(() => {
      lessonCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }, [activeTopicId, progress.topicStatusById, t]);

  const moveToNextTopic = useCallback(() => {
    if (!nextTopicId) return;
    setSelectedTopic(nextTopicId);
    setPanelNodeId(nextTopicId);
    setActiveTopicView("concept");
    awardLearningXp("next-topic-unlock", nextTopicId);
    const latest = refreshProgress();
    setResultBanner({
      tone: "success",
      title: t("New topic unlocked"),
      description: t("You moved forward in your path and earned extra XP."),
      topicId: nextTopicId,
      recommendation: latest.lastQuizReturnContext?.recommended,
    });
    setHighlightedNodeId(nextTopicId);
  }, [nextTopicId, refreshProgress, t]);

  const completeLesson = useCallback(() => {
    if (!activeTopicId) return;
    const locked = (progress.topicStatusById[activeTopicId] ?? "locked") === "locked";
    if (locked) {
      setResultBanner({
        tone: "warning",
        title: t("Topic locked"),
        description: t("Master the previous topic first, then this lesson will unlock."),
        topicId: activeTopicId,
      });
      return;
    }
    setStartedLessonByTopicId((current) => ({
      ...current,
      [activeTopicId]: true,
    }));
    completeTopicCheckpoint(activeTopicId);
    const latest = refreshProgress();
    setResultBanner({
      tone: "success",
      title: t("Lesson complete"),
      description:
        activeQuizCount > 0
          ? t("Great work. Your lesson is complete and the quiz is ready when you are.")
          : t("Great work. Your lesson is complete. Use practice, videos, or AI support for the next step."),
      topicId: activeTopicId,
      recommendation: latest.lastQuizReturnContext?.recommended,
    });
    setResourceHubTab(activeQuizCount > 0 ? "quizzes" : "practice");
  }, [activeQuizCount, activeTopicId, progress.topicStatusById, refreshProgress, t]);

  const changeCourse = useCallback((courseId: string) => {
    const nextSequence = getCourseSequence(courseId);
    setSelectedCourse(courseId);
    if (nextSequence[0]) setSelectedTopic(nextSequence[0]);
    setPanelNodeId(nextSequence[0] ?? null);
    setActiveTopicView("concept");
    updateLearningProgress((current) => ({
      ...current,
      recentActivity: [`Changed course to ${courseId}`, ...current.recentActivity].slice(0, 10),
    }));
    setResultBanner(null);
    refreshProgress();
  }, [refreshProgress]);

  const changeTopic = useCallback((topicId: string) => {
    const locked = (progress.topicStatusById[topicId] ?? "locked") === "locked";
    if (!locked) {
      setSelectedTopic(topicId);
      setActiveTopicView("concept");
      refreshProgress();
    }
    setPanelNodeId(topicId);
    setHighlightedNodeId(topicId);
    setResultBanner(null);
  }, [progress.topicStatusById, refreshProgress]);

  const changeUnit = useCallback((unitId: string) => {
    const unit = selectedCourse?.units.find((entry) => entry.id === unitId);
    const firstTopicId = unit?.topics[0]?.id;
    if (!firstTopicId) return;
    changeTopic(firstTopicId);
  }, [changeTopic, selectedCourse?.units]);

  useEffect(() => {
    const local = getLearningProgress();

    let cancelled = false;
    async function hydrateFromCloud() {
      const userId = await getSupabaseUserId();
      if (!userId) {
        setIsCloudHydrated(true);
        return;
      }

      const cloud = await loadLearningProgressFromCloud(userId);
      if (cancelled) return;
      if (cloud) {
        const winner = compareProgressRecency(cloud as LearningProgress, local) > 0 ? (cloud as LearningProgress) : local;
        saveLearningProgressSnapshot(winner);
        if (winner === local) {
          await saveLearningProgressToCloud(userId, local);
        }
      } else {
        await saveLearningProgressToCloud(userId, local);
      }
      setProgress(getLearningProgress());
      setLoadWarning(didLastProgressLoadFail() ? "progress-load-failed" : null);
      setIsCloudHydrated(true);
    }

    hydrateFromCloud();
    return () => {
      cancelled = true;
    };
  }, [refreshProgress]);

  useEffect(() => {
    if (!isCloudHydrated) return;
    async function pushToCloud() {
      const userId = await getSupabaseUserId();
      if (!userId) return;
      await saveLearningProgressToCloud(userId, progress);
    }
    pushToCloud();
  }, [progress, isCloudHydrated]);

  useEffect(() => {
    const handleProgressUpdate = () => {
      const latest = getLearningProgress();
      setProgress((current) => (compareProgressRecency(latest, current) > 0 ? latest : current));
      setLoadWarning(didLastProgressLoadFail() ? "progress-load-failed" : null);
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === getProgressStorageKey()) {
        handleProgressUpdate();
      }
    };

    window.addEventListener(learningProgressEvent, handleProgressUpdate);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener(learningProgressEvent, handleProgressUpdate);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const query = searchParams.toString();
    if (query === lastHandledQueryRef.current) return;

    lastHandledQueryRef.current = query;
    const parsed = parseLearnActionFromSearchParams(new URLSearchParams(query));
    const latest = getLearningProgress();

    const resolved = resolveCourseAndTopic(latest, parsed?.topicId);
    if (resolved.courseId) setSelectedCourse(resolved.courseId);
    if (resolved.topicId) {
      setSelectedTopic(resolved.topicId);
      setPanelNodeId(resolved.topicId);
      window.setTimeout(() => setHighlightedNodeId(resolved.topicId!), 0);
    }

    if (parsed?.tab) {
      setActiveTopicView(parsed.tab);
    } else {
      setActiveTopicView("concept");
    }

    if (parsed?.source === "quiz" && parsed.result) {
      if (parsed.result === "mastered") triggerConfetti();
      const topicIdFromResult = resolved.topicId ?? null;
      const topicIndexInSeq = topicIdFromResult ? selectedSequence.indexOf(topicIdFromResult) : -1;
      const firstUnlockedSuccessor =
        parsed.result === "mastered" && topicIndexInSeq >= 0 && topicIndexInSeq < selectedSequence.length - 1
          ? selectedSequence[topicIndexInSeq + 1]
          : null;
      const scoreText = typeof parsed.score === "number" ? `${parsed.score}%` : "";
      setResultBanner({
        tone: parsed.result === "mastered" ? "success" : "warning",
        title: parsed.result === "mastered" ? t("Mastery unlocked") : t("More review needed"),
        description:
          parsed.result === "mastered"
            ? scoreText
              ? t("Quiz result: {score}. Continue to unlock your next node.", { score: scoreText })
              : t("You met the mastery threshold. Continue to your next node.")
            : scoreText
            ? t("Quiz result: {score}. Try recovery mode or ask AI support.", { score: scoreText })
            : t("Try an easy recovery set or ask AI support before retaking."),
        topicId: topicIdFromResult ?? undefined,
        recommendation: parsed.recommended,
      });
      setHighlightedNodeId(firstUnlockedSuccessor ?? topicIdFromResult);
    }

    if (parsed?.action === "open-ai") {
      setActiveTopicView("ai");
      openAiTutor({ prompt: activeTopic?.aiPrompt, autoSend: false });
    }

    if (parsed?.action === "open-community") {
      setActiveTopicView("community");
      router.push(selectedTopicCommunityHref);
    }

    if (parsed?.action === "open-quiz") {
      openQuiz({ topicId: resolved.topicId ?? undefined, difficulty: parsed.difficulty ?? "medium" });
    }

    if (parsed) {
      const cleanPath = pathname || "/learn";
      router.replace(cleanPath, { scroll: false });
    }
  }, [activeTopic?.aiPrompt, openAiTutor, openQuiz, pathname, router, searchParams, selectedSequence, selectedTopicCommunityHref, t]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!highlightedNodeId) return;
    const target = document.getElementById(`path-node-${highlightedNodeId}`);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlightedNodeId]);

  useEffect(() => {
    if (!quizDifficultyPicker) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setQuizDifficultyPicker(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [quizDifficultyPicker]);

  useEffect(() => {
    if (!activeUnitId) return;
    const target = document.getElementById(`learn-unit-${activeUnitId}`);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    }
  }, [activeUnitId]);

  const primaryAction = useMemo(() => {
    if (!selectedNode) {
      return {
        label: t("Choose topic"),
        onClick: () => {
          if (focusNodeId) setPanelNodeId(focusNodeId);
        },
      };
    }

    if (selectedNode.state === "locked") {
      return {
        label: t("View unlock rule"),
        onClick: () =>
          setResultBanner({
            tone: "warning",
            title: t("Topic locked"),
            description: selectedNode.lockedReason ?? t("Master the previous topic first, then this lesson will unlock."),
            topicId: selectedNode.id,
          }),
      };
    }

    if (selectedNode.state === "in_progress" || selectedNode.state === "available") {
      return {
        label: getLessonButtonLabel(selectedNode.state, Boolean(startedLessonByTopicId[selectedNode.id]), t),
        onClick: openLesson,
      };
    }

    if (selectedNode.state === "quiz_ready") {
      return {
        label: t("Take quiz"),
        onClick: () => openQuizDifficultyPicker({ topicId: selectedNode.id }),
      };
    }

    if (selectedNode.state === "needs_review") {
      return {
        label: t("Recovery quiz"),
        onClick: () => openQuiz({ topicId: selectedNode.id, difficulty: "easy" }),
      };
    }

    if (nextTopicId) {
      return {
        label: t("Go next"),
        onClick: moveToNextTopic,
      };
    }

    return {
      label: t("Choose topic"),
      onClick: () => {
        if (focusNodeId) setPanelNodeId(focusNodeId);
      },
    };
  }, [focusNodeId, moveToNextTopic, nextTopicId, openLesson, openQuiz, openQuizDifficultyPicker, selectedNode, startedLessonByTopicId, t]);

  const level = progress.level ?? 1;
  const xpToday = progress.xpToday ?? 0;
  const xpToNext = Math.max(0, 100 - (xpToday % 100));

  const selectedResources = activeTopic?.resources ?? [];
  const lessonResources = selectedResources.filter((resource) => resource.kind === "lesson");
  const videoResources = selectedResources.filter((resource) => resource.kind === "video");
  const worksheetResources = selectedResources.filter((resource) => resource.kind === "worksheet");
  const practiceResources = selectedResources.filter((resource) => resource.kind === "practice");
  const availableQuizSlugs = activeTopic?.quizSlugs ?? [];
  const activeTopicKey = activeTopic?.id ?? "";

  const activeVideoHref = activeTopicKey ? selectedVideoByTopicId[activeTopicKey] : undefined;
  const activeVideo = videoResources.find((resource) => resource.href === activeVideoHref) ?? videoResources[0] ?? null;
  const activeVideoPlayback = activeVideo ? normalizeResourcePlaybackTarget(activeVideo) : null;

  const resourceCounts = {
    lessons: lessonResources.length,
    videos: videoResources.length,
    worksheets: worksheetResources.length,
    practice: practiceResources.length,
    quizzes: availableQuizSlugs.length,
  } as const;
  const lessonButtonLabel = getLessonButtonLabel(selectedNode?.state, hasStartedActiveLesson, t);
  const hasLessonVideo = videoResources.length > 0;
  const lessonKeyIdeas = useMemo(() => {
    if (!activeTopic) return [];
    if (activeTopic.readinessSignals.length > 0) return activeTopic.readinessSignals;
    return [
      t("Understand the main idea behind {topic}.", { topic: activeTopic.title }),
      activeTopic.masteryGoal || t("Know what a strong answer should look like."),
      t("Check your work and explain why your answer makes sense."),
    ];
  }, [activeTopic, t]);
  const lessonGuidedSteps = useMemo(() => {
    if (!activeTopic) return [];
    return [
      t("Read the topic summary first so you know what skill you are building."),
      activeTopic.masteryGoal
        ? t("Keep this goal in mind while you work: {goal}", { goal: activeTopic.masteryGoal })
        : t("Focus on the core skill this topic is teaching."),
      lessonKeyIdeas[0]
        ? t("Use this key idea as your checkpoint: {idea}", { idea: lessonKeyIdeas[0] })
        : t("Work through one example slowly before moving on."),
      t("When you feel confident, move to practice or take the quiz to confirm your understanding."),
    ];
  }, [activeTopic, lessonKeyIdeas, t]);
  const lessonNextSteps = useMemo(() => {
    if (!activeTopic) return [];
    const labels: Record<string, string> = {
      "learn-concept": t("Read the lesson carefully and identify the main rule or pattern."),
      "do-practice": t("Try a few practice problems before you take the quiz."),
      "take-quiz": t("Use the quiz to confirm that you can apply the skill on your own."),
      "ask-ai": t("Ask AI support when you want step-by-step help."),
      "get-community-help": t("Use the community if you want to compare approaches or ask a question."),
    };
    if (hasLessonVideo) {
      labels["watch-video"] = t("Watch the lesson video for another walkthrough without leaving the page.");
    }
    return activeTopic.recommendedActions.map((action) => labels[action]).filter(Boolean);
  }, [activeTopic, hasLessonVideo, t]);
  const showLessonWorkspace =
    hasStartedActiveLesson ||
    (activeFlowState !== "not_started" && activeFlowState !== "locked");

  if (!isReady || !hasHydrated) {
    return (
      <PageWrapper className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 md:pt-28">
        <main className="max-w-[88rem] mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-8 md:pt-4">{t("Loading learning path...")}</main>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 md:pt-28 learn-page-bg">
      <main className="max-w-[88rem] mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-8 md:pt-4 md:pb-10 space-y-6">
        {quizDifficultyPicker && (
          <div
            className="fixed inset-0 z-[90] flex items-end justify-center bg-slate-950/60 p-4 sm:items-center"
            onClick={() => setQuizDifficultyPicker(null)}
          >
            <Card
              className="w-full max-w-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 shadow-[0_28px_90px_-44px_rgba(15,23,42,0.55)] backdrop-blur"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="border-b border-slate-200/70 bg-gradient-to-br from-white via-slate-50 to-[var(--theme-primary)]/5 p-5 dark:border-slate-800/90 dark:from-slate-900 dark:via-slate-900 dark:to-[var(--theme-primary)]/10 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="inline-flex items-center gap-2 rounded-full border border-[var(--theme-primary)]/20 bg-[var(--theme-primary)]/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--theme-primary)]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--theme-primary)]" />
                      {t("Choose quiz difficulty")}
                    </div>
                    <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-[2rem]">
                      {quizDifficultyPicker?.slug
                        ? resolveQuizDisplayTitle(quizDifficultyPicker.slug, activeTopic)
                        : activeTopic?.title
                        ? `${activeTopic.title} Quiz`
                        : t("Built-in quiz")}
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                      {t("Pick the challenge level that matches how ready you feel. The quiz will stay focused on this topic, but the depth, reasoning, and question style will change with the level you choose.")}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setQuizDifficultyPicker(null)}
                    className="inline-flex h-10 min-w-10 items-center justify-center rounded-full border border-[var(--theme-primary)]/35 bg-[var(--theme-primary)] px-3 text-sm font-semibold text-white shadow-[0_14px_30px_-18px_rgba(var(--theme-primary-rgb),0.9)] transition hover:brightness-105 hover:shadow-[0_18px_36px_-20px_rgba(var(--theme-primary-rgb),0.95)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--theme-primary)]"
                    aria-label={t("Close")}
                  >
                    <span className="hidden sm:inline">{t("Close")}</span>
                    <span className="sm:hidden">×</span>
                  </button>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{t("Pick a level to begin")}</p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                      {t("Start with fundamentals, stay with the standard path, or push into deeper application.")}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  {[
                    {
                      id: "easy" as const,
                      title: t("Easy"),
                      eyebrow: t("Foundations"),
                      description: t("Start with more direct questions and simpler examples."),
                      detail: t("Best for first attempts, review, and building confidence."),
                    },
                    {
                      id: "medium" as const,
                      title: t("Medium"),
                      eyebrow: t("Standard"),
                      description: t("Use the standard quiz path for topic understanding."),
                      detail: t("Balanced challenge with multi-step thinking and familiar problem types."),
                    },
                    {
                      id: "hard" as const,
                      title: t("Hard"),
                      eyebrow: t("Challenge"),
                      description: t("Take on more demanding reasoning and deeper application."),
                      detail: t("Best for stronger recall, word problems, and tougher distractors."),
                    },
                  ].map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      aria-label={`${t("Start {level}", { level: option.title })} — ${option.description}`}
                      onClick={() => {
                        if (quizDifficultyPicker.slug) {
                          setPickedDifficultyBySlug((prev) => ({
                            ...prev,
                            [quizDifficultyPicker.slug!]: option.id,
                          }));
                        }
                        openQuiz({
                          topicId: quizDifficultyPicker.topicId,
                          slug: quizDifficultyPicker.slug,
                          difficulty: option.id,
                        });
                        setQuizDifficultyPicker(null);
                      }}
                      className="group relative flex h-full min-h-[220px] flex-col rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white to-slate-50/70 p-5 text-left shadow-[0_20px_60px_-42px_rgba(15,23,42,0.45)] transition-all duration-200 hover:-translate-y-1 hover:border-[var(--theme-primary)]/70 hover:shadow-[0_28px_70px_-36px_rgba(var(--theme-primary-rgb),0.30)] hover:bg-gradient-to-br hover:from-white hover:to-[color-mix(in_srgb,var(--theme-primary)_4%,white)] active:scale-[0.98] active:shadow-[0_12px_40px_-20px_rgba(var(--theme-primary-rgb),0.42)] dark:border-slate-800 dark:from-slate-900 dark:to-slate-950/70 dark:shadow-[0_18px_48px_-36px_rgba(2,6,23,0.8)] dark:hover:border-[var(--theme-primary)]/55 dark:hover:shadow-[0_28px_70px_-36px_rgba(var(--theme-primary-rgb),0.26)] dark:hover:from-slate-900 dark:hover:to-[color-mix(in_srgb,var(--theme-primary)_6%,rgb(15_23_42))] focus-visible:outline-2 focus-visible:outline-[var(--theme-primary)] focus-visible:outline-offset-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--theme-primary)]/90">
                            {option.eyebrow}
                          </p>
                          <p className="mt-2 text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
                            {option.title}
                          </p>
                        </div>
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[var(--theme-primary)]/20 bg-[var(--theme-primary)]/9 text-sm font-bold text-[var(--theme-primary)] transition-all duration-200 group-hover:border-transparent group-hover:bg-gradient-to-br group-hover:from-[var(--theme-primary)] group-hover:to-[var(--theme-primary-light)] group-hover:text-white group-hover:shadow-[0_4px_12px_rgba(var(--theme-primary-rgb),0.32)]">
                          {option.title.charAt(0)}
                        </div>
                      </div>
                      <p className="mt-4 text-sm leading-6 text-slate-700 dark:text-slate-300">{option.description}</p>
                      <p className="mt-3 flex-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{option.detail}</p>
                      <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--theme-primary)] group-hover:text-[var(--theme-primary)]">
                        <span>{t("Start {level}", { level: option.title })}</span>
                        <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl border border-slate-200/70 bg-slate-50/80 px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-400">
                  {t("You can retake the quiz at a different level anytime to review fundamentals or push for a harder challenge.")}
                </div>
              </div>
            </Card>
          </div>
        )}

        <LearnTopStrip
          topicTitle={activeTopic?.title ?? t("Choose a topic")}
          xpToday={xpToday}
          xpToNext={xpToNext}
          level={level}
          streak={streak}
          primaryActionLabel={primaryAction.label}
          onPrimaryAction={primaryAction.onClick}
        />

        {xpToast && <div className="learn-xp-toast">{xpToast}</div>}

        {loadWarning && (
          <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 text-sm text-amber-800 dark:text-amber-300">
            {t("We had trouble loading previous progress. Starting from your latest safe data.")}
          </div>
        )}

        {resultBanner && (
          <div
            className={`rounded-lg border px-3 py-3 text-sm ${
              resultBanner.tone === "success"
                ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300"
                : "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300"
            }`}
          >
            <p className="font-semibold">{resultBanner.title}</p>
            <p className="mt-1">{resultBanner.description}</p>
          </div>
        )}

        <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
          <Card className="dlp-shell" glow={false}>
            <div className="dlp-header">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t("Your Learning Path")}</h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {t("Follow the path, earn XP, and unlock your next lesson.")}
                </p>
              </div>
              <div className="dlp-summary-pill">{courseCompletionPercent}% complete</div>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {courses.map((course) => {
                const active = selectedCourse?.id === course.id;
                return (
                  <button
                    key={course.id}
                    type="button"
                    onClick={() => changeCourse(course.id)}
                    className={`rounded-full px-3 py-1.5 text-xs border transition ${
                      active
                        ? "border-[var(--theme-primary)] bg-[var(--theme-primary)] text-white"
                        : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {course.title}
                  </button>
                );
              })}
            </div>

            <div className="learn-browser-grid">
              <aside className="learn-chapter-menu" aria-label={t("Chapters")}>
                <div className="learn-chapter-menu-header">
                  <p>{t("Chapters")}</p>
                  <span>{selectedCourseUnits.length}</span>
                </div>
                <div className="learn-chapter-menu-list">
                  {selectedCourseUnits.map((unit, unitIndex) => {
                    const active = activeUnitId === unit.id;
                    const mastered = unit.topics.filter((topic) => progress.topicStatusById[topic.id] === "mastered").length;
                    return (
                      <button
                        key={unit.id}
                        id={`learn-unit-${unit.id}`}
                        type="button"
                        onClick={() => changeUnit(unit.id)}
                        className={`learn-chapter-menu-item ${active ? "learn-chapter-menu-item-active" : ""}`}
                        aria-current={active ? "true" : undefined}
                      >
                        <span className="learn-chapter-menu-kicker">{t("Chapter")} {unitIndex + 1}</span>
                        <span className="learn-chapter-menu-title">{unit.title}</span>
                        <span className="learn-chapter-menu-meta">{mastered}/{unit.topics.length} {t("mastered")}</span>
                      </button>
                    );
                  })}
                </div>
              </aside>

              <LearnPathMap
                nodes={mappedNodes}
                selectedNodeId={activeTopicId}
                onSelectNode={changeTopic}
                highlightedNodeId={highlightedNodeId}
              />
            </div>

            {selectedUnitComplete && activeTopic && (
              <div className="mt-4 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 px-3 py-3">
                <p className="text-sm font-semibold text-green-800 dark:text-green-300">
                  <CheckCircle2 className="w-4 h-4 inline mr-2" />
                  {t("Unit complete:")} {activeTopic.unitTitle}
                </p>
              </div>
            )}
          </Card>

          <Card className="h-fit sticky top-36" glow={false}>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{selectedNode?.title ?? t("Select a lesson")}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {selectedNode?.state ? selectedNode.state.replace("_", " ") : flowLabelByState[selectedFlowState]}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{activeTopic?.summary ?? ""}</p>

            <div className="mt-4 flex flex-col gap-2">
              {selectedNode?.lockedReason && (
                <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 text-xs text-amber-800 dark:text-amber-300">
                  {selectedNode.lockedReason}
                </div>
              )}
              <Button onClick={openLesson} disabled={selectedNode?.state === "locked"}>
                {lessonButtonLabel}
              </Button>
              <Button
                variant="outline"
                onClick={() => openQuizDifficultyPicker({ topicId: activeTopic?.id ?? undefined })}
                disabled={!activeTopic || selectedNode?.state === "locked" || availableQuizSlugs.length === 0}
              >
                {t("Start built-in quiz")}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setActiveTopicView("ai");
                  openAiTutor({ prompt: activeTopic?.aiPrompt || `Help me with ${activeTopic?.title ?? "this topic"}` });
                }}
              >
                <Sparkles className="w-4 h-4" />
                {t("Ask AI support")}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setActiveTopicView("community");
                  router.push(selectedTopicCommunityHref);
                }}
              >
                <Users className="w-4 h-4" />
                {t("Ask community")}
              </Button>
            </div>

            <div className="learn-hub-mini mt-5">
              <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">{t("Quick resources")}</p>
              <div className="learn-hub-mini-grid mt-2">
                <button type="button" onClick={() => jumpToResourceHub("lessons")}>{t("Lessons")}</button>
                <button type="button" onClick={() => jumpToResourceHub("videos")}>{t("Videos")}</button>
                <button type="button" onClick={() => jumpToResourceHub("worksheets")}>{t("Worksheets")}</button>
                <button type="button" onClick={() => jumpToResourceHub("practice")}>{t("Practice")}</button>
                <button type="button" onClick={() => jumpToResourceHub("quizzes")}>{t("Quizzes")}</button>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid gap-6">
          <Card className="learn-hub-shell" glow={false} ref={lessonCardRef}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t("Lesson Workspace")}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {activeTopic?.title
                    ? t("Study {topic} inside the page before moving on to practice or the quiz.", { topic: activeTopic.title })
                    : t("Select a topic to open its lesson workspace.")}
                </p>
              </div>
              {activeTopic && (
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="learn-hub-chip">{activeTopic.estimatedMinutes} {t("min lesson")}</span>
                  <span className="learn-hub-chip">{t(activeTopic.difficulty)}</span>
                  <span className="learn-hub-chip">{flowLabelByState[activeFlowState]}</span>
                </div>
              )}
            </div>

            {!activeTopic ? (
              <div className="learn-hub-empty mt-4">{t("Choose a topic from your learning path to load the lesson.")}</div>
            ) : !showLessonWorkspace ? (
              <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
                <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-5">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--theme-primary)]">
                    <BookOpen className="h-4 w-4" />
                    {t("What you will learn")}
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-700 dark:text-slate-300">{activeTopic.summary}</p>
                  <div className="mt-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                      {t("Mastery goal")}
                    </p>
                    <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{activeTopic.masteryGoal}</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-5">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--theme-primary)]">
                    <ListChecks className="h-4 w-4" />
                    {t("Before you start")}
                  </div>
                  {activeTopic.prerequisites.length > 0 ? (
                    <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-300">
                      {activeTopic.prerequisites.map((item) => (
                        <li key={`${activeTopic.id}-prereq-${item}`} className="flex items-start gap-2">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[var(--theme-primary)]" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                      {t("You can start this lesson right away. Use the key ideas below as your guide.")}
                    </p>
                  )}
                  <Button className="mt-5 w-full" onClick={openLesson} disabled={selectedNode?.state === "locked"}>
                    {lessonButtonLabel}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
                  <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-5">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--theme-primary)]">
                      <BookOpen className="h-4 w-4" />
                      {t("Lesson explanation")}
                    </div>
                    <p className="mt-3 text-sm leading-7 text-slate-700 dark:text-slate-300">{activeTopic.summary}</p>
                    <div className="mt-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                        {t("Mastery goal")}
                      </p>
                      <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{activeTopic.masteryGoal}</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-5">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--theme-primary)]">
                      <Target className="h-4 w-4" />
                      {t("Lesson status")}
                    </div>
                    <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">
                      {activeTopicCheckpointComplete
                        ? t("This lesson is complete. Review the key ideas, then move to the quiz or practice.")
                        : t("Work through the explanation and key ideas, then mark the lesson complete to unlock the next step.")}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="learn-hub-chip">{activeTopic.estimatedMinutes} {t("min lesson")}</span>
                      <span className="learn-hub-chip">{t(activeTopic.difficulty)}</span>
                      <span className="learn-hub-chip">{flowLabelByState[activeFlowState]}</span>
                    </div>
                  </div>
                </div>

                {activeTopic.prerequisites.length > 0 && (
                  <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--theme-primary)]">
                      {t("Before you start")}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {activeTopic.prerequisites.map((item) => (
                        <span
                          key={`${activeTopic.id}-lesson-prereq-${item}`}
                          className="rounded-full border border-slate-200/80 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-950/40 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {hasLessonVideo && activeVideo && activeVideoPlayback && (
                  <div
                    ref={lessonVideoRef}
                    className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--theme-primary)]">
                          {t("Lesson video")}
                        </p>
                        <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">{activeVideo.title}</p>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                          {activeVideoPlayback.mode === "youtube-embed" || activeVideoPlayback.mode === "native-video"
                            ? t("Play the video here without leaving your lesson.")
                            : t("Watch this lesson on YouTube in a new tab.")}
                        </p>
                      </div>
                      {activeVideoPlayback.mode === "external" && (
                        <a
                          href={activeVideoPlayback.src}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 transition hover:border-[var(--theme-primary)]"
                        >
                          <ExternalLink className="h-4 w-4" />
                          {t("Watch on YouTube")}
                        </a>
                      )}
                    </div>

                    <div className="mt-4">
                      {activeVideoPlayback.mode === "youtube-embed" && (
                        <div className="learn-hub-player-ratio overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-950">
                          <iframe
                            src={activeVideoPlayback.src}
                            title={`${activeVideo.title} lesson video`}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                            loading="lazy"
                          />
                        </div>
                      )}
                      {activeVideoPlayback.mode === "native-video" && (
                        <div className="learn-hub-player-ratio overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-950">
                          <video controls preload="metadata" src={activeVideoPlayback.src} className="h-full w-full" />
                        </div>
                      )}
                      {activeVideoPlayback.mode === "external" && (
                        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50 p-4">
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {t("Use the button above to watch the full walkthrough on YouTube.")}
                          </p>
                        </div>
                      )}
                      {activeVideoPlayback.mode === "unavailable" && (
                        <div className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4">
                          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">{t("Video unavailable")}</p>
                          <p className="mt-1 text-sm text-amber-700 dark:text-amber-200">
                            {t("This video link is not usable right now. Try another video or continue with the lesson resources below.")}
                          </p>
                        </div>
                      )}
                    </div>

                    {videoResources.length > 1 && (
                      <div className="mt-4 grid gap-2 md:grid-cols-2">
                        {videoResources.map((resource) => (
                          <button
                            key={`${activeTopic.id}-lesson-video-${resource.title}`}
                            type="button"
                            onClick={() => {
                              if (!activeTopic?.id) return;
                              setSelectedVideoByTopicId((current) => ({
                                ...current,
                                [activeTopic.id]: resource.href,
                              }));
                            }}
                            className={`learn-hub-card text-left ${
                              activeVideo?.href === resource.href ? "learn-hub-card-active" : ""
                            }`}
                          >
                            <p className="learn-hub-card-kind">{t("Video")}</p>
                            <div className="flex items-start justify-between gap-3">
                              <p className="learn-hub-card-title">{t(resource.title)}</p>
                              {normalizeResourcePlaybackTarget(resource).mode === "external" && (
                                <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-slate-400" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-5">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--theme-primary)]">
                      <ListChecks className="h-4 w-4" />
                      {t("Key ideas")}
                    </div>
                    <ul className="mt-4 space-y-3">
                      {lessonKeyIdeas.map((item) => (
                        <li key={`${activeTopic.id}-key-idea-${item}`} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                          <span className="mt-1 h-2 w-2 rounded-full bg-[var(--theme-primary)]" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-5">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--theme-primary)]">
                      <ArrowRight className="h-4 w-4" />
                      {t("How to work through this lesson")}
                    </div>
                    <ol className="mt-4 space-y-3">
                      {lessonGuidedSteps.map((item, index) => (
                        <li key={`${activeTopic.id}-guided-step-${index}`} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                          <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--theme-primary)]/12 text-[var(--theme-primary)] text-xs font-semibold">
                            {index + 1}
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--theme-primary)]">
                    {t("Next steps")}
                  </p>
                  <ul className="mt-4 space-y-3">
                    {lessonNextSteps.map((item) => (
                      <li key={`${activeTopic.id}-next-step-${item}`} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 text-[var(--theme-primary)]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {lessonResources.length > 0 && (
                  <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--theme-primary)]">
                      {t("Supporting lesson links")}
                    </p>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {lessonResources.map((resource) => (
                        <a
                          key={`${activeTopic.id}-supporting-lesson-${resource.title}`}
                          href={resource.href}
                          target={resource.href.startsWith("http") ? "_blank" : "_self"}
                          rel={resource.href.startsWith("http") ? "noreferrer" : undefined}
                          className="learn-hub-card"
                        >
                          <p className="learn-hub-card-kind">{t("Lesson")}</p>
                          <div className="flex items-start justify-between gap-3">
                            <p className="learn-hub-card-title">{t(resource.title)}</p>
                            <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-slate-400" />
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {!activeTopicCheckpointComplete ? (
                    <Button onClick={completeLesson} disabled={selectedNode?.state === "locked"}>
                      {t("Mark Lesson Complete")}
                    </Button>
                  ) : availableQuizSlugs.length > 0 ? (
                    <Button onClick={() => openQuizDifficultyPicker({ topicId: activeTopic.id })}>
                      {t("Start Quiz")}
                    </Button>
                  ) : (
                    <Button onClick={() => jumpToResourceHub("practice")}>
                      {t("Open Practice")}
                    </Button>
                  )}

                  <Button variant="outline" onClick={() => jumpToResourceHub("practice")}>
                    {t("Practice")}
                  </Button>
                  {hasLessonVideo && (
                    <Button variant="outline" onClick={openLessonVideo}>
                      {t("Watch video")}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setActiveTopicView("ai");
                      openAiTutor({ prompt: activeTopic.aiPrompt || `Help me with ${activeTopic.title}` });
                    }}
                  >
                    {t("Ask AI support")}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setActiveTopicView("community");
                      router.push(selectedTopicCommunityHref);
                    }}
                  >
                    {t("Ask community")}
                  </Button>
                </div>
              </div>
            )}
          </Card>

          <Card className="learn-hub-shell" ref={resourceHubRef}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t("Study Resource Hub")}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {activeTopic?.title ? t("Resources for {topic}", { topic: activeTopic.title }) : t("Select a topic to load resources")}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {availableQuizSlugs.length > 0 && (
                  <span className="learn-hub-chip">
                    {t("Quiz available")}
                  </span>
                )}
                <Button
                  size="sm"
                  onClick={() => openQuizDifficultyPicker({ topicId: activeTopic?.id ?? undefined })}
                  disabled={!activeTopic || selectedNode?.state === "locked" || availableQuizSlugs.length === 0}
                >
                  {t("Start Quiz")}
                </Button>
              </div>
            </div>

            <div className="learn-hub-counts mt-4">
              <span>{t("Lessons")}: {resourceCounts.lessons}</span>
              <span>{t("Videos")}: {resourceCounts.videos}</span>
              <span>{t("Worksheets")}: {resourceCounts.worksheets}</span>
              <span>{t("Practice")}: {resourceCounts.practice}</span>
              <span>{t("Quizzes")}: {resourceCounts.quizzes}</span>
            </div>

            <div className="learn-hub-tabs mt-4" role="tablist" aria-label={t("Resource categories")}>
              {resourceHubTabs.map((tab) => (
                <button
                  key={tab.id}
                  role="tab"
                  type="button"
                  aria-selected={resourceHubTab === tab.id}
                  onClick={() => jumpToResourceHub(tab.id)}
                  className={`learn-hub-tab ${resourceHubTab === tab.id ? "learn-hub-tab-active" : ""}`}
                >
                  {t(tab.label)}
                </button>
              ))}
            </div>

            {resourceHubTab === "videos" && (
              <div className="mt-4">
                {activeVideo && activeVideoPlayback ? (
                  <div className="learn-hub-player-shell">
                    <div className="learn-hub-player-header">
                      <p className="font-semibold text-slate-900 dark:text-white">{activeVideo.title}</p>
                    </div>
                    {activeVideoPlayback.mode === "youtube-embed" && (
                      <div className="learn-hub-player-ratio">
                        <iframe
                          src={activeVideoPlayback.src}
                          title={`${activeVideo.title} video lesson`}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          referrerPolicy="strict-origin-when-cross-origin"
                          allowFullScreen
                          loading="lazy"
                        />
                      </div>
                    )}
                    {activeVideoPlayback.mode === "native-video" && (
                      <div className="learn-hub-player-ratio">
                        <video controls preload="metadata" src={activeVideoPlayback.src} />
                      </div>
                    )}
                    {activeVideoPlayback.mode === "external" && (
                      <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                          {t("Watch this lesson video on YouTube.")}
                        </p>
                        <a
                          href={activeVideoPlayback.src}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm hover:border-[var(--theme-primary)]"
                        >
                          {t("Watch on YouTube")}
                        </a>
                      </div>
                    )}
                    {activeVideoPlayback.mode === "unavailable" && (
                      <div className="learn-hub-video-placeholder">
                        <p className="font-semibold text-slate-900 dark:text-white">{t("Video unavailable")}</p>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                          {t("Choose another video or use the lesson resources below.")}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-slate-500 dark:text-slate-400">{t("No videos for this topic yet.")}</div>
                )}
              </div>
            )}

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {resourceHubTab === "lessons" && lessonResources.length === 0 && (
                <div className="learn-hub-empty md:col-span-2">
                  <p>{t("No external lesson links for this topic yet.")}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => lessonCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
                    >
                      {t("Go to Lesson Workspace")}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openAiTutor({ prompt: activeTopic?.aiPrompt || `Help me with ${activeTopic?.title ?? "this topic"}` })}
                    >
                      {t("Ask AI support")}
                    </Button>
                  </div>
                </div>
              )}
              {resourceHubTab === "lessons" && lessonResources.map((resource) => (
                <a
                  key={`${activeTopic?.id}-lesson-${resource.title}`}
                  href={resource.href}
                  target={resource.href.startsWith("http") ? "_blank" : "_self"}
                  rel={resource.href.startsWith("http") ? "noreferrer" : undefined}
                  className="learn-hub-card"
                >
                  <p className="learn-hub-card-kind">{t("Lesson")}</p>
                  <p className="learn-hub-card-title">{t(resource.title)}</p>
                </a>
              ))}

              {resourceHubTab === "videos" && videoResources.map((resource) => (
                <button
                  key={`${activeTopic?.id}-video-${resource.title}`}
                  type="button"
                  onClick={() => {
                    if (!activeTopic?.id) return;
                    setSelectedVideoByTopicId((current) => ({
                      ...current,
                      [activeTopic.id]: resource.href,
                    }));
                  }}
                  className={`learn-hub-card text-left ${
                    activeVideo?.href === resource.href ? "learn-hub-card-active" : ""
                  }`}
                >
                  <p className="learn-hub-card-kind">{t("Video")}</p>
                  <p className="learn-hub-card-title">{t(resource.title)}</p>
                </button>
              ))}

              {resourceHubTab === "worksheets" && worksheetResources.length === 0 && (
                <div className="learn-hub-empty">{t("No worksheets for this topic yet.")}</div>
              )}
              {resourceHubTab === "worksheets" && worksheetResources.map((resource) => (
                <a
                  key={`${activeTopic?.id}-worksheet-${resource.title}`}
                  href={resource.href}
                  target={resource.href.startsWith("http") ? "_blank" : "_self"}
                  rel={resource.href.startsWith("http") ? "noreferrer" : undefined}
                  className="learn-hub-card"
                >
                  <p className="learn-hub-card-kind">{t("Worksheet")}</p>
                  <p className="learn-hub-card-title">{t(resource.title)}</p>
                  {resource.label ? (
                    <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                      {t(resource.label)}
                    </p>
                  ) : null}
                </a>
              ))}

              {resourceHubTab === "practice" && practiceResources.length === 0 && (
                <div className="learn-hub-empty">{t("No practice links for this topic yet.")}</div>
              )}
              {resourceHubTab === "practice" && practiceResources.map((resource) => (
                <a
                  key={`${activeTopic?.id}-practice-${resource.title}`}
                  href={resource.href}
                  target={resource.href.startsWith("http") ? "_blank" : "_self"}
                  rel={resource.href.startsWith("http") ? "noreferrer" : undefined}
                  className="learn-hub-card"
                >
                  <p className="learn-hub-card-kind">{t("Practice")}</p>
                  <p className="learn-hub-card-title">{t(resource.title)}</p>
                  {resource.label ? (
                    <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                      {t(resource.label)}
                    </p>
                  ) : null}
                </a>
              ))}

              {resourceHubTab === "quizzes" && availableQuizSlugs.length === 0 && (
                <div className="learn-hub-empty">{t("No built-in quiz is attached to this topic yet.")}</div>
              )}
              {resourceHubTab === "quizzes" && availableQuizSlugs.map((slug) => (
                <div key={`${activeTopic?.id}-quiz-${slug}`} className="learn-hub-card">
                  <p className="learn-hub-card-kind">{t("Quiz")}</p>
                  <p className="learn-hub-card-title">
                    {resolveQuizDisplayTitle(slug, activeTopic)}
                  </p>
                  <div className="mt-4 flex gap-2" role="group" aria-label={t("Choose difficulty")}>
                    {(["easy", "medium", "hard"] as const).map((diff) => (
                      <button
                        key={diff}
                        type="button"
                        disabled={selectedNode?.state === "locked"}
                        aria-label={`${resolveQuizDisplayTitle(slug, activeTopic)} — ${t(diff.charAt(0).toUpperCase() + diff.slice(1))}`}
                        aria-pressed={pickedDifficultyBySlug[slug] === diff}
                        className={`quiz-diff-btn${pickedDifficultyBySlug[slug] === diff ? " quiz-diff-btn-selected" : ""}`}
                        onClick={() => {
                          setPickedDifficultyBySlug((prev) => ({ ...prev, [slug]: diff }));
                          openQuiz({ topicId: activeTopic?.id ?? undefined, slug, difficulty: diff });
                        }}
                      >
                        {t(diff.charAt(0).toUpperCase() + diff.slice(1))}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <RecommendationPanel recommendations={recommendations} title={t("Next Best Actions")} />
          <CommunitySpotlight studyGroupId={activeTopic?.studyGroupId} discussionLabel={activeTopic?.communityThread} />
          {progress.globalTutorialCompleted && <GuidedOnboarding progress={progress} />}
        </div>
      </main>
    </PageWrapper>
  );
}

export default function LearnPage() {
  return (
    <Suspense fallback={null}>
      <LearnPageClient />
    </Suspense>
  );
}
