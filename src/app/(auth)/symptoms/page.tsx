"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/Input";
import { Slider } from "@/components/ui/Slider";
import { Chip } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageContainer } from "@/components/layout/PageContainer";

const COMMON_SYMPTOMS = ["Headache", "Fatigue", "Bloating", "Insomnia", "Joint pain", "Anxiety", "Acid reflux", "Skin irritation"];
const DURATIONS = ["Less than a day", "1-3 days", "4-7 days", "More than a week", "Chronic (months+)"];
const BODY_AREAS = ["Head", "Chest", "Abdomen", "Back", "Joints", "Skin"];

export default function SymptomsPage() {
  const router = useRouter();
  const [symptomText, setSymptomText] = React.useState("");
  const [selectedSymptoms, setSelectedSymptoms] = React.useState<string[]>([]);
  const [duration, setDuration] = React.useState("");
  const [severity, setSeverity] = React.useState(5);
  const [bodyArea, setBodyArea] = React.useState<string[]>([]);

  const toggle = (arr: string[], set: (v: string[]) => void, val: string) =>
    set(arr.includes(val) ? arr.filter(v=>v!==val) : [...arr, val]);

  const canSubmit = selectedSymptoms.length > 0 && duration;

  return (
    <PageContainer className="py-8 max-w-2xl mx-auto">
      <motion.div className="flex flex-col gap-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

        <div>
          <h1 className="text-h1 font-display font-bold text-text-heading mb-1">Symptom Checker</h1>
          <p className="text-body text-text-muted">Describe what you're experiencing for Ayurvedic insights</p>
        </div>

        <div className="p-5 rounded-xl bg-status-warning-bg border border-status-warning/20">
          <p className="text-body-sm text-text-body">
            ⚕️ This tool provides general Ayurvedic guidance, not medical diagnosis. For emergencies, contact a doctor immediately.
          </p>
        </div>

        {/* Free text input */}
        <Input label="Describe your symptoms (optional)" placeholder="e.g. I've had a dull headache since yesterday morning"
          value={symptomText} onChange={(e)=>setSymptomText(e.target.value)} />

        {/* Common symptoms */}
        <div>
          <p className="text-body-sm font-medium text-text-heading mb-3">Select common symptoms</p>
          <div className="flex flex-wrap gap-2">
            {COMMON_SYMPTOMS.map((s) => (
              <Chip key={s} selected={selectedSymptoms.includes(s)} onClick={() => toggle(selectedSymptoms, setSelectedSymptoms, s)}>
                {s}
              </Chip>
            ))}
          </div>
        </div>

        {/* Body area */}
        <div>
          <p className="text-body-sm font-medium text-text-heading mb-3">Affected area</p>
          <div className="flex flex-wrap gap-2">
            {BODY_AREAS.map((a) => (
              <Chip key={a} selected={bodyArea.includes(a)} onClick={() => toggle(bodyArea, setBodyArea, a)}>
                {a}
              </Chip>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div>
          <p className="text-body-sm font-medium text-text-heading mb-3">How long has this been occurring?</p>
          <div className="flex flex-wrap gap-2">
            {DURATIONS.map((d) => (
              <Chip key={d} selected={duration === d} onClick={() => setDuration(d)}>{d}</Chip>
            ))}
          </div>
        </div>

        {/* Severity */}
        <Slider label="Severity" value={severity} onChange={setSeverity} min={1} max={10}
          formatValue={(v) => v <= 3 ? `${v} (Mild)` : v <= 6 ? `${v} (Moderate)` : `${v} (Severe)`} />

        <Button variant="primary" size="lg" disabled={!canSubmit} className="bg-gradient-burgundy border-0 shadow-burgundy"
          onClick={() => router.push("/symptoms/result")}>
          Get Ayurvedic Insights
        </Button>
      </motion.div>
    </PageContainer>
  );
}