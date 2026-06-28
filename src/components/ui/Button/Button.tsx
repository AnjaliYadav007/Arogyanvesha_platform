"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────
   CVA VARIANTS
   Blueprint §7.1 Button spec — all variants and sizes defined here.
───────────────────────────────────────────────────────── */

const buttonVariants = cva(
  // Base styles applied to every variant
  [
    "inline-flex items-center justify-center gap-2",
    "font-body font-semibold",
    "border border-transparent",
    "rounded-lg",
    "cursor-pointer select-none",
    "transition-all duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-gold focus-visible:ring-offset-2",
    "disabled:opacity-45 disabled:pointer-events-none",
    "active:scale-[0.97]",
  ],
  {
    variants: {
      variant: {
        /** Primary — burgundy fill, main CTA */
        primary: [
          "bg-brand-burgundy text-text-inverted border-brand-burgundy",
          "hover:bg-brand-burgundy-light hover:shadow-burgundy hover:-translate-y-0.5",
        ],
        /** Primary Gold — gold fill, premium/upgrade CTA */
        "primary-gold": [
          "bg-brand-gold text-text-primary border-brand-gold",
          "hover:bg-brand-gold-light hover:shadow-gold hover:-translate-y-0.5",
        ],
        /** Secondary — outlined burgundy */
        secondary: [
          "bg-transparent text-brand-burgundy border-brand-burgundy",
          "hover:bg-brand-burgundy hover:text-text-inverted hover:-translate-y-0.5",
        ],
        /** Ghost — no border, subtle hover */
        ghost: [
          "bg-transparent text-text-body border-transparent",
          "hover:bg-bg-subtle hover:text-text-heading",
        ],
        /** Sage — green toned, used for completed/positive actions */
        sage: [
          "bg-surface-sage text-status-success border-border-sage",
          "hover:bg-status-success hover:text-text-inverted hover:-translate-y-0.5",
        ],
        /** Danger — destructive actions */
        danger: [
          "bg-status-error text-text-inverted border-status-error",
          "hover:opacity-90 hover:-translate-y-0.5",
        ],
        /** Link — looks like a text link */
        link: [
          "bg-transparent text-brand-burgundy border-transparent underline-offset-4",
          "hover:underline",
          "h-auto p-0",
        ],
      },
      size: {
        xs: "h-7 px-3 text-label rounded-md gap-1",
        sm: "h-9 px-4 text-body-sm",
        md: "h-11 px-5 text-body",
        lg: "h-13 px-6 text-body-lg",
        xl: "h-15 px-8 text-body-xl",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

/* ─────────────────────────────────────────────────────────
   SPINNER
───────────────────────────────────────────────────────── */

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("animate-spin", className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────
   BUTTON PROPS
───────────────────────────────────────────────────────── */

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Shows spinner and locks width — label hidden but kept for a11y */
  isLoading?: boolean;
  /** Icon before label */
  leftIcon?: React.ReactNode;
  /** Icon after label */
  rightIcon?: React.ReactNode;
  /** Icon-only mode — requires aria-label on the button */
  iconOnly?: boolean;
}

/* ─────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────── */

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      isLoading = false,
      leftIcon,
      rightIcon,
      iconOnly = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const shouldReduce = useReducedMotion();

    const spinnerSize: Record<NonNullable<typeof size>, string> = {
      xs: "w-3 h-3",
      sm: "w-3.5 h-3.5",
      md: "w-4 h-4",
      lg: "w-5 h-5",
      xl: "w-5 h-5",
    };

    const resolvedSize = size ?? "md";

    return (
      <motion.button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled ?? isLoading}
        whileTap={shouldReduce ? undefined : { scale: 0.97 }}
        {...(props as React.ComponentProps<typeof motion.button>)}
      >
        {isLoading ? (
          <>
            <Spinner className={spinnerSize[resolvedSize]} />
            {/* Keep children in DOM for width stability, hide visually */}
            <span className="sr-only">{children}</span>
          </>
        ) : (
          <>
            {leftIcon && (
              <span className="shrink-0" aria-hidden="true">
                {leftIcon}
              </span>
            )}
            {iconOnly ? (
              <span aria-hidden="true">{children}</span>
            ) : (
              <span>{children}</span>
            )}
            {rightIcon && (
              <span className="shrink-0" aria-hidden="true">
                {rightIcon}
              </span>
            )}
          </>
        )}
      </motion.button>
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };