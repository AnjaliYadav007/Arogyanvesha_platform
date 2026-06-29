"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PageContainer } from "@/components/layout/PageContainer";
import type { YogaSession } from "@/types";

/* ─────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────── */

type FullSession = YogaSession & {
  poses?: string[];
  benefits?: string[];
  instructions?: string[];
};

/* ─────────────────────────────────────────────────────────
   MOCK DATA
───────────────────────────────────────────────────────── */

const MOCK_SESSIONS: Record<string, FullSession> = {
  y1: {
    id: "y1", title: "Vata-Balancing Morning Flow",
    description: "Gentle grounding sequence to calm Vata and start your day with stability and warmth.",
    durationMinutes: 30, level: "beginner", category: "morning", doshaTarget: "vata",
    isFavorited: true, completionCount: 5,
    poses: ["Tadasana (Mountain Pose)", "Balasana (Child's Pose)", "Adho Mukha Svanasana (Downward Dog)", "Virabhadrasana I (Warrior I)", "Vrksasana (Tree Pose)", "Savasana (Corpse Pose)"],
    benefits: ["Grounds Vata energy", "Warms the body gently", "Improves focus and stability", "Reduces anxiety", "Sets a calm tone for the day"],
    instructions: ["Begin in Tadasana — feel your feet rooted to the earth", "Move slowly and mindfully — Vata benefits from slowness", "Hold each pose for 5–8 breaths rather than flowing quickly", "Focus on the exhale to release scattered Vata energy", "End with at least 10 minutes of Savasana"],
  },
};

function getFallbackSession(id: string): FullSession {
  return {
    id, title: "Yoga Session", description: "A rejuvenating yoga practice.",
    durationMinutes: 30, level: "beginner", category: "morning",
    doshaTarget: null, isFavorited: false, completionCount: 0,
  };
}

/* ─────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────── */

export default function YogaSessionPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const session = MOCK_SESSIONS[id] ?? getFallbackSession(id);
  const [started, setStarted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [favorited, setFavorited] = useState(session.isFavorited ?? false);

  // Timer
  useEffect(() => {
    if (!started) return;
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, [started]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const progress = Math.min((elapsed / (session.durationMinutes * 60)) * 100, 100);

  const doshaColors = { vata: "vata" as const, pitta: "pitta" as const, kapha: "kapha" as const };
  const levelColors = { beginner: "success" as const, intermediate: "warning" as const, advanced: "error" as const };

  return (
    <PageContainer className="py-8 max-w-3xl mx-auto">

      {/* Back */}
      <button type="button" onClick={() => router.push("/yoga")}
        className="flex items-center gap-2 text-body-sm text-text-muted hover:text-text-body transition-colors mb-6">
        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd"/>
        </svg>
        Back to sessions
      </button>

      {/* Hero */}
      <motion.div
        className="rounded-2xl overflow-hidden mb-8 border border-border-default"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}>

        {/* Video placeholder */}
        <div className={cn(
          "relative h-64 flex items-center justify-center",
          "bg-gradient-to-br from-bg-canvas to-bg-subtle",
        )}>
          {started ? (
            <div className="text-center">
              <motion.p className="text-display font-bold text-brand-burgundy font-display mb-2"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity }}>
                {formatTime(elapsed)}
              </motion.p>
              <p className="text-body text-text-muted">of {session.durationMinutes}:00</p>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-brand-burgundy/90 flex items-center justify-center mb-4 mx-auto shadow-burgundy cursor-pointer hover:scale-105 transition-transform"
                onClick={() => setStarted(true)}>
                <svg className="w-7 h-7 text-text-inverted ml-1" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
              <p className="text-body-sm text-text-muted">Click to begin session</p>
            </div>
          )}

          {/* Progress bar */}
          {started && (
            <div className="absolute bottom-0 inset-x-0 h-1 bg-border-default">
              <motion.div className="h-full bg-brand-burgundy"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}/>
            </div>
          )}
        </div>

        {/* Session info */}
        <div className="p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-h2 font-display font-bold text-text-heading mb-2">
                {session.title}
              </h1>
              <div className="flex flex-wrap gap-2">
                <Badge variant={levelColors[session.level]} size="sm" className="capitalize">
                  {session.level}
                </Badge>
                {session.doshaTarget && (
                  <Badge variant={doshaColors[session.doshaTarget]} size="sm" className="capitalize">
                    {session.doshaTarget} balancing
                  </Badge>
                )}
                <Badge variant="default" size="sm">
                  {session.durationMinutes} min
                </Badge>
              </div>
            </div>
            <button type="button" onClick={() => setFavorited(!favorited)}
              className="p-2 rounded-lg hover:bg-bg-subtle transition-colors"
              aria-label={favorited ? "Remove from favorites" : "Add to favorites"}>
              <svg className={cn("w-5 h-5 transition-colors", favorited ? "text-status-error fill-status-error" : "text-text-muted")}
                viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/>
              </svg>
            </button>
          </div>

          <p className="text-body text-text-muted leading-relaxed mb-5">
            {session.description}
          </p>

          <div className="flex gap-3">
            {!started ? (
              <Button variant="primary" size="lg" className="bg-gradient-burgundy border-0 shadow-burgundy"
                onClick={() => setStarted(true)}>
                Begin session
              </Button>
            ) : (
              <>
                <Button variant="secondary" size="md" onClick={() => setStarted(false)}>
                  Pause
                </Button>
                <Button variant="sage" size="md" onClick={() => router.push("/yoga")}>
                  Mark complete
                </Button>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Details grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Poses */}
        {session.poses && (
          <motion.div className="p-6 rounded-xl bg-surface-card border border-border-default shadow-sm"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h3 className="text-h4 font-semibold text-text-heading mb-4">Poses in this session</h3>
            <ol className="flex flex-col gap-2.5">
              {session.poses.map((pose, i) => (
                <li key={pose} className="flex items-center gap-3 text-body-sm text-text-body">
                  <span className="w-6 h-6 rounded-full bg-brand-burgundy/10 text-brand-burgundy text-micro font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  {pose}
                </li>
              ))}
            </ol>
          </motion.div>
        )}

        {/* Benefits */}
        {session.benefits && (
          <motion.div className="p-6 rounded-xl bg-surface-card border border-border-default shadow-sm"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h3 className="text-h4 font-semibold text-text-heading mb-4">Benefits</h3>
            <ul className="flex flex-col gap-2.5">
              {session.benefits.map((b) => (
                <li key={b} className="flex items-start gap-2.5 text-body-sm text-text-body">
                  <svg className="w-4 h-4 text-status-success shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd"/>
                  </svg>
                  {b}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </div>
    </PageContainer>
  );
}