"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRightLeft, X, ChevronDown } from "lucide-react";
import { useTranslations } from "./LanguageProvider";

// Category definitions (names will be translated in component)
const getCategories = (t: (key: string) => string) => ({
  length: {
    name: t("Length"),
    units: {
      meters: 1,
      kilometers: 0.001,
      centimeters: 100,
      millimeters: 1000,
      miles: 0.000621371,
      yards: 1.09361,
      feet: 3.28084,
      inches: 39.3701,
    },
  },
  weight: {
    name: t("Weight"),
    units: {
      kilograms: 1,
      grams: 1000,
      milligrams: 1000000,
      pounds: 2.20462,
      ounces: 35.274,
      tons: 0.001,
    },
  },
  temperature: {
    name: t("Temperature"),
    units: {
      celsius: "C",
      fahrenheit: "F",
      kelvin: "K",
    },
  },
  area: {
    name: t("Area"),
    units: {
      "square meters": 1,
      "square kilometers": 0.000001,
      "square feet": 10.7639,
      "square yards": 1.19599,
      acres: 0.000247105,
      hectares: 0.0001,
    },
  },
  volume: {
    name: t("Volume"),
    units: {
      liters: 1,
      milliliters: 1000,
      gallons: 0.264172,
      quarts: 1.05669,
      pints: 2.11338,
      cups: 4.22675,
    },
  },
  time: {
    name: t("Time"),
    units: {
      seconds: 1,
      minutes: 1 / 60,
      hours: 1 / 3600,
      days: 1 / 86400,
      weeks: 1 / 604800,
      years: 1 / 31536000,
    },
  },
});

type CategoryKey = "length" | "weight" | "temperature" | "area" | "volume" | "time";

export function UnitConverter() {
  const { t } = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState<CategoryKey>("length");
  const [fromUnit, setFromUnit] = useState("meters");
  const [toUnit, setToUnit] = useState("feet");
  const [fromValue, setFromValue] = useState("1");
  const [result, setResult] = useState("");
  
  const categories = getCategories(t);

  const convertTemperature = (value: number, from: string, to: string): number => {
    let celsius: number;
    
    // Convert to Celsius first
    if (from === "celsius") celsius = value;
    else if (from === "fahrenheit") celsius = (value - 32) * 5/9;
    else celsius = value - 273.15; // kelvin
    
    // Convert from Celsius to target
    if (to === "celsius") return celsius;
    else if (to === "fahrenheit") return celsius * 9/5 + 32;
    else return celsius + 273.15; // kelvin
  };

  const convert = () => {
    const value = parseFloat(fromValue);
    if (isNaN(value)) {
      setResult("");
      return;
    }

    if (category === "temperature") {
      const converted = convertTemperature(value, fromUnit, toUnit);
      setResult(converted.toFixed(4).replace(/\.?0+$/, ""));
    } else {
      const units = categories[category].units as Record<string, number>;
      const baseValue = value / units[fromUnit];
      const converted = baseValue * units[toUnit];
      setResult(converted.toFixed(6).replace(/\.?0+$/, ""));
    }
  };

  useEffect(() => {
    convert();
  }, [fromValue, fromUnit, toUnit, category]);

  useEffect(() => {
    const units = Object.keys(categories[category].units);
    setFromUnit(units[0]);
    setToUnit(units[1] || units[0]);
  }, [category]);

  const swapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    setFromValue(result);
  };

  // Keyboard shortcut: Alt + U
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === "u") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Separate effect for handling the custom event (no dependencies to avoid re-registering)
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-unit-converter", handleOpen);
    return () => {
      window.removeEventListener("open-unit-converter", handleOpen);
    };
  }, []);

  const currentUnits = Object.keys(categories[category].units);

  // No floating button - accessed via Tools Menu
  return (
    <>
      {/* Converter Modal */}
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
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[301] w-[90%] max-w-md"
            >
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-cyan-500 to-blue-600">
                  <div className="flex items-center gap-2">
                    <ArrowRightLeft className="w-5 h-5 text-white" />
                    <span className="font-semibold text-white">{t("Unit Converter")}</span>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded hover:bg-white/20 text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-4 space-y-4">
                  {/* Category Selector */}
                  <div>
                    <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">{t("Category")}</label>
                    <div className="relative">
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as CategoryKey)}
                        className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 appearance-none cursor-pointer text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      >
                        {Object.entries(categories).map(([key, cat]) => (
                          <option key={key} value={key}>{cat.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* From */}
                  <div>
                    <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">{t("From")}</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={fromValue}
                        onChange={(e) => setFromValue(e.target.value)}
                        className="flex-1 p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        placeholder={t("Enter value")}
                      />
                      <select
                        value={fromUnit}
                        onChange={(e) => setFromUnit(e.target.value)}
                        className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 min-w-[120px]"
                      >
                        {currentUnits.map((unit) => (
                          <option key={unit} value={unit}>{unit}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Swap Button */}
                  <div className="flex justify-center">
                    <button
                      onClick={swapUnits}
                      className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      <ArrowRightLeft className="w-5 h-5 text-cyan-500 rotate-90" />
                    </button>
                  </div>

                  {/* To */}
                  <div>
                    <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">{t("To")}</label>
                    <div className="flex gap-2">
                      <div className="flex-1 p-3 rounded-xl bg-cyan-50 dark:bg-cyan-900/30 border border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300 font-mono text-lg font-semibold">
                        {result || "0"}
                      </div>
                      <select
                        value={toUnit}
                        onChange={(e) => setToUnit(e.target.value)}
                        className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 min-w-[120px]"
                      >
                        {currentUnits.map((unit) => (
                          <option key={unit} value={unit}>{unit}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Quick Info */}
                  <div className="text-center text-sm text-slate-500 dark:text-slate-400 pt-2">
                    {fromValue && result && (
                      <span>{fromValue} {fromUnit} = {result} {toUnit}</span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
