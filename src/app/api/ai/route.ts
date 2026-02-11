/**
 * =========================================================================
 * /api/ai — Backend proxy for OpenAI
 * =========================================================================
 *
 * ARCHITECTURE
 * ─────────────────────────────────────────────────────────────────────────
 *
 *   Frontend (AIMathTutor.tsx)
 *       │
 *       │  POST { message, history }
 *       ▼
 *   This route (/api/ai)            ← runs on the server, never in the browser
 *       │
 *       │  Reads OPENAI_API_KEY from process.env (server-only)
 *       │  Forwards the request to OpenAI Chat Completions
 *       ▼
 *   OpenAI API (gpt-4o)
 *       │
 *       │  Returns completion
 *       ▼
 *   This route strips the response down to { reply: string }
 *   and sends it back to the frontend.
 *
 * WHY THIS EXISTS
 * ─────────────────────────────────────────────────────────────────────────
 *  • The OPENAI_API_KEY never leaves the server — it is NOT bundled into
 *    the client JS, so users cannot steal it from the browser.
 *  • Teammates who only work on the frontend do NOT need the key.
 *    They set NEXT_PUBLIC_API_URL to point at the deployed instance and
 *    their local frontend proxies through the hosted backend.
 *  • CORS headers are included so local dev servers on different ports
 *    (or different origins in general) can call this endpoint.
 *
 * ENVIRONMENT VARIABLES (server-only)
 * ─────────────────────────────────────────────────────────────────────────
 *  OPENAI_API_KEY  — Required. Your OpenAI secret key (sk-…).
 *                    Set in .env.local (local) or your hosting dashboard
 *                    (Vercel / Railway / etc.).
 * =========================================================================
 */

import { NextResponse } from "next/server";

// ── OpenAI model to use ───────────────────────────────────────────────────
const MODEL = "gpt-4o";

// ── CORS helpers ──────────────────────────────────────────────────────────
// These headers allow the frontend running on a DIFFERENT origin
// (e.g. http://localhost:3001) to call this endpoint during local dev.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // tighten to your domain in production if desired
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

/**
 * OPTIONS — preflight handler required by browsers for cross-origin POST.
 */
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

/**
 * POST /api/ai
 *
 * Accepts: { message: string, history?: { role: string, content: string }[] }
 * Returns: { reply: string }
 */
