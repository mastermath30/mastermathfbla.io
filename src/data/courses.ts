export type ResourceItem = {
  title: string;
  kind: "lesson" | "video" | "practice" | "worksheet";
  href: string;
  label?: string;
  embedUrl?: string;
  provider?: "youtube" | "direct" | "external";
  thumbnailUrl?: string;
};

export type TopicAction =
  | "learn-concept"
  | "watch-video"
  | "do-practice"
  | "take-quiz"
  | "ask-ai"
  | "get-community-help";

export type TopicNode = {
  id: string;
  title: string;
  summary: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  prerequisites: string[];
  quizSlugs: string[];
  aiPrompt: string;
  communityThread: string;
  studyGroupId: string;
  resources: ResourceItem[];
  recommendedActions: TopicAction[];
  estimatedMinutes: number;
  masteryGoal: string;
  readinessSignals: string[];
  nextTopicIds: string[];
  reviewTopicIds: string[];
  testPrepTags: string[];
};

export type UnitNode = {
  id: string;
  title: string;
  summary: string;
  topics: TopicNode[];
  milestones: string[];
};

export type CourseNode = {
  id: string;
  title: string;
  summary: string;
  units: UnitNode[];
  recommendedSequence: string[];
};

type RawTopicNode = Omit<TopicNode, "estimatedMinutes" | "masteryGoal" | "readinessSignals" | "nextTopicIds" | "reviewTopicIds" | "testPrepTags"> &
  Partial<
    Pick<
      TopicNode,
      "estimatedMinutes" | "masteryGoal" | "readinessSignals" | "nextTopicIds" | "reviewTopicIds" | "testPrepTags"
    >
  >;

type RawUnitNode = Omit<UnitNode, "topics" | "milestones"> & {
  topics: RawTopicNode[];
  milestones?: string[];
};

type RawCourseNode = Omit<CourseNode, "units" | "recommendedSequence"> & {
  units: RawUnitNode[];
  recommendedSequence?: string[];
};

