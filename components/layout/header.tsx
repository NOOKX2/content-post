"use client";

import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { UserMenu } from "./user-menu";
import { cn } from "@/lib/utils";
import type { Session } from "next-auth";

interface HeaderProps {
  title: string;
  description?: string;
  compact?: boolean;
  showExport?: boolean;
  onExport?: () => void;
  actions?: React.ReactNode;
  session?: Session | null;
}

export function Header({
  title,
  description,
  compact = false,
  showExport,
  onExport,
  actions,
  session = null,
}: HeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex shrink-0 items-center justify-between border-b border-stone-200/80 bg-white/95 backdrop-blur-sm supports-[backdrop-filter]:bg-white/80",
        compact ? "px-5 py-2.5" : "px-8 py-4"
      )}
    >
      <div>
        <h1
          className={cn(
            "font-bold text-stone-900",
            compact ? "text-xl" : "text-2xl"
          )}
        >
          {title}
        </h1>
        {description && (
          <p
            className={cn(
              "text-sm text-stone-500",
              compact ? "mt-0.5" : "mt-1"
            )}
          >
            {description}
          </p>
        )}
      </div>
      <div className="flex items-center gap-3">
        {showExport && (
          <Button variant="outline" size="sm" onClick={onExport}>
            <FileDown className="h-4 w-4" />
            Export PDF
          </Button>
        )}
        {actions}
        {session?.user && <NotificationBell />}
        <UserMenu session={session} />
      </div>
    </header>
  );
}
