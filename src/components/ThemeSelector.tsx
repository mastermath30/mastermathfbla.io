"use client";

import { useState, useEffect, useRef } from "react";
import { Palette, Check, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const COLOR_THEMES = [
  { name: "Violet", value: "violet", color: "#7c3aed" },
  { name: "Blue", value: "blue", color: "#2563eb" },
  { name: "Green", value: "green", color: "#16a34a" },
  { name: "Red", value: "red", color: "#dc2626" },
  { name: "Orange", value: "orange", color: "#ea580c" },
];

export function ThemeSelector({ className = "" }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [colorTheme, setColorTheme] = useState("violet");
  const [isDark, setIsDark] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const applyColorTheme = (colorName: string) => {
    // Remove all color theme classes
    document.documentElement.classList.remove(
      "theme-violet", "theme-blue", "theme-green", "theme-red", "theme-orange"
    );
    // Add the new color theme class
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

  useEffect(() => {
    const savedColor = localStorage.getItem("mm_color_theme") || "violet";
    const savedMode = localStorage.getItem("mm_dark_mode");
    const dark = savedMode === null ? true : savedMode === "true";
    
    setColorTheme(savedColor);
    setIsDark(dark);
    applyColorTheme(savedColor);
    applyDarkMode(dark);
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
        className="flex items-center gap-2 px-3 py-2 rounded-full bg-slate-800/90 dark:bg-slate-800/90 light:bg-white/90 backdrop-blur-sm border border-slate-700 dark:border-slate-700 hover:bg-slate-700 dark:hover:bg-slate-700 transition-all shadow-sm"
      >
        <Palette className="w-4 h-4 text-slate-300 dark:text-slate-300" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50"
            >
              <div className="p-3">
                {/* Dark/Light Mode Toggle */}
                <div className="mb-3">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 px-2 py-1.5">Appearance</div>
                  <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
                    <button
                      onClick={() => { if (!isDark) handleModeToggle(); }}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                        isDark
                          ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                      }`}
                    >
                      <Moon className="w-4 h-4" />
                      Dark
                    </button>
                    <button
                      onClick={() => { if (isDark) handleModeToggle(); }}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                        !isDark
                          ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                      }`}
                    >
                      <Sun className="w-4 h-4" />
                      Light
                    </button>
                  </div>
                </div>

                {/* Color Theme */}
                <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 px-2 py-1.5">Accent Color</div>
                  <div className="grid grid-cols-5 gap-2 px-1">
                    {COLOR_THEMES.map((c) => {
                      const isSelected = colorTheme === c.value;
                      return (
                        <button
                          key={c.value}
                          onClick={() => handleColorChange(c.value)}
                          className="group relative flex flex-col items-center"
                          title={c.name}
                        >
                          <div
                            className={`w-8 h-8 rounded-full transition-all ${
                              isSelected ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-800 scale-110' : 'hover:scale-110'
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
                          <span className="text-[10px] mt-1 text-slate-500 dark:text-slate-400">{c.name}</span>
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
