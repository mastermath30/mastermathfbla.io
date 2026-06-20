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
    <Card className="overflow-hidden">
      <div className="-mx-6 -mt-6 mb-5 rounded-t-[inherit] border-b border-slate-200 bg-slate-50 px-6 py-5 dark:border-slate-800 dark:bg-slate-900/80">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t("Community Spotlight")}</h2>
      <p className="text-sm text-slate-600 dark:text-white mt-1">
        {t("Join a study group, drop into office hours, or ask peers for help.")}
      </p>
      </div>

      {discussionLabel && (
        <div className="mt-3 rounded-2xl border border-[var(--accent-border)] bg-[var(--accent-soft)] px-3 py-2 text-xs text-[var(--theme-primary)] dark:text-[var(--theme-primary-light)]">
          {t("Topic thread:")} <span>{discussionLabel}</span>
        </div>
      )}

      <div className="mt-4 space-y-3">
        {orderedGroups.slice(0, 2).map((group) => (
          <Link
            key={group.id}
            href={group.href}
            className={`block rounded-2xl border p-4 transition-all hover:-translate-y-px hover:border-[var(--theme-primary)] hover:shadow-sm ${
              group.id === studyGroupId
                ? "border-[var(--theme-primary)] bg-[var(--theme-primary)]/10 dark:bg-[var(--theme-primary)]/20"
                : "border-slate-200 dark:border-slate-700"
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="mm-icon-tile h-9 w-9 shrink-0">
                <Users className="w-4 h-4" />
              </span>
              <div className="min-w-0">
                <h3 className="font-semibold leading-tight text-slate-900 dark:text-white">{group.name}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-white">{group.focus}</p>
              </div>
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500 dark:text-white">
              {t("Next:")} <span>{group.nextSession}</span> | {group.members} {t("members")}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-3 space-y-2">
        {communityEvents.map((event) => (
          <Link
            key={event.id}
            href={event.href}
            className="grid grid-cols-[minmax(0,1fr)_7.25rem] items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 transition hover:border-[var(--theme-primary)] dark:border-slate-700 dark:bg-slate-900/70"
          >
            <div className="flex min-w-0 items-center gap-2">
              <CalendarClock className="w-4 h-4 text-[var(--theme-primary)]" />
              <span className="text-sm leading-5 text-slate-800 dark:text-slate-200">{event.title}</span>
            </div>
            <span className="min-w-[7.25rem] rounded-full bg-white px-2.5 py-1 text-center text-xs font-semibold leading-4 text-slate-600 dark:bg-slate-950 dark:text-slate-300">{event.startsAt}</span>
          </Link>
        ))}
      </div>
    </Card>
  );
}
