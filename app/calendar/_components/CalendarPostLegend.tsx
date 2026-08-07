import { cn } from "@/lib/shared/utils";

export function CalendarPostLegend({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2 sm:gap-4", className)}>
      <span className="text-xs font-medium text-stone-500 sm:text-xs">สถานะโพส:</span>
      <LegendItem color="bg-orange-500" label="คอนเทนต์ที่รอโพส" />
      <LegendItem color="bg-emerald-500" label="คอนเทนต์ที่โพสแล้ว" />
      <LegendItem color="bg-red-500" label="คอนเทนต์รอแก้ไข" />
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-stone-600 sm:text-xs">
      <span className={cn("h-2.5 w-2.5 rounded-full", color)} />
      {label}
    </span>
  );
}
