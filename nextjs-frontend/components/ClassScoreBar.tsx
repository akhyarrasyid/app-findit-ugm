import { getBarStyle, getLabelName } from "@/components/SpoofingBadge";

export function ClassScoreBar({ label, score }: { label: string; score: number }) {
  const percent = Math.round(score * 100);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-slate-700 dark:text-slate-200">
          {getLabelName(label)}
        </span>
        <span className="tabular-nums text-slate-500 dark:text-slate-400">
          {percent}%
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${getBarStyle(label)}`}
          style={{ width: `${Math.max(percent, score > 0 ? 2 : 1)}%` }}
        />
      </div>
    </div>
  );
}
