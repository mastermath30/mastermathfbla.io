"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bot, Send, X } from "lucide-react";
import { Button } from "@/components/Button";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

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

const PAGES = [
  { title: "Home", route: "/" },
  { title: "About", route: "/about" },
  { title: "Auth", route: "/auth" },
  { title: "Community", route: "/community" },
  { title: "Dashboard", route: "/dashboard" },
  { title: "Resources", route: "/resources" },
  { title: "Schedule", route: "/schedule" },
  { title: "Support", route: "/support" },
  { title: "Tutors", route: "/tutors" },
];

const STUDY_GROUPS = [
  {
    title: "AP Calculus BC Study Group",
    schedule: "Saturdays at 10:00 AM",
  },
  {
    title: "SAT Math Prep",
    schedule: "Wednesdays at 4:00 PM",
  },
];

const TUTORS = [
  {
    name: "Sarah Johnson",
    subjects: "Calculus, Statistics, Differential Equations",
    price: 52,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
  },
  {
    name: "Priya Patel",
    subjects: "Linear Algebra, Geometry, Discrete Math",
    price: 35,
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&h=200&fit=crop",
  },
  {
    name: "Michael Chen",
    subjects: "Algebra, Trigonometry, SAT Math",
    price: 29,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
  },
  {
    name: "Emma Rodriguez",
    subjects: "Precalculus, Geometry, Algebra",
    price: 42,
    image: "https://images.unsplash.com/photo-1591084728795-1149f32d9866?w=200&h=200&fit=crop",
  },
  {
    name: "Alex Thompson",
    subjects: "AP Calculus, Physics, Advanced Math",
    price: 38,
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop",
  },
];

const QUIZZES = [
  { title: "Algebra Basics", slug: "algebra-basics" },
  { title: "Geometry Proofs", slug: "geometry-proofs" },
  { title: "Calculus: Derivatives", slug: "calculus-derivatives" },
  { title: "Trigonometry Fundamentals", slug: "trigonometry-fundamentals" },
  { title: "Fractions & Percentages", slug: "fractions-percentages" },
  { title: "Linear Functions", slug: "linear-functions" },
  { title: "Quadratic Equations", slug: "quadratic-equations" },
  { title: "Circles & Area", slug: "circles-area" },
  { title: "Sequences & Series", slug: "sequences-series" },
  { title: "Statistics Basics", slug: "statistics-basics" },
  { title: "Polynomial Operations", slug: "polynomial-operations" },
  { title: "Number Systems", slug: "number-systems" },
];

const getIsLoggedIn = () => {
  const session = localStorage.getItem("mm_session");
  const isLoggedInFlag = localStorage.getItem("isLoggedIn");
  return !!session || isLoggedInFlag === "true";
};

