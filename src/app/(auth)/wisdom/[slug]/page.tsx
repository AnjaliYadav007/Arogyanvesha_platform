"use client";

import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {  formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { PageContainer } from "@/components/layout/PageContainer";

const ARTICLE_CONTENT: Record<string, { title: string; category: string; readTime: number; publishedAt: string; content: string }> = {
  "dinacharya-daily-routine": {
    title: "Dinacharya: The Ayurvedic Daily Routine",
    category: "Lifestyle",
    readTime: 6,
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    content: `## What is Dinacharya?

Dinacharya (दिनचर्या) literally means "daily conduct" in Sanskrit. It is the Ayurvedic science of aligning your daily schedule with the natural rhythms of the earth, the sun, and your own body's internal clock.

According to the classical texts — particularly the *Ashtanga Hridayam* — a well-designed Dinacharya is the single most powerful tool for preventing disease and maintaining lifelong health.

## The Three Biological Clocks

Ayurveda recognises that each Dosha governs different times of the day:

- **Vata time**: 2am–6am and 2pm–6pm — best for creativity, meditation, and light activities
- **Kapha time**: 6am–10am and 6pm–10pm — exercise in the morning; wind down in the evening  
- **Pitta time**: 10am–2pm and 10pm–2am — peak digestion and metabolic activity

## Morning Practices (6–10am)

**1. Wake before sunrise** — Rising during Vata time (before 6am) gives the day a light, clear quality.

**2. Tongue scraping (Jihwa Prakshalana)** — Use a copper or stainless steel scraper to remove the Ama (toxins) that accumulate on the tongue overnight.

**3. Oil pulling (Kavala Graha)** — Swish 1 tablespoon of sesame or coconut oil for 5–15 minutes to strengthen the gums and remove bacteria.

**4. Warm water** — Drink 1–2 glasses of warm water to stimulate bowel movement and rehydrate after sleep.

**5. Abhyanga** — Self-massage with warm sesame oil grounds Vata, improves circulation and nourishes the skin.

**6. Yoga and Pranayama** — Even 20 minutes of movement and breathwork sets a positive tone for the entire day.

## The Importance of Consistency

In Ayurveda, consistency is medicine. Doing moderate practices every day far outweighs doing intensive practices occasionally. The body thrives on rhythm — regular mealtimes, sleep times, and movement routines create a biological stability that is deeply healing.

> *"Hitahara vihara sevana"* — One who follows wholesome diet and lifestyle attains health.  
> — Charaka Samhita

## Getting Started

Begin with just one practice. Tongue scraping takes 30 seconds and creates an immediate shift in your morning. Add practices one by one over 30 days rather than overhauling your entire routine overnight.`,
  },
};

function getFallback(slug: string) {
  return {
    title: slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
    category: "Ayurveda",
    readTime: 5,
    publishedAt: new Date().toISOString(),
    content: "This article is coming soon. Check back shortly for the full content.",
  };
}

export default function WisdomArticlePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const article = ARTICLE_CONTENT[slug] ?? getFallback(slug);

  const renderContent = (content: string) => {
    return content.split("\n\n").map((block, i) => {
      if (block.startsWith("## ")) {
        return <h2 key={i} className="text-h2 font-display font-bold text-text-heading mt-8 mb-4 first:mt-0">{block.slice(3)}</h2>;
      }
      if (block.startsWith("**") && block.includes("**\n")) {
        const lines = block.split("\n");
        return (
          <div key={i} className="mb-4">
            {lines.map((line, j) => {
              if (line.startsWith("**") && line.endsWith("**")) {
                return <p key={j} className="font-semibold text-text-heading text-body">{line.slice(2, -2)}</p>;
              }
              if (line.startsWith("- **")) {
                const parts = line.slice(2).split("**");
                return <p key={j} className="text-body text-text-body leading-relaxed mb-2">• <strong>{parts[1]}</strong>{parts[2]}</p>;
              }
              return line ? <p key={j} className="text-body text-text-body leading-relaxed">{line}</p> : null;
            })}
          </div>
        );
      }
      if (block.startsWith("> ")) {
        return (
          <blockquote key={i} className="border-l-4 border-brand-gold pl-5 my-6 italic">
            <p className="text-body-lg text-text-muted leading-relaxed">
              {block.slice(2).split("\n").map((l, j) => (
                <span key={j}>{l.startsWith("> ") ? l.slice(2) : l}<br/></span>
              ))}
            </p>
          </blockquote>
        );
      }
      return <p key={i} className="text-body text-text-body leading-reading mb-4">{block}</p>;
    });
  };

  return (
    <div className="min-h-screen bg-bg-base">
      {/* Reading progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-border-default">
        <div className="h-full bg-brand-burgundy w-1/3"/>
      </div>

      <PageContainer narrow className="py-10">
        {/* Back */}
        <button type="button" onClick={() => router.push("/wisdom")}
          className="flex items-center gap-2 text-body-sm text-text-muted hover:text-text-body transition-colors mb-8">
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd"/>
          </svg>
          Back to library
        </button>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <Badge variant="gold" size="md">{article.category}</Badge>
            <span className="text-body-sm text-text-muted">{article.readTime} min read</span>
            <span className="text-body-sm text-text-muted">·</span>
            <span className="text-body-sm text-text-muted">{formatDate(article.publishedAt)}</span>
          </div>

          {/* Title */}
          <h1 className="text-h1 font-display font-bold text-text-heading mb-8 leading-tight">
            {article.title}
          </h1>

          {/* Divider */}
          <div className="w-16 h-0.5 bg-brand-gold mb-8"/>

          {/* Content */}
          <div className="prose-content">
            {renderContent(article.content)}
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-border-default flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <p className="text-body-sm text-text-muted">
              Based on classical Ayurvedic texts including Charaka Samhita and Ashtanga Hridayam
            </p>
            <div className="flex gap-3">
              <button type="button" onClick={() => router.push("/wisdom")}
                className="text-body-sm font-semibold text-brand-burgundy hover:underline underline-offset-4">
                More articles
              </button>
              <button type="button" onClick={() => router.push("/chat")}
                className="text-body-sm font-semibold text-brand-burgundy hover:underline underline-offset-4">
                Ask AI Vaidya
              </button>
            </div>
          </div>
        </motion.div>
      </PageContainer>
    </div>
  );
}