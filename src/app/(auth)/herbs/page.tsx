"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks";
import { SearchBar } from "@/components/ui/SearchBar";
import { Chip } from "@/components/ui/Badge";
import { Badge } from "@/components/ui/Badge";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageContainer } from "@/components/layout/PageContainer";
import type { Herb, Dosha } from "@/types";

/* ─────────────────────────────────────────────────────────
   MOCK DATA
───────────────────────────────────────────────────────── */

const MOCK_HERBS: Herb[] = [
  { id: "h1", slug: "ashwagandha", name: "Ashwagandha", sanskritName: "Withania somnifera", description: "The premier adaptogenic herb of Ayurveda, Ashwagandha builds strength, vitality and resilience while calming the nervous system.", benefits: ["Reduces stress and cortisol", "Improves sleep quality", "Builds muscle and endurance", "Supports thyroid function", "Enhances cognitive function"], doshaEffect: { vata: "decreases", pitta: "neutral", kapha: "decreases" }, category: "Adaptogen" },
  { id: "h2", slug: "triphala", name: "Triphala", sanskritName: "Terminalia chebula blend", description: "The most celebrated formula in Ayurveda, Triphala is a blend of three fruits that gently cleanses and rejuvenates the entire digestive system.", benefits: ["Gentle detoxification", "Improves digestion and absorption", "Rich in antioxidants", "Supports healthy weight", "Strengthens immunity"], doshaEffect: { vata: "decreases", pitta: "decreases", kapha: "decreases" }, category: "Digestive" },
  { id: "h3", slug: "brahmi", name: "Brahmi", sanskritName: "Bacopa monnieri", description: "The herb of consciousness and memory. Brahmi has been used for centuries to enhance cognitive function, reduce anxiety and support meditation.", benefits: ["Enhances memory and learning", "Reduces anxiety and stress", "Supports meditation practice", "Neuroprotective properties", "Improves concentration"], doshaEffect: { vata: "decreases", pitta: "decreases", kapha: "neutral" }, category: "Nervous System" },
  { id: "h4", slug: "shatavari", name: "Shatavari", sanskritName: "Asparagus racemosus", description: "The supreme tonic for women's health and one of the most important rejuvenating herbs in Ayurveda, Shatavari nourishes and strengthens.", benefits: ["Supports hormonal balance", "Promotes healthy digestion", "Builds Ojas and vitality", "Supports reproductive health", "Anti-inflammatory properties"], doshaEffect: { vata: "decreases", pitta: "decreases", kapha: "increases" }, category: "Tonic" },
  { id: "h5", slug: "turmeric", name: "Turmeric", sanskritName: "Curcuma longa", description: "The golden spice of India. Turmeric's potent anti-inflammatory and antioxidant properties make it one of the most studied herbs in the world.", benefits: ["Powerful anti-inflammatory", "Antioxidant protection", "Supports joint health", "Liver detoxification", "Digestive support"], doshaEffect: { vata: "decreases", pitta: "neutral", kapha: "decreases" }, category: "Anti-inflammatory" },
  { id: "h6", slug: "tulsi", name: "Tulsi", sanskritName: "Ocimum tenuiflorum", description: "The Queen of Herbs in Ayurveda. Tulsi is a sacred adaptogen that supports respiratory health, immunity and spiritual wellbeing.", benefits: ["Strengthens immunity", "Respiratory support", "Reduces stress", "Antibacterial properties", "Supports heart health"], doshaEffect: { vata: "decreases", pitta: "neutral", kapha: "decreases" }, category: "Adaptogen" },
  { id: "h7", slug: "amalaki", name: "Amalaki", sanskritName: "Phyllanthus emblica", description: "One of the richest natural sources of Vitamin C, Amalaki is the premier Pitta-reducing herb and one of Triphala's three fruits.", benefits: ["Highest natural Vitamin C", "Powerful antioxidant", "Supports immune system", "Promotes healthy skin and hair", "Balances Pitta dosha"], doshaEffect: { vata: "decreases", pitta: "decreases", kapha: "neutral" }, category: "Rejuvenative" },
  { id: "h8", slug: "ginger", name: "Ginger", sanskritName: "Zingiber officinale", description: "Universally celebrated in Ayurveda as the universal medicine (Vishwabhesaj), ginger kindles Agni and supports digestion and circulation.", benefits: ["Kindles digestive fire (Agni)", "Reduces nausea", "Anti-inflammatory", "Supports circulation", "Relieves respiratory congestion"], doshaEffect: { vata: "decreases", pitta: "increases", kapha: "decreases" }, category: "Digestive" },
];

const CATEGORIES = ["All", "Adaptogen", "Digestive", "Nervous System", "Tonic", "Anti-inflammatory", "Rejuvenative"];

