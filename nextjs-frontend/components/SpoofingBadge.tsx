import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const LABEL_NAMES: Record<string, string> = {
  fake_mask: "Fake Mask",
  fake_printed: "Fake Printed",
  fake_mannequin: "Fake Mannequin",
  fake_unknown: "Fake Unknown",
  fake_screen: "Fake Screen",
  real_person: "Real Person",
};

const LABEL_STYLES: Record<string, string> = {
  real_person:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-300",
  fake_mask:
    "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-300",
  fake_printed:
    "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900/70 dark:bg-orange-950/40 dark:text-orange-300",
  fake_mannequin:
    "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900/70 dark:bg-purple-950/40 dark:text-purple-300",
  fake_unknown:
    "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200",
  fake_screen:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/70 dark:bg-amber-950/40 dark:text-amber-300",
};

const BAR_STYLES: Record<string, string> = {
  real_person: "bg-emerald-500",
  fake_mask: "bg-rose-500",
  fake_printed: "bg-orange-500",
  fake_mannequin: "bg-purple-500",
  fake_unknown: "bg-slate-500",
  fake_screen: "bg-amber-500",
};

export function getLabelName(label: string) {
  const normalized = normalizePredictionLabel(label);
  return LABEL_NAMES[normalized] ?? label.replaceAll("_", " ");
}

export function getLabelStyle(label: string) {
  const normalized = normalizePredictionLabel(label);
  return (
    LABEL_STYLES[normalized] ??
    "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
  );
}

export function getBarStyle(label: string) {
  return BAR_STYLES[normalizePredictionLabel(label)] ?? "bg-slate-500";
}

export function normalizePredictionLabel(label: string) {
  const normalized = label.toLowerCase().trim().replace(/[\s-]+/g, "_");
  const aliases: Record<string, string> = {
    real: "real_person",
    realperson: "real_person",
    real_person: "real_person",
    fake_mask: "fake_mask",
    mask: "fake_mask",
    fake_screen: "fake_screen",
    screen_replay: "fake_screen",
    screen: "fake_screen",
    replay: "fake_screen",
    fake_printed: "fake_printed",
    printed_face: "fake_printed",
    print: "fake_printed",
    printed: "fake_printed",
    fake_mannequin: "fake_mannequin",
    mannequin: "fake_mannequin",
    fake_unknown: "fake_unknown",
    unknown_spoof: "fake_unknown",
    unknown: "fake_unknown",
  };
  return aliases[normalized] ?? normalized;
}

export function SpoofingBadge({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-normal",
        getLabelStyle(label),
        className,
      )}
    >
      {getLabelName(label)}
    </Badge>
  );
}
