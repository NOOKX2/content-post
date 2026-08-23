"use client";

import { FileDown } from "lucide-react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { UserMenu } from "./UserMenu";
import { NavBreadcrumb } from "./NavBreadcrumb";
import { LanguageSwitch } from "./LanguageSwitch";
import { useT } from "@/lib/i18n";
import { useAppSession } from "@/lib/auth/client/app-session";
import { useDashboardNav } from "@/lib/navigation/client/dashboard-nav";
import { isDashboardHomePath } from "@/lib/navigation/domain/nav-items";
import { cn } from "@/lib/shared/utils";
import type { Session } from "next-auth";

interface HeaderProps {
  title: string;
  description?: string;
  compact?: boolean;
  hideTitle?: boolean;
  showExport?: boolean;
  onExport?: () => void;
  actions?: React.ReactNode;
  session?: Session | null;
}

export function Header({
  title,
  description,
  compact = false,
  hideTitle = false,
  showExport,
  onExport,
  actions,
  session: sessionProp = null,
}: HeaderProps) {
  const appSession = useAppSession();
  const { data: clientSession } = useSession();
  const session = sessionProp ?? clientSession ?? appSession;
  const { activePath } = useDashboardNav();
  const { t } = useT();
  const showBreadcrumb = !isDashboardHomePath(activePath);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex shrink-0 items-center justify-between gap-4 border-b border-stone-200/80 bg-white/95 backdrop-blur-sm supports-[backdrop-filter]:bg-white/80",
        compact ? "px-6 py-2.5 sm:px-8 lg:px-10" : "px-4 py-3 sm:px-6 md:px-8 md:py-4"
      )}
    >
      <div className="min-w-0">
        {hideTitle ? (
          <span className="sr-only">{title}</span>
        ) : showBreadcrumb ? (
          <>
            <NavBreadcrumb />
            <span className="sr-only">{title}</span>
          </>
        ) : (
          <h1
            className={cn(
              "font-bold text-stone-900",
              compact ? "text-lg sm:text-xl" : "text-xl sm:text-2xl"
            )}
          >
            {title}
          </h1>
        )}
        {description && !hideTitle && (
          <p
            className={cn(
              "text-sm text-stone-500",
              compact ? "mt-0.5 hidden sm:block" : "mt-1 hidden sm:block"
            )}
          >
            {description}
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {showExport && (
          <Button variant="outline" size="sm" onClick={onExport}>
            <FileDown className="h-4 w-4" />
            {t("common.exportPdf")}
          </Button>
        )}
        {actions}
        <LanguageSwitch />
        {session?.user && <NotificationBell />}
        <UserMenu session={session} />
      </div>
    </header>
  );
}
