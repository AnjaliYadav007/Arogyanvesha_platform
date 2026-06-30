"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { usePrakritiStore, useAuthStore } from "@/stores";
import { PageContainer } from "@/components/layout/PageContainer";
import { prakritiAnalyzing, processingStep } from "@/lib/animations";
import { api } from "@/lib/api";
import type { Dosha, PrakritiResult } from "@/types";

const STEPS = [
  { text: "Analyzing physical body frames and physical traits...", delay: 0.5 },
  { text: "Assessing digestive strength and appetite patterns...", delay: 1.8 },
  { text: "Evaluating mental responses and sleep characteristics...", delay: 3.0 },
  { text: "Calculating your custom Vata-Pitta-Kapha Dosha balance...", delay: 4.2 },
];

export default function PrakritiAnalyzingPage() {
  const router = useRouter();
  const { answers, setResult, resetQuiz } = usePrakritiStore();
  const { user, updateUser } = useAuthStore();
  const [errorOccurred, setErrorOccurred] = React.useState(false);

  React.useEffect(() => {
    // If no answers, redirect back to the quiz page
    if (!answers || answers.length === 0) {
      router.replace("/prakriti/quiz");
      return;
    }

    const calculateAndSave = async () => {
      try {
        const vataCount = answers.filter((a) => a.dosha === "vata").length;
        const pittaCount = answers.filter((a) => a.dosha === "pitta").length;
        const kaphaCount = answers.filter((a) => a.dosha === "kapha").length;
        const total = answers.length || 1;

        let vata = Math.round((vataCount / total) * 100);
        let pitta = Math.round((pittaCount / total) * 100);
        let kapha = Math.round((kaphaCount / total) * 100);

        // Adjust rounding error so they sum to exactly 100%
        const diff = 100 - (vata + pitta + kapha);
        if (diff !== 0) {
          if (vata >= pitta && vata >= kapha) vata += diff;
          else if (pitta >= vata && pitta >= kapha) pitta += diff;
          else kapha += diff;
        }

        const doshas: { name: Dosha; value: number }[] = [
          { name: "vata", value: vata },
          { name: "pitta", value: pitta },
          { name: "kapha", value: kapha },
        ];
        // Sort highest to lowest
        doshas.sort((a, b) => b.value - a.value);

        const primaryDosha = doshas[0]?.name || "vata";
        const secondaryDosha = doshas[1]?.name || "pitta";

        const calculatedResult: PrakritiResult = {
          id: "prakriti-" + Math.random().toString(36).substring(2, 11),
          userId: user?.id || "anonymous",
          primaryDosha,
          secondaryDosha,
          balance: { vata, pitta, kapha },
          completedAt: new Date().toISOString(),
          recommendations: [],
        };

        // Call the API endpoint to persist in Firestore or LocalDB
        await api.post("/prakriti/save", {
          email: user?.email,
          primaryDosha,
          secondaryDosha,
          balance: { vata, pitta, kapha },
        });

        // Minimum delay to let the user see the complete animation (5.5 seconds)
        await new Promise((resolve) => setTimeout(resolve, 5500));

        // Update local stores
        setResult(calculatedResult);
        updateUser({
          prakritiCompleted: true,
          primaryDosha,
        });

        // Redirect to results screen
        router.replace("/prakriti/result");
      } catch (err) {
        console.error("Error analyzing quiz results:", err);
        setErrorOccurred(true);
      }
    };

    calculateAndSave();
  }, [answers, router, setResult, user?.id, updateUser]);

  if (errorOccurred) {
    return (
      <PageContainer className="min-h-screen flex flex-col items-center justify-center text-center p-6 bg-bg-base">
        <div className="w-16 h-16 rounded-full bg-status-error-bg border border-status-error/20 flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-status-error" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h1 className="text-h2 font-bold text-text-heading mb-3">Analysis failed</h1>
        <p className="text-body text-text-muted mb-8 max-w-md">
          Something went wrong while processing your assessment answers. Please try again.
        </p>
        <button
          type="button"
          onClick={() => {
            resetQuiz();
            router.replace("/prakriti/quiz");
          }}
          className="px-6 py-3 rounded-xl bg-brand-burgundy text-white font-medium hover:bg-brand-burgundy/90 transition-colors"
        >
          Retake Assessment
        </button>
      </PageContainer>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center p-6 overflow-hidden">
      <div className="w-full max-w-md flex flex-col items-center text-center">
        {/* Animated Mandala Container */}
        <div className="relative w-44 h-44 mb-10 flex items-center justify-center">
          {/* Outer glow ring */}
          <motion.div
            className="absolute inset-0 rounded-full border border-brand-gold/10"
            variants={prakritiAnalyzing as any}
            animate="pulse"
          />

          {/* Rotating Mandala */}
          <motion.div
            className="w-36 h-36 relative select-none pointer-events-none"
            variants={prakritiAnalyzing as any}
            animate="rotate"
          >
            <svg viewBox="0 0 100 100" fill="none" className="w-full h-full text-brand-gold/45">
              {/* Outer decorative ring */}
              <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
              <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="0.8" />
              {/* 8 Lotus petals */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                <path
                  key={angle}
                  d="M 50 50 C 35 15, 65 15, 50 50 Z"
                  stroke="currentColor"
                  strokeWidth="1"
                  fill="currentColor"
                  fillOpacity="0.03"
                  transform={`rotate(${angle} 50 50)`}
                />
              ))}
              {/* Inner ring */}
              <circle cx="50" cy="50" r="20" stroke="currentColor" strokeWidth="1" />
              <circle cx="50" cy="50" r="8" fill="currentColor" fillOpacity="0.15" />
            </svg>
          </motion.div>
        </div>

        {/* Dynamic loading text */}
        <h2 className="text-h2 font-display font-bold text-text-heading mb-4">
          Discovering Your Prakriti
        </h2>
        <p className="text-body text-text-muted mb-8 max-w-xs leading-relaxed">
          Our system is analyzing your dosha dynamics. This will only take a moment.
        </p>

        {/* Processing steps list */}
        <div className="w-full bg-surface-card border border-border-default rounded-2xl p-5 flex flex-col gap-4 text-left shadow-sm">
          {STEPS.map((step, idx) => (
            <motion.div
              key={idx}
              className="flex items-center gap-3"
              variants={processingStep(step.delay)}
              initial="hidden"
              animate="visible"
            >
              {/* Checkmark or loader indicator */}
              <div className="w-5 h-5 rounded-full border border-brand-gold/40 flex items-center justify-center shrink-0">
                <motion.div
                  className="w-2.5 h-2.5 rounded-full bg-brand-gold"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: step.delay + 0.3, type: "spring" }}
                />
              </div>
              <span className="text-body-sm font-medium text-text-body">
                {step.text}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
