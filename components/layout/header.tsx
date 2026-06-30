"use client";

import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title: string;
  description?: string;
  showExport?: boolean;
  onExport?: () => void;
  actions?: React.ReactNode;
}

export function Header({
  title,
  description,
  showExport,
  onExport,
  actions,
}: HeaderProps) {
  return (
    <header className="flex items-start justify-between border-b border-stone-200/80 bg-white px-8 py-6">
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
      </div>
    </header>
  );
}
