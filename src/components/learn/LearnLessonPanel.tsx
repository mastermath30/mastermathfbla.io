"use client";

import { useEffect } from "react";
import { BookOpen, CirclePlay, Lock, Sparkles, Trophy } from "lucide-react";
import { Button } from "@/components/Button";
import { PathNodeVM } from "@/components/learn/types";
import { useTranslations } from "@/components/LanguageProvider";

type LearnLessonPanelProps = {
  open: boolean;
  node: PathNodeVM | null;
  onClose: () => void;
  onLesson: () => void;
  onPractice: () => void;
  onQuiz: () => void;
  onAskAi: () => void;
  onGoNext: () => void;
};

export function LearnLessonPanel({
  open,
  node,
  onClose,
  onLesson,
  onPractice,
  onQuiz,
  onAskAi,
  onGoNext,
}: LearnLessonPanelProps) {
  const { t } = useTranslations();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);

  if (!node) return null;

  const locked = node.state === "locked";
  const showRecovery = node.state === "needs_review";
  const showNext = node.state === "mastered";

  return (
    <>
      {open && <button type="button" className="learn-panel-backdrop" onClick={onClose} aria-label={t("Close lesson panel")} />}
      <aside className={`learn-lesson-panel ${open ? "learn-lesson-panel-open" : ""}`} aria-hidden={!open}>
        <div className="learn-lesson-panel-header">
          <p className="learn-top-strip-label">{t("Lesson Panel")}</p>
          <h3 className="learn-lesson-panel-title">{node.title}</h3>
          <p className="learn-lesson-panel-subtitle">{node.estimatedMinutes} min • {node.unitTitle}</p>
        </div>

        <div className="learn-lesson-chip-row">
          <span className="learn-pill">{node.difficulty}</span>
          <span className="learn-pill">Mastery {node.masteryPercent}%</span>
          <span className="learn-pill">{node.state.replace("_", " ")}</span>
        </div>

        <p className="learn-lesson-goal">{node.masteryGoal}</p>

        <ul className="learn-lesson-signals">
          {node.readinessSignals.slice(0, 3).map((signal) => (
            <li key={signal}>{signal}</li>
          ))}
        </ul>

        {locked && (
          <div className="learn-lesson-lock-note">
            <Lock className="w-4 h-4" />
            <span>{node.lockedReason ?? t("Finish the previous topic to unlock this one.")}</span>
          </div>
        )}

        <div className="learn-lesson-actions">
          <Button onClick={onLesson} disabled={locked}>
            <BookOpen className="w-4 h-4" />
            {node.state === "in_progress" ? t("Continue Lesson") : t("Start Lesson")}
          </Button>
          <Button onClick={onPractice} variant="outline" disabled={locked}>
            <CirclePlay className="w-4 h-4" />
            Practice
          </Button>
          <Button onClick={onQuiz} variant="secondary" disabled={locked}>
            <Trophy className="w-4 h-4" />
            {showRecovery ? t("Recovery Quiz") : t("Take Quiz")}
          </Button>

          {showRecovery && (
            <Button onClick={onAskAi} variant="ghost">
              <Sparkles className="w-4 h-4" />
              {t("Ask AI Recovery Help")}
            </Button>
          )}

          {showNext && (
            <Button onClick={onGoNext} variant="ghost">
              {t("Go To Next Topic")}
            </Button>
          )}
        </div>
      </aside>
    </>
  );
}
