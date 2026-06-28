"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useUIStore, useAuthStore } from "@/stores";
import { useIsDesktop } from "@/hooks";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { sidebarCollapse } from "@/lib/animations";

/* ─────────────────────────────────────────────────────────
   NAV ICONS
───────────────────────────────────────────────────────── */

function NavIcon({ path }: { path: string }) {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────
   NAV ITEMS CONFIG
───────────────────────────────────────────────────────── */

const NAV_GROUPS = [
  {
    label: "Core",
    items: [
      { href: "/dashboard",  label: "Dashboard",        iconPath: "M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" },
      { href: "/prakriti",   label: "Prakriti",         iconPath: "M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" },
      { href: "/symptoms",   label: "Symptom Checker",  iconPath: "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" },
      { href: "/chat",       label: "AI Vaidya",        iconPath: "M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z", badge: "AI" },
    ],
  },
  {
    label: "Wellness",
    items: [
      { href: "/yoga",       label: "Yoga",             iconPath: "M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" },
      { href: "/skin",       label: "Skin Analysis",    iconPath: "M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" },
      { href: "/routine",    label: "Daily Routine",    iconPath: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" },
      { href: "/progress",   label: "My Progress",      iconPath: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" },
    ],
  },
  {
    label: "Explore",
    items: [
      { href: "/wisdom",     label: "Wisdom Library",   iconPath: "M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" },
      { href: "/herbs",      label: "Herbs",            iconPath: "M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" },
    ],
  },
] as const;

/* ─────────────────────────────────────────────────────────
   COLLAPSE TOGGLE ICON
───────────────────────────────────────────────────────── */

function CollapseIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg
      className={cn("w-4 h-4 transition-transform duration-220", collapsed && "rotate-180")}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────── */

export function Sidebar() {
  const pathname = usePathname();
  const { isSidebarExpanded, toggleSidebar, setSidebarExpanded } = useUIStore();
  const { user } = useAuthStore();
  const isDesktop = useIsDesktop();

  // Auto-collapse on tablet
  React.useEffect(() => {
    if (!isDesktop) setSidebarExpanded(false);
    else setSidebarExpanded(true);
  }, [isDesktop, setSidebarExpanded]);

  const isExpanded = isDesktop ? isSidebarExpanded : false;

  return (
    <>
      {/* Mobile overlay backdrop */}
      <AnimatePresence>
        {!isDesktop && isSidebarExpanded && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarExpanded(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Sidebar panel */}
      <motion.aside
        className={cn(
          "fixed top-0 left-0 bottom-0 z-50",
          "flex flex-col",
          "glass border-r border-border-default",
          "overflow-hidden",
          // On mobile: full slide-in drawer
          "lg:translate-x-0",
          !isDesktop && !isSidebarExpanded && "-translate-x-full",
        )}
        animate={isDesktop
          ? (isExpanded ? sidebarCollapse.expanded : sidebarCollapse.collapsed)
          : { width: 240 }
        }
        transition={{ duration: 0.22, ease: "easeInOut" }}
        aria-label="Main navigation"
      >
        {/* Logo */}
        <div className={cn(
          "flex items-center gap-3 px-4 h-[64px] border-b border-border-default shrink-0",
          !isExpanded && "justify-center",
        )}>
          <div className="w-8 h-8 rounded-lg bg-brand-burgundy flex items-center justify-center shrink-0">
            <span className="text-text-inverted text-label font-bold">A</span>
          </div>
          <AnimatePresence>
            {isExpanded && (
              <motion.span
                className="text-h4 font-bold text-text-heading font-body whitespace-nowrap overflow-hidden"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.18 }}
              >
                Arogyanvesha
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Nav groups — scrollable */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="mb-6">
              {/* Group label */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.p
                    className="px-3 mb-1 text-label font-semibold text-text-disabled uppercase tracking-wider"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {group.label}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Nav items */}
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-label={item.label}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5",
                      "transition-all duration-150",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-gold",
                      !isExpanded && "justify-center",
                      isActive
                        ? "bg-brand-burgundy/10 text-brand-burgundy"
                        : "text-text-muted hover:bg-bg-subtle hover:text-text-body",
                    )}
                  >
                    <NavIcon path={item.iconPath} />

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.span
                          className="text-body-sm font-medium whitespace-nowrap overflow-hidden flex-1"
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.15 }}
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>

                    {"badge" in item && item.badge && isExpanded && (
                      <Badge variant="brand" size="sm">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div className={cn(
          "border-t border-border-default p-3 shrink-0",
          !isExpanded && "flex justify-center",
        )}>
          <Link
            href="/profile"
            className={cn(
              "flex items-center gap-3 rounded-lg p-2",
              "hover:bg-bg-subtle transition-colors duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-gold",
              !isExpanded && "justify-center",
            )}
          >
            <Avatar
              src={user?.avatarUrl}
              name={user?.name ?? "User"}
              size="sm"
              dosha={user?.primaryDosha}
            />
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  className="flex flex-col min-w-0"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <span className="text-body-sm font-semibold text-text-heading truncate">
                    {user?.name ?? "User"}
                  </span>
                  <span className="text-label text-text-muted truncate">
                    {user?.email ?? ""}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* Collapse toggle — desktop only */}
        {isDesktop && (
          <button
            type="button"
            onClick={toggleSidebar}
            className={cn(
              "absolute top-[72px] -right-3",
              "w-6 h-6 rounded-full",
              "bg-surface-card border border-border-default shadow-sm",
              "flex items-center justify-center",
              "text-text-muted hover:text-text-body",
              "transition-colors duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-gold",
            )}
            aria-label={isSidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            <CollapseIcon collapsed={!isSidebarExpanded} />
          </button>
        )}
      </motion.aside>
    </>
  );
}

Sidebar.displayName = "Sidebar";