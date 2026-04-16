"use client";

import { Bolt, Flame, Target } from "lucide-react";
import { Button } from "@/components/Button";
import { useTranslations } from "@/components/LanguageProvider";

type LearnTopStripProps = {
  topicTitle: string;
  xpToday: number;
  xpToNext: number;
  level: number;
  streak: number;
  primaryActionLabel: string;
  onPrimaryAction: () => void;
};

export function LearnTopStrip({
  topicTitle,
  xpToday,
  xpToNext,
  level,
  streak,
  primaryActionLabel,
  onPrimaryAction,
}: LearnTopStripProps) {
  const { t } = useTranslations();
  const progressPct = Math.max(0, Math.min(100, Math.round((xpToday / 100) * 100)));

  return (
    <div className="learn-top-strip sticky top-20 md:top-24 z-30">
      <div className="learn-top-strip-inner">
        <div>
          <p className="learn-top-strip-label">{t("Current Mission")}</p>
          <p className="learn-top-strip-title">{topicTitle}</p>
        </div>

        <div className="learn-top-strip-stats">
          <div className="learn-pill">
            <Bolt className="w-4 h-4" />
            <span suppressHydrationWarning>Level {level}</span>
          </div>
          <div className="learn-pill">
            <Flame className="w-4 h-4" />
            <span suppressHydrationWarning>{streak} {t("day streak")}</span>
          </div>
          <div className="learn-pill">
            <Target className="w-4 h-4" />
            <span suppressHydrationWarning>{xpToNext} {t("XP to next")}</span>
          </div>
        </div>

        <div className="learn-top-strip-progress" aria-label={t("XP progress")}>
          <div className="learn-top-strip-track">
            <div className="learn-top-strip-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <span className="learn-top-strip-xp" suppressHydrationWarning>{xpToday}/100 {t("XP today")}</span>
        </div>

        <Button onClick={onPrimaryAction} size="sm">
          {primaryActionLabel}
        </Button>
      </div>
    </div>
  );
}
