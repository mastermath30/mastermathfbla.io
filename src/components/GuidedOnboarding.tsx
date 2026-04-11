"use client";

import { Card } from "@/components/Card";
import { LearningProgress } from "@/lib/progress";
import { CheckCircle2, Circle } from "lucide-react";

type GuidedOnboardingProps = {
  progress: LearningProgress;
};

export function GuidedOnboarding({ progress }: GuidedOnboardingProps) {
  const items = [
    {
      id: "course",
      label: "Choose your class",
      done: Boolean(progress.selectedCourseId),
    },
    {
      id: "topic",
      label: "Pick a unit/topic",
      done: Boolean(progress.selectedTopicId),
    },
    {
      id: "quiz",
      label: "Complete one quiz",
      done: progress.quizAttempts.length > 0,
    },
    {
      id: "community",
      label: "Join one community activity",
      done: progress.recentActivity.some((entry) => entry.toLowerCase().includes("community")),
    },
  ];

  const doneCount = items.filter((item) => item.done).length;

  return (
    <Card>
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">First-Time Student Checklist</h2>
      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
        {doneCount}/4 complete. Follow this once to unlock a clearer, guided experience.
      </p>

      <div className="space-y-2 mt-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 flex items-center gap-2"
          >
            {item.done ? (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            ) : (
              <Circle className="w-4 h-4 text-slate-400" />
            )}
            <span className={`text-sm ${item.done ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400"}`}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
