"use client";

import { usePendingCount } from "@/lib/content/client/contents-provider";
import { useCollaborationUnreadCount } from "@/lib/collaboration/client/collaboration-provider";
import {
  getDashboardNavItems,
  isNavItemActive,
} from "@/lib/navigation/domain/nav-items";
import { useDashboardNav } from "@/lib/navigation/client/dashboard-nav";
import { useDashboardLinkPrefetch } from "@/lib/navigation/client/use-dashboard-link-prefetch";
import { useT } from "@/lib/i18n";
import { navLabel } from "@/lib/i18n/nav";
import { cn } from "@/lib/shared/utils";
import type { Session } from "next-auth";
import type { LucideIcon } from "lucide-react";

function MobileNavLink({
  href,
  label,
  icon: Icon,
  isActive,
  showBadge,
  badgeCount,
  showChatBadge,
  chatBadgeCount,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  isActive: boolean;
  showBadge: boolean;
  badgeCount: number;
  showChatBadge: boolean;
  chatBadgeCount: number;
  onNavigate: (href: string) => void;
}) {
  const prefetch = useDashboardLinkPrefetch(href);

  return (
    <a
      href={href}
      onMouseEnter={prefetch}
      onFocus={prefetch}
      onTouchStart={prefetch}
      onClick={(event) => {
        event.preventDefault();
        prefetch();
        onNavigate(href);
      }}
      className={cn(
        "relative flex min-w-0 flex-1 flex-col items-center gap-0.5 px-0.5 py-2 text-[11px] font-medium transition-colors",
        isActive ? "text-amber-700" : "text-stone-500"
      )}
    >
      {isActive && (
        <span className="absolute top-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-amber-600" />
      )}

      <div className="relative">
        <Icon className="h-5 w-5" strokeWidth={isActive ? 2.25 : 2} />
        {showChatBadge && (
          <span className="absolute -top-1 -right-2 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-red-500 px-0.5 text-[8px] font-bold text-white ring-2 ring-white">
            {chatBadgeCount > 9 ? "9+" : chatBadgeCount}
          </span>
        )}
        {showBadge && (
          <span className="absolute -top-1 -right-2 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-amber-500 px-0.5 text-[8px] font-bold text-white ring-2 ring-white">
            {badgeCount > 9 ? "9+" : badgeCount}
          </span>
        )}
      </div>

      <span className="max-w-full truncate">{label}</span>
    </a>
  );
}

export function MobileBottomNav({ session }: { session: Session | null }) {
  const { activePath, navigate } = useDashboardNav();
  const { t } = useT();
  const pendingCount = usePendingCount();
  const collaborationUnreadCount = useCollaborationUnreadCount();
  const navItems = getDashboardNavItems(session?.user?.role);

  return (
    <nav
      className="shrink-0 border-t border-stone-200 bg-white pb-[max(0.5rem,env(safe-area-inset-bottom))] md:hidden"
      aria-label={t("nav.mainMenu")}
    >
      <div className="flex items-stretch justify-around gap-0.5 px-0.5 pt-1">
        {navItems.map(({ href, shortLabel, icon: Icon }) => (
          <MobileNavLink
            key={href}
            href={href}
            label={navLabel(href, t, shortLabel, true)}
            icon={Icon}
            isActive={isNavItemActive(activePath, href)}
            showBadge={href === "/admin" && pendingCount > 0}
            badgeCount={pendingCount}
            showChatBadge={
              href === "/collaboration" && collaborationUnreadCount > 0
            }
            chatBadgeCount={collaborationUnreadCount}
            onNavigate={navigate}
          />
        ))}
      </div>
    </nav>
  );
}
