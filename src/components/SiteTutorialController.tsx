"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { useTranslations } from "@/components/LanguageProvider";
import {
  getLearningProgress,
  learningProgressEvent,
  setGlobalTutorialCompleted,
  setGlobalTutorialLastRoute,
  setGlobalTutorialStep,
} from "@/lib/progress";
import { Compass, HelpCircle, X } from "lucide-react";

const GLOBAL_TUTORIAL_PENDING_KEY = "mm_global_tutorial_pending_v1";

type TutorialStep = {
  title: string;
  description: string;
  route: string;
  focusArea: string;
};

export function SiteTutorialController() {
  const { t } = useTranslations();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(() => getLearningProgress());
  const [step, setStep] = useState(() => getLearningProgress().globalTutorialStep || 0);
  const tutorialSteps: TutorialStep[] = [
    {
      title: t("Home Orientation"),
      description: t("This is your command center. Start learning, check progress, or jump to help in one click."),
      route: "/",
      focusArea: t("Home hero and main actions"),
    },
    {
      title: t("Choose Your Class"),
      description: t("Pick your class in Learn to unlock the right unit and topic sequence."),
      route: "/learn",
      focusArea: t("Learn path panel"),
    },
    {
      title: t("Pick Topic + Action"),
      description: t("Choose one topic, then choose one action right now: concept, practice, quiz, AI, or community."),
      route: "/learn",
      focusArea: t("Topic workspace and action picker"),
    },
    {
      title: t("Track Progress"),
      description: t("Use Dashboard to see what is improving and what needs targeted review."),
      route: "/dashboard",
      focusArea: t("Dashboard recommendations and progress"),
    },
    {
      title: t("Get Community Support"),
      description: t("When you get stuck, join peer discussions, study groups, or office hours from Community."),
      route: "/community",
      focusArea: t("Community help entry points"),
    },
  ];

  useEffect(() => {
    const syncFromProgress = () => {
      const next = getLearningProgress();
      setProgress(next);
      setStep(next.globalTutorialStep || 0);
    };

    syncFromProgress();
    window.addEventListener(learningProgressEvent, syncFromProgress);
    return () => window.removeEventListener(learningProgressEvent, syncFromProgress);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const pending = window.localStorage.getItem(GLOBAL_TUTORIAL_PENDING_KEY) === "true";
    if (pending && !progress.globalTutorialCompleted) {
      startTutorial();
    }
    // We only need to check at mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clampStep = (value: number) => Math.min(Math.max(value, 0), tutorialSteps.length - 1);
  const currentStepIndex = clampStep(step);
  const currentStep = tutorialSteps[currentStepIndex];
  const onTargetRoute = pathname === currentStep.route;

  const startTutorial = () => {
    const firstStep = tutorialSteps[0];
    setGlobalTutorialCompleted(false);
    setGlobalTutorialStep(0);
    setGlobalTutorialLastRoute(firstStep.route);
    setStep(0);
    setOpen(true);
    router.push(firstStep.route);
  };

  // Allow external triggers (e.g. Navbar mobile menu) to start the tutorial
  useEffect(() => {
    const handler = () => startTutorial();
    window.addEventListener("open-tutorial", handler);
    return () => window.removeEventListener("open-tutorial", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const closeAndComplete = () => {
    setGlobalTutorialCompleted(true);
    setGlobalTutorialStep(0);
    setGlobalTutorialLastRoute(null);
    setOpen(false);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(GLOBAL_TUTORIAL_PENDING_KEY, "false");
    }
  };

  const goToStep = (nextStep: number) => {
    const safeStep = clampStep(nextStep);
    const nextRoute = tutorialSteps[safeStep].route;
    setGlobalTutorialStep(safeStep);
    setGlobalTutorialLastRoute(nextRoute);
    setStep(safeStep);
    router.push(nextRoute);
  };

  const handleNext = () => {
    if (currentStepIndex >= tutorialSteps.length - 1) {
      closeAndComplete();
      return;
    }
    goToStep(currentStepIndex + 1);
  };

  const handleBack = () => {
    if (currentStepIndex === 0) return;
    goToStep(currentStepIndex - 1);
  };

  return (
    <>
      <button
        type="button"
        onClick={startTutorial}
        className="hidden md:flex fixed right-0 top-1/2 -translate-y-1/2 z-[92] rounded-l-xl border border-r-0 border-slate-300 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 px-3 py-3 shadow-lg items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        aria-label={t("Open website tutorial")}
      >
        <HelpCircle className="w-4 h-4 text-[var(--theme-primary)]" />
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{t("Tutorial")}</span>
      </button>

      {/* Mobile tutorial access is via the Navbar bottom sheet */}

      {open && (
        <div className="fixed inset-0 z-[160]">
          <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-sm" />
          <div className="relative h-full w-full flex items-center justify-center p-4">
            <Card className="w-full max-w-xl border-[var(--theme-primary)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {t("Website Tour")}
                  </p>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">{currentStep.title}</h3>
                </div>
                <button
                  type="button"
                  onClick={closeAndComplete}
                  className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
                  aria-label={t("Close tutorial")}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300 mt-3">{currentStep.description}</p>
              <div className="mt-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <Compass className="w-3.5 h-3.5 text-[var(--theme-primary)]" />
                  <span>{t("Focus")}: {currentStep.focusArea}</span>
                </div>
                {!onTargetRoute && (
                  <div className="mt-1 text-[var(--theme-primary)]">
                    {t("Navigating to")} {currentStep.route}
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {currentStepIndex + 1}/{tutorialSteps.length}
                </span>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" onClick={closeAndComplete}>
                    {t("Skip for now")}
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleBack} disabled={currentStepIndex === 0}>
                    {t("Back")}
                  </Button>
                  <Button size="sm" onClick={handleNext}>
                    {currentStepIndex === tutorialSteps.length - 1 ? t("Finish tutorial") : t("Next")}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
