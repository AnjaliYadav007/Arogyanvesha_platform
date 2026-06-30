"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks";
import { useRoutineStore, usePrakritiStore } from "@/stores";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { Badge } from "@/components/ui/Badge";
import { PageContainer } from "@/components/layout/PageContainer";
import type { RoutinePractice, Dosha } from "@/types";

/* ─────────────────────────────────────────────────────────
   MOCK PRACTICES
───────────────────────────────────────────────────────── */

const MOCK_PRACTICES: RoutinePractice[] = [
  { id: "p1", name: "Tongue scraping",      description: "Copper scraper, 7 strokes",     timeOfDay: "morning",   durationMinutes: 1,  doshaRecommended: null },
  { id: "p2", name: "Warm water",           description: "1–2 glasses, with lemon",        timeOfDay: "morning",   durationMinutes: 2,  doshaRecommended: "vata" },
  { id: "p3", name: "Oil pulling",          description: "1 tbsp sesame oil, 10 minutes",  timeOfDay: "morning",   durationMinutes: 10, doshaRecommended: null },
  { id: "p4", name: "Abhyanga",             description: "Self-massage with warm oil",      timeOfDay: "morning",   durationMinutes: 10, doshaRecommended: "vata" },
  { id: "p5", name: "Yoga practice",        description: "20–30 minutes morning flow",      timeOfDay: "morning",   durationMinutes: 25, doshaRecommended: null },
  { id: "p6", name: "Pranayama",            description: "Nadi Shodhana, 10 rounds",        timeOfDay: "morning",   durationMinutes: 10, doshaRecommended: null },
  { id: "p7", name: "Meditation",           description: "Mindful sitting, 10 minutes",     timeOfDay: "morning",   durationMinutes: 10, doshaRecommended: null },
  { id: "p8", name: "Nutritious breakfast", description: "Warm, cooked, Dosha-appropriate", timeOfDay: "morning",   durationMinutes: 20, doshaRecommended: null },
  { id: "p9", name: "Midday meal",          description: "Largest meal of the day",          timeOfDay: "afternoon", durationMinutes: 30, doshaRecommended: null },
  { id: "p10", name: "Short walk",          description: "10–15 minutes after lunch",        timeOfDay: "afternoon", durationMinutes: 15, doshaRecommended: "kapha" },
  { id: "p11", name: "Light evening meal",  description: "Before 7pm, easy to digest",       timeOfDay: "evening",   durationMinutes: 20, doshaRecommended: null },
  { id: "p12", name: "Evening yoga",        description: "Gentle, restorative sequence",      timeOfDay: "evening",   durationMinutes: 20, doshaRecommended: null },
  { id: "p13", name: "Digital sunset",      description: "No screens 1 hour before bed",     timeOfDay: "night",     durationMinutes: 5,  doshaRecommended: "vata" },
  { id: "p14", name: "Herbal tea",          description: "Ashwagandha or chamomile milk",     timeOfDay: "night",     durationMinutes: 5,  doshaRecommended: "vata" },
  { id: "p15", name: "Sleep by 10pm",       description: "Align with Pitta time cycle",      timeOfDay: "night",     durationMinutes: 0,  doshaRecommended: null },
];

