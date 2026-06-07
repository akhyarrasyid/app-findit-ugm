"use client";

import { Activity, Home, ScanFace } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/scan", label: "Scan", Icon: ScanFace },
];

export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-300">
            <Activity className="h-4 w-4" />
          </span>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-slate-950 dark:text-slate-100">
              App FindIT
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              AI Liveness Verification
            </p>
          </div>
        </Link>

        <nav className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-900/80">
          {NAV_ITEMS.map(({ href, label, Icon }) => {
            const isActive =
              pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "inline-flex h-8 items-center gap-2 rounded-full px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-white hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100",
                  isActive &&
                    "bg-white text-slate-950 shadow-sm dark:bg-slate-800 dark:text-slate-100",
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
        </nav>

        <ThemeToggle />
      </div>
    </header>
  );
}
