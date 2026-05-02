import { Card, CardDescription, CardHeader, CardTitle } from "@/components/Card";
import { AnswerInput } from "./AnswerInput";
import { AnswerList } from "./AnswerList";
import type { Question } from "./types";

interface QuestionPageProps {
  question: Question;
  onSubmitAnswer: (text: string) => void;
}

export function QuestionPage({ question, onSubmitAnswer }: QuestionPageProps) {
  return (
    <Card variant="glass" className="p-6">
      <CardHeader className="mb-6">
        <CardTitle className="text-2xl">{question.title}</CardTitle>
        <CardDescription className="mt-3 text-sm leading-relaxed">{question.body}</CardDescription>
      </CardHeader>

      <section className="space-y-4">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Answers ({question.answers.length})
        </h3>
        <AnswerList answers={question.answers} />
      </section>

      <section className="mt-6 space-y-3 border-t border-slate-200 pt-5 dark:border-slate-700">
        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Your Answer</h4>
        <AnswerInput onSubmitAnswer={onSubmitAnswer} />
      </section>
    </Card>
  );
}