const TIME_SECTIONS: { key: RoutinePractice["timeOfDay"]; label: string; icon: string; color: string; bg: string }[] = [
  { key: "morning",   label: "Morning",   icon: "M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z", color: "text-brand-gold", bg: "bg-brand-gold-pale" },
  { key: "afternoon", label: "Afternoon", icon: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-dosha-pitta", bg: "bg-dosha-pitta-bg" },
  { key: "evening",   label: "Evening",   icon: "M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z", color: "text-dosha-vata", bg: "bg-dosha-vata-bg" },
  { key: "night",     label: "Night",     icon: "M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z", color: "text-dosha-kapha", bg: "bg-dosha-kapha-bg" },
];

const DOSHA_COLORS: Record<Dosha, string> = {
  vata:  "var(--color-dosha-vata)",
  pitta: "var(--color-dosha-pitta)",
  kapha: "var(--color-dosha-kapha)",
};

/* ─────────────────────────────────────────────────────────
   PRACTICE ITEM
───────────────────────────────────────────────────────── */

function PracticeItem({ practice, isCompleted, onToggle }: {
  practice: RoutinePractice;
  isCompleted: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.div
      layout
      className={cn(
        "flex items-center gap-4 p-4 rounded-xl border transition-all duration-300",
        isCompleted
          ? "bg-status-success-bg border-status-success/20 opacity-80"
          : "bg-surface-card border-border-default hover:shadow-sm",
      )}
      whileTap={{ scale: 0.99 }}>

      {/* Checkbox */}
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0",
          "transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-gold",
          isCompleted
            ? "bg-status-success border-status-success"
            : "border-border-strong hover:border-brand-burgundy",
        )}
        aria-label={isCompleted ? "Mark as incomplete" : "Mark as complete"}>
        <AnimatePresence>
          {isCompleted && (
            <motion.svg className="w-3.5 h-3.5 text-text-inverted" viewBox="0 0 12 12" fill="none"
              initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 500 }}>
              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </motion.svg>
          )}
        </AnimatePresence>
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className={cn(
            "text-body-sm font-semibold transition-colors duration-200",
            isCompleted ? "text-text-muted line-through" : "text-text-heading",
          )}>
            {practice.name}
          </p>
          {practice.doshaRecommended && (
            <div className="w-2 h-2 rounded-full shrink-0"
              style={{ background: DOSHA_COLORS[practice.doshaRecommended] }}
              title={`Recommended for ${practice.doshaRecommended}`}
            />
          )}
        </div>
        <p className="text-label text-text-muted">{practice.description}</p>
      </div>

      {/* Duration */}
      {practice.durationMinutes > 0 && (
        <span className="text-label text-text-disabled shrink-0 tabular-nums">
          {practice.durationMinutes}m
        </span>
      )}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────── */

