import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
      className={cn("flex min-h-0 flex-col !p-2.5", className)}
    >
      <CardHeader className="mb-1 shrink-0">
        <CardTitle className="text-sm leading-tight">{title}</CardTitle>
        {description && (
          <CardDescription className="text-[11px] leading-tight">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <div className={cn("min-h-0 flex-1", bodyClassName)}>{children}</div>
    </Card>
  );
}
