"use client";

import { ClipboardList } from "lucide-react";
import { BrandIcon } from "@/components/ui/BrandIcon";
import { cn } from "@/lib/shared/utils";
import { usePendingCount } from "@/lib/content/client/contents-provider";
import { useCollaborationUnreadCount } from "@/lib/collaboration/client/collaboration-provider";
import {
  getDashboardNavItems,
  isNavItemActive,
} from "@/lib/navigation/domain/nav-items";
import { useDashboardNav } from "@/lib/navigation/client/dashboard-nav";
import type { Session } from "next-auth";

export function Sidebar({ session }: { session: Session | null }) {
  const { activePath, navigate } = useDashboardNav();
  const pendingCount = usePendingCount();
  const collaborationUnreadCount = useCollaborationUnreadCount();
  const navItems = getDashboardNavItems(session?.user?.role);

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-stone-200/80 bg-white md:flex">
      <div className="flex items-center gap-3 border-b border-stone-200/80 px-6 py-5">
        <BrandIcon size="md" />
        <div>
          <h1 className="text-base font-bold text-stone-900">iDea Content</h1>
          <p className="text-xs text-stone-500">Content Management</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map(({ href, label, icon: Icon }) => {
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
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
              )}
            >
              <div className="relative shrink-0">
                <Icon className="h-4 w-4" />
                {showChatBadge && (
                  <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-0.5 text-[9px] font-bold leading-none text-white ring-2 ring-white">
                    {collaborationUnreadCount > 99
                      ? "99+"
                      : collaborationUnreadCount}
                  </span>
                )}
              </div>
              <span className="flex-1">{label}</span>
              {showBadge && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-xs font-semibold text-white">
                  {pendingCount}
                </span>
              )}
            </a>
          );
        })}
      </nav>

      <div className="border-t border-stone-200/80 p-4">
        <div className="rounded-lg bg-stone-50 p-3">
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <ClipboardList className="h-3.5 w-3.5" />
            <span>Module 2: Team Collaboration</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
