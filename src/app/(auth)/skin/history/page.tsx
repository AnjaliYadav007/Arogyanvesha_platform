"use client";

import { motion } from "framer-motion";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { PageContainer } from "@/components/layout/PageContainer";

const HISTORY = [
  { id: "s1", date: new Date(Date.now()-1000*60*60*24*3).toISOString(), score: 78 },
  { id: "s2", date: new Date(Date.now()-1000*60*60*24*30).toISOString(), score: 72 },
  { id: "s3", date: new Date(Date.now()-1000*60*60*24*60).toISOString(), score: 65 },
];

export default function SkinHistoryPage() {
  const maxScore = Math.max(...HISTORY.map(h=>h.score));

  return (
    <PageContainer className="py-8 max-w-2xl mx-auto">
      <motion.div className="flex flex-col gap-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

        <h1 className="text-h1 font-display font-bold text-text-heading">Skin Analysis History</h1>

        {/* Trend chart */}
        <div className="p-6 rounded-xl bg-surface-card border border-border-default">
          <h3 className="text-h4 font-semibold text-text-heading mb-4">Skin Health Trend</h3>
          <div className="flex items-end gap-4 h-32">
            {HISTORY.slice().reverse().map((h, i) => (
              <div key={h.id} className="flex-1 flex flex-col items-center gap-2">
                <motion.div className="w-full bg-status-info rounded-t-md"
                  initial={{ height: 0 }} animate={{ height: `${(h.score/maxScore)*100}px` }}
                  transition={{ delay: i*0.1, duration: 0.6 }}/>
                <span className="text-micro text-text-muted">{h.score}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {HISTORY.map((h) => (
            <div key={h.id} className="flex items-center justify-between p-4 rounded-xl bg-surface-card border border-border-default">
              <div>
                <p className="text-body-sm font-semibold text-text-heading">{formatDate(h.date)}</p>
                <p className="text-label text-text-muted">Health score: {h.score}/100</p>
              </div>
              <Badge variant={h.score >= 75 ? "success" : "warning"} size="md">{h.score}/100</Badge>
            </div>
          ))}
        </div>
      </motion.div>
    </PageContainer>
  );
}