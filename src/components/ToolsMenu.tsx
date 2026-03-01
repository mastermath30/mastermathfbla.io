"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wrench, X, Focus, ArrowRightLeft, StickyNote, Calculator, BookOpen, Timer } from "lucide-react";
import { useTranslations } from "./LanguageProvider";

interface Tool {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  shortcut: string;
}

// Tool definitions (names will be translated in component)
const getTools = (t: (key: string) => string): Tool[] => [
  {
    id: "focus",
    name: t("Focus Mode"),
    icon: <Focus className="w-5 h-5" />,
    color: "from-indigo-500 to-purple-600",
    shortcut: "Alt+F",
  },
  {
    id: "converter",
    name: t("Unit Converter"),
    icon: <ArrowRightLeft className="w-5 h-5" />,
    color: "from-cyan-500 to-blue-600",
    shortcut: "Alt+U",
  },
  {
    id: "notes",
    name: t("Quick Notes"),
    icon: <StickyNote className="w-5 h-5" />,
    color: "from-yellow-400 to-amber-500",
    shortcut: "Alt+N",
  },
  {
    id: "calculator",
    name: t("Calculator"),
    icon: <Calculator className="w-5 h-5" />,
    color: "from-emerald-500 to-teal-600",
    shortcut: "Alt+C",
  },
  {
    id: "formulas",
    name: t("Formula Reference"),
    icon: <BookOpen className="w-5 h-5" />,
    color: "from-violet-500 to-purple-600",
    shortcut: "Alt+R",
  },
  {
    id: "timer",
    name: t("Pomodoro Timer"),
    icon: <Timer className="w-5 h-5" />,
    color: "from-rose-500 to-orange-500",
    shortcut: "Alt+T",
  },
];

