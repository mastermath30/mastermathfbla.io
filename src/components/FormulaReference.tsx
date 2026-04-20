// i18n-allow-hardcoded
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Copy, Check } from "lucide-react";
import { useTranslations } from "./LanguageProvider";

const getFormulas = (t: (key: string) => string) => ({
  algebra: {
    name: t("Algebra"),
    icon: "📐",
    color: "from-blue-500 to-indigo-600",
    accent: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800",
    badge: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
    items: [
      { name: "Quadratic Formula", formula: "x = (-b ± √(b²-4ac)) / 2a" },
      { name: "Discriminant", formula: "Δ = b² - 4ac" },
      { name: "Vertex Form", formula: "y = a(x - h)² + k" },
      { name: "Completing the Square", formula: "x² + bx + (b/2)² = (x + b/2)²" },
      { name: "Vieta's Formulas", formula: "x₁ + x₂ = -b/a,  x₁·x₂ = c/a" },
      { name: "Slope", formula: "m = (y₂ - y₁) / (x₂ - x₁)" },
      { name: "Point-Slope Form", formula: "y - y₁ = m(x - x₁)" },
      { name: "Slope-Intercept Form", formula: "y = mx + b" },
      { name: "Standard Form", formula: "Ax + By = C" },
      { name: "Distance Formula", formula: "d = √((x₂-x₁)² + (y₂-y₁)²)" },
      { name: "Midpoint Formula", formula: "M = ((x₁+x₂)/2, (y₁+y₂)/2)" },
      { name: "Difference of Squares", formula: "a² - b² = (a+b)(a-b)" },
      { name: "Perfect Square Trinomial", formula: "a² ± 2ab + b² = (a ± b)²" },
      { name: "Sum of Cubes", formula: "a³ + b³ = (a + b)(a² - ab + b²)" },
      { name: "Difference of Cubes", formula: "a³ - b³ = (a - b)(a² + ab + b²)" },
      { name: "Binomial Theorem", formula: "(a+b)ⁿ = Σ C(n,k)aⁿ⁻ᵏbᵏ" },
      { name: "Arithmetic Sequence", formula: "aₙ = a₁ + (n-1)d" },
      { name: "Arithmetic Series Sum", formula: "Sₙ = n/2 · (a₁ + aₙ)" },
      { name: "Geometric Sequence", formula: "aₙ = a₁ · rⁿ⁻¹" },
      { name: "Geometric Series Sum", formula: "Sₙ = a₁(1 - rⁿ) / (1 - r)" },
      { name: "Infinite Geometric Series", formula: "S = a₁ / (1 - r),  |r| < 1" },
      { name: "Compound Interest", formula: "A = P(1 + r/n)ⁿᵗ" },
      { name: "Logarithm Definition", formula: "y = logₐ(x)  ⟺  aʸ = x" },
      { name: "Change of Base", formula: "logₐ(x) = log(x) / log(a)" },
      { name: "Log Product Rule", formula: "log(xy) = log(x) + log(y)" },
      { name: "Log Quotient Rule", formula: "log(x/y) = log(x) - log(y)" },
      { name: "Log Power Rule", formula: "log(xⁿ) = n · log(x)" },
      { name: "Euler's Formula", formula: "e^(iθ) = cos(θ) + i·sin(θ)" },
    ],
  },
  geometry: {
    name: t("Geometry"),
    icon: "📏",
    color: "from-emerald-500 to-teal-600",
    accent: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800",
    badge: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300",
    items: [
      { name: "Pythagorean Theorem", formula: "a² + b² = c²" },
      { name: "Area of Triangle", formula: "A = ½ · b · h" },
      { name: "Heron's Formula", formula: "A = √(s(s-a)(s-b)(s-c))" },
      { name: "Area of Rectangle", formula: "A = l · w" },
      { name: "Perimeter of Rectangle", formula: "P = 2(l + w)" },
      { name: "Area of Parallelogram", formula: "A = b · h" },
      { name: "Area of Trapezoid", formula: "A = ½(b₁ + b₂) · h" },
      { name: "Area of Rhombus", formula: "A = ½ · d₁ · d₂" },
      { name: "Interior Angle Sum", formula: "S = (n - 2) · 180°" },
      { name: "Each Interior Angle", formula: "θ = (n - 2) · 180° / n" },
      { name: "Area of Circle", formula: "A = πr²" },
      { name: "Circumference", formula: "C = 2πr = πd" },
      { name: "Arc Length", formula: "s = rθ  (radians)" },
      { name: "Sector Area", formula: "A = ½r²θ  (radians)" },
      { name: "Area of Ellipse", formula: "A = πab" },
      { name: "Volume of Cube", formula: "V = s³" },
      { name: "Surface Area of Cube", formula: "SA = 6s²" },
      { name: "Volume of Rectangular Prism", formula: "V = l · w · h" },
      { name: "Volume of Cylinder", formula: "V = πr²h" },
      { name: "Surface Area of Cylinder", formula: "SA = 2πr(r + h)" },
      { name: "Volume of Sphere", formula: "V = (4/3)πr³" },
      { name: "Surface Area of Sphere", formula: "SA = 4πr²" },
      { name: "Volume of Cone", formula: "V = (1/3)πr²h" },
      { name: "Volume of Pyramid", formula: "V = (1/3) · B · h" },
      { name: "Circle Equation", formula: "(x-h)² + (y-k)² = r²" },
      { name: "Ellipse Equation", formula: "(x-h)²/a² + (y-k)²/b² = 1" },
    ],
  },
  trigonometry: {
    name: t("Trigonometry"),
    icon: "📊",
    color: "from-orange-500 to-amber-600",
    accent: "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800",
    badge: "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300",
    items: [
      { name: "Sine (SOH)", formula: "sin θ = opposite / hypotenuse" },
      { name: "Cosine (CAH)", formula: "cos θ = adjacent / hypotenuse" },
      { name: "Tangent (TOA)", formula: "tan θ = opposite / adjacent" },
      { name: "Cosecant", formula: "csc θ = 1 / sin θ" },
      { name: "Secant", formula: "sec θ = 1 / cos θ" },
      { name: "Cotangent", formula: "cot θ = 1 / tan θ" },
      { name: "Pythagorean Identity", formula: "sin²θ + cos²θ = 1" },
      { name: "Identity 2", formula: "1 + tan²θ = sec²θ" },
      { name: "Identity 3", formula: "1 + cot²θ = csc²θ" },
      { name: "Law of Sines", formula: "a/sin A = b/sin B = c/sin C" },
      { name: "Law of Cosines", formula: "c² = a² + b² - 2ab · cos C" },
      { name: "Area with Two Sides", formula: "A = ½ab · sin C" },
      { name: "Sum Identity (sin)", formula: "sin(α ± β) = sin α cos β ± cos α sin β" },
      { name: "Sum Identity (cos)", formula: "cos(α ± β) = cos α cos β ∓ sin α sin β" },
      { name: "Double Angle (sin)", formula: "sin 2θ = 2 sin θ cos θ" },
      { name: "Double Angle (cos)", formula: "cos 2θ = cos²θ - sin²θ" },
      { name: "Half Angle (sin)", formula: "sin(θ/2) = ±√((1 - cos θ)/2)" },
      { name: "Half Angle (cos)", formula: "cos(θ/2) = ±√((1 + cos θ)/2)" },
      { name: "Radians ↔ Degrees", formula: "degrees = radians × 180/π" },
      { name: "Unit Circle (30°)", formula: "sin 30° = ½,  cos 30° = √3/2" },
      { name: "Unit Circle (45°)", formula: "sin 45° = √2/2,  cos 45° = √2/2" },
      { name: "Unit Circle (60°)", formula: "sin 60° = √3/2,  cos 60° = ½" },
    ],
  },
  precalculus: {
    name: t("Pre-Calculus"),
    icon: "🔢",
    color: "from-violet-500 to-purple-600",
    accent: "bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800",
    badge: "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300",
    items: [
      { name: "Composition", formula: "(f∘g)(x) = f(g(x))" },
      { name: "Inverse Function", formula: "f⁻¹(f(x)) = x" },
      { name: "Even Function", formula: "f(-x) = f(x)" },
      { name: "Odd Function", formula: "f(-x) = -f(x)" },
      { name: "Polynomial Degree n", formula: "f(x) = aₙxⁿ + aₙ₋₁xⁿ⁻¹ + … + a₀" },
      { name: "Rational Function", formula: "f(x) = P(x) / Q(x)" },
      { name: "Vertical Asymptote", formula: "Q(x) = 0  (denominator = 0)" },
      { name: "Polar Coordinates", formula: "r = √(x² + y²),  θ = arctan(y/x)" },
      { name: "Rectangular to Polar", formula: "x = r cos θ,  y = r sin θ" },
      { name: "Vector Magnitude", formula: "|v| = √(a² + b²)" },
      { name: "Dot Product", formula: "u·v = u₁v₁ + u₂v₂ = |u||v|cos θ" },
      { name: "Matrix Determinant 2×2", formula: "det = ad - bc" },
      { name: "Sigma Notation", formula: "Σᵢ₌₁ⁿ aᵢ = a₁ + a₂ + … + aₙ" },
      { name: "Sum of First n Integers", formula: "Σk = n(n+1)/2" },
      { name: "Mathematical Induction", formula: "Prove P(1), then P(k) ⟹ P(k+1)" },
    ],
  },
  calculus: {
    name: t("Calculus"),
    icon: "∫",
    color: "from-rose-500 to-pink-600",
    accent: "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800",
    badge: "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300",
    items: [
      { name: "Limit Definition", formula: "lim(x→a) f(x) = L" },
      { name: "Derivative Definition", formula: "f′(x) = lim(h→0) [f(x+h) - f(x)] / h" },
      { name: "Power Rule", formula: "d/dx [xⁿ] = n·xⁿ⁻¹" },
      { name: "Product Rule", formula: "d/dx [f·g] = f′g + fg′" },
      { name: "Quotient Rule", formula: "d/dx [f/g] = (f′g - fg′) / g²" },
      { name: "Chain Rule", formula: "d/dx [f(g(x))] = f′(g(x)) · g′(x)" },
      { name: "d/dx [eˣ]", formula: "d/dx [eˣ] = eˣ" },
      { name: "d/dx [ln x]", formula: "d/dx [ln x] = 1/x" },
      { name: "d/dx [sin x]", formula: "d/dx [sin x] = cos x" },
      { name: "d/dx [cos x]", formula: "d/dx [cos x] = -sin x" },
      { name: "L'Hôpital's Rule", formula: "lim f/g = lim f′/g′  (0/0 or ∞/∞)" },
      { name: "Mean Value Theorem", formula: "f′(c) = [f(b) - f(a)] / (b - a)" },
      { name: "Power Rule (Integral)", formula: "∫xⁿdx = xⁿ⁺¹/(n+1) + C" },
      { name: "∫ 1/x dx", formula: "∫(1/x) dx = ln|x| + C" },
      { name: "∫ eˣ dx", formula: "∫eˣ dx = eˣ + C" },
      { name: "U-Substitution", formula: "∫f(g(x))g′(x)dx = ∫f(u)du" },
      { name: "Integration by Parts", formula: "∫u dv = uv - ∫v du" },
      { name: "Fundamental Theorem", formula: "∫ₐᵇ f(x)dx = F(b) - F(a)" },
      { name: "Area Between Curves", formula: "A = ∫ₐᵇ [f(x) - g(x)] dx" },
      { name: "Volume (Disk)", formula: "V = π ∫ₐᵇ [R(x)]² dx" },
      { name: "Volume (Shell)", formula: "V = 2π ∫ₐᵇ x·f(x) dx" },
      { name: "Arc Length", formula: "L = ∫ₐᵇ √(1 + [f′(x)]²) dx" },
    ],
  },
  statistics: {
    name: t("Statistics"),
    icon: "📈",
    color: "from-cyan-500 to-sky-600",
    accent: "bg-cyan-50 dark:bg-cyan-950/30 border-cyan-200 dark:border-cyan-800",
    badge: "bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300",
    items: [
      { name: "Population Mean", formula: "μ = Σxᵢ / N" },
      { name: "Sample Mean", formula: "x̄ = Σxᵢ / n" },
      { name: "Population Variance", formula: "σ² = Σ(xᵢ - μ)² / N" },
      { name: "Sample Variance", formula: "s² = Σ(xᵢ - x̄)² / (n - 1)" },
      { name: "Standard Deviation", formula: "σ = √(σ²)" },
      { name: "Standard Error", formula: "SE = s / √n" },
      { name: "Z-Score", formula: "z = (x - μ) / σ" },
      { name: "Interquartile Range", formula: "IQR = Q₃ - Q₁" },
      { name: "Permutation", formula: "P(n,r) = n! / (n-r)!" },
      { name: "Combination", formula: "C(n,r) = n! / (r!(n-r)!)" },
      { name: "Basic Probability", formula: "P(A) = n(A) / n(S)" },
      { name: "Addition Rule", formula: "P(A∪B) = P(A) + P(B) - P(A∩B)" },
      { name: "Conditional Probability", formula: "P(A|B) = P(A∩B) / P(B)" },
      { name: "Bayes' Theorem", formula: "P(A|B) = P(B|A)·P(A) / P(B)" },
      { name: "Expected Value", formula: "E(X) = Σ[xᵢ · P(xᵢ)]" },
      { name: "Binomial Distribution", formula: "P(X=k) = C(n,k)·pᵏ·(1-p)ⁿ⁻ᵏ" },
      { name: "Normal Distribution", formula: "f(x) = (1/σ√(2π))·e^(-(x-μ)²/(2σ²))" },
      { name: "Empirical Rule", formula: "68% ±1σ,  95% ±2σ,  99.7% ±3σ" },
      { name: "Confidence Interval", formula: "x̄ ± z* · (σ/√n)" },
      { name: "Linear Regression", formula: "ŷ = b₀ + b₁x" },
      { name: "Correlation Coefficient", formula: "r = Σ[(xᵢ-x̄)(yᵢ-ȳ)] / √[Σ(xᵢ-x̄)²·Σ(yᵢ-ȳ)²]" },
      { name: "Chi-Square Test", formula: "χ² = Σ[(O - E)² / E]" },
    ],
  },
});

