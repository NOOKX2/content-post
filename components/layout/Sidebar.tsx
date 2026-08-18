"use client";

import { cn } from "@/lib/shared/utils";
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
import { BrandIcon } from "@/components/ui/BrandIcon";
import type { Session } from "next-auth";
import type { LucideIcon } from "lucide-react";

function SidebarNavLink({
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
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
        isActive
          ? "bg-[#f3ead8] text-stone-900"
          : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
      )}
    >
      <div className="relative shrink-0">
        <Icon
          className={cn(
            "h-4 w-4",
            isActive ? "text-amber-600" : "text-stone-500"
          )}
        />
        {showChatBadge && (
          <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-0.5 text-[9px] font-bold leading-none text-white ring-2 ring-white">
            {chatBadgeCount > 99 ? "99+" : chatBadgeCount}
          </span>
        )}
      </div>
      <span className="flex-1">{label}</span>
      {showBadge && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-xs font-semibold text-white">
          {badgeCount}
        </span>
      )}
    </a>
  );
}

export function Sidebar({ session }: { session: Session | null }) {
  const { activePath, navigate } = useDashboardNav();
  const { t } = useT();
  const pendingCount = usePendingCount();
  const collaborationUnreadCount = useCollaborationUnreadCount();
  const navItems = getDashboardNavItems(session?.user?.role);

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-stone-200/80 bg-white md:flex">
      <div className="flex items-center gap-3 border-b border-stone-200/80 px-4 py-4">
        <BrandIcon size="md" />
        <div className="min-w-0">
          <h1 className="text-base font-bold text-stone-900">iDea Content</h1>
          <p className="text-xs text-stone-500">{t("nav.tagline")}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map(({ href, label, icon: Icon }) => (
          <SidebarNavLink
            key={href}
            href={href}
            label={navLabel(href, t, label)}
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
      </nav>

    </aside>
  );
}