const getUserName = () => {
  try {
    const profile = JSON.parse(localStorage.getItem("mm_profile") || "null");
    if (profile?.username) return profile.username;
    if (profile?.firstName || profile?.lastName) {
      return `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim() || "User";
    }
  } catch {
    return "User";
  }
  return "User";
};

const formatDate = (date: Date): string => {
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
};

const resolveDate = (input?: string) => {
  if (!input) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }
  const parsed = new Date(input);
  if (!Number.isNaN(parsed.getTime())) return parsed;
  const fallback = new Date();
  fallback.setDate(fallback.getDate() + 1);
  return fallback;
};

const normalizeTime = (time?: string) => {
  return time && time.trim() ? time : "3:00 PM";
};

const normalizeDuration = (duration?: string) => {
  if (!duration) return "1 hour";
  const cleaned = duration.toLowerCase();
  if (cleaned.includes("1.5") || cleaned.includes("90")) return "1.5 hours";
  if (cleaned.includes("2")) return "2 hours";
  return "1 hour";
};

export function AIAssistant() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi! I can navigate, book sessions, add schedule items, join study groups, and post in the community. What would you like to do?",
    },
  ]);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const context = useMemo(
    () => ({
      currentPath: pathname,
      pages: PAGES,
      studyGroups: STUDY_GROUPS,
      tutors: TUTORS.map((tutor) => ({ name: tutor.name, subjects: tutor.subjects })),
      quizzes: QUIZZES,
    }),
    [pathname]
  );

  useEffect(() => {
    if (!isOpen) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [isOpen, messages, isLoading]);

  const addMessage = (message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  };

  const performAction = async (action: AssistantAction) => {
    if (!action || action.type === "none") return;

    if (action.type === "navigate") {
      const route = action.data?.route;
      if (!route) return;
      router.push(route);
      return;
    }

    if (action.type === "start_quiz") {
      const slug = action.data?.slug;
      if (!slug) return;
      const difficulty = action.data?.difficulty ? `?difficulty=${action.data.difficulty}` : "";
      router.push(`/resources/quiz/${slug}${difficulty}`);
      return;
    }

    if (action.type === "join_group" || action.type === "leave_group") {
      if (!getIsLoggedIn()) {
        router.push("/auth?redirect=/schedule");
        return;
      }
      const groupTitle = action.data?.groupTitle;
      if (!groupTitle) return;
      const stored = localStorage.getItem("mm_joined_groups");
      const groups = stored ? JSON.parse(stored) : [];
      const nextGroups =
        action.type === "join_group"
          ? Array.from(new Set([...groups, groupTitle]))
          : groups.filter((title: string) => title !== groupTitle);
      localStorage.setItem("mm_joined_groups", JSON.stringify(nextGroups));
      window.dispatchEvent(new Event("mm_groups_updated"));
      return;
    }

    if (action.type === "book_session") {
      if (!getIsLoggedIn()) {
        router.push("/auth?redirect=/tutors&action=book");
        return;
      }

      const { tutorName, subject, date, time, duration } = action.data || {};
      let tutor = TUTORS.find((item) => item.name.toLowerCase() === (tutorName || "").toLowerCase());
      if (!tutor && subject) {
        tutor = TUTORS.find((item) => item.subjects.toLowerCase().includes(subject.toLowerCase()));
      }
      if (!tutor) tutor = TUTORS[0];

      const bookingDate = resolveDate(date);
      const booking = {
        id: Date.now().toString(),
        tutorName: tutor.name,
        tutorImage: tutor.image,
        subjects: tutor.subjects,
        date: formatDate(bookingDate),
        time: normalizeTime(time),
        duration: normalizeDuration(duration),
        price: tutor.price,
        status: "confirmed",
      };

      const saved = localStorage.getItem("mm_booked_sessions");
      const sessions = saved ? JSON.parse(saved) : [];
      sessions.push(booking);
      localStorage.setItem("mm_booked_sessions", JSON.stringify(sessions));
      window.dispatchEvent(new Event("mm_booked_sessions_updated"));
      return;
    }

    if (action.type === "add_schedule_item") {
      if (!getIsLoggedIn()) {
        router.push("/auth?redirect=/schedule");
        return;
      }
      const title = action.data?.title?.trim();
      if (!title) return;
      const itemDate = resolveDate(action.data?.date);
      const item = {
        id: Date.now().toString(),
        title,
        date: itemDate.toISOString(),
        time: normalizeTime(action.data?.time),
        type: action.data?.type || "session",
      };
      const saved = localStorage.getItem("mm_custom_schedule_items");
      const items = saved ? JSON.parse(saved) : [];
      items.push(item);
      localStorage.setItem("mm_custom_schedule_items", JSON.stringify(items));
      window.dispatchEvent(new Event("mm_custom_schedule_updated"));
      return;
    }

    if (action.type === "add_goal") {
      if (!getIsLoggedIn()) {
        router.push("/auth?redirect=/dashboard");
        return;
      }
      const title = action.data?.title?.trim();
      if (!title) return;
      const target = action.data?.target && action.data.target > 0 ? action.data.target : 10;
      const newGoal = {
        title,
        status: "in_progress",
        progress: 0,
        label: `0/${target}`,
        target,
        completed: 0,
      };
      const saved = localStorage.getItem("mm_goals");
      const goals = saved ? JSON.parse(saved) : [];
      const updatedGoals = [newGoal, ...goals];
      localStorage.setItem("mm_goals", JSON.stringify(updatedGoals));
      window.dispatchEvent(new Event("mm_goals_updated"));
      return;
    }

    if (action.type === "create_post") {
      const title = action.data?.title?.trim();
      const body = action.data?.body?.trim();
      if (!title || !body) return;
      const tag = action.data?.tag || "Other";
      const post = {
        id: `p_${Date.now()}`,
        title,
        body,
        tag,
        author: getIsLoggedIn() ? getUserName() : "Guest",
        createdAt: new Date().toISOString(),
      };
      const saved = localStorage.getItem("mm_forum_posts");
      const posts = saved ? JSON.parse(saved) : [];
      const updatedPosts = [...posts, post];
      localStorage.setItem("mm_forum_posts", JSON.stringify(updatedPosts));
      window.dispatchEvent(new Event("mm_forum_posts_updated"));
      return;
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    setError("");
    const userMessage = input.trim();
    setInput("");
    addMessage({ role: "user", content: userMessage });
    setIsLoading(true);

    try {
      const history = messages.slice(-6).map((message) => ({
        role: message.role,
        content: message.content,
      }));
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          context,
          history,
        }),
      });
      const data = (await response.json()) as AssistantResponse;
      if (!response.ok) {
        setError(data?.reply || "Something went wrong.");
      } else {
        addMessage({ role: "assistant", content: data.reply });
        await performAction(data.action);
      }
    } catch (err) {
      setError("Unable to reach the assistant. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-24 right-6 md:bottom-6 z-[200]">
        <Button
          aria-label="Open AI assistant"
          onClick={() => setIsOpen(true)}
          className="rounded-full h-14 w-14 p-0 shadow-xl"
        >
          <Bot className="w-6 h-6" />
        </Button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[210] flex items-end md:items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-950 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg, var(--theme-primary), var(--theme-primary-light))" }}>
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">MathMaster Assistant</p>
                  <p className="text-base font-semibold text-slate-900 dark:text-white">Ask me to do things</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[55vh] overflow-y-auto px-5 py-4 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      message.role === "user"
                        ? "bg-[var(--theme-primary)] text-white"
                        : "bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-200"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl px-4 py-3 text-sm bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-300">
                    Thinking...
                  </div>
                </div>
              )}
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-xs">
                  {error}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
              <div className="flex items-center gap-3">
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Ask me to book, add, or navigate..."
                  className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]"
                />
                <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
                  <Send className="w-4 h-4" />
                  Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
