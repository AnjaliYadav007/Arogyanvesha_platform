"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks";
import { usePrakritiStore } from "@/stores";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Chip } from "@/components/ui/Badge";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageContainer } from "@/components/layout/PageContainer";
import type { YogaSession, YogaLevel, YogaCategory, Dosha } from "@/types";

/* ─────────────────────────────────────────────────────────
   MOCK DATA
───────────────────────────────────────────────────────── */

const MOCK_SESSIONS: YogaSession[] = [
  { id: "y1", title: "Vata-Balancing Morning Flow", description: "Gentle grounding sequence to calm Vata and start your day with stability and warmth.", durationMinutes: 30, level: "beginner", category: "morning", doshaTarget: "vata", isFavorited: true, completionCount: 5 },
  { id: "y2", title: "Pitta-Cooling Moon Salutations", description: "Cooling, surrendering sequence to release excess heat and find calm in your practice.", durationMinutes: 45, level: "intermediate", category: "evening", doshaTarget: "pitta", isFavorited: false, completionCount: 2 },
  { id: "y3", title: "Kapha-Energising Power Flow", description: "Dynamic, invigorating practice to stimulate Kapha and ignite your inner fire.", durationMinutes: 60, level: "intermediate", category: "morning", doshaTarget: "kapha", isFavorited: false, completionCount: 0 },
  { id: "y4", title: "Stress Relief & Pranayama", description: "Breathwork and gentle stretches for immediate stress release and nervous system calm.", durationMinutes: 20, level: "beginner", category: "stress-relief", doshaTarget: "vata", isFavorited: true, completionCount: 8 },
  { id: "y5", title: "Deep Flexibility Flow", description: "Yin-inspired sequence targeting connective tissue for profound flexibility gains.", durationMinutes: 50, level: "intermediate", category: "flexibility", doshaTarget: null, isFavorited: false, completionCount: 1 },
  { id: "y6", title: "Nidra & Meditation", description: "Guided Yoga Nidra for deep rest, restoration and subconscious healing.", durationMinutes: 35, level: "beginner", category: "meditation", doshaTarget: "vata", isFavorited: false, completionCount: 3 },
  { id: "y7", title: "Strength & Core Stability", description: "Build functional strength, core power and full-body stability through mindful movement.", durationMinutes: 45, level: "advanced", category: "strength", doshaTarget: "kapha", isFavorited: false, completionCount: 0 },
  { id: "y8", title: "Evening Wind-Down", description: "Calming bedtime sequence to release the day, settle the mind and prepare for deep sleep.", durationMinutes: 25, level: "beginner", category: "evening", doshaTarget: "vata", isFavorited: true, completionCount: 12 },
  { id: "y9", title: "Pranayama Fundamentals", description: "Learn the four core breathing techniques of Ayurvedic yoga — Nadi Shodhana, Kapalabhati, Bhramari, Sitali.", durationMinutes: 20, level: "beginner", category: "pranayama", doshaTarget: null, isFavorited: false, completionCount: 4 },
];

/* ─────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────── */

const CATEGORIES: { value: YogaCategory | "all"; label: string }[] = [
  { value: "all",          label: "All"           },
  { value: "morning",      label: "Morning"       },
  { value: "evening",      label: "Evening"       },
  { value: "stress-relief",label: "Stress Relief" },
  { value: "strength",     label: "Strength"      },
  { value: "flexibility",  label: "Flexibility"   },
  { value: "meditation",   label: "Meditation"    },
  { value: "pranayama",    label: "Pranayama"     },
];

const LEVELS: { value: YogaLevel | "all"; label: string }[] = [
  { value: "all",          label: "All Levels"    },
  { value: "beginner",     label: "Beginner"      },
  { value: "intermediate", label: "Intermediate"  },
  { value: "advanced",     label: "Advanced"      },
];

const DOSHA_FILTER: { value: Dosha | "all"; label: string }[] = [
  { value: "all",   label: "All Doshas" },
  { value: "vata",  label: "Vata"       },
  { value: "pitta", label: "Pitta"      },
  { value: "kapha", label: "Kapha"      },
];

