"use client";

import { FormEvent, useMemo, useState } from "react";
import { MessageCircle, Users, X } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/Card";
import { Button } from "@/components/Button";
import { PageHero } from "@/components/PageHero";
import { PageWrapper } from "@/components/motion";
import { AskQuestionForm } from "@/components/community/AskQuestionForm";
import { QuestionList } from "@/components/community/QuestionList";
import { QuestionPage } from "@/components/community/QuestionPage";
import type { Question } from "@/components/community/types";

const initialQuestions: Question[] = [
  {
    id: "q1",
    author: "James Carter",
    title: "How do you solve quadratic equations using factoring?",
    body: "I understand the quadratic formula, but I want to solve x^2 + 7x + 12 = 0 by factoring. How do I reliably find the two numbers?",
    answers: [
      { id: "a1", author: "Noah Kim", text: "Find two numbers that multiply to 12 and add to 7: 3 and 4. So x^2 + 7x + 12 = (x + 3)(x + 4) = 0, giving x = -3 or x = -4." },
      { id: "a2", author: "Sara Ahmed", text: "A good pattern: for x^2 + bx + c, look for factors of c that sum to b. Then set each factor equal to zero after factoring." },
      { id: "a3", author: "Liam Chen", text: "If no integer pair works, factoring over integers may not be possible. Then switch to completing the square or the quadratic formula." },
    ],
  },
  {
    id: "q2",
    author: "Noah Kim",
    title: "What is the difference between permutation and combination?",
    body: "I keep mixing these up in probability. When should I use nPr versus nCr?",
    answers: [
      { id: "a4", author: "James Carter", text: "Use permutations when order matters (arrangements), and combinations when order does not matter (groups)." },
      { id: "a5", author: "Ethan Park", text: "Example: choosing president and vice president from 5 students is a permutation. Choosing any 2 students for a team is a combination." },
      { id: "a6", author: "Maya Ross", text: "Formulas: nPr = n!/(n-r)! and nCr = n!/(r!(n-r)!). Notice combinations divide by r! because order is ignored." },
    ],
  },
  {
    id: "q3",
    author: "Sara Ahmed",
    title: "How does the unit circle work in trigonometry?",
    body: "I can memorize points but I do not understand why cosine is x and sine is y on the unit circle.",
    answers: [
      { id: "a7", author: "Liam Chen", text: "On the unit circle, radius = 1. A point at angle theta has coordinates (cos theta, sin theta), so x is cosine and y is sine by definition." },
      { id: "a8", author: "Ethan Park", text: "Think right triangle: cos = adjacent/hypotenuse and sin = opposite/hypotenuse. Hypotenuse is 1, so adjacent = cos and opposite = sin." },
    ],
  },
  {
    id: "q4",
    author: "Liam Chen",
    title: "Why do we need a common denominator when adding fractions?",
    body: "I know the process mechanically, but why can’t we do 1/2 + 1/3 = 2/5?",
    answers: [
      { id: "a9", author: "James Carter", text: "Denominators define the size of each part. Halves and thirds are different-sized parts, so you must convert them to equal-sized parts first." },
      { id: "a10", author: "Noah Kim", text: "For 1/2 + 1/3, use denominator 6: 1/2 = 3/6 and 1/3 = 2/6, so total is 5/6." },
      { id: "a11", author: "Sara Ahmed", text: "Adding numerators and denominators separately changes both quantity and unit size, which is why 2/5 is incorrect." },
    ],
  },
  {
    id: "q5",
    author: "Maya Ross",
    title: "What does a derivative mean conceptually?",
    body: "I can take derivatives with rules, but I want intuition for what f’(x) represents.",
    answers: [
      { id: "a12", author: "Ethan Park", text: "The derivative is the instantaneous rate of change. It tells how fast f(x) changes at a specific x." },
      { id: "a13", author: "Sara Ahmed", text: "Geometrically, f’(x) is the slope of the tangent line to the graph at that point." },
      { id: "a14", author: "Noah Kim", text: "In physics, if position is s(t), then s’(t) is velocity. That real-world link often makes the concept click." },
    ],
  },
];

function createId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
}