const rawCourses: RawCourseNode[] = [
  {
    id: "algebra-1",
    title: "Algebra 1",
    summary: "Build the foundation: equations, functions, and problem solving.",
    units: [
      {
        id: "a1-linear-relationships",
        title: "Linear Relationships",
        summary: "Understand slope, intercepts, and graphing linear models.",
        topics: [
          {
            id: "a1-linear-functions",
            title: "Linear Functions",
            summary: "Graph lines, interpret slope, and model real-world relationships.",
            difficulty: "beginner",
            prerequisites: ["Arithmetic fluency", "Coordinate plane basics"],
            quizSlugs: ["linear-functions"],
            aiPrompt: "Help me understand slope and y-intercept with examples.",
            communityThread: "Linear Functions Q&A",
            studyGroupId: "algebra-foundations",
            resources: [
              {
                title: "OpenStax Algebra and Trigonometry",
                kind: "lesson",
                href: "https://openstax.org/details/books/algebra-and-trigonometry-2e",
              },
              {
                title: "Khan Academy: Linear Equations",
                kind: "practice",
                href: "https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:forms-of-linear-equations",
              },
              {
                title: "Khan Academy: Linear Equations Intro",
                kind: "video",
                href: "https://www.youtube.com/watch?v=U0Y8Yk3IUT4",
                provider: "youtube",
                embedUrl: "https://www.youtube-nocookie.com/embed/U0Y8Yk3IUT4",
              },
              {
                title: "Linear Functions Practice Sheet",
                kind: "worksheet",
                href: "/downloads/two-step-inequalities.pdf",
              },
            ],
            recommendedActions: ["learn-concept", "do-practice", "take-quiz", "ask-ai", "get-community-help"],
          },
          {
            id: "a1-quadratics",
            title: "Quadratic Equations",
            summary: "Factor, complete the square, and solve quadratic equations.",
            difficulty: "intermediate",
            prerequisites: ["Linear equations", "Factoring basics"],
            quizSlugs: ["quadratic-equations"],
            aiPrompt: "Walk me through solving quadratic equations step by step.",
            communityThread: "Quadratics Help Desk",
            studyGroupId: "algebra-problem-lab",
            resources: [
              {
                title: "Paul's Online Notes: Quadratics",
                kind: "lesson",
                href: "https://tutorial.math.lamar.edu/",
              },
              {
                title: "Khan Academy: Quadratic Functions",
                kind: "practice",
                href: "https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:quadratics",
              },
              {
                title: "Math Antics: Intro to Quadratics",
                kind: "video",
                href: "https://www.youtube.com/watch?v=qeByhTF8WEw",
                provider: "youtube",
                embedUrl: "https://www.youtube-nocookie.com/embed/qeByhTF8WEw",
              },
            ],
            recommendedActions: ["learn-concept", "watch-video", "do-practice", "take-quiz", "ask-ai"],
          },
        ],
      },
      {
        id: "a1-number-systems",
        title: "Number Systems & Expressions",
        summary: "Work with rational/irrational numbers and polynomial expressions.",
        topics: [
          {
            id: "a1-number-systems-topic",
            title: "Number Systems",
            summary: "Classify numbers and simplify expressions involving radicals.",
            difficulty: "beginner",
            prerequisites: ["Integer operations"],
            quizSlugs: ["number-systems", "fractions-percentages"],
            aiPrompt: "Teach me how to classify number systems with examples.",
            communityThread: "Number Sense Corner",
            studyGroupId: "algebra-foundations",
            resources: [
              {
                title: "Khan Academy: Number Systems",
                kind: "lesson",
                href: "https://www.khanacademy.org/math/cc-eighth-grade-math",
              },
              {
                title: "IXL-inspired Number Practice",
                kind: "practice",
                href: "https://www.khanacademy.org/math",
              },
            ],
            recommendedActions: ["learn-concept", "do-practice", "take-quiz", "ask-ai"],
          },
        ],
      },
    ],
  },
  {
    id: "geometry",
    title: "Geometry",
    summary: "Master proofs, shapes, circles, and geometric reasoning.",
    units: [
      {
        id: "geo-proofs",
        title: "Proofs and Reasoning",
        summary: "Build confidence writing and analyzing geometric proofs.",
        topics: [
          {
            id: "geo-proof-logic",
            title: "Proof Logic",
            summary: "Learn the logic behind two-column and paragraph proofs.",
            difficulty: "intermediate",
            prerequisites: ["Angle relationships", "Basic postulates"],
            quizSlugs: ["geometry-proofs"],
            aiPrompt: "Help me write a clean two-column geometry proof.",
            communityThread: "Geometry Proof Clinic",
            studyGroupId: "geometry-proofs-workshop",
            resources: [
              {
                title: "CK-12 Geometry Proofs",
                kind: "lesson",
                href: "https://www.ck12.org/geometry/",
              },
              {
                title: "Geometry Proof Walkthroughs",
                kind: "video",
                href: "https://www.youtube.com/watch?v=n8Q0fY6nQwk",
                provider: "youtube",
                embedUrl: "https://www.youtube-nocookie.com/embed/n8Q0fY6nQwk",
              },
            ],
            recommendedActions: ["learn-concept", "watch-video", "do-practice", "take-quiz", "get-community-help"],
          },
          {
            id: "geo-circles-area",
            title: "Circles and Area",
            summary: "Solve area, circumference, sectors, and arc-length problems.",
            difficulty: "beginner",
            prerequisites: ["Basic algebra", "Pi and radius"],
            quizSlugs: ["circles-area"],
            aiPrompt: "Can you teach me circles and area formulas with practice?",
            communityThread: "Circle Questions Board",
            studyGroupId: "geometry-proofs-workshop",
            resources: [
              {
                title: "OpenStax Geometry Review",
                kind: "lesson",
                href: "https://openstax.org/subjects/math",
              },
              {
                title: "Circle Practice Pack",
                kind: "worksheet",
                href: "/downloads/two-step-inequalities.pdf",
              },
            ],
            recommendedActions: ["learn-concept", "do-practice", "take-quiz", "ask-ai"],
          },
        ],
      },
    ],
  },
  {
    id: "algebra-2",
    title: "Algebra 2",
    summary: "Advance into functions, sequences, and polynomial behavior.",
    units: [
      {
        id: "a2-functions-polynomials",
        title: "Functions and Polynomials",
        summary: "Analyze polynomial forms and function transformations.",
        topics: [
          {
            id: "a2-polynomials",
            title: "Polynomial Operations",
            summary: "Add, multiply, divide, and factor polynomial expressions.",
            difficulty: "intermediate",
            prerequisites: ["Algebra 1 foundations"],
            quizSlugs: ["polynomial-operations"],
            aiPrompt: "Guide me through polynomial operations and factoring.",
            communityThread: "Polynomial Practice Thread",
            studyGroupId: "algebra-problem-lab",
            resources: [
              {
                title: "Paul's Notes: Algebra",
                kind: "lesson",
                href: "https://tutorial.math.lamar.edu/",
              },
              {
                title: "Art of Problem Solving: Polynomials",
                kind: "practice",
                href: "https://artofproblemsolving.com/",
              },
            ],
            recommendedActions: ["learn-concept", "do-practice", "take-quiz", "ask-ai", "get-community-help"],
          },
          {
            id: "a2-sequences-series",
            title: "Sequences and Series",
            summary: "Work with arithmetic/geometric growth and series sums.",
            difficulty: "advanced",
            prerequisites: ["Functions", "Exponents"],
            quizSlugs: ["sequences-series"],
            aiPrompt: "Help me with arithmetic and geometric sequences.",
            communityThread: "Sequences Study Thread",
            studyGroupId: "algebra-problem-lab",
            resources: [
              {
                title: "Khan Academy: Sequences",
                kind: "lesson",
                href: "https://www.khanacademy.org/math/algebra2",
              },
              {
                title: "Sequence Drill Worksheet",
                kind: "worksheet",
                href: "/downloads/trig-identities-equations.pdf",
              },
            ],
            recommendedActions: ["watch-video", "do-practice", "take-quiz", "ask-ai"],
          },
        ],
      },
    ],
  },
  {
    id: "precalculus",
    title: "Precalculus",
    summary: "Prepare for calculus with trig, advanced functions, and modeling.",
    units: [
      {
        id: "precalc-trig",
        title: "Trigonometric Functions",
        summary: "Understand trig identities and function behavior.",
        topics: [
          {
            id: "precalc-trig-fundamentals",
            title: "Trig Fundamentals",
            summary: "Master sine, cosine, tangent, and identities.",
            difficulty: "intermediate",
            prerequisites: ["Right triangles", "Angle measure"],
            quizSlugs: ["trigonometry-fundamentals"],
            aiPrompt: "Explain trig fundamentals and identities with examples.",
            communityThread: "Trig Rescue Room",
            studyGroupId: "precalc-exam-crew",
            resources: [
              {
                title: "Khan Academy: Trigonometry",
                kind: "lesson",
                href: "https://www.khanacademy.org/math/trigonometry",
              },
              {
                title: "Trig Identity Practice",
                kind: "practice",
                href: "https://www.khanacademy.org/math/trigonometry/trig-equations-and-identities",
              },
            ],
            recommendedActions: ["learn-concept", "watch-video", "do-practice", "take-quiz", "ask-ai"],
          },
        ],
      },
      {
        id: "precalc-statistics-bridge",
        title: "Data & Modeling",
        summary: "Review statistics and data analysis for readiness.",
        topics: [
          {
            id: "precalc-statistics",
            title: "Statistics Basics",
            summary: "Use mean, median, mode, and spread to analyze data.",
            difficulty: "intermediate",
            prerequisites: ["Fractions/percent confidence"],
            quizSlugs: ["statistics-basics"],
            aiPrompt: "Teach me statistics fundamentals and interpretation.",
            communityThread: "Stats for Students",
            studyGroupId: "stats-data-lab",
            resources: [
              {
                title: "OpenIntro Statistics",
                kind: "lesson",
                href: "https://www.openintro.org/book/os/",
              },
              {
                title: "Statistics Walkthrough Video",
                kind: "video",
                href: "https://www.youtube.com/watch?v=xxpc-HPKN28",
                provider: "youtube",
                embedUrl: "https://www.youtube-nocookie.com/embed/xxpc-HPKN28",
              },
            ],
            recommendedActions: ["learn-concept", "do-practice", "take-quiz", "get-community-help"],
          },
        ],
      },
    ],
  },
  {
    id: "calculus",
    title: "Calculus",
    summary: "Move into limits, derivatives, and integral applications.",
    units: [
      {
        id: "calc-derivatives",
        title: "Derivatives",
        summary: "Learn derivative rules and interpretation of rates of change.",
        topics: [
          {
            id: "calc-derivatives-fundamentals",
            title: "Derivative Fundamentals",
            summary: "Practice product/chain rules and derivative applications.",
            difficulty: "advanced",
            prerequisites: ["Functions", "Limits intuition"],
            quizSlugs: ["calculus-derivatives"],
            aiPrompt: "Walk me through derivatives and chain rule practice.",
            communityThread: "Calculus Derivatives Hub",
            studyGroupId: "ap-calculus-bc",
            resources: [
              {
                title: "Paul's Notes: Derivatives",
                kind: "lesson",
                href: "https://tutorial.math.lamar.edu/Classes/CalcI/CalcI.aspx",
              },
              {
                title: "Khan Academy: Differential Calculus",
                kind: "video",
                href: "https://www.khanacademy.org/math/differential-calculus",
              },
            ],
            recommendedActions: ["learn-concept", "watch-video", "do-practice", "take-quiz", "ask-ai", "get-community-help"],
          },
        ],
      },
    ],
  },
];

