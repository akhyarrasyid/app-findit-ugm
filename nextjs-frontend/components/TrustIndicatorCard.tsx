import type { LucideIcon } from "lucide-react";

export function TrustIndicatorCard({
  title,
  description,
  Icon,
}: {
  title: string;
  description: string;
  Icon: LucideIcon;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <p className="font-semibold text-slate-950 dark:text-slate-100">{title}</p>
          <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
