"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, ExternalLink, FileText, Lock, PlayCircle, Sparkles } from "lucide-react";
import { PageWrapper } from "@/components/motion";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { AdaptiveLessonPractice } from "@/components/learn/AdaptiveLessonPractice";
import { useTranslations } from "@/components/LanguageProvider";
import { allTopics, courses } from "@/data/courses";
import {
  completeTopicCheckpoint,
  getLearningProgress,
  setActiveTopicView,
  setSelectedCourse,
  setSelectedTopic,
  type LearningProgress,
} from "@/lib/progress";
import { normalizeResourcePlaybackTarget, resolveQuizDisplayTitle, resolveQuizSlug } from "@/lib/learnActions";
import { buildTopicLessonPractice, type LessonPracticeDifficulty } from "@/lib/quizBank";

type ResourceTab = "lessons" | "videos" | "worksheets" | "practice" | "quizzes";

const resourceTabs: Array<{ id: ResourceTab; label: string }> = [
  { id: "lessons", label: "Extra lessons" },
  { id: "videos", label: "Extra videos" },
  { id: "worksheets", label: "Worksheets" },
  { id: "practice", label: "Extra practice" },
  { id: "quizzes", label: "Quizzes" },
];

function getCourseSequence(courseId: string) {
  const course = courses.find((item) => item.id === courseId);
  if (!course) return [];
  const validIds = new Set(course.units.flatMap((unit) => unit.topics.map((topic) => topic.id)));
  return course.recommendedSequence.filter((topicId) => validIds.has(topicId));
}

function isTopicLocked(topicId: string, courseId: string, progress: LearningProgress) {
  const explicitStatus = progress.topicStatusById[topicId];
  if (explicitStatus && explicitStatus !== "locked") return false;

  const sequence = getCourseSequence(courseId);
  const index = sequence.indexOf(topicId);
  if (index <= 0) return false;

  const priorTopicId = sequence[index - 1];
  return progress.topicStatusById[priorTopicId] !== "mastered" && !progress.completedTopicIds.includes(priorTopicId);
}

