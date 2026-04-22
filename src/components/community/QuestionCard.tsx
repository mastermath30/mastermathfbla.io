import { Card } from "@/components/Card";
import type { Question } from "./types";

interface QuestionCardProps {
  question: Question;
  onSelect: (questionId: string) => void;
  isActive?: boolean;
}

function getPreview(text: string) {
  if (text.length <= 120) return text;
  return `${text.slice(0, 117)}...`;
}

export function QuestionCard({ question, onSelect, isActive = false }: QuestionCardProps) {
  return (
    <button type="button" onClick={() => onSelect(question.id)} className="block w-full text-left">
      <Card
        variant="glass"
        interactive
        className={`p-5 transition-all ${isActive ? "ring-2 ring-[var(--theme-primary)]/60" : ""}`}
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{question.title}</h3>
          <span className="shrink-0 rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            {question.answers.length} {question.answers.length === 1 ? "answer" : "answers"}
          </span>
        </div>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{getPreview(question.body)}</p>
      </Card>
    </button>
  );
}
