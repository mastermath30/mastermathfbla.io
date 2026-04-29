/**
 * =========================================================================
 * AIMathTutor (AI Agent) — Frontend chat component
 * =========================================================================
 *
 * HOW THE FRONTEND TALKS TO THE BACKEND
 * ─────────────────────────────────────────────────────────────────────────
 *
 *  1. The env var NEXT_PUBLIC_API_URL controls WHERE requests go.
 *
 *     • If set (e.g. "https://mathmaster.vercel.app"):
 *       requests go to  https://mathmaster.vercel.app/api/ai
 *       → This is how teammates WITHOUT the API key run locally.
 *         They just point at the hosted backend.
 *
 *     • If empty / unset:
 *       requests go to  /api/ai  (same-origin, i.e. the local Next.js server)
 *       → This is how the deployed app works (frontend + backend on
 *         the same Vercel instance).
 *
 *  2. The frontend NEVER sees the Claude (Anthropic) API key.
 *     The key lives only in the backend's server environment.
 *
 * =========================================================================
 */

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import katex from "katex";
import "katex/dist/katex.min.css";
import { useTranslations } from "./LanguageProvider";
import {
  Brain,
  Send,
  X,
  Sparkles,
  Lightbulb,
  BookOpen,
  RefreshCw,
  Copy,
  Check,
  History,
  Navigation,
  Users,
  Info,
  HelpCircle,
} from "lucide-react";

// ── Backend URL ───────────────────────────────────────────────────────────
// NEXT_PUBLIC_* vars are inlined into the client bundle at build time.
// When empty, requests fall back to the same origin (production default).
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ConversationHistory {
  id: string;
  title: string;
  preview: string;
  timestamp: Date;
  messages: Message[];
}

type OpenAITutorEventDetail = {
  prompt?: string;
  autoSend?: boolean;
};

const MATH_TOPICS = [
  { label: "Algebra", icon: "\u{1F522}", examples: ["Solve 2x + 5 = 15", "Factor x\u00B2 - 9"] },
  { label: "Calculus", icon: "\u222B", examples: ["Find derivative of x\u00B3", "Integrate sin(x)"] },
  { label: "Geometry", icon: "\u{1F4D0}", examples: ["Area of circle r=5", "Pythagorean theorem"] },
  { label: "Statistics", icon: "\u{1F4CA}", examples: ["Mean of 5,7,9,11", "Standard deviation"] },
  { label: "Trigonometry", icon: "\u{1F4CF}", examples: ["sin(30\u00B0)", "cos\u00B2\u03B8 + sin\u00B2\u03B8"] },
  { label: "Linear Algebra", icon: "\u{1F532}", examples: ["Matrix multiplication", "Find determinant"] },
];

const QUICK_PROMPTS = [
  { label: "Explain step-by-step", icon: BookOpen, prompt: "Explain this step-by-step: " },
  { label: "Give me a hint", icon: Lightbulb, prompt: "Give me a hint for solving: " },
  { label: "Check my work", icon: Check, prompt: "Check if my answer is correct: " },
  { label: "Similar problems", icon: RefreshCw, prompt: "Give me 3 similar practice problems to: " },
];

const NAVIGATION_PROMPTS = [
  { label: "Find a tutor", icon: Users, prompt: "I want to find a tutor to help me" },
  { label: "Browse resources", icon: BookOpen, prompt: "Show me learning resources and practice materials" },
  { label: "About MathMaster", icon: Info, prompt: "Tell me about MathMaster and your team" },
  { label: "Get help", icon: HelpCircle, prompt: "I need help using the website" },
];

// Valid navigation paths the AI can direct users to
const VALID_PATHS = ["/", "/about", "/learn", "/resources", "/dashboard", "/schedule", "/tutors", "/community", "/study-groups", "/support", "/auth"];

const PAGE_LABELS: Record<string, string> = {
  "/": "Home",
  "/about": "About Us",
  "/learn": "Learn",
  "/resources": "Resources",
  "/dashboard": "Dashboard",
  "/schedule": "Schedule",
  "/tutors": "Tutors",
  "/community": "Community",
  "/study-groups": "Study Groups",
  "/support": "Support",
  "/auth": "Sign In",
};

