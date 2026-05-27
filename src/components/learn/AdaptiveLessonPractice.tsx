"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, Brain, CheckCircle2, Lightbulb, RotateCcw, Sparkles, XCircle } from "lucide-react";
import { Button } from "@/components/Button";
import { useTranslations } from "@/components/LanguageProvider";
import type { LessonPracticeData, LessonPracticeDifficulty, QuizQuestion } from "@/lib/quizBank";

type LessonTopic = {
  id: string;
  title: string;
  summary: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  masteryGoal: string;
  readinessSignals: string[];
  aiPrompt: string;
};

type AnswerRecord = {
  prompt: string;
  selectedIndex: number;
  correctIndex: number;
  difficulty: LessonPracticeDifficulty;
};

type AdaptiveLessonPracticeProps = {
  topic: LessonTopic;
  practiceData: LessonPracticeData;
  checkpointComplete: boolean;
  hasQuiz: boolean;
  locked?: boolean;
  onComplete: (result: { score: number; total: number; finalDifficulty: LessonPracticeDifficulty }) => void;
  onStartQuiz: () => void;
  onOpenExternalPractice: () => void;
  onAskAi: (prompt: string) => void;
};

const TOTAL_PRACTICE_QUESTIONS = 8;
const difficultyOrder: LessonPracticeDifficulty[] = ["easy", "medium", "hard"];

function getStartDifficulty(topicDifficulty: LessonTopic["difficulty"]): LessonPracticeDifficulty {
  return topicDifficulty === "beginner" ? "easy" : "medium";
}

function moveDifficulty(current: LessonPracticeDifficulty, correct: boolean): LessonPracticeDifficulty {
  const index = difficultyOrder.indexOf(current);
  const nextIndex = correct ? Math.min(index + 1, difficultyOrder.length - 1) : Math.max(index - 1, 0);
  return difficultyOrder[nextIndex] ?? current;
}

function formatDifficultyLabel(value: LessonPracticeDifficulty) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function buildExplanation(topic: LessonTopic, question: QuizQuestion, selectedIndex: number | null, t: (key: string, params?: Record<string, string | number>) => string) {
  if (question.explanation) return t(question.explanation);
  const correctAnswer = question.options[question.correctIndex] ?? "";
  if (selectedIndex === question.correctIndex) {
    return t("Correct. The answer matches the skill goal: {goal}", { goal: topic.masteryGoal });
  }
  return t("The correct answer is {answer}. Use the key idea to check each step: {goal}", {
    answer: correctAnswer,
    goal: topic.masteryGoal,
  });
}

