"use client";

import Link from "next/link";
import { communityEvents, studyGroupSpotlights } from "@/data/courses";
import { Card } from "@/components/Card";
import { useTranslations } from "@/components/LanguageProvider";
import { CalendarClock, Users } from "lucide-react";

type CommunitySpotlightProps = {
  studyGroupId?: string;
  discussionLabel?: string;
};

export function CommunitySpotlight({ studyGroupId, discussionLabel }: CommunitySpotlightProps) {
  const { t } = useTranslations();
  const orderedGroups = studyGroupId
    ? [
        ...studyGroupSpotlights.filter((group) => group.id === studyGroupId),
        ...studyGroupSpotlights.filter((group) => group.id !== studyGroupId),
      ]
    : studyGroupSpotlights;

  return (
    <Card>
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t("Community Spotlight")}</h2>
      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
        {t("Join a study group, drop into office hours, or ask peers for help.")}
      </p>

      {discussionLabel && (
        <div className="mt-3 rounded-lg border border-violet-200 dark:border-violet-800 bg-violet-50/70 dark:bg-violet-900/20 px-3 py-2 text-xs text-violet-700 dark:text-violet-300">
          {t("Topic thread:")} <span data-no-auto-translate="true">{discussionLabel}</span>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-3 mt-4">
        {orderedGroups.slice(0, 2).map((group) => (
          <Link
            key={group.id}
            href={group.href}
            className={`rounded-xl border p-4 hover:border-[var(--theme-primary)] transition-colors ${
              group.id === studyGroupId
                ? "border-[var(--theme-primary)] bg-[var(--theme-primary)]/10 dark:bg-[var(--theme-primary)]/20"
                : "border-slate-200 dark:border-slate-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[var(--theme-primary)]" />
              <h3 data-no-auto-translate="true" className="font-semibold text-slate-900 dark:text-white">{group.name}</h3>
            </div>
            <p data-no-auto-translate="true" className="text-sm text-slate-600 dark:text-slate-400 mt-1">{group.focus}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              {t("Next:")} <span data-no-auto-translate="true">{group.nextSession}</span> | {group.members} {t("members")}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-3 space-y-2">
        {communityEvents.map((event) => (
          <Link
            key={event.id}
            href={event.href}
            className="flex flex-col gap-2 rounded-lg bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-[var(--theme-primary)]" />
              <span data-no-auto-translate="true" className="text-sm text-slate-800 dark:text-slate-200">{event.title}</span>
            </div>
            <span data-no-auto-translate="true" className="text-xs text-slate-500 dark:text-slate-400">{event.startsAt}</span>
          </Link>
        ))}
      </div>
    </Card>
  );
}
