"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn, formatRelativeTime } from "@/lib/utils";

import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageContainer } from "@/components/layout/PageContainer";
import type { Notification, NotificationType } from "@/types";

const MOCK_NOTIFS: Notification[] = [
  { id: "n1", type: "achievement", title: "7-Day Streak!", body: "You've practised your Dinacharya for 7 days straight. Keep going!", isRead: false, actionUrl: "/routine", createdAt: new Date(Date.now()-1000*60*30).toISOString() },
  { id: "n2", type: "reminder", title: "Evening yoga reminder", body: "Your Vata-balancing evening flow is ready whenever you are.", isRead: false, actionUrl: "/yoga", createdAt: new Date(Date.now()-1000*60*60*3).toISOString() },
  { id: "n3", type: "insight", title: "New AI insight available", body: "Based on your recent activity, AI Vaidya has a personalised tip for you.", isRead: true, actionUrl: "/chat", createdAt: new Date(Date.now()-1000*60*60*20).toISOString() },
  { id: "n4", type: "system", title: "Welcome to Arogyanvesha", body: "Start your journey by taking the Prakriti assessment.", isRead: true, actionUrl: "/prakriti", createdAt: new Date(Date.now()-1000*60*60*48).toISOString() },
  { id: "n5", type: "streak", title: "Don't break your streak", body: "You haven't logged your routine today. 5 minutes keeps your streak alive.", isRead: true, actionUrl: "/routine", createdAt: new Date(Date.now()-1000*60*60*72).toISOString() },
];

const TYPE_CONFIG: Record<NotificationType, { icon: string; color: string; bg: string }> = {
  achievement: { icon: "M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375", color: "text-brand-gold", bg: "bg-brand-gold-pale" },
  reminder:    { icon: "M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75", color: "text-status-info", bg: "bg-status-info-bg" },
  insight:     { icon: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12", color: "text-brand-burgundy", bg: "bg-brand-burgundy/8" },
  system:      { icon: "M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-text-muted", bg: "bg-bg-subtle" },
  streak:      { icon: "M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048", color: "text-status-success", bg: "bg-status-success-bg" },
};

const FILTERS: { value: NotificationType | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "achievement", label: "Achievements" },
  { value: "reminder", label: "Reminders" },
  { value: "insight", label: "Insights" },
  { value: "streak", label: "Streaks" },
];

export default function NotificationsPage() {
  const [notifs, setNotifs] = React.useState(MOCK_NOTIFS);
  const [filter, setFilter] = React.useState<NotificationType | "all">("all");

  const markRead = (id: string) =>
    setNotifs((p) => p.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  const markAllRead = () =>
    setNotifs((p) => p.map((n) => ({ ...n, isRead: true })));
  const dismiss = (id: string) =>
    setNotifs((p) => p.filter((n) => n.id !== id));

  const filtered = filter === "all" ? notifs : notifs.filter((n) => n.type === filter);
  const unreadCount = notifs.filter((n) => !n.isRead).length;

  return (
    <PageContainer className="py-8 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

        <div className="flex items-center justify-between mb-2">
          <h1 className="text-h1 font-display font-bold text-text-heading">Notifications</h1>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllRead}>Mark all read</Button>
          )}
        </div>
        <p className="text-body text-text-muted mb-6">
          {unreadCount > 0 ? `${unreadCount} unread notifications` : "You're all caught up"}
        </p>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
          {FILTERS.map((f) => (
            <button key={f.value} type="button" onClick={() => setFilter(f.value)}
              className={cn(
                "shrink-0 px-4 py-2 rounded-xl text-body-sm font-medium border transition-all",
                filter === f.value
                  ? "bg-brand-burgundy text-text-inverted border-brand-burgundy"
                  : "bg-surface-card text-text-muted border-border-default hover:border-brand-burgundy/40",
              )}>
              {f.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState variant="generic" title="No notifications" description="You're all caught up here." />
        ) : (
          <div className="flex flex-col gap-2">
            <AnimatePresence>
              {filtered.map((n) => {
                const c = TYPE_CONFIG[n.type];
                return (
                  <motion.div key={n.id}
                    layout
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={cn(
                      "flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer",
                      n.isRead ? "bg-surface-card border-border-default" : "bg-brand-gold-pale/40 border-brand-gold/20",
                    )}
                    onClick={() => markRead(n.id)}>
                    <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", c.bg)}>
                      <svg className={cn("w-4 h-4", c.color)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={c.icon}/>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-body-sm font-semibold text-text-heading">{n.title}</p>
                        {!n.isRead && <div className="w-1.5 h-1.5 rounded-full bg-brand-burgundy shrink-0"/>}
                      </div>
                      <p className="text-label text-text-muted mt-0.5">{n.body}</p>
                      <p className="text-micro text-text-disabled mt-1">{formatRelativeTime(n.createdAt)}</p>
                    </div>
                    <button type="button" onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                      className="p-1 rounded text-text-disabled hover:text-text-muted shrink-0"
                      aria-label="Dismiss">
                      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"/>
                      </svg>
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </PageContainer>
  );
}