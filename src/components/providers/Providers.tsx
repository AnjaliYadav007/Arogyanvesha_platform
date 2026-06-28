/**
 * Arogyanvesha — Provider Tree
 * Wraps the entire app. Order matters:
 * SessionProvider → ThemeProvider → ToastProvider → children
 *
 * Used in src/app/layout.tsx as:
 *   <Providers>{children}</Providers>
 */

"use client";

import * as React from "react";
import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "@/components/ui/Toast";
import { useThemeStore } from "@/stores/themeStore";

/* ─────────────────────────────────────────────────────────
   THEME SYNC
   Applies .dark class to <html> on mount and when
   theme changes. Runs only on client.
───────────────────────────────────────────────────────── */

function ThemeSync() {
  const { theme, setTheme } = useThemeStore();

  React.useEffect(() => {
    // Apply theme on mount
    setTheme(theme);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      if (theme === "system") {
        setTheme("system");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, setTheme]);

  return null;
}

/* ─────────────────────────────────────────────────────────
   PROVIDERS
───────────────────────────────────────────────────────── */

export interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ThemeSync />
      <ToastProvider maxToasts={3}>
        {children}
      </ToastProvider>
    </SessionProvider>
  );
}