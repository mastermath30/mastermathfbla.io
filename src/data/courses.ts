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

function buildGeneratedUnit(input: {
  id: string;
  title: string;
  summary: string;
  studyGroupId: string;
  lessonHref: string;
  practiceHref: string;
  worksheetHref?: string;
  topics: Array<{
    id: string;
    title: string;
    summary: string;
    difficulty: TopicNode["difficulty"];
    quizSlug: string;
    communityThread: string;
    prerequisites?: string[];
  }>;
}): RawUnitNode {
  return {
    id: input.id,
    title: input.title,
    summary: input.summary,
    topics: input.topics.map((topic) =>
      buildPathTopic({
        ...topic,
        studyGroupId: input.studyGroupId,
        lessonHref: input.lessonHref,
        practiceHref: input.practiceHref,
        worksheetHref: input.worksheetHref,
      })
    ),
  };
}

const rawCourses: RawCourseNode[] = [
  {
    id: "pre-algebra",
    title: "Arithmetic / Pre-Algebra",
    summary: "Strengthen number sense, proportional reasoning, and equation readiness.",
    units: [
      buildGeneratedUnit({
        id: "pa-number-operations",
        title: "Number Operations",
        summary: "Build fluency with integers, fractions, decimals, and order of operations.",
        studyGroupId: "algebra-foundations",
        lessonHref: "https://www.khanacademy.org/math/pre-algebra",
        practiceHref: "https://www.khanacademy.org/math/pre-algebra",
        worksheetHref: "/downloads/two-step-inequalities.pdf",
        topics: [
          { id: "pa-place-value", title: "Place Value and Rounding", summary: "Read, compare, round, and estimate with whole numbers and decimals.", difficulty: "beginner", quizSlug: "pa-place-value", communityThread: "Place Value Help" },
          { id: "pa-integer-operations", title: "Integer Operations", summary: "Add, subtract, multiply, and divide positive and negative numbers.", difficulty: "beginner", quizSlug: "pa-integer-operations", communityThread: "Integer Operations Practice" },
          { id: "pa-fractions-decimals", title: "Fractions and Decimals", summary: "Convert, compare, simplify, and operate with fractions and decimals.", difficulty: "beginner", quizSlug: "pa-fractions-decimals", communityThread: "Fractions and Decimals" },
          { id: "pa-order-operations", title: "Order of Operations", summary: "Evaluate expressions with grouping symbols, exponents, and multi-step arithmetic.", difficulty: "beginner", quizSlug: "pa-order-operations", communityThread: "Order of Operations Clinic" },
        ],
      }),
      buildGeneratedUnit({
        id: "pa-ratios-expressions",
        title: "Ratios, Percents, and Expressions",
        summary: "Connect proportional reasoning to early algebraic thinking.",
        studyGroupId: "algebra-foundations",
        lessonHref: "https://www.khanacademy.org/math/pre-algebra",
        practiceHref: "https://www.khanacademy.org/math/pre-algebra",
        topics: [
          { id: "pa-ratios-rates", title: "Ratios and Rates", summary: "Use ratio tables, unit rates, and equivalent ratios to solve problems.", difficulty: "beginner", quizSlug: "pa-ratios-rates", communityThread: "Ratios and Rates Lab" },
          { id: "pa-percents", title: "Percents", summary: "Solve percent increase, discount, tax, tip, and percent-of-a-number problems.", difficulty: "beginner", quizSlug: "pa-percents", communityThread: "Percents Practice" },
          { id: "pa-expressions", title: "Expressions and Variables", summary: "Translate words into expressions and evaluate formulas with variables.", difficulty: "beginner", quizSlug: "pa-expressions", communityThread: "Expression Translation Help" },
          { id: "pa-coordinate-plane", title: "Coordinate Plane Basics", summary: "Plot ordered pairs and interpret graphs in all four quadrants.", difficulty: "beginner", quizSlug: "pa-coordinate-plane", communityThread: "Coordinate Plane Help" },
        ],
      }),
    ],
  },
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
      buildGeneratedUnit({
        id: "a1-functions-data",
        title: "Functions, Modeling, and Data",
        summary: "Use functions and data displays to describe patterns and predictions.",
        studyGroupId: "algebra-problem-lab",
        lessonHref: "https://www.khanacademy.org/math/algebra",
        practiceHref: "https://www.khanacademy.org/math/algebra",
        topics: [
          { id: "a1-function-notation", title: "Function Notation", summary: "Evaluate and interpret functions using tables, graphs, formulas, and notation.", difficulty: "intermediate", quizSlug: "a1-function-notation", communityThread: "Function Notation Help" },
          { id: "a1-domain-range", title: "Domain and Range", summary: "Identify possible inputs and outputs from equations, graphs, and situations.", difficulty: "intermediate", quizSlug: "a1-domain-range", communityThread: "Domain and Range Board" },
          { id: "a1-scatter-plots", title: "Scatter Plots and Trend Lines", summary: "Model bivariate data with lines of fit and interpret correlation.", difficulty: "intermediate", quizSlug: "a1-scatter-plots", communityThread: "Scatter Plot Practice" },
          { id: "a1-piecewise-absolute", title: "Piecewise and Absolute Value", summary: "Graph and evaluate piecewise and absolute value functions.", difficulty: "intermediate", quizSlug: "a1-piecewise-absolute", communityThread: "Piecewise Functions Q&A" },
        ],
      }),
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
      buildGeneratedUnit({
        id: "geo-measurement-circles",
        title: "Measurement, Circles, and Solids",
        summary: "Solve perimeter, area, volume, circle, and coordinate geometry problems.",
        studyGroupId: "geometry-proofs-workshop",
        lessonHref: "https://www.khanacademy.org/math/geometry",
        practiceHref: "https://www.khanacademy.org/math/geometry",
        topics: [
          { id: "geo-circles-arcs", title: "Circle Theorems", summary: "Use central angles, inscribed angles, tangents, chords, arcs, and sectors.", difficulty: "intermediate", quizSlug: "geo-circle-theorems", communityThread: "Circle Theorems Help" },
          { id: "geo-transformations", title: "Transformations", summary: "Apply translations, rotations, reflections, dilations, and symmetry.", difficulty: "intermediate", quizSlug: "geo-transformations", communityThread: "Transformations Lab" },
          { id: "geo-trig-applications", title: "Right Triangle Trigonometry", summary: "Use sine, cosine, tangent, and angle of elevation in geometry contexts.", difficulty: "intermediate", quizSlug: "geo-trig-applications", communityThread: "Right Triangle Trig" },
          { id: "geo-solids", title: "Surface Area and Volume", summary: "Compute and compare measurements for prisms, cylinders, pyramids, cones, and spheres.", difficulty: "intermediate", quizSlug: "geo-solids", communityThread: "Solids Workshop" },
        ],
      }),
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
      buildGeneratedUnit({
        id: "a2-advanced-functions",
        title: "Advanced Functions and Models",
        summary: "Study rational, radical, exponential, logarithmic, and probability models.",
        studyGroupId: "algebra-problem-lab",
        lessonHref: "https://www.khanacademy.org/math/algebra2",
        practiceHref: "https://www.khanacademy.org/math/algebra2",
        topics: [
          { id: "a2-radical-functions", title: "Radical Functions", summary: "Simplify, graph, and solve equations involving roots and radicals.", difficulty: "advanced", quizSlug: "a2-radical-functions", communityThread: "Radical Functions Help" },
          { id: "a2-compositions-inverses", title: "Composition and Inverses", summary: "Compose functions and find inverses algebraically and graphically.", difficulty: "advanced", quizSlug: "a2-compositions-inverses", communityThread: "Inverse Functions Lab" },
          { id: "a2-regression-models", title: "Regression Models", summary: "Fit linear, quadratic, exponential, and logarithmic models to data.", difficulty: "intermediate", quizSlug: "a2-regression-models", communityThread: "Regression Models Help" },
          { id: "a2-counting-methods", title: "Counting Methods", summary: "Use permutations, combinations, and counting principles in probability.", difficulty: "intermediate", quizSlug: "a2-counting-methods", communityThread: "Counting Methods Practice" },
        ],
      }),
    ],
  },
  {
    id: "trigonometry",
    title: "Trigonometry",
    summary: "Connect triangle ratios, unit circle values, identities, equations, and graphs.",
    units: [
      buildGeneratedUnit({
        id: "trig-foundations",
        title: "Trig Foundations",
        summary: "Move from right triangle ratios into radians and the unit circle.",
        studyGroupId: "precalc-exam-crew",
        lessonHref: "https://www.khanacademy.org/math/trigonometry",
        practiceHref: "https://www.khanacademy.org/math/trigonometry",
        worksheetHref: "/downloads/trig-identities-equations.pdf",
        topics: [
          { id: "trig-right-triangle-ratios", title: "Right Triangle Ratios", summary: "Use sine, cosine, tangent, and inverse trig to solve triangles.", difficulty: "intermediate", quizSlug: "trig-right-triangle-ratios", communityThread: "Right Triangle Ratios" },
          { id: "trig-radians-degrees", title: "Radians and Degrees", summary: "Convert angle measures and use arc length and sector area.", difficulty: "intermediate", quizSlug: "trig-radians-degrees", communityThread: "Radians and Degrees Help" },
          { id: "trig-unit-circle-values", title: "Unit Circle Values", summary: "Evaluate trig functions at special angles using coordinates.", difficulty: "intermediate", quizSlug: "trig-unit-circle-values", communityThread: "Unit Circle Values" },
          { id: "trig-law-sines-cosines", title: "Law of Sines and Cosines", summary: "Solve non-right triangles and ambiguous-case problems.", difficulty: "advanced", quizSlug: "trig-law-sines-cosines", communityThread: "Law of Sines and Cosines" },
        ],
      }),
      buildGeneratedUnit({
        id: "trig-identities-graphs",
        title: "Identities, Equations, and Graphs",
        summary: "Transform trig expressions and model periodic behavior.",
        studyGroupId: "precalc-exam-crew",
        lessonHref: "https://www.khanacademy.org/math/trigonometry",
        practiceHref: "https://www.khanacademy.org/math/trigonometry",
        worksheetHref: "/downloads/trig-identities-equations.pdf",
        topics: [
          { id: "trig-basic-identities", title: "Core Identities", summary: "Use reciprocal, quotient, and Pythagorean identities.", difficulty: "advanced", quizSlug: "trig-core-identities", communityThread: "Core Identities Practice" },
          { id: "trig-sum-difference", title: "Sum and Difference Formulas", summary: "Apply angle addition, double-angle, and half-angle formulas.", difficulty: "advanced", quizSlug: "trig-sum-difference", communityThread: "Sum and Difference Formulas" },
          { id: "trig-equations", title: "Trig Equations", summary: "Solve equations over restricted intervals and general solution sets.", difficulty: "advanced", quizSlug: "trig-equations", communityThread: "Trig Equations Lab" },
          { id: "trig-periodic-models", title: "Periodic Models", summary: "Graph sinusoidal functions and model amplitude, period, and phase shift.", difficulty: "advanced", quizSlug: "trig-periodic-models", communityThread: "Periodic Models Help" },
        ],
      }),
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
      buildGeneratedUnit({
        id: "precalc-vectors-parametric",
        title: "Vectors, Parametric, and Polar",
        summary: "Represent motion, direction, and curves beyond rectangular functions.",
        studyGroupId: "precalc-exam-crew",
        lessonHref: "https://www.khanacademy.org/math/precalculus",
        practiceHref: "https://www.khanacademy.org/math/precalculus",
        topics: [
          { id: "precalc-vector-operations", title: "Vector Operations", summary: "Add, scale, resolve, and interpret vectors in two dimensions.", difficulty: "intermediate", quizSlug: "precalc-vector-operations", communityThread: "Vector Operations" },
          { id: "precalc-parametric-equations", title: "Parametric Equations", summary: "Graph and interpret paths described by parameterized coordinates.", difficulty: "advanced", quizSlug: "precalc-parametric-equations", communityThread: "Parametric Equations Help" },
          { id: "precalc-polar-graphs", title: "Polar Graphs", summary: "Convert, graph, and analyze curves in polar coordinates.", difficulty: "advanced", quizSlug: "precalc-polar-graphs", communityThread: "Polar Graphs Lab" },
          { id: "precalc-sequences-series", title: "Sequences and Series", summary: "Use recursive and explicit formulas, sigma notation, and finite sums.", difficulty: "advanced", quizSlug: "precalc-sequences-series", communityThread: "Precalculus Sequences" },
        ],
      }),
    ],
  },
  {
    id: "statistics-probability",
    title: "Statistics / Probability",
    summary: "Analyze data, chance, distributions, inference, and study design.",
    units: [
      buildGeneratedUnit({
        id: "stats-data-distributions",
        title: "Data and Distributions",
        summary: "Summarize, visualize, compare, and interpret data sets.",
        studyGroupId: "stats-data-lab",
        lessonHref: "https://www.khanacademy.org/math/statistics-probability",
        practiceHref: "https://www.khanacademy.org/math/statistics-probability",
        topics: [
          { id: "stats-displays", title: "Data Displays", summary: "Read dot plots, histograms, box plots, two-way tables, and scatter plots.", difficulty: "beginner", quizSlug: "stats-data-displays", communityThread: "Data Displays Help" },
          { id: "stats-center-spread", title: "Center and Spread", summary: "Use mean, median, IQR, standard deviation, and outliers.", difficulty: "intermediate", quizSlug: "stats-center-spread", communityThread: "Center and Spread" },
          { id: "stats-normal-distributions", title: "Normal Distributions", summary: "Use z-scores, empirical rule, and normal model probabilities.", difficulty: "intermediate", quizSlug: "stats-normal-distributions", communityThread: "Normal Distribution Help" },
          { id: "stats-correlation-regression", title: "Correlation and Regression", summary: "Interpret association, residuals, least-squares lines, and cautions.", difficulty: "intermediate", quizSlug: "stats-correlation-regression", communityThread: "Regression Help" },
        ],
      }),
      buildGeneratedUnit({
        id: "stats-probability-inference",
        title: "Probability and Inference",
        summary: "Model chance and reason from samples to populations.",
        studyGroupId: "stats-data-lab",
        lessonHref: "https://www.khanacademy.org/math/statistics-probability",
        practiceHref: "https://www.khanacademy.org/math/statistics-probability",
        topics: [
          { id: "stats-probability-rules", title: "Probability Rules", summary: "Use complements, unions, intersections, independence, and conditional probability.", difficulty: "intermediate", quizSlug: "stats-probability-rules", communityThread: "Probability Rules" },
          { id: "stats-random-variables", title: "Random Variables", summary: "Work with expected value, variance, binomial, and geometric models.", difficulty: "advanced", quizSlug: "stats-random-variables", communityThread: "Random Variables Lab" },
          { id: "stats-sampling-design", title: "Sampling and Experiments", summary: "Evaluate sampling methods, bias, random assignment, and controls.", difficulty: "intermediate", quizSlug: "stats-sampling-design", communityThread: "Sampling Design Help" },
          { id: "stats-confidence-tests", title: "Confidence Intervals and Tests", summary: "Build confidence intervals and run significance tests with context.", difficulty: "advanced", quizSlug: "stats-confidence-tests", communityThread: "Inference Practice" },
        ],
      }),
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
      buildGeneratedUnit({
        id: "calc-integrals-series",
        title: "Integrals, Differential Equations, and Series",
        summary: "Use accumulation, antiderivatives, applications, and infinite series.",
        studyGroupId: "ap-calculus-bc",
        lessonHref: "https://www.khanacademy.org/math/ap-calculus-ab",
        practiceHref: "https://www.khanacademy.org/math/ap-calculus-ab",
        worksheetHref: "/downloads/integration-definite-substitution.pdf",
        topics: [
          { id: "calc-definite-integrals", title: "Definite Integrals", summary: "Approximate and evaluate accumulated change with definite integrals.", difficulty: "advanced", quizSlug: "calc-definite-integrals", communityThread: "Definite Integrals Help" },
          { id: "calc-integration-techniques", title: "Integration Techniques", summary: "Use substitution, parts, partial fractions, and numerical methods.", difficulty: "advanced", quizSlug: "calc-integration-techniques", communityThread: "Integration Techniques Lab" },
          { id: "calc-differential-equations", title: "Differential Equations", summary: "Model rates with slope fields, separable equations, and exponential growth.", difficulty: "advanced", quizSlug: "calc-differential-equations", communityThread: "Differential Equations Help" },
          { id: "calc-infinite-series", title: "Infinite Series", summary: "Test convergence and use Taylor and Maclaurin series.", difficulty: "advanced", quizSlug: "calc-infinite-series", communityThread: "Infinite Series Practice" },
        ],
      }),
    ],
  },
  {
    id: "test-prep",
    title: "SAT/ACT Math Prep",
    summary: "Practice high-yield algebra, geometry, data, and timing strategies for exams.",
    units: [
      buildGeneratedUnit({
        id: "prep-core-skills",
        title: "Core Test Skills",
        summary: "Review the most common calculator and no-calculator concepts.",
        studyGroupId: "algebra-foundations",
        lessonHref: "https://www.khanacademy.org/test-prep/sat",
        practiceHref: "https://www.khanacademy.org/test-prep/sat",
        topics: [
          { id: "prep-linear-equations", title: "Test Prep Linear Equations", summary: "Solve linear equations, inequalities, and systems under time pressure.", difficulty: "intermediate", quizSlug: "prep-linear-equations", communityThread: "Test Prep Linear Equations" },
          { id: "prep-quadratics-functions", title: "Quadratics and Functions", summary: "Handle factoring, graph features, function notation, and transformations.", difficulty: "intermediate", quizSlug: "prep-quadratics-functions", communityThread: "Test Prep Functions" },
          { id: "prep-geometry-trig", title: "Geometry and Trig Review", summary: "Review angles, triangles, circles, area, volume, and right-triangle trig.", difficulty: "intermediate", quizSlug: "prep-geometry-trig", communityThread: "Test Prep Geometry" },
          { id: "prep-data-probability", title: "Data and Probability Review", summary: "Interpret tables, scatter plots, statistics, probability, and unit conversions.", difficulty: "intermediate", quizSlug: "prep-data-probability", communityThread: "Test Prep Data" },
        ],
      }),
      buildGeneratedUnit({
        id: "prep-strategy-drills",
        title: "Strategy and Mixed Drills",
        summary: "Build accuracy, pacing, and recovery routines for full test sections.",
        studyGroupId: "stats-data-lab",
        lessonHref: "https://www.khanacademy.org/test-prep/sat",
        practiceHref: "https://www.khanacademy.org/test-prep/sat",
        topics: [
          { id: "prep-word-problems", title: "Word Problem Translation", summary: "Turn dense prompts into equations, diagrams, and answer checks.", difficulty: "intermediate", quizSlug: "prep-word-problems", communityThread: "Word Problem Strategy" },
          { id: "prep-grid-ins", title: "Student-Produced Responses", summary: "Practice grid-in style answers and precision traps.", difficulty: "intermediate", quizSlug: "prep-grid-ins", communityThread: "Grid-In Practice" },
          { id: "prep-timing", title: "Timing and Guessing Strategy", summary: "Use pacing checkpoints, estimation, and elimination to protect points.", difficulty: "beginner", quizSlug: "prep-timing", communityThread: "Timing Strategy" },
          { id: "prep-mixed-review", title: "Mixed Review Set", summary: "Blend algebra, geometry, data, and advanced topics in realistic sets.", difficulty: "advanced", quizSlug: "prep-mixed-review", communityThread: "Mixed Review Help" },
        ],
      }),
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
    quizSlugs: Array.of(input.quizSlug),
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

const extraUnitsByCourseId: Record<string, RawUnitNode[]> = {
  "pre-algebra": [
    buildGeneratedUnit({ id: "pa-factors-multiples", title: "Factors, Multiples, and Number Theory", summary: "Use divisibility, primes, factors, multiples, and exponents to reason about numbers.", studyGroupId: "algebra-foundations", lessonHref: "https://www.khanacademy.org/math/pre-algebra", practiceHref: "https://www.khanacademy.org/math/pre-algebra", topics: [
      { id: "pa-prime-factorization", title: "Prime Factorization", summary: "Break numbers into primes and use factor trees to compare numbers.", difficulty: "beginner", quizSlug: "pa-prime-factorization", communityThread: "Prime Factorization Help" },
      { id: "pa-gcf-lcm", title: "GCF and LCM", summary: "Use greatest common factors and least common multiples in word problems.", difficulty: "beginner", quizSlug: "pa-gcf-lcm", communityThread: "GCF and LCM Practice" },
    ] }),
    buildGeneratedUnit({ id: "pa-equations-inequalities", title: "Equations and Inequalities", summary: "Prepare for Algebra 1 with one-step, two-step, and comparison reasoning.", studyGroupId: "algebra-foundations", lessonHref: "https://www.khanacademy.org/math/pre-algebra", practiceHref: "https://www.khanacademy.org/math/pre-algebra", worksheetHref: "/downloads/two-step-inequalities.pdf", topics: [
      { id: "pa-one-two-step-equations", title: "One- and Two-Step Equations", summary: "Solve equations with inverse operations and check solutions.", difficulty: "beginner", quizSlug: "pa-one-two-step-equations", communityThread: "Pre-Algebra Equations" },
      { id: "pa-inequality-basics", title: "Inequality Basics", summary: "Solve and graph simple inequalities on a number line.", difficulty: "beginner", quizSlug: "pa-inequality-basics", communityThread: "Inequality Basics" },
    ] }),
    buildGeneratedUnit({ id: "pa-proportional-relationships", title: "Proportional Relationships", summary: "Recognize constant rates, scale factors, and proportional graphs.", studyGroupId: "algebra-foundations", lessonHref: "https://www.khanacademy.org/math/pre-algebra", practiceHref: "https://www.khanacademy.org/math/pre-algebra", topics: [
      { id: "pa-proportions", title: "Solving Proportions", summary: "Use equivalent ratios and cross products to solve proportions.", difficulty: "beginner", quizSlug: "pa-proportions", communityThread: "Solving Proportions" },
      { id: "pa-scale-drawings", title: "Scale Drawings", summary: "Apply scale factors to maps, models, and similar figures.", difficulty: "beginner", quizSlug: "pa-scale-drawings", communityThread: "Scale Drawings" },
    ] }),
    buildGeneratedUnit({ id: "pa-geometry-measurement", title: "Geometry and Measurement", summary: "Work with angles, area, surface area, volume, and measurement conversions.", studyGroupId: "geometry-proofs-workshop", lessonHref: "https://www.khanacademy.org/math/pre-algebra", practiceHref: "https://www.khanacademy.org/math/pre-algebra", topics: [
      { id: "pa-area-volume", title: "Area and Volume", summary: "Find area, surface area, and volume of common shapes and solids.", difficulty: "beginner", quizSlug: "pa-area-volume", communityThread: "Pre-Algebra Measurement" },
      { id: "pa-angle-basics", title: "Angle Basics", summary: "Classify angles and use complementary and supplementary relationships.", difficulty: "beginner", quizSlug: "pa-angle-basics", communityThread: "Angle Basics" },
    ] }),
    buildGeneratedUnit({ id: "pa-data-displays", title: "Data Displays and Probability", summary: "Read charts and reason about simple chance before formal statistics.", studyGroupId: "stats-data-lab", lessonHref: "https://www.khanacademy.org/math/pre-algebra", practiceHref: "https://www.khanacademy.org/math/pre-algebra", topics: [
      { id: "pa-data-graphs", title: "Data Graphs", summary: "Interpret bar graphs, line plots, histograms, and box plots.", difficulty: "beginner", quizSlug: "pa-data-graphs", communityThread: "Data Graphs" },
      { id: "pa-basic-probability", title: "Basic Probability", summary: "Use sample spaces, fractions, and likelihood to describe chance.", difficulty: "beginner", quizSlug: "pa-basic-probability", communityThread: "Basic Probability" },
    ] }),
  ],
  "algebra-1": [
    buildGeneratedUnit({ id: "a1-foundations-review", title: "Algebra Foundations", summary: "Review variables, expressions, properties, and equation habits.", studyGroupId: "algebra-foundations", lessonHref: "https://www.khanacademy.org/math/algebra", practiceHref: "https://www.khanacademy.org/math/algebra", topics: [
      { id: "a1-expressions-properties", title: "Expressions and Properties", summary: "Simplify expressions using distributive, commutative, and associative properties.", difficulty: "beginner", quizSlug: "a1-expressions-properties", communityThread: "Algebra Properties" },
      { id: "a1-literal-equations", title: "Literal Equations", summary: "Rearrange formulas and solve equations for a chosen variable.", difficulty: "intermediate", quizSlug: "a1-literal-equations", communityThread: "Literal Equations" },
    ] }),
    buildGeneratedUnit({ id: "a1-inequalities-systems", title: "Inequalities and Systems", summary: "Solve, graph, and interpret inequalities and systems in context.", studyGroupId: "algebra-foundations", lessonHref: "https://www.khanacademy.org/math/algebra", practiceHref: "https://www.khanacademy.org/math/algebra", worksheetHref: "/downloads/two-step-inequalities.pdf", topics: [
      { id: "a1-compound-inequalities", title: "Compound Inequalities", summary: "Solve and graph AND/OR inequality statements.", difficulty: "intermediate", quizSlug: "a1-compound-inequalities", communityThread: "Compound Inequalities" },
      { id: "a1-systems-inequalities", title: "Systems of Inequalities", summary: "Graph solution regions and interpret constraints.", difficulty: "intermediate", quizSlug: "a1-systems-inequalities", communityThread: "Systems of Inequalities" },
    ] }),
    buildGeneratedUnit({ id: "a1-linear-modeling", title: "Linear Functions and Models", summary: "Use slope, intercepts, forms of lines, and real-world linear models.", studyGroupId: "algebra-foundations", lessonHref: "https://www.khanacademy.org/math/algebra", practiceHref: "https://www.khanacademy.org/math/algebra", topics: [
      { id: "a1-point-slope-standard", title: "Point-Slope and Standard Form", summary: "Write linear equations in multiple forms and convert between them.", difficulty: "intermediate", quizSlug: "a1-point-slope-standard", communityThread: "Line Forms" },
      { id: "a1-linear-word-problems", title: "Linear Word Problems", summary: "Build equations from rates, fees, and starting values.", difficulty: "intermediate", quizSlug: "a1-linear-word-problems", communityThread: "Linear Word Problems" },
    ] }),
    buildGeneratedUnit({ id: "a1-quadratic-functions", title: "Quadratic Functions", summary: "Graph, factor, and solve quadratics using multiple methods.", studyGroupId: "algebra-problem-lab", lessonHref: "https://www.khanacademy.org/math/algebra", practiceHref: "https://www.khanacademy.org/math/algebra", topics: [
      { id: "a1-quadratic-graphs", title: "Quadratic Graphs", summary: "Identify vertex, axis of symmetry, intercepts, and transformations.", difficulty: "intermediate", quizSlug: "a1-quadratic-graphs", communityThread: "Quadratic Graphs" },
      { id: "a1-quadratic-formula", title: "Quadratic Formula", summary: "Use the quadratic formula and discriminant to solve equations.", difficulty: "intermediate", quizSlug: "a1-quadratic-formula", communityThread: "Quadratic Formula" },
    ] }),
    buildGeneratedUnit({ id: "a1-radicals-data", title: "Radicals and Data Connections", summary: "Connect roots, exponents, scatter plots, and introductory statistics.", studyGroupId: "stats-data-lab", lessonHref: "https://www.khanacademy.org/math/algebra", practiceHref: "https://www.khanacademy.org/math/algebra", topics: [
      { id: "a1-rational-exponents-intro", title: "Rational Exponents Intro", summary: "Connect roots and fractional exponents in simple expressions.", difficulty: "intermediate", quizSlug: "a1-rational-exponents-intro", communityThread: "Rational Exponents Intro" },
      { id: "a1-two-way-tables", title: "Two-Way Tables", summary: "Use relative frequency and association to interpret categorical data.", difficulty: "intermediate", quizSlug: "a1-two-way-tables", communityThread: "Two-Way Tables" },
    ] }),
  ],
  geometry: [
    buildGeneratedUnit({ id: "geo-lines-angles", title: "Lines, Angles, and Constructions", summary: "Build geometric language through angle pairs, parallel lines, and compass-straightedge work.", studyGroupId: "geometry-proofs-workshop", lessonHref: "https://www.khanacademy.org/math/geometry", practiceHref: "https://www.khanacademy.org/math/geometry", topics: [
      { id: "geo-parallel-lines", title: "Parallel Lines and Transversals", summary: "Use corresponding, alternate, and same-side angle relationships.", difficulty: "beginner", quizSlug: "geo-parallel-lines", communityThread: "Parallel Lines" },
      { id: "geo-constructions", title: "Constructions", summary: "Construct perpendicular bisectors, angle bisectors, and copied figures.", difficulty: "intermediate", quizSlug: "geo-constructions", communityThread: "Constructions" },
    ] }),
    buildGeneratedUnit({ id: "geo-triangles", title: "Triangles", summary: "Study congruence, similarity, centers, inequalities, and triangle measurements.", studyGroupId: "geometry-proofs-workshop", lessonHref: "https://www.khanacademy.org/math/geometry", practiceHref: "https://www.khanacademy.org/math/geometry", topics: [
      { id: "geo-triangle-centers", title: "Triangle Centers", summary: "Use medians, altitudes, angle bisectors, and perpendicular bisectors.", difficulty: "advanced", quizSlug: "geo-triangle-centers", communityThread: "Triangle Centers" },
      { id: "geo-triangle-inequality", title: "Triangle Inequality", summary: "Compare side lengths and angles and test possible triangles.", difficulty: "intermediate", quizSlug: "geo-triangle-inequality", communityThread: "Triangle Inequality" },
    ] }),
    buildGeneratedUnit({ id: "geo-quadrilaterals-polygons", title: "Quadrilaterals and Polygons", summary: "Classify polygons and prove properties of special quadrilaterals.", studyGroupId: "geometry-proofs-workshop", lessonHref: "https://www.khanacademy.org/math/geometry", practiceHref: "https://www.khanacademy.org/math/geometry", topics: [
      { id: "geo-parallelogram-proofs", title: "Parallelogram Proofs", summary: "Prove and apply parallelogram, rectangle, rhombus, and square properties.", difficulty: "intermediate", quizSlug: "geo-parallelogram-proofs", communityThread: "Parallelogram Proofs" },
      { id: "geo-polygon-angle-sums", title: "Polygon Angle Sums", summary: "Use interior and exterior angle formulas for polygons.", difficulty: "intermediate", quizSlug: "geo-polygon-angle-sums", communityThread: "Polygon Angle Sums" },
    ] }),
    buildGeneratedUnit({ id: "geo-coordinate-transformations", title: "Coordinate Geometry and Transformations", summary: "Use the coordinate plane to prove, transform, and measure figures.", studyGroupId: "geometry-proofs-workshop", lessonHref: "https://www.khanacademy.org/math/geometry", practiceHref: "https://www.khanacademy.org/math/geometry", topics: [
      { id: "geo-coordinate-proofs", title: "Coordinate Proofs", summary: "Use slope, distance, and midpoint to prove geometric claims.", difficulty: "advanced", quizSlug: "geo-coordinate-proofs", communityThread: "Coordinate Proofs" },
      { id: "geo-rigid-transformations", title: "Rigid Transformations", summary: "Describe translations, rotations, reflections, and congruence mappings.", difficulty: "intermediate", quizSlug: "geo-rigid-transformations", communityThread: "Rigid Transformations" },
    ] }),
    buildGeneratedUnit({ id: "geo-circles-advanced", title: "Circles", summary: "Use arcs, chords, tangents, secants, sectors, and circle equations.", studyGroupId: "geometry-proofs-workshop", lessonHref: "https://www.khanacademy.org/math/geometry", practiceHref: "https://www.khanacademy.org/math/geometry", topics: [
      { id: "geo-tangent-secant", title: "Tangents and Secants", summary: "Solve angle and length problems involving circle lines.", difficulty: "advanced", quizSlug: "geo-tangent-secant", communityThread: "Tangents and Secants" },
      { id: "geo-circle-equations", title: "Circle Equations", summary: "Write and graph equations of circles in the coordinate plane.", difficulty: "intermediate", quizSlug: "geo-circle-equations", communityThread: "Circle Equations" },
    ] }),
  ],
  "algebra-2": [
    buildGeneratedUnit({ id: "a2-equations-inequalities", title: "Advanced Equations and Inequalities", summary: "Solve absolute value, polynomial, radical, rational, and nonlinear systems.", studyGroupId: "algebra-problem-lab", lessonHref: "https://www.khanacademy.org/math/algebra2", practiceHref: "https://www.khanacademy.org/math/algebra2", topics: [
      { id: "a2-absolute-value-equations", title: "Absolute Value Equations", summary: "Solve and graph absolute value equations and inequalities.", difficulty: "intermediate", quizSlug: "a2-absolute-value-equations", communityThread: "Absolute Value Equations" },
      { id: "a2-nonlinear-systems", title: "Nonlinear Systems", summary: "Solve systems involving quadratics, lines, and other functions.", difficulty: "advanced", quizSlug: "a2-nonlinear-systems", communityThread: "Nonlinear Systems" },
    ] }),
    buildGeneratedUnit({ id: "a2-polynomial-functions", title: "Polynomial Functions", summary: "Analyze polynomial graphs, roots, factors, division, and end behavior.", studyGroupId: "algebra-problem-lab", lessonHref: "https://www.khanacademy.org/math/algebra2", practiceHref: "https://www.khanacademy.org/math/algebra2", topics: [
      { id: "a2-polynomial-graphs", title: "Polynomial Graphs", summary: "Use zeros, multiplicity, turning points, and end behavior.", difficulty: "advanced", quizSlug: "a2-polynomial-graphs", communityThread: "Polynomial Graphs" },
      { id: "a2-synthetic-division", title: "Synthetic Division", summary: "Divide polynomials and use remainder and factor theorems.", difficulty: "advanced", quizSlug: "a2-synthetic-division", communityThread: "Synthetic Division" },
    ] }),
    buildGeneratedUnit({ id: "a2-rational-radical", title: "Rational and Radical Functions", summary: "Work with asymptotes, extraneous solutions, and inverse variation.", studyGroupId: "algebra-problem-lab", lessonHref: "https://www.khanacademy.org/math/algebra2", practiceHref: "https://www.khanacademy.org/math/algebra2", topics: [
      { id: "a2-rational-graphs", title: "Rational Graphs", summary: "Find asymptotes, holes, intercepts, and domain restrictions.", difficulty: "advanced", quizSlug: "a2-rational-graphs", communityThread: "Rational Graphs" },
      { id: "a2-radical-equations", title: "Radical Equations", summary: "Solve radical equations and check for extraneous solutions.", difficulty: "advanced", quizSlug: "a2-radical-equations", communityThread: "Radical Equations" },
    ] }),
    buildGeneratedUnit({ id: "a2-exponential-logarithmic", title: "Exponential and Logarithmic Functions", summary: "Model growth, decay, inverse relationships, and log scales.", studyGroupId: "algebra-problem-lab", lessonHref: "https://www.khanacademy.org/math/algebra2", practiceHref: "https://www.khanacademy.org/math/algebra2", topics: [
      { id: "a2-exp-log-equations", title: "Exponential and Log Equations", summary: "Solve equations using inverse functions and logarithm rules.", difficulty: "advanced", quizSlug: "a2-exp-log-equations", communityThread: "Exp and Log Equations" },
      { id: "a2-growth-decay-models", title: "Growth and Decay Models", summary: "Interpret half-life, doubling, compound interest, and logistic contexts.", difficulty: "intermediate", quizSlug: "a2-growth-decay-models", communityThread: "Growth and Decay" },
    ] }),
    buildGeneratedUnit({ id: "a2-discrete-math", title: "Sequences, Series, and Probability", summary: "Connect recursive patterns, finite sums, counting, and probability models.", studyGroupId: "stats-data-lab", lessonHref: "https://www.khanacademy.org/math/algebra2", practiceHref: "https://www.khanacademy.org/math/algebra2", topics: [
      { id: "a2-arithmetic-geometric-series", title: "Arithmetic and Geometric Series", summary: "Find explicit formulas and finite sums for common sequences.", difficulty: "advanced", quizSlug: "a2-arithmetic-geometric-series", communityThread: "Series Practice" },
      { id: "a2-binomial-probability", title: "Binomial Probability", summary: "Use combinations and repeated trials to model probability.", difficulty: "advanced", quizSlug: "a2-binomial-probability", communityThread: "Binomial Probability" },
    ] }),
  ],
  trigonometry: [
    buildGeneratedUnit({ id: "trig-inverse-applications", title: "Inverse Trig and Applications", summary: "Solve triangles and contextual problems with inverse trig and bearings.", studyGroupId: "precalc-exam-crew", lessonHref: "https://www.khanacademy.org/math/trigonometry", practiceHref: "https://www.khanacademy.org/math/trigonometry", topics: [
      { id: "trig-inverse-functions", title: "Inverse Trig Functions", summary: "Evaluate inverse sine, cosine, and tangent with restricted domains.", difficulty: "advanced", quizSlug: "trig-inverse-functions", communityThread: "Inverse Trig Functions" },
      { id: "trig-bearings-vectors", title: "Bearings and Vectors", summary: "Use trig to resolve direction, navigation, and vector components.", difficulty: "advanced", quizSlug: "trig-bearings-vectors", communityThread: "Bearings and Vectors" },
    ] }),
    buildGeneratedUnit({ id: "trig-analytic-identities", title: "Analytic Trigonometry", summary: "Prove identities and transform expressions using formulas.", studyGroupId: "precalc-exam-crew", lessonHref: "https://www.khanacademy.org/math/trigonometry", practiceHref: "https://www.khanacademy.org/math/trigonometry", worksheetHref: "/downloads/trig-identities-equations.pdf", topics: [
      { id: "trig-proving-identities", title: "Proving Identities", summary: "Use algebraic strategies to verify trigonometric identities.", difficulty: "advanced", quizSlug: "trig-proving-identities", communityThread: "Proving Identities" },
      { id: "trig-product-sum", title: "Product-to-Sum Formulas", summary: "Use product-to-sum and sum-to-product identities.", difficulty: "advanced", quizSlug: "trig-product-sum", communityThread: "Product-to-Sum" },
    ] }),
    buildGeneratedUnit({ id: "trig-graphs-models", title: "Trig Graphs and Models", summary: "Model periodic motion, transformations, and sinusoidal regression.", studyGroupId: "precalc-exam-crew", lessonHref: "https://www.khanacademy.org/math/trigonometry", practiceHref: "https://www.khanacademy.org/math/trigonometry", topics: [
      { id: "trig-sinusoidal-transformations", title: "Sinusoidal Transformations", summary: "Graph amplitude, period, phase shift, and vertical shift.", difficulty: "advanced", quizSlug: "trig-sinusoidal-transformations", communityThread: "Sinusoidal Transformations" },
      { id: "trig-harmonic-motion", title: "Harmonic Motion Models", summary: "Represent tides, springs, and rotation with trig functions.", difficulty: "advanced", quizSlug: "trig-harmonic-motion", communityThread: "Harmonic Motion" },
    ] }),
    buildGeneratedUnit({ id: "trig-complex-polar", title: "Polar and Complex Connections", summary: "Preview polar coordinates and complex number trigonometric form.", studyGroupId: "precalc-exam-crew", lessonHref: "https://www.khanacademy.org/math/trigonometry", practiceHref: "https://www.khanacademy.org/math/trigonometry", topics: [
      { id: "trig-polar-basics", title: "Polar Basics", summary: "Convert between rectangular and polar coordinates.", difficulty: "advanced", quizSlug: "trig-polar-basics", communityThread: "Polar Basics" },
      { id: "trig-complex-plane", title: "Complex Plane Trig Form", summary: "Represent complex numbers with magnitude and angle.", difficulty: "advanced", quizSlug: "trig-complex-plane", communityThread: "Complex Plane" },
    ] }),
  ],
  precalculus: [
    buildGeneratedUnit({ id: "precalc-foundations", title: "Function Foundations", summary: "Review families of functions, transformations, composition, inverses, and domain.", studyGroupId: "precalc-exam-crew", lessonHref: "https://www.khanacademy.org/math/precalculus", practiceHref: "https://www.khanacademy.org/math/precalculus", topics: [
      { id: "precalc-parent-functions", title: "Parent Functions", summary: "Recognize polynomial, rational, radical, exponential, log, and trig parent functions.", difficulty: "intermediate", quizSlug: "precalc-parent-functions", communityThread: "Parent Functions" },
      { id: "precalc-composition-inverses", title: "Composition and Inverses", summary: "Compose functions and verify inverse relationships.", difficulty: "advanced", quizSlug: "precalc-composition-inverses", communityThread: "Precalc Inverses" },
    ] }),
    buildGeneratedUnit({ id: "precalc-polynomial-rational", title: "Polynomial and Rational Functions", summary: "Analyze roots, end behavior, asymptotes, and graph structure.", studyGroupId: "algebra-problem-lab", lessonHref: "https://www.khanacademy.org/math/precalculus", practiceHref: "https://www.khanacademy.org/math/precalculus", topics: [
      { id: "precalc-polynomial-analysis", title: "Polynomial Analysis", summary: "Use factors, zeros, multiplicity, and end behavior.", difficulty: "advanced", quizSlug: "precalc-polynomial-analysis", communityThread: "Polynomial Analysis" },
      { id: "precalc-rational-analysis", title: "Rational Function Analysis", summary: "Analyze asymptotes, holes, intercepts, and sign behavior.", difficulty: "advanced", quizSlug: "precalc-rational-analysis", communityThread: "Rational Analysis" },
    ] }),
    buildGeneratedUnit({ id: "precalc-exponential-log", title: "Exponential and Logarithmic Functions", summary: "Model exponential change and logarithmic relationships.", studyGroupId: "algebra-problem-lab", lessonHref: "https://www.khanacademy.org/math/precalculus", practiceHref: "https://www.khanacademy.org/math/precalculus", topics: [
      { id: "precalc-log-properties", title: "Log Properties", summary: "Use logarithm rules to expand, condense, and solve equations.", difficulty: "advanced", quizSlug: "precalc-log-properties", communityThread: "Log Properties" },
      { id: "precalc-exponential-models", title: "Exponential Models", summary: "Model growth, decay, interest, and continuous change.", difficulty: "advanced", quizSlug: "precalc-exponential-models", communityThread: "Exponential Models" },
    ] }),
    buildGeneratedUnit({ id: "precalc-analytic-trig", title: "Analytic Trigonometry", summary: "Use identities, equations, and trig graphs as a bridge to calculus.", studyGroupId: "precalc-exam-crew", lessonHref: "https://www.khanacademy.org/math/precalculus", practiceHref: "https://www.khanacademy.org/math/precalculus", worksheetHref: "/downloads/trig-identities-equations.pdf", topics: [
      { id: "precalc-trig-equations", title: "Trig Equations", summary: "Solve trig equations over intervals and describe all solutions.", difficulty: "advanced", quizSlug: "precalc-trig-equations", communityThread: "Precalc Trig Equations" },
      { id: "precalc-sinusoidal-modeling", title: "Sinusoidal Modeling", summary: "Fit and interpret periodic models from data or context.", difficulty: "advanced", quizSlug: "precalc-sinusoidal-modeling", communityThread: "Sinusoidal Modeling" },
    ] }),
    buildGeneratedUnit({ id: "precalc-calculus-readiness", title: "Limits and Calculus Readiness", summary: "Preview limits, continuity, rates of change, and average versus instantaneous behavior.", studyGroupId: "ap-calculus-bc", lessonHref: "https://www.khanacademy.org/math/ap-calculus-ab/ab-limits-new", practiceHref: "https://www.khanacademy.org/math/ap-calculus-ab/ab-limits-new", topics: [
      { id: "precalc-average-rate-change", title: "Average Rate of Change", summary: "Interpret slope over intervals as preparation for derivatives.", difficulty: "advanced", quizSlug: "precalc-average-rate-change", communityThread: "Average Rate of Change" },
      { id: "precalc-continuity-preview", title: "Continuity Preview", summary: "Reason about holes, jumps, asymptotes, and continuous behavior.", difficulty: "advanced", quizSlug: "precalc-continuity-preview", communityThread: "Continuity Preview" },
    ] }),
  ],
  "statistics-probability": [
    buildGeneratedUnit({ id: "stats-exploring-data", title: "Exploring One-Variable Data", summary: "Describe distributions using shape, center, spread, and unusual features.", studyGroupId: "stats-data-lab", lessonHref: "https://www.khanacademy.org/math/statistics-probability", practiceHref: "https://www.khanacademy.org/math/statistics-probability", topics: [
      { id: "stats-shape-outliers", title: "Shape and Outliers", summary: "Describe skew, clusters, gaps, and outliers in distributions.", difficulty: "intermediate", quizSlug: "stats-shape-outliers", communityThread: "Shape and Outliers" },
      { id: "stats-comparing-distributions", title: "Comparing Distributions", summary: "Compare groups using graphical displays and summary statistics.", difficulty: "intermediate", quizSlug: "stats-comparing-distributions", communityThread: "Comparing Distributions" },
    ] }),
    buildGeneratedUnit({ id: "stats-two-variable-data", title: "Exploring Two-Variable Data", summary: "Study relationships, regression, residuals, and categorical association.", studyGroupId: "stats-data-lab", lessonHref: "https://www.khanacademy.org/math/statistics-probability", practiceHref: "https://www.khanacademy.org/math/statistics-probability", topics: [
      { id: "stats-residuals", title: "Residuals and Least Squares", summary: "Use residuals to judge fit and interpret least-squares regression.", difficulty: "advanced", quizSlug: "stats-residuals", communityThread: "Residuals" },
      { id: "stats-two-way-tables", title: "Two-Way Tables", summary: "Use conditional distributions and association in categorical data.", difficulty: "intermediate", quizSlug: "stats-two-way-tables", communityThread: "Stats Two-Way Tables" },
    ] }),
    buildGeneratedUnit({ id: "stats-collecting-data", title: "Collecting Data", summary: "Design samples and experiments that support reliable conclusions.", studyGroupId: "stats-data-lab", lessonHref: "https://www.khanacademy.org/math/statistics-probability", practiceHref: "https://www.khanacademy.org/math/statistics-probability", topics: [
      { id: "stats-surveys-sampling", title: "Surveys and Sampling", summary: "Identify sampling methods, bias, and sources of error.", difficulty: "intermediate", quizSlug: "stats-surveys-sampling", communityThread: "Surveys and Sampling" },
      { id: "stats-experimental-design", title: "Experimental Design", summary: "Use random assignment, controls, blocking, and replication.", difficulty: "advanced", quizSlug: "stats-experimental-design", communityThread: "Experimental Design" },
    ] }),
    buildGeneratedUnit({ id: "stats-inference-deepening", title: "Statistical Inference", summary: "Estimate parameters and test claims with confidence and context.", studyGroupId: "stats-data-lab", lessonHref: "https://www.khanacademy.org/math/statistics-probability", practiceHref: "https://www.khanacademy.org/math/statistics-probability", topics: [
      { id: "stats-proportion-inference", title: "Inference for Proportions", summary: "Build intervals and tests for one and two proportions.", difficulty: "advanced", quizSlug: "stats-proportion-inference", communityThread: "Proportion Inference" },
      { id: "stats-mean-inference", title: "Inference for Means", summary: "Use t procedures to estimate and test means.", difficulty: "advanced", quizSlug: "stats-mean-inference", communityThread: "Mean Inference" },
    ] }),
  ],
  calculus: [
    buildGeneratedUnit({ id: "calc-limits-continuity", title: "Limits and Continuity", summary: "Build the foundation of calculus with graphical, numerical, and algebraic limits.", studyGroupId: "ap-calculus-bc", lessonHref: "https://www.khanacademy.org/math/ap-calculus-ab/ab-limits-new", practiceHref: "https://www.khanacademy.org/math/ap-calculus-ab/ab-limits-new", worksheetHref: "/downloads/limits-calculus.pdf", topics: [
      { id: "calc-limit-laws", title: "Limit Laws", summary: "Evaluate limits using algebra, factoring, conjugates, and limit laws.", difficulty: "advanced", quizSlug: "calc-limit-laws", communityThread: "Limit Laws" },
      { id: "calc-infinite-limits", title: "Infinite Limits", summary: "Analyze vertical asymptotes and unbounded behavior.", difficulty: "advanced", quizSlug: "calc-infinite-limits", communityThread: "Infinite Limits" },
    ] }),
    buildGeneratedUnit({ id: "calc-derivative-applications", title: "Applications of Derivatives", summary: "Use derivatives for motion, optimization, related rates, and graph analysis.", studyGroupId: "ap-calculus-bc", lessonHref: "https://www.khanacademy.org/math/ap-calculus-ab/ab-applications-derivatives-new", practiceHref: "https://www.khanacademy.org/math/ap-calculus-ab/ab-applications-derivatives-new", topics: [
      { id: "calc-motion-analysis", title: "Motion Analysis", summary: "Use position, velocity, acceleration, and total distance.", difficulty: "advanced", quizSlug: "calc-motion-analysis", communityThread: "Motion Analysis" },
      { id: "calc-lhopital", title: "L'Hopital's Rule", summary: "Evaluate indeterminate forms with derivative reasoning.", difficulty: "advanced", quizSlug: "calc-lhopital", communityThread: "L'Hopital's Rule" },
    ] }),
    buildGeneratedUnit({ id: "calc-integral-applications", title: "Applications of Integrals", summary: "Use integrals for area, volume, average value, and accumulation.", studyGroupId: "ap-calculus-bc", lessonHref: "https://www.khanacademy.org/math/ap-calculus-ab/ab-applications-integrals-new", practiceHref: "https://www.khanacademy.org/math/ap-calculus-ab/ab-applications-integrals-new", worksheetHref: "/downloads/integration-definite-substitution.pdf", topics: [
      { id: "calc-area-between-curves", title: "Area Between Curves", summary: "Set up and evaluate integrals for enclosed regions.", difficulty: "advanced", quizSlug: "calc-area-between-curves", communityThread: "Area Between Curves" },
      { id: "calc-volume", title: "Volume by Integration", summary: "Use disks, washers, and cross sections to find volume.", difficulty: "advanced", quizSlug: "calc-volume", communityThread: "Volume by Integration" },
    ] }),
    buildGeneratedUnit({ id: "calc-bc-topics", title: "Parametric, Polar, and Vector Calculus", summary: "Extend calculus to curves, motion, polar graphs, and vector-valued functions.", studyGroupId: "ap-calculus-bc", lessonHref: "https://www.khanacademy.org/math/ap-calculus-bc", practiceHref: "https://www.khanacademy.org/math/ap-calculus-bc", topics: [
      { id: "calc-parametric", title: "Parametric Calculus", summary: "Differentiate and integrate parametrically defined curves.", difficulty: "advanced", quizSlug: "calc-parametric", communityThread: "Parametric Calculus" },
      { id: "calc-polar", title: "Polar Calculus", summary: "Find area and slopes for polar curves.", difficulty: "advanced", quizSlug: "calc-polar", communityThread: "Polar Calculus" },
    ] }),
  ],
};

function normalizeCourses(source: RawCourseNode[]): CourseNode[] {
  return source.map((course) => {
    const courseUnits = [...course.units, ...(extraUnitsByCourseId[course.id] ?? [])];
    const unitsWithExpandedTopics = courseUnits.map((unit) => ({
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
