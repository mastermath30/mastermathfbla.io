"use client";

import Link from "next/link";
import { Recommendation } from "@/lib/guidance";
import { Card } from "@/components/Card";
import { useTranslations } from "@/components/LanguageProvider";
import { ArrowRight, Brain, Lightbulb, PlayCircle, Target, Users } from "lucide-react";

type RecommendationPanelProps = {
  recommendations: Recommendation[];
  title?: string;
};

const kindIcon = {
  "next-best-action": Lightbulb,
  prerequisite: Target,
  practice: Target,
  quiz: PlayCircle,
  video: PlayCircle,
  "ai-help": Brain,
  community: Users,
};

export function RecommendationPanel({
  recommendations,
  title = "Recommended Next Steps",
}: RecommendationPanelProps) {
  const { t } = useTranslations();

  return (
    <Card className="h-full">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t(title)}</h2>
      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
        {t("Personalized from mastery progress, quiz performance, and current study intent.")}
      </p>

      <div className="space-y-3 mt-4">
        {recommendations.map((recommendation) => {
          const Icon = kindIcon[recommendation.kind];
          return (
            <Link
              key={recommendation.id}
              href={recommendation.href}
              className={`block rounded-xl border p-4 transition-colors ${
                recommendation.primary
                  ? "border-[var(--theme-primary)] bg-[var(--theme-primary)]/10 dark:bg-[var(--theme-primary)]/20"
                  : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-[var(--theme-primary)]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-[var(--theme-primary)]" />
                    <h3 className="font-semibold text-slate-900 dark:text-white">{recommendation.title}</h3>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{recommendation.reason}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                    {recommendation.primary && (
                      <span className="px-2 py-0.5 rounded-full bg-[var(--theme-primary)] text-white">
                        {t("Primary next step")}
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {recommendation.ctaLabel}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400">
                      {t("Confidence")} {Math.round(recommendation.confidence * 100)}%
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
              </div>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
