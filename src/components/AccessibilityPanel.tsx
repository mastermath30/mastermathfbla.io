"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Accessibility,
  X,
  Type,
  Contrast,
  Eye,
  Zap,
  RotateCcw,
  Check,
  Minus,
  Plus,
  MousePointer2,
  Keyboard,
} from "lucide-react";

interface AccessibilitySettings {
  fontSize: number; // 100 = default, 75-150 range
  highContrast: boolean;
  reduceMotion: boolean;
  dyslexiaFont: boolean;
  largePointer: boolean;
  focusHighlight: boolean;
}

const defaultSettings: AccessibilitySettings = {
  fontSize: 100,
  highContrast: false,
  reduceMotion: false,
  dyslexiaFont: false,
  largePointer: false,
  focusHighlight: false,
};

export function AccessibilityPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("mm_accessibility");
      if (saved) {
        const parsed = JSON.parse(saved);
        setSettings({ ...defaultSettings, ...parsed });
      }
    } catch {
      // Ignore
    }
  }, []);

  // Apply settings to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Font size
    root.style.fontSize = `${settings.fontSize}%`;
    
    // High contrast
    if (settings.highContrast) {
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
    }
    
    // Reduce motion
    if (settings.reduceMotion) {
      root.classList.add("reduce-motion");
    } else {
      root.classList.remove("reduce-motion");
    }
    
    // Dyslexia font
    if (settings.dyslexiaFont) {
      root.classList.add("dyslexia-font");
    } else {
      root.classList.remove("dyslexia-font");
    }
    
    // Large pointer
    if (settings.largePointer) {
      root.classList.add("large-pointer");
    } else {
      root.classList.remove("large-pointer");
    }
    
    // Focus highlight
    if (settings.focusHighlight) {
      root.classList.add("focus-highlight");
    } else {
      root.classList.remove("focus-highlight");
    }
    
    // Save to localStorage
    localStorage.setItem("mm_accessibility", JSON.stringify(settings));
  }, [settings]);

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  // Keyboard shortcut handler
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Alt + A to toggle accessibility panel
    if (e.altKey && e.key.toLowerCase() === "a") {
      e.preventDefault();
      setIsOpen((prev) => !prev);
    }
    // Alt + K to show keyboard shortcuts
    if (e.altKey && e.key.toLowerCase() === "k") {
      e.preventDefault();
      setShowShortcuts((prev) => !prev);
    }
    // Escape to close
    if (e.key === "Escape") {
      setIsOpen(false);
      setShowShortcuts(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const shortcuts = [
    { keys: ["Alt", "A"], description: "Toggle accessibility panel" },
    { keys: ["Alt", "K"], description: "Show keyboard shortcuts" },
    { keys: ["Alt", "C"], description: "Open quick calculator" },
    { keys: ["Alt", "F"], description: "Focus reading mode" },
    { keys: ["Alt", "H"], description: "Go to Home" },
    { keys: ["Alt", "D"], description: "Go to Dashboard" },
    { keys: ["Alt", "S"], description: "Go to Schedule" },
    { keys: ["Alt", "R"], description: "Go to Resources" },
    { keys: ["Alt", "L"], description: "Go to Login/Account" },
    { keys: ["Tab"], description: "Navigate between elements" },
    { keys: ["Esc"], description: "Close panels" },
  ];

  return (
    <>
      {/* Accessibility Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 md:bottom-6 left-6 z-[90] w-14 h-14 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:ring-offset-2 touch-manipulation"
        aria-label="Open accessibility settings"
        title="Accessibility Settings (Alt+A)"
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        <Accessibility className="w-6 h-6 text-slate-700 dark:text-slate-300" />
      </button>

      {/* Accessibility Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
            />
            
            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, x: -300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-full max-w-sm bg-white dark:bg-slate-900 shadow-2xl z-[101] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--theme-primary), var(--theme-primary-light))" }}>
                    <Accessibility className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Accessibility</h2>
                    <p className="text-xs text-slate-500">Customize your experience</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Close accessibility panel"
                >
                  <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
              </div>

              {/* Settings */}
              <div className="p-4 space-y-6">
                {/* Font Size */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Type className="w-5 h-5" style={{ color: "var(--theme-primary)" }} />
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">Text Size</h3>
                      <p className="text-xs text-slate-500">{settings.fontSize}%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateSetting("fontSize", Math.max(75, settings.fontSize - 10))}
                      className="p-2 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:border-[var(--theme-primary)] transition-colors"
                      aria-label="Decrease font size"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all"
                        style={{ 
                          width: `${((settings.fontSize - 75) / 75) * 100}%`,
                          background: "linear-gradient(90deg, var(--theme-primary), var(--theme-primary-light))"
                        }}
                      />
                    </div>
                    <button
                      onClick={() => updateSetting("fontSize", Math.min(150, settings.fontSize + 10))}
                      className="p-2 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:border-[var(--theme-primary)] transition-colors"
                      aria-label="Increase font size"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Toggle Options */}
                <div className="space-y-3">
                  {/* High Contrast */}
                  <ToggleOption
                    icon={<Contrast className="w-5 h-5" />}
                    title="High Contrast"
                    description="Increase color contrast for better visibility"
                    enabled={settings.highContrast}
                    onChange={(v) => updateSetting("highContrast", v)}
                  />

                  {/* Reduce Motion */}
                  <ToggleOption
                    icon={<Zap className="w-5 h-5" />}
                    title="Reduce Motion"
                    description="Minimize animations and transitions"
                    enabled={settings.reduceMotion}
                    onChange={(v) => updateSetting("reduceMotion", v)}
                  />

                  {/* Dyslexia Font */}
                  <ToggleOption
                    icon={<Eye className="w-5 h-5" />}
                    title="Dyslexia-Friendly Font"
                    description="Use OpenDyslexic font for easier reading"
                    enabled={settings.dyslexiaFont}
                    onChange={(v) => updateSetting("dyslexiaFont", v)}
                  />

                  {/* Large Pointer */}
                  <ToggleOption
                    icon={<MousePointer2 className="w-5 h-5" />}
                    title="Large Cursor"
                    description="Increase cursor size for better visibility"
                    enabled={settings.largePointer}
                    onChange={(v) => updateSetting("largePointer", v)}
                  />

                  {/* Focus Highlight */}
                  <ToggleOption
                    icon={<Keyboard className="w-5 h-5" />}
                    title="Focus Highlight"
                    description="Show prominent focus indicators"
                    enabled={settings.focusHighlight}
                    onChange={(v) => updateSetting("focusHighlight", v)}
                  />
                </div>

                {/* Reset Button */}
                <button
                  onClick={resetSettings}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-[var(--theme-primary)] hover:text-[var(--theme-primary)] transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset to Defaults
                </button>

                {/* Keyboard Shortcuts */}
                {/* Keyboard Shortcuts - Hidden on mobile */}
                <button
                  onClick={() => setShowShortcuts(true)}
                  className="hidden sm:flex w-full items-center justify-center gap-2 px-4 py-3 rounded-xl text-white font-medium"
                  style={{ background: "linear-gradient(135deg, var(--theme-primary), var(--theme-primary-light))" }}
                >
                  <Keyboard className="w-4 h-4" />
                  View Keyboard Shortcuts
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Keyboard Shortcuts Modal */}
      <AnimatePresence>
        {showShortcuts && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowShortcuts(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[102]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md max-h-[80vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl z-[103] p-4 sm:p-6"
            >
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">Keyboard Shortcuts</h3>
                <button
                  onClick={() => setShowShortcuts(false)}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-2 sm:space-y-3">
                {shortcuts.map((shortcut, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0 gap-2">
                    <span className="text-sm sm:text-base text-slate-600 dark:text-slate-400 flex-1">{shortcut.description}</span>
                    <div className="flex gap-1 flex-shrink-0">
                      {shortcut.keys.map((key, j) => (
                        <kbd
                          key={j}
                          className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function ToggleOption({
  icon,
  title,
  description,
  enabled,
  onChange,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 transition-all text-left ${
        enabled
          ? "border-[var(--theme-primary)] bg-[color-mix(in_srgb,var(--theme-primary)_10%,transparent)]"
          : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
      }`}
    >
      <div className={`mt-0.5 ${enabled ? "text-[var(--theme-primary)]" : "text-slate-400"}`}>
        {icon}
      </div>
      <div className="flex-1">
        <h4 className="font-medium text-slate-900 dark:text-white">{title}</h4>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      </div>
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
        enabled
          ? "border-[var(--theme-primary)] bg-[var(--theme-primary)]"
          : "border-slate-300 dark:border-slate-600"
      }`}>
        {enabled && <Check className="w-3 h-3 text-white" />}
      </div>
    </button>
  );
}
