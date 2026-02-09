"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Send,
  X,
  Sparkles,
  Lightbulb,
  BookOpen,
  Calculator,
  RefreshCw,
  Copy,
  Check,
  ChevronDown,
  Zap,
  MessageSquare,
  History,
  Trash2,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface ConversationHistory {
  id: string;
  title: string;
  preview: string;
  timestamp: Date;
  messages: Message[];
}

const MATH_TOPICS = [
  { label: "Algebra", icon: "🔢", examples: ["Solve 2x + 5 = 15", "Factor x² - 9"] },
  { label: "Calculus", icon: "∫", examples: ["Find derivative of x³", "Integrate sin(x)"] },
  { label: "Geometry", icon: "📐", examples: ["Area of circle r=5", "Pythagorean theorem"] },
  { label: "Statistics", icon: "📊", examples: ["Mean of 5,7,9,11", "Standard deviation"] },
  { label: "Trigonometry", icon: "📏", examples: ["sin(30°)", "cos²θ + sin²θ"] },
  { label: "Linear Algebra", icon: "🔲", examples: ["Matrix multiplication", "Find determinant"] },
];

const QUICK_PROMPTS = [
  { label: "Explain step-by-step", icon: BookOpen, prompt: "Explain this step-by-step: " },
  { label: "Give me a hint", icon: Lightbulb, prompt: "Give me a hint for solving: " },
  { label: "Check my work", icon: Check, prompt: "Check if my answer is correct: " },
  { label: "Similar problems", icon: RefreshCw, prompt: "Give me 3 similar practice problems to: " },
];

// ============================================
// COMPREHENSIVE MATH AI ENGINE
// ============================================

// Helper functions for math calculations
const gcd = (a: number, b: number): number => b === 0 ? Math.abs(a) : gcd(b, a % b);
const lcm = (a: number, b: number): number => Math.abs(a * b) / gcd(a, b);
const factorial = (n: number): number => n <= 1 ? 1 : n * factorial(n - 1);
const isPrime = (n: number): boolean => {
  if (n < 2) return false;
  for (let i = 2; i <= Math.sqrt(n); i++) {
    if (n % i === 0) return false;
  }
  return true;
};
const primeFactors = (n: number): number[] => {
  const factors: number[] = [];
  let d = 2;
  while (n > 1) {
    while (n % d === 0) {
      factors.push(d);
      n /= d;
    }
    d++;
  }
  return factors;
};

// Parse numbers from text
const extractNumbers = (text: string): number[] => {
  const matches = text.match(/-?\d+\.?\d*/g);
  return matches ? matches.map(Number).filter(n => !isNaN(n)) : [];
};

// Parse a linear equation like "2x + 5 = 15" or "3x - 7 = 20"
const solveLinearEquation = (equation: string): { solution: number | null; steps: string } => {
  // Try to parse: ax + b = c or ax - b = c
  const match = equation.match(/(-?\d*\.?\d*)\s*x\s*([+-])\s*(\d+\.?\d*)\s*=\s*(-?\d+\.?\d*)/i);
  if (match) {
    let a = match[1] === '' || match[1] === '-' ? (match[1] === '-' ? -1 : 1) : parseFloat(match[1]);
    const op = match[2];
    const b = parseFloat(match[3]) * (op === '-' ? -1 : 1);
    const c = parseFloat(match[4]);
    
    const x = (c - b) / a;
    
    const steps = `**Solving ${a}x ${op} ${match[3]} = ${c}**

**Step 1:** ${op === '+' ? 'Subtract' : 'Add'} ${match[3]} ${op === '+' ? 'from' : 'to'} both sides
\`\`\`
${a}x = ${c} ${op === '+' ? '-' : '+'} ${match[3]}
${a}x = ${c - b}
\`\`\`

**Step 2:** Divide both sides by ${a}
\`\`\`
x = ${c - b} ÷ ${a}
x = ${x}
\`\`\`

**Answer: x = ${x}** ✓

**Verification:** ${a}(${x}) ${op} ${match[3]} = ${a * x} ${op} ${match[3]} = ${a * x + b} ✓`;
    
    return { solution: x, steps };
  }
  return { solution: null, steps: '' };
};

// Solve quadratic equation ax² + bx + c = 0
const solveQuadratic = (a: number, b: number, c: number): { x1: number | string; x2: number | string; steps: string } => {
  const discriminant = b * b - 4 * a * c;
  let x1: number | string, x2: number | string;
  let rootType: string;
  
  if (discriminant > 0) {
    x1 = (-b + Math.sqrt(discriminant)) / (2 * a);
    x2 = (-b - Math.sqrt(discriminant)) / (2 * a);
    rootType = "two distinct real roots";
  } else if (discriminant === 0) {
    x1 = x2 = -b / (2 * a);
    rootType = "one repeated real root";
  } else {
    const realPart = -b / (2 * a);
    const imagPart = Math.sqrt(-discriminant) / (2 * a);
    x1 = `${realPart.toFixed(2)} + ${imagPart.toFixed(2)}i`;
    x2 = `${realPart.toFixed(2)} - ${imagPart.toFixed(2)}i`;
    rootType = "two complex conjugate roots";
  }
  
  const steps = `**Solving ${a}x² ${b >= 0 ? '+' : ''} ${b}x ${c >= 0 ? '+' : ''} ${c} = 0**

Using the **Quadratic Formula**: x = (-b ± √(b² - 4ac)) / 2a

**Step 1:** Identify coefficients
- a = ${a}
- b = ${b}
- c = ${c}

**Step 2:** Calculate the discriminant (b² - 4ac)
\`\`\`
Δ = (${b})² - 4(${a})(${c})
Δ = ${b * b} - ${4 * a * c}
Δ = ${discriminant}
\`\`\`

**Step 3:** Apply the formula
${discriminant >= 0 ? `\`\`\`
x = (-${b} ± √${discriminant}) / (2 × ${a})
x = (${-b} ± ${Math.sqrt(Math.abs(discriminant)).toFixed(4)}) / ${2 * a}
\`\`\`` : `Since Δ < 0, we have complex roots.`}

**Answer:** ${rootType}
- x₁ = ${typeof x1 === 'number' ? x1.toFixed(4) : x1}
- x₂ = ${typeof x2 === 'number' ? x2.toFixed(4) : x2}

${typeof x1 === 'number' ? `**Verification:** ${a}(${x1.toFixed(2)})² + ${b}(${x1.toFixed(2)}) + ${c} ≈ ${(a * x1 * x1 + b * x1 + c).toFixed(4)} ✓` : ''}`;
  
  return { x1, x2, steps };
};

// Calculate derivative (basic power rule)
const calculateDerivative = (expression: string): string => {
  const terms: string[] = [];
  const termRegex = /([+-]?\s*\d*\.?\d*)\s*x\^?(\d*)/gi;
  let match;
  
  // Parse and differentiate each term
  const parsed: Array<{coef: number; exp: number}> = [];
  const exprClean = expression.replace(/\s/g, '').replace(/−/g, '-');
  
  // Handle x^n terms
  const powerMatch = exprClean.match(/([+-]?\d*\.?\d*)x\^(\d+)/g);
  if (powerMatch) {
    powerMatch.forEach(term => {
      const parts = term.match(/([+-]?\d*\.?\d*)x\^(\d+)/);
      if (parts) {
        let coef = parts[1] === '' || parts[1] === '+' ? 1 : parts[1] === '-' ? -1 : parseFloat(parts[1]);
        const exp = parseInt(parts[2]);
        if (exp > 0) {
          parsed.push({ coef: coef * exp, exp: exp - 1 });
        }
      }
    });
  }
  
  // Handle x terms (x^1)
  const xMatch = exprClean.match(/([+-]?\d*\.?\d*)x(?!\^)/g);
  if (xMatch) {
    xMatch.forEach(term => {
      const parts = term.match(/([+-]?\d*\.?\d*)x/);
      if (parts) {
        let coef = parts[1] === '' || parts[1] === '+' ? 1 : parts[1] === '-' ? -1 : parseFloat(parts[1]);
        parsed.push({ coef, exp: 0 });
      }
    });
  }
  
  // Build result
  let result = parsed.map((t, i) => {
    if (t.exp === 0) return `${t.coef}`;
    if (t.exp === 1) return `${t.coef}x`;
    return `${t.coef}x^${t.exp}`;
  }).join(' + ').replace(/\+ -/g, '- ');
  
  return result || '0';
};

// Main AI response generator
const generateMathResponse = (question: string): string => {
  const q = question.toLowerCase().trim();
  const numbers = extractNumbers(question);
  
  // ===== LINEAR EQUATIONS =====
  if ((q.includes("solve") || q.includes("find x") || q.includes("what is x")) && q.includes("x") && q.includes("=")) {
    const result = solveLinearEquation(question);
    if (result.solution !== null) {
      return result.steps;
    }
  }
  
  // Handle specific patterns like "2x + 5 = 15"
  const linearMatch = question.match(/(\d*)\s*x\s*([+-])\s*(\d+)\s*=\s*(\d+)/);
  if (linearMatch) {
    const a = linearMatch[1] ? parseFloat(linearMatch[1]) : 1;
    const op = linearMatch[2];
    const b = parseFloat(linearMatch[3]);
    const c = parseFloat(linearMatch[4]);
    const x = op === '+' ? (c - b) / a : (c + b) / a;
    
    return `**Solving ${a === 1 ? '' : a}x ${op} ${b} = ${c}**

