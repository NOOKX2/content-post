"use client";

import {
  BarChart3,
  CalendarDays,
  ClipboardList,
  MessageSquare,
  PenSquare,
  ShieldCheck,
  Settings,
  Leaf,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePendingCount } from "@/lib/content/contents-provider";
import { useDashboardNav } from "@/lib/navigation/dashboard-nav";
import type { Session } from "next-auth";

const CREATOR_NAV = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/collaboration", label: "Team", icon: MessageSquare },
  { href: "/create", label: "สร้าง Content", icon: PenSquare },
  { href: "/calendar", label: "ปฏิทิน", icon: CalendarDays },
] as const;

const ADMIN_NAV = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/collaboration", label: "Team", icon: MessageSquare },
  { href: "/admin", label: "Admin อนุมัติ", icon: ShieldCheck },
  { href: "/admin/channels", label: "ตั้งค่าช่อง", icon: Settings },
  { href: "/calendar", label: "ปฏิทิน", icon: CalendarDays },
] as const;

export function Sidebar({ session }: { session: Session | null }) {
  const { activePath, navigate } = useDashboardNav();
  const pendingCount = usePendingCount();
  const isAdmin = session?.user?.role === "ADMIN";
  const navItems = isAdmin ? ADMIN_NAV : CREATOR_NAV;

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-stone-200/80 bg-white">
      <div className="flex items-center gap-3 border-b border-stone-200/80 px-6 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
          <Leaf className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-base font-bold text-stone-900">iDea Content</h1>
          <p className="text-xs text-stone-500">Content Management</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            activePath === href ||
            (href === "/calendar" && activePath === "/content-calendar");
          const showBadge = href === "/admin" && pendingCount > 0;

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
              <Icon className="h-4 w-4 shrink-0" />
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