export function AdaptiveLessonPractice({
  topic,
  practiceData,
  checkpointComplete,
  hasQuiz,
  locked = false,
  onComplete,
  onStartQuiz,
  onOpenExternalPractice,
  onAskAi,
}: AdaptiveLessonPracticeProps) {
  const { t } = useTranslations();
  const startDifficulty = useMemo(() => getStartDifficulty(topic.difficulty), [topic.difficulty]);
  const [mode, setMode] = useState<"intro" | "practice" | "results">("intro");
  const [currentDifficulty, setCurrentDifficulty] = useState<LessonPracticeDifficulty>(startDifficulty);
  const [activeQuestion, setActiveQuestion] = useState<QuizQuestion | null>(null);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [usedByDifficulty, setUsedByDifficulty] = useState<Record<LessonPracticeDifficulty, number>>({ easy: 0, medium: 0, hard: 0 });
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [answerRecords, setAnswerRecords] = useState<AnswerRecord[]>([]);
  const [finalDifficulty, setFinalDifficulty] = useState<LessonPracticeDifficulty>(startDifficulty);

  const resetLesson = useCallback(() => {
    setMode("intro");
    setCurrentDifficulty(startDifficulty);
    setActiveQuestion(null);
    setQuestionNumber(0);
    setUsedByDifficulty({ easy: 0, medium: 0, hard: 0 });
    setSelectedIndex(null);
    setAnswered(false);
    setAnswerRecords([]);
    setFinalDifficulty(startDifficulty);
  }, [startDifficulty]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    resetLesson();
  }, [practiceData, resetLesson, topic.id]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const takeQuestion = useCallback(
    (difficulty: LessonPracticeDifficulty, used: Record<LessonPracticeDifficulty, number>) => {
      const pool = practiceData.questionsByDifficulty[difficulty];
      const fallbackPool = practiceData.questionsByDifficulty[startDifficulty] ?? practiceData.questionsByDifficulty.medium;
      const safePool = pool.length > 0 ? pool : fallbackPool;
      if (safePool.length === 0) return null;
      const index = used[difficulty] % safePool.length;
      return safePool[index] ?? null;
    },
    [practiceData.questionsByDifficulty, startDifficulty]
  );

  const beginPractice = () => {
    const freshUsed: Record<LessonPracticeDifficulty, number> = { easy: 0, medium: 0, hard: 0 };
    const firstQuestion = takeQuestion(startDifficulty, freshUsed);
    setActiveQuestion(firstQuestion);
    setCurrentDifficulty(startDifficulty);
    setUsedByDifficulty({
      ...freshUsed,
      [startDifficulty]: 1,
    });
    setQuestionNumber(1);
    setSelectedIndex(null);
    setAnswered(false);
    setAnswerRecords([]);
    setFinalDifficulty(startDifficulty);
    setMode("practice");
  };

  const submitAnswer = () => {
    if (selectedIndex === null || !activeQuestion || answered) return;
    setAnswered(true);
  };

  const advanceQuestion = () => {
    if (!activeQuestion || selectedIndex === null || !answered) return;
    const correct = selectedIndex === activeQuestion.correctIndex;
    const nextRecords = [
      ...answerRecords,
      {
        prompt: activeQuestion.prompt,
        selectedIndex,
        correctIndex: activeQuestion.correctIndex,
        difficulty: currentDifficulty,
      },
    ];
    const nextDifficulty = moveDifficulty(currentDifficulty, correct);
    setAnswerRecords(nextRecords);
    setFinalDifficulty(nextDifficulty);

    if (questionNumber >= TOTAL_PRACTICE_QUESTIONS) {
      setMode("results");
      onComplete({
        score: nextRecords.filter((record) => record.selectedIndex === record.correctIndex).length,
        total: TOTAL_PRACTICE_QUESTIONS,
        finalDifficulty: nextDifficulty,
      });
      return;
    }

    const nextUsed = {
      ...usedByDifficulty,
      [nextDifficulty]: usedByDifficulty[nextDifficulty] + 1,
    };
    setUsedByDifficulty(nextUsed);
    setCurrentDifficulty(nextDifficulty);
    setActiveQuestion(takeQuestion(nextDifficulty, nextUsed));
    setQuestionNumber((current) => current + 1);
    setSelectedIndex(null);
    setAnswered(false);
  };

  const askAiForCurrentQuestion = () => {
    if (!activeQuestion) return;
    const selectedAnswer = selectedIndex === null ? "No answer selected yet" : activeQuestion.options[selectedIndex] ?? "Unknown selection";
    onAskAi(
      [
        `You are helping a student inside MathMaster's adaptive lesson practice.`,
        `Give hints first. Do not reveal the final answer unless the student asks for the full solution.`,
        `Topic: ${topic.title}`,
        `Lesson goal: ${topic.masteryGoal}`,
        `Current difficulty: ${formatDifficultyLabel(currentDifficulty)}`,
        `Question: ${activeQuestion.prompt}`,
        `Answer choices: ${activeQuestion.options.map((option, index) => `${index + 1}. ${option}`).join("; ")}`,
        `Student status: ${answered ? "They submitted an answer." : "They have not submitted yet."}`,
        `Selected answer: ${selectedAnswer}`,
      ].join("\n")
    );
  };

  const score = answerRecords.filter((record) => record.selectedIndex === record.correctIndex).length;
  const progressPercent = Math.round((questionNumber / TOTAL_PRACTICE_QUESTIONS) * 100);
  const exampleAnswer = practiceData.example.options[practiceData.example.correctIndex] ?? "";
  const activeExplanation = activeQuestion ? buildExplanation(topic, activeQuestion, selectedIndex, t) : "";

  return (
    <div className="mt-5 space-y-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
        <section className="rounded-2xl border border-slate-200/80 bg-white/75 p-5 dark:border-slate-800 dark:bg-slate-900/70">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--theme-primary)]">
            <Brain className="h-4 w-4" />
            {t("Built-in lesson")}
          </div>
          <h4 className="mt-3 text-xl font-bold tracking-tight text-slate-900 dark:text-white">{topic.title}</h4>
          <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">{topic.summary}</p>
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/50">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">{t("Goal")}</p>
            <p className="mt-2 text-sm font-medium leading-6 text-slate-800 dark:text-slate-200">{topic.masteryGoal}</p>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200/80 bg-white/75 p-5 dark:border-slate-800 dark:bg-slate-900/70">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--theme-primary)]">
            <Lightbulb className="h-4 w-4" />
            {t("Worked example")}
          </div>
          <p className="mt-3 text-sm font-semibold leading-6 text-slate-900 dark:text-white">{t(practiceData.example.prompt)}</p>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
            {t("Answer")}: <span className="font-semibold text-emerald-700 dark:text-emerald-300">{t(exampleAnswer)}</span>
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
            {t("Use the lesson goal as your check, then try the adaptive set below.")}
          </p>
        </section>
      </div>

      {mode === "intro" && (
        <section className="rounded-2xl border border-slate-200/80 bg-white/75 p-5 dark:border-slate-800 dark:bg-slate-900/70">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{t("Adaptive practice is ready")}</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {t("You will answer 8 built-in problems. Difficulty adjusts after each answer.")}
              </p>
            </div>
            <Button onClick={beginPractice} disabled={locked}>
              <Sparkles className="h-4 w-4" />
              {t("Start adaptive practice")}
            </Button>
          </div>
        </section>
      )}

      {mode === "practice" && activeQuestion && (
        <section className="rounded-2xl border border-slate-200/80 bg-white/75 p-5 dark:border-slate-800 dark:bg-slate-900/70">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {t("Question")} {questionNumber} {t("of")} {TOTAL_PRACTICE_QUESTIONS}
              </p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--theme-primary)]">
                {t(formatDifficultyLabel(currentDifficulty))} {t("difficulty")}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={askAiForCurrentQuestion}>
              <Sparkles className="h-4 w-4" />
              {t("AI Help")}
            </Button>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div className="h-full rounded-full bg-[var(--theme-primary)] transition-all" style={{ width: `${progressPercent}%` }} />
          </div>

          <h4 className="mt-5 text-lg font-semibold leading-7 text-slate-900 dark:text-white">{t(activeQuestion.prompt)}</h4>

          <div className="mt-5 grid gap-3">
            {activeQuestion.options.map((option, index) => {
              const selected = selectedIndex === index;
              const correct = answered && index === activeQuestion.correctIndex;
              const incorrect = answered && selected && index !== activeQuestion.correctIndex;
              return (
                <button
                  key={`${activeQuestion.prompt}-${option}`}
                  type="button"
                  onClick={() => !answered && setSelectedIndex(index)}
                  disabled={answered}
                  className={[
                    "w-full rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition",
                    !selected && !answered ? "border-slate-200 bg-white text-slate-800 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200" : "",
                    selected && !answered ? "border-[var(--theme-primary)] bg-[var(--theme-primary)]/10 text-slate-900 ring-2 ring-[var(--theme-primary)]/20 dark:text-white" : "",
                    correct ? "border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-100" : "",
                    incorrect ? "border-rose-500 bg-rose-50 text-rose-900 dark:bg-rose-950/50 dark:text-rose-100" : "",
                    answered && !correct && !incorrect ? "border-slate-200 bg-slate-50 text-slate-500 opacity-70 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400" : "",
                  ].filter(Boolean).join(" ")}
                >
                  {t(option)}
                </button>
              );
            })}
          </div>

          {answered && (
            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/50">
              <div className="flex items-start gap-2">
                {selectedIndex === activeQuestion.correctIndex ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                ) : (
                  <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
                )}
                <p className="text-sm leading-6 text-slate-700 dark:text-slate-300">{activeExplanation}</p>
              </div>
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            {!answered ? (
              <Button onClick={submitAnswer} disabled={selectedIndex === null}>
                {t("Check answer")}
              </Button>
            ) : (
              <Button onClick={advanceQuestion}>
                {questionNumber >= TOTAL_PRACTICE_QUESTIONS ? t("Finish practice") : t("Next problem")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" onClick={resetLesson}>
              <RotateCcw className="h-4 w-4" />
              {t("Restart lesson")}
            </Button>
          </div>
        </section>
      )}

      {mode === "results" && (
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5 dark:border-emerald-900 dark:bg-emerald-950/25">
          <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">{t("Practice complete")}</p>
          <h4 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {score}/{TOTAL_PRACTICE_QUESTIONS} {t("correct")}
          </h4>
          <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
            {t("Final practice level")}: <span className="font-semibold">{t(formatDifficultyLabel(finalDifficulty))}</span>
          </p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {checkpointComplete
              ? t("Your lesson checkpoint is already complete.")
              : t("Your lesson checkpoint is now complete.")}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {hasQuiz ? (
              <Button onClick={onStartQuiz}>{t("Start Quiz")}</Button>
            ) : (
              <Button onClick={onOpenExternalPractice}>{t("Open extra practice")}</Button>
            )}
            <Button variant="outline" onClick={beginPractice}>{t("Practice again")}</Button>
            <Button variant="ghost" onClick={() => onAskAi(topic.aiPrompt || `Help me with ${topic.title}`)}>
              <Sparkles className="h-4 w-4" />
              {t("Ask AI support")}
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
