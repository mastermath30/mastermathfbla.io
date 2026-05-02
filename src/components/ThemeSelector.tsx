"use client";

import { useState, useEffect, useRef } from "react";
import { Palette, Check, Sun, Moon, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage, LanguageCode, useTranslations } from "./LanguageProvider";
import { languages } from "@/lib/i18n";

function getStoredColorTheme() {
  if (typeof window === "undefined") return "indigo";
  return localStorage.getItem("mm_color_theme") || "indigo";
}

function getStoredDarkMode() {
  if (typeof window === "undefined") return true;
  const savedMode = localStorage.getItem("mm_dark_mode");
  return savedMode === null ? true : savedMode === "true";
}

export function ThemeSelector({ className = "" }: { className?: string }) {
  const { t } = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const [colorTheme, setColorTheme] = useState<string>(() => getStoredColorTheme());
  const [isDark, setIsDark] = useState(() => getStoredDarkMode());
  const containerRef = useRef<HTMLDivElement>(null);
  const { language, setLanguage } = useLanguage();
  
  const COLOR_THEMES = [
    { name: t("Indigo"), value: "indigo", color: "#4f46e5" },
    { name: t("Purple"), value: "violet", color: "#7c3aed" },
    { name: t("Teal"), value: "teal", color: "#0d9488" },
    { name: t("Green"), value: "green", color: "#16a34a" },
    { name: t("Orange"), value: "orange", color: "#ea580c" },
    { name: t("Rose"), value: "rose", color: "#e11d48" },
  ];

  const applyColorTheme = (colorName: string) => {
    document.documentElement.classList.remove(
      "theme-indigo", "theme-violet", "theme-teal", "theme-blue",
      "theme-green", "theme-red", "theme-rose", "theme-orange"
    );
    document.documentElement.classList.add(`theme-${colorName}`);
  };

  const applyDarkMode = (dark: boolean) => {
    if (dark) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      document.body.style.background = '#020617';
      document.body.style.color = '#f8fafc';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      document.body.style.background = '#f8fafc';
      document.body.style.color = '#0f172a';
    }
  };

  const applyColorblindMode = (enabled: boolean) => {
    if (enabled) {
      document.documentElement.classList.add("colorblind-mode");
      document.body.classList.add("colorblind-mode");
    } else {
      document.documentElement.classList.remove("colorblind-mode");
      document.body.classList.remove("colorblind-mode");
    }
  };

  useEffect(() => {
    const savedColor = getStoredColorTheme();
    const dark = getStoredDarkMode();
    const colorblindEnabled = localStorage.getItem("mm_colorblind_mode") === "true";
    applyColorTheme(savedColor);
    applyDarkMode(dark);
    applyColorblindMode(colorblindEnabled);
  }, []);

  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener("open-theme-selector", handler);
    return () => window.removeEventListener("open-theme-selector", handler);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const el = containerRef.current;
      if (!el) return;
      if (event.target instanceof Node && !el.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [isOpen]);

  const handleColorChange = (newColor: string) => {
    setColorTheme(newColor);
    localStorage.setItem("mm_color_theme", newColor);
    applyColorTheme(newColor);
  };

  const handleModeToggle = () => {
    const newMode = !isDark;
    setIsDark(newMode);
    localStorage.setItem("mm_dark_mode", String(newMode));
    applyDarkMode(newMode);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center gap-2 w-10 h-10 md:px-3 md:py-2 md:w-auto md:h-auto rounded-full bg-white/90 dark:bg-slate-950/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:scale-105"
      >
        <Palette className="w-5 h-5 md:w-4 md:h-4 text-slate-600 dark:text-slate-300" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-[100]" onClick={() => setIsOpen(false)} />
            <motion.div
              key={language}
              data-no-auto-translate="true"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="fixed left-4 right-4 bottom-auto top-1/2 -translate-y-1/2 md:absolute md:left-auto md:right-0 md:top-full md:bottom-auto md:translate-y-0 md:mt-2 w-auto md:w-80 bg-white dark:bg-slate-950 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 z-[101]"
            >
              <div className="p-3">
                {/* Dark/Light Mode Toggle */}
                <div className="mb-3">
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 px-2 py-1.5">{t("Appearance")}</div>
                  <div className="flex gap-2 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                    <button
                      onClick={() => { if (!isDark) handleModeToggle(); }}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                        isDark
                          ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-300"
                      }`}
                    >
                      <Moon className="w-4 h-4" />
                      {t("Dark")}
                    </button>
                    <button
                      onClick={() => { if (isDark) handleModeToggle(); }}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                        !isDark
                          ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-300"
                      }`}
                    >
                      <Sun className="w-4 h-4" />
                      {t("Light")}
                    </button>
                  </div>
                </div>

                {/* Color Theme */}
                <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 px-2 py-1.5">{t("Accent Color")}</div>
                  <div className="grid grid-cols-3 gap-2 px-1 sm:grid-cols-5">
                    {COLOR_THEMES.map((c) => {
                      const isSelected = colorTheme === c.value;
                      return (
                        <button
                          key={c.value}
                          onClick={() => handleColorChange(c.value)}
                          className="group relative flex min-h-[44px] flex-col items-center justify-start rounded-xl px-1 py-1"
                          title={c.name}
                        >
                          <div
                            className={`h-8 w-8 rounded-full transition-all ${
                              isSelected ? "ring-2 scale-105" : "hover:scale-105"
                            }`}
                            style={{ 
                              backgroundColor: c.color,
                              ...(isSelected && { '--tw-ring-color': c.color } as React.CSSProperties)
                            }}
                          >
                            {isSelected && (
                              <div className="w-full h-full flex items-center justify-center">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </div>
                          <span className="mt-1 text-center text-[10px] leading-tight text-slate-600 dark:text-slate-400">{c.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Language Selector */}
                <div className="border-t border-slate-200 dark:border-slate-700 pt-3" data-no-auto-translate="true">
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 px-2 py-1.5 flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    {t("Language")}
                  </div>
                  <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800 sm:grid-cols-3">
                    {languages.map((lang) => {
                      const isSelected = language === lang.code;
                      return (
                        <button
                          key={lang.code}
                          onClick={() => setLanguage(lang.code as LanguageCode)}
                          data-language-code={lang.code}
                          className={`w-full min-h-[40px] min-w-0 rounded-lg px-2 py-2 text-center text-xs font-medium leading-tight whitespace-normal break-words transition-all ${
                            isSelected
                              ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700"
                              : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-300"
                          }`}
                        >
                          {lang.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
