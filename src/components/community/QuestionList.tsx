"use client";

import { useEffect, useRef } from "react";
import type { Question } from "./types";
import { QuestionCard } from "./QuestionCard";
import { AnswerList } from "./AnswerList";
import { AnswerInput } from "./AnswerInput";

interface QuestionListProps {
  questions: Question[];
  selectedQuestionId: string | null;
  onSelectQuestion: (questionId: string) => void;
  selectedQuestion?: Question | null;
  onSubmitAnswer?: (text: string) => void;
}

export function QuestionList({
  questions,
  selectedQuestionId,
  onSelectQuestion,
  selectedQuestion,
  onSubmitAnswer,
}: QuestionListProps) {
  const inlineRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (selectedQuestionId && inlineRef.current) {
      const timeout = setTimeout(() => {
        inlineRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 60);
      return () => clearTimeout(timeout);
    }
  }, [selectedQuestionId]);

  if (questions.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-100 p-5 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
        No questions yet. Ask the first math question.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {questions.map((question) => {
        const isActive = question.id === selectedQuestionId;
        return (
          <div key={question.id}>
            <QuestionCard
              question={question}
              onSelect={onSelectQuestion}
              isActive={isActive}
            />

            {/* Mobile inline expansion — hidden on lg+ where the right panel handles it */}
            {isActive && selectedQuestion && (
              <div
                ref={inlineRef}
                className="lg:hidden mt-1 rounded-2xl border-2 border-[var(--theme-primary)]/30 bg-white dark:bg-slate-900 overflow-hidden"
              >
                {/* Question header strip */}
                <div className="border-b border-[var(--theme-primary)]/15 bg-[var(--accent-soft)] px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--theme-primary)]">
                    {selectedQuestion.answers.length} {selectedQuestion.answers.length === 1 ? "answer" : "answers"}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-white leading-snug">
                    {selectedQuestion.title}
                  </p>
                </div>

                <div className="p-4 space-y-4">
                  <AnswerList answers={selectedQuestion.answers} />

                  {onSubmitAnswer && (
                    <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-2">
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                        Your Answer
                      </p>
                      <AnswerInput onSubmitAnswer={onSubmitAnswer} />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
