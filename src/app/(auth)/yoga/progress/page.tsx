"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { PageContainer } from "@/components/layout/PageContainer";

const WEEKLY_DATA = [
  { day: "Mon", minutes: 30, completed: true  },
  { day: "Tue", minutes: 45, completed: true  },
  { day: "Wed", minutes: 0,  completed: false },
  { day: "Thu", minutes: 20, completed: true  },
  { day: "Fri", minutes: 0,  completed: false },
  { day: "Sat", minutes: 0,  completed: false },
  { day: "Sun", minutes: 0,  completed: false },
];

const ACHIEVEMENTS = [
  { title: "First Session",   desc: "Completed your first yoga session",        earned: true  },
  { title: "Week Warrior",    desc: "Practised 5 days in a single week",         earned: true  },
  { title: "Streak Master",   desc: "Maintained a 7-day streak",                 earned: false },
  { title: "Dosha Devotee",   desc: "Completed 10 Dosha-specific sessions",      earned: false },
];

export default function YogaProgressPage() {
  const totalMinutes = WEEKLY_DATA.reduce((s, d) => s + d.minutes, 0);
  const daysCompleted = WEEKLY_DATA.filter((d) => d.completed).length;
  const weeklyGoal = 5;
  const maxMinutes = Math.max(...WEEKLY_DATA.map((d) => d.minutes), 1);

  return (
    <PageContainer className="py-8 max-w-3xl mx-auto">

      <motion.div className="mb-8"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-h1 font-display font-bold text-text-heading">My Progress</h1>
          <Link href="/yoga">
            <Button variant="ghost" size="sm">Back to sessions</Button>
          </Link>
        </div>
        <p className="text-body text-text-muted">This week&apos;s yoga journey</p>
      </motion.div>

      {/* Weekly summary */}
      <motion.div className="grid grid-cols-3 gap-4 mb-8"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="col-span-1 flex flex-col items-center justify-center p-6 rounded-xl bg-surface-card border border-border-default shadow-sm">
          <ProgressRing
            value={Math.round((daysCompleted / weeklyGoal) * 100)}
            variant="routine"
            size={100}
            strokeWidth={10}
            sublabel="weekly goal"
            animate
          />
        </div>
        <div className="col-span-2 grid grid-cols-2 gap-4">
          {[
            { label: "Days practised", value: `${daysCompleted}/${weeklyGoal}` },
            { label: "Total minutes",  value: totalMinutes.toString()          },
            { label: "Sessions done",  value: "3"                              },
            { label: "Streak",         value: "3 days"                        },
          ].map((s) => (
            <div key={s.label} className="p-4 rounded-xl bg-surface-card border border-border-default shadow-xs">
              <p className="text-label text-text-muted mb-1">{s.label}</p>
              <p className="text-h3 font-bold text-text-heading">{s.value}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Bar chart */}
      <motion.div className="p-6 rounded-xl bg-surface-card border border-border-default shadow-sm mb-8"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h3 className="text-h4 font-semibold text-text-heading mb-6">Daily Activity</h3>
        <div className="flex items-end gap-2 h-32">
          {WEEKLY_DATA.map((day, i) => (
            <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex items-end justify-center" style={{ height: "96px" }}>
                <motion.div
                  className={cn(
                    "w-full rounded-t-md",
                    day.completed ? "bg-brand-burgundy" : "bg-border-default",
                  )}
                  initial={{ height: 0 }}
                  animate={{ height: day.minutes > 0 ? `${(day.minutes / maxMinutes) * 96}px` : "4px" }}
                  transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
              <span className="text-label text-text-muted">{day.day}</span>
              {day.minutes > 0 && (
                <span className="text-micro text-text-disabled">{day.minutes}m</span>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h3 className="text-h4 font-semibold text-text-heading mb-4">Achievements</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ACHIEVEMENTS.map((a) => (
            <div key={a.title}
              className={cn(
                "flex items-center gap-4 p-4 rounded-xl border transition-all",
                a.earned
                  ? "bg-brand-gold-pale border-brand-gold/20"
                  : "bg-surface-card border-border-default opacity-50",
              )}>
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                a.earned ? "bg-brand-gold/20" : "bg-bg-subtle",
              )}>
                <svg className={cn("w-5 h-5", a.earned ? "text-brand-gold" : "text-text-disabled")}
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0"/>
                </svg>
              </div>
              <div>
                <p className="text-body-sm font-semibold text-text-heading">{a.title}</p>
                <p className="text-label text-text-muted">{a.desc}</p>
              </div>
              {a.earned && (
                <svg className="w-5 h-5 text-brand-gold ml-auto shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd"/>
                </svg>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </PageContainer>
  );
}