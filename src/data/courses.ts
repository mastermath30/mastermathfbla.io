export type ResourceItem = {
  title: string;
  kind: "lesson" | "video" | "practice" | "worksheet";
  href: string;
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
};

export type UnitNode = {
  id: string;
  title: string;
  summary: string;
  topics: TopicNode[];
};

export type CourseNode = {
  id: string;
  title: string;
  summary: string;
  units: UnitNode[];
};

export const courses: CourseNode[] = [
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
                title: "3Blue1Brown: Essence of Algebra",
                kind: "video",
                href: "https://www.3blue1brown.com/topics/linear-algebra",
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
            quizSlugs: ["quadratic-equations", "polynomial-operations"],
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
                href: "https://www.youtube.com/results?search_query=quadratic+equations+for+beginners",
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
                href: "https://www.youtube.com/results?search_query=geometry+proofs+tutorial",
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
                href: "/downloads/circles-and-area.pdf",
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
                href: "/downloads/sequences-series-practice.pdf",
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
                href: "https://www.youtube.com/results?search_query=statistics+basics+for+students",
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
