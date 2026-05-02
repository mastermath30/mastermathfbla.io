"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, X } from "lucide-react";
import { useTranslations } from "./LanguageProvider";

declare global {
  interface Window {
    Desmos?: {
      GraphingCalculator: (elt: HTMLElement, options?: Record<string, unknown>) => {
        destroy: () => void;
        resize?: () => void;
      };
    };
  }
}

export function QuickCalculator() {
  const { t } = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [size, setSize] = useState<"sm" | "md" | "lg">("md");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const calculatorRef = useRef<{ destroy: () => void; resize?: () => void } | null>(null);

  // Load Desmos API script once on the client
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.Desmos) {
      const timer = window.setTimeout(() => setIsScriptLoaded(true), 0);
      return () => window.clearTimeout(timer);
    }

    const existing = document.querySelector<HTMLScriptElement>(
      'script[src^="https://www.desmos.com/api/v1.11/calculator.js"]'
    );
    if (existing) {
      existing.addEventListener("load", () => setIsScriptLoaded(true));
      existing.addEventListener("error", () =>
        setLoadError("Failed to load Graphing Calculator.")
      );
      return;
    }

    const script = document.createElement("script");
    script.src =
      "https://www.desmos.com/api/v1.11/calculator.js?apiKey=4623762d63fa4908af685d51e6d03006";
    script.async = true;
    script.onload = () => setIsScriptLoaded(true);
    script.onerror = () => setLoadError("Failed to load Graphing Calculator.");
    document.body.appendChild(script);
  }, []);

  // Global keyboard shortcut: Alt + C toggles the Desmos calculator
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === "c") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        setIsOpen(false);
        setIsFullscreen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Allow other components to open the calculator via custom event
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-calculator", handleOpen as EventListener);
    return () => window.removeEventListener("open-calculator", handleOpen as EventListener);
  }, []);

  // Initialize / destroy Desmos instance when modal is open
  useEffect(() => {
    if (!isOpen || !isScriptLoaded || !containerRef.current || !window.Desmos) return;

    if (!calculatorRef.current) {
      calculatorRef.current = window.Desmos.GraphingCalculator(containerRef.current, {
        expressions: true,
        keypad: true,
      });
    }

    return () => {
      if (calculatorRef.current) {
        calculatorRef.current.destroy();
        calculatorRef.current = null;
      }
    };
  }, [isOpen, isScriptLoaded]);

  useEffect(() => {
    if (!isOpen || !calculatorRef.current) return;

    const resizeCalculator = () => {
      calculatorRef.current?.resize?.();
    };

    const frameId = window.requestAnimationFrame(resizeCalculator);
    const timeoutId = window.setTimeout(resizeCalculator, 180);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(timeoutId);
    };
  }, [isOpen, isFullscreen, size]);

  useEffect(() => {
    if (!isOpen || !containerRef.current || !calculatorRef.current?.resize || typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(() => {
      calculatorRef.current?.resize?.();
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [isOpen, isFullscreen]);

  const wrapperWidthClass =
    size === "sm"
      ? "w-[320px] md:w-[480px]"
      : size === "lg"
      ? "w-[420px] md:w-[800px]"
      : "w-[360px] md:w-[640px]";

  const containerHeightClass =
    size === "sm"
      ? "h-[220px] md:h-[300px]"
      : size === "lg"
      ? "h-[320px] md:h-[480px]"
      : "h-[260px] md:h-[360px]";

  const wrapperClassName = isFullscreen
    ? "fixed inset-0 z-[101] bg-black/60 p-0 md:p-2"
    : `fixed bottom-24 right-4 z-[101] ${wrapperWidthClass} md:bottom-24 md:right-8`;

  const panelClassName = isFullscreen
    ? "flex h-full w-full flex-col overflow-hidden border-0 bg-white shadow-none dark:bg-slate-900 md:rounded-[28px] md:border md:border-slate-200 md:shadow-2xl md:dark:border-slate-700"
    : "flex w-full max-h-[90vh] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900";

  const bodyClassName = isFullscreen
    ? "flex min-h-0 flex-1 flex-col bg-slate-50 p-3 dark:bg-slate-900 md:p-4"
    : "flex min-h-[260px] flex-1 flex-col bg-slate-50 p-2 dark:bg-slate-900 md:min-h-[360px]";

  const graphClassName = isFullscreen
    ? "h-full min-h-0 w-full flex-1 overflow-hidden rounded-2xl bg-white dark:bg-slate-800"
    : `w-full ${containerHeightClass} overflow-hidden rounded-xl bg-white dark:bg-slate-800`;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={wrapperClassName}
          >
            <div className={panelClassName}>
              {/* Header */}
              <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700 bg-emerald-600">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-white" />
                    <span className="text-sm font-medium text-white">
                      {t("Graphing Calculator")}
                    </span>
                  </div>
                  {!isFullscreen && (
                    <div className="hidden md:flex items-center gap-1 rounded-full bg-white/10 px-1 py-0.5">
                    {[
                      { id: "sm" as const, label: "S" },
                      { id: "md" as const, label: "M" },
                      { id: "lg" as const, label: "L" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setSize(opt.id)}
                        className={`px-2 py-0.5 text-[10px] rounded-full border transition-colors ${
                          size === opt.id
                            ? "bg-white text-emerald-700 border-white"
                            : "bg-transparent text-white/80 border-white/30 hover:bg-white/15"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsFullscreen((prev) => !prev)}
                    className="hidden md:inline-flex px-2 py-1 rounded text-[10px] font-medium bg-white/15 text-white hover:bg-white/25"
                  >
                    {isFullscreen ? t("Exit Fullscreen") : t("Fullscreen")}
                  </button>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setIsFullscreen(false);
                    }}
                    className="p-1 rounded hover:bg-white/20 text-white/80 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Body: Desmos container or status */}
              <div className={bodyClassName}>
                {loadError && (
                  <div className="text-sm text-red-600 dark:text-red-400">
                    {loadError}
                  </div>
                )}
                {!loadError && !isScriptLoaded && (
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {t("Loading Graphing Calculator...")}
                  </div>
                )}
                <div
                  ref={containerRef}
                  className={graphClassName}
                />
              </div>

              {/* Keyboard hint */}
              <div className="px-4 py-2 text-center text-xs text-slate-400 dark:text-slate-500 border-t border-slate-200 dark:border-slate-700">
                {t("Press Esc to close")} • Alt+C
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
