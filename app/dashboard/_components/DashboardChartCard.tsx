import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { cn } from "@/lib/shared/utils";

export function DashboardChartCard({
  title,
  description,
  children,
  className,
  bodyClassName,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <Card
      padding="sm"
      className={cn("flex min-h-0 flex-col !p-3 sm:!p-2.5", className)}
    >
      <CardHeader className="mb-2 shrink-0 sm:mb-1">
        <CardTitle className="text-sm leading-snug sm:leading-tight">{title}</CardTitle>
        {description && (
          <CardDescription className="mt-0.5 text-xs leading-snug sm:text-[11px] sm:leading-tight">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <div className={cn("min-h-0 flex-1", bodyClassName)}>{children}</div>
    </Card>
  );
}
