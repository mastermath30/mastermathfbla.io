"use client";

import { useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { SectionLabel } from "@/components/SectionLabel";

type QuizQuestion = {
  prompt: string;
  options: string[];
  correctIndex: number;
};

type DifficultyQuestions = {
  easy: QuizQuestion[];
  medium: QuizQuestion[];
  hard: QuizQuestion[];
};

type QuizData = {
  title: string;
  description: string;
  difficulty: string;
  time: string;
  topic: string;
  questionsByDifficulty: DifficultyQuestions;
};

const quizzesBySlug: Record<string, QuizData> = {
  "algebra-basics": {
    title: "Algebra Basics",
    description: "Test your understanding of equations, expressions, and inequalities.",
    difficulty: "Beginner",
    time: "15 questions • 20 min",
    topic: "Algebra",
    questionsByDifficulty: {
      easy: [
        {
          prompt: "Solve for x: x + 5 = 10",
          options: ["x = 5", "x = 15", "x = 2", "x = 10"],
          correctIndex: 0,
        },
        {
          prompt: "What is 3 × 4?",
          options: ["7", "12", "10", "14"],
          correctIndex: 1,
        },
        {
          prompt: "Simplify: 2x + 3x",
          options: ["5x", "6x", "5x²", "6"],
          correctIndex: 0,
        },
        {
          prompt: "Solve for y: y - 3 = 7",
          options: ["y = 4", "y = 10", "y = 21", "y = -4"],
          correctIndex: 1,
        },
        {
          prompt: "What is the value of x if 2x = 8?",
          options: ["x = 2", "x = 4", "x = 6", "x = 16"],
          correctIndex: 1,
        },
      ],
      medium: [
        {
          prompt: "Solve for x: 2x + 5 = 17",
          options: ["x = 6", "x = 8", "x = 11", "x = 12"],
          correctIndex: 0,
        },
        {
          prompt: "Simplify: 3(2x - 4) + x",
          options: ["6x - 4", "7x - 12", "6x - 12", "5x - 12"],
          correctIndex: 1,
        },
        {
          prompt: "Which is equivalent to 4x - 9 = 7?",
          options: ["x = 4", "x = -4", "x = 1", "x = 2"],
          correctIndex: 0,
        },
        {
          prompt: "Factor: x² + 5x + 6",
          options: ["(x + 2)(x + 3)", "(x - 2)(x - 3)", "(x + 1)(x + 6)", "(x - 1)(x - 6)"],
          correctIndex: 0,
        },
        {
          prompt: "Solve the inequality: 3x - 7 > 5",
          options: ["x > 4", "x > 6", "x > 12", "x > -4"],
          correctIndex: 0,
        },
      ],
      hard: [
        {
          prompt: "Solve the system: 2x + y = 7 and x - y = 2. What is x?",
          options: ["x = 3", "x = 2", "x = 4", "x = 1"],
          correctIndex: 0,
        },
        {
          prompt: "Find the roots of x² - 5x + 6 = 0",
          options: ["x = 2, 3", "x = -2, -3", "x = 1, 6", "x = -1, -6"],
          correctIndex: 0,
        },
        {
          prompt: "Simplify: (x² - 9)/(x - 3)",
          options: ["x + 3", "x - 3", "x² - 3", "x + 9"],
          correctIndex: 0,
        },
        {
          prompt: "If f(x) = 2x² - 3x + 1, find f(2)",
          options: ["3", "5", "7", "1"],
          correctIndex: 0,
        },
        {
          prompt: "Solve: |2x - 5| = 9",
          options: ["x = 7 or x = -2", "x = 2 or x = 7", "x = -7 or x = 2", "x = 7 only"],
          correctIndex: 0,
        },
      ],
    },
  },
  "geometry-proofs": {
    title: "Geometry Proofs",
    description: "Practice writing and understanding geometric proofs.",
    difficulty: "Intermediate",
    time: "10 questions • 15 min",
    topic: "Geometry",
    questionsByDifficulty: {
      easy: [
        {
          prompt: "How many sides does a triangle have?",
          options: ["3", "4", "5", "6"],
          correctIndex: 0,
        },
        {
          prompt: "What type of angle is exactly 90 degrees?",
          options: ["Acute", "Obtuse", "Right", "Straight"],
          correctIndex: 2,
        },
        {
          prompt: "A square has how many equal sides?",
          options: ["2", "3", "4", "5"],
          correctIndex: 2,
        },
        {
          prompt: "What is the sum of angles in a straight line?",
          options: ["90°", "180°", "270°", "360°"],
          correctIndex: 1,
        },
        {
          prompt: "What shape has 4 equal sides and 4 right angles?",
          options: ["Rectangle", "Rhombus", "Square", "Trapezoid"],
          correctIndex: 2,
        },
      ],
      medium: [
        {
          prompt: "If two angles are supplementary, their measures add up to:",
          options: ["90 degrees", "120 degrees", "180 degrees", "360 degrees"],
          correctIndex: 2,
        },
        {
          prompt: "A triangle with sides 3, 4, 5 is:",
          options: ["Equilateral", "Isosceles", "Right", "Obtuse"],
          correctIndex: 2,
        },
        {
          prompt: "Which statement is always true for vertical angles?",
          options: ["They are supplementary", "They are congruent", "They are adjacent", "They sum to 360°"],
          correctIndex: 1,
        },
        {
          prompt: "The sum of the interior angles of a triangle is:",
          options: ["90 degrees", "180 degrees", "270 degrees", "360 degrees"],
          correctIndex: 1,
        },
        {
          prompt: "If two lines are parallel, corresponding angles are:",
          options: ["Congruent", "Supplementary", "Complementary", "Right angles"],
          correctIndex: 0,
        },
      ],
      hard: [
        {
          prompt: "In a triangle, if one angle is 90° and another is 45°, what is the third angle?",
          options: ["45°", "55°", "35°", "60°"],
          correctIndex: 0,
        },
        {
          prompt: "The sum of interior angles of a hexagon is:",
          options: ["540°", "720°", "900°", "1080°"],
          correctIndex: 1,
        },
        {
          prompt: "If a chord passes through the center of a circle, it is called a:",
          options: ["Radius", "Diameter", "Tangent", "Secant"],
          correctIndex: 1,
        },
        {
          prompt: "Two triangles are similar if:",
          options: ["All sides are equal", "All angles are equal", "One side is equal", "Perimeters are equal"],
          correctIndex: 1,
        },
        {
          prompt: "The angle inscribed in a semicircle is always:",
          options: ["45°", "60°", "90°", "180°"],
          correctIndex: 2,
        },
      ],
    },
  },
  "calculus-derivatives": {
    title: "Calculus: Derivatives",
    description: "Master the fundamentals of differentiation and derivative rules.",
    difficulty: "Advanced",
    time: "20 questions • 30 min",
    topic: "Calculus",
    questionsByDifficulty: {
      easy: [
        {
          prompt: "What is the derivative of f(x) = 5?",
          options: ["5", "0", "1", "x"],
          correctIndex: 1,
        },
        {
          prompt: "What is the derivative of f(x) = x?",
          options: ["0", "1", "x", "2x"],
          correctIndex: 1,
        },
        {
          prompt: "What is the derivative of f(x) = 3x?",
          options: ["3", "3x", "0", "x"],
          correctIndex: 0,
        },
        {
          prompt: "What is the derivative of f(x) = x²?",
          options: ["2x", "x", "x²", "2"],
          correctIndex: 0,
        },
        {
          prompt: "The derivative tells us the _____ of a function.",
          options: ["Area", "Slope", "Volume", "Maximum"],
          correctIndex: 1,
        },
      ],
      medium: [
        {
          prompt: "What is the derivative of f(x) = x³?",
          options: ["3x²", "3x", "x²", "x³"],
          correctIndex: 0,
        },
        {
          prompt: "What is the derivative of f(x) = 5x²?",
          options: ["10x", "5x", "10x²", "5"],
          correctIndex: 0,
        },
        {
          prompt: "What is the derivative of f(x) = sin(x)?",
          options: ["cos(x)", "-cos(x)", "-sin(x)", "tan(x)"],
          correctIndex: 0,
        },
        {
          prompt: "Using the power rule, the derivative of x⁵ is:",
          options: ["5x⁴", "x⁴", "5x⁵", "4x⁵"],
          correctIndex: 0,
        },
        {
          prompt: "What is the derivative of f(x) = eˣ?",
          options: ["eˣ", "xeˣ⁻¹", "0", "1"],
          correctIndex: 0,
        },
      ],
      hard: [
        {
          prompt: "Find the derivative of f(x) = x²·sin(x) using the product rule:",
          options: ["2x·sin(x) + x²·cos(x)", "2x·cos(x)", "x²·cos(x)", "2x·sin(x) - x²·cos(x)"],
          correctIndex: 0,
        },
        {
          prompt: "What is the derivative of f(x) = ln(x²)?",
          options: ["2/x", "1/x²", "2x/x²", "1/2x"],
          correctIndex: 0,
        },
        {
          prompt: "Find the derivative of f(x) = (3x + 1)⁴ using the chain rule:",
          options: ["12(3x + 1)³", "4(3x + 1)³", "3(3x + 1)³", "12x(3x + 1)³"],
          correctIndex: 0,
        },
        {
          prompt: "What is the second derivative of f(x) = x⁴?",
          options: ["12x²", "4x³", "4x²", "24x"],
          correctIndex: 0,
        },
        {
          prompt: "Find the derivative of f(x) = tan(x):",
          options: ["sec²(x)", "cot(x)", "-csc²(x)", "sin(x)/cos²(x)"],
          correctIndex: 0,
        },
      ],
    },
  },
  "trigonometry-fundamentals": {
    title: "Trigonometry Fundamentals",
    description: "Practice with sine, cosine, tangent, and trigonometric identities.",
    difficulty: "Intermediate",
    time: "15 questions • 25 min",
    topic: "Trigonometry",
    questionsByDifficulty: {
      easy: [
        { prompt: "What is sin(0°)?", options: ["0", "1", "-1", "undefined"], correctIndex: 0 },
        { prompt: "What is cos(0°)?", options: ["0", "1", "-1", "undefined"], correctIndex: 1 },
        { prompt: "What is tan(45°)?", options: ["0", "1", "√2", "undefined"], correctIndex: 1 },
        { prompt: "In a right triangle, which ratio is opposite/hypotenuse?", options: ["Cosine", "Tangent", "Sine", "Cotangent"], correctIndex: 2 },
        { prompt: "What is sin(90°)?", options: ["0", "1", "-1", "undefined"], correctIndex: 1 },
      ],
      medium: [
        { prompt: "What is sin(30°)?", options: ["1/2", "√3/2", "√2/2", "1"], correctIndex: 0 },
        { prompt: "What is cos(60°)?", options: ["1/2", "√3/2", "√2/2", "0"], correctIndex: 0 },
        { prompt: "Which identity equals sin²θ + cos²θ?", options: ["0", "1", "tan²θ", "sec²θ"], correctIndex: 1 },
        { prompt: "What is tan(30°)?", options: ["1/√3", "√3", "1", "√3/2"], correctIndex: 0 },
        { prompt: "If sin(θ) = 3/5, what is cos(θ) in a right triangle?", options: ["4/5", "3/4", "5/3", "5/4"], correctIndex: 0 },
      ],
      hard: [
        { prompt: "What is sin(2θ) equal to?", options: ["2sin(θ)cos(θ)", "sin²(θ) + cos²(θ)", "2sin(θ)", "sin(θ)cos(θ)"], correctIndex: 0 },
        { prompt: "What is cos(2θ) equal to?", options: ["cos²(θ) - sin²(θ)", "2cos(θ)", "cos²(θ) + sin²(θ)", "1 - cos(θ)"], correctIndex: 0 },
        { prompt: "What is the period of y = sin(2x)?", options: ["π", "2π", "π/2", "4π"], correctIndex: 0 },
        { prompt: "Simplify: 1 + tan²(θ)", options: ["sec²(θ)", "csc²(θ)", "cot²(θ)", "sin²(θ)"], correctIndex: 0 },
        { prompt: "What is the amplitude of y = 3sin(x)?", options: ["3", "1", "π", "2π"], correctIndex: 0 },
      ],
    },
  },
  "fractions-percentages": {
    title: "Fractions & Percentages",
    description: "Master operations with fractions, decimals, and percentages.",
    difficulty: "Beginner",
    time: "12 questions • 15 min",
    topic: "Arithmetic",
    questionsByDifficulty: {
      easy: [
        { prompt: "What is 1/2 + 1/4?", options: ["3/4", "2/6", "1/6", "2/4"], correctIndex: 0 },
        { prompt: "What is 50% as a decimal?", options: ["0.5", "0.05", "5.0", "0.50"], correctIndex: 0 },
        { prompt: "What is 1/4 as a percentage?", options: ["25%", "40%", "14%", "50%"], correctIndex: 0 },
        { prompt: "Simplify: 4/8", options: ["1/2", "2/4", "1/4", "4/8"], correctIndex: 0 },
        { prompt: "What is 10% of 100?", options: ["10", "1", "100", "0.1"], correctIndex: 0 },
      ],
      medium: [
        { prompt: "What is 2/3 + 1/6?", options: ["5/6", "3/9", "1/2", "3/6"], correctIndex: 0 },
        { prompt: "What is 3/4 × 2/5?", options: ["6/20 or 3/10", "5/9", "6/9", "5/20"], correctIndex: 0 },
        { prompt: "What is 75% as a fraction in lowest terms?", options: ["3/4", "75/100", "7/5", "15/20"], correctIndex: 0 },
        { prompt: "What is 35% of 200?", options: ["70", "35", "7", "350"], correctIndex: 0 },
        { prompt: "What is 2/5 ÷ 1/2?", options: ["4/5", "1/5", "2/10", "1/10"], correctIndex: 0 },
      ],
      hard: [
        { prompt: "If a price increases by 20%, then decreases by 20%, what's the net change?", options: ["-4%", "0%", "+4%", "-20%"], correctIndex: 0 },
        { prompt: "What is 0.125 as a fraction?", options: ["1/8", "1/4", "1/5", "1/10"], correctIndex: 0 },
        { prompt: "If 30% of x is 45, what is x?", options: ["150", "135", "15", "13.5"], correctIndex: 0 },
        { prompt: "What is 5/6 - 2/9?", options: ["11/18", "3/3", "7/15", "1/2"], correctIndex: 0 },
        { prompt: "A shirt costs $80 after a 20% discount. What was the original price?", options: ["$100", "$96", "$64", "$120"], correctIndex: 0 },
      ],
    },
  },
  "linear-functions": {
    title: "Linear Functions",
    description: "Explore slope, intercepts, and graphing linear equations.",
    difficulty: "Beginner",
    time: "15 questions • 20 min",
    topic: "Algebra",
    questionsByDifficulty: {
      easy: [
        { prompt: "What is the slope in y = 3x + 2?", options: ["3", "2", "5", "x"], correctIndex: 0 },
        { prompt: "What is the y-intercept in y = 4x - 7?", options: ["-7", "4", "7", "-4"], correctIndex: 0 },
        { prompt: "A horizontal line has a slope of:", options: ["0", "1", "undefined", "-1"], correctIndex: 0 },
        { prompt: "What form is y = mx + b?", options: ["Slope-intercept", "Point-slope", "Standard", "Vertex"], correctIndex: 0 },
        { prompt: "If a line passes through (0, 5), what is its y-intercept?", options: ["5", "0", "-5", "undefined"], correctIndex: 0 },
      ],
      medium: [
        { prompt: "Find the slope between (2, 3) and (4, 7):", options: ["2", "4", "1/2", "-2"], correctIndex: 0 },
        { prompt: "Write the equation of a line with slope 2 through (0, -3):", options: ["y = 2x - 3", "y = -3x + 2", "y = 2x + 3", "y = -2x - 3"], correctIndex: 0 },
        { prompt: "What is the slope of a line parallel to y = -4x + 1?", options: ["-4", "4", "1", "-1"], correctIndex: 0 },
        { prompt: "Convert 2x + y = 6 to slope-intercept form:", options: ["y = -2x + 6", "y = 2x + 6", "y = 2x - 6", "y = -2x - 6"], correctIndex: 0 },
        { prompt: "What is the slope of a line perpendicular to y = 3x?", options: ["-1/3", "3", "-3", "1/3"], correctIndex: 0 },
      ],
      hard: [
        { prompt: "Find the equation of the line through (1, 2) and (3, 8):", options: ["y = 3x - 1", "y = 3x + 1", "y = 2x", "y = 3x - 2"], correctIndex: 0 },
        { prompt: "At what point do y = 2x + 1 and y = -x + 7 intersect?", options: ["(2, 5)", "(3, 7)", "(1, 3)", "(4, 9)"], correctIndex: 0 },
        { prompt: "What is the x-intercept of 3x - 2y = 12?", options: ["(4, 0)", "(0, -6)", "(12, 0)", "(0, 4)"], correctIndex: 0 },
        { prompt: "Which line is perpendicular to 2x + 3y = 6?", options: ["y = 3x/2 + 1", "y = -2x/3 + 1", "y = 2x/3 + 1", "y = -3x/2 + 1"], correctIndex: 0 },
        { prompt: "Find the midpoint between (-2, 4) and (6, -2):", options: ["(2, 1)", "(4, 2)", "(2, 3)", "(4, 1)"], correctIndex: 0 },
      ],
    },
  },
  "quadratic-equations": {
    title: "Quadratic Equations",
    description: "Solve and graph quadratic functions using various methods.",
    difficulty: "Intermediate",
    time: "15 questions • 25 min",
    topic: "Algebra",
    questionsByDifficulty: {
      easy: [
        { prompt: "What is the standard form of a quadratic equation?", options: ["ax² + bx + c = 0", "y = mx + b", "a + b = c", "x = a²"], correctIndex: 0 },
        { prompt: "The graph of a quadratic function is called a:", options: ["Parabola", "Line", "Circle", "Hyperbola"], correctIndex: 0 },
        { prompt: "In y = x² + 3, which way does the parabola open?", options: ["Up", "Down", "Left", "Right"], correctIndex: 0 },
        { prompt: "Solve: x² = 16", options: ["x = ±4", "x = 4", "x = 8", "x = 256"], correctIndex: 0 },
        { prompt: "What is the vertex of y = x²?", options: ["(0, 0)", "(1, 1)", "(0, 1)", "(1, 0)"], correctIndex: 0 },
      ],
      medium: [
        { prompt: "Solve: x² - 5x + 6 = 0", options: ["x = 2, 3", "x = -2, -3", "x = 1, 6", "x = -1, -6"], correctIndex: 0 },
        { prompt: "What is the discriminant of x² + 4x + 4 = 0?", options: ["0", "8", "16", "-8"], correctIndex: 0 },
        { prompt: "Factor: x² - 9", options: ["(x+3)(x-3)", "(x+9)(x-9)", "(x-3)²", "(x+3)²"], correctIndex: 0 },
        { prompt: "Find the vertex of y = (x - 2)² + 3:", options: ["(2, 3)", "(-2, 3)", "(2, -3)", "(-2, -3)"], correctIndex: 0 },
        { prompt: "If the discriminant is negative, how many real solutions?", options: ["0", "1", "2", "infinite"], correctIndex: 0 },
      ],
      hard: [
        { prompt: "Use the quadratic formula for 2x² - 7x + 3 = 0:", options: ["x = 3 or 1/2", "x = 3 or 2", "x = 7 or 3", "x = -3 or -1/2"], correctIndex: 0 },
        { prompt: "Find the axis of symmetry for y = 2x² - 8x + 5:", options: ["x = 2", "x = 4", "x = -2", "x = 8"], correctIndex: 0 },
        { prompt: "What are the roots of x² + 2x - 15 = 0?", options: ["x = 3, -5", "x = -3, 5", "x = 15, -1", "x = 5, 3"], correctIndex: 0 },
        { prompt: "Complete the square: x² + 6x + ___ = (x + 3)²", options: ["9", "6", "3", "36"], correctIndex: 0 },
        { prompt: "Find the y-intercept of y = 3x² - 2x + 7:", options: ["7", "-2", "3", "0"], correctIndex: 0 },
      ],
    },
  },
  "circles-area": {
    title: "Circles & Area",
    description: "Calculate area, circumference, and properties of circles.",
    difficulty: "Beginner",
    time: "10 questions • 15 min",
    topic: "Geometry",
    questionsByDifficulty: {
      easy: [
        { prompt: "What is the formula for the area of a circle?", options: ["πr²", "2πr", "πd", "r²"], correctIndex: 0 },
        { prompt: "What is the formula for circumference?", options: ["2πr", "πr²", "πr", "2r"], correctIndex: 0 },
        { prompt: "If a circle has radius 5, what is its diameter?", options: ["10", "5", "25", "2.5"], correctIndex: 0 },
        { prompt: "What is π approximately equal to?", options: ["3.14", "2.14", "4.14", "3.41"], correctIndex: 0 },
        { prompt: "A line from center to edge is called the:", options: ["Radius", "Diameter", "Chord", "Tangent"], correctIndex: 0 },
      ],
      medium: [
        { prompt: "Find the area of a circle with radius 4:", options: ["16π", "8π", "4π", "64π"], correctIndex: 0 },
        { prompt: "Find the circumference of a circle with diameter 10:", options: ["10π", "5π", "20π", "100π"], correctIndex: 0 },
        { prompt: "If the area is 36π, what is the radius?", options: ["6", "36", "18", "12"], correctIndex: 0 },
        { prompt: "A semicircle has what fraction of a circle's area?", options: ["1/2", "1/4", "1/3", "2/3"], correctIndex: 0 },
        { prompt: "Find the circumference if radius = 7 (use π = 22/7):", options: ["44", "22", "154", "49"], correctIndex: 0 },
      ],
      hard: [
        { prompt: "Find the area of a ring with outer radius 5 and inner radius 3:", options: ["16π", "25π", "9π", "8π"], correctIndex: 0 },
        { prompt: "A sector has central angle 90° and radius 8. Find its area:", options: ["16π", "64π", "8π", "32π"], correctIndex: 0 },
        { prompt: "If circumference = 12π, what is the area?", options: ["36π", "12π", "144π", "6π"], correctIndex: 0 },
        { prompt: "Find the arc length for a 60° sector with radius 6:", options: ["2π", "π", "6π", "3π"], correctIndex: 0 },
        { prompt: "Two circles have radii in ratio 2:3. What is the ratio of their areas?", options: ["4:9", "2:3", "8:27", "6:9"], correctIndex: 0 },
      ],
    },
  },
  "sequences-series": {
    title: "Sequences & Series",
    description: "Work with arithmetic and geometric sequences and their sums.",
    difficulty: "Advanced",
    time: "15 questions • 25 min",
    topic: "Algebra",
    questionsByDifficulty: {
      easy: [
        { prompt: "What is the next term in 2, 4, 6, 8, ___?", options: ["10", "12", "9", "16"], correctIndex: 0 },
        { prompt: "What is the next term in 3, 6, 12, 24, ___?", options: ["48", "36", "30", "27"], correctIndex: 0 },
        { prompt: "In an arithmetic sequence, the common difference is:", options: ["Added each time", "Multiplied each time", "Subtracted randomly", "Divided each time"], correctIndex: 0 },
        { prompt: "What type of sequence is 5, 10, 15, 20?", options: ["Arithmetic", "Geometric", "Neither", "Fibonacci"], correctIndex: 0 },
        { prompt: "What is the common ratio in 2, 6, 18, 54?", options: ["3", "4", "2", "6"], correctIndex: 0 },
      ],
      medium: [
        { prompt: "Find the 10th term of 3, 7, 11, 15, ... (arithmetic):", options: ["39", "43", "35", "40"], correctIndex: 0 },
        { prompt: "Find the 5th term of 2, 6, 18, 54, ... (geometric):", options: ["162", "108", "324", "81"], correctIndex: 0 },
        { prompt: "What is the sum of the first 5 terms of 1, 2, 3, 4, 5?", options: ["15", "10", "20", "25"], correctIndex: 0 },
        { prompt: "Find the common difference: 7, 3, -1, -5", options: ["-4", "4", "-3", "3"], correctIndex: 0 },
        { prompt: "If a₁ = 5 and d = 3, find a₄:", options: ["14", "17", "11", "20"], correctIndex: 0 },
      ],
      hard: [
        { prompt: "Find the sum of the first 10 terms of 2 + 4 + 6 + 8 + ...:", options: ["110", "100", "90", "120"], correctIndex: 0 },
        { prompt: "Find the sum of geometric series: 1 + 2 + 4 + 8 + ... (6 terms):", options: ["63", "64", "31", "32"], correctIndex: 0 },
        { prompt: "In an arithmetic sequence, a₁ = 3 and a₁₀ = 30. Find d:", options: ["3", "27", "2.7", "30"], correctIndex: 0 },
        { prompt: "Find the infinite sum of 1 + 1/2 + 1/4 + 1/8 + ...:", options: ["2", "1", "∞", "1.5"], correctIndex: 0 },
        { prompt: "If Sₙ = n² + n, find the 5th term:", options: ["10", "30", "25", "9"], correctIndex: 0 },
      ],
    },
  },
  "statistics-basics": {
    title: "Statistics Basics",
    description: "Calculate mean, median, mode, and standard deviation.",
    difficulty: "Intermediate",
    time: "15 questions • 20 min",
    topic: "Statistics",
    questionsByDifficulty: {
      easy: [
        { prompt: "What is the mean of 2, 4, 6?", options: ["4", "6", "2", "12"], correctIndex: 0 },
        { prompt: "What is the median of 1, 3, 5, 7, 9?", options: ["5", "3", "7", "25"], correctIndex: 0 },
        { prompt: "What is the mode of 1, 2, 2, 3, 4?", options: ["2", "1", "3", "4"], correctIndex: 0 },
        { prompt: "What is the range of 5, 10, 15, 20?", options: ["15", "10", "20", "5"], correctIndex: 0 },
        { prompt: "The most frequently occurring value is the:", options: ["Mode", "Mean", "Median", "Range"], correctIndex: 0 },
      ],
      medium: [
        { prompt: "Find the median of 3, 7, 8, 12, 14, 21:", options: ["10", "8", "12", "11"], correctIndex: 0 },
        { prompt: "Find the mean of 10, 20, 30, 40, 50:", options: ["30", "25", "35", "50"], correctIndex: 0 },
        { prompt: "What is the mode of 4, 4, 5, 5, 5, 6?", options: ["5", "4", "6", "4.5"], correctIndex: 0 },
        { prompt: "If the mean of 5 numbers is 8, what is their sum?", options: ["40", "8", "13", "3"], correctIndex: 0 },
        { prompt: "Find the median of 2, 8, 4, 6:", options: ["5", "4", "6", "20"], correctIndex: 0 },
      ],
      hard: [
        { prompt: "Find the standard deviation of 2, 4, 4, 4, 5, 5, 7, 9:", options: ["2", "4", "5", "3"], correctIndex: 0 },
        { prompt: "The variance is 16. What is the standard deviation?", options: ["4", "8", "16", "256"], correctIndex: 0 },
        { prompt: "In a normal distribution, about ___% of data is within 1 standard deviation:", options: ["68%", "95%", "99%", "50%"], correctIndex: 0 },
        { prompt: "Calculate the interquartile range of 1, 2, 3, 4, 5, 6, 7, 8:", options: ["4", "3", "5", "2"], correctIndex: 0 },
        { prompt: "If adding 10 to each value, how does the mean change?", options: ["Increases by 10", "Stays same", "Doubles", "Increases by 5"], correctIndex: 0 },
      ],
    },
  },
  "polynomial-operations": {
    title: "Polynomial Operations",
    description: "Add, subtract, multiply, and factor polynomial expressions.",
    difficulty: "Intermediate",
    time: "12 questions • 20 min",
    topic: "Algebra",
    questionsByDifficulty: {
      easy: [
        { prompt: "Simplify: (3x + 2) + (5x - 1)", options: ["8x + 1", "8x + 3", "2x + 3", "8x - 1"], correctIndex: 0 },
        { prompt: "What is the degree of 4x³ + 2x - 7?", options: ["3", "4", "2", "7"], correctIndex: 0 },
        { prompt: "Simplify: 5x² + 3x²", options: ["8x²", "8x⁴", "15x²", "2x²"], correctIndex: 0 },
        { prompt: "How many terms in 2x³ - x + 5?", options: ["3", "2", "4", "5"], correctIndex: 0 },
        { prompt: "What is the coefficient of x in 7x² - 3x + 1?", options: ["-3", "7", "1", "3"], correctIndex: 0 },
      ],
      medium: [
        { prompt: "Expand: (x + 3)(x + 2)", options: ["x² + 5x + 6", "x² + 6x + 5", "x² + 5x + 5", "2x + 5"], correctIndex: 0 },
        { prompt: "Simplify: (4x² - 3x) - (2x² + x)", options: ["2x² - 4x", "2x² - 2x", "6x² - 4x", "2x² + 4x"], correctIndex: 0 },
        { prompt: "Factor: x² + 7x + 12", options: ["(x + 3)(x + 4)", "(x + 2)(x + 6)", "(x + 1)(x + 12)", "(x - 3)(x - 4)"], correctIndex: 0 },
        { prompt: "Multiply: 2x(3x² - 4x + 1)", options: ["6x³ - 8x² + 2x", "6x³ - 4x + 1", "5x³ - 4x² + 2x", "6x² - 8x + 2"], correctIndex: 0 },
        { prompt: "Factor: x² - 16", options: ["(x + 4)(x - 4)", "(x - 4)²", "(x + 4)²", "(x - 8)(x + 2)"], correctIndex: 0 },
      ],
      hard: [
        { prompt: "Expand: (2x - 3)²", options: ["4x² - 12x + 9", "4x² - 9", "4x² + 12x + 9", "2x² - 6x + 9"], correctIndex: 0 },
        { prompt: "Factor: 2x² + 5x - 3", options: ["(2x - 1)(x + 3)", "(2x + 1)(x - 3)", "(x - 1)(2x + 3)", "(x + 1)(2x - 3)"], correctIndex: 0 },
        { prompt: "Divide: (x² + 3x - 10) ÷ (x - 2)", options: ["x + 5", "x - 5", "x + 2", "x - 2"], correctIndex: 0 },
        { prompt: "Factor completely: x³ - 8", options: ["(x - 2)(x² + 2x + 4)", "(x - 2)³", "(x - 2)(x + 2)²", "(x - 8)(x² + 1)"], correctIndex: 0 },
        { prompt: "Simplify: (x³ - x) / x", options: ["x² - 1", "x² - x", "x - 1", "x³ - 1"], correctIndex: 0 },
      ],
    },
  },
  "number-systems": {
    title: "Number Systems",
    description: "Explore integers, rationals, irrationals, and real numbers.",
    difficulty: "Beginner",
    time: "10 questions • 15 min",
    topic: "Number Theory",
    questionsByDifficulty: {
      easy: [
        { prompt: "Which is a natural number?", options: ["5", "-3", "0.5", "√2"], correctIndex: 0 },
        { prompt: "Is -7 an integer?", options: ["Yes", "No", "Sometimes", "Only if positive"], correctIndex: 0 },
        { prompt: "Which is a rational number?", options: ["3/4", "√2", "π", "e"], correctIndex: 0 },
        { prompt: "What is |−5|?", options: ["5", "-5", "0", "±5"], correctIndex: 0 },
        { prompt: "Which set includes all positive and negative whole numbers?", options: ["Integers", "Natural numbers", "Whole numbers", "Rationals"], correctIndex: 0 },
      ],
      medium: [
        { prompt: "Which is an irrational number?", options: ["√2", "0.5", "3/7", "-4"], correctIndex: 0 },
        { prompt: "Is 0 a whole number?", options: ["Yes", "No", "Sometimes", "Only in some systems"], correctIndex: 0 },
        { prompt: "Classify: 0.333... (repeating)", options: ["Rational", "Irrational", "Integer", "Natural"], correctIndex: 0 },
        { prompt: "Which is NOT a real number?", options: ["√-1", "√2", "π", "-100"], correctIndex: 0 },
        { prompt: "Express 0.25 as a fraction:", options: ["1/4", "1/5", "2/5", "25/10"], correctIndex: 0 },
      ],
      hard: [
        { prompt: "Is π rational or irrational?", options: ["Irrational", "Rational", "Integer", "Complex"], correctIndex: 0 },
        { prompt: "Which statement is true?", options: ["All integers are rational", "All rationals are integers", "All irrationals are rational", "All naturals are negative"], correctIndex: 0 },
        { prompt: "Simplify: √50", options: ["5√2", "25√2", "10√5", "√50"], correctIndex: 0 },
        { prompt: "What is the sum of √8 + √2?", options: ["3√2", "√10", "4√2", "√16"], correctIndex: 0 },
        { prompt: "Rationalize: 1/√3", options: ["√3/3", "3/√3", "1/3", "√3"], correctIndex: 0 },
      ],
    },
  },
};

function QuizPageContent() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;
  const difficulty = (searchParams.get("difficulty") || "medium") as keyof DifficultyQuestions;
  
  const quiz = useMemo(() => (slug ? quizzesBySlug[slug] : undefined), [slug]);
  const questions = useMemo(() => {
    if (!quiz) return [];
    return quiz.questionsByDifficulty[difficulty] || quiz.questionsByDifficulty.medium;
  }, [quiz, difficulty]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const difficultyLabels: Record<string, { label: string; color: string }> = {
    easy: { label: "Easy", color: "text-green-500" },
    medium: { label: "Medium", color: "text-yellow-500" },
    hard: { label: "Hard", color: "text-red-500" },
  };

  if (!quiz || questions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20 md:pt-24">
        <main className="max-w-3xl mx-auto px-6 py-12">
          <Card className="p-8 text-center">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Quiz not found</h1>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              The quiz you are looking for does not exist yet.
            </p>
            <Button onClick={() => router.push("/resources#quizzes")} type="button">
              Back to Resources
            </Button>
          </Card>
        </main>
      </div>
    );
  }

  const question = questions[currentIndex];
  const totalQuestions = questions.length;
  const isLastQuestion = currentIndex === totalQuestions - 1;
  const progress = Math.round(((currentIndex + (showResults ? 1 : 0)) / totalQuestions) * 100);

  const handleSubmit = () => {
    if (selectedIndex === null || answered) return;
    if (selectedIndex === question.correctIndex) {
      setScore((prev) => prev + 1);
    }
    setAnswered(true);
  };

  const handleNext = () => {
    if (isLastQuestion) {
      setShowResults(true);
      return;
    }
    setCurrentIndex((prev) => prev + 1);
    setSelectedIndex(null);
    setAnswered(false);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedIndex(null);
    setScore(0);
    setAnswered(false);
    setShowResults(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20 md:pt-24">
      <main className="max-w-4xl mx-auto px-6 py-12 pb-24">
        <div className="flex flex-col gap-4 mb-8">
          <SectionLabel>{`${quiz.topic} Quiz`}</SectionLabel>
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{quiz.title}</h1>
            <p className="text-slate-500 dark:text-slate-400">{quiz.description}</p>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
              <span className={`px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-medium ${difficultyLabels[difficulty]?.color || ''}`}>
                {difficultyLabels[difficulty]?.label || 'Medium'} Mode
              </span>
              <span>{quiz.time}</span>
              <span>{totalQuestions} questions</span>
            </div>
          </div>
        </div>

        <Card className="p-6 md:p-8">
          {showResults ? (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Quiz complete</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                You scored {score} out of {totalQuestions}.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={handleRestart} type="button">
                  Restart Quiz
                </Button>
                <Button variant="outline" onClick={() => router.push("/resources#quizzes")} type="button">
                  Back to Resources
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mb-4">
                <span>
                  Question {currentIndex + 1} of {totalQuestions}
                </span>
                <span>{progress}% complete</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-900 mb-6">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${progress}%`,
                    background: "linear-gradient(135deg, var(--theme-primary), var(--theme-primary-light))",
                  }}
                />
              </div>

              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-5">{question.prompt}</h2>
              <div className="grid grid-cols-1 gap-3">
                {question.options.map((option, index) => {
                  const isSelected = selectedIndex === index;
                  const isCorrect = answered && index === question.correctIndex;
                  const isIncorrect = answered && isSelected && index !== question.correctIndex;

                  return (
                    <button
                      key={`${question.prompt}-${option}`}
                      type="button"
                      onClick={() => setSelectedIndex(index)}
                      className={[
                        "w-full text-left px-4 py-3 rounded-xl border-2 transition-all",
                        // Default state
                        !isSelected && !answered ? "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500" : "",
                        // Selected but not yet answered
                        isSelected && !answered ? "bg-[var(--theme-primary)]/15 dark:bg-[var(--theme-primary)]/25 border-[var(--theme-primary)] shadow-md ring-2 ring-[var(--theme-primary)]/30" : "",
                        // Correct answer revealed
                        answered && isCorrect ? "bg-emerald-100 dark:bg-emerald-900/50 border-emerald-500" : "",
                        // Wrong answer selected
                        answered && isIncorrect ? "bg-rose-100 dark:bg-rose-900/50 border-rose-500" : "",
                        // Other options after answering (neither selected nor correct)
                        answered && !isCorrect && !isIncorrect ? "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 opacity-60" : "",
                      ].filter(Boolean).join(" ")}
                      disabled={answered}
                    >
                      <div className="flex items-center gap-3">
                        <span className={[
                          "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 border-2 transition-all",
                          !isSelected && !answered ? "border-slate-300 dark:border-slate-600 text-slate-400 dark:text-slate-500" : "",
                          isSelected && !answered ? "border-[var(--theme-primary)] bg-[var(--theme-primary)] text-white" : "",
                          answered && isCorrect ? "border-emerald-500 bg-emerald-500 text-white" : "",
                          answered && isIncorrect ? "border-rose-500 bg-rose-500 text-white" : "",
                          answered && !isCorrect && !isIncorrect ? "border-slate-300 dark:border-slate-600 text-slate-400" : "",
                        ].filter(Boolean).join(" ")}>
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span className={[
                          "font-medium",
                          !answered ? "text-slate-700 dark:text-slate-200" : "",
                          answered && isCorrect ? "text-emerald-700 dark:text-emerald-300" : "",
                          answered && isIncorrect ? "text-rose-700 dark:text-rose-300" : "",
                          answered && !isCorrect && !isIncorrect ? "text-slate-500 dark:text-slate-400" : "",
                        ].filter(Boolean).join(" ")}>{option}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <Button onClick={handleSubmit} type="button" disabled={selectedIndex === null || answered}>
                  Check Answer
                </Button>
                <Button
                  variant="outline"
                  onClick={handleNext}
                  type="button"
                  disabled={!answered}
                >
                  {isLastQuestion ? "Finish Quiz" : "Next Question"}
                </Button>
                <Link
                  href="/resources#quizzes"
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-[var(--theme-primary)] hover:text-[var(--theme-primary)] transition-colors"
                >
                  Exit Quiz
                </Link>
              </div>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-slate-950" />}>
      <QuizPageContent />
    </Suspense>
  );
}
