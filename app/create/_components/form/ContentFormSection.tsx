import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/shared/utils";

export function ContentFormSection({
  step,
  stepLabel,
  title,
  description,
  icon: Icon,
  actions,
  meta,
  children,
  className,
  bodyClassName,
}: {
  step?: string;
  stepLabel?: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: ReactNode;
  meta?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn("space-y-4", className)}>
      <div
        className={cn(
          "flex flex-wrap items-start gap-3",
          actions || meta ? "justify-between" : "justify-start"
        )}
      >
        <div className="min-w-0 flex-1">
          {step && stepLabel ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-400">
              {step} / {stepLabel}
            </p>
          ) : null}
          <div className="mt-1 flex min-w-0 items-start gap-2 sm:items-center">
            {Icon ? (
              <Icon
                className="mt-0.5 h-5 w-5 shrink-0 text-stone-900 sm:mt-0"
                strokeWidth={2.25}
              />
            ) : null}
            <div className="min-w-0">
              <h3 className="text-lg font-bold tracking-tight text-stone-900">
                {title}
              </h3>
              {description ? (
                <p className="mt-0.5 text-sm text-stone-500">{description}</p>
              ) : null}
            </div>
          </div>
        </div>
        {(actions || meta) && (
          <div className="flex shrink-0 flex-wrap items-center gap-3">
            {meta}
            {actions}
          </div>
        )}
      </div>
      <div className={bodyClassName}>{children}</div>
    </section>
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
      className="shrink-0 text-sm font-semibold text-teal-700 hover:text-teal-800"
    >
      {children}
    </button>
  );
}
