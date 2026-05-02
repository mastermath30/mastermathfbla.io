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
        <div className="absolute left-[-10%] top-12 h-56 w-56 rounded-full blur-3xl opacity-40 dark:opacity-20" style={{ background: "var(--theme-primary)" }} />
        <div className="absolute right-[-8%] top-24 h-72 w-72 rounded-full blur-3xl opacity-20 dark:opacity-10" style={{ background: "var(--theme-primary-light)" }} />
      </div>

      <div
        className={`relative mx-auto grid w-full grid-cols-1 items-center gap-10 px-4 pb-12 pt-28 sm:px-6 md:pt-32 lg:grid-cols-[0.92fr_1.08fr] lg:gap-14 ${maxWidthClass}`}
      >
        <div className="max-w-2xl">
          {eyebrow ? (
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-sm font-semibold shadow-sm dark:bg-slate-900"
              style={{ borderColor: "var(--accent-border)", color: "var(--theme-primary)" }}>
              {Icon ? <Icon className="h-4 w-4" /> : null}
              {eyebrow}
            </p>
          ) : null}

          <h1 className="text-5xl font-semibold tracking-[-0.055em] text-slate-950 sm:text-6xl lg:text-7xl dark:text-white">
            <TypingText text={title} speedMs={60} showCursor={!highlight} />
            {highlight ? (
              <span className="block" style={{ color: "var(--theme-primary)" }}>
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
                    className="w-full rounded-full px-7 text-white shadow-sm hover:text-white sm:w-auto"
                    style={{ background: "var(--theme-primary)" }}
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
                    className="w-full rounded-full border-slate-300 bg-white px-7 text-slate-800 shadow-sm sm:w-auto dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 hover:border-[var(--theme-primary)] hover:text-[var(--theme-primary)]"
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
                <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--theme-primary)" }}>{visualEyebrow}</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-950 dark:text-white">{visualTitle}</h2>
              </div>
              <div className="rounded-full px-3 py-1 text-sm font-semibold"
                style={{ backgroundColor: "var(--accent-soft)", color: "var(--theme-primary)" }}>
                {visualProgress}
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              {visualItems.map((item, index) => (
                <div key={`${item.label}-${item.title}`} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${index === 0 ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : ""}`}
                    style={index !== 0 ? { backgroundColor: "var(--accent-soft)", color: "var(--theme-primary)" } : undefined}>
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
                <span style={{ color: "var(--theme-primary)" }}>{visualProgress}</span>
              </div>
              <div className="mt-4 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                <div className="h-2 rounded-full" style={{ width: visualProgress, backgroundColor: "var(--theme-primary)" }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
