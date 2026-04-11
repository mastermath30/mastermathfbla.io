"use client";

import { Button } from "@/components/Button";
import { LearningProgress } from "@/lib/progress";
import { BookOpen, Brain, MessageCircle, PlayCircle, Target, Trophy } from "lucide-react";

type ActionGridProps = {
  intent: LearningProgress["intent"];
  onSetIntent: (intent: LearningProgress["intent"]) => void;
};

const intentOptions: Array<{
  id: LearningProgress["intent"];
  title: string;
  description: string;
  icon: typeof BookOpen;
}> = [
  {
    id: "learn",
    title: "Learn Concept",
    description: "Start with explanations and examples.",
    icon: BookOpen,
  },
  {
    id: "practice",
    title: "Do Practice",
    description: "Work through drills and worksheet tasks.",
    icon: Target,
  },
  {
    id: "quiz",
    title: "Take Quiz",
    description: "Test mastery and identify weak spots.",
    icon: Trophy,
  },
  {
    id: "test-prep",
    title: "Test-Prep Mode",
    description: "Focus on timed readiness and review.",
    icon: Brain,
  },
];

export function ActionGrid({ intent, onSetIntent }: ActionGridProps) {
  return (
    <section>
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">What do you need right now?</h2>
      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
        Pick your immediate goal and we will adjust recommendations.
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
        {intentOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onSetIntent(option.id)}
            className={`rounded-xl border p-4 text-left transition-all ${
              intent === option.id
                ? "border-[var(--theme-primary)] bg-[var(--theme-primary)]/10 dark:bg-[var(--theme-primary)]/20"
                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-500"
            }`}
          >
            <option.icon className="w-5 h-5 text-[var(--theme-primary)] mb-2" />
            <h3 className="font-semibold text-slate-900 dark:text-white">{option.title}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{option.description}</p>
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <Button size="sm" onClick={() => window.location.assign("/learn#ai-help")}>
          <Brain className="w-4 h-4" />
          Ask AI Tutor
        </Button>
        <Button size="sm" variant="outline" onClick={() => window.location.assign("/community")}>
          <MessageCircle className="w-4 h-4" />
          Get Community Help
        </Button>
        <Button size="sm" variant="ghost" onClick={() => window.location.assign("/resources#videos")}>
          <PlayCircle className="w-4 h-4" />
          Watch a Video
        </Button>
      </div>
    </section>
  );
}
