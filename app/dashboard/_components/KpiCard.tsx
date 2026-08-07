import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/shared/utils";
import type { LucideIcon } from "lucide-react";

export function KpiCard({
  label,
  value,
  suffix,
  change,
  icon: Icon,
  accent = "blue",
  sparkline,
  compact = false,
}: {
  label: string;
  value: string | number;
  suffix?: string;
  change?: string;
  icon?: LucideIcon;
  accent?: "blue" | "green" | "amber" | "purple" | "rose";
  sparkline?: number[];
  compact?: boolean;
}) {
  const accents = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    purple: "bg-purple-50 text-purple-700",
    rose: "bg-rose-50 text-rose-700",
  };

  return (
    <Card
      padding="sm"
      className={cn(
        "relative overflow-hidden",
        compact ? "!p-3 sm:!p-2.5" : "!p-3"
      )}
    >
      <div className="flex items-start justify-between gap-2.5 sm:gap-2">
        <div>
          <p
            className={cn(
              "font-medium text-stone-500",
              compact ? "text-xs sm:text-[10px]" : "text-xs"
            )}
          >
            {label}
          </p>
          <p
            className={cn(
              "font-bold text-stone-900",
              compact
                ? "mt-1 text-xl leading-tight sm:mt-0.5 sm:text-lg"
                : "mt-1 text-xl"
            )}
          >
            {typeof value === "number" ? value.toLocaleString("th-TH") : value}
            {suffix && (
              <span className="ml-1 text-sm font-medium text-stone-500">
                {suffix}
              </span>
            )}
          </p>
          {change && (
            <p className="mt-1 text-xs font-medium text-emerald-600">{change}</p>
          )}
        </div>
        {Icon && (
          <div
            className={cn(
              "flex items-center justify-center rounded-lg",
              compact ? "h-8 w-8 sm:h-7 sm:w-7" : "h-8 w-8",
              accents[accent]
            )}
          >
            <Icon className={compact ? "h-4 w-4 sm:h-3.5 sm:w-3.5" : "h-4 w-4"} />
          </div>
        )}
      </div>
      {sparkline && sparkline.length > 1 && !compact && (
        <MiniSparkline values={sparkline} className="mt-2" />
      )}
    </Card>
  );
}

function MiniSparkline({
  values,
  className,
}: {
  values: number[];
  className?: string;
}) {
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const width = 120;
  const height = 32;
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn("h-8 w-full text-blue-500", className)}
      preserveAspectRatio="none"
    >
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        points={points}
      />
    </svg>
  );
}
