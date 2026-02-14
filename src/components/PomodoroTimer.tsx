"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Timer, X, Play, Pause, RotateCcw, Coffee, Brain } from "lucide-react";
import { triggerConfetti } from "./Confetti";
import { useTranslations } from "./LanguageProvider";

type TimerMode = "focus" | "shortBreak" | "longBreak";

// Timer settings (labels will be translated in component)
const getTimerSettings = (t: (key: string) => string) => ({
  focus: { duration: 25 * 60, label: t("Focus"), color: "from-rose-500 to-orange-500" },
  shortBreak: { duration: 5 * 60, label: t("Short Break"), color: "from-green-500 to-emerald-500" },
  longBreak: { duration: 15 * 60, label: t("Long Break"), color: "from-blue-500 to-cyan-500" },
});

export function PomodoroTimer() {
  const { t } = useTranslations();
  const TIMER_SETTINGS = getTimerSettings(t);
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<TimerMode>("focus");
  const [timeLeft, setTimeLeft] = useState(TIMER_SETTINGS.focus.duration);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Timer completed
      if (mode === "focus") {
        setSessionsCompleted((prev) => prev + 1);
        triggerConfetti();
        
        // Play notification sound (if available)
        try {
          const audio = new Audio("/notification.mp3");
          audio.play().catch(() => {});
        } catch {}

        // Auto switch to break
        if ((sessionsCompleted + 1) % 4 === 0) {
          setMode("longBreak");
          setTimeLeft(TIMER_SETTINGS.longBreak.duration);
        } else {
          setMode("shortBreak");
          setTimeLeft(TIMER_SETTINGS.shortBreak.duration);
        }
      } else {
        // Break completed, switch to focus
        setMode("focus");
        setTimeLeft(TIMER_SETTINGS.focus.duration);
      }
      setIsRunning(false);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft, mode, sessionsCompleted]);

  // Keyboard shortcut: Alt + T
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === "t") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Separate effect for handling the custom event (no dependencies to avoid re-registering)
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-timer", handleOpen);
    return () => {
      window.removeEventListener("open-timer", handleOpen);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setTimeLeft(TIMER_SETTINGS[newMode].duration);
    setIsRunning(false);
  };

  const resetTimer = () => {
    setTimeLeft(TIMER_SETTINGS[mode].duration);
    setIsRunning(false);
  };

  const progress = 1 - timeLeft / TIMER_SETTINGS[mode].duration;

  // No floating button - accessed via Tools Menu
  return (
    <>
      {/* Timer Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[300]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[301] w-[90%] max-w-sm"
            >
              <div className={`rounded-2xl shadow-2xl overflow-hidden bg-gradient-to-br ${TIMER_SETTINGS[mode].color}`}>
                {/* Header */}
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-2 text-white">
                    <Timer className="w-5 h-5" />
                    <span className="font-semibold">{t("Pomodoro Timer")}</span>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded hover:bg-white/20 text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Mode Tabs */}
                <div className="flex justify-center gap-2 px-4 pb-4">
                  <button
                    onClick={() => switchMode("focus")}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      mode === "focus" ? "bg-white/30 text-white" : "text-white/70 hover:bg-white/10"
                    }`}
                  >
                    <Brain className="w-4 h-4" />
                    {t("Focus")}
                  </button>
                  <button
                    onClick={() => switchMode("shortBreak")}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      mode === "shortBreak" ? "bg-white/30 text-white" : "text-white/70 hover:bg-white/10"
                    }`}
                  >
                    <Coffee className="w-4 h-4" />
                    {t("Short")}
                  </button>
                  <button
                    onClick={() => switchMode("longBreak")}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      mode === "longBreak" ? "bg-white/30 text-white" : "text-white/70 hover:bg-white/10"
                    }`}
                  >
                    <Coffee className="w-4 h-4" />
                    {t("Long")}
                  </button>
                </div>

                {/* Timer Display */}
                <div className="bg-white/10 backdrop-blur-sm p-8">
                  <div className="relative w-48 h-48 mx-auto">
                    {/* Progress Ring */}
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth="8"
                        fill="none"
                      />
                      <motion.circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="white"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={553}
                        strokeDashoffset={553 * (1 - progress)}
                        transition={{ duration: 0.5 }}
                      />
                    </svg>

                    {/* Time Display */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-5xl font-mono font-bold text-white">
                        {formatTime(timeLeft)}
                      </div>
                      <div className="text-white/70 text-sm mt-1">
                        {TIMER_SETTINGS[mode].label}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="p-4 flex items-center justify-center gap-4 bg-white/5">
                  <button
                    onClick={resetTimer}
                    className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                    title={t("Reset")}
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setIsRunning(!isRunning)}
                    className="p-4 rounded-full bg-white text-rose-500 hover:scale-105 transition-transform shadow-lg"
                  >
                    {isRunning ? (
                      <Pause className="w-8 h-8" />
                    ) : (
                      <Play className="w-8 h-8 ml-1" />
                    )}
                  </button>
                  <div className="p-3 rounded-full bg-white/10 text-white">
                    <span className="text-sm font-medium">{sessionsCompleted} 🍅</span>
                  </div>
                </div>

                {/* Sessions Info */}
                <div className="p-3 text-center text-xs text-white/60 bg-black/10">
                  {t("Complete 4 focus sessions for a long break")}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