function formatDifficulty(value: LessonPracticeDifficulty) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function FullScreenLessonPage() {
  const { t } = useTranslations();
  const router = useRouter();
  const params = useParams<{ topicId?: string }>();
  const topicId = typeof params.topicId === "string" ? params.topicId : "";
  const topic = useMemo(() => allTopics.find((item) => item.id === topicId) ?? null, [topicId]);
  const [progress, setProgress] = useState<LearningProgress>(() => getLearningProgress());
  const [activeTab, setActiveTab] = useState<ResourceTab>("lessons");
  const [selectedVideoHref, setSelectedVideoHref] = useState<string | null>(null);
  const [completionSummary, setCompletionSummary] = useState<{
    score: number;
    total: number;
    finalDifficulty: LessonPracticeDifficulty;
  } | null>(null);

  const locked = topic ? isTopicLocked(topic.id, topic.courseId, progress) : false;
  const checkpointComplete = topic ? Boolean(progress.topicCheckpointCompletedById[topic.id]) : false;
  const practiceData = useMemo(
    () => (topic ? buildTopicLessonPractice(topic, `${topic.id}:fullscreen-lesson`, 8) : null),
    [topic]
  );

  const resources = topic?.resources ?? [];
  const lessonResources = resources.filter((resource) => resource.kind === "lesson");
  const videoResources = resources.filter((resource) => resource.kind === "video");
  const worksheetResources = resources.filter((resource) => resource.kind === "worksheet");
  const practiceResources = resources.filter((resource) => resource.kind === "practice");
  const quizSlugs = topic?.quizSlugs ?? [];
  const selectedVideo = videoResources.find((resource) => resource.href === selectedVideoHref) ?? videoResources[0] ?? null;
  const selectedVideoPlayback = selectedVideo ? normalizeResourcePlaybackTarget(selectedVideo) : null;

  const refreshProgress = useCallback(() => {
    const next = getLearningProgress();
    setProgress(next);
    return next;
  }, []);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    refreshProgress();
  }, [refreshProgress]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!topic || locked) return;
    const timer = window.setTimeout(() => {
      setSelectedCourse(topic.courseId);
      setSelectedTopic(topic.id);
      setActiveTopicView("concept");
      refreshProgress();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [locked, refreshProgress, topic]);

  const openAiTutor = useCallback((prompt: string) => {
    window.dispatchEvent(
      new CustomEvent("open-ai-tutor", {
        detail: {
          prompt,
          autoSend: true,
        },
      })
    );
  }, []);

  const goBackToLearn = () => {
    if (topic && !locked) {
      setSelectedCourse(topic.courseId);
      setSelectedTopic(topic.id);
      setActiveTopicView("concept");
    }
    router.push("/learn");
  };

  const openQuiz = (difficulty: "easy" | "medium" | "hard" = "medium", slug?: string) => {
    const quizSlug = resolveQuizSlug(topic?.id, slug);
    if (!quizSlug) return;
    setActiveTopicView("quiz");
    router.push(`/resources/quiz/${quizSlug}?difficulty=${difficulty}`);
  };

  const completeAdaptiveLesson = (result: { score: number; total: number; finalDifficulty: LessonPracticeDifficulty }) => {
    if (!topic || locked) return;
    setCompletionSummary(result);
    completeTopicCheckpoint(topic.id);
    setActiveTopicView("quiz");
    refreshProgress();
  };

  if (!topic) {
    return (
      <PageWrapper className="min-h-screen bg-[#f7f4ed] dark:bg-slate-950 pt-24">
        <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <Card className="p-8 text-center" glow={false}>
            <BookOpen className="mx-auto h-10 w-10 text-[var(--theme-primary)]" />
            <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">{t("Lesson not found")}</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{t("This lesson does not exist yet.")}</p>
            <Button className="mt-6" onClick={() => router.push("/learn")}>
              {t("Back to Learn")}
            </Button>
          </Card>
        </main>
      </PageWrapper>
    );
  }

  if (locked) {
    return (
      <PageWrapper className="min-h-screen bg-[#f7f4ed] dark:bg-slate-950 pt-24">
        <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <Card className="p-8 text-center" glow={false}>
            <Lock className="mx-auto h-10 w-10 text-amber-600" />
            <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">{t("Lesson locked")}</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              {t("Master the previous topic first, then this lesson will unlock.")}
            </p>
            <Button className="mt-6" onClick={goBackToLearn}>
              {t("Back to Learn")}
            </Button>
          </Card>
        </main>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="min-h-screen bg-[#f7f4ed] dark:bg-slate-950 pt-20 md:pt-24">
      <main className="mx-auto max-w-[96rem] px-4 py-5 pb-28 sm:px-6 lg:px-8">
        <div className="sticky top-16 z-30 -mx-4 border-y border-slate-200/80 bg-[#f7f4ed]/95 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/92 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="mx-auto flex max-w-[96rem] flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <button
                type="button"
                onClick={goBackToLearn}
                className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-[var(--theme-primary)] hover:text-[var(--theme-primary)] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                aria-label={t("Back to Learn")}
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--theme-primary)]">
                  {topic.courseTitle} / {topic.unitTitle}
                </p>
                <h1 className="mt-1 truncate text-2xl font-bold tracking-tight text-slate-900 dark:text-white lg:text-3xl">
                  {topic.title}
                </h1>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              <span className="learn-hub-chip">{t(topic.difficulty)}</span>
              <span className="learn-hub-chip">{topic.estimatedMinutes} {t("min lesson")}</span>
              <span className="learn-hub-chip">{checkpointComplete ? t("Checkpoint complete") : t("Practice ready")}</span>
            </div>
          </div>
        </div>

        {completionSummary && (
          <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200">
            <p className="font-semibold">{t("Lesson checkpoint complete")}</p>
            <p className="mt-1">
              {t("You scored {score}/{total} and finished at {level} difficulty.", {
                score: completionSummary.score,
                total: completionSummary.total,
                level: formatDifficulty(completionSummary.finalDifficulty),
              })}
            </p>
          </div>
        )}

        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="min-w-0">
            {practiceData ? (
              <AdaptiveLessonPractice
                topic={topic}
                practiceData={practiceData}
                checkpointComplete={checkpointComplete}
                hasQuiz={quizSlugs.length > 0}
                onComplete={completeAdaptiveLesson}
                onStartQuiz={() => openQuiz("medium")}
                onOpenExternalPractice={() => setActiveTab("practice")}
                onAskAi={openAiTutor}
              />
            ) : (
              <Card className="p-6" glow={false}>
                <p className="text-sm text-slate-600 dark:text-slate-400">{t("Built-in practice is not available for this topic yet.")}</p>
              </Card>
            )}
          </section>

          <aside className="h-fit xl:sticky xl:top-36">
            <Card className="learn-hub-shell" glow={false}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t("Optional Sources")}</h2>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    {t("Use these for extra review without leaving your lesson flow.")}
                  </p>
                </div>
                <Sparkles className="h-5 w-5 text-[var(--theme-primary)]" />
              </div>

              <div className="learn-hub-tabs mt-4" role="tablist" aria-label={t("Optional resource categories")}>
                {resourceTabs.map((tab) => (
                  <button
                    key={tab.id}
                    role="tab"
                    type="button"
                    aria-selected={activeTab === tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`learn-hub-tab ${activeTab === tab.id ? "learn-hub-tab-active" : ""}`}
                  >
                    {t(tab.label)}
                  </button>
                ))}
              </div>

              {activeTab === "videos" && (
                <div className="mt-4">
                  {selectedVideo && selectedVideoPlayback ? (
                    <div className="learn-hub-player-shell">
                      <p className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">{selectedVideo.title}</p>
                      {selectedVideoPlayback.mode === "youtube-embed" && (
                        <div className="learn-hub-player-ratio">
                          <iframe
                            src={selectedVideoPlayback.src}
                            title={`${selectedVideo.title} video lesson`}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                            loading="lazy"
                          />
                        </div>
                      )}
                      {selectedVideoPlayback.mode === "native-video" && (
                        <div className="learn-hub-player-ratio">
                          <video controls preload="metadata" src={selectedVideoPlayback.src} />
                        </div>
                      )}
                      {selectedVideoPlayback.mode === "external" && (
                        <a href={selectedVideoPlayback.src} target="_blank" rel="noreferrer" className="learn-hub-card block">
                          <p className="learn-hub-card-kind">{t("External video")}</p>
                          <p className="learn-hub-card-title">{t("Open video")}</p>
                        </a>
                      )}
                      {selectedVideoPlayback.mode === "unavailable" && (
                        <div className="learn-hub-empty">{t("Video unavailable")}</div>
                      )}
                    </div>
                  ) : (
                    <div className="learn-hub-empty">{t("No videos for this topic yet.")}</div>
                  )}
                </div>
              )}

              <div className="mt-4 grid gap-3">
                {activeTab === "lessons" && lessonResources.length === 0 && <div className="learn-hub-empty">{t("No external lesson links for this topic yet.")}</div>}
                {activeTab === "lessons" && lessonResources.map((resource) => (
                  <a key={`${topic.id}-lesson-${resource.title}`} href={resource.href} target={resource.href.startsWith("http") ? "_blank" : "_self"} rel={resource.href.startsWith("http") ? "noreferrer" : undefined} className="learn-hub-card">
                    <p className="learn-hub-card-kind">{t("External lesson")}</p>
                    <p className="learn-hub-card-title">{t(resource.title)}</p>
                    <ExternalLink className="mt-3 h-4 w-4 text-slate-400" />
                  </a>
                ))}

                {activeTab === "videos" && videoResources.map((resource) => (
                  <button
                    key={`${topic.id}-video-${resource.title}`}
                    type="button"
                    onClick={() => setSelectedVideoHref(resource.href)}
                    className={`learn-hub-card text-left ${selectedVideo?.href === resource.href ? "learn-hub-card-active" : ""}`}
                  >
                    <p className="learn-hub-card-kind">{t("Video")}</p>
                    <p className="learn-hub-card-title">{t(resource.title)}</p>
                  </button>
                ))}

                {activeTab === "worksheets" && worksheetResources.length === 0 && <div className="learn-hub-empty">{t("No worksheets for this topic yet.")}</div>}
                {activeTab === "worksheets" && worksheetResources.map((resource) => (
                  <a key={`${topic.id}-worksheet-${resource.title}`} href={resource.href} target={resource.href.startsWith("http") ? "_blank" : "_self"} rel={resource.href.startsWith("http") ? "noreferrer" : undefined} className="learn-hub-card">
                    <p className="learn-hub-card-kind">{t("Worksheet")}</p>
                    <p className="learn-hub-card-title">{t(resource.title)}</p>
                    <FileText className="mt-3 h-4 w-4 text-slate-400" />
                  </a>
                ))}

                {activeTab === "practice" && practiceResources.length === 0 && <div className="learn-hub-empty">{t("No extra practice links for this topic yet.")}</div>}
                {activeTab === "practice" && practiceResources.map((resource) => (
                  <a key={`${topic.id}-practice-${resource.title}`} href={resource.href} target={resource.href.startsWith("http") ? "_blank" : "_self"} rel={resource.href.startsWith("http") ? "noreferrer" : undefined} className="learn-hub-card">
                    <p className="learn-hub-card-kind">{t("External practice")}</p>
                    <p className="learn-hub-card-title">{t(resource.title)}</p>
                    <ExternalLink className="mt-3 h-4 w-4 text-slate-400" />
                  </a>
                ))}

                {activeTab === "quizzes" && quizSlugs.length === 0 && <div className="learn-hub-empty">{t("No built-in quiz is attached to this topic yet.")}</div>}
                {activeTab === "quizzes" && quizSlugs.map((slug) => (
                  <div key={`${topic.id}-quiz-${slug}`} className="learn-hub-card">
                    <p className="learn-hub-card-kind">{t("Quiz")}</p>
                    <p className="learn-hub-card-title">{resolveQuizDisplayTitle(slug, topic)}</p>
                    <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label={t("Choose difficulty")}>
                      {(["easy", "medium", "hard"] as const).map((difficulty) => (
                        <button key={difficulty} type="button" className="quiz-diff-btn" onClick={() => openQuiz(difficulty, slug)}>
                          {t(difficulty.charAt(0).toUpperCase() + difficulty.slice(1))}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-col gap-2">
                <Button variant="outline" onClick={() => openAiTutor(topic.aiPrompt || `Help me with ${topic.title}`)}>
                  <Sparkles className="h-4 w-4" />
                  {t("Ask AI support")}
                </Button>
                {quizSlugs.length > 0 && (
                  <Button onClick={() => openQuiz("medium")}>
                    <PlayCircle className="h-4 w-4" />
                    {t("Start Quiz")}
                  </Button>
                )}
              </div>
            </Card>
          </aside>
        </div>
      </main>
    </PageWrapper>
  );
}
