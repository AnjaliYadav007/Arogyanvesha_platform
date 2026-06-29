"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn, generateId } from "@/lib/utils";
import { useChatStore, useAuthStore, usePrakritiStore } from "@/stores";
import { useReducedMotion } from "@/hooks";
import { Avatar } from "@/components/ui/Avatar";
import type { Message } from "@/types";

/* ─────────────────────────────────────────────────────────
   MOCK AI RESPONSES
───────────────────────────────────────────────────────── */

const MOCK_RESPONSES: Record<string, string> = {
  default: `According to Ayurvedic principles, I recommend the following approach:

**Key Recommendations:**

1. **Morning routine** — Begin with warm water and lemon to stimulate Agni (digestive fire)
2. **Diet** — Focus on foods aligned with your Prakriti constitution
3. **Herbs** — Consider Ashwagandha and Triphala as foundational herbs
4. **Yoga** — Practice gentle pranayama to balance your Dosha

> *"The body is the bow, the soul is the arrow, and Brahman is the target."* — Upanishads

**Important note:** This guidance is based on classical Ayurvedic texts. Always consult a qualified Ayurvedic practitioner for personalised medical advice.`,

  sleep: `**Ayurvedic Sleep Remedies for Vata Types:**

A restless mind and irregular sleep are classic signs of **Vata imbalance**. Here's what the classical texts recommend:

**Evening Routine (2 hours before bed):**
- Warm self-massage (Abhyanga) with sesame oil
- Drink warm **Ashwagandha milk** with cardamom and honey
- Avoid screens and stimulating activities

**Herbs for Sleep:**
- **Ashwagandha** (300mg) — adaptogenic, reduces cortisol
- **Brahmi** — calms the nervous system
- **Jatamansi** — natural sleep support

**Lifestyle adjustments:**
- Sleep before 10pm (Pitta time begins at 10pm)
- Keep your bedroom warm and dark
- Practice **Yoga Nidra** for 20 minutes before sleep

Sleep should improve within 2–3 weeks of consistent practice.`,
};

function getMockResponse(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("sleep") || lower.includes("rest")) return MOCK_RESPONSES.sleep!;
  return MOCK_RESPONSES.default!;
}

/* ─────────────────────────────────────────────────────────
   TYPING INDICATOR
───────────────────────────────────────────────────────── */

