"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, X, Calendar, Trophy, Star } from "lucide-react";

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastVisit: string;
  totalDays: number;
  visitHistory: string[];
}

export function StudyStreak() {
  const [isOpen, setIsOpen] = useState(false);
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastVisit: "",
    totalDays: 0,
    visitHistory: [],
  });
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const saved = localStorage.getItem("mathmaster-streak");
    
    if (saved) {
      const data: StreakData = JSON.parse(saved);
      const lastVisit = new Date(data.lastVisit);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24));

      if (data.lastVisit === today) {
        // Already visited today
        setStreakData(data);
      } else if (diffDays === 1) {
        // Consecutive day - increase streak!
        const newData = {
          ...data,
          currentStreak: data.currentStreak + 1,
          longestStreak: Math.max(data.longestStreak, data.currentStreak + 1),
          lastVisit: today,
          totalDays: data.totalDays + 1,
          visitHistory: [...data.visitHistory.slice(-29), today],
        };
        setStreakData(newData);
        localStorage.setItem("mathmaster-streak", JSON.stringify(newData));
        
        // Celebrate milestones
        if ([7, 14, 30, 50, 100].includes(newData.currentStreak)) {
          setShowCelebration(true);
          setTimeout(() => setShowCelebration(false), 3000);
        }
      } else if (diffDays > 1) {
        // Streak broken
        const newData = {
          ...data,
          currentStreak: 1,
          lastVisit: today,
          totalDays: data.totalDays + 1,
          visitHistory: [...data.visitHistory.slice(-29), today],
        };
        setStreakData(newData);
        localStorage.setItem("mathmaster-streak", JSON.stringify(newData));
      }
    } else {
      // First visit ever
      const newData: StreakData = {
        currentStreak: 1,
        longestStreak: 1,
        lastVisit: today,
        totalDays: 1,
        visitHistory: [today],
      };
      setStreakData(newData);
      localStorage.setItem("mathmaster-streak", JSON.stringify(newData));
    }
  }, []);

  // Generate last 30 days for calendar
  const getLast30Days = () => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split("T")[0]);
    }
    return days;
  };

  const last30Days = getLast30Days();

  return (
    <>
      {/* Streak Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed top-20 right-4 z-[89] flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="Study Streak"
      >
        <Flame className="w-5 h-5 text-white" />
        <span className="text-white font-bold">{streakData.currentStreak}</span>
        {streakData.currentStreak >= 7 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-xs"
          >
            🔥
          </motion.span>
        )}
      </motion.button>

      {/* Celebration Popup */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-32 right-4 z-[400] bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-xl shadow-2xl"
          >
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6" />
              <span className="font-bold">{streakData.currentStreak} Day Streak! 🎉</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Streak Modal */}
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
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[301] w-[90%] max-w-md"
            >
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
                {/* Header */}
                <div className="relative p-6 bg-gradient-to-r from-orange-500 to-red-500 text-white text-center overflow-hidden">
                  {/* Background flames */}
                  <div className="absolute inset-0 opacity-20">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute"
                        style={{ left: `${20 + i * 15}%`, bottom: 0 }}
                        animate={{ y: [-10, -30, -10], opacity: [0.3, 0.7, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                      >
                        <Flame className="w-12 h-12" />
                      </motion.div>
                    ))}
                  </div>

                  <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-4 right-4 p-1 rounded hover:bg-white/20"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 10 }}
                    className="relative"
                  >
                    <Flame className="w-16 h-16 mx-auto mb-2" />
                    <div className="text-5xl font-bold">{streakData.currentStreak}</div>
                    <div className="text-white/80">Day Streak</div>
                  </motion.div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 p-4 border-b border-slate-200 dark:border-slate-700">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-orange-500 mb-1">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{streakData.longestStreak}</div>
                    <div className="text-xs text-slate-500">Longest Streak</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-blue-500 mb-1">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{streakData.totalDays}</div>
                    <div className="text-xs text-slate-500">Total Days</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-yellow-500 mb-1">
                      <Star className="w-4 h-4" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      {Math.floor(streakData.totalDays / 7)}
                    </div>
                    <div className="text-xs text-slate-500">Weeks Active</div>
                  </div>
                </div>

                {/* Calendar */}
                <div className="p-4">
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Last 30 Days</div>
                  <div className="grid grid-cols-10 gap-1">
                    {last30Days.map((day, i) => {
                      const visited = streakData.visitHistory.includes(day);
                      const isToday = day === new Date().toISOString().split("T")[0];
                      return (
                        <motion.div
                          key={day}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: i * 0.02 }}
                          className={`w-6 h-6 rounded-sm ${
                            visited
                              ? "bg-gradient-to-br from-orange-400 to-red-500"
                              : "bg-slate-200 dark:bg-slate-700"
                          } ${isToday ? "ring-2 ring-offset-1 ring-orange-400" : ""}`}
                          title={day}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Motivation */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 text-center">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {streakData.currentStreak >= 7
                      ? "🔥 Amazing! Keep the fire burning!"
                      : streakData.currentStreak >= 3
                      ? "💪 Great progress! You're building momentum!"
                      : "🌟 Every day counts. Come back tomorrow!"}
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