**Step 1:** ${op === '+' ? 'Subtract' : 'Add'} ${b} ${op === '+' ? 'from' : 'to'} both sides
\`\`\`
${a === 1 ? '' : a}x = ${c} ${op === '+' ? '-' : '+'} ${b}
${a === 1 ? '' : a}x = ${op === '+' ? c - b : c + b}
\`\`\`

${a !== 1 ? `**Step 2:** Divide both sides by ${a}
\`\`\`
x = ${op === '+' ? c - b : c + b} ÷ ${a}
x = ${x}
\`\`\`
` : ''}
**Answer: x = ${x}** ✓

**Verification:** ${a === 1 ? '' : a + '×'}${x} ${op} ${b} = ${a * x} ${op} ${b} = ${op === '+' ? a * x + b : a * x - b} ✓`;
  }
  
  // ===== QUADRATIC EQUATIONS =====
  if ((q.includes("solve") || q.includes("find") || q.includes("roots") || q.includes("zeros")) && (q.includes("x²") || q.includes("x^2") || q.includes("x2") || q.includes("quadratic"))) {
    // Try to parse ax² + bx + c = 0
    const quadMatch = question.match(/(-?\d*)\s*x[²2\^2]\s*([+-])\s*(\d*)\s*x?\s*([+-])?\s*(\d+)?\s*=\s*0?/i);
    if (quadMatch || numbers.length >= 2) {
      let a = 1, b = 0, c = 0;
      
      if (quadMatch) {
        a = quadMatch[1] ? parseFloat(quadMatch[1]) : 1;
        b = parseFloat(quadMatch[3] || '0') * (quadMatch[2] === '-' ? -1 : 1);
        c = parseFloat(quadMatch[5] || '0') * (quadMatch[4] === '-' ? -1 : 1);
      } else if (numbers.length >= 3) {
        [a, b, c] = numbers.slice(0, 3);
      } else if (numbers.length === 2) {
        [b, c] = numbers;
      }
      
      if (a !== 0) {
        const result = solveQuadratic(a, b, c);
        return result.steps;
      }
    }
  }
  
  // ===== DERIVATIVES =====
  if (q.includes("derivative") || q.includes("differentiate") || q.includes("d/dx") || q.includes("f'(x)")) {
    // Power rule examples
    if (q.includes("x^") || q.includes("x²") || q.includes("x³") || q.includes("x⁴") || q.includes("x⁵")) {
      let exp = 2;
      if (q.includes("x³") || q.includes("x^3")) exp = 3;
      else if (q.includes("x⁴") || q.includes("x^4")) exp = 4;
      else if (q.includes("x⁵") || q.includes("x^5")) exp = 5;
      else if (q.includes("x⁶") || q.includes("x^6")) exp = 6;
      else {
        const expMatch = q.match(/x\^(\d+)/);
        if (expMatch) exp = parseInt(expMatch[1]);
      }
      
      // Check for coefficient
      let coef = 1;
      const coefMatch = question.match(/(\d+)\s*x/);
      if (coefMatch) coef = parseInt(coefMatch[1]);
      
      const newCoef = coef * exp;
      const newExp = exp - 1;
      
      return `**Finding the Derivative of ${coef === 1 ? '' : coef}x${exp === 2 ? '²' : exp === 3 ? '³' : '^' + exp}**

Using the **Power Rule**: d/dx[xⁿ] = n·xⁿ⁻¹