function TypingIndicator() {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="w-8 h-8 rounded-full bg-brand-burgundy flex items-center justify-center shrink-0">
        <span className="text-text-inverted text-micro font-bold">A</span>
      </div>
      <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-tl-sm bg-surface-card border border-border-default">
        <div className="w-2 h-2 rounded-full bg-dosha-vata dosha-dot-vata"/>
        <div className="w-2 h-2 rounded-full bg-dosha-pitta dosha-dot-pitta"/>
        <div className="w-2 h-2 rounded-full bg-dosha-kapha dosha-dot-kapha"/>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   MESSAGE BUBBLE
───────────────────────────────────────────────────────── */

function MessageBubble({ message, userName }: { message: Message; userName: string }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      className={cn("flex gap-3 px-4 py-2", isUser && "flex-row-reverse")}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}>

      {/* Avatar */}
      {isUser ? (
        <Avatar name={userName} size="sm" className="shrink-0 mt-1"/>
      ) : (
        <div className="w-8 h-8 rounded-full bg-brand-burgundy flex items-center justify-center shrink-0 mt-1">
          <span className="text-text-inverted text-micro font-bold">A</span>
        </div>
      )}

      {/* Content */}
      <div className={cn("flex flex-col gap-1 max-w-[78%]", isUser && "items-end")}>
        <div className={cn(
          "px-4 py-3 rounded-2xl text-body-sm leading-relaxed",
          isUser
            ? "bg-brand-burgundy text-text-inverted rounded-tr-sm"
            : "bg-surface-card border border-border-default text-text-body rounded-tl-sm",
        )}>
          {isUser ? (
            <p>{message.content}</p>
          ) : (
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                  strong: ({ children }) => <strong className="font-semibold text-text-heading">{children}</strong>,
                  ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                  li: ({ children }) => <li className="text-body-sm">{children}</li>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-brand-gold pl-3 my-2 italic text-text-muted">
                      {children}
                    </blockquote>
                  ),
                  h2: ({ children }) => <h2 className="font-bold text-text-heading text-body mb-1 mt-3 first:mt-0">{children}</h2>,
                  h3: ({ children }) => <h3 className="font-semibold text-text-heading text-body-sm mb-1 mt-2">{children}</h3>,
                }}
              >
                {message.content}
              </ReactMarkdown>
              {message.isStreaming && <span className="streaming-cursor"/>}
            </div>
          )}
        </div>

        {/* Confidence badge */}
        {!isUser && message.confidence && !message.isStreaming && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-pill bg-bg-subtle w-fit">
            <div className={cn(
              "w-1.5 h-1.5 rounded-full",
              message.confidence === "high" ? "bg-status-success" :
              message.confidence === "medium" ? "bg-status-warning" : "bg-status-error",
            )}/>
            <span className="text-micro text-text-muted font-medium capitalize">
              {message.confidence} confidence
            </span>
          </div>
        )}

        <span className="text-micro text-text-disabled px-1">
          {new Date(message.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────── */

export default function ChatConversationPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.id as string;
  const shouldReduce = useReducedMotion();
  const { user } = useAuthStore();
  const { result: prakritiResult } = usePrakritiStore();

  const {
    messages,
    conversations,
    isStreaming,
    setActiveConversation,
    setMessages,
    addMessage,
    startStreaming,
    appendStreamChunk,
    stopStreaming,
    updateConversation,
  } = useChatStore();

  const [input, setInput] = React.useState("");
  const [isTyping, setIsTyping] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  const conversation = conversations.find((c) => c.id === conversationId);

  React.useEffect(() => {
    setActiveConversation(conversationId);
    if (messages.length === 0) {
      // Welcome message
      const welcome: Message = {
        id: generateId(),
        conversationId,
        role: "assistant",
        content: prakritiResult
          ? `Namaste! 🙏 I can see you have a **${prakritiResult.primaryDosha}-${prakritiResult.secondaryDosha}** Prakriti. How can I support your wellness journey today?`
          : `Namaste! 🙏 I'm your AI Vaidya, here to guide you through the wisdom of Ayurveda. How can I help you today?\n\nIf you haven't taken the Prakriti assessment yet, I'd recommend starting there for truly personalised guidance.`,
        confidence: "high",
        createdAt: new Date().toISOString(),
      };
      setMessages([welcome]);
    }
  }, [conversationId, setActiveConversation, prakritiResult, messages.length, setMessages]);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: shouldReduce ? "auto" : "smooth" });
  }, [messages, isTyping, shouldReduce]);

  const sendMessage = async () => {
    if (!input.trim() || isStreaming) return;
    const text = input.trim();
    setInput("");

    // Add user message
    const userMsg: Message = {
      id: generateId(),
      conversationId,
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };
    addMessage(userMsg);

    // Update conversation title if first user message
    if (messages.filter((m) => m.role === "user").length === 0) {
      updateConversation(conversationId, {
        title: text.length > 50 ? text.slice(0, 50) + "…" : text,
        lastMessage: text,
      });
    }

    // Simulate streaming response
    setIsTyping(true);
    await new Promise((r) => setTimeout(r, 800));
    setIsTyping(false);

    const streamId = startStreaming();
    const response = getMockResponse(text);
    const chunks = response.split("");

    for (let i = 0; i < chunks.length; i++) {
      await new Promise((r) => setTimeout(r, 12));
      appendStreamChunk(streamId, chunks[i]!);
    }

    stopStreaming(streamId);
    updateConversation(conversationId, {
      lastMessage: response.slice(0, 80) + "…",
      updatedAt: new Date().toISOString(),
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-resize
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  return (
    <div className="flex flex-col h-[calc(100vh-var(--topnav-height))]">

      {/* Chat header */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-border-default bg-surface-card/80 backdrop-blur-sm shrink-0">
        <button type="button" onClick={() => router.push("/chat")}
          className="p-2 rounded-lg text-text-muted hover:bg-bg-subtle transition-colors lg:hidden">
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd"/>
          </svg>
        </button>

        <div className="w-9 h-9 rounded-full bg-brand-burgundy flex items-center justify-center">
          <span className="text-text-inverted text-label font-bold">A</span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-body-sm font-semibold text-text-heading truncate">
            {conversation?.title ?? "AI Vaidya"}
          </p>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-status-success"/>
            <p className="text-label text-text-muted">Online · Ayurvedic AI</p>
          </div>
        </div>

        {prakritiResult && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-gold-pale border border-brand-gold/20">
            <div className="w-2 h-2 rounded-full bg-brand-gold"/>
            <span className="text-label font-medium text-brand-gold capitalize">
              {prakritiResult.primaryDosha} type
            </span>
          </div>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto py-4">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} userName={user?.name ?? "You"}/>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}>
            <TypingIndicator/>
          </motion.div>
        )}

        <div ref={messagesEndRef}/>
      </div>

      {/* Input area */}
      <div className="shrink-0 border-t border-border-default bg-surface-card/90 backdrop-blur-sm px-4 py-4">
        {/* Suggested questions — only when few messages */}
        {messages.length <= 2 && (
          <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
            {SUGGESTED_QUESTIONS.slice(0, 4).map((q) => (
              <button key={q} type="button"
                onClick={() => { setInput(q); inputRef.current?.focus(); }}
                className={cn(
                  "shrink-0 px-3 py-1.5 rounded-pill text-body-sm font-medium",
                  "bg-bg-subtle border border-border-default text-text-muted",
                  "hover:border-brand-burgundy/40 hover:text-brand-burgundy",
                  "transition-all duration-150 whitespace-nowrap",
                )}>
                {q}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-end gap-3">
          <div className="flex-1 flex items-end gap-2 px-4 py-3 rounded-xl border border-border-default bg-bg-base focus-within:border-brand-burgundy focus-within:ring-4 focus-within:ring-brand-burgundy/8 transition-all duration-200">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Ask your AI Vaidya anything about Ayurveda…"
              rows={1}
              disabled={isStreaming}
              className={cn(
                "flex-1 resize-none bg-transparent text-body text-text-body",
                "placeholder:text-text-disabled outline-none",
                "max-h-[120px] leading-normal",
                "disabled:opacity-50",
              )}
              style={{ height: "24px" }}
              aria-label="Message input"
            />
          </div>

          <button
            type="button"
            onClick={sendMessage}
            disabled={!input.trim() || isStreaming}
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
              "transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-gold",
              input.trim() && !isStreaming
                ? "bg-brand-burgundy text-text-inverted hover:bg-brand-burgundy-light hover:-translate-y-0.5 shadow-burgundy"
                : "bg-bg-subtle text-text-disabled cursor-not-allowed",
            )}
            aria-label="Send message">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z"/>
            </svg>
          </button>
        </div>

        <p className="text-micro text-text-disabled text-center mt-2">
          AI Vaidya provides general Ayurvedic guidance · Not a substitute for medical advice
        </p>
      </div>
    </div>
  );
}

const SUGGESTED_QUESTIONS = [
  "What foods should I eat for my Prakriti?",
  "How do I balance my Vata dosha?",
  "Which herbs help with digestion?",
  "How can I improve my sleep naturally?",
];