function defaultEstimatedMinutes(difficulty: TopicNode["difficulty"]) {
  if (difficulty === "beginner") return 35;
  if (difficulty === "intermediate") return 50;
  return 70;
}

function buildPathTopic(input: {
  id: string;
  title: string;
  summary: string;
  difficulty: TopicNode["difficulty"];
  quizSlug: string;
  studyGroupId: string;
  communityThread: string;
  lessonHref: string;
  practiceHref: string;
  worksheetHref?: string;
  prerequisites?: string[];
}): RawTopicNode {
  return {
    id: input.id,
    title: input.title,
    summary: input.summary,
    difficulty: input.difficulty,
    prerequisites: input.prerequisites ?? [],
    quizSlugs: [input.quizSlug],
    aiPrompt: `Help me understand ${input.title.toLowerCase()} with a short explanation and two practice problems.`,
    communityThread: input.communityThread,
    studyGroupId: input.studyGroupId,
    resources: [
      {
        title: `${input.title} lesson guide`,
        kind: "lesson",
        href: input.lessonHref,
      },
      {
        title: `${input.title} practice set`,
        kind: "practice",
        href: input.practiceHref,
      },
      ...(input.worksheetHref
        ? [
            {
              title: `${input.title} worksheet`,
              kind: "worksheet" as const,
              href: input.worksheetHref,
            },
          ]
        : []),
    ],
    recommendedActions: ["learn-concept", "do-practice", "take-quiz", "ask-ai", "get-community-help"],
  };
}

