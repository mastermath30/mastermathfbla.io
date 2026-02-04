"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wrench, X, Focus, ArrowRightLeft, StickyNote, Calculator, BookOpen, Timer } from "lucide-react";

interface Tool {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  shortcut: string;
}

const tools: Tool[] = [
  {
    id: "focus",
    name: "Focus Mode",
    icon: <Focus className="w-5 h-5" />,
    color: "from-indigo-500 to-purple-600",
    shortcut: "Alt+F",
  },
  {
    id: "converter",
    name: "Unit Converter",
    icon: <ArrowRightLeft className="w-5 h-5" />,
    color: "from-cyan-500 to-blue-600",
    shortcut: "Alt+U",
  },
  {
    id: "notes",
    name: "Quick Notes",
    icon: <StickyNote className="w-5 h-5" />,
    color: "from-yellow-400 to-amber-500",
    shortcut: "Alt+N",
  },
  {
    id: "calculator",
    name: "Calculator",
    icon: <Calculator className="w-5 h-5" />,
    color: "from-emerald-500 to-teal-600",
    shortcut: "Alt+C",
  },
  {
    id: "formulas",
    name: "Formula Reference",
    icon: <BookOpen className="w-5 h-5" />,
    color: "from-violet-500 to-purple-600",
    shortcut: "Alt+R",
  },
  {
    id: "timer",
    name: "Pomodoro Timer",
    icon: <Timer className="w-5 h-5" />,
    color: "from-rose-500 to-orange-500",
    shortcut: "Alt+T",
  },
];

export function ToolsMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);

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
      {/* Tools Menu Button */}
      <div className="tools-menu-container fixed bottom-24 md:bottom-6 left-24 md:left-[10rem] z-[89]">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 touch-manipulation ${
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

        {/* Dropdown Menu */}
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
                  Study Tools
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
                      <div className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
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
  const [fontSize, setFontSize] = useState(110);
  const [isDimmed, setIsDimmed] = useState(true);
  const [hideImages, setHideImages] = useState(false);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    
    if (isActive) {
      root.classList.add("focus-reading-active");
      root.style.setProperty("--focus-font-size", `${fontSize}%`);
      if (isDimmed) root.classList.add("focus-dimmed");
      else root.classList.remove("focus-dimmed");
      if (hideImages) root.classList.add("focus-hide-images");
      else root.classList.remove("focus-hide-images");
    }
    
    return () => {
      root.classList.remove("focus-reading-active", "focus-dimmed", "focus-hide-images");
      root.style.removeProperty("--focus-font-size");
    };
  }, [isActive, fontSize, isDimmed, hideImages]);

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-40 md:bottom-20 left-4 right-4 md:right-auto z-[200]"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-4 w-full md:w-64">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Focus className="w-5 h-5" style={{ color: "var(--theme-primary)" }} />
            <span className="font-semibold text-slate-900 dark:text-white">Focus Mode</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600 dark:text-slate-400">Text Size</span>
            <span className="text-sm font-medium text-slate-900 dark:text-white">{fontSize}%</span>
          </div>
          <input
            type="range"
            min="90"
            max="150"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="w-full accent-[var(--theme-primary)]"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-slate-600 dark:text-slate-400">Dim Surroundings</span>
            <div
              onClick={() => setIsDimmed(!isDimmed)}
              className={`w-10 h-6 rounded-full transition-colors ${isDimmed ? "bg-green-500" : "bg-slate-300"}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full m-1 transition-transform ${isDimmed ? "translate-x-4" : ""}`} />
            </div>
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-slate-600 dark:text-slate-400">Hide Images</span>
            <div
              onClick={() => setHideImages(!hideImages)}
              className={`w-10 h-6 rounded-full transition-colors ${hideImages ? "bg-green-500" : "bg-slate-300"}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full m-1 transition-transform ${hideImages ? "translate-x-4" : ""}`} />
            </div>
          </label>
        </div>

        <div className="text-center text-xs text-slate-500">
          Press <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs">Esc</kbd> to exit
        </div>
      </div>
    </motion.div>
  );
}

function UnitConverterModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("open-unit-converter"));
    const timer = setTimeout(onClose, 50);
    return () => clearTimeout(timer);
  }, [onClose]);
  return null;
}

function QuickNotesModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("open-quick-notes"));
    const timer = setTimeout(onClose, 50);
    return () => clearTimeout(timer);
  }, [onClose]);
  return null;
}

function CalculatorModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("open-calculator"));
    // Delay onClose to ensure event is processed
    const timer = setTimeout(onClose, 50);
    return () => clearTimeout(timer);
  }, [onClose]);
  return null;
}

function FormulaModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("open-formulas"));
    const timer = setTimeout(onClose, 50);
    return () => clearTimeout(timer);
  }, [onClose]);
  return null;
}

function TimerModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("open-timer"));
    const timer = setTimeout(onClose, 50);
    return () => clearTimeout(timer);
  }, [onClose]);
  return null;
}
