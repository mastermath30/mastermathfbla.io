"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Send,
  X,
  Sparkles,
  Lightbulb,
  BookOpen,
  Calculator,
  RefreshCw,
  Copy,
  Check,
  ChevronDown,
  Zap,
  MessageSquare,
  History,
  Trash2,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface ConversationHistory {
  id: string;
  title: string;
  preview: string;
  timestamp: Date;
  messages: Message[];
}

const MATH_TOPICS = [
  { label: "Algebra", icon: "🔢", examples: ["Solve 2x + 5 = 15", "Factor x² - 9"] },
  { label: "Calculus", icon: "∫", examples: ["Find derivative of x³", "Integrate sin(x)"] },
  { label: "Geometry", icon: "📐", examples: ["Area of circle r=5", "Pythagorean theorem"] },
  { label: "Statistics", icon: "📊", examples: ["Mean of 5,7,9,11", "Standard deviation"] },
  { label: "Trigonometry", icon: "📏", examples: ["sin(30°)", "cos²θ + sin²θ"] },
  { label: "Linear Algebra", icon: "🔲", examples: ["Matrix multiplication", "Find determinant"] },
];

const QUICK_PROMPTS = [
  { label: "Explain step-by-step", icon: BookOpen, prompt: "Explain this step-by-step: " },
  { label: "Give me a hint", icon: Lightbulb, prompt: "Give me a hint for solving: " },
  { label: "Check my work", icon: Check, prompt: "Check if my answer is correct: " },
  { label: "Similar problems", icon: RefreshCw, prompt: "Give me 3 similar practice problems to: " },
];

