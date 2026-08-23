import { cn } from "@/lib/shared/utils";
import type { LucideIcon } from "lucide-react";

export function KpiCard({
  label,
  value,
  suffix,
  hint,
  change,
  changeTone = "up",
  icon: Icon,
  accent = "blue",
  valueClassName,
}: {
  label: string;
  value: string | number;
  suffix?: string;
  hint?: string;
  change?: string;
  changeTone?: "up" | "down" | "neutral";
  icon?: LucideIcon;
  accent?: "blue" | "green" | "amber" | "purple" | "rose";
  valueClassName?: string;
}) {
  const accents = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    purple: "bg-violet-50 text-violet-700",
    rose: "bg-rose-50 text-rose-700",
  };

  const toneClass =
    changeTone === "down"
      ? "text-[#F07178]"
      : changeTone === "neutral"
        ? "text-slate-400"
        : "text-[#22C55E]";

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white px-4 py-4 shadow-sm shadow-slate-200/30">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-medium text-slate-400">{label}</p>
          <p
            className={cn(
              "mt-2 text-[1.75rem] leading-none font-bold tracking-tight",
              valueClassName ?? "text-slate-900"
            )}
          >
            {typeof value === "number" ? formatCompact(value) : value}
            {suffix ? (
              <span className={cn("ml-0.5 text-[1.75rem] font-bold", valueClassName)}>
                {suffix}
              </span>
            ) : null}
          </p>
        </div>
        {Icon ? (
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
              accents[accent]
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
        ) : null}
      </div>
      {(hint || change) && (
        <div className="mt-3 flex items-end justify-between gap-2">
          {hint ? (
            <p className="text-[12px] text-slate-400">{hint}</p>
          ) : (
            <span />
          )}
          {change ? (
            <p className={cn("shrink-0 text-[12px] font-semibold", toneClass)}>
              {changeTone === "down" ? "↘" : changeTone === "up" ? "↗" : "→"}{" "}
              {change}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}

function formatCompact(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString("th-TH");
}
