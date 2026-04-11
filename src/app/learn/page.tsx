"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PageWrapper, HeroText, GlowingOrbs, FadeIn } from "@/components/motion";
import { SectionLabel } from "@/components/SectionLabel";
import { RecommendationPanel } from "@/components/RecommendationPanel";
import { CommunitySpotlight } from "@/components/CommunitySpotlight";
import { ActionGrid } from "@/components/ActionGrid";
import { GuidedOnboarding } from "@/components/GuidedOnboarding";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { useTranslations } from "@/components/LanguageProvider";
import { allTopics, courses } from "@/data/courses";
import {
  buildCommunityHref,
  parseLearnActionFromSearchParams,
  resolveQuizSlug,
  type LearnTab,
} from "@/lib/learnActions";
import {
  getLearningProgress,
  markTopicComplete,
  setActiveTopicView,
  setLearningIntent,
  setSelectedCourse,
  setSelectedTopic,
  setTestPrepMode,
  updateLearningProgress,
  type TopicStatus,
} from "@/lib/progress";
import { buildRecommendations } from "@/lib/guidance";
import { getSupabaseUserId, loadLearningProgressFromCloud, saveLearningProgressToCloud } from "@/lib/cloud";
import { ArrowRight, CheckCircle2, Flame, Lock, PlayCircle, Trophy, Users } from "lucide-react";

const topicViewTabs: Array<{ id: LearnTab }> = [
  { id: "concept" },
  { id: "video" },
  { id: "practice" },
  { id: "quiz" },
  { id: "ai" },
  { id: "community" },
];

function getCourseSequence(courseId: string) {
  const course = courses.find((item) => item.id === courseId);
  if (!course) return [];
  const validIds = new Set(course.units.flatMap((unit) => unit.topics.map((topic) => topic.id)));
  return course.recommendedSequence.filter((topicId) => validIds.has(topicId));
}