const extraTopicsByUnitId: Record<string, RawTopicNode[]> = {
  "a1-linear-relationships": [
    buildPathTopic({ id: "a1-one-step-equations", title: "One-Step Equations", summary: "Solve one-step equations with inverse operations before moving into multi-step work.", difficulty: "beginner", quizSlug: "a1-one-step-equations", studyGroupId: "algebra-foundations", communityThread: "One-Step Equations Practice", lessonHref: "https://www.khanacademy.org/math/algebra-basics/alg-basics-linear-equations-and-inequalities", practiceHref: "https://www.khanacademy.org/math/algebra-basics/alg-basics-linear-equations-and-inequalities", worksheetHref: "/downloads/two-step-inequalities.pdf" }),
    buildPathTopic({ id: "a1-two-step-equations", title: "Two-Step Equations", summary: "Combine inverse operations to solve equations with constants and coefficients.", difficulty: "beginner", quizSlug: "a1-two-step-equations", studyGroupId: "algebra-foundations", communityThread: "Two-Step Equation Clinic", lessonHref: "https://www.khanacademy.org/math/algebra-basics/alg-basics-linear-equations-and-inequalities", practiceHref: "https://www.khanacademy.org/math/algebra-basics/alg-basics-linear-equations-and-inequalities", worksheetHref: "/downloads/two-step-inequalities.pdf" }),
    buildPathTopic({ id: "a1-inequalities", title: "Linear Inequalities", summary: "Graph and solve inequalities, including when to reverse the inequality sign.", difficulty: "beginner", quizSlug: "a1-linear-inequalities", studyGroupId: "algebra-foundations", communityThread: "Inequalities Help Desk", lessonHref: "https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:inequalities", practiceHref: "https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:inequalities", worksheetHref: "/downloads/two-step-inequalities.pdf" }),
    buildPathTopic({ id: "a1-systems-equations", title: "Systems of Equations", summary: "Solve systems by graphing, substitution, and elimination.", difficulty: "intermediate", quizSlug: "a1-systems-equations", studyGroupId: "algebra-problem-lab", communityThread: "Systems Strategy Board", lessonHref: "https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:systems-of-equations", practiceHref: "https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:systems-of-equations" }),
    buildPathTopic({ id: "a1-slope-intercept", title: "Slope-Intercept Form", summary: "Write and interpret equations in y = mx + b form from graphs and situations.", difficulty: "beginner", quizSlug: "a1-slope-intercept", studyGroupId: "algebra-foundations", communityThread: "Slope-Intercept Form Q&A", lessonHref: "https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:forms-of-linear-equations", practiceHref: "https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:forms-of-linear-equations" }),
  ],
  "a1-number-systems": [
    buildPathTopic({ id: "a1-exponents", title: "Exponent Rules", summary: "Use product, quotient, and power rules to simplify expressions.", difficulty: "intermediate", quizSlug: "a1-exponent-rules", studyGroupId: "algebra-problem-lab", communityThread: "Exponent Rules Workshop", lessonHref: "https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:exponents-radicals", practiceHref: "https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:exponents-radicals" }),
    buildPathTopic({ id: "a1-polynomial-basics", title: "Polynomial Basics", summary: "Add, subtract, and identify polynomial terms, coefficients, and degrees.", difficulty: "intermediate", quizSlug: "a1-polynomial-basics", studyGroupId: "algebra-problem-lab", communityThread: "Polynomial Basics Thread", lessonHref: "https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:polynomial-expressions", practiceHref: "https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:polynomial-expressions" }),
    buildPathTopic({ id: "a1-factoring", title: "Factoring Expressions", summary: "Factor common factors, trinomials, and difference of squares expressions.", difficulty: "intermediate", quizSlug: "a1-factoring-expressions", studyGroupId: "algebra-problem-lab", communityThread: "Factoring Practice Room", lessonHref: "https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:quadratics", practiceHref: "https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:quadratics" }),
    buildPathTopic({ id: "a1-radicals", title: "Radicals and Roots", summary: "Simplify radicals and connect square roots to quadratic equations.", difficulty: "intermediate", quizSlug: "a1-radicals-roots", studyGroupId: "algebra-problem-lab", communityThread: "Radicals and Roots Help", lessonHref: "https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:exponents-radicals", practiceHref: "https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:exponents-radicals" }),
    buildPathTopic({ id: "a1-data-models", title: "Data and Linear Models", summary: "Use scatter plots, trend lines, and residuals to interpret linear models.", difficulty: "intermediate", quizSlug: "a1-data-linear-models", studyGroupId: "stats-data-lab", communityThread: "Data and Linear Models", lessonHref: "https://www.khanacademy.org/math/statistics-probability", practiceHref: "https://www.khanacademy.org/math/statistics-probability" }),
  ],
  "geo-proofs": [
    buildPathTopic({ id: "geo-foundations", title: "Geometry Foundations", summary: "Use points, lines, planes, and postulates as the language of geometry.", difficulty: "beginner", quizSlug: "geo-foundations", studyGroupId: "geometry-proofs-workshop", communityThread: "Geometry Foundations", lessonHref: "https://www.khanacademy.org/math/geometry", practiceHref: "https://www.khanacademy.org/math/geometry" }),
    buildPathTopic({ id: "geo-angle-relationships", title: "Angle Relationships", summary: "Identify complementary, supplementary, vertical, and parallel-line angle pairs.", difficulty: "beginner", quizSlug: "geo-angle-relationships", studyGroupId: "geometry-proofs-workshop", communityThread: "Angle Relationships Q&A", lessonHref: "https://www.khanacademy.org/math/geometry/hs-geo-foundations", practiceHref: "https://www.khanacademy.org/math/geometry/hs-geo-foundations", worksheetHref: "/downloads/two-step-inequalities.pdf" }),
    buildPathTopic({ id: "geo-triangle-congruence", title: "Triangle Congruence", summary: "Apply SSS, SAS, ASA, AAS, and HL congruence shortcuts.", difficulty: "intermediate", quizSlug: "geo-triangle-congruence", studyGroupId: "geometry-proofs-workshop", communityThread: "Triangle Congruence Lab", lessonHref: "https://www.khanacademy.org/math/geometry/hs-geo-congruence", practiceHref: "https://www.khanacademy.org/math/geometry/hs-geo-congruence" }),
    buildPathTopic({ id: "geo-similarity", title: "Similarity and Scale", summary: "Use proportional reasoning to solve similar triangle and scale problems.", difficulty: "intermediate", quizSlug: "geo-similarity-scale", studyGroupId: "geometry-proofs-workshop", communityThread: "Similarity and Scale Help", lessonHref: "https://www.khanacademy.org/math/geometry/hs-geo-similarity", practiceHref: "https://www.khanacademy.org/math/geometry/hs-geo-similarity" }),
    buildPathTopic({ id: "geo-polygons", title: "Polygons and Quadrilaterals", summary: "Classify polygons and prove properties of parallelograms and quadrilaterals.", difficulty: "intermediate", quizSlug: "geo-polygons-quadrilaterals", studyGroupId: "geometry-proofs-workshop", communityThread: "Polygon Properties Board", lessonHref: "https://www.khanacademy.org/math/geometry", practiceHref: "https://www.khanacademy.org/math/geometry" }),
    buildPathTopic({ id: "geo-area-volume", title: "Area and Volume", summary: "Calculate area, surface area, and volume for composite figures and solids.", difficulty: "intermediate", quizSlug: "geo-area-volume", studyGroupId: "geometry-proofs-workshop", communityThread: "Area and Volume Workshop", lessonHref: "https://www.khanacademy.org/math/geometry/hs-geo-solids", practiceHref: "https://www.khanacademy.org/math/geometry/hs-geo-solids" }),
    buildPathTopic({ id: "geo-coordinate-geometry", title: "Coordinate Geometry", summary: "Use distance, midpoint, and slope formulas to solve geometry on the plane.", difficulty: "intermediate", quizSlug: "geo-coordinate-geometry", studyGroupId: "geometry-proofs-workshop", communityThread: "Coordinate Geometry Help", lessonHref: "https://www.khanacademy.org/math/geometry", practiceHref: "https://www.khanacademy.org/math/geometry" }),
    buildPathTopic({ id: "geo-right-triangles", title: "Right Triangles", summary: "Use the Pythagorean theorem and special right triangle relationships.", difficulty: "intermediate", quizSlug: "geo-right-triangles", studyGroupId: "geometry-proofs-workshop", communityThread: "Right Triangles Help", lessonHref: "https://www.khanacademy.org/math/geometry/hs-geo-trig", practiceHref: "https://www.khanacademy.org/math/geometry/hs-geo-trig" }),
  ],
  "a2-functions-polynomials": [
    buildPathTopic({ id: "a2-function-transformations", title: "Function Transformations", summary: "Shift, reflect, stretch, and compress parent functions.", difficulty: "intermediate", quizSlug: "a2-function-transformations", studyGroupId: "algebra-problem-lab", communityThread: "Function Transformations", lessonHref: "https://www.khanacademy.org/math/algebra2", practiceHref: "https://www.khanacademy.org/math/algebra2" }),
    buildPathTopic({ id: "a2-rational-expressions", title: "Rational Expressions", summary: "Simplify, multiply, divide, and solve rational expressions and equations.", difficulty: "advanced", quizSlug: "a2-rational-expressions", studyGroupId: "algebra-problem-lab", communityThread: "Rational Expressions Lab", lessonHref: "https://www.khanacademy.org/math/algebra2", practiceHref: "https://www.khanacademy.org/math/algebra2" }),
    buildPathTopic({ id: "a2-exponential-functions", title: "Exponential Functions", summary: "Model growth and decay with exponential functions and equations.", difficulty: "intermediate", quizSlug: "a2-exponential-functions", studyGroupId: "algebra-problem-lab", communityThread: "Exponential Functions Help", lessonHref: "https://www.khanacademy.org/math/algebra2", practiceHref: "https://www.khanacademy.org/math/algebra2" }),
    buildPathTopic({ id: "a2-logarithms", title: "Logarithms", summary: "Understand logs as inverse exponentials and use log rules.", difficulty: "advanced", quizSlug: "a2-logarithms", studyGroupId: "algebra-problem-lab", communityThread: "Logarithms Clinic", lessonHref: "https://www.khanacademy.org/math/algebra2", practiceHref: "https://www.khanacademy.org/math/algebra2" }),
    buildPathTopic({ id: "a2-matrices", title: "Matrices and Systems", summary: "Use matrices to organize and solve systems of equations.", difficulty: "advanced", quizSlug: "a2-matrices-systems", studyGroupId: "algebra-problem-lab", communityThread: "Matrices and Systems", lessonHref: "https://www.khanacademy.org/math/precalculus", practiceHref: "https://www.khanacademy.org/math/precalculus" }),
    buildPathTopic({ id: "a2-probability", title: "Probability Models", summary: "Build probability models with compound events and expected value.", difficulty: "intermediate", quizSlug: "a2-probability-models", studyGroupId: "stats-data-lab", communityThread: "Probability Models", lessonHref: "https://www.khanacademy.org/math/statistics-probability", practiceHref: "https://www.khanacademy.org/math/statistics-probability" }),
    buildPathTopic({ id: "a2-trig-intro", title: "Trigonometry Intro", summary: "Connect right-triangle ratios to sine, cosine, and tangent.", difficulty: "intermediate", quizSlug: "a2-trig-intro", studyGroupId: "precalc-exam-crew", communityThread: "Trig Intro Help", lessonHref: "https://www.khanacademy.org/math/trigonometry", practiceHref: "https://www.khanacademy.org/math/trigonometry" }),
    buildPathTopic({ id: "a2-complex-numbers", title: "Complex Numbers", summary: "Use imaginary numbers to solve equations without real solutions.", difficulty: "advanced", quizSlug: "a2-complex-numbers", studyGroupId: "algebra-problem-lab", communityThread: "Complex Numbers Q&A", lessonHref: "https://www.khanacademy.org/math/algebra2", practiceHref: "https://www.khanacademy.org/math/algebra2" }),
  ],
  "precalc-trig": [
    buildPathTopic({ id: "precalc-unit-circle", title: "Unit Circle", summary: "Use the unit circle to evaluate trig functions at key angles.", difficulty: "intermediate", quizSlug: "precalc-unit-circle", studyGroupId: "precalc-exam-crew", communityThread: "Unit Circle Practice", lessonHref: "https://www.khanacademy.org/math/trigonometry/unit-circle-trig-func", practiceHref: "https://www.khanacademy.org/math/trigonometry/unit-circle-trig-func", worksheetHref: "/downloads/trig-identities-equations.pdf" }),
    buildPathTopic({ id: "precalc-trig-identities", title: "Trig Identities", summary: "Use reciprocal, quotient, Pythagorean, and angle identities.", difficulty: "advanced", quizSlug: "precalc-trig-identities", studyGroupId: "precalc-exam-crew", communityThread: "Trig Identities Lab", lessonHref: "https://www.khanacademy.org/math/trigonometry/trig-equations-and-identities", practiceHref: "https://www.khanacademy.org/math/trigonometry/trig-equations-and-identities", worksheetHref: "/downloads/trig-identities-equations.pdf" }),
    buildPathTopic({ id: "precalc-trig-graphs", title: "Trig Graphs", summary: "Graph sinusoidal functions and interpret amplitude, period, and phase shift.", difficulty: "advanced", quizSlug: "precalc-trig-graphs", studyGroupId: "precalc-exam-crew", communityThread: "Trig Graphs Workshop", lessonHref: "https://www.khanacademy.org/math/trigonometry/trig-function-graphs", practiceHref: "https://www.khanacademy.org/math/trigonometry/trig-function-graphs" }),
    buildPathTopic({ id: "precalc-inverse-trig", title: "Inverse Trig Functions", summary: "Use inverse trig to solve equations and interpret restricted domains.", difficulty: "advanced", quizSlug: "precalc-inverse-trig", studyGroupId: "precalc-exam-crew", communityThread: "Inverse Trig Help", lessonHref: "https://www.khanacademy.org/math/trigonometry", practiceHref: "https://www.khanacademy.org/math/trigonometry" }),
    buildPathTopic({ id: "precalc-vectors", title: "Vectors", summary: "Represent magnitude and direction with vector components and operations.", difficulty: "intermediate", quizSlug: "precalc-vectors", studyGroupId: "precalc-exam-crew", communityThread: "Vectors Practice", lessonHref: "https://www.khanacademy.org/math/precalculus", practiceHref: "https://www.khanacademy.org/math/precalculus" }),
  ],
  "precalc-statistics-bridge": [
    buildPathTopic({ id: "precalc-conics", title: "Conic Sections", summary: "Identify and graph circles, ellipses, parabolas, and hyperbolas.", difficulty: "advanced", quizSlug: "precalc-conic-sections", studyGroupId: "precalc-exam-crew", communityThread: "Conic Sections Help", lessonHref: "https://www.khanacademy.org/math/precalculus", practiceHref: "https://www.khanacademy.org/math/precalculus" }),
    buildPathTopic({ id: "precalc-advanced-functions", title: "Advanced Functions", summary: "Analyze composition, inverses, and behavior of advanced functions.", difficulty: "advanced", quizSlug: "precalc-advanced-functions", studyGroupId: "precalc-exam-crew", communityThread: "Advanced Functions", lessonHref: "https://www.khanacademy.org/math/precalculus", practiceHref: "https://www.khanacademy.org/math/precalculus" }),
    buildPathTopic({ id: "precalc-limits-preview", title: "Limits Preview", summary: "Build intuition for limits using tables, graphs, and algebraic simplification.", difficulty: "advanced", quizSlug: "precalc-limits-preview", studyGroupId: "ap-calculus-bc", communityThread: "Limits Preview Help", lessonHref: "https://www.khanacademy.org/math/ap-calculus-ab/ab-limits-new", practiceHref: "https://www.khanacademy.org/math/ap-calculus-ab/ab-limits-new" }),
    buildPathTopic({ id: "precalc-modeling", title: "Function Modeling", summary: "Choose functions to model data and explain parameter meaning.", difficulty: "intermediate", quizSlug: "precalc-function-modeling", studyGroupId: "stats-data-lab", communityThread: "Function Modeling Lab", lessonHref: "https://www.khanacademy.org/math/precalculus", practiceHref: "https://www.khanacademy.org/math/precalculus" }),
  ],
  "calc-derivatives": [
    buildPathTopic({ id: "calc-limits", title: "Limits", summary: "Evaluate limits from graphs, tables, and algebraic forms.", difficulty: "advanced", quizSlug: "calc-limits", studyGroupId: "ap-calculus-bc", communityThread: "Limits Q&A", lessonHref: "https://www.khanacademy.org/math/ap-calculus-ab/ab-limits-new", practiceHref: "https://www.khanacademy.org/math/ap-calculus-ab/ab-limits-new", worksheetHref: "/downloads/limits-calculus.pdf" }),
    buildPathTopic({ id: "calc-continuity", title: "Continuity", summary: "Determine where functions are continuous and classify discontinuities.", difficulty: "advanced", quizSlug: "calc-continuity", studyGroupId: "ap-calculus-bc", communityThread: "Continuity Practice", lessonHref: "https://www.khanacademy.org/math/ap-calculus-ab/ab-limits-new", practiceHref: "https://www.khanacademy.org/math/ap-calculus-ab/ab-limits-new" }),
    buildPathTopic({ id: "calc-derivative-definition", title: "Derivative Definition", summary: "Use the limit definition to interpret instantaneous rate of change.", difficulty: "advanced", quizSlug: "calc-derivative-definition", studyGroupId: "ap-calculus-bc", communityThread: "Derivative Definition Help", lessonHref: "https://www.khanacademy.org/math/ap-calculus-ab/ab-differentiation-1-new", practiceHref: "https://www.khanacademy.org/math/ap-calculus-ab/ab-differentiation-1-new" }),
    buildPathTopic({ id: "calc-derivative-rules", title: "Derivative Rules", summary: "Apply power, product, quotient, and chain rules efficiently.", difficulty: "advanced", quizSlug: "calc-derivative-rules", studyGroupId: "ap-calculus-bc", communityThread: "Derivative Rules Workshop", lessonHref: "https://www.khanacademy.org/math/ap-calculus-ab/ab-differentiation-2-new", practiceHref: "https://www.khanacademy.org/math/ap-calculus-ab/ab-differentiation-2-new" }),
    buildPathTopic({ id: "calc-curve-sketching", title: "Curve Sketching", summary: "Use derivatives to identify increasing intervals, extrema, and concavity.", difficulty: "advanced", quizSlug: "calc-curve-sketching", studyGroupId: "ap-calculus-bc", communityThread: "Curve Sketching Help", lessonHref: "https://www.khanacademy.org/math/ap-calculus-ab/ab-applications-derivatives-new", practiceHref: "https://www.khanacademy.org/math/ap-calculus-ab/ab-applications-derivatives-new" }),
    buildPathTopic({ id: "calc-optimization", title: "Optimization", summary: "Set up and solve optimization problems with derivative reasoning.", difficulty: "advanced", quizSlug: "calc-optimization", studyGroupId: "ap-calculus-bc", communityThread: "Optimization Practice", lessonHref: "https://www.khanacademy.org/math/ap-calculus-ab/ab-applications-derivatives-new", practiceHref: "https://www.khanacademy.org/math/ap-calculus-ab/ab-applications-derivatives-new" }),
    buildPathTopic({ id: "calc-related-rates", title: "Related Rates", summary: "Differentiate linked quantities with respect to time.", difficulty: "advanced", quizSlug: "calc-related-rates", studyGroupId: "ap-calculus-bc", communityThread: "Related Rates Room", lessonHref: "https://www.khanacademy.org/math/ap-calculus-ab/ab-applications-derivatives-new", practiceHref: "https://www.khanacademy.org/math/ap-calculus-ab/ab-applications-derivatives-new" }),
    buildPathTopic({ id: "calc-integration-basics", title: "Integration Basics", summary: "Connect antiderivatives, accumulation, and definite integrals.", difficulty: "advanced", quizSlug: "calc-integration-basics", studyGroupId: "ap-calculus-bc", communityThread: "Integration Basics Help", lessonHref: "https://www.khanacademy.org/math/ap-calculus-ab/ab-integration-new", practiceHref: "https://www.khanacademy.org/math/ap-calculus-ab/ab-integration-new", worksheetHref: "/downloads/integration-definite-substitution.pdf" }),
    buildPathTopic({ id: "calc-fundamental-theorem", title: "Fundamental Theorem", summary: "Use the Fundamental Theorem of Calculus to connect area and derivatives.", difficulty: "advanced", quizSlug: "calc-fundamental-theorem", studyGroupId: "ap-calculus-bc", communityThread: "Fundamental Theorem Help", lessonHref: "https://www.khanacademy.org/math/ap-calculus-ab/ab-integration-new", practiceHref: "https://www.khanacademy.org/math/ap-calculus-ab/ab-integration-new" }),
  ],
};