**Step 1:** Identify the function
\`\`\`
f(x) = ${coef === 1 ? '' : coef}x^${exp}
\`\`\`

**Step 2:** Apply the power rule
\`\`\`
f'(x) = ${coef === 1 ? '' : coef + '·'}${exp}·x^(${exp}-1)
f'(x) = ${newCoef}x${newExp === 1 ? '' : newExp === 2 ? '²' : '^' + newExp}
\`\`\`

**Answer: f'(x) = ${newCoef}x${newExp === 1 ? '' : newExp === 0 ? '' : newExp === 2 ? '²' : '^' + newExp}** ✓

📚 **Power Rule Summary:**
- Multiply coefficient by exponent
- Subtract 1 from the exponent

**Common Derivatives:**
- d/dx[x] = 1
- d/dx[x²] = 2x
- d/dx[x³] = 3x²
- d/dx[xⁿ] = n·xⁿ⁻¹
- d/dx[constant] = 0`;
    }
    
    // Trig derivatives
    if (q.includes("sin")) {
      return `**Derivative of sin(x)**

**Formula:** d/dx[sin(x)] = cos(x)

**Step-by-step:**
\`\`\`
f(x) = sin(x)
f'(x) = cos(x)
\`\`\`

**Answer: f'(x) = cos(x)** ✓

**All Trigonometric Derivatives:**
| Function | Derivative |
|----------|------------|
| sin(x)   | cos(x)     |
| cos(x)   | -sin(x)    |
| tan(x)   | sec²(x)    |
| cot(x)   | -csc²(x)   |
| sec(x)   | sec(x)tan(x) |
| csc(x)   | -csc(x)cot(x) |

**Chain Rule:** If f(x) = sin(g(x)), then f'(x) = cos(g(x))·g'(x)`;
    }
    
    if (q.includes("cos")) {
      return `**Derivative of cos(x)**

**Formula:** d/dx[cos(x)] = -sin(x)

**Step-by-step:**
\`\`\`
f(x) = cos(x)
f'(x) = -sin(x)
\`\`\`

**Answer: f'(x) = -sin(x)** ✓

**All Trigonometric Derivatives:**
| Function | Derivative |
|----------|------------|
| sin(x)   | cos(x)     |
| cos(x)   | -sin(x)    |
| tan(x)   | sec²(x)    |
| cot(x)   | -csc²(x)   |
| sec(x)   | sec(x)tan(x) |
| csc(x)   | -csc(x)cot(x) |`;
    }
    
    if (q.includes("tan")) {
      return `**Derivative of tan(x)**

**Formula:** d/dx[tan(x)] = sec²(x)

**Derivation:**
\`\`\`
tan(x) = sin(x)/cos(x)

Using quotient rule:
f'(x) = [cos(x)·cos(x) - sin(x)·(-sin(x))] / cos²(x)
f'(x) = [cos²(x) + sin²(x)] / cos²(x)
f'(x) = 1 / cos²(x)
f'(x) = sec²(x)
\`\`\`

**Answer: f'(x) = sec²(x)** ✓`;
    }
    
    if (q.includes("e^x") || q.includes("eˣ") || (q.includes("e") && q.includes("x"))) {
      return `**Derivative of eˣ**

**Formula:** d/dx[eˣ] = eˣ

This is one of the most beautiful results in calculus - the exponential function is its own derivative!

**Step-by-step:**
\`\`\`
f(x) = eˣ
f'(x) = eˣ
\`\`\`

**Answer: f'(x) = eˣ** ✓

**Related Derivatives:**
- d/dx[eˣ] = eˣ
- d/dx[aˣ] = aˣ·ln(a)
- d/dx[e^(g(x))] = e^(g(x))·g'(x) (chain rule)

**Example with Chain Rule:**
d/dx[e^(2x)] = e^(2x)·2 = 2e^(2x)`;
    }
    
    if (q.includes("ln") || q.includes("log")) {
      return `**Derivative of ln(x)**

**Formula:** d/dx[ln(x)] = 1/x

**Step-by-step:**
\`\`\`
f(x) = ln(x)
f'(x) = 1/x
\`\`\`

**Answer: f'(x) = 1/x** ✓

**Related Logarithmic Derivatives:**
- d/dx[ln(x)] = 1/x
- d/dx[log_a(x)] = 1/(x·ln(a))
- d/dx[ln(g(x))] = g'(x)/g(x) (chain rule)

**Example with Chain Rule:**
d/dx[ln(x²)] = (2x)/(x²) = 2/x`;
    }
    
    // General derivative help
    return `**Differentiation Rules** 📚

I can help you find derivatives! Here are the main rules:

**Basic Rules:**
| Rule | Formula |
|------|---------|
| Constant | d/dx[c] = 0 |
| Power | d/dx[xⁿ] = n·xⁿ⁻¹ |
| Constant Multiple | d/dx[c·f(x)] = c·f'(x) |
| Sum/Difference | d/dx[f ± g] = f' ± g' |

**Product & Quotient Rules:**
- **Product:** d/dx[f·g] = f'g + fg'
- **Quotient:** d/dx[f/g] = (f'g - fg')/g²

**Chain Rule:**
d/dx[f(g(x))] = f'(g(x))·g'(x)

**Common Derivatives:**
- d/dx[xⁿ] = nxⁿ⁻¹
- d/dx[eˣ] = eˣ
- d/dx[ln(x)] = 1/x
- d/dx[sin(x)] = cos(x)
- d/dx[cos(x)] = -sin(x)

**Please share the specific function** you'd like me to differentiate!`;
  }
  
  // ===== INTEGRALS =====
  if (q.includes("integrate") || q.includes("integral") || q.includes("antiderivative") || q.includes("∫")) {
    if (q.includes("x^") || q.includes("x²") || q.includes("x³")) {
      let exp = 2;
      if (q.includes("x³") || q.includes("x^3")) exp = 3;
      else if (q.includes("x^4") || q.includes("x⁴")) exp = 4;
      else {
        const expMatch = q.match(/x\^(\d+)/);
        if (expMatch) exp = parseInt(expMatch[1]);
      }
      
      return `**Integrating x^${exp}**

Using the **Power Rule for Integration**: ∫xⁿ dx = xⁿ⁺¹/(n+1) + C

**Step 1:** Identify n = ${exp}

**Step 2:** Apply the formula
\`\`\`
∫x^${exp} dx = x^(${exp}+1)/(${exp}+1) + C
         = x^${exp + 1}/${exp + 1} + C
\`\`\`

**Answer: ∫x^${exp} dx = x^${exp + 1}/${exp + 1} + C** ✓

📚 **Remember:** Always add the constant of integration (+ C) for indefinite integrals!

**Common Integrals:**
- ∫1 dx = x + C
- ∫x dx = x²/2 + C
- ∫x² dx = x³/3 + C
- ∫xⁿ dx = xⁿ⁺¹/(n+1) + C`;
    }
    
    if (q.includes("sin")) {
      return `**Integrating sin(x)**

**Formula:** ∫sin(x) dx = -cos(x) + C

**Step-by-step:**
\`\`\`
∫sin(x) dx = -cos(x) + C
\`\`\`

**Answer: ∫sin(x) dx = -cos(x) + C** ✓

**Verification:** d/dx[-cos(x)] = sin(x) ✓

**Trigonometric Integrals:**
| Function | Integral |
|----------|----------|
| sin(x)   | -cos(x) + C |
| cos(x)   | sin(x) + C |
| sec²(x)  | tan(x) + C |
| csc²(x)  | -cot(x) + C |
| sec(x)tan(x) | sec(x) + C |`;
    }
    
    if (q.includes("cos")) {
      return `**Integrating cos(x)**

**Formula:** ∫cos(x) dx = sin(x) + C

**Step-by-step:**
\`\`\`
∫cos(x) dx = sin(x) + C
\`\`\`

**Answer: ∫cos(x) dx = sin(x) + C** ✓

**Verification:** d/dx[sin(x)] = cos(x) ✓`;
    }
    
    if (q.includes("e^x") || q.includes("eˣ")) {
      return `**Integrating eˣ**

**Formula:** ∫eˣ dx = eˣ + C

The exponential function is its own integral (just like its derivative)!

**Step-by-step:**
\`\`\`
∫eˣ dx = eˣ + C
\`\`\`

**Answer: ∫eˣ dx = eˣ + C** ✓

**Related Integrals:**
- ∫eˣ dx = eˣ + C
- ∫aˣ dx = aˣ/ln(a) + C
- ∫e^(ax) dx = e^(ax)/a + C`;
    }
    
    if (q.includes("1/x") || q.includes("ln")) {
      return `**Integrating 1/x**

**Formula:** ∫(1/x) dx = ln|x| + C

**Step-by-step:**
\`\`\`
∫(1/x) dx = ln|x| + C
\`\`\`

**Answer: ∫(1/x) dx = ln|x| + C** ✓

**Note:** We use |x| (absolute value) because ln is only defined for positive numbers.

**Related Integrals:**
- ∫(1/x) dx = ln|x| + C
- ∫(1/(ax+b)) dx = (1/a)ln|ax+b| + C`;
    }
    
    return `**Integration Basics** ∫

**Power Rule:** ∫xⁿ dx = xⁿ⁺¹/(n+1) + C (for n ≠ -1)

**Common Integrals:**
| Function | Integral |
|----------|----------|
| 1 | x + C |
| xⁿ | xⁿ⁺¹/(n+1) + C |
| 1/x | ln\|x\| + C |
| eˣ | eˣ + C |
| sin(x) | -cos(x) + C |
| cos(x) | sin(x) + C |
| sec²(x) | tan(x) + C |

**Integration Techniques:**
1. **Substitution:** For composite functions
2. **Integration by Parts:** ∫u dv = uv - ∫v du
3. **Partial Fractions:** For rational functions
4. **Trigonometric Substitution:** For √(a²-x²) forms

**What function would you like me to integrate?**`;
  }
  
  // ===== LIMITS =====
  if (q.includes("limit") || q.includes("lim")) {
    if (q.includes("infinity") || q.includes("∞")) {
      return `**Limits at Infinity**

When evaluating limits as x → ∞:

**Key Rules:**
1. **For polynomials:** Compare highest degree terms
2. **1/xⁿ → 0** as x → ∞
3. **eˣ → ∞** and **e⁻ˣ → 0** as x → ∞

**Examples:**
\`\`\`
lim (3x² + 2x) / (x² + 1) as x → ∞
= lim (3 + 2/x) / (1 + 1/x²)
= 3/1 = 3
\`\`\`

**Tip:** Divide by highest power of x in denominator!

**What limit would you like me to evaluate?**`;
    }
    
    if (q.includes("0") || numbers.includes(0)) {
      return `**Evaluating Limits**

**Direct Substitution:** First, try plugging in the value directly.

**If you get 0/0 (indeterminate form):**
1. **Factor** and cancel common terms
2. **Rationalize** if there are radicals
3. **L'Hôpital's Rule:** Take derivative of top and bottom

**Example:**
\`\`\`
lim (x² - 4)/(x - 2) as x → 2

Direct substitution: (4-4)/(2-2) = 0/0 ← indeterminate!

Factor: lim (x+2)(x-2)/(x-2) as x → 2
Cancel: lim (x+2) as x → 2
= 2 + 2 = 4
\`\`\`

**Answer: The limit equals 4** ✓

**What limit would you like me to help with?**`;
    }
    
    return `**Limits** 📚

**Definition:** lim f(x) as x → a describes f(x) behavior near x = a

**Methods to Evaluate:**
1. **Direct Substitution:** Plug in x = a
2. **Factoring:** If 0/0, factor and cancel
3. **Rationalizing:** Multiply by conjugate
4. **L'Hôpital's Rule:** For 0/0 or ∞/∞, take derivatives

**Common Limits:**
- lim sin(x)/x as x → 0 = 1
- lim (1 + 1/n)ⁿ as n → ∞ = e
- lim (eˣ - 1)/x as x → 0 = 1

**Share a specific limit** and I'll solve it step-by-step!`;
  }
  
  // ===== FACTORING =====
  if (q.includes("factor")) {
    // Difference of squares: x² - n²
    const diffSquareMatch = question.match(/x[²2]\s*[-−]\s*(\d+)/);
    if (diffSquareMatch) {
      const n = parseInt(diffSquareMatch[1]);
      const root = Math.sqrt(n);
      if (Number.isInteger(root)) {
        return `**Factoring x² - ${n}**

This is a **Difference of Squares**!

**Pattern:** a² - b² = (a + b)(a - b)

**Step 1:** Identify a² and b²
- a² = x² → a = x
- b² = ${n} → b = ${root} (since ${root}² = ${n})

**Step 2:** Apply the formula
\`\`\`
x² - ${n} = (x + ${root})(x - ${root})
\`\`\`

**Answer: (x + ${root})(x - ${root})** ✓

**Verification:**
(x + ${root})(x - ${root}) = x² - ${root}x + ${root}x - ${n} = x² - ${n} ✓`;
      }
    }
    
    // Trinomials: x² + bx + c
    const trinomialMatch = question.match(/x[²2]\s*([+-])\s*(\d+)\s*x\s*([+-])\s*(\d+)/);
    if (trinomialMatch) {
      const b = parseInt(trinomialMatch[2]) * (trinomialMatch[1] === '-' ? -1 : 1);
      const c = parseInt(trinomialMatch[4]) * (trinomialMatch[3] === '-' ? -1 : 1);
      
      // Find factors
      for (let i = -Math.abs(c); i <= Math.abs(c); i++) {
        if (i === 0) continue;
        if (c % i === 0) {
          const j = c / i;
          if (i + j === b) {
            return `**Factoring x² ${b >= 0 ? '+' : ''} ${b}x ${c >= 0 ? '+' : ''} ${c}**

**Method:** Find two numbers that:
- Multiply to give ${c}
- Add to give ${b}

**Step 1:** List factor pairs of ${c}
${Math.abs(c) <= 20 ? `Factors of ${c}: ${Array.from({length: Math.abs(c)}, (_, k) => k + 1).filter(n => c % n === 0).map(n => `${n} × ${c/n}`).join(', ')}` : ''}

**Step 2:** Find the pair that sums to ${b}
- ${i} × ${j} = ${c} ✓
- ${i} + ${j} = ${b} ✓

**Step 3:** Write the factors
\`\`\`
x² ${b >= 0 ? '+' : ''} ${b}x ${c >= 0 ? '+' : ''} ${c} = (x ${i >= 0 ? '+' : ''} ${i})(x ${j >= 0 ? '+' : ''} ${j})
\`\`\`

**Answer: (x ${i >= 0 ? '+' : ''} ${i})(x ${j >= 0 ? '+' : ''} ${j})** ✓

**Verification (FOIL):**
(x ${i >= 0 ? '+' : ''} ${i})(x ${j >= 0 ? '+' : ''} ${j})
= x² ${j >= 0 ? '+' : ''} ${j}x ${i >= 0 ? '+' : ''} ${i}x ${i*j >= 0 ? '+' : ''} ${i*j}
= x² ${b >= 0 ? '+' : ''} ${b}x ${c >= 0 ? '+' : ''} ${c} ✓`;
          }
        }
      }
    }
    
    return `**Factoring Techniques** 🔢

**1. Greatest Common Factor (GCF)**
Always check for GCF first!
Example: 6x² + 9x = 3x(2x + 3)

**2. Difference of Squares**
a² - b² = (a + b)(a - b)
Example: x² - 16 = (x + 4)(x - 4)

**3. Perfect Square Trinomials**
a² + 2ab + b² = (a + b)²
a² - 2ab + b² = (a - b)²

**4. Trinomial x² + bx + c**
Find numbers p, q where p·q = c and p + q = b
Then: (x + p)(x + q)

**5. Grouping (for 4 terms)**
Group into pairs and factor each

**Share the expression** you want to factor!`;
  }
  
  // ===== GCD/LCM =====
  if ((q.includes("gcd") || q.includes("gcf") || q.includes("greatest common")) && numbers.length >= 2) {
    const a = numbers[0], b = numbers[1];
    const result = gcd(a, b);
    
    return `**Finding GCD of ${a} and ${b}**

Using the **Euclidean Algorithm:**

\`\`\`
${a} = ${Math.floor(a/b)} × ${b} + ${a % b}
${b} = ${Math.floor(b/(a % b || 1))} × ${a % b || b} + ${b % (a % b || 1)}
...continuing until remainder = 0
\`\`\`

**Prime Factorization Method:**
- ${a} = ${primeFactors(a).join(' × ')}
- ${b} = ${primeFactors(b).join(' × ')}

**Answer: GCD(${a}, ${b}) = ${result}** ✓

**Related:** LCM(${a}, ${b}) = ${lcm(a, b)}

💡 **Remember:** GCD × LCM = ${a} × ${b} = ${a * b}`;
  }
  
  if ((q.includes("lcm") || q.includes("least common multiple")) && numbers.length >= 2) {
    const a = numbers[0], b = numbers[1];
    const result = lcm(a, b);
    
    return `**Finding LCM of ${a} and ${b}**

**Method 1: Using GCD**
\`\`\`
LCM(a, b) = (a × b) / GCD(a, b)
LCM(${a}, ${b}) = (${a} × ${b}) / ${gcd(a, b)}
LCM(${a}, ${b}) = ${a * b} / ${gcd(a, b)}
LCM(${a}, ${b}) = ${result}
\`\`\`

**Method 2: Prime Factorization**
- ${a} = ${primeFactors(a).join(' × ')}
- ${b} = ${primeFactors(b).join(' × ')}
- Take highest power of each prime

**Answer: LCM(${a}, ${b}) = ${result}** ✓

💡 **Tip:** GCD(${a}, ${b}) = ${gcd(a, b)}`;
  }
  
  // ===== PRIME NUMBERS =====
  if (q.includes("prime") && numbers.length >= 1) {
    const n = numbers[0];
    if (q.includes("factor")) {
      const factors = primeFactors(n);
      return `**Prime Factorization of ${n}**

**Step-by-step division:**
\`\`\`
${n} ÷ ${factors[0]} = ${n / factors[0]}
${factors.slice(1).reduce((acc, f, i) => {
  const prev = factors.slice(0, i + 1).reduce((p, c) => p * c, 1);
  const current = n / prev;
  return acc + `${current} ÷ ${f} = ${current / f}\n`;
}, '')}
\`\`\`

**Answer: ${n} = ${factors.join(' × ')}** ✓

**Verification:** ${factors.join(' × ')} = ${factors.reduce((a, b) => a * b, 1)} ✓`;
    }
    
    const primeResult = isPrime(n);
    return `**Is ${n} prime?**

A prime number has exactly two factors: 1 and itself.

**Checking ${n}:**
${primeResult ? 
  `Testing divisibility by primes up to √${n} ≈ ${Math.floor(Math.sqrt(n))}
  
${[2, 3, 5, 7, 11, 13].filter(p => p <= Math.sqrt(n)).map(p => `${n} ÷ ${p} = ${(n/p).toFixed(2)} (not divisible)`).join('\n')}

**Answer: Yes, ${n} is prime!** ✓` :
  `${n} = ${primeFactors(n).join(' × ')}

**Answer: No, ${n} is not prime.** It has factors: ${[...new Set(primeFactors(n))].join(', ')}`}`;
  }
  
  // ===== FACTORIAL =====
  if (q.includes("factorial") || q.includes("!")) {
    if (numbers.length >= 1) {
      const n = numbers[0];
      if (n <= 20) {
        const result = factorial(n);
        return `**Calculating ${n}!**

**Definition:** n! = n × (n-1) × (n-2) × ... × 2 × 1

**Calculation:**
\`\`\`
${n}! = ${Array.from({length: n}, (_, i) => n - i).join(' × ')}
${n}! = ${result}
\`\`\`

**Answer: ${n}! = ${result.toLocaleString()}** ✓

**Properties of Factorials:**
- 0! = 1 (by definition)
- n! = n × (n-1)!
- ${n}!/${n-1}! = ${n}`;
      }
    }
  }
  
  // ===== PERMUTATIONS & COMBINATIONS =====
  if ((q.includes("permutation") || q.includes("npr") || q.includes("p(n,r)")) && numbers.length >= 2) {
    const n = numbers[0], r = numbers[1];
    const result = factorial(n) / factorial(n - r);
    
    return `**Permutations: P(${n}, ${r})**

**Formula:** P(n, r) = n! / (n-r)!

**Calculation:**
\`\`\`
P(${n}, ${r}) = ${n}! / (${n}-${r})!
P(${n}, ${r}) = ${n}! / ${n - r}!
P(${n}, ${r}) = ${factorial(n)} / ${factorial(n - r)}
P(${n}, ${r}) = ${result}
\`\`\`

**Answer: P(${n}, ${r}) = ${result}** ✓

This means there are ${result} ways to arrange ${r} items from ${n} items when **order matters**.`;
  }
  
  if ((q.includes("combination") || q.includes("ncr") || q.includes("c(n,r)") || q.includes("choose")) && numbers.length >= 2) {
    const n = numbers[0], r = numbers[1];
    const result = factorial(n) / (factorial(r) * factorial(n - r));
    
    return `**Combinations: C(${n}, ${r})** or **"${n} choose ${r}"**

**Formula:** C(n, r) = n! / (r!(n-r)!)

**Calculation:**
\`\`\`
C(${n}, ${r}) = ${n}! / (${r}! × ${n - r}!)
C(${n}, ${r}) = ${factorial(n)} / (${factorial(r)} × ${factorial(n - r)})
C(${n}, ${r}) = ${factorial(n)} / ${factorial(r) * factorial(n - r)}
C(${n}, ${r}) = ${result}
\`\`\`

**Answer: C(${n}, ${r}) = ${result}** ✓

This means there are ${result} ways to choose ${r} items from ${n} items when **order doesn't matter**.`;
  }
  
  // ===== STATISTICS =====
  if ((q.includes("mean") || q.includes("average")) && numbers.length >= 2) {
    const sum = numbers.reduce((a, b) => a + b, 0);
    const mean = sum / numbers.length;
    
    return `**Calculating the Mean (Average)**

**Data:** ${numbers.join(', ')}

**Formula:** Mean = (Sum of all values) / (Number of values)

**Calculation:**
\`\`\`
Sum = ${numbers.join(' + ')} = ${sum}
n = ${numbers.length}
Mean = ${sum} / ${numbers.length} = ${mean}
\`\`\`

**Answer: Mean = ${mean}** ✓`;
  }
  
  if ((q.includes("median")) && numbers.length >= 2) {
    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    
    return `**Calculating the Median**

**Data:** ${numbers.join(', ')}

**Step 1:** Sort the data
Sorted: ${sorted.join(', ')}

**Step 2:** Find the middle value(s)
n = ${sorted.length} (${sorted.length % 2 !== 0 ? 'odd' : 'even'})

${sorted.length % 2 !== 0 ? 
  `Middle position: (${sorted.length} + 1) / 2 = ${(sorted.length + 1) / 2}
Middle value: ${sorted[mid]}` :
  `Middle positions: ${mid} and ${mid + 1}
Middle values: ${sorted[mid - 1]} and ${sorted[mid]}
Median = (${sorted[mid - 1]} + ${sorted[mid]}) / 2 = ${median}`}

**Answer: Median = ${median}** ✓`;
  }
  
  if ((q.includes("mode")) && numbers.length >= 2) {
    const frequency: Record<number, number> = {};
    numbers.forEach(n => frequency[n] = (frequency[n] || 0) + 1);
    const maxFreq = Math.max(...Object.values(frequency));
    const modes = Object.keys(frequency).filter(k => frequency[parseInt(k)] === maxFreq).map(Number);
    
    return `**Calculating the Mode**

**Data:** ${numbers.join(', ')}

**Frequency Table:**
${Object.entries(frequency).map(([val, freq]) => `- ${val}: appears ${freq} time(s)`).join('\n')}

**Answer:** ${modes.length === numbers.length ? 'No mode (all values appear equally)' : 
  modes.length === 1 ? `Mode = ${modes[0]}` : `Modes = ${modes.join(', ')} (multimodal)`}

The mode is the value that appears most frequently.`;
  }
  
  if ((q.includes("standard deviation") || q.includes("std dev") || q.includes("variance")) && numbers.length >= 2) {
    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    const squaredDiffs = numbers.map(x => (x - mean) ** 2);
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / numbers.length;
    const stdDev = Math.sqrt(variance);
    
    return `**Calculating Standard Deviation**

**Data:** ${numbers.join(', ')}

**Step 1:** Calculate the mean
Mean = ${numbers.reduce((a, b) => a + b, 0)} / ${numbers.length} = ${mean.toFixed(4)}

**Step 2:** Find squared differences from mean
${numbers.map(x => `(${x} - ${mean.toFixed(2)})² = ${((x - mean) ** 2).toFixed(4)}`).join('\n')}

**Step 3:** Calculate variance (mean of squared differences)
Variance = ${squaredDiffs.map(d => d.toFixed(2)).join(' + ')} / ${numbers.length}
Variance = ${squaredDiffs.reduce((a, b) => a + b, 0).toFixed(4)} / ${numbers.length} = ${variance.toFixed(4)}

**Step 4:** Take square root for standard deviation
σ = √${variance.toFixed(4)} = ${stdDev.toFixed(4)}

**Answer:**
- **Variance = ${variance.toFixed(4)}**
- **Standard Deviation = ${stdDev.toFixed(4)}** ✓`;
  }
  
  // ===== GEOMETRY =====
  if (q.includes("area") || q.includes("perimeter") || q.includes("circumference")) {
    if (q.includes("circle") && numbers.length >= 1) {
      const r = numbers[0];
      return `**Circle Calculations (radius = ${r})**

**Area:**
\`\`\`
A = πr²
A = π × ${r}²
A = π × ${r * r}
A = ${(Math.PI * r * r).toFixed(4)}
\`\`\`

**Circumference:**
\`\`\`
C = 2πr
C = 2 × π × ${r}
C = ${(2 * Math.PI * r).toFixed(4)}
\`\`\`

**Answer:**
- Area = ${(Math.PI * r * r).toFixed(4)} square units ≈ ${r * r}π
- Circumference = ${(2 * Math.PI * r).toFixed(4)} units ≈ ${2 * r}π`;
    }
    
    if (q.includes("triangle") && numbers.length >= 2) {
      const base = numbers[0], height = numbers[1];
      return `**Triangle Calculations**

**Given:** base = ${base}, height = ${height}

**Area:**
\`\`\`
A = ½ × base × height
A = ½ × ${base} × ${height}
A = ${(0.5 * base * height)}
\`\`\`

**Answer: Area = ${0.5 * base * height} square units** ✓`;
    }
    
    if (q.includes("rectangle") && numbers.length >= 2) {
      const l = numbers[0], w = numbers[1];
      return `**Rectangle Calculations**

**Given:** length = ${l}, width = ${w}

**Area:**
\`\`\`
A = length × width
A = ${l} × ${w}
A = ${l * w}
\`\`\`

**Perimeter:**
\`\`\`
P = 2(length + width)
P = 2(${l} + ${w})
P = 2 × ${l + w}
P = ${2 * (l + w)}
\`\`\`

**Answer:**
- Area = ${l * w} square units
- Perimeter = ${2 * (l + w)} units`;
    }
    
    if ((q.includes("square")) && numbers.length >= 1) {
      const s = numbers[0];
      return `**Square Calculations (side = ${s})**

**Area:**
\`\`\`
A = side²
A = ${s}²
A = ${s * s}
\`\`\`

**Perimeter:**
\`\`\`
P = 4 × side
P = 4 × ${s}
P = ${4 * s}
\`\`\`

**Diagonal:**
\`\`\`
d = side × √2
d = ${s} × √2
d ≈ ${(s * Math.sqrt(2)).toFixed(4)}
\`\`\`

**Answer:**
- Area = ${s * s} square units
- Perimeter = ${4 * s} units
- Diagonal ≈ ${(s * Math.sqrt(2)).toFixed(4)} units`;
    }
  }
  
  // ===== PYTHAGOREAN THEOREM =====
  if (q.includes("pythag") || (q.includes("hypotenuse")) || (q.includes("right triangle") && numbers.length >= 2)) {
    if (numbers.length >= 2) {
      const a = numbers[0], b = numbers[1];
      const c = Math.sqrt(a * a + b * b);
      
      return `**Pythagorean Theorem**

**Given:** a = ${a}, b = ${b}

**Formula:** a² + b² = c²

**Calculation:**
\`\`\`
c² = ${a}² + ${b}²
c² = ${a * a} + ${b * b}
c² = ${a * a + b * b}
c = √${a * a + b * b}
c = ${c.toFixed(4)}
\`\`\`

**Answer: Hypotenuse c = ${c.toFixed(4)}** ✓

${Number.isInteger(c) ? `\n✨ This is a Pythagorean triple! (${a}, ${b}, ${c})` : ''}`;
    }
  }
  
  // ===== TRIGONOMETRY =====
  if (q.includes("sin") || q.includes("cos") || q.includes("tan")) {
    // Check for angle values
    const degreeMatch = question.match(/(\d+)\s*(?:°|degree|deg)/i);
    if (degreeMatch) {
      const deg = parseInt(degreeMatch[1]);
      const rad = deg * Math.PI / 180;
      
      return `**Trigonometric Values for ${deg}°**

**Converting to radians:**
${deg}° = ${deg} × (π/180) = ${(deg / 180).toFixed(4)}π rad

**Values:**
\`\`\`
sin(${deg}°) = ${Math.sin(rad).toFixed(6)}
cos(${deg}°) = ${Math.cos(rad).toFixed(6)}
tan(${deg}°) = ${Math.abs(Math.cos(rad)) < 0.0001 ? 'undefined' : Math.tan(rad).toFixed(6)}
\`\`\`

**Answer:**
- sin(${deg}°) = ${Math.sin(rad).toFixed(4)}
- cos(${deg}°) = ${Math.cos(rad).toFixed(4)}
- tan(${deg}°) = ${Math.abs(Math.cos(rad)) < 0.0001 ? 'undefined' : Math.tan(rad).toFixed(4)}

**Common Angle Values:**
| Angle | sin | cos | tan |
|-------|-----|-----|-----|
| 0° | 0 | 1 | 0 |
| 30° | 1/2 | √3/2 | 1/√3 |
| 45° | √2/2 | √2/2 | 1 |
| 60° | √3/2 | 1/2 | √3 |
| 90° | 1 | 0 | undef |`;
    }
    
    // Trig identities
    if (q.includes("identity") || q.includes("identities") || q.includes("formula")) {
      return `**Trigonometric Identities** 📐

**Pythagorean Identities:**
- sin²θ + cos²θ = 1
- 1 + tan²θ = sec²θ
- 1 + cot²θ = csc²θ

**Reciprocal Identities:**
- cscθ = 1/sinθ
- secθ = 1/cosθ
- cotθ = 1/tanθ

**Quotient Identities:**
- tanθ = sinθ/cosθ
- cotθ = cosθ/sinθ

**Double Angle Formulas:**
- sin(2θ) = 2sinθcosθ
- cos(2θ) = cos²θ - sin²θ = 2cos²θ - 1 = 1 - 2sin²θ
- tan(2θ) = 2tanθ/(1 - tan²θ)

**Sum/Difference Formulas:**
- sin(A ± B) = sinA cosB ± cosA sinB
- cos(A ± B) = cosA cosB ∓ sinA sinB`;
    }
  }
  
  // ===== LOGARITHMS =====
  if (q.includes("log") || q.includes("ln")) {
    if (numbers.length >= 1) {
      const n = numbers[0];
      return `**Logarithm Calculations for ${n}**

**Common Logarithm (base 10):**
log₁₀(${n}) = ${Math.log10(n).toFixed(6)}

**Natural Logarithm (base e):**
ln(${n}) = ${Math.log(n).toFixed(6)}

**Log Properties:**
- log(ab) = log(a) + log(b)
- log(a/b) = log(a) - log(b)
- log(aⁿ) = n·log(a)
- log_a(a) = 1
- log_a(1) = 0

**Change of Base Formula:**
log_b(x) = log(x) / log(b) = ln(x) / ln(b)`;
    }
    
    return `**Logarithm Rules** 📚

**Definition:** If bˣ = y, then log_b(y) = x

**Basic Properties:**
- log_b(1) = 0
- log_b(b) = 1
- log_b(bˣ) = x
- b^(log_b(x)) = x

**Product Rule:** log_b(xy) = log_b(x) + log_b(y)

**Quotient Rule:** log_b(x/y) = log_b(x) - log_b(y)

**Power Rule:** log_b(xⁿ) = n·log_b(x)

**Change of Base:** log_b(x) = log_a(x) / log_a(b)

**Common Bases:**
- log = log₁₀ (common logarithm)
- ln = logₑ (natural logarithm)

**What logarithm problem would you like me to solve?**`;
  }
  
  // ===== EXPONENTS =====
  if ((q.includes("exponent") || q.includes("power") || q.includes("^")) && numbers.length >= 2) {
    const base = numbers[0], exp = numbers[1];
    const result = Math.pow(base, exp);
    
    return `**Calculating ${base}^${exp}**

**Exponent Calculation:**
\`\`\`
${base}^${exp} = ${Array(exp).fill(base).join(' × ')}
${base}^${exp} = ${result}
\`\`\`

**Answer: ${base}^${exp} = ${result}** ✓

**Exponent Rules:**
- aᵐ × aⁿ = aᵐ⁺ⁿ
- aᵐ ÷ aⁿ = aᵐ⁻ⁿ
- (aᵐ)ⁿ = aᵐⁿ
- a⁰ = 1
- a⁻ⁿ = 1/aⁿ`;
  }
  
  // ===== SLOPE & LINEAR EQUATIONS =====
  if ((q.includes("slope") || q.includes("gradient")) && numbers.length >= 4) {
    const x1 = numbers[0], y1 = numbers[1], x2 = numbers[2], y2 = numbers[3];
    const slope = (y2 - y1) / (x2 - x1);
    
    return `**Calculating Slope**

**Given Points:** (${x1}, ${y1}) and (${x2}, ${y2})

**Formula:** m = (y₂ - y₁) / (x₂ - x₁)

**Calculation:**
\`\`\`
m = (${y2} - ${y1}) / (${x2} - ${x1})
m = ${y2 - y1} / ${x2 - x1}
m = ${slope}
\`\`\`

**Answer: Slope m = ${slope}** ✓

**Point-Slope Form:**
y - ${y1} = ${slope}(x - ${x1})

**Slope-Intercept Form:**
y = ${slope}x + ${y1 - slope * x1}`;
  }
  
  // ===== DISTANCE FORMULA =====
  if (q.includes("distance") && numbers.length >= 4) {
    const x1 = numbers[0], y1 = numbers[1], x2 = numbers[2], y2 = numbers[3];
    const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    
    return `**Distance Between Two Points**

**Given Points:** (${x1}, ${y1}) and (${x2}, ${y2})

**Formula:** d = √[(x₂ - x₁)² + (y₂ - y₁)²]

**Calculation:**
\`\`\`
d = √[(${x2} - ${x1})² + (${y2} - ${y1})²]
d = √[(${x2 - x1})² + (${y2 - y1})²]
d = √[${(x2 - x1) ** 2} + ${(y2 - y1) ** 2}]
d = √${(x2 - x1) ** 2 + (y2 - y1) ** 2}
d = ${distance.toFixed(4)}
\`\`\`

**Answer: Distance = ${distance.toFixed(4)} units** ✓

**Midpoint:** ((${x1} + ${x2})/2, (${y1} + ${y2})/2) = (${(x1 + x2) / 2}, ${(y1 + y2) / 2})`;
  }
  
  // ===== MIDPOINT =====
  if (q.includes("midpoint") && numbers.length >= 4) {
    const x1 = numbers[0], y1 = numbers[1], x2 = numbers[2], y2 = numbers[3];
    
    return `**Finding the Midpoint**

**Given Points:** (${x1}, ${y1}) and (${x2}, ${y2})

**Formula:** M = ((x₁ + x₂)/2, (y₁ + y₂)/2)

**Calculation:**
\`\`\`
Mx = (${x1} + ${x2}) / 2 = ${x1 + x2} / 2 = ${(x1 + x2) / 2}
My = (${y1} + ${y2}) / 2 = ${y1 + y2} / 2 = ${(y1 + y2) / 2}
\`\`\`

**Answer: Midpoint = (${(x1 + x2) / 2}, ${(y1 + y2) / 2})** ✓`;
  }
  
  // ===== PERCENTAGE =====
  if (q.includes("percent") || q.includes("%")) {
    if (numbers.length >= 2) {
      const a = numbers[0], b = numbers[1];
      
      if (q.includes("of")) {
        // "What is X% of Y?"
        const result = (a / 100) * b;
        return `**Calculating ${a}% of ${b}**

**Formula:** (Percentage / 100) × Total

**Calculation:**
\`\`\`
${a}% of ${b} = (${a} / 100) × ${b}
             = ${a / 100} × ${b}
             = ${result}
\`\`\`

**Answer: ${a}% of ${b} = ${result}** ✓`;
      }
      
      if (q.includes("what percent") || q.includes("percentage")) {
        // "X is what percent of Y?"
        const result = (a / b) * 100;
        return `**What Percentage is ${a} of ${b}?**

**Formula:** (Part / Whole) × 100

**Calculation:**
\`\`\`
Percentage = (${a} / ${b}) × 100
           = ${(a / b).toFixed(4)} × 100
           = ${result.toFixed(2)}%
\`\`\`

**Answer: ${a} is ${result.toFixed(2)}% of ${b}** ✓`;
      }
      
      // Percentage increase/decrease
      const percentChange = ((b - a) / a) * 100;
      return `**Percentage Change from ${a} to ${b}**

**Formula:** ((New - Old) / Old) × 100

**Calculation:**
\`\`\`
Change = ((${b} - ${a}) / ${a}) × 100
       = (${b - a} / ${a}) × 100
       = ${((b - a) / a).toFixed(4)} × 100
       = ${percentChange.toFixed(2)}%
\`\`\`

**Answer: ${percentChange >= 0 ? 'Increase' : 'Decrease'} of ${Math.abs(percentChange).toFixed(2)}%** ✓`;
    }
  }
  
  // ===== RATIOS & PROPORTIONS =====
  if ((q.includes("ratio") || q.includes("proportion")) && numbers.length >= 2) {
    const a = numbers[0], b = numbers[1];
    const g = gcd(a, b);
    
    return `**Simplifying Ratio ${a}:${b}**

**Finding GCD:**
GCD(${a}, ${b}) = ${g}

**Simplification:**
\`\`\`
${a}:${b} = ${a / g}:${b / g}
\`\`\`

**Answer: Simplified ratio = ${a / g}:${b / g}** ✓

**As a fraction:** ${a}/${b} = ${a / g}/${b / g}
**As a decimal:** ${(a / b).toFixed(4)}`;
  }
  
  // ===== SERIES & SEQUENCES =====
  if (q.includes("arithmetic") && q.includes("sequence") || q.includes("sum of arithmetic")) {
    if (numbers.length >= 3) {
      const a = numbers[0]; // first term
      const d = numbers[1]; // common difference
      const n = numbers[2]; // number of terms
      const lastTerm = a + (n - 1) * d;
      const sum = (n / 2) * (a + lastTerm);
      
      return `**Arithmetic Sequence**

**Given:** a₁ = ${a}, d = ${d}, n = ${n}

**nth Term Formula:** aₙ = a₁ + (n-1)d
\`\`\`
a${n} = ${a} + (${n}-1)(${d})
a${n} = ${a} + ${(n - 1) * d}
a${n} = ${lastTerm}
\`\`\`

**Sum Formula:** Sₙ = n/2 × (a₁ + aₙ)
\`\`\`
S${n} = ${n}/2 × (${a} + ${lastTerm})
S${n} = ${n / 2} × ${a + lastTerm}
S${n} = ${sum}
\`\`\`

**Answer:**
- ${n}th term = ${lastTerm}
- Sum of ${n} terms = ${sum} ✓`;
    }
  }
  
  if (q.includes("geometric") && q.includes("sequence") || q.includes("sum of geometric")) {
    if (numbers.length >= 3) {
      const a = numbers[0]; // first term
      const r = numbers[1]; // common ratio
      const n = numbers[2]; // number of terms
      const nthTerm = a * Math.pow(r, n - 1);
      const sum = r === 1 ? a * n : a * (1 - Math.pow(r, n)) / (1 - r);
      
      return `**Geometric Sequence**

**Given:** a₁ = ${a}, r = ${r}, n = ${n}

**nth Term Formula:** aₙ = a₁ × r^(n-1)
\`\`\`
a${n} = ${a} × ${r}^(${n}-1)
a${n} = ${a} × ${r}^${n - 1}
a${n} = ${a} × ${Math.pow(r, n - 1)}
a${n} = ${nthTerm}
\`\`\`

**Sum Formula:** Sₙ = a₁(1 - rⁿ)/(1 - r)
\`\`\`
S${n} = ${a}(1 - ${r}^${n})/(1 - ${r})
S${n} = ${a}(1 - ${Math.pow(r, n)})/${1 - r}
S${n} = ${sum.toFixed(4)}
\`\`\`

**Answer:**
- ${n}th term = ${nthTerm}
- Sum of ${n} terms = ${sum.toFixed(4)} ✓`;
    }
  }
  
  // ===== QUADRATIC FORMULA (general request) =====
  if (q.includes("quadratic formula")) {
    return `**The Quadratic Formula** 📐

For any quadratic equation **ax² + bx + c = 0**:

\`\`\`
      -b ± √(b² - 4ac)
x = ─────────────────────
           2a
\`\`\`

**The Discriminant (Δ = b² - 4ac):**
- Δ > 0: Two distinct real roots
- Δ = 0: One repeated real root (double root)
- Δ < 0: Two complex conjugate roots

**Example:** Solve 2x² + 5x - 3 = 0
- a = 2, b = 5, c = -3
- Δ = 25 - 4(2)(-3) = 25 + 24 = 49
- x = (-5 ± 7) / 4
- x = 2/4 = 0.5 or x = -12/4 = -3

**Would you like me to solve a specific quadratic equation?**`;
  }
  
  // ===== SIMPLE ARITHMETIC =====
  if (numbers.length >= 2 && !q.match(/[a-z]/i)) {
    const a = numbers[0], b = numbers[1];
    
    if (q.includes("+")) {
      return `**Addition: ${a} + ${b} = ${a + b}** ✓`;
    }
    if (q.includes("-") || q.includes("−")) {
      return `**Subtraction: ${a} - ${b} = ${a - b}** ✓`;
    }
    if (q.includes("*") || q.includes("×") || q.includes("times")) {
      return `**Multiplication: ${a} × ${b} = ${a * b}** ✓`;
    }
    if (q.includes("/") || q.includes("÷") || q.includes("divided")) {
      return `**Division: ${a} ÷ ${b} = ${(a / b).toFixed(4)}** ✓
      
${b !== 0 && a % b === 0 ? `This divides evenly!` : `Remainder: ${a % b}`}`;
    }
  }
  
  // ===== SQRT & ROOTS =====
  if ((q.includes("sqrt") || q.includes("square root") || q.includes("√")) && numbers.length >= 1) {
    const n = numbers[0];
    const result = Math.sqrt(n);
    const isPerect = Number.isInteger(result);
    
    return `**Square Root of ${n}**

\`\`\`
√${n} = ${result.toFixed(6)}
\`\`\`

**Answer: √${n} = ${isPerect ? result : result.toFixed(4)}** ✓

${isPerect ? `✨ ${n} is a **perfect square**! (${result}² = ${n})` : 
  `${n} is not a perfect square.
Perfect squares near ${n}: ${Math.floor(result)}² = ${Math.floor(result) ** 2}, ${Math.ceil(result)}² = ${Math.ceil(result) ** 2}`}`;
  }
  
  if ((q.includes("cube root") || q.includes("∛")) && numbers.length >= 1) {
    const n = numbers[0];
    const result = Math.cbrt(n);
    
    return `**Cube Root of ${n}**

\`\`\`
∛${n} = ${result.toFixed(6)}
\`\`\`

**Answer: ∛${n} = ${result.toFixed(4)}** ✓

**Verification:** ${result.toFixed(4)}³ = ${(result ** 3).toFixed(4)} ≈ ${n}`;
  }
  
  // ===== SYSTEMS OF EQUATIONS =====
  if (q.includes("system") && q.includes("equation")) {
    return `**Solving Systems of Equations**

**Methods:**

**1. Substitution Method:**
- Solve one equation for one variable
- Substitute into the other equation
- Solve and back-substitute

**2. Elimination Method:**
- Multiply equations to match coefficients
- Add/subtract to eliminate a variable
- Solve and back-substitute

**3. Matrix Method (Cramer's Rule):**
- For ax + by = c and dx + ey = f:
- x = (ce - bf)/(ae - bd)
- y = (af - cd)/(ae - bd)

**Example:**
\`\`\`
2x + 3y = 8
x - y = 1

From equation 2: x = y + 1
Substitute: 2(y + 1) + 3y = 8
           2y + 2 + 3y = 8
           5y = 6
           y = 1.2
           x = 2.2
\`\`\`

**Share your system of equations** and I'll solve it step-by-step!`;
  }
  
  // ===== BINOMIAL THEOREM =====
  if (q.includes("binomial") || q.includes("expand") && q.includes("(")) {
    if (numbers.length >= 1) {
      const n = numbers[0];
      if (n <= 6) {
        let expansion = "";
        for (let k = 0; k <= n; k++) {
          const coef = factorial(n) / (factorial(k) * factorial(n - k));
          if (k > 0) expansion += " + ";
          if (n - k === 0) expansion += `${coef}`;
          else if (k === 0) expansion += `a^${n}`;
          else if (n - k === 1) expansion += `${coef}a·b^${k}`;
          else if (k === 1) expansion += `${coef}a^${n - k}·b`;
          else expansion += `${coef}a^${n - k}·b^${k}`;
        }
        
        return `**Binomial Expansion of (a + b)^${n}**

**Binomial Theorem:**
(a + b)ⁿ = Σ C(n,k) · aⁿ⁻ᵏ · bᵏ

**Pascal's Triangle Row ${n}:**
${Array.from({length: n + 1}, (_, k) => factorial(n) / (factorial(k) * factorial(n - k))).join(' ')}

**Expansion:**
\`\`\`
(a + b)^${n} = ${expansion}
\`\`\`

**Answer:** (a + b)^${n} = ${expansion}`;
      }
    }
    
    return `**Binomial Theorem** 📚

**(a + b)ⁿ = Σ C(n,k) · aⁿ⁻ᵏ · bᵏ** for k = 0 to n

**Common Expansions:**
- (a + b)² = a² + 2ab + b²
- (a + b)³ = a³ + 3a²b + 3ab² + b³
- (a + b)⁴ = a⁴ + 4a³b + 6a²b² + 4ab³ + b⁴
- (a - b)² = a² - 2ab + b²

**Pascal's Triangle** gives coefficients:
\`\`\`
       1
      1 1
     1 2 1
    1 3 3 1
   1 4 6 4 1
  1 5 10 10 5 1
\`\`\`

**What would you like me to expand?**`;
  }
  
  // ===== HELP / GENERAL =====
  if (q.includes("help") || q.includes("what can you") || q.includes("how to use")) {
    return `**Welcome to AI Math Tutor!** 🎓

I can help you with a **wide variety** of math topics:

**📊 Algebra**
- Solving linear equations (e.g., "solve 2x + 5 = 15")
- Quadratic equations (e.g., "solve x² + 5x + 6 = 0")
- Factoring (e.g., "factor x² - 9")
- Systems of equations

**📐 Geometry**
- Area & perimeter calculations
- Pythagorean theorem
- Distance & midpoint formulas
- Circle, triangle, rectangle formulas

**∫ Calculus**
- Derivatives (e.g., "derivative of x³")
- Integrals (e.g., "integrate sin(x)")
- Limits

**📈 Statistics**
- Mean, median, mode
- Standard deviation & variance
- Combinations & permutations

**🔢 Number Theory**
- GCD & LCM
- Prime factorization
- Factorials

**📏 Trigonometry**
- Trig values (e.g., "sin(30°)")
- Trig identities

**💡 Tips:**
- Be specific with your question
- Include the actual numbers/equation
- Ask for "step-by-step" for detailed explanations
- Ask for "similar problems" for practice

**Try asking me anything!**`;
  }
  
  // ===== DEFAULT - Intelligent fallback =====
  return `I'd love to help you with this math problem! 🧮

To give you the best step-by-step solution, could you please provide:

1. **The specific equation or expression** you're working with
2. **What you need to find** (solve for x, simplify, factor, etc.)
3. **Any given values** or conditions

**Examples of questions I can solve:**
- "Solve 3x + 7 = 22"
- "Find the derivative of x⁴ + 2x² - 5"
- "Integrate cos(x)"
- "Factor x² + 5x + 6"
- "Find the mean of 4, 8, 12, 16, 20"
- "What is the area of a circle with radius 5?"
- "Calculate 8! (factorial)"
- "Find GCD of 48 and 36"
- "Solve x² - 4x - 5 = 0"
- "Distance between points (1,2) and (4,6)"

**I can handle:**
✓ Algebra (linear, quadratic, systems)
✓ Calculus (derivatives, integrals, limits)
✓ Geometry (area, volume, distance)
✓ Trigonometry (values, identities)
✓ Statistics (mean, median, std dev)
✓ Number theory (GCD, LCM, primes, factorial)
✓ And much more!

**Just type your math question and I'll solve it step-by-step!**`;
};

