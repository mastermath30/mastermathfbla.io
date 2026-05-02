"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/Button";
import { TypingText } from "@/components/motion";

type PageHeroAction = {
  label: string;
  href: string;
};

type PageHeroStat = {
  value: string;
  label: string;
};

type PageHeroItem = {
  label: string;
  title: string;
  meta: string;
};

type PageHeroProps = {
  eyebrow?: string;
  title: string;
  highlight?: string;
  description?: string;
  icon?: LucideIcon;
  primaryAction?: PageHeroAction;
  secondaryAction?: PageHeroAction;
  actions?: ReactNode;
  stats?: PageHeroStat[];
  visualTitle: string;
  visualEyebrow: string;
  visualProgress?: string;
  visualItems: PageHeroItem[];
  /** Applied to the inner content grid (default matches other marketing pages). */
  maxWidthClass?: string;
  /** Size for the auto-generated primaryAction / secondaryAction buttons. Default "lg". */
  buttonSize?: "sm" | "md" | "lg";
  className?: string;
};

export function PageHero({
  eyebrow,
  title,
  highlight,
  description,
  icon: Icon,
  primaryAction,
  secondaryAction,
  actions,
  stats = [],
  visualTitle,
  visualEyebrow,
  visualProgress = "68%",
  visualItems,
  maxWidthClass = "max-w-7xl",
  buttonSize = "lg",
  className = "",
}: PageHeroProps) {
  return (
    <section className={`relative overflow-hidden px-safe ${className}`}>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-12 h-56 w-56 rounded-full bg-indigo-200/45 blur-3xl dark:bg-indigo-950/35" />
        <div className="absolute right-[-8%] top-24 h-72 w-72 rounded-full bg-blue-200/35 blur-3xl dark:bg-blue-950/25" />
      </div>

      <div
        className={`relative mx-auto grid w-full grid-cols-1 items-center gap-10 px-4 pb-12 pt-28 sm:px-6 md:pt-32 lg:grid-cols-[0.92fr_1.08fr] lg:gap-14 ${maxWidthClass}`}
      >
        <div className="max-w-2xl">
          {eyebrow ? (
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-4 py-2 text-sm font-semibold text-indigo-700 shadow-sm dark:border-indigo-900/60 dark:bg-slate-900 dark:text-indigo-300">
              {Icon ? <Icon className="h-4 w-4" /> : null}
              {eyebrow}
            </p>
          ) : null}

          <h1 className="text-5xl font-semibold tracking-[-0.055em] text-slate-950 sm:text-6xl lg:text-7xl dark:text-white">
            <TypingText text={title} speedMs={60} showCursor={!highlight} />
            {highlight ? (
              <span className="block text-indigo-700 dark:text-indigo-300">
                <TypingText text={highlight} speedMs={60} delayMs={title.length * 60 + 150} />
              </span>
            ) : null}
          </h1>

          {description ? (
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600 sm:text-xl dark:text-slate-300">{description}</p>
          ) : null}

          {(primaryAction || secondaryAction || actions) && (
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {actions}
              {primaryAction && (
                <Link href={primaryAction.href} className="w-full sm:w-auto">
                  <Button
                    variant="ghost"
                    size={buttonSize}
                    className="w-full rounded-full bg-indigo-600 px-7 text-white shadow-sm hover:bg-indigo-700 hover:text-white sm:w-auto"
                  >
                    {primaryAction.label}
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              )}
              {secondaryAction && (
                <Link href={secondaryAction.href} className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size={buttonSize}
                    className="w-full rounded-full border-slate-300 bg-white px-7 text-slate-800 shadow-sm hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 sm:w-auto dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  >
                    {secondaryAction.label}
                  </Button>
                </Link>
              )}
            </div>
          )}

          {stats.length > 0 && (
            <div className="mt-10 grid max-w-xl grid-cols-2 gap-4 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">{stat.value}</div>
                  <div className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-[0_24px_70px_rgba(15,23,42,0.12)] dark:border-slate-800 dark:bg-slate-900">
          <div className="rounded-[1.5rem] border border-slate-200 bg-[#fbfaf6] p-5 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-300">{visualEyebrow}</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-950 dark:text-white">{visualTitle}</h2>
              </div>
              <div className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                {visualProgress}
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              {visualItems.map((item, index) => (
                <div key={`${item.label}-${item.title}`} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${index === 0 ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"}`}>
                    {index === 0 ? <CheckCircle2 className="h-5 w-5" /> : index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{item.label}</p>
                    <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">{item.title}</p>
                  </div>
                  <span className="hidden rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 sm:inline dark:bg-slate-800 dark:text-slate-300">{item.meta}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between text-sm font-semibold text-slate-950 dark:text-white">
                <span>{visualTitle}</span>
                <span className="text-indigo-700 dark:text-indigo-300">{visualProgress}</span>
              </div>
              <div className="mt-4 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                <div className="h-2 rounded-full bg-indigo-600" style={{ width: visualProgress }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
