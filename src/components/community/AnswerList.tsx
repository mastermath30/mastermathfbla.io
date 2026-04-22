import type { Answer } from "./types";

interface AnswerListProps {
  answers: Answer[];
}

export function AnswerList({ answers }: AnswerListProps) {
  if (answers.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
        No answers yet. Be the first to help!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {answers.map((answer, index) => (
        <div
          key={answer.id}
          className="rounded-2xl border border-slate-200 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-900/70"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Answer {index + 1}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-200">{answer.text}</p>
        </div>
      ))}
    </div>
  );
}
