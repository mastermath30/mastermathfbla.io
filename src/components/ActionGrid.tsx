"use client";

import { Button } from "@/components/Button";
import { useTranslations } from "@/components/LanguageProvider";
import { LearningProgress } from "@/lib/progress";
import { BookOpen, Brain, MessageCircle, PlayCircle, Target, Trophy } from "lucide-react";

type ActionGridProps = {
  intent: LearningProgress["intent"];
  onSetIntent: (intent: LearningProgress["intent"]) => void;
  onQuickAction?: (action: "ask-ai" | "community-help" | "watch-video") => void;
  showHeader?: boolean;
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

export function ActionGrid({ intent, onSetIntent, onQuickAction, showHeader = true }: ActionGridProps) {
  const { t } = useTranslations();

  return (
    <section>
      {showHeader && (
        <>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t("What do you need right now?")}</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {t("Choose one action and follow through before switching context.")}
          </p>
        </>
      )}

      <div className={`grid sm:grid-cols-2 lg:grid-cols-4 gap-3 ${showHeader ? "mt-4" : "mt-1"}`}>
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
            <h3 className="font-semibold text-slate-900 dark:text-white">{t(option.title)}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{t(option.description)}</p>
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <Button size="sm" onClick={() => onQuickAction?.("ask-ai")}>
          <Brain className="w-4 h-4" />
          {t("Ask AI Tutor")}
        </Button>
        <Button size="sm" variant="outline" onClick={() => onQuickAction?.("community-help")}>
          <MessageCircle className="w-4 h-4" />
          {t("Get Community Help")}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onQuickAction?.("watch-video")}>
          <PlayCircle className="w-4 h-4" />
          {t("Watch a Video")}
        </Button>
      </div>
    </section>
  );
}