// Simulated AI responses for math problems
const generateMathResponse = (question: string): string => {
  const lowerQ = question.toLowerCase();
  
  // Equation solving
  if (lowerQ.includes("solve") || lowerQ.includes("find x")) {
    if (lowerQ.includes("2x") && lowerQ.includes("5") && lowerQ.includes("15")) {
      return `**Solving 2x + 5 = 15**

Let me walk you through this step-by-step:

**Step 1:** Subtract 5 from both sides
\`\`\`
2x + 5 - 5 = 15 - 5
2x = 10
\`\`\`

**Step 2:** Divide both sides by 2
\`\`\`
2x ÷ 2 = 10 ÷ 2
x = 5
\`\`\`

**Answer: x = 5** ✓

**Verification:** 2(5) + 5 = 10 + 5 = 15 ✓

💡 **Tip:** Always verify your answer by substituting it back into the original equation!`;
    }
    return `I'll help you solve this equation!

**General approach for solving equations:**

1. **Simplify** both sides if needed
2. **Isolate** the variable by performing inverse operations
3. **Check** your answer by substituting back

Could you share the specific equation you'd like me to solve? I'll provide a detailed step-by-step solution!`;
  }
  
  // Derivatives
  if (lowerQ.includes("derivative") || lowerQ.includes("differentiate")) {
    if (lowerQ.includes("x³") || lowerQ.includes("x^3") || lowerQ.includes("x cubed")) {
      return `**Finding the Derivative of x³**

Using the **Power Rule**: If f(x) = xⁿ, then f'(x) = n·xⁿ⁻¹

**Step 1:** Identify n = 3

**Step 2:** Apply the power rule
\`\`\`
f(x) = x³
f'(x) = 3·x³⁻¹
f'(x) = 3x²
\`\`\`

**Answer: f'(x) = 3x²** ✓

📚 **Power Rule Summary:**
- Bring the exponent down as a coefficient
- Subtract 1 from the exponent

**Practice:** Try finding the derivative of x⁵!`;
    }
    return `I'll help you find the derivative!

**Key differentiation rules:**

1. **Power Rule:** d/dx[xⁿ] = n·xⁿ⁻¹
2. **Constant Rule:** d/dx[c] = 0
3. **Sum Rule:** d/dx[f + g] = f' + g'
4. **Product Rule:** d/dx[f·g] = f'g + fg'
5. **Chain Rule:** d/dx[f(g(x))] = f'(g(x))·g'(x)

What function would you like me to differentiate?`;
  }
  
  // Integration
  if (lowerQ.includes("integrate") || lowerQ.includes("integral") || lowerQ.includes("antiderivative")) {
    return `**Integration Basics**

Integration is the reverse of differentiation!

**Common integrals:**
- ∫xⁿ dx = (xⁿ⁺¹)/(n+1) + C (n ≠ -1)
- ∫sin(x) dx = -cos(x) + C
- ∫cos(x) dx = sin(x) + C
- ∫eˣ dx = eˣ + C

**Remember:** Don't forget the constant of integration (+ C)!

What function would you like me to integrate? I'll show you the complete solution!`;
  }
  
  // Factoring
  if (lowerQ.includes("factor")) {
    if (lowerQ.includes("x²") && lowerQ.includes("9")) {
      return `**Factoring x² - 9**

This is a **difference of squares**!

**Pattern:** a² - b² = (a + b)(a - b)

**Step 1:** Identify a² = x² and b² = 9
- a = x
- b = 3 (since 3² = 9)

**Step 2:** Apply the formula
\`\`\`
x² - 9 = (x + 3)(x - 3)
\`\`\`

**Answer: (x + 3)(x - 3)** ✓

**Verification:** (x + 3)(x - 3) = x² - 3x + 3x - 9 = x² - 9 ✓

💡 **Tip:** Look for patterns like difference of squares, perfect square trinomials, or common factors!`;
    }
    return `I'll help you factor this expression!

**Common factoring techniques:**

1. **GCF (Greatest Common Factor):** Factor out common terms
2. **Difference of Squares:** a² - b² = (a + b)(a - b)
3. **Trinomial:** x² + bx + c = (x + p)(x + q) where p·q = c and p + q = b
4. **Grouping:** For 4-term expressions

What expression would you like me to factor?`;
  }
  
  // Quadratic formula
  if (lowerQ.includes("quadratic")) {
    return `**The Quadratic Formula**

For equations in the form **ax² + bx + c = 0**:

\`\`\`
x = (-b ± √(b² - 4ac)) / (2a)
\`\`\`

**The Discriminant (b² - 4ac) tells us:**
- If > 0: Two real solutions
- If = 0: One real solution (repeated)
- If < 0: No real solutions (complex numbers)

**Example:** Solve x² + 5x + 6 = 0
- a = 1, b = 5, c = 6
- x = (-5 ± √(25-24)) / 2
- x = (-5 ± 1) / 2
- x = -2 or x = -3

Would you like me to solve a specific quadratic equation?`;
  }
  
  // Area/Geometry
  if (lowerQ.includes("area") || lowerQ.includes("circle") || lowerQ.includes("triangle")) {
    return `**Geometry Formulas** 📐

**Circle:**
- Area = πr²
- Circumference = 2πr

**Triangle:**
- Area = ½ × base × height
- Pythagorean theorem: a² + b² = c²

**Rectangle:**
- Area = length × width
- Perimeter = 2(l + w)

**Example:** Circle with radius 5
- Area = π(5)² = 25π ≈ 78.54 square units

What specific geometry problem can I help you with?`;
  }
  
  // Statistics
  if (lowerQ.includes("mean") || lowerQ.includes("average") || lowerQ.includes("standard deviation")) {
    return `**Statistics Basics** 📊

**Mean (Average):**
Sum of all values ÷ Number of values

**Example:** Mean of 5, 7, 9, 11
- Sum = 5 + 7 + 9 + 11 = 32
- Mean = 32 ÷ 4 = **8**

**Standard Deviation:**
1. Find the mean
2. Subtract mean from each value, square the result
3. Find mean of squared differences
4. Take the square root

**Median:** Middle value when sorted
**Mode:** Most frequent value

What statistical calculation can I help with?`;
  }
  
  // Default helpful response
  return `Great question! I'm here to help you with math! 🧮

**I can help you with:**
- 📝 Solving equations step-by-step
- 📐 Geometry problems and proofs
- ∫ Calculus (derivatives & integrals)
- 📊 Statistics and probability
- 🔢 Algebra and factoring
- 📏 Trigonometry

**Tips for asking:**
- Be specific about what you need help with
- Show your work so far if you're stuck
- Ask for hints if you want to try yourself first

What math problem can I help you solve today?`;
};

export function AIMathTutor() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showTopics, setShowTopics] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [conversations, setConversations] = useState<ConversationHistory[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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

    // Simulate AI thinking delay
    setTimeout(() => {
      const response = generateMathResponse(userMessage.content);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000 + Math.random() * 1000);
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
        aria-label="Open AI Math Tutor"
        title="AI Math Tutor (Alt+M)"
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
                    <h2 className="font-bold text-lg">AI Math Tutor</h2>
                    <p className="text-xs text-white/80">Powered by MasterMath AI</p>
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
                        Hi! I'm your AI Math Tutor 👋
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400">
                        Ask me any math question and I'll explain it step-by-step!
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

                    {/* Topics */}
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-2 px-1">TOPICS I CAN HELP WITH</p>
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
                                  "{ex}"
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
                    placeholder="Ask me any math question..."
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
                  Press Enter to send • Shift+Enter for new line
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
