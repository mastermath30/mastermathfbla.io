/**
 * =========================================================================
 * /api/ai — Backend proxy for Anthropic Claude with web search tool
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
 *       │  Reads ANTHROPIC_API_KEY from process.env (server-only)
 *       │  Defines a search_web tool backed by Tavily
 *       │  Runs a tool-use loop until Claude produces a final text reply
 *       ▼
 *   Anthropic API (Claude)
 *       │
 *       │  Returns completion or tool_use request
 *       │  ↳ If tool_use → calls Tavily search API → feeds results back
 *       ▼
 *   Returns { reply: string } to the frontend.
 *
 * ENVIRONMENT VARIABLES (server-only)
 * ─────────────────────────────────────────────────────────────────────────
 *  ANTHROPIC_API_KEY  — Required. Your Anthropic secret key (sk-ant-…).
 *  TAVILY_API_KEY     — Optional but recommended. Free at tavily.com.
 *                       Without it, Claude still answers but cannot search.
 * =========================================================================
 */

import { NextResponse } from "next/server";

// ── Claude model to use ───────────────────────────────────────────────────
const MODEL = "claude-sonnet-4-6";

// ── CORS helpers ──────────────────────────────────────────────────────────
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

// ── Tool definitions sent to Claude ──────────────────────────────────────
const tools = [
  {
    name: "search_web",
    description:
      "Search the web to verify mathematical answers, look up formulas, theorems, and definitions, or find authoritative step-by-step solutions. " +
      "Use this tool whenever you want to double-check a calculation, confirm a theorem, or look up a formula before presenting your final answer. " +
      "Prefer precise, math-focused queries such as 'derivative of x^3 step by step' or 'quadratic formula proof'.",
    input_schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "A concise, precise search query.",
        },
      },
      required: ["query"],
    },
  },
];

// ── Execute a web search via Tavily ──────────────────────────────────────
async function executeWebSearch(query: string): Promise<string> {
  const tavilyKey = process.env.TAVILY_API_KEY;
  if (!tavilyKey) {
    return "Web search is unavailable (TAVILY_API_KEY not configured). Continuing without external verification.";
  }

  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: tavilyKey,
        query,
        search_depth: "basic",
        max_results: 5,
        include_answer: true,
      }),
    });

    if (!res.ok) {
      return `Search request failed (HTTP ${res.status}). Continuing without external verification.`;
    }

    const data = await res.json();
    let output = "";

    if (data.answer) {
      output += `Summary: ${data.answer}\n\n`;
    }

    const results: Array<{ title: string; content: string; url: string }> =
      data.results ?? [];
    for (const r of results.slice(0, 4)) {
      output += `Source: ${r.title}\n`;
      output += `${(r.content ?? "").slice(0, 400)}\n`;
      output += `URL: ${r.url}\n\n`;
    }

    return output.trim() || "No relevant results found for this query.";
  } catch (err) {
    return `Search error: ${String(err)}. Continuing without external verification.`;
  }
}

