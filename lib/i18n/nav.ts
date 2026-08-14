import type { TFunction } from "./translate";

const NAV_I18N: Record<string, { label: string; short: string }> = {
  "/dashboard": { label: "nav.dashboard", short: "nav.dashboardShort" },
  "/create": { label: "nav.create", short: "nav.createShort" },
  "/collaboration": { label: "nav.team", short: "nav.teamShort" },
  "/calendar": { label: "nav.calendar", short: "nav.calendarShort" },
  "/archive": { label: "nav.archive", short: "nav.archiveShort" },
  "/admin": { label: "nav.approve", short: "nav.approveShort" },
  "/admin/settings": { label: "nav.adminSettings", short: "nav.adminSettingsShort" },
  "/posts": { label: "nav.posts", short: "nav.postsShort" },
  "/my-tasks": { label: "nav.myTasks", short: "nav.myTasksShort" },
  "/settings": { label: "nav.settings", short: "nav.settingsShort" },
};

export function navLabel(
  href: string,
  t: TFunction,
  fallback: string,
  short = false
): string {
  if (href.startsWith("/content/")) {
    return t(short ? "nav.contentDetailShort" : "nav.contentDetail");
  }
  const keys = NAV_I18N[href];
  if (!keys) return fallback;
  return t(short ? keys.short : keys.label);
}