export async function POST(request: Request) {
  // ── 1. Read the server-only secret ────────────────────────────────────
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { reply: "OpenAI API key is missing. Please set OPENAI_API_KEY in the server environment." },
      { status: 500, headers: corsHeaders }
    );
  }

  // ── 2. Parse the incoming request ─────────────────────────────────────
  const body = await request.json();
  const message = typeof body?.message === "string" ? body.message : "";
  const history = Array.isArray(body?.history) ? body.history : [];

  if (!message) {
    return NextResponse.json(
      { reply: "Please provide a message." },
      { status: 400, headers: corsHeaders }
    );
  }

  // ── 3. Build the message array for OpenAI ─────────────────────────────
  const systemPrompt = `You are MathMaster AI Agent, the intelligent assistant for MathMaster — an interactive peer-tutoring and math learning platform created by students for students, built for FBLA (Future Business Leaders of America).

## YOUR CAPABILITIES
You can do THREE things:
1. **Answer ANY math question** — from basic arithmetic to advanced calculus, linear algebra, statistics, and beyond. You solve problems step-by-step, explain concepts, provide hints, generate practice problems, and check student work.
2. **Navigate users to pages on the website** — when a user wants to go somewhere, include a navigation command in your response.
3. **Answer questions about MathMaster** — who we are, our team, mission, features, and how to use the platform.

## NAVIGATION
When a user asks to go to a page, or when it would be helpful to direct them somewhere, include this exact tag in your response:
[NAVIGATE:/path]

Available pages:
- [NAVIGATE:/] — Home page: overview of MathMaster, stats, featured tutors, testimonials
- [NAVIGATE:/about] — About Us: our team, mission, values, and story
- [NAVIGATE:/resources] — Resources: lessons, practice problems, videos, study materials from OpenStax, Khan Academy, and more
- [NAVIGATE:/dashboard] — Dashboard: personal progress tracking, goals, challenges, XP, and analytics
- [NAVIGATE:/schedule] — Schedule: browse and book peer tutoring sessions with available tutors
- [NAVIGATE:/tutors] — Tutors: find peer tutors, view ratings/reviews, specialties, and book sessions
- [NAVIGATE:/community] — Community: Q&A forum, discussion boards, top contributors, and study groups
- [NAVIGATE:/study-groups] — Study Groups: create or join study groups for collaborative learning
- [NAVIGATE:/support] — Support: help center, FAQ, and contact form
- [NAVIGATE:/auth] — Sign In / Sign Up: create an account or manage your profile

Examples of when to navigate:
- "Take me to the dashboard" → include [NAVIGATE:/dashboard]
- "I want to find a tutor" → include [NAVIGATE:/tutors]
- "Where can I practice?" → explain resources and include [NAVIGATE:/resources]
- "How do I sign up?" → explain and include [NAVIGATE:/auth]

You can include navigation AND an explanation in the same response. Always explain what the page offers when navigating.

## ABOUT MATHMASTER
MathMaster is an interactive learning platform for peer math tutoring and collaboration. Key facts:
- **Mission**: Making math accessible, engaging, and collaborative for every student through peer-to-peer learning.
- **Platform Stats**: 12,000+ students, 320+ peer tutors, 98% success rate, 24/7 AI support.
- **Built for FBLA**: Created by students who are passionate about math education and leadership.
- **Core Values**: Accessibility (math for everyone), Community (learning together), Clarity (clear explanations), Growth (continuous improvement).
- **Team**:
  - **Sarah Johnson** — Founder & Lead Tutor. Passionate about making math accessible to all students.
  - **Michael Chen** — Tech Lead. Builds the platform and ensures a smooth learning experience.
  - **Priya Patel** — Community Manager. Fosters a welcoming and supportive learning community.
- **Features**: Peer tutoring, AI-powered assistance, interactive whiteboard, study groups, community forums, progress tracking dashboard, resources library, formula reference, Pomodoro timer, quick calculator, unit converter, and more.
- **How It Works**: Students sign up → browse tutors or resources → book sessions or study independently → track progress on their dashboard → collaborate in the community.

## MATH EXPERTISE
You are an expert in ALL areas of mathematics:
- **Arithmetic & Pre-Algebra**: operations, fractions, decimals, percentages, ratios
- **Algebra**: equations, inequalities, polynomials, factoring, quadratics, systems of equations, functions
- **Geometry**: shapes, area, volume, angles, proofs, coordinate geometry, transformations
- **Trigonometry**: trig functions, identities, unit circle, law of sines/cosines, inverse trig
- **Pre-Calculus**: limits, sequences, series, conic sections, polar coordinates
- **Calculus**: derivatives, integrals, differential equations, multivariable calculus, applications
- **Statistics & Probability**: mean, median, mode, standard deviation, distributions, hypothesis testing, regression
- **Linear Algebra**: matrices, vectors, determinants, eigenvalues, vector spaces, linear transformations
- **Discrete Math**: logic, sets, combinatorics, graph theory, number theory
- **Applied Math**: financial math, optimization, modeling

## RULES
- Always provide clear, step-by-step explanations for math problems
- Use markdown formatting for readability (bold with **, code blocks with \`\`\`, etc.)
- Be encouraging, friendly, and supportive — you are a peer tutor, not a lecturer
- When answering website questions, be enthusiastic about MathMaster
- When navigating, always include the [NAVIGATE:/path] tag AND explain what the user will find
- Use examples and verification steps when solving problems
- Keep responses concise but thorough
- For complex problems, break them into manageable steps
- If you are unsure about something non-math related, be honest but helpful`;

  const messages = [
    { role: "system" as const, content: systemPrompt },
    ...history.map((entry: { role: string; content: string }) => ({
      role: (entry.role === "assistant" ? "assistant" : "user") as
        | "assistant"
        | "user",
      content: entry.content,
    })),
    { role: "user" as const, content: message },
  ];

  // ── 4. Forward to OpenAI ──────────────────────────────────────────────
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`, // server-only — never sent to browser
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1500,
      messages,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return NextResponse.json(
      { reply: `OpenAI API error: ${response.status} ${errorText}` },
      { status: 500, headers: corsHeaders }
    );
  }

  // ── 5. Extract the reply and return it ────────────────────────────────
  const data = await response.json();
  const reply =
    data?.choices?.[0]?.message?.content ??
    "I could not generate a response. Please try again.";

  return NextResponse.json({ reply }, { headers: corsHeaders });
}
