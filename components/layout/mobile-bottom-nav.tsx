"use client";

import { usePendingCount } from "@/lib/content/contents-provider";
import { useCollaborationUnreadCount } from "@/lib/collaboration/collaboration-provider";
import {
  getDashboardNavItems,
  isNavItemActive,
} from "@/lib/navigation/dashboard-nav-items";
import { useDashboardNav } from "@/lib/navigation/dashboard-nav";
import { cn } from "@/lib/utils";
import type { Session } from "next-auth";

export function MobileBottomNav({ session }: { session: Session | null }) {
  const { activePath, navigate } = useDashboardNav();
  const pendingCount = usePendingCount();
  const collaborationUnreadCount = useCollaborationUnreadCount();
  const navItems = getDashboardNavItems(session?.user?.role);

  return (
    <nav
      className="shrink-0 border-t border-stone-200 bg-white pb-[max(0.5rem,env(safe-area-inset-bottom))] md:hidden"
      aria-label="เมนูหลัก"
    >
      <div className="flex items-stretch justify-around gap-0.5 px-0.5 pt-1">
        {navItems.map(({ href, shortLabel, icon: Icon }) => {
          const isActive = isNavItemActive(activePath, href);
          const showBadge = href === "/admin" && pendingCount > 0;
          const showChatBadge =
            href === "/collaboration" && collaborationUnreadCount > 0;

          return (
            <a
              key={href}
              href={href}
              onClick={(event) => {
                event.preventDefault();
                navigate(href);
              }}
              className={cn(
                "relative flex min-w-0 flex-1 flex-col items-center gap-0.5 px-0.5 py-2 text-[11px] font-medium transition-colors",
                isActive ? "text-blue-600" : "text-stone-500"
              )}
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-blue-600" />
              )}

              <div className="relative">
                <Icon className="h-5 w-5" strokeWidth={isActive ? 2.25 : 2} />
                {showChatBadge && (
                  <span className="absolute -top-1 -right-2 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-red-500 px-0.5 text-[8px] font-bold text-white ring-2 ring-white">
                    {collaborationUnreadCount > 9
                      ? "9+"
                      : collaborationUnreadCount}
                  </span>
                )}
                {showBadge && (
                  <span className="absolute -top-1 -right-2 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-amber-500 px-0.5 text-[8px] font-bold text-white ring-2 ring-white">
                    {pendingCount > 9 ? "9+" : pendingCount}
                  </span>
                )}
              </div>

              <span className="max-w-full truncate">{shortLabel}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
