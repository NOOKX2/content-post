"use client";

import { cn } from "@/lib/utils";

interface TabsProps {
  tabs: { id: string; label: string; count?: number }[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
  compact?: boolean;
}

export function Tabs({
  tabs,
  activeTab,
  onChange,
  className,
  compact = false,
}: TabsProps) {
  return (
    <div
      className={cn(
        "flex gap-1 rounded-lg bg-stone-100",
        compact ? "p-0.5" : "p-1",
        className
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            "rounded-md font-medium whitespace-nowrap transition-all",
            compact ? "min-w-[6.25rem] px-4 py-1 text-xs" : "flex-1 px-4 py-2 text-sm",
            activeTab === tab.id
              ? "bg-white text-stone-900 shadow-sm"
              : "text-stone-500 hover:text-stone-700"
          )}
        >
          {tab.label}
          {tab.count !== undefined && tab.count > 0 && (
            <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-xs text-white">
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
