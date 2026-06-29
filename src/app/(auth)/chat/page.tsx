"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn, formatRelativeTime, generateId } from "@/lib/utils";
import { useChatStore, useAuthStore } from "@/stores";
import { Button } from "@/components/ui/Button";
import { SearchBar } from "@/components/ui/SearchBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageContainer } from "@/components/layout/PageContainer";
import type { Conversation } from "@/types";

/* ─────────────────────────────────────────────────────────
   MOCK CONVERSATIONS
───────────────────────────────────────────────────────── */

const MOCK_CONVERSATIONS: Conversation[] = [
  { id: "c1", userId: "u1", title: "Sleep remedies for Vata type", lastMessage: "Try warm ashwagandha milk before bed...", messageCount: 8, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
  { id: "c2", userId: "u1", title: "Foods to avoid for Pitta", lastMessage: "Avoid spicy, oily and fermented foods...", messageCount: 12, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString() },
  { id: "c3", userId: "u1", title: "Morning Dinacharya routine", lastMessage: "Start with tongue scraping followed by...", messageCount: 5, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 45).toISOString() },
  { id: "c4", userId: "u1", title: "Ashwagandha benefits and dosage", lastMessage: "Take 300–500mg with warm milk at night...", messageCount: 6, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 70).toISOString() },
];

/* ─────────────────────────────────────────────────────────
   CONVERSATION CARD
───────────────────────────────────────────────────────── */

function ConversationCard({
  conversation,
  isActive,
  onClick,
}: {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-left p-4 rounded-xl border transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-gold",
        isActive
          ? "bg-brand-burgundy/8 border-brand-burgundy/30 shadow-sm"
          : "bg-surface-card border-border-default hover:shadow-md hover:-translate-y-0.5",
      )}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
          isActive ? "bg-brand-burgundy" : "bg-brand-burgundy/10",
        )}>
          <svg className={cn("w-4 h-4", isActive ? "text-text-inverted" : "text-brand-burgundy")}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"/>
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className={cn(
              "text-body-sm font-semibold truncate",
              isActive ? "text-brand-burgundy" : "text-text-heading",
            )}>
              {conversation.title}
            </p>
            <span className="text-micro text-text-muted shrink-0">
              {formatRelativeTime(conversation.updatedAt)}
            </span>
          </div>
          {conversation.lastMessage && (
            <p className="text-label text-text-muted truncate-2 leading-snug">
              {conversation.lastMessage}
            </p>
          )}
          <p className="text-micro text-text-disabled mt-1">
            {conversation.messageCount} messages
          </p>
        </div>
      </div>
    </motion.button>
  );
}

/* ─────────────────────────────────────────────────────────
   SUGGESTED QUESTIONS
───────────────────────────────────────────────────────── */

const SUGGESTED_QUESTIONS = [
  "What foods should I eat for my Prakriti?",
  "How do I balance my Vata dosha?",
  "What yoga is best for Pitta types?",
  "Which herbs help with digestion?",
  "How can I improve my sleep naturally?",
  "What is Dinacharya and how do I start?",
];

/* ─────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────── */

