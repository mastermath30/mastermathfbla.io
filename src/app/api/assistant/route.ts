import { NextResponse } from "next/server";

type AssistantAction =
  | { type: "navigate"; data: { route: string } }
  | { type: "join_group"; data: { groupTitle: string } }
  | { type: "leave_group"; data: { groupTitle: string } }
  | { type: "book_session"; data: { tutorName?: string; subject?: string; date?: string; time?: string; duration?: string } }
  | { type: "add_schedule_item"; data: { title: string; date?: string; time?: string; type?: string } }
  | { type: "add_goal"; data: { title: string; target?: number } }
  | { type: "create_post"; data: { title: string; body: string; tag?: string } }
  | { type: "start_quiz"; data: { slug: string; difficulty?: string } }
  | { type: "none"; data?: Record<string, never> };

type AssistantResponse = {
  reply: string;
  action: AssistantAction;
};

const MODEL = "claude-3-5-sonnet-latest";

const extractJson = (text: string) => {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  const slice = text.slice(start, end + 1);
  try {
    return JSON.parse(slice) as AssistantResponse;
  } catch {
    return null;
  }
};

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json<AssistantResponse>(
      {
        reply: "Claude API key is missing. Please set ANTHROPIC_API_KEY.",
        action: { type: "none" },
      },
      { status: 500 }
    );
  }

  const body = await request.json();
  const message = typeof body?.message === "string" ? body.message : "";
  const context = body?.context ?? {};
  const history = Array.isArray(body?.history) ? body.history : [];

  if (!message) {
    return NextResponse.json<AssistantResponse>(
      { reply: "Please provide a message.", action: { type: "none" } },
      { status: 400 }
    );
  }

  const system = `
You are MathMaster AI Assistant. You must only respond with JSON and no extra text.
Return an object with:
{
  "reply": string,
  "action": { "type": string, "data": object }
}
Allowed action types:
navigate, join_group, leave_group, book_session, add_schedule_item, add_goal, create_post, start_quiz, none.

Rules:
- Always pick the best matching action from the user request.
- If the user asks to go to a page, use action type "navigate" with route.
- If the user asks to join/leave a study group, use join_group/leave_group and exact group title from context.
- If the user asks to book a session, use book_session. Include tutorName if specified; otherwise include subject.
- If the user asks to add to schedule, use add_schedule_item. Use a short title.
- If the user asks to add a goal, use add_goal. Include target if mentioned.
- If the user asks to post in community, use create_post. Provide title/body/tag.
- If the user asks to start a quiz, use start_quiz with slug (from context).
- If the request is informational or unclear, use action type "none".
- For any missing fields, omit them. Do not invent unknown routes.

Context is provided as JSON in the user message.`;

  const userPayload = {
    message,
    context,
  };

  const anthropicBody = {
    model: MODEL,
    max_tokens: 400,
    system,
    messages: [
      ...history.map((entry: { role: string; content: string }) => ({
        role: entry.role === "assistant" ? "assistant" : "user",
        content: entry.content,
      })),
      {
        role: "user",
        content: `User request and context JSON:\n${JSON.stringify(userPayload)}`,
      },
    ],
  };

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(anthropicBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return NextResponse.json<AssistantResponse>(
      {
        reply: `Claude API error: ${response.status} ${errorText}`,
        action: { type: "none" },
      },
      { status: 500 }
    );
  }

  const data = await response.json();
  const text = data?.content?.find((item: { type: string }) => item.type === "text")?.text ?? "";
  const parsed = extractJson(text);

  if (!parsed) {
    return NextResponse.json<AssistantResponse>({
      reply: "I could not parse the assistant response. Please try again.",
      action: { type: "none" },
    });
  }

  return NextResponse.json<AssistantResponse>(parsed);
}
