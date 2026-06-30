"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {  formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageContainer } from "@/components/layout/PageContainer";

const MOCK_HISTORY = [
  { id: "s1", date: new Date(Date.now()-1000*60*60*24*3).toISOString(), skinType: "Pitta-Vata", score: 78, conditions: ["Mild dryness", "Slight sensitivity"] },
  { id: "s2", date: new Date(Date.now()-1000*60*60*24*30).toISOString(), skinType: "Pitta-Vata", score: 72, conditions: ["Dryness", "Redness"] },
];

export default function SkinHubPage() {
  const latest = MOCK_HISTORY[0];

  return (
    <PageContainer className="py-8 max-w-3xl mx-auto">
      <motion.div className="flex flex-col gap-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-h1 font-display font-bold text-text-heading mb-1">Skin Analysis</h1>
            <p className="text-body text-text-muted">AI-powered Ayurvedic skin assessment</p>
          </div>
          <Link href="/skin/capture">
            <Button variant="primary" className="bg-gradient-burgundy border-0 shadow-burgundy">
              New analysis
            </Button>
          </Link>
        </div>

        {latest ? (
          <div className="p-6 rounded-2xl border border-border-default bg-surface-card shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <p className="text-label font-semibold text-text-muted uppercase tracking-wider">Latest Analysis</p>
              <span className="text-label text-text-disabled">{formatDate(latest.date)}</span>
            </div>
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-status-info-bg flex items-center justify-center shrink-0">
                <svg className="w-10 h-10 text-status-info" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"/>
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-h3 font-bold text-text-heading">{latest.skinType} Skin</p>
                <p className="text-body-sm text-text-muted mb-2">Skin health score: {latest.score}/100</p>
                <div className="flex gap-2 flex-wrap">
                  {latest.conditions.map((c) => <Badge key={c} variant="info" size="sm">{c}</Badge>)}
                </div>
              </div>
              <Link href={`/skin/result/${latest.id}`}>
                <Button variant="secondary" size="sm">View details</Button>
              </Link>
            </div>
          </div>
        ) : (
          <EmptyState variant="generic" title="No analysis yet" description="Take your first skin analysis to get personalised Ayurvedic recommendations."
            action={<Link href="/skin/capture"><Button variant="primary">Start analysis</Button></Link>} />
        )}

        <div>
          <h3 className="text-h4 font-semibold text-text-heading mb-4">History</h3>
          <div className="flex flex-col gap-3">
            {MOCK_HISTORY.map((item) => (
              <Link key={item.id} href={`/skin/result/${item.id}`}
                className="flex items-center gap-4 p-4 rounded-xl bg-surface-card border border-border-default hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-lg bg-status-info-bg flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-status-info" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-body-sm font-semibold text-text-heading">{item.skinType} · Score {item.score}</p>
                  <p className="text-label text-text-muted">{formatDate(item.date)}</p>
                </div>
                <svg className="w-4 h-4 text-text-disabled" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd"/>
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </motion.div>
    </PageContainer>
  );
}