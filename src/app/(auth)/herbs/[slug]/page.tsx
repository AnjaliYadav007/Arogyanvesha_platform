

"use client";

import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageContainer } from "@/components/layout/PageContainer";
import type { Dosha } from "@/types";

const HERB_DATA: Record<string, {
  name: string; sanskritName: string; category: string;
  description: string; benefits: string[];
  doshaEffect: Record<Dosha, "increases" | "decreases" | "neutral">;
  preparation: string[]; contraindications: string[];
  ayurvedicProperties: { rasa: string; virya: string; vipaka: string };
}> = {
  ashwagandha: {
    name: "Ashwagandha", sanskritName: "Withania somnifera", category: "Adaptogen",
    description: "The premier adaptogenic herb of Ayurveda, Ashwagandha (meaning 'smell of horse') builds strength, vitality and resilience. It is classified as a Rasayana — a rejuvenating tonic that promotes longevity and quality of life.",
    benefits: ["Reduces stress and anxiety (cortisol reduction)", "Improves sleep quality and duration", "Builds muscle mass and physical endurance", "Supports healthy thyroid function", "Enhances cognitive function and memory", "Balances blood sugar levels", "Anti-inflammatory and antioxidant effects"],
    doshaEffect: { vata: "decreases", pitta: "neutral", kapha: "decreases" },
    preparation: ["Powder (churna): 1/2–1 teaspoon with warm milk and honey before bed", "Capsules: 300–500mg standardised extract twice daily", "Decoction: Boil 1 tsp in 2 cups water, reduce to 1 cup", "Herbal milk: Simmer in milk with cardamom and saffron"],
    contraindications: ["Pregnancy (may cause uterine contractions)", "Autoimmune conditions (consult practitioner)", "Hyperthyroidism (may increase thyroid activity)", "Sedative medications (may enhance effect)"],
    ayurvedicProperties: { rasa: "Bitter, Astringent, Sweet", virya: "Hot (Ushna)", vipaka: "Sweet (Madhura)" },
  },
};

function getFallbackHerb(slug: string) {
  const name = slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  return {
    name, sanskritName: "Herb", category: "Ayurvedic Herb",
    description: "A powerful Ayurvedic herb with extensive healing properties.",
    benefits: ["Supports overall health", "Balances the Doshas", "Promotes wellbeing"],
    doshaEffect: { vata: "neutral" as const, pitta: "neutral" as const, kapha: "neutral" as const },
    preparation: ["Consult an Ayurvedic practitioner for proper dosage"],
    contraindications: ["Consult a qualified practitioner before use"],
    ayurvedicProperties: { rasa: "Various", virya: "Varies", vipaka: "Varies" },
  };
}

const DOSHA_EFFECT_CONFIG = {
  decreases: { label: "Decreases",     color: "text-status-success", bg: "bg-status-success-bg" },
  increases: { label: "Increases",     color: "text-status-error",   bg: "bg-status-error-bg"   },
  neutral:   { label: "Neutral effect",color: "text-text-muted",     bg: "bg-bg-subtle"          },
};

export default function HerbDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const herb = HERB_DATA[slug] ?? getFallbackHerb(slug);

  return (
    <PageContainer className="py-8 max-w-3xl mx-auto">

      {/* Back */}
      <button type="button" onClick={() => router.push("/herbs")}
        className="flex items-center gap-2 text-body-sm text-text-muted hover:text-text-body transition-colors mb-6">
        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd"/>
        </svg>
        Back to encyclopedia
      </button>

      <motion.div className="flex flex-col gap-8"
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

        {/* Hero */}
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="w-24 h-24 rounded-2xl bg-dosha-kapha-bg flex items-center justify-center shrink-0">
            <svg className="w-12 h-12 text-dosha-kapha" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"/>
            </svg>
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant="outline" size="md">{herb.category}</Badge>
            </div>
            <h1 className="text-h1 font-display font-bold text-text-heading mb-1">{herb.name}</h1>
            <p className="sanskrit text-body-sm mb-4">{herb.sanskritName}</p>
            <p className="text-body text-text-muted leading-relaxed">{herb.description}</p>
          </div>
        </div>

        {/* Ayurvedic properties */}
        <div className="p-5 rounded-xl bg-brand-gold-pale border border-brand-gold/20">
          <h3 className="text-h4 font-semibold text-text-heading mb-4">Ayurvedic Properties</h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Rasa (Taste)", value: herb.ayurvedicProperties.rasa },
              { label: "Virya (Potency)", value: herb.ayurvedicProperties.virya },
              { label: "Vipaka (Post-digestive)", value: herb.ayurvedicProperties.vipaka },
            ].map((prop) => (
              <div key={prop.label} className="text-center">
                <p className="text-label text-text-muted mb-1">{prop.label}</p>
                <p className="text-body-sm font-semibold text-text-heading">{prop.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Dosha effects */}
        <div className="p-6 rounded-xl bg-surface-card border border-border-default shadow-sm">
          <h3 className="text-h4 font-semibold text-text-heading mb-4">Effect on Doshas</h3>
          <div className="flex flex-col gap-3">
            {(["vata", "pitta", "kapha"] as Dosha[]).map((dosha) => {
              const effect = herb.doshaEffect[dosha];
              const config = DOSHA_EFFECT_CONFIG[effect];
              return (
                <div key={dosha} className="flex items-center gap-4">
                  <span className="text-body-sm font-semibold text-text-heading capitalize w-16">{dosha}</span>
                  <span className={cn(
                    "text-body-sm font-medium px-3 py-1 rounded-pill",
                    config.color, config.bg,
                  )}>
                    {config.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Benefits + Preparation grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl bg-surface-card border border-border-default shadow-sm">
            <h3 className="text-h4 font-semibold text-text-heading mb-4">Benefits</h3>
            <ul className="flex flex-col gap-2.5">
              {herb.benefits.map((b) => (
                <li key={b} className="flex items-start gap-2.5 text-body-sm text-text-body">
                  <svg className="w-4 h-4 text-status-success shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd"/>
                  </svg>
                  {b}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-6 rounded-xl bg-surface-card border border-border-default shadow-sm">
            <h3 className="text-h4 font-semibold text-text-heading mb-4">Preparation & Dosage</h3>
            <ul className="flex flex-col gap-3">
              {herb.preparation.map((p, i) => (
                <li key={i} className="flex items-start gap-2.5 text-body-sm text-text-body">
                  <span className="w-5 h-5 rounded-full bg-brand-burgundy/10 text-brand-burgundy text-micro font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contraindications */}
        <div className="p-5 rounded-xl bg-status-warning-bg border border-status-warning/20">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-status-warning" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
            </svg>
            <h3 className="text-h4 font-semibold text-text-heading">Contraindications</h3>
          </div>
          <ul className="flex flex-col gap-2">
            {herb.contraindications.map((c) => (
              <li key={c} className="text-body-sm text-text-body flex items-start gap-2">
                <span className="text-status-warning mt-0.5">·</span>{c}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="flex gap-3 pt-2">
          <Button variant="primary" onClick={() => router.push("/chat")}
            className="bg-gradient-burgundy border-0 shadow-burgundy">
            Ask AI Vaidya about {herb.name}
          </Button>
          <Button variant="ghost" onClick={() => router.push("/herbs")}>
            More herbs
          </Button>
        </div>
      </motion.div>
    </PageContainer>
  );
}