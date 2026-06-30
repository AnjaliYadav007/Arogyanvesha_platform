"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageContainer } from "@/components/layout/PageContainer";

const TREATMENTS = [
  { herb: "Ginger Tea", dosage: "1 cup, 2x daily", confidence: "high" as const, desc: "Kindles digestive fire and soothes headache from Vata imbalance" },
  { herb: "Brahmi", dosage: "300mg, 1x daily", confidence: "medium" as const, desc: "Calms the nervous system and reduces stress-related tension" },
  { herb: "Peppermint Oil", dosage: "Apply diluted to temples", confidence: "high" as const, desc: "Cooling effect relieves tension headaches" },
];

export default function SymptomResultPage() {
  const router = useRouter();

  return (
    <PageContainer className="py-8 max-w-2xl mx-auto">
      <motion.div className="flex flex-col gap-8" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>

        {/* Medical disclaimer — always visible */}
        <div className="p-4 rounded-xl bg-status-error-bg border border-status-error/20">
          <p className="text-body-sm text-text-body font-medium">
            ⚕️ This is general Ayurvedic guidance, not a medical diagnosis. If symptoms are severe or worsening, seek professional medical care immediately.
          </p>
        </div>

        {/* Dosha imbalance */}
        <div className="p-6 rounded-2xl border border-dosha-vata/20" style={{ background: "var(--color-dosha-vata-bg)" }}>
          <Badge variant="vata" size="md" className="mb-3">Vata Imbalance Detected</Badge>
          <h1 className="text-h2 font-display font-bold text-text-heading mb-2">Likely Vata Aggravation</h1>
          <p className="text-body text-text-muted leading-relaxed">
            Your symptoms (headache, irregular pattern, stress-related) suggest excess Vata —
            the air and space energy associated with movement and the nervous system.
          </p>
        </div>

        {/* Treatment list */}
        <div>
          <h3 className="text-h4 font-semibold text-text-heading mb-4">Recommended Remedies</h3>
          <div className="flex flex-col gap-3">
            {TREATMENTS.map((t) => (
              <div key={t.herb} className="flex items-start gap-4 p-4 rounded-xl bg-surface-card border border-border-default">
                <div className="w-10 h-10 rounded-lg bg-dosha-kapha-bg flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-dosha-kapha" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-body-sm font-semibold text-text-heading">{t.herb}</p>
                    <Badge variant={t.confidence === "high" ? "success" : "warning"} size="sm" className="capitalize">
                      {t.confidence} confidence
                    </Badge>
                  </div>
                  <p className="sanskrit text-label mb-1">{t.dosage}</p>
                  <p className="text-label text-text-muted">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Doctor referral */}
        <div className="p-5 rounded-xl bg-bg-subtle border border-border-default text-center">
          <p className="text-body-sm text-text-muted mb-3">
            If symptoms persist beyond 7 days or worsen, consult a healthcare provider.
          </p>
          <Button variant="secondary" size="sm">Find a practitioner</Button>
        </div>

        <div className="flex gap-3">
          <Button variant="primary" onClick={() => router.push("/chat")} className="bg-gradient-burgundy border-0 shadow-burgundy">
            Discuss with AI Vaidya
          </Button>
          <Button variant="ghost" onClick={() => router.push("/symptoms")}>New check</Button>
        </div>
      </motion.div>
    </PageContainer>
  );
}