const LEVEL_COLORS: Record<YogaLevel, string> = {
  beginner:     "success",
  intermediate: "warning",
  advanced:     "error",
};

const DOSHA_BADGE: Record<Dosha, { variant: "vata" | "pitta" | "kapha" }> = {
  vata:  { variant: "vata"  },
  pitta: { variant: "pitta" },
  kapha: { variant: "kapha" },
};

/* ─────────────────────────────────────────────────────────
   SESSION CARD
───────────────────────────────────────────────────────── */

function SessionCard({
  session,
  index,
  shouldReduce,
}: {
  session: YogaSession;
  index: number;
  shouldReduce: boolean;
}) {
  const [favorited, setFavorited] = React.useState(session.isFavorited ?? false);

  const categoryColors: Record<YogaCategory, string> = {
    morning:       "bg-brand-gold-pale text-brand-gold",
    evening:       "bg-dosha-vata-bg text-dosha-vata",
    "stress-relief":"bg-dosha-kapha-bg text-dosha-kapha",
    strength:      "bg-dosha-pitta-bg text-dosha-pitta",
    flexibility:   "bg-status-info-bg text-status-info",
    meditation:    "bg-brand-burgundy/8 text-brand-burgundy",
    pranayama:     "bg-surface-sage text-sage",
  };

  return (
    <motion.div
      className={cn(
        "group flex flex-col bg-surface-card rounded-xl border border-border-default",
        "hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden",
      )}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: shouldReduce ? 0 : index * 0.06 }}
    >
      {/* Thumbnail area */}
      <div className={cn(
        "relative h-36 flex items-center justify-center",
        "bg-gradient-to-br from-bg-canvas to-bg-subtle",
      )}>
        {/* Decorative yoga pose SVG */}
        <svg viewBox="0 0 120 100" className="w-24 h-20 opacity-60" fill="none">
          {session.category === "meditation" || session.category === "pranayama" ? (
            <>
              <circle cx="60" cy="30" r="10" fill="var(--color-brand-burgundy)" opacity="0.5"/>
              <ellipse cx="60" cy="65" rx="22" ry="14" fill="var(--color-brand-gold)" opacity="0.2"/>
              <line x1="60" y1="40" x2="60" y2="55" stroke="var(--color-brand-burgundy)" strokeWidth="3" strokeLinecap="round" opacity="0.5"/>
              <line x1="60" y1="50" x2="40" y2="60" stroke="var(--color-brand-gold)" strokeWidth="2.5" strokeLinecap="round" opacity="0.5"/>
              <line x1="60" y1="50" x2="80" y2="60" stroke="var(--color-brand-gold)" strokeWidth="2.5" strokeLinecap="round" opacity="0.5"/>
            </>
          ) : session.category === "strength" ? (
            <>
              <circle cx="60" cy="25" r="10" fill="var(--color-dosha-pitta)" opacity="0.5"/>
              <line x1="60" y1="35" x2="60" y2="65" stroke="var(--color-dosha-pitta)" strokeWidth="3" strokeLinecap="round" opacity="0.5"/>
              <line x1="60" y1="45" x2="38" y2="35" stroke="var(--color-brand-gold)" strokeWidth="2.5" strokeLinecap="round" opacity="0.6"/>
              <line x1="60" y1="45" x2="82" y2="35" stroke="var(--color-brand-gold)" strokeWidth="2.5" strokeLinecap="round" opacity="0.6"/>
              <line x1="60" y1="65" x2="45" y2="82" stroke="var(--color-dosha-pitta)" strokeWidth="2.5" strokeLinecap="round" opacity="0.5"/>
              <line x1="60" y1="65" x2="75" y2="82" stroke="var(--color-dosha-pitta)" strokeWidth="2.5" strokeLinecap="round" opacity="0.5"/>
            </>
          ) : (
            <>
              <circle cx="60" cy="22" r="10" fill="var(--color-brand-burgundy)" opacity="0.4"/>
              <line x1="60" y1="32" x2="60" y2="60" stroke="var(--color-brand-burgundy)" strokeWidth="3" strokeLinecap="round" opacity="0.4"/>
              <line x1="60" y1="45" x2="35" y2="55" stroke="var(--color-brand-gold)" strokeWidth="2.5" strokeLinecap="round" opacity="0.5"/>
              <line x1="60" y1="45" x2="85" y2="55" stroke="var(--color-brand-gold)" strokeWidth="2.5" strokeLinecap="round" opacity="0.5"/>
              <line x1="60" y1="60" x2="45" y2="82" stroke="var(--color-brand-burgundy)" strokeWidth="2.5" strokeLinecap="round" opacity="0.4"/>
              <line x1="60" y1="60" x2="75" y2="82" stroke="var(--color-brand-burgundy)" strokeWidth="2.5" strokeLinecap="round" opacity="0.4"/>
            </>
          )}
          {/* Lotus base */}
          <ellipse cx="60" cy="90" rx="30" ry="6" fill="var(--color-brand-gold)" opacity="0.1"/>
        </svg>

        {/* Category badge */}
        <span className={cn(
          "absolute top-3 left-3 text-micro font-semibold px-2.5 py-1 rounded-pill capitalize",
          categoryColors[session.category],
        )}>
          {session.category.replace("-", " ")}
        </span>

        {/* Duration */}
        <span className="absolute top-3 right-12 text-micro font-medium text-text-muted bg-surface-card/80 backdrop-blur px-2 py-0.5 rounded-pill">
          {session.durationMinutes} min
        </span>

        {/* Favorite button */}
        <button
          type="button"
          onClick={() => setFavorited(!favorited)}
          className={cn(
            "absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center",
            "bg-surface-card/80 backdrop-blur transition-all duration-200",
            "hover:scale-110 focus-visible:outline-none",
          )}
          aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
        >
          <svg className={cn("w-4 h-4 transition-colors", favorited ? "text-status-error fill-status-error" : "text-text-muted")}
            viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/>
          </svg>
        </button>

        {/* Completion count */}
        {(session.completionCount ?? 0) > 0 && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-status-success-bg px-2 py-0.5 rounded-pill">
            <svg className="w-3 h-3 text-status-success" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd"/>
            </svg>
            <span className="text-micro font-semibold text-status-success">
              {session.completionCount}×
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-3 p-4 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-body-sm font-semibold text-text-heading leading-snug">
            {session.title}
          </h3>
        </div>

        <p className="text-label text-text-muted leading-relaxed truncate-2">
          {session.description}
        </p>

        <div className="flex items-center gap-2 flex-wrap mt-auto pt-2">
          <Badge
            variant={LEVEL_COLORS[session.level] as "success" | "warning" | "error"}
            size="sm"
            className="capitalize"
          >
            {session.level}
          </Badge>
          {session.doshaTarget && (
            <Badge
              variant={DOSHA_BADGE[session.doshaTarget].variant}
              size="sm"
              className="capitalize"
            >
              {session.doshaTarget}
            </Badge>
          )}
        </div>

        <Link href={`/yoga/${session.id}`}>
          <Button variant="primary" size="sm" className="w-full mt-1">
            Start session
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────── */

export default function YogaPage() {
  const shouldReduce = useReducedMotion();
  const { result: prakritiResult } = usePrakritiStore();


  const [activeCategory, setActiveCategory] = React.useState<YogaCategory | "all">("all");
  const [activeLevel, setActiveLevel] = React.useState<YogaLevel | "all">("all");
  const [activeDosha, setActiveDosha] = React.useState<Dosha | "all">("all");
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const filtered = MOCK_SESSIONS.filter((s) => {
    const catOk = activeCategory === "all" || s.category === activeCategory;
    const lvlOk = activeLevel === "all" || s.level === activeLevel;
    const doshOk = activeDosha === "all" || s.doshaTarget === activeDosha;
    return catOk && lvlOk && doshOk;
  });

  const recommendedSession = prakritiResult
    ? MOCK_SESSIONS.find((s) => s.doshaTarget === prakritiResult.primaryDosha)
    : MOCK_SESSIONS[0];

  const totalCompleted = MOCK_SESSIONS.reduce((sum, s) => sum + (s.completionCount ?? 0), 0);
  const weeklyGoal = 5;
  const weeklyProgress = Math.min(3, weeklyGoal);

  return (
    <PageContainer className="py-8">

      {/* Header */}
      <motion.div className="mb-8"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}>
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-h1 font-display font-bold text-text-heading mb-1">
              Yoga & Wellness
            </h1>
            <p className="text-body text-text-muted">
              {prakritiResult
                ? `Personalised for your ${prakritiResult.primaryDosha} Prakriti`
                : "Discover your perfect practice"}
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/yoga/favorites">
              <Button variant="ghost" size="sm" leftIcon={
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/>
                </svg>
              }>
                Favorites
              </Button>
            </Link>
            <Link href="/yoga/progress">
              <Button variant="secondary" size="sm">My Progress</Button>
            </Link>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Sessions completed", value: totalCompleted.toString(), icon: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
            { label: "Minutes practised", value: "340", icon: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" },
            { label: "Current streak", value: "7 days", icon: "M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048" },
            { label: "Weekly goal", value: `${weeklyProgress}/${weeklyGoal}`, icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75" },
          ].map((stat, i) => (
            <motion.div key={stat.label}
              className="p-4 rounded-xl bg-surface-card border border-border-default shadow-xs"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}>
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-brand-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon}/>
                </svg>
                <span className="text-label text-text-muted">{stat.label}</span>
              </div>
              <p className="text-h4 font-bold text-text-heading">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Recommended session banner */}
        {recommendedSession && (
          <motion.div
            className={cn(
              "flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 rounded-xl mb-6",
              "border border-brand-gold/20",
            )}
            style={{ background: "linear-gradient(135deg, var(--color-brand-gold-pale) 0%, var(--color-surface-card) 100%)" }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}>
            <div className="w-12 h-12 rounded-xl bg-brand-gold/15 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-brand-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-label font-semibold text-brand-gold uppercase tracking-wider mb-0.5">
                Recommended for you today
              </p>
              <p className="text-body-sm font-semibold text-text-heading">
                {recommendedSession.title}
              </p>
              <p className="text-label text-text-muted">
                {recommendedSession.durationMinutes} min · {recommendedSession.level}
                {recommendedSession.doshaTarget && ` · ${recommendedSession.doshaTarget} balancing`}
              </p>
            </div>
            <Link href={`/yoga/${recommendedSession.id}`}>
              <Button variant="primary-gold" size="sm" className="shrink-0">
                Start now
              </Button>
            </Link>
          </motion.div>
        )}
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col gap-3 mb-6">
        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => (
            <Chip
              key={cat.value}
              selected={activeCategory === cat.value}
              onClick={() => setActiveCategory(cat.value as typeof activeCategory)}
              size="sm"
            >
              {cat.label}
            </Chip>
          ))}
        </div>

        {/* Level + Dosha row */}
        <div className="flex gap-2 flex-wrap">
          {LEVELS.map((lvl) => (
            <Chip
              key={lvl.value}
              selected={activeLevel === lvl.value}
              onClick={() => setActiveLevel(lvl.value as typeof activeLevel)}
              size="sm"
            >
              {lvl.label}
            </Chip>
          ))}
          <div className="w-px bg-border-default mx-1"/>
          {DOSHA_FILTER.map((d) => (
            <Chip
              key={d.value}
              selected={activeDosha === d.value}
              onClick={() => setActiveDosha(d.value as typeof activeDosha)}
              size="sm"
            >
              {d.label}
            </Chip>
          ))}
        </div>
      </div>

      {/* Session grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonLoader key={i} variant="card"/>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          variant="no-yoga"
          title="No sessions match your filters"
          description="Try adjusting the category, level or Dosha filter."
          action={
            <Button variant="secondary" onClick={() => {
              setActiveCategory("all");
              setActiveLevel("all");
              setActiveDosha("all");
            }}>
              Clear all filters
            </Button>
          }
        />
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          layout>
          <AnimatePresence mode="popLayout">
            {filtered.map((session, i) => (
              <SessionCard
                key={session.id}
                session={session}
                index={i}
                shouldReduce={shouldReduce}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </PageContainer>
  );
}