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
  const calculatorRef = useRef<{ destroy: () => void } | null>(null);

  // Load Desmos API script once on the client
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.Desmos) {
      setIsScriptLoaded(true);
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(
      'script[src^="https://www.desmos.com/api/v1.11/calculator.js"]'
    );
    if (existing) {
      existing.addEventListener("load", () => setIsScriptLoaded(true));
      existing.addEventListener("error", () =>
        setLoadError("Failed to load Desmos calculator.")
      );
      return;
    }

    const script = document.createElement("script");
    script.src =
      "https://www.desmos.com/api/v1.11/calculator.js?apiKey=4623762d63fa4908af685d51e6d03006";
    script.async = true;
    script.onload = () => setIsScriptLoaded(true);
    script.onerror = () => setLoadError("Failed to load Desmos calculator.");
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

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={
              isFullscreen
                ? "fixed inset-0 z-[101] flex items-center justify-center p-4 md:p-8 bg-black/40"
                : `fixed right-4 bottom-24 md:right-8 md:bottom-24 z-[101] ${wrapperWidthClass}`
            }
          >
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[90vh] w-full md:max-w-5xl">
              {/* Header */}
              <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700 bg-emerald-600">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-white" />
                    <span className="text-sm font-medium text-white">
                      {t("Graphing Calculator (Desmos)")}
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
              <div className="p-2 bg-slate-50 dark:bg-slate-900 flex-1 min-h-[260px] md:min-h-[360px]">
                {loadError && (
                  <div className="text-sm text-red-600 dark:text-red-400">
                    {loadError}
                  </div>
                )}
                {!loadError && !isScriptLoaded && (
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {t("Loading Desmos graphing calculator...")}
                  </div>
                )}
                <div
                  ref={containerRef}
                  className={`w-full ${containerHeightClass} bg-white dark:bg-slate-800 rounded-xl overflow-hidden`}
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