function LearnPageClient() {
  const { t } = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const workspaceRef = useRef<HTMLDivElement | null>(null);
  const resourcesRef = useRef<HTMLDivElement | null>(null);
  const actionGridRef = useRef<HTMLDivElement | null>(null);
  const [pulseQuizCta, setPulseQuizCta] = useState(false);

  const [progress, setProgress] = useState(() => {
    const initial = getLearningProgress();
    if (initial.selectedCourseId || !courses[0]) {
      return initial;
    }
    setSelectedCourse(courses[0].id);
    const firstTopic = getCourseSequence(courses[0].id)[0];
    if (firstTopic) {
      setSelectedTopic(firstTopic);
    }
    return getLearningProgress();
  });
  const [isCloudHydrated, setIsCloudHydrated] = useState(false);

  const refreshProgress = useCallback(() => setProgress(getLearningProgress()), []);

  const scrollToRef = useCallback((ref: { current: HTMLElement | null }) => {
    window.requestAnimationFrame(() => {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  useEffect(() => {
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
        updateLearningProgress(() => cloud);
        setProgress(getLearningProgress());
      }
      setIsCloudHydrated(true);
    }
    hydrateFromCloud();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isCloudHydrated) return;
    async function pushToCloud() {
      const userId = await getSupabaseUserId();
      if (!userId) return;
      await saveLearningProgressToCloud(userId, progress);
    }
    pushToCloud();
  }, [progress, isCloudHydrated]);

  const selectedCourse = useMemo(
    () => courses.find((course) => course.id === progress.selectedCourseId) ?? courses[0],
    [progress.selectedCourseId]
  );

  const selectedSequence = useMemo(
    () => (selectedCourse ? getCourseSequence(selectedCourse.id) : []),
    [selectedCourse]
  );

  const selectedTopic = useMemo(() => {
    if (!selectedSequence.length) return null;
    const topicId =
      progress.selectedTopicId && selectedSequence.includes(progress.selectedTopicId)
        ? progress.selectedTopicId
        : selectedSequence[0];
    return allTopics.find((topic) => topic.id === topicId) ?? null;
  }, [progress.selectedTopicId, selectedSequence]);

  const selectedTopicId = selectedTopic?.id ?? null;
  const selectedIndex = selectedTopicId ? selectedSequence.indexOf(selectedTopicId) : -1;
  const nextTopicId =
    selectedIndex >= 0 && selectedIndex < selectedSequence.length - 1
      ? selectedSequence[selectedIndex + 1]
      : null;

  const selectedStatus = selectedTopicId
    ? progress.topicStatusById[selectedTopicId] ?? "in_progress"
    : "in_progress";

  const statusLabel: Record<TopicStatus, string> = {
    locked: t("Locked"),
    in_progress: t("In Progress"),
    mastered: t("Mastered"),
    needs_review: t("Needs Review"),
  };

  const masteryPercent = selectedTopicId
    ? Math.round((progress.masteryByTopicId[selectedTopicId] ?? 0) * 100)
    : 0;

  const selectedCourseTopicIds = selectedCourse
    ? selectedCourse.units.flatMap((unit) => unit.topics.map((topic) => topic.id))
    : [];

  const masteredInCourse = selectedCourseTopicIds.filter(
    (topicId) => progress.topicStatusById[topicId] === "mastered"
  ).length;

  const courseCompletionPercent = selectedCourseTopicIds.length
    ? Math.round((masteredInCourse / selectedCourseTopicIds.length) * 100)
    : 0;

  const courseFullyComplete =
    selectedCourseTopicIds.length > 0 && masteredInCourse === selectedCourseTopicIds.length;

  const selectedTopicAttempt = useMemo(() => {
    if (!selectedTopic?.quizSlugs?.length) return null;
    return progress.quizAttempts.find((attempt) => selectedTopic.quizSlugs.includes(attempt.slug)) ?? null;
  }, [progress.quizAttempts, selectedTopic]);

  const recommendations = useMemo(() => buildRecommendations(progress), [progress]);

  const selectedTopicCommunityHref = useMemo(
    () =>
      buildCommunityHref({
        studyGroupId: selectedTopic?.studyGroupId,
        discussionLabel: selectedTopic?.communityThread,
      }),
    [selectedTopic?.communityThread, selectedTopic?.studyGroupId]
  );

  const openAiTutor = useCallback(
    (opts?: { prompt?: string; autoSend?: boolean }) => {
      window.dispatchEvent(
        new CustomEvent("open-ai-tutor", {
          detail: {
            prompt: opts?.prompt,
            autoSend: opts?.autoSend,
          },
        })
      );
      setActiveTopicView("ai");
      refreshProgress();
    },
    [refreshProgress]
  );

  const openCommunity = useCallback(
    (opts?: { groupId?: string; thread?: string }) => {
      const href = buildCommunityHref({
        studyGroupId: selectedTopic?.studyGroupId,
        discussionLabel: selectedTopic?.communityThread,
        groupId: opts?.groupId,
        thread: opts?.thread,
      });
      router.push(href);
    },
    [router, selectedTopic?.communityThread, selectedTopic?.studyGroupId]
  );

  const openQuiz = useCallback(
    (opts?: { topicId?: string; slug?: string; difficulty?: "easy" | "medium" | "hard" }) => {
      const slug = resolveQuizSlug(opts?.topicId ?? selectedTopicId ?? undefined, opts?.slug);
      if (!slug) return;
      const difficulty = opts?.difficulty ?? "medium";
      router.push(`/resources/quiz/${slug}?difficulty=${difficulty}`);
    },
    [router, selectedTopicId]
  );

  const switchView = useCallback(
    (view: LearnTab, options?: { scrollTo?: "workspace" | "resources" | "actions" }) => {
      if (view === "ai") {
        openAiTutor({ prompt: selectedTopic?.aiPrompt, autoSend: false });
      } else if (view === "community") {
        openCommunity();
      } else {
        setActiveTopicView(view);
        refreshProgress();
      }

      if (options?.scrollTo === "workspace") {
        scrollToRef(workspaceRef);
      } else if (options?.scrollTo === "resources") {
        scrollToRef(resourcesRef);
      } else if (options?.scrollTo === "actions") {
        scrollToRef(actionGridRef);
      }
    },
    [openAiTutor, openCommunity, refreshProgress, scrollToRef, selectedTopic?.aiPrompt]
  );

  const changeCourse = useCallback(
    (courseId: string) => {
      const nextSequence = getCourseSequence(courseId);
      setSelectedCourse(courseId);
      if (nextSequence[0]) {
        setSelectedTopic(nextSequence[0]);
      }
      setActiveTopicView("concept");
      updateLearningProgress((current) => ({
        ...current,
        recentActivity: [`Changed course to ${courseId}`, ...current.recentActivity].slice(0, 10),
      }));
      refreshProgress();
      scrollToRef(workspaceRef);
    },
    [refreshProgress, scrollToRef]
  );

  const isTopicUnlocked = useCallback(
    (topicId: string) => {
      const status = progress.topicStatusById[topicId];
      return status !== "locked";
    },
    [progress.topicStatusById]
  );

  const changeTopic = useCallback(
    (topicId: string) => {
      if (!isTopicUnlocked(topicId)) return;
      setSelectedTopic(topicId);
      setActiveTopicView("concept");
      refreshProgress();
      scrollToRef(workspaceRef);
    },
    [isTopicUnlocked, refreshProgress, scrollToRef]
  );

  const moveToNextTopic = useCallback(() => {
    if (!nextTopicId || selectedStatus !== "mastered") return;
    setSelectedTopic(nextTopicId);
    setActiveTopicView("concept");
    refreshProgress();
    scrollToRef(workspaceRef);
  }, [nextTopicId, refreshProgress, scrollToRef, selectedStatus]);

  const markAsStudied = useCallback(() => {
    if (!selectedTopicId) return;
    markTopicComplete(selectedTopicId);
    refreshProgress();
  }, [refreshProgress, selectedTopicId]);

  const handleIntentAction = useCallback(
    (intent: "learn" | "practice" | "quiz" | "test-prep") => {
      setLearningIntent(intent);

      if (intent === "test-prep") {
        setTestPrepMode(true);
        setActiveTopicView("quiz");
        setPulseQuizCta(true);
        window.setTimeout(() => setPulseQuizCta(false), 1400);
        refreshProgress();
        scrollToRef(workspaceRef);
        return;
      }

      if (intent === "learn") {
        setActiveTopicView("concept");
        refreshProgress();
        scrollToRef(workspaceRef);
        return;
      }

      if (intent === "practice") {
        setActiveTopicView("practice");
        refreshProgress();
        scrollToRef(resourcesRef);
        return;
      }

      setActiveTopicView("quiz");
      setPulseQuizCta(true);
      window.setTimeout(() => setPulseQuizCta(false), 1400);
      refreshProgress();
      scrollToRef(workspaceRef);
    },
    [refreshProgress, scrollToRef]
  );

  const handleQuickAction = useCallback(
    (action: "ask-ai" | "community-help" | "watch-video") => {
      if (action === "ask-ai") {
        openAiTutor({
          prompt: selectedTopic?.aiPrompt || `Help me with ${selectedTopic?.title ?? "this topic"}`,
          autoSend: false,
        });
        return;
      }

      if (action === "community-help") {
        openCommunity();
        return;
      }

      switchView("video", { scrollTo: "resources" });
    },
    [openAiTutor, openCommunity, selectedTopic?.aiPrompt, selectedTopic?.title, switchView]
  );

  useEffect(() => {
    const parsed = parseLearnActionFromSearchParams(new URLSearchParams(searchParams.toString()));
    if (!parsed) return;

    const actionTopic = parsed.topicId ? allTopics.find((topic) => topic.id === parsed.topicId) ?? null : null;
    if (actionTopic && isTopicUnlocked(actionTopic.id)) {
      setSelectedTopic(actionTopic.id);
      setActiveTopicView("concept");
      refreshProgress();
    }

    if (parsed.action === "view") {
      switchView(parsed.tab ?? "concept", { scrollTo: "workspace" });
    } else if (parsed.action === "open-ai") {
      openAiTutor({ prompt: actionTopic?.aiPrompt ?? selectedTopic?.aiPrompt, autoSend: false });
      scrollToRef(actionGridRef);
    } else if (parsed.action === "open-community") {
      openCommunity({ groupId: parsed.groupId, thread: parsed.thread });
    } else if (parsed.action === "open-quiz") {
      openQuiz({
        topicId: actionTopic?.id ?? selectedTopic?.id ?? undefined,
        slug: parsed.slug,
        difficulty: parsed.difficulty ?? "medium",
      });
    }

    const cleanPath = pathname || "/learn";
    router.replace(cleanPath, { scroll: false });
  }, [
    actionGridRef,
    isTopicUnlocked,
    openAiTutor,
    openCommunity,
    openQuiz,
    pathname,
    refreshProgress,
    router,
    scrollToRef,
    searchParams,
    selectedTopic?.aiPrompt,
    selectedTopic?.id,
    switchView,
  ]);

  const focusResources =
    selectedTopic?.resources.filter((resource) => {
      if (progress.activeTopicView === "video") return resource.kind === "video";
      if (progress.activeTopicView === "practice") {
        return resource.kind === "practice" || resource.kind === "worksheet";
      }
      if (progress.activeTopicView === "concept") return resource.kind === "lesson";
      return true;
    }) ?? [];

  const resourcesToShow =
    progress.activeTopicView === "concept" ||
    progress.activeTopicView === "video" ||
    progress.activeTopicView === "practice"
      ? focusResources
      : selectedTopic?.resources ?? [];

  const emptyResourceConfig = useMemo(() => {
    if (progress.activeTopicView === "concept") {
      return {
        title: t("No concept lessons for this topic yet."),
        description: t("Use all resources while we expand lesson content for this topic."),
        ctaLabel: t("Open all resources"),
        onClick: () => {
          setActiveTopicView("quiz");
          refreshProgress();
        },
      };
    }

    if (progress.activeTopicView === "video") {
      return {
        title: t("No videos available for this topic yet."),
        description: t("Ask AI for a guided walkthrough, then continue with concept resources."),
        ctaLabel: t("Ask AI for explanation"),
        onClick: () =>
          openAiTutor({
            prompt: selectedTopic?.aiPrompt || `Explain ${selectedTopic?.title ?? "this topic"}`,
            autoSend: false,
          }),
      };
    }

    if (progress.activeTopicView === "practice") {
      return {
        title: t("No dedicated practice resources yet."),
        description: t("Use the easy quiz mode to get practice while we add drills."),
        ctaLabel: t("Start easy practice quiz"),
        onClick: () => openQuiz({ difficulty: "easy" }),
      };
    }

    return null;
  }, [
    openAiTutor,
    openQuiz,
    progress.activeTopicView,
    refreshProgress,
    selectedTopic?.aiPrompt,
    selectedTopic?.title,
    t,
  ]);

  const tabLabelById: Record<LearnTab, string> = {
    concept: t("Concept"),
    video: t("Video"),
    practice: t("Practice"),
    quiz: t("Quiz"),
    ai: t("AI"),
    community: t("Community"),
  };

  return (
    <PageWrapper className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20 md:pt-24">
      <header className="relative overflow-hidden border-b border-slate-200 dark:border-slate-800">
        <GlowingOrbs variant="section" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 relative">
          <FadeIn>
            <SectionLabel>{t("Guided Learn")}</SectionLabel>
            <HeroText className="max-w-3xl">
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mt-2">
                {t("Market-Ready Learning Path")}
              </h1>
              <p className="text-slate-600 dark:text-slate-300 mt-3">
                {t("Complete lessons and practice, then score")} {Math.round(progress.unlockThreshold * 100)}% {t("or higher on quiz mode to unlock the next topic.")}
              </p>
            </HeroText>
          </FadeIn>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-8 md:pb-10 space-y-6">
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
          {t("Learn is now mastery-gated and cloud-sync capable. If Supabase is connected, progress follows your account across devices.")}
        </div>

        <div className="grid lg:grid-cols-[320px_minmax(0,1fr)] gap-8">
          <Card id="learn-path-panel" className="h-fit lg:sticky lg:top-28">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t("Your Course Path")}</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              {t("Strict progression: unlock next topic by mastering the current quiz.")}
            </p>

            <div className="mt-3">
              <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${courseCompletionPercent}%`,
                    background: "linear-gradient(135deg, var(--theme-primary), var(--theme-primary-light))",
                  }}
                />
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {courses.map((course) => {
                const active = selectedCourse?.id === course.id;
                return (
                  <button
                    key={course.id}
                    type="button"
                    onClick={() => changeCourse(course.id)}
                    className={`w-full rounded-lg border px-3 py-2 text-left transition ${
                      active
                        ? "border-[var(--theme-primary)] bg-[var(--theme-primary)]/10 dark:bg-[var(--theme-primary)]/20"
                        : "border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span data-no-auto-translate="true" className="font-semibold text-slate-900 dark:text-white">{course.title}</span>
                      {active && (
                        <span className="text-xs text-slate-500 dark:text-slate-300">{courseCompletionPercent}%</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 space-y-3">
              {selectedCourse?.units.map((unit) => (
                <div
                  key={unit.id}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 p-3"
                >
                  <h3 data-no-auto-translate="true" className="font-semibold text-sm text-slate-900 dark:text-white">{unit.title}</h3>
                  <div className="mt-2 space-y-2">
                    {unit.topics.map((topic) => {
                      const status = progress.topicStatusById[topic.id] ?? "locked";
                      const isSelected = selectedTopicId === topic.id;
                      const isDone = status === "mastered";
                      const isLocked = status === "locked";

                      return (
                        <button
                          key={topic.id}
                          type="button"
                          onClick={() => changeTopic(topic.id)}
                          disabled={isLocked}
                          className={`w-full rounded-md border px-2 py-1.5 text-left text-xs transition ${
                            isSelected
                              ? "border-[var(--theme-primary)] bg-[var(--theme-primary)]/10 dark:bg-[var(--theme-primary)]/20"
                              : "border-slate-200 dark:border-slate-700"
                          } ${isLocked ? "opacity-60 cursor-not-allowed" : ""}`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span data-no-auto-translate="true" className="text-slate-800 dark:text-slate-200">{topic.title}</span>
                            <span className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
                              {isDone ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                  {t("Mastered")}
                                </>
                              ) : isLocked ? (
                                <>
                                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                                  {t("Locked")}
                                </>
                              ) : (
                                t("Active")
                              )}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="space-y-6">
            <Card id="learn-workspace" ref={workspaceRef}>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-600 dark:text-slate-300 mb-4">
                {t("Current step: Study resources, then take the mastery quiz. Score")} {Math.round(progress.unlockThreshold * 100)}%+ {t("to unlock the next topic.")}
              </div>

              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase text-slate-500 dark:text-slate-400">{t("Current topic")}</p>
                  <h2 data-no-auto-translate="true" className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                    {selectedTopic?.title ?? t("Choose a topic")}
                  </h2>
                  <p data-no-auto-translate="true" className="text-sm text-slate-600 dark:text-slate-400 mt-1">{selectedTopic?.summary}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t("Mastery")}</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{masteryPercent}%</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{statusLabel[selectedStatus]}</p>
                </div>
              </div>

              <div className="mt-3 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs text-slate-600 dark:text-slate-300">
                {t("Quiz score required for unlock:")} {Math.round(progress.unlockThreshold * 100)}%
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {topicViewTabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => switchView(tab.id, { scrollTo: tab.id === "practice" || tab.id === "video" ? "resources" : "workspace" })}
                    className={`rounded-full px-3 py-1.5 text-xs border transition ${
                      progress.activeTopicView === tab.id
                        ? "border-[var(--theme-primary)] bg-[var(--theme-primary)] text-white"
                        : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {tabLabelById[tab.id]}
                  </button>
                ))}
              </div>

              {progress.activeTopicView === "quiz" && (
                <div className="mt-4 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-900/20 px-3 py-3">
                  <p className="text-xs uppercase text-indigo-700 dark:text-indigo-300">{t("Quiz mode")}</p>
                  <p className="text-sm text-indigo-800 dark:text-indigo-200 mt-1">
                    {selectedTopicAttempt
                      ? `${t("Latest score")} ${Math.round(selectedTopicAttempt.accuracy * 100)}% · ${t("Mode")} ${selectedTopicAttempt.difficulty}`
                      : t("No attempts yet for this topic. Start the mastery quiz.")}
                  </p>
                </div>
              )}

              <div ref={resourcesRef} className="mt-4 grid grid-cols-1 gap-3">
                {resourcesToShow.map((resource) => (
                  <a
                    key={`${selectedTopic?.id}-${resource.title}`}
                    href={resource.href}
                    target={resource.href.startsWith("http") ? "_blank" : "_self"}
                    rel={resource.href.startsWith("http") ? "noreferrer" : undefined}
                    className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 min-h-20 hover:border-[var(--theme-primary)] transition-colors"
                  >
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">{resource.kind}</p>
                    <p data-no-auto-translate="true" className="font-semibold text-slate-900 dark:text-white mt-1">{resource.title}</p>
                  </a>
                ))}

                {resourcesToShow.length === 0 && emptyResourceConfig && (
                  <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-900/60">
                    <p className="font-semibold text-slate-900 dark:text-white">{emptyResourceConfig.title}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{emptyResourceConfig.description}</p>
                    <Button className="mt-3" size="sm" variant="outline" onClick={emptyResourceConfig.onClick}>
                      {emptyResourceConfig.ctaLabel}
                    </Button>
                  </div>
                )}
              </div>

              <div className="mt-4 rounded-lg border border-slate-200 dark:border-slate-700 p-3">
                <p className="text-xs uppercase text-slate-500 dark:text-slate-400">{t("Mastery goal")}</p>
                <p data-no-auto-translate="true" className="text-sm text-slate-800 dark:text-slate-200 mt-1">{selectedTopic?.masteryGoal}</p>
              </div>

              <div className="mt-4 flex flex-col sm:flex-row sm:flex-wrap gap-2">
                <Button onClick={markAsStudied} variant="outline">
                  {t("Mark as studied")}
                </Button>
                <Button variant="outline" onClick={moveToNextTopic} disabled={!nextTopicId || selectedStatus !== "mastered"}>
                  {t("Next topic")}
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button
                  id="quizzes"
                  className={pulseQuizCta ? "animate-pulse" : ""}
                  onClick={() => openQuiz({ topicId: selectedTopic?.id ?? undefined, difficulty: "medium" })}
                  disabled={!selectedTopic?.quizSlugs?.[0]}
                >
                  <Trophy className="w-4 h-4" />
                  {t("Take mastery quiz")}
                </Button>
              </div>

              {courseFullyComplete && (
                <div className="mt-4 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 px-3 py-3">
                  <p className="text-sm font-semibold text-green-800 dark:text-green-300">
                    {t("Course complete:")} <span data-no-auto-translate="true">{selectedCourse?.title}</span>
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                    {t("Great work. Choose your next class from the path panel to continue.")}
                  </p>
                </div>
              )}
            </Card>

            <Card id="learn-action-grid" ref={actionGridRef}>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t("What do you need right now?")}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {t("Choose one action and follow through before switching context.")}
              </p>
              <div className="mt-4">
                <ActionGrid
                  intent={progress.intent}
                  showHeader={false}
                  onSetIntent={handleIntentAction}
                  onQuickAction={handleQuickAction}
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={progress.testPrepMode ? "primary" : "outline"}
                  onClick={() => {
                    setTestPrepMode(!progress.testPrepMode);
                    if (!progress.testPrepMode) {
                      setActiveTopicView("quiz");
                    }
                    refreshProgress();
                  }}
                >
                  <Flame className="w-4 h-4" />
                  {t("Test-prep mode")} {progress.testPrepMode ? t("on") : t("off")}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    openAiTutor({
                      prompt: selectedTopic?.aiPrompt || `Help me with ${selectedTopic?.title ?? "this topic"}`,
                      autoSend: false,
                    })
                  }
                >
                  <PlayCircle className="w-4 h-4" />
                  {t("Use AI support")}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => router.push(selectedTopicCommunityHref)}>
                  <Users className="w-4 h-4" />
                  {t("Ask Community")}
                </Button>
              </div>
            </Card>

            <RecommendationPanel recommendations={recommendations} title={t("Next Best Actions")} />
            <CommunitySpotlight
              studyGroupId={selectedTopic?.studyGroupId}
              discussionLabel={selectedTopic?.communityThread}
            />

            {progress.globalTutorialCompleted && <GuidedOnboarding progress={progress} />}
          </div>
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