export function AIMathTutor() {
  const { t } = useTranslations();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showTopics, setShowTopics] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [conversations, setConversations] = useState<ConversationHistory[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Extract [NAVIGATE:/path] commands from AI response
  const extractNavigation = useCallback((content: string): { cleanContent: string; path: string | null } => {
    const navMatch = content.match(/\[NAVIGATE:(\/[^\]]*)\]/);
    if (navMatch && VALID_PATHS.includes(navMatch[1])) {
      const cleanContent = content.replace(/\[NAVIGATE:\/[^\]]*\]/g, "").trim();
      return { cleanContent, path: navMatch[1] };
    }
    return { cleanContent: content, path: null };
  }, []);

  // Handle navigation to a page
  const navigateToPage = useCallback((path: string) => {
    setIsOpen(false);
    setPendingNavigation(null);
    router.push(path);
  }, [router]);

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

  const sendText = useCallback(
    async (messageText: string) => {
      if (!messageText.trim() || isLoading) return;

      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: messageText.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setShowTopics(false);
      setIsLoading(true);

      try {
        const history = messages.slice(-10).map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const response = await fetch(`${API_BASE}/api/ai`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            message: userMessage.content,
            history,
          }),
        });

        const data = await response.json();
        const rawReply = data.reply || t("I could not generate a response. Please try again.");
        const { cleanContent, path } = extractNavigation(rawReply);

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: cleanContent,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);

        if (path) {
          setPendingNavigation(path);
        }
      } catch {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: t("Sorry, I encountered an error. Please try again."),
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [extractNavigation, isLoading, messages, t]
  );

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const messageText = input.trim();
    setInput("");
    await sendText(messageText);
  };

  useEffect(() => {
    const onOpenAITutor = (event: Event) => {
      const customEvent = event as CustomEvent<OpenAITutorEventDetail>;
      const prompt = customEvent.detail?.prompt?.trim() ?? "";
      const autoSend = Boolean(customEvent.detail?.autoSend);

      setIsOpen(true);
      setShowHistory(false);

      if (!prompt) return;

      if (autoSend) {
        setInput("");
        void sendText(prompt);
        return;
      }

      setInput(prompt);
      window.setTimeout(() => inputRef.current?.focus(), 120);
    };

    window.addEventListener("open-ai-tutor", onOpenAITutor as EventListener);
    return () => window.removeEventListener("open-ai-tutor", onOpenAITutor as EventListener);
  }, [sendText]);

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
      const title = messages[0]?.content.slice(0, 50) || t("Conversation");
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
    const displayBlocks: string[] = [];
    const inlineBlocks: string[] = [];
    const singleDollarBlocks: string[] = [];

    const renderLatex = (tex: string, displayMode: boolean): string => {
      try {
        return katex.renderToString(tex.trim(), {
          displayMode,
          throwOnError: false,
          output: "html",
          strict: false,
        });
      } catch {
        return `<span class="text-red-600 dark:text-red-400">${escapeHtml(tex)}</span>`;
      }
    };

    const escapeHtml = (s: string) =>
      s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

    // 1) Display math $$...$$ (must run first so $$ is consumed)
    let out = content.replace(/\$\$([\s\S]*?)\$\$/g, (_, tex) => {
      const html = renderLatex(tex, true);
      displayBlocks.push(`<div class="my-2 overflow-x-auto">${html}</div>`);
      return `__MATH_D_${displayBlocks.length - 1}__`;
    });

    // 2) Single-$ inline math $...$ (e.g. $\frac{d}{dx}[x^n] = nx^{n-1}$)
    out = out.replace(/\$([^$\n]+)\$/g, (_, tex) => {
      singleDollarBlocks.push(renderLatex(tex, false));
      return `__MATH_S_${singleDollarBlocks.length - 1}__`;
    });

    // 3) Paren inline math \(...\)
    out = out.replace(/\\\(([\s\S]*?)\\\)/g, (_, tex) => {
      inlineBlocks.push(renderLatex(tex, false));
      return `__MATH_I_${inlineBlocks.length - 1}__`;
    });

    // Markdown-like formatting
    out = out
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/`([^`]+)`/g, '<code class="rounded-md border border-white/10 bg-white/8 px-1.5 py-0.5 text-sm text-violet-100">$1</code>')
      .replace(/```([\s\S]*?)```/g, '<pre class="my-2 overflow-x-auto rounded-xl border border-white/10 bg-slate-950/80 p-3 text-sm text-slate-100"><code>$1</code></pre>')
      .replace(/\n/g, "<br />");

    // Restore rendered math
    out = out.replace(/__MATH_D_(\d+)__/g, (_, i) => displayBlocks[Number(i)] ?? "");
    out = out.replace(/__MATH_S_(\d+)__/g, (_, i) => singleDollarBlocks[Number(i)] ?? "");
    out = out.replace(/__MATH_I_(\d+)__/g, (_, i) => inlineBlocks[Number(i)] ?? "");

    return out;
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="hidden md:flex fixed md:bottom-6 right-[5.25rem] lg:right-[5.75rem] z-[88] h-14 w-14 items-center justify-center rounded-full border border-violet-300/20 bg-gradient-to-br from-violet-600 via-violet-600 to-indigo-600 shadow-[0_16px_32px_rgba(76,29,149,0.38)] hover:scale-110 active:scale-95 transition-transform focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 touch-manipulation"
        aria-label="Open AI Agent"
        title="AI Agent (Alt+M)"
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
              className="fixed inset-4 z-[201] flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(30,41,59,0.98)_0%,rgba(15,23,42,0.98)_18%,rgba(2,6,23,0.985)_100%)] shadow-[0_32px_90px_rgba(2,6,23,0.65)] md:inset-auto md:left-1/2 md:top-1/2 md:h-[600px] md:w-[700px] md:-translate-x-1/2 md:-translate-y-1/2"
            >
              {/* Header */}
              <div className="relative flex items-center justify-between border-b border-white/10 bg-[linear-gradient(180deg,rgba(76,29,149,0.28)_0%,rgba(30,41,59,0.86)_58%,rgba(15,23,42,0.96)_100%)] px-4 py-4 text-white">
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-violet-300/35 to-transparent" />
                <div className="flex items-center gap-3">
                  <div className="rounded-lg border border-white/10 bg-white/8 p-2 shadow-[0_8px_20px_rgba(15,23,42,0.25)]">
                    <Brain className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg">{t("AI Agent")}</h2>
                    <p className="text-xs text-slate-300">{t("Powered by MathMaster AI")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="rounded-lg border border-transparent p-2 text-slate-200 transition-colors hover:border-white/10 hover:bg-white/8 hover:text-white"
                    title={t("Conversation History")}
                  >
                    <History className="w-5 h-5" />
                  </button>
                  <button
                    onClick={clearChat}
                    className="rounded-lg border border-transparent p-2 text-slate-200 transition-colors hover:border-white/10 hover:bg-white/8 hover:text-white"
                    title={t("New Chat")}
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="rounded-lg border border-transparent p-2 text-slate-200 transition-colors hover:border-white/10 hover:bg-white/8 hover:text-white"
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
                    className="overflow-hidden border-b border-white/10"
                  >
                    <div className="max-h-40 overflow-y-auto bg-slate-950/45 px-3 py-3">
                      {conversations.length === 0 ? (
                        <p className="py-2 text-center text-sm text-slate-400">{t("No conversation history")}</p>
                      ) : (
                        <div className="space-y-2">
                          {conversations.map((conv) => (
                            <button
                              key={conv.id}
                              onClick={() => loadConversation(conv)}
                              className="w-full rounded-xl border border-white/8 bg-white/[0.04] p-3 text-left transition-colors hover:bg-white/[0.07]"
                            >
                              <p className="truncate text-sm font-medium text-slate-100">{conv.title}</p>
                              <p className="truncate text-xs text-slate-400">{conv.preview}</p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Messages */}
              <div className="flex-1 space-y-4 overflow-y-auto bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.10),transparent_28%),linear-gradient(180deg,rgba(15,23,42,0.18)_0%,rgba(2,6,23,0)_100%)] p-4">
                {showTopics && messages.length === 0 && (
                  <div className="space-y-6">
                    {/* Welcome */}
                    <div className="text-center py-4">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-violet-300/20 bg-gradient-to-br from-violet-600/95 to-indigo-600/90 shadow-[0_14px_30px_rgba(76,29,149,0.35)]">
                        <Sparkles className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="mb-2 text-xl font-bold text-white">
                        {t("Hi! I'm your MathMaster AI Agent")}
                      </h3>
                      <p className="text-slate-300">
                        {t("I can solve math problems, navigate you around the site, and answer questions about MathMaster!")}
                      </p>
                    </div>

                    {/* Quick Prompts */}
                    <div>
                      <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{t("QUICK ACTIONS")}</p>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {QUICK_PROMPTS.map((qp) => (
                          <button
                            key={qp.label}
                            onClick={() => handleQuickPrompt(qp.prompt)}
                            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-left transition-colors hover:bg-white/[0.07]"
                          >
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-violet-300/15 bg-violet-500/12 text-violet-200">
                              <qp.icon className="w-4 h-4" />
                            </span>
                            <span className="text-sm text-slate-200">{t(qp.label)}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Navigation & Website Actions */}
                    <div>
                      <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{t("EXPLORE & NAVIGATE")}</p>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {NAVIGATION_PROMPTS.map((np) => (
                          <button
                            key={np.label}
                            onClick={() => handleQuickPrompt(np.prompt)}
                            className="flex items-center gap-2 rounded-xl border border-violet-400/20 bg-violet-500/10 p-3 text-left transition-colors hover:bg-violet-500/14"
                          >
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-violet-300/20 bg-violet-500/14 text-violet-100">
                              <np.icon className="w-4 h-4" />
                            </span>
                            <span className="text-sm text-slate-200">{t(np.label)}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Topics */}
                    <div>
                      <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{t("MATH TOPICS")}</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {MATH_TOPICS.map((topic) => (
                          <div
                            key={topic.label}
                            className="rounded-xl border border-white/10 bg-white/[0.04] p-3"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-lg">{topic.icon}</span>
                              <span className="text-sm font-medium text-slate-100">{t(topic.label)}</span>
                            </div>
                            <div className="space-y-1">
                              {topic.examples.map((ex) => (
                                <button
                                  key={ex}
                                  onClick={() => handleTopicExample(ex)}
                                  className="block w-full truncate text-left text-xs text-violet-200 transition-colors hover:text-violet-100 hover:underline"
                                >
                                  &quot;{ex}&quot;
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
                          ? "border border-violet-300/20 bg-gradient-to-br from-violet-600 via-violet-600 to-indigo-600 text-white shadow-[0_14px_30px_rgba(76,29,149,0.28)]"
                          : "border border-white/10 bg-white/[0.05] text-slate-100 backdrop-blur-sm"
                      }`}
                    >
                      <div
                        className="text-sm leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }}
                      />
                      {msg.role === "assistant" && (
                        <div className="mt-3 flex items-center gap-2 border-t border-white/10 pt-2">
                          <button
                            onClick={() => copyToClipboard(msg.content, msg.id)}
                            className="flex items-center gap-1 text-xs text-slate-400 transition-colors hover:text-slate-200"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3 h-3" /> {t("Copied")}
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" /> {t("Copy")}
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Navigation Button */}
                {pendingNavigation && !isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <button
                      onClick={() => navigateToPage(pendingNavigation)}
                      className="flex items-center gap-2 rounded-xl border border-violet-300/20 bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 font-medium text-white shadow-[0_14px_28px_rgba(76,29,149,0.28)] transition-opacity hover:opacity-90"
                    >
                      <Navigation className="w-4 h-4" />
                      {t("Go to")} {t(PAGE_LABELS[pendingNavigation] || pendingNavigation)}
                    </button>
                  </motion.div>
                )}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 animate-bounce rounded-full bg-violet-300" style={{ animationDelay: "0ms" }} />
                        <div className="h-2 w-2 animate-bounce rounded-full bg-violet-300" style={{ animationDelay: "150ms" }} />
                        <div className="h-2 w-2 animate-bounce rounded-full bg-violet-300" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.86)_0%,rgba(2,6,23,0.96)_100%)] p-4">
                <div className="flex gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
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
                    placeholder={t("Ask me anything...")}
                    className="flex-1 resize-none rounded-xl border border-transparent bg-transparent px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-400/60"
                    rows={1}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="flex items-center gap-2 rounded-xl border border-violet-300/20 bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <p className="mt-2 text-center text-xs text-slate-500">
                  {t("Press Enter to send • Shift+Enter for new line")}
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
