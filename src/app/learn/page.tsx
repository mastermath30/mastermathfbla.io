"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Sparkles, Users } from "lucide-react";
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
import { allTopics, courses, type ResourceItem } from "@/data/courses";
import {
  buildCommunityHref,
  normalizeResourcePlaybackTarget,
  parseLearnActionFromSearchParams,
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

function getPreferredLessonResource(resources: ResourceItem[]) {
  return (
    resources.find((resource) => resource.kind === "lesson" && resource.href.includes("khanacademy.org")) ??
    resources.find((resource) => resource.kind === "lesson") ??
    null
  );
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

  const previousXpRef = useRef<number>(progress.xpTotal ?? 0);
  const lastHandledQueryRef = useRef<string>("");
  const resourceHubRef = useRef<HTMLDivElement | null>(null);

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

  /* eslint-disable react-hooks/set-state-in-effect */
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
        studyGroupId: activeTopic?.studyGroupId,
        discussionLabel: activeTopic?.communityThread,
      }),
    [activeTopic?.communityThread, activeTopic?.studyGroupId]
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
    router.push(`/resources/quiz/${slug}?difficulty=${difficulty}`);
  }, [activeTopicId, router, selectedTopicId]);

  const jumpToResourceHub = useCallback((tab: ResourceHubTab) => {
    setResourceHubTab(tab);
    window.setTimeout(() => {
      resourceHubRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }, []);

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

  const completeCheckpoint = useCallback(() => {
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
    completeTopicCheckpoint(activeTopicId);
    const latest = refreshProgress();
    setResultBanner({
      tone: "success",
      title: t("Checkpoint complete"),
      description: t("Great work. You earned XP and your mastery quiz is ready."),
      topicId: activeTopicId,
      recommendation: latest.lastQuizReturnContext?.recommended,
    });
  }, [activeTopicId, progress.topicStatusById, refreshProgress, t]);

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
      openAiTutor({ prompt: activeTopic?.aiPrompt, autoSend: false });
    }

    if (parsed?.action === "open-community") {
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
        label: t("Continue"),
        onClick: completeCheckpoint,
      };
    }

    if (selectedNode.state === "quiz_ready") {
      return {
        label: t("Take quiz"),
        onClick: () => openQuiz({ topicId: selectedNode.id, difficulty: "medium" }),
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
  }, [completeCheckpoint, focusNodeId, moveToNextTopic, nextTopicId, openQuiz, selectedNode, t]);

  const level = progress.level ?? 1;
  const xpToday = progress.xpToday ?? 0;
  const xpToNext = Math.max(0, 100 - (xpToday % 100));

  const selectedResources = activeTopic?.resources ?? [];
  const lessonResources = selectedResources.filter((resource) => resource.kind === "lesson");
  const preferredLessonResource = getPreferredLessonResource(selectedResources);
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

  if (!isReady || !hasHydrated) {
    return (
      <PageWrapper className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20 md:pt-24">
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">{t("Loading learning path...")}</main>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20 md:pt-24 learn-page-bg">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-8 md:pb-10 space-y-5">
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
              <Button
                onClick={() => {
                  if (selectedNode?.state === "quiz_ready" && preferredLessonResource) {
                    window.open(preferredLessonResource.href, "_blank", "noopener,noreferrer");
                    return;
                  }
                  completeCheckpoint();
                }}
                disabled={selectedNode?.state === "locked"}
              >
                {selectedNode?.state === "quiz_ready" ? t("Review lesson") : t("Start Lesson")}
              </Button>
              <Button
                variant="outline"
                onClick={() => openQuiz({ topicId: activeTopic?.id ?? undefined, difficulty: "medium" })}
                disabled={!activeTopic || selectedNode?.state === "locked" || availableQuizSlugs.length === 0}
              >
                {t("Start built-in quiz")}
              </Button>
              <Button
                variant="outline"
                onClick={() => openAiTutor({ prompt: activeTopic?.aiPrompt || `Help me with ${activeTopic?.title ?? "this topic"}` })}
              >
                <Sparkles className="w-4 h-4" />
                {t("Ask AI support")}
              </Button>
              <Button variant="ghost" onClick={() => router.push(selectedTopicCommunityHref)}>
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
                  onClick={() => openQuiz({ topicId: activeTopic?.id ?? undefined, difficulty: "medium" })}
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
                  onClick={() => setResourceHubTab(tab.id)}
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
                          {t("This video cannot be embedded inline.")}
                        </p>
                        <a
                          href={activeVideoPlayback.src}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm hover:border-[var(--theme-primary)]"
                        >
                          {t("Open source")}
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
                <div className="learn-hub-empty">{t("No lesson links for this topic yet. Use Start Lesson or ask AI support.")}</div>
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

              {resourceHubTab === "videos" && videoResources.length === 0 && (
                <div className="learn-hub-empty">{t("No videos for this topic yet.")}</div>
              )}
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
                </a>
              ))}

              {resourceHubTab === "quizzes" && availableQuizSlugs.length === 0 && (
                <div className="learn-hub-empty">{t("No built-in quiz is attached to this topic yet.")}</div>
              )}
              {resourceHubTab === "quizzes" && availableQuizSlugs.map((slug) => (
                <div key={`${activeTopic?.id}-quiz-${slug}`} className="learn-hub-card">
                  <p className="learn-hub-card-kind">{t("Quiz")}</p>
                  <p className="learn-hub-card-title">{slug}</p>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="outline" disabled={selectedNode?.state === "locked"} onClick={() => openQuiz({ topicId: activeTopic?.id ?? undefined, slug, difficulty: "easy" })}>
                      {t("Easy")}
                    </Button>
                    <Button size="sm" variant="outline" disabled={selectedNode?.state === "locked"} onClick={() => openQuiz({ topicId: activeTopic?.id ?? undefined, slug, difficulty: "medium" })}>
                      {t("Medium")}
                    </Button>
                    <Button size="sm" variant="outline" disabled={selectedNode?.state === "locked"} onClick={() => openQuiz({ topicId: activeTopic?.id ?? undefined, slug, difficulty: "hard" })}>
                      {t("Hard")}
                    </Button>
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
