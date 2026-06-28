"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn, clampNumber } from "@/lib/utils";
import type { Dosha } from "@/types";

/* ─────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────── */

export type ProgressRingVariant = "arogya" | "dosha" | "routine" | "default";

export interface ProgressRingProps {
  /** 0–100 */
  value: number;
  /** Visual variant determines color scheme */
  variant?: ProgressRingVariant;
  /** Required when variant is "dosha" */
  dosha?: Dosha | null;
  /** Diameter in px — default 120 */
  size?: number;
  /** Ring stroke thickness — default 10 */
  strokeWidth?: number;
  /** Center label — defaults to percentage */
  label?: React.ReactNode;
  /** Small text below the center label */
  sublabel?: string;
  /** Animate value on mount */
  animate?: boolean;
  className?: string;
}

/* ─────────────────────────────────────────────────────────
   COLOR MAP
───────────────────────────────────────────────────────── */

function getStrokeColor(
  variant: ProgressRingVariant,
  value: number,
  dosha?: Dosha | null,
): string {
  if (variant === "dosha" && dosha) {
    const map: Record<Dosha, string> = {
      vata:  "var(--color-dosha-vata)",
      pitta: "var(--color-dosha-pitta)",
      kapha: "var(--color-dosha-kapha)",
    };
    return map[dosha];
  }

  if (variant === "arogya") {
    if (value >= 75) return "var(--color-status-success)";
    if (value >= 50) return "var(--color-brand-gold)";
    if (value >= 25) return "var(--color-status-warning)";
    return "var(--color-status-error)";
  }

  if (variant === "routine") {
    return "var(--color-status-success)";
  }

  // default
  return "var(--color-brand-burgundy)";
}

/* ─────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────── */

export function ProgressRing({
  value,
  variant = "default",
  dosha,
  size = 120,
  strokeWidth = 10,
  label,
  sublabel,
  animate = true,
  className,
}: ProgressRingProps) {
  const shouldReduce = useReducedMotion();
  const clampedValue = clampNumber(value, 0, 100);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const strokeDashoffset = circumference - (clampedValue / 100) * circumference;
  const strokeColor = getStrokeColor(variant, clampedValue, dosha);

  const defaultLabel = (
    <span
      className={cn(
        "font-body font-bold text-text-heading tabular-nums",
        size >= 120 ? "text-h3" : size >= 80 ? "text-h4" : "text-body-sm",
      )}
    >
      {clampedValue}
      <span className="text-text-muted font-normal text-body-sm">%</span>
    </span>
  );

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={sublabel ?? `Progress: ${clampedValue}%`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
        className="absolute inset-0 -rotate-90"
        aria-hidden="true"
      >
        {/* Track — background ring */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="var(--color-border-default)"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Progress ring */}
        {shouldReduce || !animate ? (
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        ) : (
          <motion.circle
            cx={center}
            cy={center}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{
              duration: 1.2,
              ease: [0.16, 1, 0.3, 1],
              delay: 0.1,
            }}
          />
        )}
      </svg>

      {/* Center content */}
      <div className="relative flex flex-col items-center justify-center gap-0.5 z-10">
        {label ?? defaultLabel}
        {sublabel && (
          <span className="text-micro text-text-muted text-center leading-tight max-w-[70%]">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}

ProgressRing.displayName = "ProgressRing";