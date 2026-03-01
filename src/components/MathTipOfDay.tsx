"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, X, ChevronRight, Sparkles } from "lucide-react";

const mathTips = [
  {
    title: "The Rule of 72",
    tip: "To estimate how long it takes for money to double, divide 72 by the interest rate. At 6% interest, money doubles in about 12 years!",
    category: "Finance Math",
  },
  {
    title: "Multiplying by 11",
    tip: "To multiply a two-digit number by 11, add the digits and place the sum between them. 35 × 11 = 3(3+5)5 = 385!",
    category: "Mental Math",
  },
  {
    title: "Perfect Squares Pattern",
    tip: "The difference between consecutive perfect squares is always an odd number: 4-1=3, 9-4=5, 16-9=7, 25-16=9...",
    category: "Number Theory",
  },
  {
    title: "The 9s Trick",
    tip: "To multiply any number by 9, multiply by 10 and subtract the original. 9 × 7 = 70 - 7 = 63!",
    category: "Mental Math",
  },
  {
    title: "Pi Memory Trick",
    tip: "\"How I need a drink, alcoholic of course\" - count letters in each word to remember π: 3.1415926!",
    category: "Memory",
  },
  {
    title: "Percentage Swap",
    tip: "X% of Y = Y% of X. So 8% of 50 = 50% of 8 = 4. Sometimes one is easier to calculate!",
    category: "Percentages",
  },
  {
    title: "Fibonacci in Nature",
    tip: "Fibonacci numbers (1,1,2,3,5,8,13...) appear in flower petals, pinecones, and even galaxy spirals!",
    category: "Fun Fact",
  },
  {
    title: "Square Numbers Near 100",
    tip: "To square a number near 100: 97² = 97-3 | 3² = 94|09 = 9409. The distance from 100 gives both parts!",
    category: "Mental Math",
  },
  {
    title: "The Golden Ratio",
    tip: "φ (phi) ≈ 1.618 appears in art, architecture, and nature. A rectangle with this ratio is considered most pleasing!",
    category: "Fun Fact",
  },
  {
    title: "Divisibility by 3",
    tip: "A number is divisible by 3 if the sum of its digits is divisible by 3. 123 → 1+2+3=6 → divisible by 3!",
    category: "Number Theory",
  },
  {
    title: "Euler's Identity",
    tip: "e^(iπ) + 1 = 0 connects five fundamental constants (e, i, π, 1, 0) in one beautiful equation!",
    category: "Famous Equations",
  },
  {
    title: "Birthday Paradox",
    tip: "In a group of just 23 people, there's a 50% chance two share a birthday. With 70 people, it's 99.9%!",
    category: "Probability",
  },
];

export function MathTipOfDay() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTip, setCurrentTip] = useState(mathTips[0]);
  const [hasSeenToday, setHasSeenToday] = useState(false);

  useEffect(() => {
    // Get tip based on day of year for consistency
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    const tipIndex = dayOfYear % mathTips.length;
    setCurrentTip(mathTips[tipIndex]);

    // Check if user has seen today's tip
    const lastSeen = localStorage.getItem("mm_tip_last_seen");
    const today = new Date().toDateString();
    if (lastSeen !== today) {
      // Show tip after a short delay
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setHasSeenToday(true);
    }
  }, []);

  const closeTip = () => {
    setIsOpen(false);
    localStorage.setItem("mm_tip_last_seen", new Date().toDateString());
    setHasSeenToday(true);
  };

  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener("open-mathtip", handler);
    return () => window.removeEventListener("open-mathtip", handler);
  }, []);

  const getNextTip = () => {
    const currentIndex = mathTips.indexOf(currentTip);
    const nextIndex = (currentIndex + 1) % mathTips.length;
    setCurrentTip(mathTips[nextIndex]);
  };

  return (
    <>
      {/* Floating Tip Button (only shows if tip was dismissed) */}
      {hasSeenToday && !isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setIsOpen(true)}
          className="hidden md:flex fixed bottom-6 left-[5.5rem] z-[89] w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-xl items-center justify-center hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
          aria-label="Math tip of the day"
          title="Math Tip of the Day"
        >
          <Lightbulb className="w-6 h-6 text-white" />
        </motion.button>
      )}

      {/* Tip Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeTip}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-4 right-4 bottom-24 md:left-1/2 md:right-auto md:bottom-auto md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg z-[101]"
            >
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
                {/* Header */}
                <div className="relative bg-gradient-to-r from-amber-400 to-orange-500 p-6 text-white">
                  <button
                    onClick={closeTip}
                    className="absolute top-4 right-4 p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    aria-label="Close tip"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white/80">Math Tip of the Day</p>
                      <p className="text-xs text-white/60">{currentTip.category}</p>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold">{currentTip.title}</h3>
                </div>

                {/* Content */}
                <div className="p-6">
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {currentTip.tip}
                  </p>
                </div>

                {/* Footer */}
                <div className="px-6 pb-6 flex items-center justify-between">
                  <button
                    onClick={getNextTip}
                    className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-[var(--theme-primary)] transition-colors"
                  >
                    Show another tip
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={closeTip}
                    className="px-4 py-2 rounded-lg font-medium text-white"
                    style={{ background: "linear-gradient(135deg, var(--theme-primary), var(--theme-primary-light))" }}
                  >
                    Got it!
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
