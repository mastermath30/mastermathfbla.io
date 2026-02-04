"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Focus, X, Minus, Plus, Moon, Sun, Eye, EyeOff } from "lucide-react";

export function ReadingMode() {
  const [isActive, setIsActive] = useState(false);
  const [fontSize, setFontSize] = useState(110);
  const [isDimmed, setIsDimmed] = useState(true);
  const [hideImages, setHideImages] = useState(false);

  // Keyboard shortcut: Alt + F to toggle
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.altKey && e.key.toLowerCase() === "f") {
      e.preventDefault();
      setIsActive((prev) => !prev);
    }
    if (e.key === "Escape" && isActive) {
      setIsActive(false);
    }
  }, [isActive]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Apply focus mode styles to the page
  useEffect(() => {
    const root = document.documentElement;
    const main = document.getElementById("main-content");
    
    if (isActive) {
      root.classList.add("focus-reading-active");
      root.style.setProperty("--focus-font-size", `${fontSize}%`);
      
      if (isDimmed) {
        root.classList.add("focus-dimmed");
      } else {
        root.classList.remove("focus-dimmed");
      }
      
      if (hideImages) {
        root.classList.add("focus-hide-images");
      } else {
        root.classList.remove("focus-hide-images");
      }
      
      // Scroll main content into view
      if (main) {
        main.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      root.classList.remove("focus-reading-active", "focus-dimmed", "focus-hide-images");
      root.style.removeProperty("--focus-font-size");
    }
    
    return () => {
      root.classList.remove("focus-reading-active", "focus-dimmed", "focus-hide-images");
      root.style.removeProperty("--focus-font-size");
    };
  }, [isActive, fontSize, isDimmed, hideImages]);

  return (
    <>
      {/* Focus Mode Toggle Button - positioned next to lightbulb */}
      <button
        onClick={() => setIsActive(!isActive)}
        className={`fixed bottom-24 md:bottom-6 left-[10rem] z-[89] w-14 h-14 rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          isActive 
            ? "bg-[var(--theme-primary)] ring-2 ring-[var(--theme-primary)] ring-offset-2" 
            : "bg-gradient-to-br from-indigo-500 to-purple-600 focus:ring-indigo-400"
        }`}
        aria-label={isActive ? "Exit focus mode" : "Enter focus mode"}
        title="Focus Reading Mode (Alt+F)"
      >
        <Focus className="w-6 h-6 text-white" />
      </button>

      {/* Focus Mode Control Bar */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-40 md:bottom-20 left-4 z-[200]"
          >
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-4 w-64">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Focus className="w-5 h-5" style={{ color: "var(--theme-primary)" }} />
                  <span className="font-semibold text-slate-900 dark:text-white">Focus Mode</span>
                </div>
                <button
                  onClick={() => setIsActive(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Font Size */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Text Size</span>
                  <span className="font-medium text-slate-900 dark:text-white">{fontSize}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFontSize((s) => Math.max(90, s - 10))}
                    className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all"
                      style={{ 
                        width: `${((fontSize - 90) / 60) * 100}%`,
                        background: "linear-gradient(90deg, var(--theme-primary), var(--theme-primary-light))"
                      }}
                    />
                  </div>
                  <button
                    onClick={() => setFontSize((s) => Math.min(150, s + 10))}
                    className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Toggle Options */}
              <div className="space-y-2">
                <button
                  onClick={() => setIsDimmed(!isDimmed)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                    isDimmed
                      ? "border-[var(--theme-primary)] bg-[color-mix(in_srgb,var(--theme-primary)_10%,transparent)]"
                      : "border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isDimmed ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                    <span className="text-sm font-medium">Dim Surroundings</span>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    isDimmed ? "bg-[var(--theme-primary)] border-[var(--theme-primary)]" : "border-slate-300"
                  }`} />
                </button>

                <button
                  onClick={() => setHideImages(!hideImages)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                    hideImages
                      ? "border-[var(--theme-primary)] bg-[color-mix(in_srgb,var(--theme-primary)_10%,transparent)]"
                      : "border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {hideImages ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    <span className="text-sm font-medium">Hide Images</span>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    hideImages ? "bg-[var(--theme-primary)] border-[var(--theme-primary)]" : "border-slate-300"
                  }`} />
                </button>
              </div>

              {/* Keyboard hint */}
              <div className="text-center text-xs text-slate-500">
                Press <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs">Esc</kbd> to exit
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}