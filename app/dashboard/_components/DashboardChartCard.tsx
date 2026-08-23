import { cn } from "@/lib/shared/utils";
import type { LucideIcon } from "lucide-react";

export function DashboardChartCard({
  title,
  description,
  icon: Icon,
  iconClassName,
  titleClassName,
  children,
  className,
  bodyClassName,
  headerRight,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconClassName?: string;
  titleClassName?: string;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  headerRight?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-col rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-200/30",
        className
      )}
    >
      <div className="mb-2.5 flex shrink-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {Icon ? (
              <Icon
                className={cn("h-4 w-4 shrink-0 text-slate-500", iconClassName)}
                strokeWidth={2.25}
              />
            ) : null}
            <h3
              className={cn(
                "text-[15px] font-bold text-slate-900",
                titleClassName
              )}
            >
              {title}
            </h3>
          </div>
          {description ? (
            <p
              className={cn(
                "mt-1 text-xs text-slate-400",
                Icon ? "pl-6" : null
              )}
            >
              {description}
            </p>
          ) : null}
        </div>
        {headerRight}
      </div>
      <div className={cn("min-h-0 flex-1", bodyClassName)}>{children}</div>
    </div>
  );
}
