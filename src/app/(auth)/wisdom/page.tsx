"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn, formatDate } from "@/lib/utils";
import { useReducedMotion } from "@/hooks";
import { SearchBar } from "@/components/ui/SearchBar";
import { Chip } from "@/components/ui/Badge";
import { Badge } from "@/components/ui/Badge";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageContainer } from "@/components/layout/PageContainer";
import type { WisdomArticle } from "@/types";

/* ─────────────────────────────────────────────────────────
   MOCK DATA
───────────────────────────────────────────────────────── */

const MOCK_ARTICLES: WisdomArticle[] = [
  { id: "a1", slug: "dinacharya-daily-routine", title: "Dinacharya: The Ayurvedic Daily Routine", excerpt: "Discover how aligning your daily schedule with nature's rhythms can transform your energy, digestion, and mental clarity.", content: "", category: "Lifestyle", tags: ["dinacharya", "routine", "daily"], readTimeMinutes: 6, publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() },
  { id: "a2", slug: "three-doshas-explained", title: "The Three Doshas: Vata, Pitta and Kapha Explained", excerpt: "An in-depth exploration of the three biological energies that govern every aspect of your physical and mental experience.", content: "", category: "Ayurveda Basics", tags: ["doshas", "vata", "pitta", "kapha"], readTimeMinutes: 8, publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString() },
  { id: "a3", slug: "agni-digestive-fire", title: "Agni: The Sacred Digestive Fire", excerpt: "In Ayurveda, strong digestion is the foundation of health. Learn how to kindle your Agni and transform your wellbeing.", content: "", category: "Digestive Health", tags: ["agni", "digestion", "gut health"], readTimeMinutes: 5, publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString() },
  { id: "a4", slug: "ritucharya-seasonal-guide", title: "Ritucharya: Living in Harmony with the Seasons", excerpt: "Ayurveda teaches that adapting your diet and lifestyle to each season is essential for maintaining Dosha balance year-round.", content: "", category: "Seasonal Living", tags: ["ritucharya", "seasons", "lifestyle"], readTimeMinutes: 7, publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString() },
  { id: "a5", slug: "ojas-vitality-essence", title: "Ojas: The Essence of Vitality and Immunity", excerpt: "Ojas is the subtle essence that governs immunity, vitality and spiritual wellbeing. Discover how to build and protect yours.", content: "", category: "Vitality", tags: ["ojas", "immunity", "vitality"], readTimeMinutes: 6, publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString() },
  { id: "a6", slug: "ayurvedic-sleep-wisdom", title: "Nidra: The Ayurvedic Science of Sleep", excerpt: "Why sleep is one of the three pillars of health in Ayurveda and how to optimise yours for deep, restorative rest.", content: "", category: "Sleep", tags: ["sleep", "nidra", "rest"], readTimeMinutes: 5, publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString() },
  { id: "a7", slug: "prakriti-constitution-guide", title: "Understanding Your Prakriti: A Complete Guide", excerpt: "Your Prakriti is your unique constitutional blueprint. This comprehensive guide explains what it means and how it shapes every aspect of your life.", content: "", category: "Ayurveda Basics", tags: ["prakriti", "constitution", "doshas"], readTimeMinutes: 10, publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 21).toISOString() },
  { id: "a8", slug: "abhyanga-oil-massage", title: "Abhyanga: The Healing Practice of Self-Oil Massage", excerpt: "This ancient Ayurvedic practice nourishes tissues, calms the nervous system and grounds Vata — taking just 10 minutes a day.", content: "", category: "Lifestyle", tags: ["abhyanga", "self-care", "vata"], readTimeMinutes: 4, publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25).toISOString() },
];

const CATEGORIES = ["All", "Ayurveda Basics", "Lifestyle", "Digestive Health", "Seasonal Living", "Vitality", "Sleep"];

/* ─────────────────────────────────────────────────────────
   ARTICLE CARD
───────────────────────────────────────────────────────── */

function ArticleCard({ article, index, shouldReduce }: {
  article: WisdomArticle;
  index: number;
  shouldReduce: boolean;
}) {
  const categoryColors: Record<string, string> = {
    "Ayurveda Basics":  "bg-dosha-vata-bg text-dosha-vata",
    "Lifestyle":        "bg-brand-gold-pale text-brand-gold",
    "Digestive Health": "bg-dosha-pitta-bg text-dosha-pitta",
    "Seasonal Living":  "bg-surface-sage text-sage",
    "Vitality":         "bg-status-success-bg text-status-success",
    "Sleep":            "bg-dosha-kapha-bg text-dosha-kapha",
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: shouldReduce ? 0 : index * 0.06 }}
    >
      <Link href={`/wisdom/${article.slug}`}
        className={cn(
          "group flex flex-col gap-4 p-6 rounded-xl border border-border-default bg-surface-card",
          "hover:shadow-lg hover:-translate-y-1 transition-all duration-300",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-gold",
        )}>

        {/* Category + read time */}
        <div className="flex items-center justify-between gap-2">
          <span className={cn(
            "text-micro font-semibold px-2.5 py-1 rounded-pill",
            categoryColors[article.category] ?? "bg-bg-subtle text-text-muted",
          )}>
            {article.category}
          </span>
          <span className="text-micro text-text-muted flex items-center gap-1">
            <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd"/>
            </svg>
            {article.readTimeMinutes} min read
          </span>
        </div>

        {/* Title */}
        <h3 className={cn(
          "text-h4 font-semibold text-text-heading leading-snug",
          "group-hover:text-brand-burgundy transition-colors duration-200",
        )}>
          {article.title}
        </h3>

        {/* Excerpt */}
        <p className="text-body-sm text-text-muted leading-relaxed truncate-3">
          {article.excerpt}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border-default">
          <span className="text-label text-text-disabled">
            {formatDate(article.publishedAt)}
          </span>
          <span className={cn(
            "text-body-sm font-semibold text-brand-burgundy",
            "inline-flex items-center gap-1 group-hover:gap-2 transition-all duration-200",
          )}>
            Read article
            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd"/>
            </svg>
          </span>
        </div>
      </Link>
    </motion.article>
  );
}