type CategoryKey = "algebra" | "geometry" | "trigonometry" | "precalculus" | "calculus" | "statistics";

export function FormulaReference() {
  const { t } = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("algebra");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  const formulas = getFormulas(t);

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
    
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-formulas", handleOpen);
    return () => {
      window.removeEventListener("open-formulas", handleOpen);
    };
  }, []);

  const handleCopy = (formula: string, index: number) => {
    navigator.clipboard.writeText(formula);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const activeData = formulas[activeCategory];

  const filteredFormulas = searchQuery
    ? Object.entries(formulas).flatMap(([key, cat]) =>
        cat.items
          .filter(
            (item) =>
              item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.formula.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((item) => ({ ...item, categoryKey: key as CategoryKey, categoryName: cat.name, categoryIcon: cat.icon }))
      )
    : activeData.items.map((item) => ({
        ...item,
        categoryKey: activeCategory,
        categoryName: activeData.name,
        categoryIcon: activeData.icon,
      }));

  return (
    <>
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
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 28, stiffness: 350 }}
              className="fixed left-1/2 top-1/2 z-[301] max-h-[88vh] w-[95%] max-w-4xl -translate-x-1/2 -translate-y-1/2"
            >
              <div className="flex max-h-[88vh] flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(30,41,59,0.98)_0%,rgba(15,23,42,0.98)_18%,rgba(2,6,23,0.99)_100%)] shadow-[0_32px_90px_rgba(2,6,23,0.68)]">
                {/* Header */}
                <div className={`relative flex items-center justify-between border-b border-white/10 bg-gradient-to-r px-6 py-5 ${activeData.color}`}>
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/12 text-xl shadow-[0_10px_28px_rgba(15,23,42,0.2)]">
                      {activeData.icon}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white sm:text-xl">{t("Formula Reference")}</h2>
                      <p className="mt-1 text-sm text-white/72">
                        {activeData.name} • {activeData.items.length} {t("formulas")}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="rounded-2xl border border-transparent p-2.5 text-white/80 transition-colors hover:border-white/15 hover:bg-white/12 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="border-b border-white/8 bg-slate-950/30 px-5 py-4 sm:px-6">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t("Search formulas...")}
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.05] py-3 pl-11 pr-4 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-400/60"
                    />
                  </div>

                  {/* Category Tabs */}
                  {!searchQuery && (
                    <div className="mt-4 space-y-2.5">
                      <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                        {t("Browse By Category")}
                      </p>
                      <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-2">
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(formulas).map(([key, cat]) => (
                            <button
                              key={key}
                              onClick={() => setActiveCategory(key as CategoryKey)}
                              className={`inline-flex min-h-11 items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition-all ${
                                activeCategory === key
                                  ? `border-white/15 bg-gradient-to-r ${cat.color} text-white shadow-[0_10px_24px_rgba(15,23,42,0.18)]`
                                  : "border-white/8 bg-white/[0.04] text-slate-300 hover:bg-white/[0.07] hover:text-white"
                              }`}
                            >
                              <span className="text-base leading-none">{cat.icon}</span>
                              <span>{cat.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Formulas Grid */}
                <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
                  {filteredFormulas.length === 0 ? (
                    <div className="py-14 text-center text-slate-400">
                      <Search className="mx-auto mb-3 h-8 w-8 opacity-50" />
                      <p className="text-sm">{t("No formulas found")}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredFormulas.map((item, i) => {
                        const catData = formulas[item.categoryKey];
                        return (
                          <motion.div
                            key={`${item.categoryKey}-${i}`}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: Math.min(i * 0.02, 0.3) }}
                            className={`group relative overflow-hidden rounded-2xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_34px_rgba(2,6,23,0.18)] sm:p-5 ${catData.accent} bg-white/95 dark:bg-slate-900/78`}
                          >
                            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-70" />
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <div className="mb-3 flex flex-wrap items-center gap-2">
                                  {searchQuery && (
                                    <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${catData.badge}`}>
                                      {item.categoryIcon} {item.categoryName}
                                    </span>
                                  )}
                                  <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                                    {item.name}
                                  </h4>
                                </div>
                                <p className="font-mono text-lg leading-relaxed text-slate-900 break-words dark:text-slate-50 sm:text-[1.32rem]">
                                  {item.formula}
                                </p>
                              </div>
                              <button
                                onClick={() => handleCopy(item.formula, i)}
                                className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-black/5 bg-white/70 text-slate-500 opacity-0 transition-all hover:bg-white focus:opacity-100 group-hover:opacity-100 dark:border-white/10 dark:bg-slate-800/85 dark:text-slate-400 dark:hover:bg-slate-800"
                                title={t("Copy")}
                              >
                                {copiedIndex === i ? (
                                  <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="border-t border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.82)_0%,rgba(2,6,23,0.95)_100%)] px-5 py-3 sm:px-6">
                  <div className="flex flex-col gap-2 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                    <p>{t("Use search to scan every category, or browse formulas by subject.")}</p>
                    <div className="inline-flex items-center gap-2 text-slate-500">
                      <kbd className="rounded-md border border-white/10 bg-white/[0.06] px-2 py-1 font-mono text-[10px] text-slate-300">Alt+R</kbd>
                      <span>{t("Toggle reference")}</span>
                    </div>
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
