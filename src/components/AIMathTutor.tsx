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
 *  2. The frontend NEVER sees the OpenAI API key.
 *     The key lives only in the backend's server environment.
 *
 * =========================================================================
 */

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
const VALID_PATHS = ["/", "/about", "/resources", "/dashboard", "/schedule", "/tutors", "/community", "/study-groups", "/support", "/auth"];

const PAGE_LABELS: Record<string, string> = {
  "/": "Home",
  "/about": "About Us",
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

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setShowTopics(false);
    setIsLoading(true);

    try {
      const history = messages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // Call the backend proxy — see API_BASE above for how this resolves.
      // In production: same-origin /api/ai
      // In local dev without key: points at hosted backend via NEXT_PUBLIC_API_URL
      const response = await fetch(`${API_BASE}/api/ai`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          history,
        }),
      });

      const data = await response.json();
      const rawReply = data.reply || "I could not generate a response. Please try again.";
      const { cleanContent, path } = extractNavigation(rawReply);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: cleanContent,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // If the AI suggested navigation, set it as pending
      if (path) {
        setPendingNavigation(path);
      }
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

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
      const title = messages[0]?.content.slice(0, 50) || "Conversation";
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
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code class="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-sm">$1</code>')
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-slate-200 dark:bg-slate-700 p-2 rounded my-2 overflow-x-auto text-sm"><code>$1</code></pre>')
      .replace(/\n/g, '<br />');
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 md:bottom-6 right-[84px] z-[88] w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 touch-manipulation"
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
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[700px] md:h-[600px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl z-[201] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-violet-500 to-purple-600 text-white">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Brain className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg">AI Agent</h2>
                    <p className="text-xs text-white/80">Powered by MathMaster AI</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                    title="Conversation History"
                  >
                    <History className="w-5 h-5" />
                  </button>
                  <button
                    onClick={clearChat}
                    className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                    title="New Chat"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-lg hover:bg-white/20 transition-colors"
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
                    className="border-b border-slate-200 dark:border-slate-700 overflow-hidden"
                  >
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 max-h-40 overflow-y-auto">
                      {conversations.length === 0 ? (
                        <p className="text-sm text-slate-500 text-center py-2">No conversation history</p>
                      ) : (
                        <div className="space-y-2">
                          {conversations.map((conv) => (
                            <button
                              key={conv.id}
                              onClick={() => loadConversation(conv)}
                              className="w-full text-left p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{conv.title}</p>
                              <p className="text-xs text-slate-500 truncate">{conv.preview}</p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {showTopics && messages.length === 0 && (
                  <div className="space-y-6">
                    {/* Welcome */}
                    <div className="text-center py-4">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                        Hi! I&apos;m your MathMaster AI Agent
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400">
                        I can solve math problems, navigate you around the site, and answer questions about MathMaster!
                      </p>
                    </div>

                    {/* Quick Prompts */}
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-2 px-1">QUICK ACTIONS</p>
                      <div className="grid grid-cols-2 gap-2">
                        {QUICK_PROMPTS.map((qp) => (
                          <button
                            key={qp.label}
                            onClick={() => handleQuickPrompt(qp.prompt)}
                            className="flex items-center gap-2 p-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-left"
                          >
                            <qp.icon className="w-4 h-4 text-violet-500" />
                            <span className="text-sm text-slate-700 dark:text-slate-300">{qp.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Navigation & Website Actions */}
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-2 px-1">EXPLORE & NAVIGATE</p>
                      <div className="grid grid-cols-2 gap-2">
                        {NAVIGATION_PROMPTS.map((np) => (
                          <button
                            key={np.label}
                            onClick={() => handleQuickPrompt(np.prompt)}
                            className="flex items-center gap-2 p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors text-left border border-purple-200 dark:border-purple-800"
                          >
                            <np.icon className="w-4 h-4 text-purple-500" />
                            <span className="text-sm text-slate-700 dark:text-slate-300">{np.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Topics */}
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-2 px-1">MATH TOPICS</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {MATH_TOPICS.map((topic) => (
                          <div
                            key={topic.label}
                            className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-lg">{topic.icon}</span>
                              <span className="font-medium text-slate-900 dark:text-white text-sm">{topic.label}</span>
                            </div>
                            <div className="space-y-1">
                              {topic.examples.map((ex) => (
                                <button
                                  key={ex}
                                  onClick={() => handleTopicExample(ex)}
                                  className="block w-full text-left text-xs text-violet-600 dark:text-violet-400 hover:underline truncate"
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
                          ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                      }`}
                    >
                      <div
                        className="text-sm leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }}
                      />
                      {msg.role === "assistant" && (
                        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                          <button
                            onClick={() => copyToClipboard(msg.content, msg.id)}
                            className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3 h-3" /> Copied
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" /> Copy
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
                      className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium hover:opacity-90 transition-opacity shadow-lg"
                    >
                      <Navigation className="w-4 h-4" />
                      Go to {PAGE_LABELS[pendingNavigation] || pendingNavigation}
                    </button>
                  </motion.div>
                )}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                <div className="flex gap-2">
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
                    placeholder="Ask me anything..."
                    className="flex-1 resize-none rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    rows={1}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="px-4 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-2 text-center">
                  Press Enter to send &bull; Shift+Enter for new line
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
