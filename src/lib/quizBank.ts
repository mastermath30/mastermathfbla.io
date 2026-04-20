import { topicByQuizSlug } from "@/data/courses";

export type QuizQuestion = {
  prompt: string;
  options: string[];
  correctIndex: number;
};

export type DifficultyQuestions = {
  easy: QuizQuestion[];
  medium: QuizQuestion[];
  hard: QuizQuestion[];
};

export type QuizData = {
  title: string;
  description: string;
  difficulty: string;
  time: string;
  topic: string;
  questionsByDifficulty: DifficultyQuestions;
};

type TopicQuizTopic = (typeof topicByQuizSlug)[string];

type QuestionDraft = {
  prompt: string;
  correctAnswer: string;
  distractors: string[];
};

type BankByDifficulty = Record<keyof DifficultyQuestions, Array<(rng: () => number) => QuestionDraft>>;

type TopicFamily =
  | "arithmetic-number"
  | "fractions-percents"
  | "expressions-equations"
  | "linear-functions"
  | "quadratics-polynomials"
  | "geometry-core"
  | "circles-measurement"
  | "statistics-probability"
  | "trigonometry"
  | "calculus-derivatives"
  | "calculus-integrals"
  | "advanced-functions";

type DifficultyLevel = keyof DifficultyQuestions;

function randomInt(rng: () => number, min: number, max: number) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function pickOne<T>(rng: () => number, items: T[]): T {
  return items[randomInt(rng, 0, items.length - 1)];
}