function normalizeCourses(source: RawCourseNode[]): CourseNode[] {
  return source.map((course) => {
    const unitsWithExpandedTopics = course.units.map((unit) => ({
      ...unit,
      topics: [...unit.topics, ...(extraTopicsByUnitId[unit.id] ?? [])],
    }));
    const flattenedTopicIds = unitsWithExpandedTopics.flatMap((unit) => unit.topics.map((topic) => topic.id));
    const recommendedSequence =
      course.recommendedSequence && course.recommendedSequence.length
        ? course.recommendedSequence
        : flattenedTopicIds;

    return {
      ...course,
      recommendedSequence,
      units: unitsWithExpandedTopics.map((unit, unitIndex) => ({
        ...unit,
        milestones:
          unit.milestones && unit.milestones.length
            ? unit.milestones
            : [
                `Complete ${unit.title} topic walkthroughs`,
                "Score 80%+ on at least one unit quiz",
                "Join one related community support session",
              ],
        topics: unit.topics.map((topic, topicIndex) => {
          const nextTopicId =
            unit.topics[topicIndex + 1]?.id ??
            unitsWithExpandedTopics[unitIndex + 1]?.topics[0]?.id ??
            null;
          const reviewTopicId = unit.topics[topicIndex - 1]?.id ?? null;
          return {
            ...topic,
            estimatedMinutes: topic.estimatedMinutes ?? defaultEstimatedMinutes(topic.difficulty),
            masteryGoal:
              topic.masteryGoal ??
              `Demonstrate ${topic.title.toLowerCase()} confidence by explaining one solution path and passing quiz checks.`,
            readinessSignals:
              topic.readinessSignals && topic.readinessSignals.length
                ? topic.readinessSignals
                : [
                    "Can solve two scaffolded problems without hints",
                    "Can explain one prerequisite concept in own words",
                    "Can choose the right strategy before calculating",
                  ],
            nextTopicIds:
              topic.nextTopicIds && topic.nextTopicIds.length
                ? topic.nextTopicIds
                : nextTopicId
                ? [nextTopicId]
                : [],
            reviewTopicIds:
              topic.reviewTopicIds && topic.reviewTopicIds.length
                ? topic.reviewTopicIds
                : reviewTopicId
                ? [reviewTopicId]
                : [],
            testPrepTags:
              topic.testPrepTags && topic.testPrepTags.length
                ? topic.testPrepTags
                : [course.id, topic.difficulty, "timed-practice"],
          };
        }),
      })),
    };
  });
}