// ── System prompt ─────────────────────────────────────────────────────────
const systemPrompt = `You are MathMaster AI Agent, the intelligent assistant for MathMaster — an interactive peer-tutoring and math learning platform created by students for students, built for FBLA (Future Business Leaders of America).

## YOUR CAPABILITIES
You can do THREE things:
1. **Answer ANY math question** — from basic arithmetic to advanced calculus, linear algebra, statistics, and beyond. You solve problems step-by-step, explain concepts, provide hints, generate practice problems, and check student work.
2. **Navigate users to pages on the website** — when a user wants to go somewhere, include a navigation command in your response.
3. **Answer questions about MathMaster** — who we are, our team, mission, features, and how to use the platform.

## WEB SEARCH & VERIFICATION
You have access to a **search_web** tool. Use it to:
- **Verify your answer** before presenting it for any non-trivial math problem (derivatives, integrals, theorems, proofs, statistics formulas, etc.)
- **Look up formulas or definitions** you want to confirm are correct
- **Find alternative approaches** that may help the student understand better
- Cross-check step-by-step solutions against authoritative math sources

Always call search_web at least once for complex or advanced questions to ensure accuracy. After reviewing search results, mention briefly that you verified the answer (e.g., "I've verified this result via web search.").

## NAVIGATION
When a user asks to go to a page, or when it would be helpful to direct them somewhere, include this exact tag in your response:
[NAVIGATE:/path]

Available pages:
- [NAVIGATE:/] — Home page: overview of MathMaster, stats, featured tutors, testimonials
- [NAVIGATE:/about] — About Us: our team, mission, values, and story
- [NAVIGATE:/learn] — Learn: lessons, practice problems, videos, study materials from OpenStax, Khan Academy, and more
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
- "Where can I practice?" → explain resources and include [NAVIGATE:/learn]
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

/**
 * POST /api/ai
 *
 * Accepts: { message: string, history?: { role: string, content: string }[] }
 * Returns: { reply: string }
 */
export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { reply: "Claude API key is missing. Please set ANTHROPIC_API_KEY in the server environment." },
      { status: 500, headers: corsHeaders }
    );
  }

  const body = await request.json();
  const message = typeof body?.message === "string" ? body.message : "";
  const history = Array.isArray(body?.history) ? body.history : [];

  if (!message) {
    return NextResponse.json(
      { reply: "Please provide a message." },
      { status: 400, headers: corsHeaders }
    );
  }

  // Build messages array: conversation history + new user message
  type ContentBlock = { type: string; [key: string]: unknown };
  type Message = { role: "user" | "assistant"; content: string | ContentBlock[] };

  const messages: Message[] = [
    ...history.map((entry: { role: string; content: string }) => ({
      role: (entry.role === "assistant" ? "assistant" : "user") as "user" | "assistant",
      content: entry.content,
    })),
    { role: "user", content: message },
  ];

  // ── Tool-use loop (max 5 iterations to prevent runaway loops) ────────────
  for (let iteration = 0; iteration < 5; iteration++) {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 2000,
        system: systemPrompt,
        tools,
        messages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { reply: `Claude API error: ${response.status} ${errorText}` },
        { status: 500, headers: corsHeaders }
      );
    }

    const data = await response.json();
    const stopReason: string = data.stop_reason ?? "end_turn";

    // ── Claude finished — return the text reply ───────────────────────────
    if (stopReason === "end_turn" || stopReason === "max_tokens") {
      const textBlock = (data.content as ContentBlock[])?.find(
        (block) => block.type === "text"
      );
      const reply =
        (textBlock?.text as string) ??
        "I could not generate a response. Please try again.";
      return NextResponse.json({ reply }, { headers: corsHeaders });
    }

    // ── Claude wants to use a tool ────────────────────────────────────────
    if (stopReason === "tool_use") {
      // Append Claude's response (containing tool_use blocks) to the thread
      messages.push({ role: "assistant", content: data.content as ContentBlock[] });

      // Execute each requested tool call
      const toolResults: ContentBlock[] = [];
      for (const block of data.content as ContentBlock[]) {
        if (block.type === "tool_use") {
          let result: string;
          if (block.name === "search_web") {
            const query = (block.input as { query: string }).query;
            result = await executeWebSearch(query);
          } else {
            result = `Unknown tool: ${block.name as string}`;
          }
          toolResults.push({
            type: "tool_result",
            tool_use_id: block.id as string,
            content: result,
          });
        }
      }

      // Feed tool results back as a user message and loop
      messages.push({ role: "user", content: toolResults });
      continue;
    }

    // ── Unexpected stop reason — return whatever text we have ─────────────
    const textBlock = (data.content as ContentBlock[])?.find(
      (block) => block.type === "text"
    );
    const reply =
      (textBlock?.text as string) ??
      "I could not generate a response. Please try again.";
    return NextResponse.json({ reply }, { headers: corsHeaders });
  }

  // Fell through all iterations without a final answer
  return NextResponse.json(
    { reply: "I ran too many search steps without a final answer. Please try again." },
    { headers: corsHeaders }
  );
}