export default function RoutinePage() {
  const shouldReduce = useReducedMotion();
  const { result: prakritiResult } = usePrakritiStore();
  const {
    practices,
    setPractices,
    togglePractice,
    isCompleted,
    getCompletionPercentage,
    resetToday,
  } = useRoutineStore();

  const [activeSection, setActiveSection] = React.useState<RoutinePractice["timeOfDay"] | "all">("all");

  // Load practices
  React.useEffect(() => {
    if (practices.length === 0) {
      setPractices(MOCK_PRACTICES);
    }
  }, [practices.length, setPractices]);

  const completionPct = getCompletionPercentage();
  const completedCount = practices.filter((p) => isCompleted(p.id)).length;
  const totalMinutes = practices.reduce((s, p) => s + p.durationMinutes, 0);

  const filteredPractices = activeSection === "all"
    ? practices
    : practices.filter((p) => p.timeOfDay === activeSection);

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long",
  });

  return (
    <PageContainer className="py-8 max-w-3xl mx-auto">

      {/* Header */}
      <motion.div className="mb-8"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start justify-between gap-4 mb-1">
          <div>
            <h1 className="text-h1 font-display font-bold text-text-heading">
              Daily Routine
            </h1>
            <p className="text-body text-text-muted">{today}</p>
          </div>
          <button type="button" onClick={resetToday}
            className="text-body-sm text-text-muted hover:text-text-body transition-colors mt-1">
            Reset today
          </button>
        </div>
      </motion.div>

      {/* Progress overview */}
      <motion.div
        className="flex flex-col sm:flex-row gap-5 p-6 rounded-2xl border border-border-default bg-surface-card shadow-sm mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}>

        <div className="flex items-center gap-5">
          <ProgressRing
            value={completionPct}
            variant="routine"
            size={90}
            strokeWidth={8}
            animate={!shouldReduce}
          />
          <div>
            <p className="text-h3 font-bold text-text-heading">
              {completedCount}/{practices.length}
            </p>
            <p className="text-body-sm text-text-muted">practices completed</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 sm:ml-auto items-center">
          <div className="text-center">
            <p className="text-h4 font-bold text-text-heading">{totalMinutes}</p>
            <p className="text-label text-text-muted">total minutes</p>
          </div>
          <div className="text-center">
            <p className="text-h4 font-bold text-brand-gold">7</p>
            <p className="text-label text-text-muted">day streak</p>
          </div>
          {completionPct === 100 && (
            <Badge variant="success" size="md">
              ✓ All complete!
            </Badge>
          )}
        </div>
      </motion.div>

      {/* Prakriti notice */}
      {prakritiResult && (
        <motion.div
          className="flex items-center gap-3 p-4 rounded-xl bg-brand-gold-pale border border-brand-gold/20 mb-6"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <div className="w-2 h-2 rounded-full bg-brand-gold shrink-0"/>
          <p className="text-body-sm text-text-muted">
            Practices marked with a coloured dot are especially beneficial for your{" "}
            <span className="font-semibold text-text-heading capitalize">
              {prakritiResult.primaryDosha}
            </span>{" "}
            Prakriti.
          </p>
        </motion.div>
      )}

      {/* Section filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
        <button type="button"
          onClick={() => setActiveSection("all")}
          className={cn(
            "shrink-0 px-4 py-2 rounded-xl text-body-sm font-medium border transition-all duration-150",
            activeSection === "all"
              ? "bg-brand-burgundy text-text-inverted border-brand-burgundy"
              : "bg-surface-card text-text-muted border-border-default hover:border-brand-burgundy/40",
          )}>
          All ({practices.length})
        </button>
        {TIME_SECTIONS.map((section) => {
          const sectionPractices = practices.filter((p) => p.timeOfDay === section.key);
          const sectionCompleted = sectionPractices.filter((p) => isCompleted(p.id)).length;
          return (
            <button key={section.key} type="button"
              onClick={() => setActiveSection(section.key)}
              className={cn(
                "shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-body-sm font-medium border transition-all duration-150",
                activeSection === section.key
                  ? "bg-brand-burgundy text-text-inverted border-brand-burgundy"
                  : "bg-surface-card text-text-muted border-border-default hover:border-brand-burgundy/40",
              )}>
              <svg className={cn("w-3.5 h-3.5", activeSection === section.key ? "text-text-inverted" : section.color)}
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={section.icon}/>
              </svg>
              {section.label}
              <span className={cn(
                "text-micro font-bold px-1.5 py-0.5 rounded-pill",
                activeSection === section.key ? "bg-white/20" : "bg-bg-subtle",
              )}>
                {sectionCompleted}/{sectionPractices.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Practices */}
      <motion.div className="flex flex-col gap-3" layout>
        {activeSection === "all" ? (
          TIME_SECTIONS.map((section) => {
            const sectionPractices = filteredPractices.filter((p) => p.timeOfDay === section.key);
            if (sectionPractices.length === 0) return null;
            return (
              <div key={section.key} className="mb-2">
                {/* Section header */}
                <div className="flex items-center gap-2 mb-3">
                  <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", section.bg)}>
                    <svg className={cn("w-3.5 h-3.5", section.color)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={section.icon}/>
                    </svg>
                  </div>
                  <h3 className="text-body-sm font-semibold text-text-muted uppercase tracking-wider">
                    {section.label}
                  </h3>
                  <div className="flex-1 h-px bg-border-default"/>
                </div>

                <div className="flex flex-col gap-2">
                  {sectionPractices.map((practice) => (
                    <PracticeItem
                      key={practice.id}
                      practice={practice}
                      isCompleted={isCompleted(practice.id)}
                      onToggle={() => togglePractice(practice.id)}
                    />
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col gap-2">
            {filteredPractices.map((practice) => (
              <PracticeItem
                key={practice.id}
                practice={practice}
                isCompleted={isCompleted(practice.id)}
                onToggle={() => togglePractice(practice.id)}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Completion celebration */}
      <AnimatePresence>
        {completionPct === 100 && (
          <motion.div
            className="mt-8 p-6 rounded-2xl text-center border border-status-success/20 bg-status-success-bg"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring" }}>
            <p className="text-2xl mb-2">🎉</p>
            <h3 className="text-h3 font-display font-bold text-status-success mb-2">
              Dinacharya Complete!
            </h3>
            <p className="text-body-sm text-text-muted mb-4">
              You have completed all practices for today. Your Arogya Score will update shortly.
            </p>
            <Badge variant="success" size="lg">+5 Arogya points earned</Badge>
          </motion.div>
        )}
      </AnimatePresence>
    </PageContainer>
  );
}