export const courses: CourseNode[] = normalizeCourses(rawCourses);

export type StudyGroupSpotlight = {
  id: string;
  name: string;
  focus: string;
  nextSession: string;
  members: number;
  href: string;
};

export const studyGroupSpotlights: StudyGroupSpotlight[] = [
  {
    id: "ap-calculus-bc",
    name: "AP Calculus BC Study Group",
    focus: "Derivatives, integrals, and AP review drills",
    nextSession: "Saturday 10:00 AM",
    members: 24,
    href: "/study-groups",
  },
  {
    id: "algebra-foundations",
    name: "Algebra Foundations Crew",
    focus: "Linear equations, number systems, and confidence building",
    nextSession: "Monday 6:00 PM",
    members: 28,
    href: "/study-groups",
  },
  {
    id: "stats-data-lab",
    name: "Stats & Data Lab",
    focus: "Statistics basics and data interpretation practice",
    nextSession: "Friday 3:00 PM",
    members: 15,
    href: "/study-groups",
  },
];

export type CommunityEvent = {
  id: string;
  title: string;
  type: "office-hours" | "peer-help" | "event";
  startsAt: string;
  href: string;
};

export const communityEvents: CommunityEvent[] = [
  {
    id: "office-hours-calc",
    title: "Live Office Hours: Calculus Q&A",
    type: "office-hours",
    startsAt: "Tuesday 4:30 PM",
    href: "/schedule",
  },
  {
    id: "peer-help-algebra",
    title: "Peer Help Circle: Algebra 1",
    type: "peer-help",
    startsAt: "Wednesday 5:00 PM",
    href: "/community",
  },
  {
    id: "exam-bootcamp",
    title: "Test Prep Bootcamp (Weekend)",
    type: "event",
    startsAt: "Saturday 11:30 AM",
    href: "/study-groups",
  },
];

export const allTopics = courses.flatMap((course) =>
  course.units.flatMap((unit) =>
    unit.topics.map((topic) => ({
      ...topic,
      courseId: course.id,
      courseTitle: course.title,
      unitId: unit.id,
      unitTitle: unit.title,
    }))
  )
);

export const topicByQuizSlug = allTopics.reduce<Record<string, (typeof allTopics)[number]>>(
  (acc, topic) => {
    topic.quizSlugs.forEach((slug) => {
      acc[slug] = topic;
    });
    return acc;
  },
  {}
);