export default function ChatListPage() {
  const router = useRouter();

  const { user } = useAuthStore();
  const {
    conversations,
    activeConversationId,
    setConversations,
    setActiveConversation,
    addConversation,
  } = useChatStore();

  const [search, setSearch] = React.useState("");

  // Load mock conversations
  React.useEffect(() => {
    if (conversations.length === 0) {
      setConversations(MOCK_CONVERSATIONS);
    }
  }, [conversations.length, setConversations]);

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()),
  );

  const startNewChat = () => {
    const newConv: Conversation = {
      id: generateId(),
      userId: user?.id ?? "user",
      title: "New conversation",
      lastMessage: null,
      messageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addConversation(newConv);
    setActiveConversation(newConv.id);
    router.push(`/chat/${newConv.id}`);
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversation(id);
    router.push(`/chat/${id}`);
  };

  return (
    <PageContainer className="py-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <motion.div className="mb-8"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}>
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-h1 font-display font-bold text-text-heading mb-1">
                AI Vaidya
              </h1>
              <p className="text-body text-text-muted">
                Your personal Ayurvedic health guide, available 24/7
              </p>
            </div>
            <Button
              variant="primary"
              leftIcon={
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z"/>
                </svg>
              }
              onClick={startNewChat}
            >
              New chat
            </Button>
          </div>

          {/* Search */}
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search conversations…"
            size="md"
          />
        </motion.div>

        {/* New chat hero — if no conversations */}
        {conversations.length === 0 ? (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}>

            {/* AI avatar */}
            <div className="w-20 h-20 rounded-2xl bg-brand-burgundy flex items-center justify-center mx-auto mb-6 shadow-burgundy">
              <svg className="w-10 h-10 text-text-inverted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
              </svg>
            </div>

            <h2 className="text-h2 font-display font-bold text-text-heading mb-3">
              Meet your AI Vaidya
            </h2>
            <p className="text-body text-text-muted max-w-md mx-auto mb-10 leading-relaxed">
              Ask anything about Ayurveda, your Prakriti, herbs, diet, yoga, or daily wellness.
              Powered by 5,000+ classical texts.
            </p>

            {/* Suggested questions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto mb-8">
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <motion.button
                  key={q}
                  type="button"
                  onClick={startNewChat}
                  className={cn(
                    "text-left p-4 rounded-xl border border-border-default",
                    "bg-surface-card hover:border-brand-burgundy/40 hover:shadow-md",
                    "transition-all duration-200 text-body-sm text-text-body font-medium",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-gold",
                  )}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.07 }}
                  whileHover={{ y: -2 }}
                >
                  <span className="text-brand-gold mr-2">✦</span>
                  {q}
                </motion.button>
              ))}
            </div>

            <Button variant="primary" size="lg" onClick={startNewChat}
              className="bg-gradient-burgundy border-0 shadow-burgundy">
              Start your first conversation
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Conversation list */}
            <div className="md:col-span-1 flex flex-col gap-3">
              <p className="text-label font-semibold text-text-muted uppercase tracking-wider mb-1">
                Recent Conversations
              </p>
              <AnimatePresence>
                {filtered.length === 0 ? (
                  <EmptyState
                    variant="no-chat"
                    title="No conversations found"
                    description="Try a different search term."
                    size="inline"
                  />
                ) : (
                  filtered.map((conv, i) => (
                    <motion.div key={conv.id}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}>
                      <ConversationCard
                        conversation={conv}
                        isActive={activeConversationId === conv.id}
                        onClick={() => handleSelectConversation(conv.id)}
                      />
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Right panel — new chat prompt */}
            <div className="md:col-span-2 flex flex-col items-center justify-center py-12 rounded-2xl border border-dashed border-border-strong bg-bg-subtle">
              <div className="w-16 h-16 rounded-2xl bg-brand-burgundy/10 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-brand-burgundy" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"/>
                </svg>
              </div>
              <h3 className="text-h4 font-semibold text-text-heading mb-2">
                Select or start a conversation
              </h3>
              <p className="text-body-sm text-text-muted text-center max-w-xs mb-6">
                Choose a conversation from the list, or start a new one with your AI Vaidya.
              </p>

              <div className="flex flex-col gap-2 w-full max-w-xs">
                {SUGGESTED_QUESTIONS.slice(0, 3).map((q) => (
                  <button key={q} type="button" onClick={startNewChat}
                    className={cn(
                      "text-left p-3 rounded-lg border border-border-default bg-surface-card",
                      "text-body-sm text-text-muted hover:border-brand-burgundy/40 hover:text-text-body",
                      "transition-all duration-150",
                    )}>
                    <span className="text-brand-gold mr-1.5">✦</span>{q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}