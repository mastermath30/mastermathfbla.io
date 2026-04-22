"use client";

import { useMemo, useState } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/Card";
import { PageWrapper } from "@/components/motion";
import { AskQuestionForm } from "@/components/community/AskQuestionForm";
import { QuestionList } from "@/components/community/QuestionList";
import { QuestionPage } from "@/components/community/QuestionPage";
import type { Question } from "@/components/community/types";

const initialQuestions: Question[] = [
  {
    id: "q1",
    title: "How do you solve quadratic equations using factoring?",
    body: "I understand the quadratic formula, but I want to solve x^2 + 7x + 12 = 0 by factoring. How do I reliably find the two numbers?",
    answers: [
      { id: "a1", text: "Find two numbers that multiply to 12 and add to 7: 3 and 4. So x^2 + 7x + 12 = (x + 3)(x + 4) = 0, giving x = -3 or x = -4." },
      { id: "a2", text: "A good pattern: for x^2 + bx + c, look for factors of c that sum to b. Then set each factor equal to zero after factoring." },
      { id: "a3", text: "If no integer pair works, factoring over integers may not be possible. Then switch to completing the square or the quadratic formula." },
    ],
  },
  {
    id: "q2",
    title: "What is the difference between permutation and combination?",
    body: "I keep mixing these up in probability. When should I use nPr versus nCr?",
    answers: [
      { id: "a4", text: "Use permutations when order matters (arrangements), and combinations when order does not matter (groups)." },
      { id: "a5", text: "Example: choosing president and vice president from 5 students is a permutation. Choosing any 2 students for a team is a combination." },
      { id: "a6", text: "Formulas: nPr = n!/(n-r)! and nCr = n!/(r!(n-r)!). Notice combinations divide by r! because order is ignored." },
    ],
  },
  {
    id: "q3",
    title: "How does the unit circle work in trigonometry?",
    body: "I can memorize points but I do not understand why cosine is x and sine is y on the unit circle.",
    answers: [
      { id: "a7", text: "On the unit circle, radius = 1. A point at angle theta has coordinates (cos theta, sin theta), so x is cosine and y is sine by definition." },
      { id: "a8", text: "Think right triangle: cos = adjacent/hypotenuse and sin = opposite/hypotenuse. Hypotenuse is 1, so adjacent = cos and opposite = sin." },
    ],
  },
  {
    id: "q4",
    title: "Why do we need a common denominator when adding fractions?",
    body: "I know the process mechanically, but why can’t we do 1/2 + 1/3 = 2/5?",
    answers: [
      { id: "a9", text: "Denominators define the size of each part. Halves and thirds are different-sized parts, so you must convert them to equal-sized parts first." },
      { id: "a10", text: "For 1/2 + 1/3, use denominator 6: 1/2 = 3/6 and 1/3 = 2/6, so total is 5/6." },
      { id: "a11", text: "Adding numerators and denominators separately changes both quantity and unit size, which is why 2/5 is incorrect." },
    ],
  },
  {
    id: "q5",
    title: "What does a derivative mean conceptually?",
    body: "I can take derivatives with rules, but I want intuition for what f'(x) represents.",
    answers: [
      { id: "a12", text: "The derivative is the instantaneous rate of change. It tells how fast f(x) changes at a specific x." },
      { id: "a13", text: "Geometrically, f'(x) is the slope of the tangent line to the graph at that point." },
      { id: "a14", text: "In physics, if position is s(t), then s'(t) is velocity. That real-world link often makes the concept click." },
    ],
  },
];

function createId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
}

export default function CommunityPage() {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(initialQuestions[0]?.id ?? null);

  const selectedQuestion = useMemo(
    () => questions.find((question) => question.id === selectedQuestionId) ?? null,
    [questions, selectedQuestionId]
  );

  const handleAskQuestion = ({ title, body }: { title: string; body: string }) => {
    const newQuestion: Question = {
      id: createId("q"),
      title,
      body,
      answers: [],
    };

    setQuestions((prev) => [newQuestion, ...prev]);
    setSelectedQuestionId(newQuestion.id);
  };

  const handleSubmitAnswer = (text: string) => {
    if (!selectedQuestionId) return;

    setQuestions((prev) =>
      prev.map((question) =>
        question.id === selectedQuestionId
          ? {
              ...question,
              answers: [...question.answers, { id: createId("a"), text }],
            }
          : question
      )
    );
  };

  return (
    <PageWrapper className="min-h-screen bg-slate-50 px-4 pb-20 pt-24 dark:bg-slate-950 sm:px-6">
      <main className="mx-auto w-full max-w-7xl space-y-6">
        <Card variant="glass" className="p-6 md:p-8">
          <CardHeader>
            <CardTitle className="text-3xl">Community Q&A</CardTitle>
            <CardDescription>
              Ask math questions, explore existing threads, and help others with clear explanations.
            </CardDescription>
          </CardHeader>
          <AskQuestionForm onSubmitQuestion={handleAskQuestion} />
        </Card>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(280px,380px)_1fr]">
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Questions ({questions.length})
            </h2>
            <QuestionList
              questions={questions}
              selectedQuestionId={selectedQuestionId}
              onSelectQuestion={setSelectedQuestionId}
            />
          </section>

          <section>
            {selectedQuestion ? (
              <QuestionPage question={selectedQuestion} onSubmitAnswer={handleSubmitAnswer} />
            ) : (
              <Card variant="glass" className="p-6 text-sm text-slate-600 dark:text-slate-300">
                Select a question to view answers.
              </Card>
            )}
          </section>
        </div>
      </main>
    </PageWrapper>
  );
}
