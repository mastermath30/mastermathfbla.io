"use client";

import { useEffect, useState } from "react";
import { Lightbulb, X } from "lucide-react";
import { Button } from "@/components/Button";
import { useTranslations } from "@/components/LanguageProvider";

const tips = [
  "When solving an equation, perform the same operation on both sides to keep it balanced.",
  "Before multiplying fractions, look for factors you can cancel to make the arithmetic easier.",
  "For a quick percentage check, remember that 10% is the number divided by 10.",
];

export function MathTip() {
  const { t } = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const openTip = () => setIsOpen(true);
    window.addEventListener("open-mathtip", openTip);
    return () => window.removeEventListener("open-mathtip", openTip);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label={t("Close")}
        className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="math-tip-title"
        className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
      >
        <button
          type="button"
          aria-label={t("Close")}
          onClick={() => setIsOpen(false)}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
          <Lightbulb className="h-6 w-6" />
        </div>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">{t("Math Tip of the Day")}</p>
        <p id="math-tip-title" className="mt-3 text-lg font-semibold leading-relaxed text-slate-900 dark:text-white">
          {tips[tipIndex]}
        </p>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button variant="outline" onClick={() => setTipIndex((index) => (index + 1) % tips.length)}>
            {t("Show another tip")}
          </Button>
          <Button onClick={() => setIsOpen(false)}>{t("Got it!")}</Button>
        </div>
      </section>
    </div>
  );
}
