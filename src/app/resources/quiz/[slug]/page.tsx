"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { SectionLabel } from "@/components/SectionLabel";

type QuizQuestion = {
  prompt: string;
  options: string[];
  correctIndex: number;
};

type QuizData = {
  title: string;
  description: string;
  difficulty: string;
  time: string;
  topic: string;
  questions: QuizQuestion[];
};

const quizzesBySlug: Record<string, QuizData> = {
  "algebra-basics": {
    title: "Algebra Basics",
    description: "Test your understanding of equations, expressions, and inequalities.",
    difficulty: "Beginner",
    time: "15 questions • 20 min",
    topic: "Algebra",
    questions: [
      {
        prompt: "Solve for x: 2x + 5 = 17",
        options: ["x = 6", "x = 8", "x = 11", "x = 12"],
        correctIndex: 0,
      },
      {
        prompt: "Simplify: 3(2x - 4) + x",
        options: ["6x - 4", "7x - 12", "6x - 12", "5x - 12"],
        correctIndex: 1,
      },
      {
        prompt: "Which is equivalent to 4x - 9 = 7?",
        options: ["x = 4", "x = -4", "x = 1", "x = 2"],
        correctIndex: 0,
      },
      {
        prompt: "Factor: x^2 + 5x + 6",
        options: ["(x + 2)(x + 3)", "(x - 2)(x - 3)", "(x + 1)(x + 6)", "(x - 1)(x - 6)"],
        correctIndex: 0,
      },
      {
        prompt: "Solve the inequality: 3x - 7 > 5",
        options: ["x > 4", "x > 6", "x > 12", "x > -4"],
        correctIndex: 0,
      },
    ],
  },
  "geometry-proofs": {
    title: "Geometry Proofs",
    description: "Practice writing and understanding geometric proofs.",
    difficulty: "Intermediate",
    time: "10 questions • 15 min",
    topic: "Geometry",
    questions: [
      {
        prompt: "If two angles are supplementary, their measures add up to:",
        options: ["90 degrees", "120 degrees", "180 degrees", "360 degrees"],
        correctIndex: 2,
      },
      {
        prompt: "A triangle with sides 3, 4, 5 is:",
        options: ["Equilateral", "Isosceles", "Right", "Obtuse"],
        correctIndex: 2,
      },
      {
        prompt: "Which statement is always true for vertical angles?",
        options: ["They are supplementary", "They are congruent", "They are adjacent", "They sum to 360 degrees"],
        correctIndex: 1,
      },
      {
        prompt: "The sum of the interior angles of a triangle is:",
        options: ["90 degrees", "180 degrees", "270 degrees", "360 degrees"],
        correctIndex: 1,
      },
      {
        prompt: "If two lines are parallel, corresponding angles are:",
        options: ["Congruent", "Supplementary", "Complementary", "Right angles"],
        correctIndex: 0,
      },
    ],
  },
  "calculus-derivatives": {
    title: "Calculus: Derivatives",
    description: "Master the fundamentals of differentiation and derivative rules.",
    difficulty: "Advanced",
    time: "20 questions • 30 min",
    topic: "Calculus",
    questions: [
      {
        prompt: "What is the derivative of f(x) = x^2?",
        options: ["2x", "x", "x^2", "2"],
        correctIndex: 0,
      },
      {
        prompt: "What is the derivative of f(x) = 5x?",
        options: ["5", "x", "5x^2", "0"],
        correctIndex: 0,
      },
      {
        prompt: "What is the derivative of f(x) = sin(x)?",
        options: ["cos(x)", "-cos(x)", "-sin(x)", "tan(x)"],
        correctIndex: 0,
      },
      {
        prompt: "Using the power rule, the derivative of x^5 is:",
        options: ["5x^4", "x^4", "5x^5", "x^6"],
        correctIndex: 0,
      },
      {
        prompt: "What is the derivative of a constant?",
        options: ["1", "0", "The constant itself", "It depends on x"],
        correctIndex: 1,
      },
    ],
  },
};