export default function CommunityPage() {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(initialQuestions[0]?.id ?? null);
  const [showModal, setShowModal] = useState(false);
  const [successToast, setSuccessToast] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupSubject, setGroupSubject] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [groupMaxMembers, setGroupMaxMembers] = useState("");

  const handleCreateGroupSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowModal(false);
    setGroupName("");
    setGroupSubject("");
    setGroupDescription("");
    setGroupMaxMembers("");
    setSuccessToast(true);
    setTimeout(() => setSuccessToast(false), 3000);
  };

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
    <PageWrapper className="min-h-screen bg-[#f7f4ed] pb-20 dark:bg-slate-950">
      {/* Create Study Group Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-slate-600 dark:bg-slate-800">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-slate-600">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Create a Study Group</h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-gray-400 transition-colors hover:text-gray-900 dark:text-slate-400 dark:hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateGroupSubmit} className="space-y-4 px-6 py-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-900 dark:text-slate-200">Study Group Name</label>
                <input
                  type="text"
                  required
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="e.g. AP Calculus Study Circle"
                  className="w-full rounded-xl border border-gray-300 bg-gray-100 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 dark:border-slate-500 dark:bg-slate-700 dark:text-white dark:placeholder-slate-400 focus:border-[var(--theme-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--theme-primary)]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-900 dark:text-slate-200">Subject / Topic</label>
                <input
                  type="text"
                  required
                  value={groupSubject}
                  onChange={(e) => setGroupSubject(e.target.value)}
                  placeholder="e.g. Calculus, SAT Math"
                  className="w-full rounded-xl border border-gray-300 bg-gray-100 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 dark:border-slate-500 dark:bg-slate-700 dark:text-white dark:placeholder-slate-400 focus:border-[var(--theme-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--theme-primary)]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-900 dark:text-slate-200">Description</label>
                <textarea
                  required
                  rows={3}
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  placeholder="What will your group focus on?"
                  className="w-full rounded-xl border border-gray-300 bg-gray-100 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 dark:border-slate-500 dark:bg-slate-700 dark:text-white dark:placeholder-slate-400 focus:border-[var(--theme-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--theme-primary)] resize-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-900 dark:text-slate-200">Max Members</label>
                <input
                  type="number"
                  required
                  min={2}
                  max={100}
                  value={groupMaxMembers}
                  onChange={(e) => setGroupMaxMembers(e.target.value)}
                  placeholder="e.g. 10"
                  className="w-full rounded-xl border border-gray-300 bg-gray-100 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 dark:border-slate-500 dark:bg-slate-700 dark:text-white dark:placeholder-slate-400 focus:border-[var(--theme-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--theme-primary)]"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-xl py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: "linear-gradient(135deg, var(--theme-primary), var(--theme-primary-light))" }}
              >
                Create Group
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Success toast */}
      {successToast && (
        <div className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[var(--theme-primary)] px-6 py-3 text-sm font-semibold text-white shadow-lg">
          Study group created!
        </div>
      )}

      <PageHero
        eyebrow="Community Q&A"
        title="Community"
        highlight="Learn together"
        description="Ask questions, read clear answers, and start study groups with other learners."
        icon={MessageCircle}
        actions={
          <Button
            type="button"
            onClick={() => setShowModal(true)}
            size="lg"
            className="w-full rounded-full bg-indigo-600 px-7 text-white shadow-sm hover:bg-indigo-700 sm:w-auto"
          >
            Create Study Group
          </Button>
        }
        visualEyebrow="Forum flow"
        visualTitle="Community workspace"
        visualProgress="88%"
        visualItems={[
          { label: "Ask", title: "Post a clear math question", meta: "Fast" },
          { label: "Discuss", title: "Compare solution methods", meta: "Peer-led" },
          { label: "Group", title: "Start a focused study circle", meta: "Live" },
        ]}
      />

      <main className="mx-auto w-full max-w-7xl space-y-6 px-4 sm:px-6">
        <Card variant="glass" className="p-6 md:p-8">
          <div className="mb-4 flex items-start justify-between gap-4">
            <CardHeader className="p-0">
              <CardTitle className="text-3xl">Community Q&A</CardTitle>
              <CardDescription>
                Ask math questions, explore existing threads, and help others with clear explanations.
              </CardDescription>
            </CardHeader>
            <Users className="h-8 w-8 shrink-0 text-indigo-700 dark:text-indigo-300" />
          </div>
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
