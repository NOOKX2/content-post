import {
  BarChart3,
  CalendarDays,
  MessageSquare,
  PenSquare,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { isAdminRole } from "@/lib/auth/domain/roles";

export type DashboardNavItem = {
  href: string;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
};

export const CREATOR_NAV_ITEMS: DashboardNavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    shortLabel: "Dashboard",
    icon: BarChart3,
  },
  {
    href: "/create",
    label: "Create Content",
    shortLabel: "Create",
    icon: PenSquare,
  },
  {
    href: "/collaboration",
    label: "Team",
    shortLabel: "Team",
    icon: MessageSquare,
  },
  {
    href: "/calendar",
    label: "Calendar",
    shortLabel: "Calendar",
    icon: CalendarDays,
  },
];

export const ADMIN_NAV_ITEMS: DashboardNavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    shortLabel: "Home",
    icon: BarChart3,
  },
  {
    href: "/admin",
    label: "Admin อนุมัติ",
    shortLabel: "Admin",
    icon: ShieldCheck,
  },
  {
    href: "/collaboration",
    label: "Team",
    shortLabel: "Team",
    icon: MessageSquare,
  },
  {
    href: "/calendar",
    label: "Calendar",
    shortLabel: "Calendar",
    icon: CalendarDays,
  },
];

export function getDashboardNavItems(
  role: string | undefined
): DashboardNavItem[] {
  return isAdminRole(role) ? ADMIN_NAV_ITEMS : CREATOR_NAV_ITEMS;
}

export function isNavItemActive(activePath: string, href: string): boolean {
  return (
    activePath === href ||
    (href === "/calendar" && activePath === "/content-calendar")
  );
}
