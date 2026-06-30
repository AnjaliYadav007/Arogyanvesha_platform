"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn, formatRelativeTime } from "@/lib/utils";
import { useReducedMotion } from "@/hooks";
import {  usePrakritiStore} from "@/stores";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { Badge } from "@/components/ui/Badge";
import { PageContainer } from "@/components/layout/PageContainer";


/* ─────────────────────────────────────────────────────────
   MOCK DATA
───────────────────────────────────────────────────────── */

const MOCK_WEEKLY_SCORES = [62, 65, 68, 64, 70, 72, 75];
const MOCK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const MOCK_ACTIVITY = [
  { id: "1", type: "yoga",     title: "Morning Vata Flow",           description: "30 min · Beginner",          completedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
  { id: "2", type: "prakriti", title: "Prakriti Assessment",          description: "Vata-Pitta result",          completedAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString() },
  { id: "3", type: "chat",     title: "AI Vaidya Chat",               description: "Sleep remedies discussed",   completedAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString() },
  { id: "4", type: "routine",  title: "Morning Routine",              description: "6 of 8 practices done",      completedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() },
  { id: "5", type: "wisdom",   title: "Read: Dinacharya Guide",       description: "6 min read",                 completedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString() },
  { id: "6", type: "yoga",     title: "Pranayama Fundamentals",       description: "20 min · Beginner",          completedAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString() },
];

const MOCK_HEALTH_DIMENSIONS = [
  { label: "Physical",   score: 72, color: "var(--color-brand-burgundy)", icon: "M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048" },
  { label: "Mental",     score: 68, color: "var(--color-dosha-vata)",     icon: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12" },
  { label: "Digestive",  score: 75, color: "var(--color-dosha-pitta)",    icon: "M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25" },
  { label: "Sleep",      score: 60, color: "var(--color-dosha-kapha)",    icon: "M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75" },
];

const ACTIVITY_ICONS: Record<string, { iconPath: string; color: string; bg: string }> = {
  yoga:     { iconPath: "M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z", color: "text-status-success", bg: "bg-status-success-bg" },
  prakriti: { iconPath: "M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z", color: "text-dosha-vata", bg: "bg-dosha-vata-bg" },
  chat:     { iconPath: "M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z", color: "text-brand-burgundy", bg: "bg-brand-burgundy/8" },
  routine:  { iconPath: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5", color: "text-status-success", bg: "bg-status-success-bg" },
  wisdom:   { iconPath: "M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25", color: "text-brand-gold", bg: "bg-brand-gold-pale" },
  skin:     { iconPath: "M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z", color: "text-status-info", bg: "bg-status-info-bg" },
};

/* ─────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────── */

export default function ProgressPage() {
  const shouldReduce = useReducedMotion();
  const { result: prakritiResult } = usePrakritiStore();
  

  const arogyaScore = 72;
  const streak = 7;

  const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
  };
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <PageContainer className="py-8">
      <motion.div className="flex flex-col gap-8"
        variants={stagger} initial="hidden" animate="visible">

        {/* Header */}
        <motion.div variants={fadeUp} className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-h1 font-display font-bold text-text-heading mb-1">
              My Progress
            </h1>
            <p className="text-body text-text-muted">
              Your holistic wellness journey at a glance
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-gold-pale border border-brand-gold/20">
            <svg className="w-4 h-4 text-brand-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z"/>
            </svg>
            <span className="text-body-sm font-bold text-brand-gold">{streak} day streak</span>
          </div>
        </motion.div>

        {/* Top metrics row */}
        <motion.div variants={fadeUp}
          className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Arogya score */}
          <div className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-surface-card border border-border-default shadow-sm">
            <p className="text-label font-semibold text-text-muted uppercase tracking-wider">
              Arogya Score
            </p>
            <ProgressRing
              value={arogyaScore}
              variant="arogya"
              size={140}
              strokeWidth={12}
              sublabel="Overall wellness"
              animate={!shouldReduce}
            />
            <div className="text-center">
              <Badge variant="success" size="md">↑ 12% this week</Badge>
            </div>
          </div>

          {/* Health dimensions */}
          <div className="md:col-span-2 flex flex-col gap-4 p-6 rounded-2xl bg-surface-card border border-border-default shadow-sm">
            <p className="text-label font-semibold text-text-muted uppercase tracking-wider mb-1">
              Health Dimensions
            </p>
            {MOCK_HEALTH_DIMENSIONS.map((dim, i) => (
              <div key={dim.label} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: dim.color + "15" }}>
                  <svg className="w-4 h-4" style={{ color: dim.color }}
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={dim.icon}/>
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-body-sm font-medium text-text-heading">{dim.label}</span>
                    <span className="text-body-sm font-bold tabular-nums" style={{ color: dim.color }}>
                      {dim.score}%
                    </span>
                  </div>
                  <div className="h-2 bg-border-default rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: dim.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${dim.score}%` }}
                      transition={{ duration: 1, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Weekly trend chart */}
        <motion.div variants={fadeUp}
          className="p-6 rounded-2xl bg-surface-card border border-border-default shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-h4 font-semibold text-text-heading">Weekly Arogya Trend</h3>
              <p className="text-body-sm text-text-muted">Your score over the last 7 days</p>
            </div>
            <Badge variant="success" size="md">+13 points</Badge>
          </div>

          {/* Line chart */}
          <div className="relative h-32">
            <svg viewBox={`0 0 ${MOCK_DAYS.length * 80} 120`} className="w-full h-full" preserveAspectRatio="none">
              {/* Grid lines */}
              {[25, 50, 75, 100].map((pct) => (
                <line key={pct}
                  x1="0" y1={120 - pct * 1.2}
                  x2={MOCK_DAYS.length * 80} y2={120 - pct * 1.2}
                  stroke="var(--color-border-default)" strokeWidth="0.5"/>
              ))}

              {/* Area fill */}
              <motion.path
                d={`M 40 ${120 - (MOCK_WEEKLY_SCORES[0]! / 100) * 110} ${MOCK_WEEKLY_SCORES.map((s, i) =>
                  `L ${40 + i * 80} ${120 - (s / 100) * 110}`).join(" ")} L ${40 + (MOCK_WEEKLY_SCORES.length - 1) * 80} 120 L 40 120 Z`}
                fill="var(--color-brand-burgundy)"
                opacity="0.06"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.06 }}
                transition={{ duration: 1 }}
              />

              {/* Line */}
              <motion.polyline
                points={MOCK_WEEKLY_SCORES.map((s, i) =>
                  `${40 + i * 80},${120 - (s / 100) * 110}`).join(" ")}
                fill="none"
                stroke="var(--color-brand-burgundy)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              />

              {/* Data points */}
              {MOCK_WEEKLY_SCORES.map((s, i) => (
                <motion.circle key={i}
                  cx={40 + i * 80} cy={120 - (s / 100) * 110} r="4"
                  fill="var(--color-surface-card)"
                  stroke="var(--color-brand-burgundy)"
                  strokeWidth="2.5"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 * i + 1, type: "spring" }}
                  style={{ transformOrigin: `${40 + i * 80}px ${120 - (s / 100) * 110}px` }}
                />
              ))}
            </svg>

            {/* Day labels */}
            <div className="flex justify-around mt-2">
              {MOCK_DAYS.map((day, i) => (
                <div key={day} className="flex flex-col items-center">
                  <span className="text-label text-text-muted">{day}</span>
                  <span className="text-micro text-brand-burgundy font-semibold tabular-nums">
                    {MOCK_WEEKLY_SCORES[i]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Stats grid */}
        <motion.div variants={fadeUp}
          className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Yoga sessions",     value: "12",     sub: "this month",    icon: "M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048" },
            { label: "AI conversations",  value: "8",      sub: "this month",    icon: "M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12" },
            { label: "Articles read",     value: "15",     sub: "this month",    icon: "M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25" },
            { label: "Routine days",      value: "22",     sub: "this month",    icon: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5" },
          ].map((stat, i) => (
            <motion.div key={stat.label}
              className="p-4 rounded-xl bg-surface-card border border-border-default shadow-xs"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.08 }}>
              <svg className="w-5 h-5 text-brand-gold mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon}/>
              </svg>
              <p className="text-h3 font-bold text-text-heading">{stat.value}</p>
              <p className="text-label text-text-muted">{stat.label}</p>
              <p className="text-micro text-text-disabled">{stat.sub}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Prakriti summary */}
        {prakritiResult && (
          <motion.div variants={fadeUp}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-6 rounded-2xl border border-border-gold/20"
            style={{ background: "linear-gradient(135deg, var(--color-brand-gold-pale) 0%, var(--color-surface-card) 100%)" }}>
            <div className="w-14 h-14 rounded-2xl bg-brand-gold/15 flex items-center justify-center shrink-0">
              <svg className="w-7 h-7 text-brand-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"/>
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-label font-semibold text-brand-gold uppercase tracking-wider mb-1">
                Your Prakriti
              </p>
              <p className="text-h4 font-bold text-text-heading capitalize mb-1">
                {prakritiResult.primaryDosha} — {prakritiResult.secondaryDosha}
              </p>
              <p className="text-body-sm text-text-muted">
                Vata {prakritiResult.balance.vata}% · Pitta {prakritiResult.balance.pitta}% · Kapha {prakritiResult.balance.kapha}%
              </p>
            </div>
            <Link href="/prakriti/result">
              <button type="button"
                className="text-body-sm font-semibold text-brand-burgundy hover:underline underline-offset-4 shrink-0">
                View full result →
              </button>
            </Link>
          </motion.div>
        )}

        {/* Activity feed */}
        <motion.div variants={fadeUp}
          className="p-6 rounded-2xl bg-surface-card border border-border-default shadow-sm">
          <h3 className="text-h4 font-semibold text-text-heading mb-5">Recent Activity</h3>
          <div className="flex flex-col divide-y divide-border-default">
            {MOCK_ACTIVITY.map((item) => {
              const config = ACTIVITY_ICONS[item.type] ?? ACTIVITY_ICONS.chat!;
              return (
                <div key={item.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                  <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5", config.bg)}>
                    <svg className={cn("w-4 h-4", config.color)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={config.iconPath}/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-body-sm font-semibold text-text-heading truncate">{item.title}</p>
                    <p className="text-label text-text-muted">{item.description}</p>
                  </div>
                  <span className="text-label text-text-disabled shrink-0 tabular-nums">
                    {formatRelativeTime(item.completedAt)}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </PageContainer>
  );
}