"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PageWrapper, HeroText, GlowingOrbs, FadeIn } from "@/components/motion";
import { SectionLabel } from "@/components/SectionLabel";
import { CourseCard } from "@/components/CourseCard";
import { TopicAccordion } from "@/components/TopicAccordion";
import { RecommendationPanel } from "@/components/RecommendationPanel";
import { CommunitySpotlight } from "@/components/CommunitySpotlight";
import { ActionGrid } from "@/components/ActionGrid";
import { GuidedOnboarding } from "@/components/GuidedOnboarding";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { courses, allTopics } from "@/data/courses";
import {
  getLearningProgress,
  learningProgressEvent,
  markTopicComplete,
  setLearningIntent,
  setResourcePreference,
  setSelectedCourse,
  setSelectedTopic,
} from "@/lib/progress";
import { buildRecommendations } from "@/lib/guidance";
import { ArrowRight, BookOpen, PlayCircle, Sparkles } from "lucide-react";

export default function LearnPage() {
  const [progress, setProgress] = useState(getLearningProgress);

  useEffect(() => {
    const refresh = () => setProgress(getLearningProgress());
    window.addEventListener(learningProgressEvent, refresh);
    return () => window.removeEventListener(learningProgressEvent, refresh);
  }, []);

  const selectedCourse =
    courses.find((course) => course.id === progress.selectedCourseId) ?? courses[0];

  useEffect(() => {
    if (!progress.selectedCourseId && selectedCourse) {
      setSelectedCourse(selectedCourse.id);
    }
  }, [progress.selectedCourseId, selectedCourse]);

  const selectedTopic = useMemo(
    () => allTopics.find((topic) => topic.id === progress.selectedTopicId),
    [progress.selectedTopicId]
  );

  const recommendations = useMemo(() => buildRecommendations(progress), [progress]);

  const completionPercentByCourse = useMemo(() => {
    return courses.reduce<Record<string, number>>((acc, course) => {
      const topicIds = course.units.flatMap((unit) => unit.topics.map((topic) => topic.id));
      const completed = topicIds.filter((id) => progress.completedTopicIds.includes(id)).length;
      acc[course.id] = topicIds.length ? Math.round((completed / topicIds.length) * 100) : 0;
      return acc;
    }, {});
  }, [progress.completedTopicIds]);

  return (
    <PageWrapper className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20 md:pt-24">
      <header className="relative overflow-hidden border-b border-slate-200 dark:border-slate-800">
        <GlowingOrbs variant="section" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 relative">
          <FadeIn>
            <SectionLabel>Guided Learn</SectionLabel>
            <HeroText className="max-w-3xl">
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mt-2">
                MathMaster Learn Path
              </h1>
              <p className="text-slate-600 dark:text-slate-300 mt-3">
                Pick your class, open a topic, and choose what you need now: learn concept, watch video,
                do practice, take quiz, ask AI, or get community help.
              </p>
            </HeroText>
          </FadeIn>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-24 space-y-8">
        <div className="grid xl:grid-cols-[2fr_1fr] gap-6">
          <GuidedOnboarding progress={progress} />
          <RecommendationPanel recommendations={recommendations} />
        </div>

        <section>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">What class are you in?</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Start with your current class so recommendations match your real coursework.
          </p>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                selected={course.id === selectedCourse.id}
                completionPercent={completionPercentByCourse[course.id] ?? 0}
                onSelect={(courseId) => setSelectedCourse(courseId)}
              />
            ))}
          </div>
        </section>

        <ActionGrid intent={progress.intent} onSetIntent={(intent) => setLearningIntent(intent)} />

        <TopicAccordion
          units={selectedCourse.units}
          selectedTopicId={progress.selectedTopicId}
          completedTopicIds={progress.completedTopicIds}
          onSelectTopic={(topicId) => setSelectedTopic(topicId)}
          onMarkComplete={(topicId) => markTopicComplete(topicId)}
        />

        {selectedTopic && (
          <Card>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Focus Topic: {selectedTopic.title}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{selectedTopic.summary}</p>

            <div className="grid md:grid-cols-2 gap-3 mt-4">
              {selectedTopic.resources.map((resource) => (
                <a
                  key={`${selectedTopic.id}-${resource.title}`}
                  href={resource.href}
                  target={resource.href.startsWith("http") ? "_blank" : "_self"}
                  rel={resource.href.startsWith("http") ? "noreferrer" : undefined}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 hover:border-[var(--theme-primary)] transition-colors"
                >
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <BookOpen className="w-4 h-4 text-[var(--theme-primary)]" />
                    {resource.kind}
                  </div>
                  <p className="font-semibold text-slate-900 dark:text-white mt-1">{resource.title}</p>
                </a>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <Link href={`/resources/quiz/${selectedTopic.quizSlugs[0]}`}>
                <Button>
                  Take Topic Quiz
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <a href="/community">
                <Button variant="outline">Ask Community</Button>
              </a>
              <a href="#ai-help">
                <Button variant="ghost">Ask AI</Button>
              </a>
            </div>
          </Card>
        )}

        <div className="grid xl:grid-cols-[2fr_1fr] gap-6">
          <Card id="videos">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Resource Library</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Keep the classic library flow while following your guided path.
            </p>
            <div className="mt-4 grid sm:grid-cols-2 gap-3">
              <a
                href="https://openstax.org/subjects/math"
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-slate-200 dark:border-slate-700 p-3"
              >
                <p className="font-semibold text-slate-900 dark:text-white">OpenStax Mathematics</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Free class-aligned textbook paths</p>
              </a>
              <a
                href="https://www.khanacademy.org/math"
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-slate-200 dark:border-slate-700 p-3"
              >
                <p className="font-semibold text-slate-900 dark:text-white">Khan Academy Practice</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Skill-based drills by topic</p>
              </a>
            </div>

            <div id="worksheets" className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" variant={progress.resourcePreference === "videos" ? "primary" : "outline"} onClick={() => setResourcePreference("videos")}>
                <PlayCircle className="w-4 h-4" />
                Prefer videos
              </Button>
              <Button size="sm" variant={progress.resourcePreference === "worksheets" ? "primary" : "outline"} onClick={() => setResourcePreference("worksheets")}>
                <Sparkles className="w-4 h-4" />
                Prefer worksheets
              </Button>
              <Button size="sm" variant={progress.resourcePreference === "mixed" ? "primary" : "outline"} onClick={() => setResourcePreference("mixed")}>
                Mixed mode
              </Button>
            </div>
            <div id="quizzes" className="mt-4 rounded-xl border border-slate-200 dark:border-slate-700 p-3">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Quiz Library</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Use topic quizzes to track weak areas and power recommendations.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Link href="/resources/quiz/algebra-basics">
                  <Button size="sm" variant="outline">Algebra Basics</Button>
                </Link>
                <Link href="/resources/quiz/geometry-proofs">
                  <Button size="sm" variant="outline">Geometry Proofs</Button>
                </Link>
                <Link href="/resources/quiz/calculus-derivatives">
                  <Button size="sm" variant="outline">Calculus Derivatives</Button>
                </Link>
              </div>
            </div>
          </Card>

          <CommunitySpotlight />
        </div>

        <Card id="ai-help">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">AI Help + Human Support</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Use the AI tutor bubble for step-by-step help, then move into study groups or office hours when you
            need live support.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/community">
              <Button variant="outline">Open Community Q&A</Button>
            </Link>
            <Link href="/schedule">
              <Button variant="outline">View Office Hours & Sessions</Button>
            </Link>
            <Link href="/study-groups">
              <Button>Join a Study Group</Button>
            </Link>
          </div>
        </Card>
      </main>
    </PageWrapper>
  );
}
