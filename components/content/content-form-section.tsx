import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function ContentFormSection({
  title,
  description,
  icon: Icon,
  actions,
  children,
  className,
  bodyClassName,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <Card padding="none" className={className}>
      <div
        className={cn(
          "flex flex-wrap items-center gap-3 border-b border-stone-200 px-6 py-4",
          actions ? "justify-between" : "justify-start"
        )}
      >
        <div className="flex min-w-0 items-start gap-2.5 sm:items-center">
          {Icon ? (
            <Icon
              className="h-5 w-5 shrink-0 text-stone-900"
              strokeWidth={2.25}
            />
          ) : null}
          <div className="min-w-0">
            <h3 className="text-xl font-bold tracking-tight text-stone-900">
              {title}
            </h3>
            {description ? (
              <p className="mt-0.5 text-sm text-stone-500">{description}</p>
            ) : null}
          </div>
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        ) : null}
      </div>
      <div className={cn("p-6", bodyClassName)}>{children}</div>
    </Card>
  );
}

export function ContentFormSectionAction({
  onClick,
  children,
}: {
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 text-sm font-semibold text-blue-600 hover:text-blue-700"
    >
      {children}
    </button>
  );
}