/* ─────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────── */

export default function WisdomPage() {
  const shouldReduce = useReducedMotion();
  const [search, setSearch] = React.useState("");
  const [activeCategory, setActiveCategory] = React.useState("All");
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const filtered = MOCK_ARTICLES.filter((a) => {
    const matchCat = activeCategory === "All" || a.category === activeCategory;
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.excerpt.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const featured = MOCK_ARTICLES[0]!;

  return (
    <PageContainer className="py-8">

      {/* Header */}
      <motion.div className="mb-8"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}>
        <h1 className="text-h1 font-display font-bold text-text-heading mb-2">
          Wisdom Library
        </h1>
        <p className="text-body text-text-muted mb-6">
          Ancient Ayurvedic knowledge curated for modern life
        </p>

        {/* Search */}
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search articles…"
          size="md"
          className="max-w-lg"
        />
      </motion.div>

      {/* Featured article */}
      {!search && activeCategory === "All" && (
        <motion.div className="mb-8"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}>
          <Link href={`/wisdom/${featured.slug}`}
            className={cn(
              "group flex flex-col md:flex-row gap-6 p-7 rounded-2xl",
              "border border-brand-gold/20 hover:shadow-lg hover:-translate-y-0.5",
              "transition-all duration-300",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-gold",
            )}
            style={{ background: "linear-gradient(135deg, var(--color-brand-gold-pale) 0%, var(--color-surface-card) 100%)" }}>

            {/* Decorative illustration */}
            <div className="flex items-center justify-center w-full md:w-48 h-36 md:h-auto rounded-xl bg-brand-gold/8 shrink-0">
              <svg viewBox="0 0 120 120" className="w-24 h-24" fill="none">
                <circle cx="60" cy="60" r="40" stroke="var(--color-brand-gold)" strokeWidth="1" opacity="0.3" strokeDasharray="4 4"/>
                <circle cx="60" cy="60" r="28" fill="var(--color-brand-gold)" opacity="0.08"/>
                <path d="M60 30 C60 30 45 45 45 60 C45 75 60 90 60 90 C60 90 75 75 75 60 C75 45 60 30 60 30Z"
                  fill="var(--color-brand-gold)" opacity="0.2"/>
                <circle cx="60" cy="60" r="8" fill="var(--color-brand-gold)" opacity="0.5"/>
                {[0,60,120,180,240,300].map((a, i) => {
                  const rad = (a * Math.PI) / 180;
                  return <line key={i}
                    x1={60 + 15 * Math.cos(rad)} y1={60 + 15 * Math.sin(rad)}
                    x2={60 + 35 * Math.cos(rad)} y2={60 + 35 * Math.sin(rad)}
                    stroke="var(--color-brand-gold)" strokeWidth="1" opacity="0.35"/>;
                })}
              </svg>
            </div>

            <div className="flex flex-col justify-center gap-3">
              <div className="flex items-center gap-2">
                <Badge variant="gold" size="sm">Featured</Badge>
                <span className="text-label text-text-muted">{featured.readTimeMinutes} min read</span>
              </div>
              <h2 className={cn(
                "text-h2 font-display font-bold text-text-heading leading-snug",
                "group-hover:text-brand-burgundy transition-colors duration-200",
              )}>
                {featured.title}
              </h2>
              <p className="text-body text-text-muted leading-relaxed max-w-xl">
                {featured.excerpt}
              </p>
              <span className="text-body-sm font-semibold text-brand-burgundy inline-flex items-center gap-1.5 group-hover:gap-3 transition-all duration-200 mt-1">
                Read article
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd"/>
                </svg>
              </span>
            </div>
          </Link>
        </motion.div>
      )}

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {CATEGORIES.map((cat) => (
          <Chip key={cat} selected={activeCategory === cat}
            onClick={() => setActiveCategory(cat)} size="sm">
            {cat}
          </Chip>
        ))}
      </div>

      {/* Article grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonLoader key={i} variant="card"/>)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          variant="no-results"
          title="No articles found"
          description="Try a different search term or category."
          action={
            <button type="button" onClick={() => { setSearch(""); setActiveCategory("All"); }}
              className="text-body-sm font-semibold text-brand-burgundy hover:underline underline-offset-4">
              Clear filters
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((article, i) => (
            <ArticleCard key={article.id} article={article} index={i} shouldReduce={shouldReduce}/>
          ))}
        </div>
      )}
    </PageContainer>
  );
}