export function ToolsMenu() {
  const { t } = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  
  const tools = getTools(t);

  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener("open-tools", handler);
    return () => window.removeEventListener("open-tools", handler);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".tools-menu-container")) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("click", handleClick);
      return () => document.removeEventListener("click", handleClick);
    }
  }, [isOpen]);

  const openTool = (toolId: string) => {
    setActiveTool(toolId);
    setIsOpen(false);
  };

  return (
    <>
      {/* Desktop Tools Menu Button */}
      <div className="tools-menu-container hidden md:block fixed bottom-6 left-[10rem] z-[89]">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex w-14 h-14 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 shadow-xl items-center justify-center hover:scale-110 active:scale-95 transition-transform focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 touch-manipulation ${
            isOpen ? "ring-2 ring-white/50" : ""
          }`}
          aria-label="Open tools menu"
          title="Tools Menu"
          whileTap={{ scale: 0.95 }}
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <motion.div
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <Wrench className="w-6 h-6 text-white" />
          </motion.div>
        </motion.button>

        {/* Desktop Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-16 left-0 w-[calc(100vw-2rem)] max-w-[14rem] bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
            >
              <div className="p-2 border-b border-slate-200 dark:border-slate-700">
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 px-2">
                  {t("Study Tools")}
                </div>
              </div>
              <div className="p-1">
                {tools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => openTool(tool.id)}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 active:bg-slate-200 dark:active:bg-slate-700 transition-colors group touch-manipulation"
                  >
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${tool.color} text-white`}>
                      {tool.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium text-slate-900 dark:text-white">
                        {tool.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {tool.shortcut}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Tools Modal (triggered via event) */}
      <AnimatePresence>
        {isOpen && (
          <div className="md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-4 right-4 top-1/2 -translate-y-1/2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-[101]"
            >
              <div className="p-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 px-1">
                  {t("Study Tools")}
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Close tools"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
              <div className="p-2">
                {tools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => openTool(tool.id)}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 active:bg-slate-200 dark:active:bg-slate-700 transition-colors group touch-manipulation"
                  >
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${tool.color} text-white`}>
                      {tool.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium text-slate-900 dark:text-white">
                        {tool.name}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Render the active tool modals */}
      {activeTool === "focus" && (
        <ReadingModeModal onClose={() => setActiveTool(null)} />
      )}
      {activeTool === "converter" && (
        <UnitConverterModal onClose={() => setActiveTool(null)} />
      )}
      {activeTool === "notes" && (
        <QuickNotesModal onClose={() => setActiveTool(null)} />
      )}
      {activeTool === "calculator" && (
        <CalculatorModal onClose={() => setActiveTool(null)} />
      )}
      {activeTool === "formulas" && (
        <FormulaModal onClose={() => setActiveTool(null)} />
      )}
      {activeTool === "timer" && (
        <TimerModal onClose={() => setActiveTool(null)} />
      )}
    </>
  );
}

// Inline modal versions of each tool (no floating buttons)

function ReadingModeModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslations();
  const [fontSize, setFontSize] = useState(110);
  const [isDimmed, setIsDimmed] = useState(true);
  const [hideImages, setHideImages] = useState(false);
  const [lineSpacing, setLineSpacing] = useState(1.8);
  const [focusIntensity, setFocusIntensity] = useState(70);
  const [showControlPanel, setShowControlPanel] = useState(true);
  const [breathingAnimation, setBreathingAnimation] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    
    root.classList.add("focus-reading-active", "focus-mode-fullscreen");
    root.style.setProperty("--focus-font-size", `${fontSize}%`);
    root.style.setProperty("--focus-line-spacing", `${lineSpacing}`);
    root.style.setProperty("--focus-intensity", `${focusIntensity}`);
    
    if (isDimmed) root.classList.add("focus-dimmed");
    else root.classList.remove("focus-dimmed");
    
    if (hideImages) root.classList.add("focus-hide-images");
    else root.classList.remove("focus-hide-images");

    if (breathingAnimation) root.classList.add("focus-breathing");
    else root.classList.remove("focus-breathing");
    
    return () => {
      root.classList.remove("focus-reading-active", "focus-dimmed", "focus-hide-images", "focus-mode-fullscreen", "focus-breathing");
      root.style.removeProperty("--focus-font-size");
      root.style.removeProperty("--focus-line-spacing");
      root.style.removeProperty("--focus-intensity");
    };
  }, [fontSize, isDimmed, hideImages, lineSpacing, focusIntensity, breathingAnimation]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <>
      {/* Full-screen dark overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[150] pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,${focusIntensity / 100 * 0.7}) 100%)`,
        }}
      />

      {/* Breathing border animation */}
      {breathingAnimation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[149] pointer-events-none"
          style={{
            border: "4px solid",
            borderColor: "var(--theme-primary)",
            animation: "breathe 4s ease-in-out infinite",
          }}
        />
      )}

      {/* Exit button - always visible */}
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        onClick={onClose}
        className="fixed top-4 right-4 z-[200] p-3 rounded-full bg-red-500/90 hover:bg-red-600 text-white shadow-lg transition-all hover:scale-105"
        title="Exit Focus Mode (Esc)"
      >
        <X className="w-5 h-5" />
      </motion.button>

      {/* Toggle control panel button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        onClick={() => setShowControlPanel(!showControlPanel)}
        className="fixed top-4 left-4 z-[200] p-3 rounded-full bg-slate-800/90 hover:bg-slate-700 text-white shadow-lg transition-all hover:scale-105"
        title={showControlPanel ? t("Hide Controls") : t("Show Controls")}
      >
        <Focus className="w-5 h-5" />
      </motion.button>

      {/* Control Panel */}
      <AnimatePresence>
        {showControlPanel && (
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-20 left-4 z-[200] w-72"
          >
            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              {/* Header */}
              <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Focus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{t("Focus Mode")}</h3>
                    <p className="text-xs text-white/80">{t("Distraction-free reading")}</p>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="p-4 space-y-5">
                {/* Text Size */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t("Text Size")}</span>
                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{fontSize}%</span>
                  </div>
                  <input
                    type="range"
                    min="90"
                    max="150"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>

                {/* Line Spacing */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t("Line Spacing")}</span>
                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{lineSpacing.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="1.2"
                    max="2.5"
                    step="0.1"
                    value={lineSpacing}
                    onChange={(e) => setLineSpacing(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>

                {/* Focus Intensity */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t("Focus Intensity")}</span>
                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{focusIntensity}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="90"
                    value={focusIntensity}
                    onChange={(e) => setFocusIntensity(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>

                {/* Toggle Options */}
                <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <label className="flex items-center justify-between cursor-pointer group">
                    <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{t("Dim Distractions")}</span>
                    <div
                      onClick={() => setIsDimmed(!isDimmed)}
                      className={`w-11 h-6 rounded-full transition-all duration-200 ${isDimmed ? "bg-indigo-500" : "bg-slate-300 dark:bg-slate-600"}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ${isDimmed ? "translate-x-[22px]" : "translate-x-0.5"} mt-0.5`} />
                    </div>
                  </label>
                  
                  <label className="flex items-center justify-between cursor-pointer group">
                    <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{t("Hide Images")}</span>
                    <div
                      onClick={() => setHideImages(!hideImages)}
                      className={`w-11 h-6 rounded-full transition-all duration-200 ${hideImages ? "bg-indigo-500" : "bg-slate-300 dark:bg-slate-600"}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ${hideImages ? "translate-x-[22px]" : "translate-x-0.5"} mt-0.5`} />
                    </div>
                  </label>

                  <label className="flex items-center justify-between cursor-pointer group">
                    <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{t("Breathing Border")}</span>
                    <div
                      onClick={() => setBreathingAnimation(!breathingAnimation)}
                      className={`w-11 h-6 rounded-full transition-all duration-200 ${breathingAnimation ? "bg-indigo-500" : "bg-slate-300 dark:bg-slate-600"}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ${breathingAnimation ? "translate-x-[22px]" : "translate-x-0.5"} mt-0.5`} />
                    </div>
                  </label>
                </div>
              </div>

              {/* Footer */}
              <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Press <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-700 rounded shadow-sm">Esc</kbd> to exit</span>
                  <span className="text-indigo-500">Focus Active ✓</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function UnitConverterModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    // Small delay to ensure component is mounted and listening
    const dispatchTimer = setTimeout(() => {
      window.dispatchEvent(new CustomEvent("open-unit-converter"));
    }, 10);
    const timer = setTimeout(onClose, 100);
    return () => {
      clearTimeout(dispatchTimer);
      clearTimeout(timer);
    };
  }, [onClose]);
  return null;
}

function QuickNotesModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    // Small delay to ensure component is mounted and listening
    const dispatchTimer = setTimeout(() => {
      window.dispatchEvent(new CustomEvent("open-quick-notes"));
    }, 10);
    const timer = setTimeout(onClose, 100);
    return () => {
      clearTimeout(dispatchTimer);
      clearTimeout(timer);
    };
  }, [onClose]);
  return null;
}

function CalculatorModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    // Small delay to ensure component is mounted and listening
    const dispatchTimer = setTimeout(() => {
      window.dispatchEvent(new CustomEvent("open-calculator"));
    }, 10);
    // Delay onClose to ensure event is processed
    const timer = setTimeout(onClose, 100);
    return () => {
      clearTimeout(dispatchTimer);
      clearTimeout(timer);
    };
  }, [onClose]);
  return null;
}

function FormulaModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    // Small delay to ensure component is mounted and listening
    const dispatchTimer = setTimeout(() => {
      window.dispatchEvent(new CustomEvent("open-formulas"));
    }, 10);
    const timer = setTimeout(onClose, 100);
    return () => {
      clearTimeout(dispatchTimer);
      clearTimeout(timer);
    };
  }, [onClose]);
  return null;
}

function TimerModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    // Small delay to ensure component is mounted and listening
    const dispatchTimer = setTimeout(() => {
      window.dispatchEvent(new CustomEvent("open-timer"));
    }, 10);
    const timer = setTimeout(onClose, 100);
    return () => {
      clearTimeout(dispatchTimer);
      clearTimeout(timer);
    };
  }, [onClose]);
  return null;
}
