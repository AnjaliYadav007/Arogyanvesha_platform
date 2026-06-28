"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  pageEnter,
  staggerContainer,
  cardEnter,
  scrollReveal,
} from "@/lib/animations";
import { useReducedMotion } from "@/hooks";
import { useAuthStore, useRoutineStore } from "@/stores";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { Badge } from "@/components/ui/Badge";

import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { Button } from "@/components/ui/Button";
import { PageContainer } from "@/components/layout/PageContainer";
import type { Dosha } from "@/types";

/* ─────────────────────────────────────────────────────────
   MOCK DATA
   Replaced by SWR + API calls in Phase 6
───────────────────────────────────────────────────────── */

const MOCK_AROGYA_SCORE = 72;

const MOCK_DOSHA_BALANCE = {
  vata: 45,
  pitta: 35,
  kapha: 20,
};

const MOCK_STREAK = 7;

const MOCK_ACTIVITY = [
  { id: "1", type: "prakriti" as const, title: "Prakriti Analysis", description: "Completed Vata-Pitta assessment", completedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
  { id: "2", type: "yoga" as const,     title: "Morning Yoga",      description: "45 min Vata-balancing flow",     completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
  { id: "3", type: "chat" as const,     title: "AI Vaidya Chat",    description: "Discussed sleep remedies",       completedAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString() },
  { id: "4", type: "wisdom" as const,   title: "Wisdom Article",    description: "Read: Dinacharya practices",     completedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() },
];

const QUICK_ACTIONS = [
  {
    href:        "/chat",
    label:       "AI Vaidya",
    description: "Ask your Ayurvedic questions",
    iconPath:    "M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z",
    color:       "bg-brand-burgundy",
    textColor:   "text-text-inverted",
  },
  {
    href:        "/prakriti",
    label:       "Prakriti",
    description: "Understand your constitution",
    iconPath:    "M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z",
    color:       "bg-surface-gold",
    textColor:   "text-brand-burgundy",
  },
  {
    href:        "/yoga",
    label:       "Yoga",
    description: "Today's recommended practice",
    iconPath:    "M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z",
    color:       "bg-surface-sage",
    textColor:   "text-status-success",
  },
  {
    href:        "/skin",
    label:       "Skin Analysis",
    description: "AI-powered skin assessment",
    iconPath:    "M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z",
    color:       "bg-status-info-bg",
    textColor:   "text-status-info",
  },
] as const;

/* ─────────────────────────────────────────────────────────
   ACTIVITY TYPE CONFIG
───────────────────────────────────────────────────────── */
const activityConfig: Record<string, { color: string; bgColor: string; iconPath: string }> = {

  prakriti: {
    color:    "text-dosha-vata",
    bgColor:  "bg-dosha-vata-bg",
    iconPath: "M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z",
  },
  yoga: {
    color:    "text-status-success",
    bgColor:  "bg-status-success-bg",
    iconPath: "M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z",
  },
  chat: {
    color:    "text-brand-burgundy",
    bgColor:  "bg-brand-burgundy/10",
    iconPath: "M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z",
  },
  skin: {
    color:    "text-status-info",
    bgColor:  "bg-status-info-bg",
    iconPath: "M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z",
  },
  routine: {
    color:    "text-status-success",
    bgColor:  "bg-status-success-bg",
    iconPath: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5",
  },
  wisdom: {
    color:    "text-brand-gold",
    bgColor:  "bg-brand-gold-pale",
    iconPath: "M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25",
  },
};

/* ─────────────────────────────────────────────────────────
   RELATIVE TIME
───────────────────────────────────────────────────────── */

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

/* ─────────────────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────────────────── */

function GreetingSection({ name, streak }: { name: string; streak: number }) {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <h2 className="text-h2 font-bold text-text-heading">
          {greeting}, {name.split(" ")[0]} 🙏
        </h2>
        <p className="text-body text-text-muted mt-1">
          Your wellness journey continues today.
        </p>
      </div>

      {/* Streak badge */}
      <div className={cn(
        "flex flex-col items-center justify-center",
        "w-16 h-16 rounded-xl",
        "bg-brand-gold-pale border border-brand-gold/30",
        "shrink-0",
      )}>
        <span className="text-h3 font-bold text-brand-gold leading-none">
          {streak}
        </span>
        <span className="text-micro text-brand-gold/80 font-medium mt-0.5">
          day streak
        </span>
      </div>
    </div>
  );
}

function ArogyaScoreCard({ score }: { score: number }) {
  const getScoreLabel = (s: number) => {
    if (s >= 80) return "Excellent";
    if (s >= 60) return "Good";
    if (s >= 40) return "Fair";
    return "Needs attention";
  };

  return (
    <div className={cn(
      "bg-surface-card rounded-xl border border-border-default shadow-sm p-6",
      "flex flex-col items-center gap-4",
    )}>
      <div className="flex items-center justify-between w-full">
        <h3 className="text-h4 font-semibold text-text-heading">Arogya Score</h3>
        <Badge variant="gold" size="sm">Updated today</Badge>
      </div>

      <ProgressRing
        value={score}
        variant="arogya"
        size={140}
        strokeWidth={12}
        sublabel="Overall wellness"
        animate
      />

      <div className="text-center">
        <p className="text-body font-semibold text-text-heading">
          {getScoreLabel(score)}
        </p>
        <p className="text-body-sm text-text-muted mt-0.5">
          Keep up your daily routine to improve
        </p>
      </div>
    </div>
  );
}

function DoshaBalanceCard({
  balance,
  primaryDosha,
}: {
  balance: typeof MOCK_DOSHA_BALANCE;
  primaryDosha: Dosha | null | undefined;
}) {
  const doshas: Dosha[] = ["vata", "pitta", "kapha"];

  const doshaColors: Record<Dosha, string> = {
    vata:  "bg-dosha-vata",
    pitta: "bg-dosha-pitta",
    kapha: "bg-dosha-kapha",
  };

  const doshaBgColors: Record<Dosha, string> = {
    vata:  "bg-dosha-vata-bg",
    pitta: "bg-dosha-pitta-bg",
    kapha: "bg-dosha-kapha-bg",
  };

  const doshaTextColors: Record<Dosha, string> = {
    vata:  "text-dosha-vata",
    pitta: "text-dosha-pitta",
    kapha: "text-dosha-kapha",
  };

  return (
    <div className="bg-surface-card rounded-xl border border-border-default shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-h4 font-semibold text-text-heading">
          Dosha Balance
        </h3>
        <Link
          href="/prakriti"
          className="text-body-sm text-brand-burgundy hover:underline underline-offset-4"
        >
          View details
        </Link>
      </div>

      {primaryDosha && (
        <div className="mb-4 p-3 rounded-lg bg-brand-gold-pale border border-brand-gold/20">
          <p className="text-body-sm text-text-muted">
            Primary Dosha:{" "}
            <span className="font-semibold text-text-heading capitalize">
              {primaryDosha}
            </span>
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {doshas.map((dosha) => (
          <div key={dosha} className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
              doshaBgColors[dosha],
            )}>
              <span className={cn(
                "text-label font-bold capitalize",
                doshaTextColors[dosha],
              )}>
                {dosha[0]?.toUpperCase()}
              </span>
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-body-sm font-medium text-text-heading capitalize">
                  {dosha}
                </span>
                <span className="text-label text-text-muted tabular-nums">
                  {balance[dosha]}%
                </span>
              </div>
              <div className="h-2 bg-border-default rounded-full overflow-hidden">
                <motion.div
                  className={cn("h-full rounded-full", doshaColors[dosha])}
                  initial={{ width: 0 }}
                  animate={{ width: `${balance[dosha]}%` }}
                  transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RoutineProgressCard() {
  const { getCompletionPercentage, practices } = useRoutineStore();
  const percentage = getCompletionPercentage();
  const completed = Math.round((percentage / 100) * practices.length);

  return (
    <div className="bg-surface-card rounded-xl border border-border-default shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-h4 font-semibold text-text-heading">
          Today&apos;s Routine
        </h3>
        <Link
          href="/routine"
          className="text-body-sm text-brand-burgundy hover:underline underline-offset-4"
        >
          View all
        </Link>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <ProgressRing
          value={percentage}
          variant="routine"
          size={80}
          strokeWidth={8}
          animate
        />
        <div>
          <p className="text-h4 font-bold text-text-heading">
            {completed}/{practices.length || 8}
          </p>
          <p className="text-body-sm text-text-muted">
            practices completed
          </p>
        </div>
      </div>

      {percentage === 100 ? (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-status-success-bg">
          <svg className="w-4 h-4 text-status-success shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
          </svg>
          <p className="text-body-sm font-semibold text-status-success">
            All practices complete!
          </p>
        </div>
      ) : (
        <Link href="/routine">
          <Button variant="sage" className="w-full" size="sm">
            Continue routine
          </Button>
        </Link>
      )}
    </div>
  );
}

function QuickActionsGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {QUICK_ACTIONS.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className={cn(
            "flex flex-col gap-3 p-4 rounded-xl",
            "border border-border-default",
            "hover:shadow-md hover:-translate-y-0.5",
            "transition-all duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-gold",
            "bg-surface-card",
          )}
        >
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
            action.color,
          )}>
            <svg
              className={cn("w-5 h-5", action.textColor)}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d={action.iconPath} />
            </svg>
          </div>

          <div>
            <p className="text-body-sm font-semibold text-text-heading">
              {action.label}
            </p>
            <p className="text-label text-text-muted mt-0.5 leading-snug">
              {action.description}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}

function RecentActivityFeed() {
  return (
    <div className="bg-surface-card rounded-xl border border-border-default shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-h4 font-semibold text-text-heading">
          Recent Activity
        </h3>
        <Link
          href="/progress"
          className="text-body-sm text-brand-burgundy hover:underline underline-offset-4"
        >
          View all
        </Link>
      </div>

      <div className="flex flex-col divide-y divide-border-default">
        {MOCK_ACTIVITY.map((item) => {
          const config = activityConfig[item.type] ?? activityConfig.wisdom!;

          return (
            <div key={item.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
              <div className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                config.bgColor,
              )}>
                <svg
                  className={cn("w-4.5 h-4.5", config.color)}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={config.iconPath} />
                </svg>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-body-sm font-semibold text-text-heading truncate">
                  {item.title}
                </p>
                <p className="text-label text-text-muted truncate">
                  {item.description}
                </p>
              </div>

              <span className="text-label text-text-muted shrink-0 tabular-nums">
                {relativeTime(item.completedAt)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────── */

export default function DashboardPage() {
  const shouldReduce = useReducedMotion();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = React.useState(true);

  // Simulate data loading
  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <PageContainer className="py-8">
        <div className="flex flex-col gap-6">
          <SkeletonLoader variant="avatar" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <SkeletonLoader variant="card" />
            <SkeletonLoader variant="card" />
            <SkeletonLoader variant="card" />
          </div>
          <SkeletonLoader variant="list" count={4} />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-8">
      <motion.div
        className="flex flex-col gap-8"
        variants={shouldReduce ? {} : pageEnter}
        initial="hidden"
        animate="visible"
      >
        {/* Greeting */}
        <GreetingSection
          name={user?.name ?? "Friend"}
          streak={MOCK_STREAK}
        />

        {/* Top cards row */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={shouldReduce ? {} : staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={shouldReduce ? {} : cardEnter}>
            <ArogyaScoreCard score={MOCK_AROGYA_SCORE} />
          </motion.div>

          <motion.div variants={shouldReduce ? {} : cardEnter}>
            <DoshaBalanceCard
              balance={MOCK_DOSHA_BALANCE}
              primaryDosha={user?.primaryDosha}
            />
          </motion.div>

          <motion.div variants={shouldReduce ? {} : cardEnter}>
            <RoutineProgressCard />
          </motion.div>
        </motion.div>

        {/* Quick actions */}
        <motion.section
          variants={shouldReduce ? {} : scrollReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <h3 className="text-h4 font-semibold text-text-heading mb-4">
            Quick Actions
          </h3>
          <QuickActionsGrid />
        </motion.section>

        {/* Recent activity */}
        <motion.section
          variants={shouldReduce ? {} : scrollReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <RecentActivityFeed />
        </motion.section>

        {/* Prakriti CTA — shown if not completed */}
        {!user?.prakritiCompleted && (
          <motion.div
            className={cn(
              "flex flex-col sm:flex-row items-start sm:items-center gap-4",
              "p-6 rounded-xl",
              "bg-brand-burgundy-deep border border-brand-burgundy/20",
            )}
            variants={shouldReduce ? {} : scrollReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="flex-1">
              <h3 className="text-h4 font-semibold text-text-inverted mb-1">
                Discover your Prakriti
              </h3>
              <p className="text-body-sm text-brand-gold-light">
                Take the 20-question assessment to unlock personalised Ayurvedic insights.
              </p>
            </div>
            <Link href="/prakriti/quiz">
              <Button variant="primary-gold" size="md" className="shrink-0">
                Start assessment
              </Button>
            </Link>
          </motion.div>
        )}
      </motion.div>
    </PageContainer>
  );
}