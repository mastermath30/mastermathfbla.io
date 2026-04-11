"use client";

import Link from "next/link";
import { Recommendation } from "@/lib/guidance";
import { Card } from "@/components/Card";
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
  return (
    <Card className="h-full">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
        Personalized from your course, topic focus, and recent activity.
      </p>

      <div className="space-y-3 mt-4">
        {recommendations.map((recommendation) => {
          const Icon = kindIcon[recommendation.kind];
          return (
            <Link
              key={recommendation.id}
              href={recommendation.href}
              className="block rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 hover:border-[var(--theme-primary)] transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-[var(--theme-primary)]" />
                    <h3 className="font-semibold text-slate-900 dark:text-white">{recommendation.title}</h3>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{recommendation.reason}</p>
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
