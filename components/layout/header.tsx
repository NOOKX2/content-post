"use client";

import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserMenu } from "./user-menu";
import type { Session } from "next-auth";

interface HeaderProps {
  title: string;
  description?: string;
  showExport?: boolean;
  onExport?: () => void;
  actions?: React.ReactNode;
  session?: Session | null;
}

export function Header({
  title,
  description,
  showExport,
  onExport,
  actions,
  session = null,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex shrink-0 items-center justify-between border-b border-stone-200/80 bg-white/95 px-8 py-4 backdrop-blur-sm supports-[backdrop-filter]:bg-white/80">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-stone-500">{description}</p>
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
        <UserMenu session={session} />
      </div>
    </header>
  );
}
