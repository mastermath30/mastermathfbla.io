"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, X, Search, ChevronRight } from "lucide-react";

const formulas = {
  algebra: {
    name: "Algebra",
    icon: "📐",
    items: [
      { name: "Quadratic Formula", formula: "x = (-b ± √(b²-4ac)) / 2a" },
      { name: "Slope", formula: "m = (y₂ - y₁) / (x₂ - x₁)" },
      { name: "Point-Slope Form", formula: "y - y₁ = m(x - x₁)" },
      { name: "Slope-Intercept Form", formula: "y = mx + b" },
      { name: "Standard Form", formula: "Ax + By = C" },
      { name: "Distance Formula", formula: "d = √((x₂-x₁)² + (y₂-y₁)²)" },
      { name: "Midpoint Formula", formula: "M = ((x₁+x₂)/2, (y₁+y₂)/2)" },
      { name: "Difference of Squares", formula: "a² - b² = (a+b)(a-b)" },
      { name: "Perfect Square Trinomial", formula: "a² ± 2ab + b² = (a ± b)²" },
    ],
  },
  geometry: {
    name: "Geometry",
    icon: "📏",
    items: [
      { name: "Area of Circle", formula: "A = πr²" },
      { name: "Circumference", formula: "C = 2πr" },
      { name: "Area of Triangle", formula: "A = ½bh" },
      { name: "Area of Rectangle", formula: "A = lw" },
      { name: "Pythagorean Theorem", formula: "a² + b² = c²" },
      { name: "Volume of Sphere", formula: "V = (4/3)πr³" },
      { name: "Surface Area of Sphere", formula: "SA = 4πr²" },
      { name: "Volume of Cylinder", formula: "V = πr²h" },
      { name: "Volume of Cone", formula: "V = (1/3)πr²h" },
    ],
  },
  trigonometry: {
    name: "Trigonometry",
    icon: "📊",
    items: [
      { name: "Sine", formula: "sin θ = opposite / hypotenuse" },
      { name: "Cosine", formula: "cos θ = adjacent / hypotenuse" },
      { name: "Tangent", formula: "tan θ = opposite / adjacent" },
      { name: "Pythagorean Identity", formula: "sin²θ + cos²θ = 1" },
      { name: "Law of Sines", formula: "a/sin A = b/sin B = c/sin C" },
      { name: "Law of Cosines", formula: "c² = a² + b² - 2ab·cos C" },
      { name: "Double Angle (sin)", formula: "sin 2θ = 2 sin θ cos θ" },
      { name: "Double Angle (cos)", formula: "cos 2θ = cos²θ - sin²θ" },
    ],
  },
  calculus: {
    name: "Calculus",
    icon: "∫",
    items: [
      { name: "Power Rule", formula: "d/dx [xⁿ] = nxⁿ⁻¹" },
      { name: "Product Rule", formula: "d/dx [fg] = f'g + fg'" },
      { name: "Quotient Rule", formula: "d/dx [f/g] = (f'g - fg') / g²" },
      { name: "Chain Rule", formula: "d/dx [f(g(x))] = f'(g(x)) · g'(x)" },
      { name: "Derivative of eˣ", formula: "d/dx [eˣ] = eˣ" },
      { name: "Derivative of ln x", formula: "d/dx [ln x] = 1/x" },
      { name: "Integral of xⁿ", formula: "∫xⁿdx = xⁿ⁺¹/(n+1) + C" },
      { name: "Integral of eˣ", formula: "∫eˣdx = eˣ + C" },
    ],
  },
  statistics: {
    name: "Statistics",
    icon: "📈",
    items: [
      { name: "Mean", formula: "x̄ = Σxᵢ / n" },
      { name: "Variance", formula: "σ² = Σ(xᵢ - x̄)² / n" },
      { name: "Standard Deviation", formula: "σ = √(Σ(xᵢ - x̄)² / n)" },
      { name: "Z-Score", formula: "z = (x - μ) / σ" },
      { name: "Combination", formula: "C(n,r) = n! / (r!(n-r)!)" },
      { name: "Permutation", formula: "P(n,r) = n! / (n-r)!" },
      { name: "Probability", formula: "P(A) = n(A) / n(S)" },
    ],
  },
};

type CategoryKey = keyof typeof formulas;

export function FormulaReference() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("algebra");
  const [searchQuery, setSearchQuery] = useState("");

  // Keyboard shortcut: Alt + R
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === "r") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    
    const handleOpen = () => setIsOpen(true);
    
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-formulas", handleOpen);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-formulas", handleOpen);
    };
  }, [isOpen]);

  const filteredFormulas = searchQuery
    ? Object.values(formulas).flatMap((cat) =>
        cat.items.filter(
          (item) =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.formula.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : formulas[activeCategory].items;

  // No floating button - accessed via Tools Menu
  return (
    <>
      {/* Formula Reference Modal */}
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
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[301] w-[95%] max-w-2xl max-h-[80vh]"
            >
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 flex flex-col max-h-[80vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-violet-500 to-purple-600">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-white" />
                    <span className="font-semibold text-white">Formula Reference</span>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded hover:bg-white/20 text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Search */}
                <div className="p-3 border-b border-slate-200 dark:border-slate-700">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search formulas..."
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                </div>

                {/* Category Tabs */}
                {!searchQuery && (
                  <div className="flex overflow-x-auto p-2 gap-2 border-b border-slate-200 dark:border-slate-700">
                    {Object.entries(formulas).map(([key, cat]) => (
                      <button
                        key={key}
                        onClick={() => setActiveCategory(key as CategoryKey)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                          activeCategory === key
                            ? "bg-violet-500 text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.name}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Formulas List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {filteredFormulas.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      No formulas found
                    </div>
                  ) : (
                    filteredFormulas.map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                      >
                        <div>
                          <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {item.name}
                          </div>
                          <div className="font-mono text-lg text-violet-600 dark:text-violet-400">
                            {item.formula}
                          </div>
                        </div>
                        <button
                          onClick={() => navigator.clipboard.writeText(item.formula)}
                          className="opacity-0 group-hover:opacity-100 px-2 py-1 text-xs bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded transition-opacity"
                        >
                          Copy
                        </button>
                      </motion.div>
                    ))
                  )}
                </div>

                {/* Footer */}
                <div className="p-2 text-center text-xs text-slate-500 border-t border-slate-200 dark:border-slate-700">
                  Press <kbd className="px-1 bg-slate-200 dark:bg-slate-700 rounded">Alt+R</kbd> to toggle
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