export default function QuizPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;
  const quiz = useMemo(() => (slug ? quizzesBySlug[slug] : undefined), [slug]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [showResults, setShowResults] = useState(false);

  if (!quiz) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20 md:pt-24">
        <main className="max-w-3xl mx-auto px-6 py-12">
          <Card className="p-8 text-center">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Quiz not found</h1>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              The quiz you are looking for does not exist yet.
            </p>
            <Button onClick={() => router.push("/resources#quizzes")} type="button">
              Back to Resources
            </Button>
          </Card>
        </main>
      </div>
    );
  }

  const question = quiz.questions[currentIndex];
  const totalQuestions = quiz.questions.length;
  const isLastQuestion = currentIndex === totalQuestions - 1;
  const progress = Math.round(((currentIndex + (showResults ? 1 : 0)) / totalQuestions) * 100);

  const handleSubmit = () => {
    if (selectedIndex === null || answered) return;
    if (selectedIndex === question.correctIndex) {
      setScore((prev) => prev + 1);
    }
    setAnswered(true);
  };

  const handleNext = () => {
    if (isLastQuestion) {
      setShowResults(true);
      return;
    }
    setCurrentIndex((prev) => prev + 1);
    setSelectedIndex(null);
    setAnswered(false);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedIndex(null);
    setScore(0);
    setAnswered(false);
    setShowResults(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20 md:pt-24">
      <main className="max-w-4xl mx-auto px-6 py-12 pb-24">
        <div className="flex flex-col gap-4 mb-8">
          <SectionLabel text={`${quiz.topic} Quiz`} />
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{quiz.title}</h1>
            <p className="text-slate-500 dark:text-slate-400">{quiz.description}</p>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
              <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                {quiz.difficulty}
              </span>
              <span>{quiz.time}</span>
              <span>{totalQuestions} questions</span>
            </div>
          </div>
        </div>

        <Card className="p-6 md:p-8">
          {showResults ? (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Quiz complete</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                You scored {score} out of {totalQuestions}.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={handleRestart} type="button">
                  Restart Quiz
                </Button>
                <Button variant="outline" onClick={() => router.push("/resources#quizzes")} type="button">
                  Back to Resources
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mb-4">
                <span>
                  Question {currentIndex + 1} of {totalQuestions}
                </span>
                <span>{progress}% complete</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-900 mb-6">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${progress}%`,
                    background: "linear-gradient(135deg, var(--theme-primary), var(--theme-primary-light))",
                  }}
                />
              </div>

              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-5">{question.prompt}</h2>
              <div className="grid grid-cols-1 gap-3">
                {question.options.map((option, index) => {
                  const isSelected = selectedIndex === index;
                  const isCorrect = answered && index === question.correctIndex;
                  const isIncorrect = answered && isSelected && index !== question.correctIndex;

                  return (
                    <button
                      key={`${question.prompt}-${option}`}
                      type="button"
                      onClick={() => setSelectedIndex(index)}
                      className={[
                        "w-full text-left px-4 py-3 rounded-xl border transition-all",
                        "bg-white dark:bg-slate-950",
                        isSelected ? "border-[var(--theme-primary)] shadow-sm" : "border-slate-200 dark:border-slate-800",
                        answered && isCorrect ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400" : "",
                        answered && isIncorrect ? "bg-rose-50 dark:bg-rose-950/40 border-rose-400" : "",
                      ].join(" ")}
                      disabled={answered}
                    >
                      <span className="text-slate-700 dark:text-slate-200">{option}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <Button onClick={handleSubmit} type="button" disabled={selectedIndex === null || answered}>
                  Check Answer
                </Button>
                <Button
                  variant="outline"
                  onClick={handleNext}
                  type="button"
                  disabled={!answered}
                >
                  {isLastQuestion ? "Finish Quiz" : "Next Question"}
                </Button>
                <Link
                  href="/resources#quizzes"
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-[var(--theme-primary)] hover:text-[var(--theme-primary)] transition-colors"
                >
                  Exit Quiz
                </Link>
              </div>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
