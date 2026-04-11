"use client";

import Link from "next/link";
import { communityEvents, studyGroupSpotlights } from "@/data/courses";
import { Card } from "@/components/Card";
import { CalendarClock, Users } from "lucide-react";

export function CommunitySpotlight() {
  return (
    <Card>
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">Community Spotlight</h2>
      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
        Join a study group, drop into office hours, or ask peers for help.
      </p>

      <div className="grid lg:grid-cols-2 gap-3 mt-4">
        {studyGroupSpotlights.slice(0, 2).map((group) => (
          <Link
            key={group.id}
            href={group.href}
            className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:border-[var(--theme-primary)] transition-colors"
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[var(--theme-primary)]" />
              <h3 className="font-semibold text-slate-900 dark:text-white">{group.name}</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{group.focus}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Next: {group.nextSession} | {group.members} members
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-3 space-y-2">
        {communityEvents.map((event) => (
          <Link
            key={event.id}
            href={event.href}
            className="flex items-center justify-between rounded-lg bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 px-3 py-2"
          >
            <div className="flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-[var(--theme-primary)]" />
              <span className="text-sm text-slate-800 dark:text-slate-200">{event.title}</span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">{event.startsAt}</span>
          </Link>
        ))}
      </div>
    </Card>
  );
}