const DOSHA_FILTERS: { value: Dosha | "all"; label: string }[] = [
  { value: "all", label: "All Doshas" },
  { value: "vata", label: "Vata" },
  { value: "pitta", label: "Pitta" },
  { value: "kapha", label: "Kapha" },
];

/* ─────────────────────────────────────────────────────────
   HERB CARD
───────────────────────────────────────────────────────── */

function HerbCard({ herb, index, shouldReduce }: {
  herb: Herb;
  index: number;
  shouldReduce: boolean;
}) {
  const doshaEffectColor = (effect: string) => {
    if (effect === "decreases") return "text-status-success";
    if (effect === "increases") return "text-status-error";
    return "text-text-muted";
  };

  const doshaEffectLabel = (effect: string) => {
    if (effect === "decreases") return "↓";
    if (effect === "increases") return "↑";
    return "~";
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: shouldReduce ? 0 : index * 0.06 }}>
      <Link href={`/herbs/${herb.slug}`}
        className={cn(
          "group flex flex-col gap-4 p-6 rounded-xl border border-border-default bg-surface-card h-full",
          "hover:shadow-lg hover:-translate-y-1 transition-all duration-300",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-gold",
        )}>

        {/* Icon + category */}
        <div className="flex items-start justify-between">
          <div className="w-14 h-14 rounded-2xl bg-dosha-kapha-bg flex items-center justify-center">
            <svg className="w-7 h-7 text-dosha-kapha" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"/>
            </svg>
          </div>
          <Badge variant="outline" size="sm">{herb.category}</Badge>
        </div>

        {/* Name */}
        <div>
          <h3 className={cn(
            "text-h4 font-bold text-text-heading mb-0.5",
            "group-hover:text-brand-burgundy transition-colors duration-200",
          )}>
            {herb.name}
          </h3>
          <p className="text-label sanskrit">{herb.sanskritName}</p>
        </div>

        {/* Description */}
        <p className="text-body-sm text-text-muted leading-relaxed truncate-3 flex-1">
          {herb.description}
        </p>

        {/* Dosha effects */}
        <div className="flex gap-3 pt-2 border-t border-border-default">
          {(["vata", "pitta", "kapha"] as Dosha[]).map((d) => (
            <div key={d} className="flex items-center gap-1">
              <span className="text-micro font-medium text-text-muted capitalize">{d}</span>
              <span className={cn("text-body-sm font-bold", doshaEffectColor(herb.doshaEffect[d]))}>
                {doshaEffectLabel(herb.doshaEffect[d])}
              </span>
            </div>
          ))}
        </div>
      </Link>
    </motion.article>
  );
}

/* ─────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────── */

export default function HerbsPage() {
  const shouldReduce = useReducedMotion();
  const [search, setSearch] = React.useState("");
  const [activeCategory, setActiveCategory] = React.useState("All");
  const [activeDosha, setActiveDosha] = React.useState<Dosha | "all">("all");
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const filtered = MOCK_HERBS.filter((h) => {
    const matchCat = activeCategory === "All" || h.category === activeCategory;
    const matchDosha = activeDosha === "all" || h.doshaEffect[activeDosha] === "decreases";
    const matchSearch = h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchDosha && matchSearch;
  });

  return (
    <PageContainer className="py-8">

      {/* Header */}
      <motion.div className="mb-8"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-h1 font-display font-bold text-text-heading mb-2">
          Herb Encyclopedia
        </h1>
        <p className="text-body text-text-muted mb-6">
          {MOCK_HERBS.length} Ayurvedic herbs with detailed profiles, benefits and Dosha effects
        </p>
        <SearchBar value={search} onChange={setSearch}
          placeholder="Search herbs…" size="md" className="max-w-lg"/>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => (
            <Chip key={cat} selected={activeCategory === cat}
              onClick={() => setActiveCategory(cat)} size="sm">
              {cat}
            </Chip>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          <span className="text-body-sm text-text-muted self-center mr-1">Good for:</span>
          {DOSHA_FILTERS.map((d) => (
            <Chip key={d.value} selected={activeDosha === d.value}
              onClick={() => setActiveDosha(d.value)} size="sm">
              {d.label}
            </Chip>
          ))}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonLoader key={i} variant="card"/>)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          variant="no-results"
          title="No herbs found"
          description="Try adjusting your search or filters."
          action={
            <button type="button"
              onClick={() => { setSearch(""); setActiveCategory("All"); setActiveDosha("all"); }}
              className="text-body-sm font-semibold text-brand-burgundy hover:underline underline-offset-4">
              Clear all filters
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filtered.map((herb, i) => (
            <HerbCard key={herb.id} herb={herb} index={i} shouldReduce={shouldReduce}/>
          ))}
        </div>
      )}
    </PageContainer>
  );
}