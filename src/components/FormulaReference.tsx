"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, X, Search, ChevronRight } from "lucide-react";
import { useTranslations } from "./LanguageProvider";

// Formula definitions (category names will be translated in component)
const getFormulas = (t: (key: string) => string) => ({
  algebra: {
    name: t("Algebra"),
    icon: "📐",
    items: [
      { name: "Quadratic Formula", formula: "x = (-b ± √(b²-4ac)) / 2a" },
      { name: "Discriminant", formula: "Δ = b² - 4ac (>0: 2 real, =0: 1 real, <0: complex)" },
      { name: "Vertex Form", formula: "y = a(x - h)² + k, vertex: (h,k)" },
      { name: "Completing the Square", formula: "x² + bx + (b/2)² = (x + b/2)²" },
      { name: "Vieta's Formulas", formula: "x₁ + x₂ = -b/a, x₁·x₂ = c/a" },
      { name: "Slope", formula: "m = (y₂ - y₁) / (x₂ - x₁)" },
      { name: "Point-Slope Form", formula: "y - y₁ = m(x - x₁)" },
      { name: "Slope-Intercept Form", formula: "y = mx + b" },
      { name: "Standard Form", formula: "Ax + By = C" },
      { name: "Parallel Lines", formula: "m₁ = m₂" },
      { name: "Perpendicular Lines", formula: "m₁ · m₂ = -1" },
      { name: "Distance Formula", formula: "d = √((x₂-x₁)² + (y₂-y₁)²)" },
      { name: "Midpoint Formula", formula: "M = ((x₁+x₂)/2, (y₁+y₂)/2)" },
      { name: "Section Formula", formula: "P = ((mx₂+nx₁)/(m+n), (my₂+ny₁)/(m+n))" },
      { name: "Difference of Squares", formula: "a² - b² = (a+b)(a-b)" },
      { name: "Perfect Square Trinomial", formula: "a² ± 2ab + b² = (a ± b)²" },
      { name: "Sum of Cubes", formula: "a³ + b³ = (a + b)(a² - ab + b²)" },
      { name: "Difference of Cubes", formula: "a³ - b³ = (a - b)(a² + ab + b²)" },
      { name: "Binomial Theorem", formula: "(a+b)ⁿ = Σ C(n,k)aⁿ⁻ᵏbᵏ" },
      { name: "Pascal's Triangle", formula: "C(n,k) = C(n-1,k-1) + C(n-1,k)" },
      { name: "Arithmetic Sequence", formula: "aₙ = a₁ + (n-1)d" },
      { name: "Arithmetic Series Sum", formula: "Sₙ = n/2(a₁ + aₙ) = n/2(2a₁ + (n-1)d)" },
      { name: "Geometric Sequence", formula: "aₙ = a₁ · rⁿ⁻¹" },
      { name: "Geometric Series Sum", formula: "Sₙ = a₁(1 - rⁿ)/(1 - r), |r| < 1" },
      { name: "Infinite Geometric Series", formula: "S = a₁/(1 - r), |r| < 1" },
      { name: "Exponential Growth", formula: "A = P(1 + r)ᵗ or A = Peʳᵗ" },
      { name: "Exponential Decay", formula: "A = P(1 - r)ᵗ or A = Pe⁻ʳᵗ" },
      { name: "Half-Life", formula: "A = A₀(1/2)ᵗ/ʰ" },
      { name: "Compound Interest", formula: "A = P(1 + r/n)ⁿᵗ" },
      { name: "Continuous Compound", formula: "A = Peʳᵗ" },
      { name: "Logarithm Definition", formula: "y = logₐ(x) ⟺ aʸ = x" },
      { name: "Natural Logarithm", formula: "ln(x) = logₑ(x)" },
      { name: "Change of Base", formula: "logₐ(x) = log(x)/log(a)" },
      { name: "Logarithm Product Rule", formula: "log(xy) = log(x) + log(y)" },
      { name: "Logarithm Quotient Rule", formula: "log(x/y) = log(x) - log(y)" },
      { name: "Logarithm Power Rule", formula: "log(xⁿ) = n·log(x)" },
      { name: "Absolute Value Equation", formula: "|x| = a ⟹ x = ±a" },
      { name: "Absolute Value Inequality", formula: "|x| < a ⟹ -a < x < a" },
      { name: "Rational Zero Theorem", formula: "p/q where p|a₀, q|aₙ" },
      { name: "Remainder Theorem", formula: "f(a) = remainder when f(x) ÷ (x-a)" },
      { name: "Factor Theorem", formula: "(x-a) is factor ⟺ f(a) = 0" },
      { name: "Fundamental Thm Algebra", formula: "Degree n ⟹ n complex roots" },
      { name: "Complex Number Form", formula: "z = a + bi, |z| = √(a²+b²)" },
      { name: "Euler's Formula", formula: "e^(iθ) = cos(θ) + i·sin(θ)" },
    ],
  },
  geometry: {
    name: t("Geometry"),
    icon: "📏",
    items: [
      { name: "Pythagorean Theorem", formula: "a² + b² = c²" },
      { name: "Distance in 3D", formula: "d = √((x₂-x₁)² + (y₂-y₁)² + (z₂-z₁)²)" },
      { name: "Area of Triangle", formula: "A = ½bh" },
      { name: "Heron's Formula", formula: "A = √(s(s-a)(s-b)(s-c)), s = (a+b+c)/2" },
      { name: "Triangle Angle Sum", formula: "A + B + C = 180°" },
      { name: "Similar Triangles", formula: "a₁/a₂ = b₁/b₂ = c₁/c₂" },
      { name: "Area of Square", formula: "A = s²" },
      { name: "Area of Rectangle", formula: "A = lw" },
      { name: "Perimeter of Rectangle", formula: "P = 2(l + w)" },
      { name: "Area of Parallelogram", formula: "A = bh" },
      { name: "Area of Trapezoid", formula: "A = ½(b₁ + b₂)h" },
      { name: "Area of Rhombus", formula: "A = ½d₁d₂" },
      { name: "Area of Kite", formula: "A = ½d₁d₂" },
      { name: "Area of Regular Polygon", formula: "A = ½ap, a=apothem, p=perimeter" },
      { name: "Interior Angle Sum", formula: "S = (n-2)·180°" },
      { name: "Each Interior Angle", formula: "θ = (n-2)·180°/n" },
      { name: "Each Exterior Angle", formula: "θ = 360°/n" },
      { name: "Area of Circle", formula: "A = πr² = π(d/2)²" },
      { name: "Circumference", formula: "C = 2πr = πd" },
      { name: "Arc Length", formula: "s = rθ (radians) or s = (θ/360)·2πr" },
      { name: "Sector Area", formula: "A = ½r²θ (radians) or A = (θ/360)·πr²" },
      { name: "Chord Length", formula: "c = 2r·sin(θ/2)" },
      { name: "Area of Ellipse", formula: "A = πab" },
      { name: "Perimeter of Ellipse", formula: "P ≈ π(3(a+b) - √((3a+b)(a+3b)))" },
      { name: "Volume of Cube", formula: "V = s³" },
      { name: "Surface Area of Cube", formula: "SA = 6s²" },
      { name: "Volume of Rect. Prism", formula: "V = lwh" },
      { name: "Surface Area of Rect. Prism", formula: "SA = 2(lw + lh + wh)" },
      { name: "Volume of Cylinder", formula: "V = πr²h" },
      { name: "Surface Area of Cylinder", formula: "SA = 2πr² + 2πrh = 2πr(r + h)" },
      { name: "Volume of Sphere", formula: "V = (4/3)πr³" },
      { name: "Surface Area of Sphere", formula: "SA = 4πr²" },
      { name: "Volume of Cone", formula: "V = (1/3)πr²h" },
      { name: "Surface Area of Cone", formula: "SA = πr² + πrl, l = √(r²+h²)" },
      { name: "Volume of Pyramid", formula: "V = (1/3)Bh" },
      { name: "Surface Area of Pyramid", formula: "SA = B + (1/2)pl" },
      { name: "Volume of Hemisphere", formula: "V = (2/3)πr³" },
      { name: "Surface Area of Hemisphere", formula: "SA = 3πr²" },
      { name: "Volume of Torus", formula: "V = 2π²Rr²" },
      { name: "Surface Area of Torus", formula: "SA = 4π²Rr" },
      { name: "Coordinate Geometry", formula: "General form: Ax + By + C = 0" },
      { name: "Circle Equation", formula: "(x-h)² + (y-k)² = r²" },
      { name: "Ellipse Equation", formula: "(x-h)²/a² + (y-k)²/b² = 1" },
      { name: "Parabola Equation", formula: "y = a(x-h)² + k" },
      { name: "Hyperbola Equation", formula: "(x-h)²/a² - (y-k)²/b² = 1" },
    ],
  },
  trigonometry: {
    name: t("Trigonometry"),
    icon: "📊",
    items: [
      { name: "Sine (SOH)", formula: "sin θ = opposite / hypotenuse" },
      { name: "Cosine (CAH)", formula: "cos θ = adjacent / hypotenuse" },
      { name: "Tangent (TOA)", formula: "tan θ = opposite / adjacent = sin θ / cos θ" },
      { name: "Cosecant", formula: "csc θ = 1 / sin θ = hypotenuse / opposite" },
      { name: "Secant", formula: "sec θ = 1 / cos θ = hypotenuse / adjacent" },
      { name: "Cotangent", formula: "cot θ = 1 / tan θ = cos θ / sin θ" },
      { name: "Pythagorean Identity 1", formula: "sin²θ + cos²θ = 1" },
      { name: "Pythagorean Identity 2", formula: "1 + tan²θ = sec²θ" },
      { name: "Pythagorean Identity 3", formula: "1 + cot²θ = csc²θ" },
      { name: "Co-function Identity", formula: "sin(90°-θ) = cos θ, cos(90°-θ) = sin θ" },
      { name: "Even-Odd Identity", formula: "sin(-θ) = -sin θ, cos(-θ) = cos θ" },
      { name: "Periodicity", formula: "sin(θ+2π) = sin θ, cos(θ+2π) = cos θ" },
      { name: "Law of Sines", formula: "a/sin A = b/sin B = c/sin C" },
      { name: "Law of Cosines", formula: "c² = a² + b² - 2ab·cos C" },
      { name: "Law of Tangents", formula: "(a-b)/(a+b) = tan((A-B)/2)/tan((A+B)/2)" },
      { name: "Area with Two Sides", formula: "A = ½ab·sin C" },
      { name: "Sum Identity (sin)", formula: "sin(α ± β) = sin α cos β ± cos α sin β" },
      { name: "Sum Identity (cos)", formula: "cos(α ± β) = cos α cos β ∓ sin α sin β" },
      { name: "Sum Identity (tan)", formula: "tan(α ± β) = (tan α ± tan β)/(1 ∓ tan α tan β)" },
      { name: "Double Angle (sin)", formula: "sin 2θ = 2 sin θ cos θ" },
      { name: "Double Angle (cos) 1", formula: "cos 2θ = cos²θ - sin²θ" },
      { name: "Double Angle (cos) 2", formula: "cos 2θ = 2cos²θ - 1 = 1 - 2sin²θ" },
      { name: "Double Angle (tan)", formula: "tan 2θ = 2tan θ/(1 - tan²θ)" },
      { name: "Half Angle (sin)", formula: "sin(θ/2) = ±√((1 - cos θ)/2)" },
      { name: "Half Angle (cos)", formula: "cos(θ/2) = ±√((1 + cos θ)/2)" },
      { name: "Half Angle (tan)", formula: "tan(θ/2) = sin θ/(1 + cos θ) = (1 - cos θ)/sin θ" },
      { name: "Product-to-Sum (sin)", formula: "sin α sin β = ½[cos(α-β) - cos(α+β)]" },
      { name: "Product-to-Sum (cos)", formula: "cos α cos β = ½[cos(α-β) + cos(α+β)]" },
      { name: "Sum-to-Product (sin)", formula: "sin α + sin β = 2sin((α+β)/2)cos((α-β)/2)" },
      { name: "Sum-to-Product (cos)", formula: "cos α + cos β = 2cos((α+β)/2)cos((α-β)/2)" },
      { name: "Inverse Sin Domain", formula: "arcsin: [-1,1] → [-π/2,π/2]" },
      { name: "Inverse Cos Domain", formula: "arccos: [-1,1] → [0,π]" },
      { name: "Inverse Tan Domain", formula: "arctan: ℝ → (-π/2,π/2)" },
      { name: "Radians to Degrees", formula: "degrees = radians × 180/π" },
      { name: "Degrees to Radians", formula: "radians = degrees × π/180" },
      { name: "Unit Circle (0°)", formula: "sin 0° = 0, cos 0° = 1" },
      { name: "Unit Circle (30°)", formula: "sin 30° = 1/2, cos 30° = √3/2" },
      { name: "Unit Circle (45°)", formula: "sin 45° = √2/2, cos 45° = √2/2" },
      { name: "Unit Circle (60°)", formula: "sin 60° = √3/2, cos 60° = 1/2" },
      { name: "Unit Circle (90°)", formula: "sin 90° = 1, cos 90° = 0" },
    ],
  },
  precalculus: {
    name: t("Pre-Calculus"),
    icon: "🔢",
    items: [
      { name: "Function Definition", formula: "f: X → Y, each x maps to one y" },
      { name: "Domain", formula: "Set of all possible x-values" },
      { name: "Range", formula: "Set of all possible y-values" },
      { name: "Vertical Line Test", formula: "Function if no vertical line crosses twice" },
      { name: "Horizontal Line Test", formula: "One-to-one if no horizontal line crosses twice" },
      { name: "Composition", formula: "(f∘g)(x) = f(g(x))" },
      { name: "Inverse Function", formula: "f⁻¹(f(x)) = x and f(f⁻¹(x)) = x" },
      { name: "Even Function", formula: "f(-x) = f(x), symmetric about y-axis" },
      { name: "Odd Function", formula: "f(-x) = -f(x), symmetric about origin" },
      { name: "Increasing Function", formula: "x₁ < x₂ ⟹ f(x₁) < f(x₂)" },
      { name: "Decreasing Function", formula: "x₁ < x₂ ⟹ f(x₁) > f(x₂)" },
      { name: "Piecewise Function", formula: "Different formulas for different intervals" },
      { name: "Absolute Value Function", formula: "f(x) = |x|, V-shaped graph" },
      { name: "Square Root Function", formula: "f(x) = √x, domain: x ≥ 0" },
      { name: "Cubic Function", formula: "f(x) = x³, S-shaped curve" },
      { name: "Reciprocal Function", formula: "f(x) = 1/x, hyperbola" },
      { name: "Polynomial Degree n", formula: "f(x) = aₙxⁿ + aₙ₋₁xⁿ⁻¹ + ... + a₁x + a₀" },
      { name: "End Behavior (Even n)", formula: "Both ends same direction" },
      { name: "End Behavior (Odd n)", formula: "Ends in opposite directions" },
      { name: "Rational Function", formula: "f(x) = P(x)/Q(x)" },
      { name: "Vertical Asymptote", formula: "Q(x) = 0 (denominator = 0)" },
      { name: "Horizontal Asymptote", formula: "Compare degrees of P and Q" },
      { name: "Oblique Asymptote", formula: "deg(P) = deg(Q) + 1" },
      { name: "Exponential Function", formula: "f(x) = aᵇˣ, b > 0, b ≠ 1" },
      { name: "Exponential Growth", formula: "b > 1, increases rapidly" },
      { name: "Exponential Decay", formula: "0 < b < 1, decreases rapidly" },
      { name: "Natural Exponential", formula: "f(x) = eˣ, e ≈ 2.71828" },
      { name: "Logarithmic Function", formula: "f(x) = logₐ(x), inverse of aˣ" },
      { name: "Change of Base", formula: "logₐ(x) = ln(x)/ln(a)" },
      { name: "Conic Section - Circle", formula: "(x-h)² + (y-k)² = r²" },
      { name: "Conic Section - Parabola", formula: "(x-h)² = 4p(y-k) or (y-k)² = 4p(x-h)" },
      { name: "Conic Section - Ellipse", formula: "(x-h)²/a² + (y-k)²/b² = 1" },
      { name: "Conic Section - Hyperbola", formula: "(x-h)²/a² - (y-k)²/b² = 1" },
      { name: "Polar Coordinates", formula: "r = √(x²+y²), θ = arctan(y/x)" },
      { name: "Rectangular to Polar", formula: "x = r cos θ, y = r sin θ" },
      { name: "Parametric Equations", formula: "x = f(t), y = g(t)" },
      { name: "Vector", formula: "v = ⟨a, b⟩ or v = ai + bj" },
      { name: "Vector Magnitude", formula: "|v| = √(a² + b²)" },
      { name: "Unit Vector", formula: "û = v/|v|" },
      { name: "Dot Product", formula: "u·v = u₁v₁ + u₂v₂ = |u||v|cos θ" },
      { name: "Vector Angle", formula: "cos θ = (u·v)/(|u||v|)" },
      { name: "Perpendicular Vectors", formula: "u·v = 0" },
      { name: "Matrix Addition", formula: "[A + B]ᵢⱼ = aᵢⱼ + bᵢⱼ" },
      { name: "Matrix Multiplication", formula: "[AB]ᵢⱼ = Σ(aᵢₖbₖⱼ)" },
      { name: "Matrix Determinant 2×2", formula: "det([a b; c d]) = ad - bc" },
      { name: "Matrix Inverse 2×2", formula: "A⁻¹ = (1/det(A))[d -b; -c a]" },
      { name: "Sequence", formula: "aₙ = f(n), ordered list" },
      { name: "Series", formula: "Sₙ = Σaᵢ, sum of sequence" },
      { name: "Sigma Notation", formula: "Σᵢ₌₁ⁿ aᵢ = a₁ + a₂ + ... + aₙ" },
      { name: "Sum of First n Integers", formula: "Σk = n(n+1)/2" },
      { name: "Sum of First n Squares", formula: "Σk² = n(n+1)(2n+1)/6" },
      { name: "Sum of First n Cubes", formula: "Σk³ = [n(n+1)/2]²" },
      { name: "Mathematical Induction", formula: "Prove P(1) and P(k)⟹P(k+1)" },
    ],
  },
  calculus: {
    name: t("Calculus"),
    icon: "∫",
    items: [
      { name: "Limit Definition", formula: "lim(x→a) f(x) = L" },
      { name: "Derivative Definition", formula: "f'(x) = lim(h→0) [f(x+h)-f(x)]/h" },
      { name: "Power Rule", formula: "d/dx [xⁿ] = nxⁿ⁻¹" },
      { name: "Constant Rule", formula: "d/dx [c] = 0" },
      { name: "Constant Multiple", formula: "d/dx [cf(x)] = c·f'(x)" },
      { name: "Sum/Difference Rule", formula: "d/dx [f±g] = f'±g'" },
      { name: "Product Rule", formula: "d/dx [fg] = f'g + fg'" },
      { name: "Quotient Rule", formula: "d/dx [f/g] = (f'g - fg') / g²" },
      { name: "Chain Rule", formula: "d/dx [f(g(x))] = f'(g(x)) · g'(x)" },
      { name: "Derivative of eˣ", formula: "d/dx [eˣ] = eˣ" },
      { name: "Derivative of aˣ", formula: "d/dx [aˣ] = aˣ ln a" },
      { name: "Derivative of ln x", formula: "d/dx [ln x] = 1/x" },
      { name: "Derivative of logₐ x", formula: "d/dx [logₐ x] = 1/(x ln a)" },
      { name: "Derivative of sin x", formula: "d/dx [sin x] = cos x" },
      { name: "Derivative of cos x", formula: "d/dx [cos x] = -sin x" },
      { name: "Derivative of tan x", formula: "d/dx [tan x] = sec²x" },
      { name: "Derivative of cot x", formula: "d/dx [cot x] = -csc²x" },
      { name: "Derivative of sec x", formula: "d/dx [sec x] = sec x tan x" },
      { name: "Derivative of csc x", formula: "d/dx [csc x] = -csc x cot x" },
      { name: "Derivative of arcsin x", formula: "d/dx [arcsin x] = 1/√(1-x²)" },
      { name: "Derivative of arccos x", formula: "d/dx [arccos x] = -1/√(1-x²)" },
      { name: "Derivative of arctan x", formula: "d/dx [arctan x] = 1/(1+x²)" },
      { name: "L'Hôpital's Rule", formula: "lim f/g = lim f'/g' (0/0 or ∞/∞)" },
      { name: "Mean Value Theorem", formula: "f'(c) = [f(b)-f(a)]/(b-a)" },
      { name: "Critical Points", formula: "f'(x) = 0 or f'(x) DNE" },
      { name: "First Derivative Test", formula: "f'+ to f'- : max, f'- to f'+ : min" },
      { name: "Second Derivative Test", formula: "f''(c) > 0: min, f''(c) < 0: max" },
      { name: "Concavity", formula: "f'' > 0: concave up, f'' < 0: concave down" },
      { name: "Inflection Point", formula: "f''(x) = 0 and f'' changes sign" },
      { name: "Related Rates", formula: "dV/dt = (dV/dr)(dr/dt)" },
      { name: "Linear Approximation", formula: "f(x) ≈ f(a) + f'(a)(x-a)" },
      { name: "Indefinite Integral", formula: "∫f(x)dx = F(x) + C" },
      { name: "Power Rule (Integral)", formula: "∫xⁿdx = xⁿ⁺¹/(n+1) + C, n≠-1" },
      { name: "Integral of 1/x", formula: "∫(1/x)dx = ln|x| + C" },
      { name: "Integral of eˣ", formula: "∫eˣdx = eˣ + C" },
      { name: "Integral of aˣ", formula: "∫aˣdx = aˣ/ln(a) + C" },
      { name: "Integral of sin x", formula: "∫sin x dx = -cos x + C" },
      { name: "Integral of cos x", formula: "∫cos x dx = sin x + C" },
      { name: "Integral of sec²x", formula: "∫sec²x dx = tan x + C" },
      { name: "Integral of csc²x", formula: "∫csc²x dx = -cot x + C" },
      { name: "Integral of sec x tan x", formula: "∫sec x tan x dx = sec x + C" },
      { name: "Integral of csc x cot x", formula: "∫csc x cot x dx = -csc x + C" },
      { name: "Integral of tan x", formula: "∫tan x dx = -ln|cos x| + C" },
      { name: "Integral of cot x", formula: "∫cot x dx = ln|sin x| + C" },
      { name: "U-Substitution", formula: "∫f(g(x))g'(x)dx = ∫f(u)du" },
      { name: "Integration by Parts", formula: "∫u dv = uv - ∫v du" },
      { name: "Fundamental Theorem 1", formula: "d/dx[∫ₐˣ f(t)dt] = f(x)" },
      { name: "Fundamental Theorem 2", formula: "∫ₐᵇ f(x)dx = F(b) - F(a)" },
      { name: "Average Value", formula: "f̄ = (1/(b-a))∫ₐᵇ f(x)dx" },
      { name: "Area Between Curves", formula: "A = ∫ₐᵇ [f(x) - g(x)]dx" },
      { name: "Volume (Disk Method)", formula: "V = π∫ₐᵇ [R(x)]²dx" },
      { name: "Volume (Washer Method)", formula: "V = π∫ₐᵇ ([R(x)]² - [r(x)]²)dx" },
      { name: "Volume (Shell Method)", formula: "V = 2π∫ₐᵇ x·f(x)dx" },
      { name: "Arc Length", formula: "L = ∫ₐᵇ √(1 + [f'(x)]²)dx" },
      { name: "Surface Area", formula: "SA = 2π∫ₐᵇ f(x)√(1 + [f'(x)]²)dx" },
      { name: "Improper Integral", formula: "∫ₐ^∞ f(x)dx = lim(b→∞) ∫ₐᵇ f(x)dx" },
      { name: "Trapezoidal Rule", formula: "∫ₐᵇ f(x)dx ≈ (Δx/2)[f(x₀)+2f(x₁)+...+f(xₙ)]" },
      { name: "Simpson's Rule", formula: "∫ₐᵇ f(x)dx ≈ (Δx/3)[f(x₀)+4f(x₁)+2f(x₂)+...]" },
    ],
  },
  statistics: {
    name: t("Statistics"),
    icon: "📈",
    items: [
      { name: "Population Mean", formula: "μ = Σxᵢ / N" },
      { name: "Sample Mean", formula: "x̄ = Σxᵢ / n" },
      { name: "Weighted Mean", formula: "x̄w = Σ(wᵢxᵢ) / Σwᵢ" },
      { name: "Geometric Mean", formula: "GM = ⁿ√(x₁·x₂·...·xₙ)" },
      { name: "Harmonic Mean", formula: "HM = n / Σ(1/xᵢ)" },
      { name: "Median (Odd n)", formula: "Middle value in ordered data" },
      { name: "Median (Even n)", formula: "Average of two middle values" },
      { name: "Mode", formula: "Most frequent value(s) in dataset" },
      { name: "Range", formula: "Range = max - min" },
      { name: "Interquartile Range", formula: "IQR = Q₃ - Q₁" },
      { name: "Population Variance", formula: "σ² = Σ(xᵢ - μ)² / N" },
      { name: "Sample Variance", formula: "s² = Σ(xᵢ - x̄)² / (n-1)" },
      { name: "Population Std Dev", formula: "σ = √(Σ(xᵢ - μ)² / N)" },
      { name: "Sample Std Dev", formula: "s = √(Σ(xᵢ - x̄)² / (n-1))" },
      { name: "Standard Error", formula: "SE = s / √n" },
      { name: "Coefficient of Variation", formula: "CV = (σ / μ) × 100%" },
      { name: "Z-Score (Population)", formula: "z = (x - μ) / σ" },
      { name: "T-Score (Sample)", formula: "t = (x - μ) / (s/√n)" },
      { name: "Percentile", formula: "P = (k/n) × 100" },
      { name: "Quartiles", formula: "Q₁: 25th, Q₂: 50th (median), Q₃: 75th" },
      { name: "Outlier Test", formula: "x < Q₁-1.5·IQR or x > Q₃+1.5·IQR" },
      { name: "Five Number Summary", formula: "Min, Q₁, Median, Q₃, Max" },
      { name: "Factorial", formula: "n! = n × (n-1) × ... × 2 × 1" },
      { name: "Permutation", formula: "P(n,r) = n! / (n-r)!" },
      { name: "Combination", formula: "C(n,r) = n! / (r!(n-r)!)" },
      { name: "Basic Probability", formula: "P(A) = n(A) / n(S), 0 ≤ P(A) ≤ 1" },
      { name: "Complement Rule", formula: "P(A') = 1 - P(A)" },
      { name: "Addition Rule", formula: "P(A∪B) = P(A) + P(B) - P(A∩B)" },
      { name: "Multiplication Rule", formula: "P(A∩B) = P(A) × P(B|A)" },
      { name: "Independent Events", formula: "P(A∩B) = P(A) × P(B)" },
      { name: "Conditional Probability", formula: "P(A|B) = P(A∩B) / P(B)" },
      { name: "Bayes' Theorem", formula: "P(A|B) = P(B|A)P(A) / P(B)" },
      { name: "Expected Value", formula: "E(X) = Σ[xᵢ · P(xᵢ)]" },
      { name: "Variance of X", formula: "Var(X) = E(X²) - [E(X)]²" },
      { name: "Linear Transformation", formula: "E(aX+b) = aE(X)+b, Var(aX+b) = a²Var(X)" },
      { name: "Binomial Mean", formula: "E(X) = np" },
      { name: "Binomial Variance", formula: "Var(X) = np(1-p)" },
      { name: "Binomial Distribution", formula: "P(X=k) = C(n,k)pᵏ(1-p)ⁿ⁻ᵏ" },
      { name: "Geometric Distribution", formula: "P(X=k) = (1-p)ᵏ⁻¹p" },
      { name: "Poisson Distribution", formula: "P(X=k) = (λᵏe⁻λ) / k!" },
      { name: "Normal Distribution", formula: "f(x) = (1/σ√(2π))e^(-(x-μ)²/(2σ²))" },
      { name: "Standard Normal", formula: "Z ~ N(0,1)" },
      { name: "Empirical Rule (68-95-99.7)", formula: "68% within 1σ, 95% within 2σ, 99.7% within 3σ" },
      { name: "Central Limit Theorem", formula: "x̄ ~ N(μ, σ²/n) for large n" },
      { name: "Confidence Interval (z)", formula: "x̄ ± z*(σ/√n)" },
      { name: "Confidence Interval (t)", formula: "x̄ ± t*(s/√n)" },
      { name: "Margin of Error", formula: "ME = z*(σ/√n)" },
      { name: "Sample Size Formula", formula: "n = (z*σ/ME)²" },
      { name: "Hypothesis Test Statistic", formula: "z = (x̄ - μ₀) / (σ/√n)" },
      { name: "P-value", formula: "Probability of observing test statistic" },
      { name: "Type I Error", formula: "α = P(reject H₀ | H₀ true)" },
      { name: "Type II Error", formula: "β = P(fail to reject H₀ | H₀ false)" },
      { name: "Power of Test", formula: "Power = 1 - β" },
      { name: "Chi-Square Test", formula: "χ² = Σ[(O-E)²/E]" },
      { name: "Pearson Correlation", formula: "r = Σ[(xᵢ-x̄)(yᵢ-ȳ)] / √[Σ(xᵢ-x̄)²Σ(yᵢ-ȳ)²]" },
      { name: "Spearman Correlation", formula: "ρ = 1 - [6Σdᵢ²/(n(n²-1))]" },
      { name: "Linear Regression Slope", formula: "b₁ = r(sᵧ/sₓ) = Σ[(xᵢ-x̄)(yᵢ-ȳ)] / Σ(xᵢ-x̄)²" },
      { name: "Linear Regression Intercept", formula: "b₀ = ȳ - b₁x̄" },
      { name: "Regression Line", formula: "ŷ = b₀ + b₁x" },
      { name: "Coefficient of Determination", formula: "R² = r² (proportion of variance explained)" },
      { name: "Residual", formula: "e = y - ŷ" },
      { name: "Sum of Squared Errors", formula: "SSE = Σ(yᵢ - ŷᵢ)²" },
    ],
  },
});

type CategoryKey = "algebra" | "geometry" | "trigonometry" | "precalculus" | "calculus" | "statistics";

export function FormulaReference() {
  const { t } = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("algebra");
  const [searchQuery, setSearchQuery] = useState("");
  
  const formulas = getFormulas(t);

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
    
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Separate effect for handling the custom event (no dependencies to avoid re-registering)
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-formulas", handleOpen);
    return () => {
      window.removeEventListener("open-formulas", handleOpen);
    };
  }, []);

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
                    <span className="font-semibold text-white">{t("Formula Reference")}</span>
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
                      placeholder={t("Search formulas...")}
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
                      {t("No formulas found")}
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
                          {t("Copy")}
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
