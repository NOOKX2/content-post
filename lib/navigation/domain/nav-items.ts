import {
  Archive,
  CalendarDays,
  FileText,
  LayoutGrid,
  ListChecks,
  ListTodo,
  MessageSquare,
  PenSquare,
  Settings,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { isAdminRole, isViewerRole } from "@/lib/auth/domain/roles";

export type DashboardNavItem = {
  href: string;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
};

export const DASHBOARD_HOME_ITEM: DashboardNavItem = {
  href: "/dashboard",
  label: "แดชบอร์ด",
  shortLabel: "แดชบอร์ด",
  icon: LayoutGrid,
};

export const CREATOR_NAV_ITEMS: DashboardNavItem[] = [
  DASHBOARD_HOME_ITEM,
  {
    href: "/create",
    label: "สร้างคอนเทนต์",
    shortLabel: "สร้าง",
    icon: PenSquare,
  },
  {
    href: "/collaboration",
    label: "ทีม",
    shortLabel: "ทีม",
    icon: MessageSquare,
  },
  {
    href: "/calendar",
    label: "ปฏิทิน",
    shortLabel: "ปฏิทิน",
    icon: CalendarDays,
  },
  {
    href: "/archive",
    label: "คลังข้อมูล",
    shortLabel: "คลัง",
    icon: Archive,
  },
];

export const VIEWER_NAV_ITEMS: DashboardNavItem[] = [
  DASHBOARD_HOME_ITEM,
  {
    href: "/create",
    label: "สร้างคอนเทนต์",
    shortLabel: "สร้าง",
    icon: PenSquare,
  },
  {
    href: "/collaboration",
    label: "ทีม",
    shortLabel: "ทีม",
    icon: MessageSquare,
  },
  {
    href: "/calendar",
    label: "ปฏิทิน",
    shortLabel: "ปฏิทิน",
    icon: CalendarDays,
  },
  {
    href: "/archive",
    label: "คลังข้อมูล",
    shortLabel: "คลัง",
    icon: Archive,
  },
];

export const ADMIN_NAV_ITEMS: DashboardNavItem[] = [
  DASHBOARD_HOME_ITEM,
  {
    href: "/create",
    label: "สร้างคอนเทนต์",
    shortLabel: "สร้าง",
    icon: PenSquare,
  },
  {
    href: "/admin",
    label: "อนุมัติ",
    shortLabel: "อนุมัติ",
    icon: ShieldCheck,
  },
  {
    href: "/admin/settings",
    label: "ตั้งค่าแอดมิน",
    shortLabel: "ตั้งค่า",
    icon: Settings,
  },
  {
    href: "/collaboration",
    label: "ทีม",
    shortLabel: "ทีม",
    icon: MessageSquare,
  },
  {
    href: "/calendar",
    label: "ปฏิทิน",
    shortLabel: "ปฏิทิน",
    icon: CalendarDays,
  },
  {
    href: "/archive",
    label: "คลังข้อมูล",
    shortLabel: "คลัง",
    icon: Archive,
  },
];

const SECONDARY_NAV_ITEMS: DashboardNavItem[] = [
  {
    href: "/posts",
    label: "รายการโพสต์",
    shortLabel: "โพสต์",
    icon: FileText,
  },
  {
    href: "/my-tasks",
    label: "งานที่ได้รับมอบหมาย",
    shortLabel: "งาน",
    icon: ListTodo,
  },
  {
    href: "/settings",
    label: "ตั้งค่าบัญชี",
    shortLabel: "ตั้งค่า",
    icon: Settings,
  },
];

export function getDashboardNavItems(
  role: string | undefined
): DashboardNavItem[] {
  const items = isAdminRole(role)
    ? ADMIN_NAV_ITEMS
    : isViewerRole(role)
      ? VIEWER_NAV_ITEMS
      : CREATOR_NAV_ITEMS;
  const home = items.find((item) => item.href === "/dashboard");
  const rest = items.filter((item) => item.href !== "/dashboard");
  return home ? [home, ...rest] : items;
}

export function isNavItemActive(activePath: string, href: string): boolean {
  return (
    activePath === href ||
    (href === "/calendar" && activePath === "/content-calendar") ||
    (href === "/admin/settings" && activePath.startsWith("/admin/settings")) ||
    (href === "/archive" && activePath.startsWith("/archive"))
  );
}

export function isDashboardHomePath(path: string): boolean {
  return path === "/dashboard";
}

export function resolveCurrentNavItem(
  path: string,
  role?: string
): DashboardNavItem | null {
  if (path.startsWith("/content/")) {
    return {
      href: path,
      label: "รายละเอียดคอนเทนต์",
      shortLabel: "รายละเอียด",
      icon: ListChecks,
    };
  }

  const items = [...getDashboardNavItems(role), ...SECONDARY_NAV_ITEMS];
  return items.find((item) => isNavItemActive(path, item.href)) ?? null;
}
