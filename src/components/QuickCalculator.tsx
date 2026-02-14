"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, X } from "lucide-react";
import { useTranslations } from "./LanguageProvider";

export function QuickCalculator() {
  const { t } = useTranslations();
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

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, display, previousValue, operator, waitingForOperand]);

  // Separate effect for handling the custom event (no dependencies to avoid re-registering)
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-calculator", handleOpen);
    return () => {
      window.removeEventListener("open-calculator", handleOpen);
    };
  }, []);

  // Scientific functions
  const inputPi = () => {
    setDisplay(String(Math.PI));
    setWaitingForOperand(false);
  };

  const inputE = () => {
    setDisplay(String(Math.E));
    setWaitingForOperand(false);
  };

  const performScientificOperation = (operation: string) => {
    const value = parseFloat(display);
    let result: number;

    switch (operation) {
      case "sin":
        result = Math.sin(value);
        break;
      case "cos":
        result = Math.cos(value);
        break;
      case "tan":
        result = Math.tan(value);
        break;
      case "sqrt":
        result = Math.sqrt(value);
        break;
      case "square":
        result = value * value;
        break;
      case "cube":
        result = value * value * value;
        break;
      case "log":
        result = Math.log10(value);
        break;
      case "ln":
        result = Math.log(value);
        break;
      case "exp":
        result = Math.exp(value);
        break;
      case "factorial":
        result = 1;
        for (let i = 2; i <= value; i++) {
          result *= i;
        }
        break;
      case "inverse":
        result = 1 / value;
        break;
      default:
        return;
    }

    result = Math.round(result * 100000000) / 100000000;
    setDisplay(String(result));
    setWaitingForOperand(true);
  };

  const buttons = [
    { label: "C", action: clearAll, className: "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/60" },
    { label: "( )", action: () => {}, className: "bg-slate-700 text-slate-200 hover:bg-slate-600" },
    { label: "%", action: inputPercent, className: "bg-slate-700 text-slate-200 hover:bg-slate-600" },
    { label: "÷", action: () => performOperation("/"), className: "bg-emerald-600 text-white hover:bg-emerald-700" },
    { label: "sin", action: () => performScientificOperation("sin"), className: "bg-slate-700 text-slate-200 hover:bg-slate-600 text-xs" },
    { label: "cos", action: () => performScientificOperation("cos"), className: "bg-slate-700 text-slate-200 hover:bg-slate-600 text-xs" },
    { label: "tan", action: () => performScientificOperation("tan"), className: "bg-slate-700 text-slate-200 hover:bg-slate-600 text-xs" },
    { label: "×", action: () => performOperation("*"), className: "bg-emerald-600 text-white hover:bg-emerald-700" },
    { label: "π", action: inputPi, className: "bg-slate-700 text-slate-200 hover:bg-slate-600" },
    { label: "e", action: inputE, className: "bg-slate-700 text-slate-200 hover:bg-slate-600" },
    { label: "√", action: () => performScientificOperation("sqrt"), className: "bg-slate-700 text-slate-200 hover:bg-slate-600" },
    { label: "-", action: () => performOperation("-"), className: "bg-emerald-600 text-white hover:bg-emerald-700" },
    { label: "x²", action: () => performScientificOperation("square"), className: "bg-slate-700 text-slate-200 hover:bg-slate-600 text-xs" },
    { label: "x³", action: () => performScientificOperation("cube"), className: "bg-slate-700 text-slate-200 hover:bg-slate-600 text-xs" },
    { label: "log", action: () => performScientificOperation("log"), className: "bg-slate-700 text-slate-200 hover:bg-slate-600 text-xs" },
    { label: "+", action: () => performOperation("+"), className: "bg-emerald-600 text-white hover:bg-emerald-700" },
    { label: "7", action: () => inputDigit("7"), className: "bg-slate-800 text-slate-100 hover:bg-slate-700" },
    { label: "8", action: () => inputDigit("8"), className: "bg-slate-800 text-slate-100 hover:bg-slate-700" },
    { label: "9", action: () => inputDigit("9"), className: "bg-slate-800 text-slate-100 hover:bg-slate-700" },
    { label: "ln", action: () => performScientificOperation("ln"), className: "bg-slate-700 text-slate-200 hover:bg-slate-600 text-xs" },
    { label: "4", action: () => inputDigit("4"), className: "bg-slate-800 text-slate-100 hover:bg-slate-700" },
    { label: "5", action: () => inputDigit("5"), className: "bg-slate-800 text-slate-100 hover:bg-slate-700" },
    { label: "6", action: () => inputDigit("6"), className: "bg-slate-800 text-slate-100 hover:bg-slate-700" },
    { label: "1/x", action: () => performScientificOperation("inverse"), className: "bg-slate-700 text-slate-200 hover:bg-slate-600 text-xs" },
    { label: "1", action: () => inputDigit("1"), className: "bg-slate-800 text-slate-100 hover:bg-slate-700" },
    { label: "2", action: () => inputDigit("2"), className: "bg-slate-800 text-slate-100 hover:bg-slate-700" },
    { label: "3", action: () => inputDigit("3"), className: "bg-slate-800 text-slate-100 hover:bg-slate-700" },
    { label: "x!", action: () => performScientificOperation("factorial"), className: "bg-slate-700 text-slate-200 hover:bg-slate-600 text-xs" },
    { label: "0", action: () => inputDigit("0"), className: "bg-slate-800 text-slate-100 hover:bg-slate-700" },
    { label: ".", action: inputDot, className: "bg-slate-800 text-slate-100 hover:bg-slate-700" },
    { label: "±", action: toggleSign, className: "bg-slate-700 text-slate-200 hover:bg-slate-600" },
    { label: "=", action: () => performOperation("="), className: "bg-green-600 text-white hover:bg-green-700" },
  ];

  return (
    <>
      {/* Calculator Modal - No floating button, accessed via Tools Menu */}
      <AnimatePresence>
        {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed right-4 bottom-24 md:right-8 md:bottom-24 z-[101] w-80"
            >
              <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-3 border-b border-slate-700 bg-slate-900">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-medium text-white">{t("Quick Calculator")}</span>
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
                    <div className="text-sm text-right mb-1 font-medium text-emerald-400">
                      {previousValue} {operator === "*" ? "×" : operator === "/" ? "÷" : operator}
                    </div>
                  )}
                  <div className="text-4xl font-mono text-right truncate font-bold text-white">
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

                {/* Buttons - 4 columns, scientific layout */}
                <div className="grid grid-cols-4 gap-1 p-2 max-h-[400px] overflow-y-auto">
                  {buttons.map((btn, i) => (
                    <button
                      key={i}
                      onClick={btn.action}
                      className={`p-2.5 rounded-lg font-medium transition-all hover:scale-105 active:scale-95 ${
                        btn.className || "bg-slate-700 text-slate-200 hover:bg-slate-600"
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>

                {/* Keyboard hint */}
                <div className="px-4 py-2 text-center text-xs text-slate-500 border-t border-slate-700">
                  Press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-xs">Esc</kbd> to close • Alt+C to toggle
                </div>
              </div>
            </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
