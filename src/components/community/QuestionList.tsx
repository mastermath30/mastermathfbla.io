import type { Question } from "./types";
import { QuestionCard } from "./QuestionCard";

interface QuestionListProps {
  questions: Question[];
  selectedQuestionId: string | null;
  onSelectQuestion: (questionId: string) => void;
}

export function QuestionList({ questions, selectedQuestionId, onSelectQuestion }: QuestionListProps) {
  if (questions.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-100 p-5 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
        No questions yet. Ask the first math question.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {questions.map((question) => (
        <QuestionCard
          key={question.id}
          question={question}
          onSelect={onSelectQuestion}
          isActive={question.id === selectedQuestionId}
        />
      ))}
    </div>
  );
}