function shuffle<T>(rng: () => number, items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function uniqueOptions(correctAnswer: string, distractors: string[]) {
  return Array.from(new Set([correctAnswer, ...distractors])).slice(0, 4);
}

function finalizeQuestion(rng: () => number, draft: QuestionDraft): QuizQuestion {
  const options = uniqueOptions(draft.correctAnswer, draft.distractors);
  const shuffled = shuffle(rng, options);
  return {
    prompt: draft.prompt,
    options: shuffled,
    correctIndex: shuffled.indexOf(draft.correctAnswer),
  };
}

function hashString(value: string) {
  let hash = 1779033703 ^ value.length;
  for (let i = 0; i < value.length; i += 1) {
    hash = Math.imul(hash ^ value.charCodeAt(i), 3432918353);
    hash = (hash << 13) | (hash >>> 19);
  }
  return () => {
    hash = Math.imul(hash ^ (hash >>> 16), 2246822507);
    hash = Math.imul(hash ^ (hash >>> 13), 3266489909);
    return (hash ^= hash >>> 16) >>> 0;
  };
}

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function createRng(seedText: string) {
  return mulberry32(hashString(seedText)());
}

function familyLabel(topic: TopicQuizTopic, family: TopicFamily) {
  switch (family) {
    case "arithmetic-number":
      return "number sense and arithmetic fluency";
    case "fractions-percents":
      return "fractions, decimals, percents, and proportional reasoning";
    case "expressions-equations":
      return "variables, expressions, equations, and inequalities";
    case "linear-functions":
      return "linear relationships, coordinates, and function reasoning";
    case "quadratics-polynomials":
      return "quadratics, polynomials, radicals, and algebraic structure";
    case "geometry-core":
      return "geometry relationships, reasoning, and measurement";
    case "circles-measurement":
      return "circles, area, circumference, and measurement";
    case "statistics-probability":
      return "data, statistics, and probability";
    case "trigonometry":
      return "trigonometric ratios, angles, and periodic behavior";
    case "calculus-derivatives":
      return "limits, derivatives, and rate-of-change reasoning";
    case "calculus-integrals":
      return "integrals, accumulation, and advanced calculus applications";
    case "advanced-functions":
      return "advanced functions, models, and pre-calculus reasoning";
    default:
      return topic.title.toLowerCase();
  }
}

function resolveTopicFamily(topic: TopicQuizTopic): TopicFamily {
  const haystack = `${topic.title} ${topic.summary} ${topic.courseTitle}`.toLowerCase();
  if (/(fraction|decimal|percent|ratio|rate|proportion)/.test(haystack)) return "fractions-percents";
  if (/(expression|variable|equation|inequalit|literal)/.test(haystack)) return "expressions-equations";
  if (/(linear|slope|intercept|coordinate|domain|range|scatter|system)/.test(haystack)) return "linear-functions";
  if (/(quadratic|polynomial|factoring|factor|radical|sequence|series|logarithm|complex|matrix)/.test(haystack)) return "quadratics-polynomials";
  if (/(circle|circumference|sector|arc|radius|diameter)/.test(haystack)) return "circles-measurement";
  if (/(proof|angle|triangle|transformation|congruence|similarity|polygon|volume|surface area|geometry)/.test(haystack)) return "geometry-core";
  if (/(statistic|data|distribution|regression|sampling|probability|random variable|confidence|inference)/.test(haystack)) return "statistics-probability";
  if (/(trig|sine|cosine|tangent|radian|unit circle|periodic|law of sines|law of cosines)/.test(haystack)) return "trigonometry";
  if (/(derivative|limit|continuity|l'hopital|motion analysis)/.test(haystack)) return "calculus-derivatives";
  if (/(integral|series|parametric calculus|polar calculus|differential equation|area between curves|volume by integration)/.test(haystack)) return "calculus-integrals";
  if (/(vector|parametric|polar|conic|function notation|inverse|composition|exponential|logarithmic|precalculus|modeling)/.test(haystack)) return "advanced-functions";
  return topic.courseTitle.toLowerCase().includes("pre-algebra") ? "arithmetic-number" : "advanced-functions";
}

function formatFraction(numerator: number, denominator: number) {
  return `${numerator}/${denominator}`;
}

function arithmeticBank(topic: TopicQuizTopic): BankByDifficulty {
  return {
    easy: [
      (rng) => {
        const a = randomInt(rng, 100, 900);
        const b = randomInt(rng, 10, 90);
        return {
          prompt: `Estimate ${a} + ${b} by rounding to the nearest ten.`,
          correctAnswer: `${Math.round(a / 10) * 10 + Math.round(b / 10) * 10}`,
          distractors: [`${a + b}`, `${Math.floor(a / 10) * 10 + Math.floor(b / 10) * 10}`, `${Math.ceil(a / 10) * 10 + Math.floor(b / 10) * 10}`],
        };
      },
      (rng) => {
        const value = randomInt(rng, 20, 200);
        const delta = randomInt(rng, 2, 15);
        return {
          prompt: `What is ${value} - ${delta}?`,
          correctAnswer: `${value - delta}`,
          distractors: [`${value + delta}`, `${delta - value}`, `${value - delta - 1}`],
        };
      },
      (rng) => {
        const value = randomInt(rng, 2, 9);
        return {
          prompt: `Which value is an integer?`,
          correctAnswer: `${-value}`,
          distractors: [`${formatFraction(value, 2)}`, `√${value}`, `${value}.5`],
        };
      },
      (rng) => {
        const left = randomInt(rng, 2, 12);
        const right = randomInt(rng, 2, 12);
        return {
          prompt: `Evaluate ${left} × ${right}.`,
          correctAnswer: `${left * right}`,
          distractors: [`${left + right}`, `${left * right + left}`, `${left * right - right}`],
        };
      },
      () => ({
        prompt: `For ${topic.title.toLowerCase()}, which habit matters most when working accurately?`,
        correctAnswer: "Track the operation in the correct order",
        distractors: ["Always multiply first", "Ignore negative signs", "Estimate only after solving"],
      }),
    ],
    medium: [
      (rng) => {
        const a = randomInt(rng, -12, 12);
        const b = randomInt(rng, -12, 12);
        return {
          prompt: `Evaluate ${a} + ${b}.`,
          correctAnswer: `${a + b}`,
          distractors: [`${a - b}`, `${Math.abs(a) + Math.abs(b)}`, `${b - a}`],
        };
      },
      (rng) => {
        const a = randomInt(rng, 2, 15);
        const b = randomInt(rng, 2, 9);
        const c = randomInt(rng, 2, 9);
        return {
          prompt: `Use order of operations: ${a} + ${b} × ${c}`,
          correctAnswer: `${a + b * c}`,
          distractors: [`${(a + b) * c}`, `${a * b + c}`, `${a + b + c}`],
        };
      },
      (rng) => {
        const n = randomInt(rng, 12, 90);
        return {
          prompt: `Which pair best describes ${n}?`,
          correctAnswer: "Whole number and integer",
          distractors: ["Irrational and integer", "Whole number and irrational", "Natural number and irrational"],
        };
      },
      (rng) => {
        const a = randomInt(rng, 2, 20);
        const b = randomInt(rng, 2, 20);
        return {
          prompt: `Which comparison is true?`,
          correctAnswer: `${Math.max(a, b)} > ${Math.min(a, b)}`,
          distractors: [`${Math.max(a, b)} < ${Math.min(a, b)}`, `${a} = ${b}`, `${Math.min(a, b)} > ${Math.max(a, b) + 1}`],
        };
      },
      () => ({
        prompt: `A strong ${topic.title.toLowerCase()} check should confirm that:`,
        correctAnswer: "The answer is reasonable before and after calculating",
        distractors: ["Every estimate is exact", "Signs do not affect the result", "The largest number must be the answer"],
      }),
    ],
    hard: [
      (rng) => {
        const a = randomInt(rng, -8, 8);
        const b = randomInt(rng, -8, 8);
        const c = randomInt(rng, -8, 8);
        return {
          prompt: `Evaluate ${a} - (${b}) + ${c}.`,
          correctAnswer: `${a - b + c}`,
          distractors: [`${a + b + c}`, `${a - b - c}`, `${a + b - c}`],
        };
      },
      (rng) => {
        const n = randomInt(rng, 20, 80);
        const estimate = Math.round(n / 5) * 5;
        return {
          prompt: `Which estimate is closest to ${n} ÷ 5?`,
          correctAnswer: `${estimate / 5}`,
          distractors: [`${Math.floor(n / 5)}`, `${Math.ceil(n / 4)}`, `${Math.round(n / 10)}`],
        };
      },
      (rng) => {
        const a = randomInt(rng, 2, 9);
        const b = randomInt(rng, 2, 9);
        return {
          prompt: `A student solved ${a} - (-${b}) as ${a - b}. What is the correct result?`,
          correctAnswer: `${a + b}`,
          distractors: [`${a - b}`, `${-(a + b)}`, `${b - a}`],
        };
      },
      (rng) => {
        const a = randomInt(rng, 100, 500);
        const b = randomInt(rng, 20, 70);
        return {
          prompt: `Round ${a + b} to the nearest hundred.`,
          correctAnswer: `${Math.round((a + b) / 100) * 100}`,
          distractors: [`${Math.floor((a + b) / 100) * 100}`, `${Math.ceil((a + b) / 100) * 100 + 100}`, `${Math.round((a + b) / 10) * 10}`],
        };
      },
      () => ({
        prompt: `When reviewing ${topic.title.toLowerCase()}, what is the most common arithmetic mistake to catch?`,
        correctAnswer: "Losing the sign or operation in the middle of the work",
        distractors: ["Using too many labels", "Writing the final answer too clearly", "Checking the estimate twice"],
      }),
    ],
  };
}

function fractionPercentBank(topic: TopicQuizTopic): BankByDifficulty {
  return {
    easy: [
      (rng) => {
        const denominator = pickOne(rng, [2, 4, 5, 10]);
        const numerator = randomInt(rng, 1, denominator - 1);
        return {
          prompt: `Convert ${formatFraction(numerator, denominator)} to a percent.`,
          correctAnswer: `${(numerator / denominator) * 100}%`,
          distractors: [`${numerator + denominator}%`, `${numerator * 10}%`, `${denominator * 10}%`],
        };
      },
      (rng) => {
        const percent = pickOne(rng, [10, 20, 25, 50, 75]);
        return {
          prompt: `Write ${percent}% as a decimal.`,
          correctAnswer: `${percent / 100}`,
          distractors: [`${percent}`, `${percent / 10}`, `${percent / 1000}`],
        };
      },
      (rng) => {
        const whole = pickOne(rng, [40, 60, 80, 100]);
        const percent = pickOne(rng, [10, 20, 25, 50]);
        return {
          prompt: `What is ${percent}% of ${whole}?`,
          correctAnswer: `${(percent / 100) * whole}`,
          distractors: [`${whole - (percent / 100) * whole}`, `${percent + whole}`, `${percent / 100}`],
        };
      },
      (rng) => {
        const a = randomInt(rng, 1, 4);
        const b = randomInt(rng, 1, 4);
        return {
          prompt: `Add ${formatFraction(a, 4)} + ${formatFraction(b, 4)}.`,
          correctAnswer: formatFraction(a + b, 4),
          distractors: [formatFraction(a + b, 8), formatFraction(a * b, 4), formatFraction(Math.abs(a - b), 4)],
        };
      },
      () => ({
        prompt: `For ${topic.title.toLowerCase()}, which mistake creates the wrong percent answer most often?`,
        correctAnswer: "Moving the decimal the wrong number of places",
        distractors: ["Writing the percent sign too early", "Reducing the denominator first", "Turning the decimal into a mixed number"],
      }),
    ],
    medium: [
      (rng) => {
        const numerator = pickOne(rng, [1, 2, 3, 4]);
        const denominator = pickOne(rng, [3, 5, 6, 8]);
        return {
          prompt: `Which decimal is equivalent to ${formatFraction(numerator, denominator)}?`,
          correctAnswer: `${(numerator / denominator).toFixed(3).replace(/0+$/, "").replace(/\.$/, "")}`,
          distractors: [`${(denominator / numerator).toFixed(2)}`, `${((numerator + 1) / denominator).toFixed(2)}`, `${(numerator / (denominator + 1)).toFixed(2)}`],
        };
      },
      (rng) => {
        const original = pickOne(rng, [50, 80, 120, 200]);
        const percent = pickOne(rng, [15, 20, 25, 30]);
        return {
          prompt: `A value of ${original} increases by ${percent}%. What is the new value?`,
          correctAnswer: `${original + (original * percent) / 100}`,
          distractors: [`${original + percent}`, `${(original * percent) / 100}`, `${original - (original * percent) / 100}`],
        };
      },
      (rng) => {
        const cups = pickOne(rng, [2, 3, 4, 5]);
        const hours = pickOne(rng, [1, 2, 3]);
        return {
          prompt: `A car travels ${cups * 24} miles in ${hours} hours. What is the unit rate?`,
          correctAnswer: `${(cups * 24) / hours} miles per hour`,
          distractors: [`${hours / (cups * 24)} miles per hour`, `${cups * 24 + hours} miles per hour`, `${hours * 24} miles per hour`],
        };
      },
      (rng) => {
        const a = pickOne(rng, [1, 2, 3, 4]);
        const b = pickOne(rng, [2, 3, 4, 5]);
        const c = pickOne(rng, [1, 2, 3]);
        const d = b * c;
        return {
          prompt: `Which ratio is equivalent to ${a}:${b}?`,
          correctAnswer: `${a * c}:${d}`,
          distractors: [`${a + c}:${d}`, `${a}:${d}`, `${a * c}:${b}`],
        };
      },
      () => ({
        prompt: `A solid ${topic.title.toLowerCase()} explanation should connect:`,
        correctAnswer: "The part, the whole, and the comparison being made",
        distractors: ["Only the numerator", "Only the denominator", "Only the unit label"],
      }),
    ],
    hard: [
      (rng) => {
        const percent = pickOne(rng, [10, 15, 20, 25]);
        const original = pickOne(rng, [80, 120, 160, 200]);
        const sale = original * (1 - percent / 100);
        return {
          prompt: `A jacket costs ${sale} after a ${percent}% discount. What was the original price?`,
          correctAnswer: `${original}`,
          distractors: [`${sale + percent}`, `${sale / (percent / 100)}`, `${sale - percent}`],
        };
      },
      (rng) => {
        const start = pickOne(rng, [100, 120, 150]);
        const up = pickOne(rng, [10, 20, 25]);
        const down = pickOne(rng, [10, 20]);
        const finalValue = start * (1 + up / 100) * (1 - down / 100);
        return {
          prompt: `A price goes up ${up}% and then down ${down}%. Which value matches the final price if it started at ${start}?`,
          correctAnswer: `${finalValue}`,
          distractors: [`${start}`, `${start * (1 + (up - down) / 100)}`, `${start * (1 - up / 100) * (1 - down / 100)}`],
        };
      },
      (rng) => {
        const whole = pickOne(rng, [90, 120, 150]);
        const part = pickOne(rng, [27, 30, 45]);
        return {
          prompt: `${part} is what percent of ${whole}?`,
          correctAnswer: `${(part / whole) * 100}%`,
          distractors: [`${(whole / part) * 100}%`, `${part + whole}%`, `${(part / (whole + part)) * 100}%`],
        };
      },
      (rng) => {
        const a = pickOne(rng, [2, 3, 4, 5]);
        const b = pickOne(rng, [5, 6, 8, 10]);
        return {
          prompt: `A student added ${formatFraction(a, b)} + ${formatFraction(1, b)} and wrote ${formatFraction(a + 1, b + b)}. What is the correct sum?`,
          correctAnswer: formatFraction(a + 1, b),
          distractors: [formatFraction(a + 1, b + b), formatFraction(a + b + 1, b), formatFraction(a, b + 1)],
        };
      },
      () => ({
        prompt: `On a harder ${topic.title.toLowerCase()} item, what separates a good answer from a guessed answer?`,
        correctAnswer: "Setting up the relationship before calculating",
        distractors: ["Choosing the largest number", "Reducing every fraction immediately", "Avoiding estimation"],
      }),
    ],
  };
}

function expressionsBank(topic: TopicQuizTopic): BankByDifficulty {
  return {
    easy: [
      (rng) => {
        const x = randomInt(rng, 2, 8);
        return {
          prompt: `If x = ${x}, what is 3x + 2?`,
          correctAnswer: `${3 * x + 2}`,
          distractors: [`${3 * (x + 2)}`, `${x + 5}`, `${3 * x - 2}`],
        };
      },
      (rng) => {
        const answer = randomInt(rng, 2, 12);
        return {
          prompt: `Solve: n + 5 = ${answer + 5}`,
          correctAnswer: `${answer}`,
          distractors: [`${answer + 5}`, `${answer - 5}`, `${answer + 10}`],
        };
      },
      () => ({
        prompt: `Which phrase matches x + 7?`,
        correctAnswer: "Seven more than a number",
        distractors: ["Seven less than a number", "Seven times a number", "A number divided by seven"],
      }),
      (rng) => {
        const a = randomInt(rng, 2, 7);
        const b = randomInt(rng, 1, 6);
        return {
          prompt: `Simplify: ${a}x + ${b}x`,
          correctAnswer: `${a + b}x`,
          distractors: [`${a * b}x`, `${a + b}`, `${Math.abs(a - b)}x`],
        };
      },
      () => ({
        prompt: `A careful ${topic.title.toLowerCase()} solution should always:`,
        correctAnswer: "Keep the variable and constant work separate until the end",
        distractors: ["Combine unlike terms immediately", "Move every term to the right side", "Replace the variable with 1 first"],
      }),
    ],
    medium: [
      (rng) => {
        const x = randomInt(rng, 2, 9);
        const k = randomInt(rng, 2, 5);
        return {
          prompt: `Solve: ${k}x = ${k * x}`,
          correctAnswer: `${x}`,
          distractors: [`${k * x}`, `${x + k}`, `${x - 1}`],
        };
      },
      (rng) => {
        const x = randomInt(rng, 2, 8);
        const c = randomInt(rng, 3, 10);
        return {
          prompt: `Solve: 2x + ${c} = ${2 * x + c}`,
          correctAnswer: `${x}`,
          distractors: [`${2 * x}`, `${x + c}`, `${2 * x + c}`],
        };
      },
      () => ({
        prompt: `Which inequality means “at least 6”?`,
        correctAnswer: "x ≥ 6",
        distractors: ["x ≤ 6", "x > 6", "x < 6"],
      }),
      (rng) => {
        const a = randomInt(rng, 2, 7);
        const b = randomInt(rng, 1, 6);
        return {
          prompt: `Distribute: ${a}(x + ${b})`,
          correctAnswer: `${a}x + ${a * b}`,
          distractors: [`${a}x + ${b}`, `${a + b}x`, `${a}x + ${a + b}`],
        };
      },
      () => ({
        prompt: `A common equation-solving mistake is to:`,
        correctAnswer: "Undo only one side instead of both sides",
        distractors: ["Write the variable first", "Check the final answer", "Use parentheses in the prompt"],
      }),
    ],
    hard: [
      (rng) => {
        const x = randomInt(rng, 2, 7);
        const a = randomInt(rng, 2, 5);
        const b = randomInt(rng, 2, 8);
        return {
          prompt: `Solve: ${a}(x - ${b}) = ${a * (x - b)}`,
          correctAnswer: `${x}`,
          distractors: [`${x + b}`, `${a * x}`, `${x - b}`],
        };
      },
      (rng) => {
        const c = randomInt(rng, 2, 5);
        const d = randomInt(rng, 6, 15);
        return {
          prompt: `Solve the inequality: ${c}x - ${d} > ${c}`,
          correctAnswer: `x > ${(d + c) / c}`,
          distractors: [`x > ${d - c}`, `x < ${(d + c) / c}`, `x > ${d / c}`],
        };
      },
      () => ({
        prompt: `Which expression means “three less than twice a number”?`,
        correctAnswer: "2x - 3",
        distractors: ["3 - 2x", "2(x - 3)", "x - 6"],
      }),
      (rng) => {
        const x = randomInt(rng, 2, 8);
        return {
          prompt: `If y = 4x - 1 and x = ${x}, what is y?`,
          correctAnswer: `${4 * x - 1}`,
          distractors: [`${4 * x + 1}`, `${x - 1}`, `${x + 4}`],
        };
      },
      () => ({
        prompt: `What shows mastery of ${topic.title.toLowerCase()}?`,
        correctAnswer: "Choosing the right operation before simplifying",
        distractors: ["Combining every term into one number", "Solving without checking units", "Guessing the inverse step from memory"],
      }),
    ],
  };
}

function linearBank(topic: TopicQuizTopic): BankByDifficulty {
  return {
    easy: [
      (rng) => {
        const m = randomInt(rng, -5, 5) || 2;
        const b = randomInt(rng, -6, 6);
        return {
          prompt: `In y = ${m}x ${b >= 0 ? "+" : "-"} ${Math.abs(b)}, what is the slope?`,
          correctAnswer: `${m}`,
          distractors: [`${b}`, `${m + b}`, `${Math.abs(m)}`],
        };
      },
      (rng) => {
        const b = randomInt(rng, -6, 6);
        return {
          prompt: `If a line passes through (0, ${b}), what is the y-intercept?`,
          correctAnswer: `${b}`,
          distractors: ["0", `${Math.abs(b)}`, `${b + 1}`],
        };
      },
      () => ({
        prompt: "Which point is in Quadrant II?",
        correctAnswer: "(-3, 4)",
        distractors: ["(3, 4)", "(-3, -4)", "(3, -4)"],
      }),
      (rng) => {
        const x1 = randomInt(rng, 1, 4);
        const y1 = randomInt(rng, 1, 5);
        const x2 = x1 + randomInt(rng, 1, 4);
        const y2 = y1 + randomInt(rng, 1, 6);
        return {
          prompt: `Find the slope from (${x1}, ${y1}) to (${x2}, ${y2}).`,
          correctAnswer: `${(y2 - y1) / (x2 - x1)}`,
          distractors: [`${(x2 - x1) / (y2 - y1)}`, `${y2 - y1}`, `${x2 - x1}`],
        };
      },
      () => ({
        prompt: `For ${topic.title.toLowerCase()}, what should a table, graph, and equation all show?`,
        correctAnswer: "The same relationship written in different forms",
        distractors: ["Different answers for the same pattern", "Only the y-values", "Only the intercepts"],
      }),
    ],
    medium: [
      (rng) => {
        const m = pickOne(rng, [2, 3, -2, -3, 0.5, -0.5]);
        const b = randomInt(rng, -5, 5);
        return {
          prompt: `Which equation has slope ${m} and y-intercept ${b}?`,
          correctAnswer: `y = ${m}x ${b >= 0 ? "+" : "-"} ${Math.abs(b)}`,
          distractors: [`y = ${b}x ${m >= 0 ? "+" : "-"} ${Math.abs(m)}`, `y = ${m} ${b >= 0 ? "+" : "-"} ${Math.abs(b)}x`, `x = ${m}y + ${b}`],
        };
      },
      (rng) => {
        const x1 = randomInt(rng, -2, 2);
        const y1 = randomInt(rng, -3, 3);
        const m = pickOne(rng, [2, -2, 3, -3]);
        const x2 = x1 + 1;
        const y2 = y1 + m;
        return {
          prompt: `Which statement is true about the line through (${x1}, ${y1}) and (${x2}, ${y2})?`,
          correctAnswer: `Its slope is ${m}`,
          distractors: [`Its slope is ${1 / m}`, "It is horizontal", "It has no y-intercept"],
        };
      },
      () => ({
        prompt: "Which value belongs to the domain of a function?",
        correctAnswer: "An input",
        distractors: ["Only an output", "Only the slope", "Only the graph color"],
      }),
      (rng) => {
        const x = randomInt(rng, 1, 5);
        return {
          prompt: `If f(x) = 2x + 3, what is f(${x})?`,
          correctAnswer: `${2 * x + 3}`,
          distractors: [`${2 * x}`, `${x + 3}`, `${2 * x + 1}`],
        };
      },
      () => ({
        prompt: `A good ${topic.title.toLowerCase()} interpretation should explain:`,
        correctAnswer: "What the rate and starting value mean in context",
        distractors: ["Only the graph color", "Only one ordered pair", "Only the largest x-value"],
      }),
    ],
    hard: [
      (rng) => {
        const m = pickOne(rng, [2, 3, -2, -4]);
        const b = randomInt(rng, -4, 4);
        return {
          prompt: `Which slope belongs to a line perpendicular to y = ${m}x ${b >= 0 ? "+" : "-"} ${Math.abs(b)}?`,
          correctAnswer: `${-1 / m}`,
          distractors: [`${m}`, `${1 / m}`, `${-m}`],
        };
      },
      (rng) => {
        const x1 = randomInt(rng, -2, 2);
        const y1 = randomInt(rng, -4, 4);
        const x2 = x1 + 2;
        const y2 = y1 + 6;
        return {
          prompt: `Find the midpoint between (${x1}, ${y1}) and (${x2}, ${y2}).`,
          correctAnswer: `(${(x1 + x2) / 2}, ${(y1 + y2) / 2})`,
          distractors: [`(${x2 - x1}, ${y2 - y1})`, `(${x1 + x2}, ${y1 + y2})`, `(${x1}, ${y2})`],
        };
      },
      () => ({
        prompt: "A scatter plot with a strong upward trend suggests:",
        correctAnswer: "A positive association",
        distractors: ["A negative association", "No relationship at all", "A vertical line"],
      }),
      (rng) => {
        const m = pickOne(rng, [2, -3, 4]);
        const b = randomInt(rng, -5, 5);
        const x = randomInt(rng, 1, 4);
        const y = m * x + b;
        return {
          prompt: `Which point lies on y = ${m}x ${b >= 0 ? "+" : "-"} ${Math.abs(b)}?`,
          correctAnswer: `(${x}, ${y})`,
          distractors: [`(${x}, ${m + b})`, `(${y}, ${x})`, `(${x + 1}, ${y})`],
        };
      },
      () => ({
        prompt: `What makes a harder ${topic.title.toLowerCase()} question different from a basic one?`,
        correctAnswer: "You have to interpret the relationship, not just compute one value",
        distractors: ["There are always fractions in the answer", "The graph must be a parabola", "The y-intercept is never used"],
      }),
    ],
  };
}

function quadraticBank(topic: TopicQuizTopic): BankByDifficulty {
  return {
    easy: [
      () => ({
        prompt: "The graph of a quadratic function is called a:",
        correctAnswer: "Parabola",
        distractors: ["Line", "Circle", "Histogram"],
      }),
      (rng) => {
        const root = pickOne(rng, [2, 3, 4, 5]);
        return {
          prompt: `Solve x² = ${root * root}.`,
          correctAnswer: `x = ±${root}`,
          distractors: [`x = ${root}`, `x = ${root * root}`, `x = ${root / 2}`],
        };
      },
      (rng) => {
        const a = pickOne(rng, [2, 3, 4]);
        const b = pickOne(rng, [3, 4, 5]);
        return {
          prompt: `Factor x² + ${a + b}x + ${a * b}.`,
          correctAnswer: `(x + ${a})(x + ${b})`,
          distractors: [`(x - ${a})(x - ${b})`, `(x + ${a * b})(x + 1)`, `(x + ${a})(x - ${b})`],
        };
      },
      (rng) => {
        const degree = pickOne(rng, [2, 3, 4]);
        return {
          prompt: `What is the degree of 5x^${degree} + 2x - 1?`,
          correctAnswer: `${degree}`,
          distractors: [`${degree + 1}`, "1", "5"],
        };
      },
      () => ({
        prompt: `When checking ${topic.title.toLowerCase()}, what should you look for first?`,
        correctAnswer: "Whether the structure matches the type of expression or function",
        distractors: ["Whether every coefficient is prime", "Whether every term is negative", "Whether the answer is always zero"],
      }),
    ],
    medium: [
      (rng) => {
        const p = pickOne(rng, [2, 3, 4]);
        const q = pickOne(rng, [1, 2, 5]);
        return {
          prompt: `Solve x² - ${p + q}x + ${p * q} = 0.`,
          correctAnswer: `x = ${p}, ${q}`,
          distractors: [`x = -${p}, -${q}`, `x = ${p + q}`, `x = ${p * q}`],
        };
      },
      () => ({
        prompt: "If the discriminant is negative, how many real solutions does the quadratic have?",
        correctAnswer: "0",
        distractors: ["1", "2", "Infinitely many"],
      }),
      (rng) => {
        const h = pickOne(rng, [1, 2, 3]);
        const k = pickOne(rng, [2, 4, 5]);
        return {
          prompt: `What is the vertex of y = (x - ${h})² + ${k}?`,
          correctAnswer: `(${h}, ${k})`,
          distractors: [`(${-h}, ${k})`, `(${h}, ${-k})`, `(${k}, ${h})`],
        };
      },
      (rng) => {
        const a = pickOne(rng, [2, 3]);
        const b = pickOne(rng, [1, 2, 4]);
        return {
          prompt: `Expand (x + ${a})(x + ${b}).`,
          correctAnswer: `x² + ${a + b}x + ${a * b}`,
          distractors: [`x² + ${a * b}x + ${a + b}`, `x² + ${a - b}x + ${a * b}`, `x² + ${a + b}x + ${a + b}`],
        };
      },
      () => ({
        prompt: `A stronger ${topic.title.toLowerCase()} answer shows that you can:`,
        correctAnswer: "Choose the right form before solving or graphing",
        distractors: ["Use only one method every time", "Avoid checking the roots", "Ignore the sign of the leading term"],
      }),
    ],
    hard: [
      (rng) => {
        const a = pickOne(rng, [2, 3]);
        const b = pickOne(rng, [5, 7]);
        const c = pickOne(rng, [2, 3]);
        return {
          prompt: `What is the y-intercept of y = ${a}x² - ${b}x + ${c}?`,
          correctAnswer: `${c}`,
          distractors: [`${a}`, `${b}`, "0"],
        };
      },
      (rng) => {
        const a = pickOne(rng, [2, 3]);
        const b = a * pickOne(rng, [2, 3]);
        return {
          prompt: `What is the axis of symmetry of y = ${a}x² - ${b}x + 1?`,
          correctAnswer: `x = ${b / (2 * a)}`,
          distractors: [`x = ${b / a}`, `x = ${a / b}`, `x = ${b}`],
        };
      },
      () => ({
        prompt: "When multiplying polynomials, which error is most common?",
        correctAnswer: "Forgetting one of the cross-product terms",
        distractors: ["Using too many parentheses", "Graphing before simplifying", "Writing the degree first"],
      }),
      (rng) => {
        const degree = pickOne(rng, [3, 4, 5]);
        return {
          prompt: `A polynomial of degree ${degree} can have at most how many real zeros?`,
          correctAnswer: `${degree}`,
          distractors: [`${degree - 1}`, `${degree + 1}`, "2"],
        };
      },
      () => ({
        prompt: `What shows mastery of ${topic.title.toLowerCase()} on a retake?`,
        correctAnswer: "Recognizing the structure before doing the algebra",
        distractors: ["Memorizing one factored form", "Always using the same graph", "Choosing the longest option"],
      }),
    ],
  };
}

function geometryBank(topic: TopicQuizTopic, circles = false): BankByDifficulty {
  if (circles) {
    return {
      easy: [
        () => ({ prompt: "What is the formula for the area of a circle?", correctAnswer: "πr²", distractors: ["2πr", "πd", "r²"] }),
        (rng) => {
          const r = pickOne(rng, [3, 4, 5, 6]);
          return {
            prompt: `A circle has radius ${r}. What is its diameter?`,
            correctAnswer: `${2 * r}`,
            distractors: [`${r}`, `${r * r}`, `${r + 2}`],
          };
        },
        () => ({ prompt: "A line from the center of a circle to the circle is called the:", correctAnswer: "Radius", distractors: ["Diameter", "Chord", "Tangent"] }),
        (rng) => {
          const r = pickOne(rng, [2, 3, 4]);
          return {
            prompt: `Find the circumference of a circle with radius ${r}.`,
            correctAnswer: `${2 * r}π`,
            distractors: [`${r}π`, `${r * r}π`, `${2 * r}`],
          };
        },
        () => ({ prompt: `For ${topic.title.toLowerCase()}, what gets confused most often?`, correctAnswer: "Circumference and area use different formulas", distractors: ["Radius and tangent are the same", "All circles have the same area", "Diameter is always smaller than radius"] }),
      ],
      medium: [
        (rng) => {
          const r = pickOne(rng, [3, 5, 7]);
          return {
            prompt: `Find the area of a circle with radius ${r}.`,
            correctAnswer: `${r * r}π`,
            distractors: [`${2 * r}π`, `${r}π`, `${2 * r * r}`],
          };
        },
        (rng) => {
          const d = pickOne(rng, [8, 10, 12]);
          return {
            prompt: `Find the circumference of a circle with diameter ${d}.`,
            correctAnswer: `${d}π`,
            distractors: [`${(d / 2) * d}π`, `${2 * d}π`, `${d / 2}π`],
          };
        },
        () => ({ prompt: "What fraction of a circle is a 90° sector?", correctAnswer: "1/4", distractors: ["1/2", "1/3", "1/6"] }),
        () => ({ prompt: "If a chord passes through the center, it is a:", correctAnswer: "Diameter", distractors: ["Radius", "Tangent", "Arc"] }),
        () => ({ prompt: `A stronger ${topic.title.toLowerCase()} answer should identify:`, correctAnswer: "Which measurement the problem is asking for before substituting", distractors: ["Only the value of π", "Only the radius label", "Only the largest number in the figure"] }),
      ],
      hard: [
        (rng) => {
          const r = pickOne(rng, [4, 6, 8]);
          return {
            prompt: `A 90° sector has radius ${r}. What is its area?`,
            correctAnswer: `${(r * r) / 4}π`,
            distractors: [`${r * r}π`, `${r / 4}π`, `${(r * 2) / 4}π`],
          };
        },
        (rng) => {
          const outer = pickOne(rng, [5, 6, 7]);
          const inner = outer - 2;
          return {
            prompt: `Find the area of a ring with outer radius ${outer} and inner radius ${inner}.`,
            correctAnswer: `${outer * outer - inner * inner}π`,
            distractors: [`${outer * outer + inner * inner}π`, `${(outer - inner) * (outer - inner)}π`, `${2 * (outer + inner)}π`],
          };
        },
        () => ({ prompt: "An inscribed angle that intercepts a semicircle is always:", correctAnswer: "90°", distractors: ["45°", "60°", "180°"] }),
        () => ({ prompt: "If the radius doubles, the area is multiplied by:", correctAnswer: "4", distractors: ["2", "8", "16"] }),
        () => ({ prompt: `What makes a harder ${topic.title.toLowerCase()} question harder?`, correctAnswer: "You must connect multiple circle relationships before calculating", distractors: ["It uses a different value of π", "It avoids all diagrams", "It never uses radius"] }),
      ],
    };
  }

  return {
    easy: [
      () => ({ prompt: "The sum of the angles in a triangle is:", correctAnswer: "180°", distractors: ["90°", "270°", "360°"] }),
      () => ({ prompt: "Vertical angles are always:", correctAnswer: "Congruent", distractors: ["Supplementary", "Adjacent only", "Right angles"] }),
      () => ({ prompt: "A translation, reflection, or rotation is called a:", correctAnswer: "Transformation", distractors: ["Regression", "Factor", "Derivative"] }),
      () => ({ prompt: "A right triangle has one angle measuring:", correctAnswer: "90°", distractors: ["45°", "60°", "120°"] }),
      () => ({ prompt: `For ${topic.title.toLowerCase()}, what should you look for first?`, correctAnswer: "The relationship between the geometric parts in the diagram", distractors: ["Only the longest side", "Only the units", "Only the first angle shown"] }),
    ],
    medium: [
      () => ({ prompt: "If two lines are parallel, corresponding angles are:", correctAnswer: "Congruent", distractors: ["Supplementary", "Complementary", "Always obtuse"] }),
      () => ({ prompt: "Triangles are similar when they have:", correctAnswer: "Matching angle measures", distractors: ["Equal perimeters only", "One equal side", "The same area only"] }),
      () => ({ prompt: "What does a dilation change?", correctAnswer: "Size while preserving shape", distractors: ["Orientation only", "Angle sum only", "Nothing at all"] }),
      () => ({ prompt: "The Pythagorean theorem applies to:", correctAnswer: "Right triangles", distractors: ["All triangles", "Circles only", "Parallel lines"] }),
      () => ({ prompt: `A reliable ${topic.title.toLowerCase()} explanation should connect:`, correctAnswer: "The diagram, the theorem, and the conclusion", distractors: ["Only the final measurement", "Only the longest side", "Only one labeled angle"] }),
    ],
    hard: [
      () => ({ prompt: "If two triangles have all matching angle measures, they are:", correctAnswer: "Similar", distractors: ["Congruent only", "Parallel", "Supplementary"] }),
      () => ({ prompt: "The interior angle sum of a hexagon is:", correctAnswer: "720°", distractors: ["540°", "900°", "360°"] }),
      () => ({ prompt: "Which statement is true about a reflection?", correctAnswer: "It preserves distance and orientation flips", distractors: ["It changes side lengths", "It preserves nothing", "It only works on triangles"] }),
      () => ({ prompt: "A triangle with side lengths 3, 4, and 5 is:", correctAnswer: "A right triangle", distractors: ["Equilateral", "Obtuse only", "Impossible"] }),
      () => ({ prompt: `What makes a harder ${topic.title.toLowerCase()} proof or geometry task harder?`, correctAnswer: "You must justify why each relationship is valid", distractors: ["You never use diagrams", "Every answer is a decimal", "The longest side is always enough"] }),
    ],
  };
}

function statsBank(topic: TopicQuizTopic): BankByDifficulty {
  return {
    easy: [
      () => ({ prompt: "What is the mean of 2, 4, 6?", correctAnswer: "4", distractors: ["2", "6", "12"] }),
      () => ({ prompt: "The value that appears most often is the:", correctAnswer: "Mode", distractors: ["Mean", "Median", "Range"] }),
      () => ({ prompt: "Probability values must be between:", correctAnswer: "0 and 1", distractors: ["1 and 10", "-1 and 1", "0 and 100 only"] }),
      () => ({ prompt: "What is the median of 1, 3, 5?", correctAnswer: "3", distractors: ["1", "5", "9"] }),
      () => ({ prompt: `For ${topic.title.toLowerCase()}, what should you do before calculating?`, correctAnswer: "Identify what the data or event actually represents", distractors: ["Sort only if the numbers are large", "Ignore the context", "Use the mean for every question"] }),
    ],
    medium: [
      () => ({ prompt: "A fair six-sided die has probability ___ of rolling a 2.", correctAnswer: "1/6", distractors: ["1/2", "1/3", "2/6"] }),
      () => ({ prompt: "If the mean of five values is 8, their total is:", correctAnswer: "40", distractors: ["13", "8", "5"] }),
      () => ({ prompt: "Which measure is most resistant to outliers?", correctAnswer: "Median", distractors: ["Mean", "Range", "Sum"] }),
      () => ({ prompt: "A residual tells you:", correctAnswer: "How far an observed value is from a predicted value", distractors: ["How many data points there are", "Only the y-intercept", "The median of the sample"] }),
      () => ({ prompt: `A stronger ${topic.title.toLowerCase()} answer should interpret:`, correctAnswer: "What the statistic means in context, not just the number", distractors: ["Only the largest value", "Only the units", "Only the sample size"] }),
    ],
    hard: [
      () => ({ prompt: "If P(A) = 0.4, what is P(not A)?", correctAnswer: "0.6", distractors: ["0.4", "1.4", "0.2"] }),
      () => ({ prompt: "A sampling method is biased when it:", correctAnswer: "Systematically favors some outcomes over others", distractors: ["Uses a graph", "Includes more than ten values", "Has a mean larger than the median"] }),
      () => ({ prompt: "The interquartile range measures:", correctAnswer: "The spread of the middle half of the data", distractors: ["The average", "The full range only", "The highest value"] }),
      () => ({ prompt: "If two events are independent, then P(A and B) equals:", correctAnswer: "P(A) × P(B)", distractors: ["P(A) + P(B)", "P(A) - P(B)", "1 - P(A)"], }),
      () => ({ prompt: `What makes a harder ${topic.title.toLowerCase()} question harder?`, correctAnswer: "You must choose the right model before interpreting the result", distractors: ["It always has larger numbers", "It avoids all graphs", "It never asks for probability"] }),
    ],
  };
}

function trigBank(topic: TopicQuizTopic): BankByDifficulty {
  return {
    easy: [
      () => ({ prompt: "In a right triangle, sine equals:", correctAnswer: "Opposite over hypotenuse", distractors: ["Adjacent over hypotenuse", "Opposite over adjacent", "Hypotenuse over opposite"] }),
      () => ({ prompt: "What is sin(90°)?", correctAnswer: "1", distractors: ["0", "√2/2", "undefined"] }),
      () => ({ prompt: "What is cos(0°)?", correctAnswer: "1", distractors: ["0", "-1", "undefined"] }),
      () => ({ prompt: "What is tan(45°)?", correctAnswer: "1", distractors: ["0", "√3", "undefined"] }),
      () => ({ prompt: `For ${topic.title.toLowerCase()}, what matters first?`, correctAnswer: "Choosing the correct ratio or angle relationship", distractors: ["Squaring every value", "Using cosine every time", "Ignoring the diagram"] }),
    ],
    medium: [
      () => ({ prompt: "What is sin(30°)?", correctAnswer: "1/2", distractors: ["√3/2", "1", "0"] }),
      () => ({ prompt: "Which identity is always true?", correctAnswer: "sin²θ + cos²θ = 1", distractors: ["sin θ + cos θ = 1", "tan²θ = 1", "sin θ = cos θ"] }),
      () => ({ prompt: "A full rotation in radians is:", correctAnswer: "2π", distractors: ["π", "π/2", "4π"] }),
      () => ({ prompt: "The amplitude of y = 4sin(x) is:", correctAnswer: "4", distractors: ["1", "2π", "π"] }),
      () => ({ prompt: `A strong ${topic.title.toLowerCase()} solution should explain:`, correctAnswer: "Why the chosen trig relationship fits the diagram or graph", distractors: ["Only the final decimal", "Only the unit circle quadrant", "Only the largest angle"] }),
    ],
    hard: [
      () => ({ prompt: "What is sin(2θ)?", correctAnswer: "2sin(θ)cos(θ)", distractors: ["sin²(θ) + cos²(θ)", "2sin(θ)", "sin(θ)cos(θ)"] }),
      () => ({ prompt: "What is 1 + tan²θ equal to?", correctAnswer: "sec²θ", distractors: ["csc²θ", "sin²θ", "cot²θ"] }),
      () => ({ prompt: "The period of y = sin(2x) is:", correctAnswer: "π", distractors: ["2π", "π/2", "4π"] }),
      () => ({ prompt: "Which value is equivalent to cos(2θ)?", correctAnswer: "cos²θ - sin²θ", distractors: ["2cosθ", "sin²θ + cos²θ", "1 - cosθ"] }),
      () => ({ prompt: `What makes a harder ${topic.title.toLowerCase()} item harder?`, correctAnswer: "You must connect identities, angle meaning, and function behavior", distractors: ["It always uses 45°", "It never uses radians", "The answer is always negative"] }),
    ],
  };
}

function calculusBank(topic: TopicQuizTopic, integral = false): BankByDifficulty {
  if (integral) {
    return {
      easy: [
        () => ({ prompt: "An antiderivative is most closely connected to:", correctAnswer: "Reversing differentiation", distractors: ["Finding a tangent line", "Measuring only slope", "Finding a midpoint"] }),
        () => ({ prompt: "A definite integral often represents:", correctAnswer: "Accumulated change or area", distractors: ["A slope only", "A y-intercept", "A polygon angle sum"] }),
        () => ({ prompt: "The integral of a positive function over an interval is usually:", correctAnswer: "Positive", distractors: ["Always zero", "Always negative", "Undefined"] }),
        () => ({ prompt: `For ${topic.title.toLowerCase()}, what should you identify first?`, correctAnswer: "What quantity is accumulating or being measured", distractors: ["Only the upper bound", "Only the graph color", "Only the denominator"] }),
        () => ({ prompt: "The Fundamental Theorem of Calculus connects integrals with:", correctAnswer: "Derivatives", distractors: ["Matrices", "Circle theorems", "Synthetic division"] }),
      ],
      medium: [
        () => ({ prompt: "If F'(x) = f(x), then ∫f(x)dx is:", correctAnswer: "F(x) + C", distractors: ["f'(x)", "F(x)", "1/F(x)"] }),
        () => ({ prompt: "What does the constant C in an indefinite integral represent?", correctAnswer: "A family of antiderivatives", distractors: ["The slope", "The x-intercept", "The lower bound"] }),
        () => ({ prompt: "Area between curves problems usually require you to:", correctAnswer: "Subtract one function from the other over an interval", distractors: ["Add the slopes", "Multiply the intercepts", "Ignore the interval"] }),
        () => ({ prompt: "The average value of a function on an interval comes from:", correctAnswer: "An integral divided by interval length", distractors: ["A derivative at the midpoint", "The largest y-value", "The smallest x-value"] }),
        () => ({ prompt: `A better ${topic.title.toLowerCase()} answer explains:`, correctAnswer: "Why the integral setup matches the quantity asked for", distractors: ["Only the antiderivative rule", "Only the graph scale", "Only the sign of x"] }),
      ],
      hard: [
        () => ({ prompt: "Which method is useful when an integrand is a product of a polynomial and a logarithm?", correctAnswer: "Integration by parts", distractors: ["Pythagorean theorem", "Slope formula", "Quadratic formula"] }),
        () => ({ prompt: "A washer method setup is used when the solid has:", correctAnswer: "An outer radius and an inner radius", distractors: ["Only a tangent line", "A triangle inside it", "No axis of rotation"] }),
        () => ({ prompt: "A differential equation models:", correctAnswer: "How a quantity changes relative to another quantity", distractors: ["Only fixed arithmetic", "Only triangle similarity", "Only probability outcomes"] }),
        () => ({ prompt: "A convergent infinite series approaches:", correctAnswer: "A finite value", distractors: ["A negative slope", "A repeating remainder only", "Always zero"] }),
        () => ({ prompt: `What makes a harder ${topic.title.toLowerCase()} item harder?`, correctAnswer: "You must decide which accumulation model or method applies", distractors: ["It always uses π", "It avoids functions entirely", "It never uses bounds"] }),
      ],
    };
  }

  return {
    easy: [
      () => ({ prompt: "The derivative of a constant is:", correctAnswer: "0", distractors: ["1", "The constant itself", "x"] }),
      () => ({ prompt: "The derivative tells you the:", correctAnswer: "Instantaneous rate of change", distractors: ["Total area only", "Average of all values", "Number of roots"] }),
      () => ({ prompt: "What is the derivative of x²?", correctAnswer: "2x", distractors: ["x", "x²", "2"] }),
      () => ({ prompt: `For ${topic.title.toLowerCase()}, what should you identify first?`, correctAnswer: "Whether the question is asking for a rate, slope, or limit idea", distractors: ["Only the y-intercept", "Only the units", "Only the final decimal"] }),
      () => ({ prompt: "A limit describes what happens as x gets:", correctAnswer: "Closer to a value", distractors: ["Larger than every number", "Equal to the derivative always", "Further from the graph"] }),
    ],
    medium: [
      () => ({ prompt: "What is the derivative of 5x²?", correctAnswer: "10x", distractors: ["5x", "10x²", "5"] }),
      () => ({ prompt: "What is the derivative of sin(x)?", correctAnswer: "cos(x)", distractors: ["-cos(x)", "-sin(x)", "tan(x)"] }),
      () => ({ prompt: "A function is continuous at x = a when it has no jump, hole, or:", correctAnswer: "Break there", distractors: ["Positive slope there", "Intercept there", "Derivative there"] }),
      () => ({ prompt: "The power rule says the derivative of xⁿ is:", correctAnswer: "nxⁿ⁻¹", distractors: ["xⁿ⁻¹", "n + x", "n/x"] }),
      () => ({ prompt: `A stronger ${topic.title.toLowerCase()} explanation should connect:`, correctAnswer: "The rule being used and what the derivative means", distractors: ["Only the final expression", "Only the x-values", "Only the highest power"] }),
    ],
    hard: [
      () => ({ prompt: "The product rule is used when differentiating:", correctAnswer: "A product of two functions", distractors: ["A constant only", "A sum only", "A single power only"] }),
      () => ({ prompt: "The chain rule is needed when differentiating:", correctAnswer: "A composition of functions", distractors: ["A horizontal line", "A fraction only", "A scatter plot"] }),
      () => ({ prompt: "A critical point occurs where f'(x) is zero or:", correctAnswer: "Undefined", distractors: ["Equal to the y-intercept", "Positive", "Increasing only"] }),
      () => ({ prompt: "A second derivative helps identify:", correctAnswer: "Concavity", distractors: ["Probability", "Circle area", "Common ratio"] }),
      () => ({ prompt: `What makes a harder ${topic.title.toLowerCase()} question harder?`, correctAnswer: "You must choose the correct derivative strategy and interpret the result", distractors: ["It always includes trigonometry", "It never uses functions", "The answer must be negative"] }),
    ],
  };
}

function advancedFunctionsBank(topic: TopicQuizTopic): BankByDifficulty {
  return {
    easy: [
      () => ({ prompt: "Function notation f(3) asks for:", correctAnswer: "The output when the input is 3", distractors: ["The slope at 3", "The inverse of 3", "A factor of 3"] }),
      () => ({ prompt: "An inverse function reverses:", correctAnswer: "The input-output relationship", distractors: ["The slope only", "The graph color", "The y-intercept only"] }),
      () => ({ prompt: "An exponential function models repeated:", correctAnswer: "Multiplication", distractors: ["Addition", "Subtraction", "Division by zero"] }),
      () => ({ prompt: "A sequence is:", correctAnswer: "An ordered list following a pattern", distractors: ["A circle theorem", "A derivative rule", "A random set of points"] }),
      () => ({ prompt: `For ${topic.title.toLowerCase()}, what should you identify first?`, correctAnswer: "Which function family or pattern the problem belongs to", distractors: ["Only the largest number", "Only the variable name", "Only the units"] }),
    ],
    medium: [
      () => ({ prompt: "Composing f(g(x)) means:", correctAnswer: "Use g(x) first, then apply f", distractors: ["Add f and g", "Find the derivative automatically", "Reverse both functions"] }),
      () => ({ prompt: "A logarithm answers the question:", correctAnswer: "What exponent produces the value?", distractors: ["What slope produces the value?", "What area produces the value?", "What denominator produces the value?"] }),
      () => ({ prompt: "A geometric sequence changes by a constant:", correctAnswer: "Ratio", distractors: ["Difference", "Angle", "Intercept"] }),
      () => ({ prompt: "A vector has both magnitude and:", correctAnswer: "Direction", distractors: ["Area", "Median", "Residual"] }),
      () => ({ prompt: `A better ${topic.title.toLowerCase()} answer should explain:`, correctAnswer: "Why the chosen model or function family fits the situation", distractors: ["Only the final decimal", "Only the first term", "Only the graph title"] }),
    ],
    hard: [
      () => ({ prompt: "If f and g are inverses, then f(g(x)) equals:", correctAnswer: "x", distractors: ["f(x) + g(x)", "1/x", "0"] }),
      () => ({ prompt: "A polar graph uses coordinates written as:", correctAnswer: "(r, θ)", distractors: ["(x, y)", "(m, b)", "(a, b, c)"] }),
      () => ({ prompt: "A recursive sequence defines each term using:", correctAnswer: "Previous terms", distractors: ["Only the final term", "Only the graph", "Only the variable x"] }),
      () => ({ prompt: "A parametric curve gives x and y in terms of:", correctAnswer: "A parameter", distractors: ["A fixed slope only", "The median", "The discriminant"] }),
      () => ({ prompt: `What makes a harder ${topic.title.toLowerCase()} question harder?`, correctAnswer: "You must identify the structure first and then select the right model", distractors: ["It always uses calculus", "It never uses notation", "The answer is always a fraction"] }),
    ],
  };
}

function getBank(topic: TopicQuizTopic, family: TopicFamily): BankByDifficulty {
  switch (family) {
    case "arithmetic-number":
      return arithmeticBank(topic);
    case "fractions-percents":
      return fractionPercentBank(topic);
    case "expressions-equations":
      return expressionsBank(topic);
    case "linear-functions":
      return linearBank(topic);
    case "quadratics-polynomials":
      return quadraticBank(topic);
    case "geometry-core":
      return geometryBank(topic, false);
    case "circles-measurement":
      return geometryBank(topic, true);
    case "statistics-probability":
      return statsBank(topic);
    case "trigonometry":
      return trigBank(topic);
    case "calculus-derivatives":
      return calculusBank(topic, false);
    case "calculus-integrals":
      return calculusBank(topic, true);
    case "advanced-functions":
      return advancedFunctionsBank(topic);
    default:
      return advancedFunctionsBank(topic);
  }
}

function buildDifficultyAnchorQuestion(
  topic: TopicQuizTopic,
  family: TopicFamily,
  difficulty: DifficultyLevel,
  rng: () => number
): QuestionDraft | null {
  switch (family) {
    case "arithmetic-number":
      if (difficulty === "easy") {
        const a = randomInt(rng, 20, 90);
        const b = randomInt(rng, 10, 30);
        return {
          prompt: `Basic check: what is ${a} + ${b}?`,
          correctAnswer: `${a + b}`,
          distractors: [`${a - b}`, `${a + b + 10}`, `${a + 10}`],
        };
      }
      if (difficulty === "medium") {
        const a = randomInt(rng, 3, 9);
        const b = randomInt(rng, 2, 7);
        const c = randomInt(rng, 2, 6);
        return {
          prompt: `Use the correct order of operations: ${a} + ${b}(${c})`,
          correctAnswer: `${a + b * c}`,
          distractors: [`${(a + b) * c}`, `${a * b + c}`, `${a + b + c}`],
        };
      }
      return {
        prompt: "A class earns 12 points for each correct puzzle and loses 4 points for one mistake. If the team solves 5 puzzles and makes 1 mistake, what is the total score?",
        correctAnswer: "56",
        distractors: ["64", "44", "52"],
      };
    case "fractions-percents":
      if (difficulty === "easy") {
        return {
          prompt: "Easy check: what is 25% as a decimal?",
          correctAnswer: "0.25",
          distractors: ["2.5", "0.025", "25"],
        };
      }
      if (difficulty === "medium") {
        return {
          prompt: "A notebook costs $24 and is discounted by 25%. What is the sale price?",
          correctAnswer: "$18",
          distractors: ["$6", "$19", "$30"],
        };
      }
      return {
        prompt: "A recipe uses 3/4 cup of sugar for one batch. You make 2 1/2 batches. How much sugar do you need in all?",
        correctAnswer: "1 7/8 cups",
        distractors: ["1 1/4 cups", "2 1/4 cups", "3 1/8 cups"],
      };
    case "expressions-equations":
      if (difficulty === "easy") {
        return {
          prompt: "If x = 4, what is x + 6?",
          correctAnswer: "10",
          distractors: ["24", "8", "2"],
        };
      }
      if (difficulty === "medium") {
        return {
          prompt: "Solve 3x + 4 = 19.",
          correctAnswer: "x = 5",
          distractors: ["x = 15", "x = 7", "x = 23"],
        };
      }
      return {
        prompt: "A gym charges a $12 sign-up fee plus $8 per class. If the total bill was $52, how many classes were taken?",
        correctAnswer: "5 classes",
        distractors: ["4 classes", "6 classes", "8 classes"],
      };
    case "linear-functions":
      if (difficulty === "easy") {
        return {
          prompt: "In y = 2x + 5, what does the 5 represent?",
          correctAnswer: "The y-intercept",
          distractors: ["The slope", "The x-intercept", "The domain"],
        };
      }
      if (difficulty === "medium") {
        return {
          prompt: "A line passes through (0, 3) and (2, 7). Which equation matches the line?",
          correctAnswer: "y = 2x + 3",
          distractors: ["y = x + 3", "y = 2x + 7", "y = 4x + 3"],
        };
      }
      return {
        prompt: "A taxi fare starts at $4 and increases by $2.50 per mile. Which equation models the cost y after x miles?",
        correctAnswer: "y = 2.5x + 4",
        distractors: ["y = 4x + 2.5", "y = 2.5x - 4", "y = x + 6.5"],
      };
    case "quadratics-polynomials":
      if (difficulty === "easy") {
        return {
          prompt: "Which graph shape matches a quadratic function?",
          correctAnswer: "A parabola",
          distractors: ["A straight line", "A circle", "A box plot"],
        };
      }
      if (difficulty === "medium") {
        return {
          prompt: "Factor x² + 7x + 12.",
          correctAnswer: "(x + 3)(x + 4)",
          distractors: ["(x + 2)(x + 6)", "(x - 3)(x - 4)", "(x + 1)(x + 12)"],
        };
      }
      return {
        prompt: "A rectangular garden has area x² + 9x + 20. Which pair of side lengths could represent the garden?",
        correctAnswer: "x + 4 and x + 5",
        distractors: ["x + 2 and x + 10", "x - 4 and x - 5", "x + 1 and x + 20"],
      };
    case "geometry-core":
      if (difficulty === "easy") {
        return {
          prompt: "What is the angle sum of a triangle?",
          correctAnswer: "180°",
          distractors: ["90°", "270°", "360°"],
        };
      }
      if (difficulty === "medium") {
        return {
          prompt: "Two angles on a line measure 3x and x. What is x?",
          correctAnswer: "45",
          distractors: ["30", "60", "90"],
        };
      }
      return {
        prompt: "A triangle has side lengths 5, 12, and 13. Which conclusion is justified?",
        correctAnswer: "It is a right triangle",
        distractors: ["It is equilateral", "It cannot exist", "It must be obtuse"],
      };
    case "circles-measurement":
      if (difficulty === "easy") {
        return {
          prompt: "A circle has radius 6. What is its diameter?",
          correctAnswer: "12",
          distractors: ["6", "18", "36"],
        };
      }
      if (difficulty === "medium") {
        return {
          prompt: "Find the area of a circle with radius 5.",
          correctAnswer: "25π",
          distractors: ["10π", "5π", "20π"],
        };
      }
      return {
        prompt: "A 120° sector of a circle has radius 9. What is the sector area?",
        correctAnswer: "27π",
        distractors: ["81π", "18π", "54π"],
      };
    case "statistics-probability":
      if (difficulty === "easy") {
        return {
          prompt: "What is the mean of 4, 6, and 8?",
          correctAnswer: "6",
          distractors: ["4", "8", "18"],
        };
      }
      if (difficulty === "medium") {
        return {
          prompt: "A bag has 3 red marbles and 5 blue marbles. What is the probability of drawing a red marble?",
          correctAnswer: "3/8",
          distractors: ["5/8", "3/5", "1/2"],
        };
      }
      return {
        prompt: "A survey about school lunches only asked students who eat in the cafeteria every day. What is the main issue with the data?",
        correctAnswer: "The sample is biased",
        distractors: ["The sample is too random", "The mean is missing", "The probability is negative"],
      };
    case "trigonometry":
      if (difficulty === "easy") {
        return {
          prompt: "In a right triangle, cosine equals:",
          correctAnswer: "Adjacent over hypotenuse",
          distractors: ["Opposite over hypotenuse", "Opposite over adjacent", "Hypotenuse over adjacent"],
        };
      }
      if (difficulty === "medium") {
        return {
          prompt: "If a right triangle has opposite side 6 and hypotenuse 10, what is sin(θ)?",
          correctAnswer: "3/5",
          distractors: ["5/3", "4/5", "2/5"],
        };
      }
      return {
        prompt: "A ladder is 10 ft long and reaches 8 ft up a wall. Which trig ratio could you use to find the angle between the ladder and the ground?",
        correctAnswer: "sin(θ) = 8/10",
        distractors: ["cos(θ) = 8/10", "tan(θ) = 10/8", "sin(θ) = 10/8"],
      };
    case "calculus-derivatives":
      if (difficulty === "easy") {
        return {
          prompt: "What is the derivative of x³?",
          correctAnswer: "3x²",
          distractors: ["x²", "3x", "x³"],
        };
      }
      if (difficulty === "medium") {
        return {
          prompt: "What is the derivative of 4x² - 3x + 2?",
          correctAnswer: "8x - 3",
          distractors: ["8x + 2", "4x - 3", "8x² - 3"],
        };
      }
      return {
        prompt: "A particle has position s(t) = t² + 4t. What is its velocity when t = 3?",
        correctAnswer: "10",
        distractors: ["7", "9", "13"],
      };
    case "calculus-integrals":
      if (difficulty === "easy") {
        return {
          prompt: "What is an antiderivative of 6x?",
          correctAnswer: "3x² + C",
          distractors: ["6 + C", "6x² + C", "3x + C"],
        };
      }
      if (difficulty === "medium") {
        return {
          prompt: "If F'(x) = 2x + 1, which function could be F(x)?",
          correctAnswer: "x² + x + C",
          distractors: ["2x² + 1", "x² + C", "2x + C"],
        };
      }
      return {
        prompt: "A water tank fills at a changing rate r(t). What does ∫r(t)dt over a time interval represent?",
        correctAnswer: "The total amount of water added during that interval",
        distractors: ["The slope of the rate graph only", "The average height of the tank", "The starting volume only"],
      };
    case "advanced-functions":
      if (difficulty === "easy") {
        return {
          prompt: "If f(x) = x + 2, what is f(5)?",
          correctAnswer: "7",
          distractors: ["3", "10", "5"],
        };
      }
      if (difficulty === "medium") {
        return {
          prompt: "If g(x) = 2x and f(x) = x + 1, what is f(g(3))?",
          correctAnswer: "7",
          distractors: ["6", "8", "4"],
        };
      }
      return {
        prompt: "A population doubles every 3 hours. Which type of function best models the population over time?",
        correctAnswer: "An exponential function",
        distractors: ["A linear function", "A quadratic function", "A constant function"],
      };
    default:
      return null;
  }
}

function buildQuestionsForDifficulty(
  topic: TopicQuizTopic,
  family: TopicFamily,
  difficulty: DifficultyLevel,
  seed: string
) {
  const rng = createRng(seed);
  const bank = getBank(topic, family)[difficulty];
  const anchor = buildDifficultyAnchorQuestion(topic, family, difficulty, rng);
  const selected = shuffle(rng, bank).slice(0, Math.max(0, Math.min(5, bank.length) - (anchor ? 1 : 0)));
  const generated = selected.map((factory) => finalizeQuestion(rng, factory(rng)));
  return anchor ? [finalizeQuestion(rng, anchor), ...generated] : generated;
}

export function buildTopicGeneratedQuiz(topic: TopicQuizTopic, attemptKey: string): QuizData {
  const family = resolveTopicFamily(topic);
  const questionsByDifficulty: DifficultyQuestions = {
    easy: buildQuestionsForDifficulty(topic, family, "easy", `${attemptKey}:${topic.id}:easy`),
    medium: buildQuestionsForDifficulty(topic, family, "medium", `${attemptKey}:${topic.id}:medium`),
    hard: buildQuestionsForDifficulty(topic, family, "hard", `${attemptKey}:${topic.id}:hard`),
  };

  return {
    title: `${topic.title} Quiz`,
    description: `Topic-specific practice for ${familyLabel(topic, family)}.`,
    difficulty: topic.difficulty === "beginner" ? "Beginner" : topic.difficulty === "intermediate" ? "Intermediate" : "Advanced",
    time: `${questionsByDifficulty.medium.length} questions • 12 min`,
    topic: topic.courseTitle,
    questionsByDifficulty,
  };
}