export function AIMathTutor() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showTopics, setShowTopics] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [conversations, setConversations] = useState<ConversationHistory[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load conversation history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("mm_math_tutor_history");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConversations(parsed.map((c: ConversationHistory) => ({
          ...c,
          timestamp: new Date(c.timestamp),
          messages: c.messages.map(m => ({ ...m, timestamp: new Date(m.timestamp) }))
        })));
      } catch (e) {
        console.error("Failed to parse history:", e);
      }
    }
  }, []);

  // Save conversations to localStorage
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem("mm_math_tutor_history", JSON.stringify(conversations));
    }
  }, [conversations]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Keyboard shortcut to open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === "m") {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setShowTopics(false);
    setIsLoading(true);

    // Simulate AI thinking delay
    setTimeout(() => {
      const response = generateMathResponse(userMessage.content);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  const handleTopicExample = (example: string) => {
    setInput(example);
    inputRef.current?.focus();
  };

  const copyToClipboard = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    if (messages.length > 0) {
      // Save current conversation to history
      const title = messages[0]?.content.slice(0, 50) || "Conversation";
      const newConversation: ConversationHistory = {
        id: Date.now().toString(),
        title,
        preview: messages[messages.length - 1]?.content.slice(0, 100) || "",
        timestamp: new Date(),
        messages: [...messages],
      };
      setConversations(prev => [newConversation, ...prev.slice(0, 9)]);
    }
    setMessages([]);
    setShowTopics(true);
  };

  const loadConversation = (conversation: ConversationHistory) => {
    setMessages(conversation.messages);
    setShowHistory(false);
    setShowTopics(false);
  };

  const formatContent = (content: string) => {
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code class="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-sm">$1</code>')
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-slate-200 dark:bg-slate-700 p-2 rounded my-2 overflow-x-auto text-sm"><code>$1</code></pre>')
      .replace(/\n/g, '<br />');
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 md:bottom-6 right-[84px] z-[88] w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 touch-manipulation"
        aria-label="Open AI Math Tutor"
        title="AI Math Tutor (Alt+M)"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Brain className="w-7 h-7 text-white" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[700px] md:h-[600px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl z-[201] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-violet-500 to-purple-600 text-white">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Brain className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg">AI Math Tutor</h2>
                    <p className="text-xs text-white/80">Powered by MasterMath AI</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                    title="Conversation History"
                  >
                    <History className="w-5 h-5" />
                  </button>
                  <button
                    onClick={clearChat}
                    className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                    title="New Chat"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* History Panel */}
              <AnimatePresence>
                {showHistory && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-b border-slate-200 dark:border-slate-700 overflow-hidden"
                  >
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 max-h-40 overflow-y-auto">
                      {conversations.length === 0 ? (
                        <p className="text-sm text-slate-500 text-center py-2">No conversation history</p>
                      ) : (
                        <div className="space-y-2">
                          {conversations.map((conv) => (
                            <button
                              key={conv.id}
                              onClick={() => loadConversation(conv)}
                              className="w-full text-left p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{conv.title}</p>
                              <p className="text-xs text-slate-500 truncate">{conv.preview}</p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {showTopics && messages.length === 0 && (
                  <div className="space-y-6">
                    {/* Welcome */}
                    <div className="text-center py-4">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                        Hi! I'm your AI Math Tutor 👋
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400">
                        Ask me any math question and I'll explain it step-by-step!
                      </p>
                    </div>

                    {/* Quick Prompts */}
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-2 px-1">QUICK ACTIONS</p>
                      <div className="grid grid-cols-2 gap-2">
                        {QUICK_PROMPTS.map((qp) => (
                          <button
                            key={qp.label}
                            onClick={() => handleQuickPrompt(qp.prompt)}
                            className="flex items-center gap-2 p-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-left"
                          >
                            <qp.icon className="w-4 h-4 text-violet-500" />
                            <span className="text-sm text-slate-700 dark:text-slate-300">{qp.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Topics */}
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-2 px-1">TOPICS I CAN HELP WITH</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {MATH_TOPICS.map((topic) => (
                          <div
                            key={topic.label}
                            className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-lg">{topic.icon}</span>
                              <span className="font-medium text-slate-900 dark:text-white text-sm">{topic.label}</span>
                            </div>
                            <div className="space-y-1">
                              {topic.examples.map((ex) => (
                                <button
                                  key={ex}
                                  onClick={() => handleTopicExample(ex)}
                                  className="block w-full text-left text-xs text-violet-600 dark:text-violet-400 hover:underline truncate"
                                >
                                  "{ex}"
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Chat Messages */}
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-4 ${
                        msg.role === "user"
                          ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                      }`}
                    >
                      <div
                        className="text-sm leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }}
                      />
                      {msg.role === "assistant" && (
                        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                          <button
                            onClick={() => copyToClipboard(msg.content, msg.id)}
                            className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3 h-3" /> Copied
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" /> Copy
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                <div className="flex gap-2">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Ask me any math question..."
                    className="flex-1 resize-none rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    rows={1}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="px-4 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-2 text-center">
                  Press Enter to send • Shift+Enter for new line
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
