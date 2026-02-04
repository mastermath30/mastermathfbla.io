"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, X } from "lucide-react";

export function QuickCalculator() {
  const [isOpen, setIsOpen] = useState(false);
  const [display, setDisplay] = useState("0");
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLDivElement>(null);

  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay((prev) => prev === "0" ? digit : prev + digit);
    }
  };

  const inputDot = () => {
    if (waitingForOperand) {
      setDisplay("0.");
      setWaitingForOperand(false);
    } else {
      setDisplay((prev) => prev.includes(".") ? prev : prev + ".");
    }
  };

  const clearAll = () => {
    setDisplay("0");
    setPreviousValue(null);
    setOperator(null);
    setWaitingForOperand(false);
  };

  const backspace = () => {
    setDisplay((prev) => {
      if (prev.length === 1 || (prev.length === 2 && prev[0] === "-")) {
        return "0";
      }
      return prev.slice(0, -1);
    });
  };

  const toggleSign = () => {
    setDisplay((prev) => String(-parseFloat(prev)));
  };

  const inputPercent = () => {
    setDisplay((prev) => String(parseFloat(prev) / 100));
  };

  const performOperation = (nextOperator: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operator) {
      const currentValue = previousValue;
      let result: number;

      switch (operator) {
        case "+":
          result = currentValue + inputValue;
          break;
        case "-":
          result = currentValue - inputValue;
          break;
        case "*":
          result = currentValue * inputValue;
          break;
        case "/":
          result = inputValue !== 0 ? currentValue / inputValue : 0;
          break;
        default:
          return;
      }

      // Format result to avoid floating point issues
      result = Math.round(result * 100000000) / 100000000;

      // Add to history
      const historyEntry = `${currentValue} ${operator === "*" ? "×" : operator === "/" ? "÷" : operator} ${inputValue} = ${result}`;
      setHistory((prev) => [historyEntry, ...prev.slice(0, 4)]);

      setDisplay(String(result));
      setPreviousValue(result);
    }

    setWaitingForOperand(true);
    setOperator(nextOperator === "=" ? null : nextOperator);
  };

  // Keyboard shortcut: Alt + C to toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === "c") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        return;
      }
      
      if (!isOpen) return;

      // Calculator keyboard input
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        inputDigit(e.key);
      } else if (e.key === ".") {
        e.preventDefault();
        inputDot();
      } else if (e.key === "+") {
        e.preventDefault();
        performOperation("+");
      } else if (e.key === "-") {
        e.preventDefault();
        performOperation("-");
      } else if (e.key === "*") {
        e.preventDefault();
        performOperation("*");
      } else if (e.key === "/") {
        e.preventDefault();
        performOperation("/");
      } else if (e.key === "Enter" || e.key === "=") {
        e.preventDefault();
        performOperation("=");
      } else if (e.key === "Escape") {
        e.preventDefault();
        setIsOpen(false);
      } else if (e.key === "Backspace") {
        e.preventDefault();
        backspace();
      }
    };

    const handleOpen = () => setIsOpen(true);

    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-calculator", handleOpen);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-calculator", handleOpen);
    };
  }, [isOpen, display, previousValue, operator, waitingForOperand]);

  const buttons = [
    { label: "C", action: clearAll, className: "bg-red-500/20 text-red-400 hover:bg-red-500/30" },
    { label: "±", action: toggleSign, className: "bg-slate-700 text-white hover:bg-slate-600" },
    { label: "%", action: inputPercent, className: "bg-slate-700 text-white hover:bg-slate-600" },
    { label: "÷", action: () => performOperation("/"), className: "bg-[var(--theme-primary)] text-white hover:opacity-80" },
    { label: "7", action: () => inputDigit("7"), className: "bg-slate-700 text-white hover:bg-slate-600" },
    { label: "8", action: () => inputDigit("8"), className: "bg-slate-700 text-white hover:bg-slate-600" },
    { label: "9", action: () => inputDigit("9"), className: "bg-slate-700 text-white hover:bg-slate-600" },
    { label: "×", action: () => performOperation("*"), className: "bg-[var(--theme-primary)] text-white hover:opacity-80" },
    { label: "4", action: () => inputDigit("4"), className: "bg-slate-700 text-white hover:bg-slate-600" },
    { label: "5", action: () => inputDigit("5"), className: "bg-slate-700 text-white hover:bg-slate-600" },
    { label: "6", action: () => inputDigit("6"), className: "bg-slate-700 text-white hover:bg-slate-600" },
    { label: "-", action: () => performOperation("-"), className: "bg-[var(--theme-primary)] text-white hover:opacity-80" },
    { label: "1", action: () => inputDigit("1"), className: "bg-slate-700 text-white hover:bg-slate-600" },
    { label: "2", action: () => inputDigit("2"), className: "bg-slate-700 text-white hover:bg-slate-600" },
    { label: "3", action: () => inputDigit("3"), className: "bg-slate-700 text-white hover:bg-slate-600" },
    { label: "+", action: () => performOperation("+"), className: "bg-[var(--theme-primary)] text-white hover:opacity-80" },
    { label: "0", action: () => inputDigit("0"), className: "col-span-2 bg-slate-700 text-white hover:bg-slate-600" },
    { label: ".", action: inputDot, className: "bg-slate-700 text-white hover:bg-slate-600" },
    { label: "=", action: () => performOperation("="), className: "bg-green-500 text-white hover:bg-green-600" },
  ];

  // No floating button - accessed via Tools Menu
  return (
    <>
      {/* Calculator Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed right-4 bottom-24 md:right-8 md:bottom-24 z-[101]"
            >
              <div className="bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-700 w-72">
                {/* Header */}
                <div className="flex items-center justify-between p-3 border-b border-slate-700 bg-slate-900">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-medium text-white">Quick Calculator</span>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Display */}
                <div ref={inputRef} className="p-4 bg-slate-800">
                  {operator && previousValue !== null && (
                    <div className="text-sm text-right mb-1 font-medium" style={{ color: '#059669' }}>
                      {previousValue} {operator === "*" ? "×" : operator === "/" ? "÷" : operator}
                    </div>
                  )}
                  <div className="text-4xl font-mono text-right truncate font-bold" style={{ color: '#000000' }}>
                    {display}
                  </div>
                </div>

                {/* History */}
                {history.length > 0 && (
                  <div className="px-4 py-2 bg-slate-900 border-t border-slate-700 max-h-20 overflow-y-auto">
                    {history.map((entry, i) => (
                      <div key={i} className="text-xs text-slate-300 text-right">
                        {entry}
                      </div>
                    ))}
                  </div>
                )}

                {/* Buttons */}
                <div className="grid grid-cols-4 gap-1 p-2">
                  {buttons.map((btn, i) => (
                    <button
                      key={i}
                      onClick={btn.action}
                      className={`p-3 rounded-lg text-lg font-medium transition-all hover:scale-105 active:scale-95 ${
                        btn.className || "bg-slate-700 text-white hover:bg-slate-600"
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>

                {/* Keyboard hint */}
                <div className="px-4 py-2 text-center text-xs text-slate-500 border-t border-slate-700">
                  Use keyboard for input • <kbd className="px-1 bg-slate-800 rounded">Esc</kbd> to clear
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
