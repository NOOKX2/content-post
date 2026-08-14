"use client";

import { ChevronRight } from "lucide-react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/shared/utils";
import { useAppSession } from "@/lib/auth/client/app-session";
import {
  parseDashboardRoute,
  useDashboardNav,
} from "@/lib/navigation/client/dashboard-nav";
import {
  DASHBOARD_HOME_ITEM,
  isDashboardHomePath,
  resolveCurrentNavItem,
} from "@/lib/navigation/domain/nav-items";
import { useT } from "@/lib/i18n";
import { navLabel } from "@/lib/i18n/nav";

export function NavBreadcrumb({ className }: { className?: string }) {
  const { activePath, navigate } = useDashboardNav();
  const { t } = useT();
  const appSession = useAppSession();
  const { data: clientSession } = useSession();
  const role = (clientSession ?? appSession)?.user?.role;
  const current = resolveCurrentNavItem(activePath, role);
  const HomeIcon = DASHBOARD_HOME_ITEM.icon;
  const isHome = isDashboardHomePath(activePath);
  const homeLabel = navLabel(
    DASHBOARD_HOME_ITEM.href,
    t,
    DASHBOARD_HOME_ITEM.label
  );

  if (isHome) {
    return (
      <div className={cn("flex min-w-0 items-center gap-2", className)}>
        <HomeIcon className="h-4 w-4 shrink-0 text-amber-600" />
        <span className="truncate text-sm font-semibold text-stone-800">
          {homeLabel}
        </span>
      </div>
    );
  }

  if (!current) {
    return null;
  }

  const CurrentIcon = current.icon;
  const route = parseDashboardRoute(activePath);
  const productFormLabel =
    route?.view === "archive-product-form"
      ? route.productId
        ? t("archive.editProductTitle")
        : t("archive.addProductTitle")
      : null;
  const currentLabel = navLabel(current.href, t, current.label);

  return (
    <nav
      aria-label={t("nav.breadcrumb")}
      className={cn("flex min-w-0 items-center gap-1.5 text-sm", className)}
    >
      <a
        href={DASHBOARD_HOME_ITEM.href}
        onClick={(event) => {
          event.preventDefault();
          navigate(DASHBOARD_HOME_ITEM.href);
        }}
        className="flex min-w-0 items-center gap-1.5 rounded-md px-1 py-0.5 text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900"
      >
        <HomeIcon className="h-4 w-4 shrink-0 text-amber-600" />
        <span className="truncate font-medium">{homeLabel}</span>
      </a>
      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-stone-300" />
      {productFormLabel ? (
        <>
          <a
            href="/archive?tab=products"
            onClick={(event) => {
              event.preventDefault();
              navigate("/archive?tab=products");
            }}
            className="flex min-w-0 items-center gap-1.5 rounded-md px-1 py-0.5 text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900"
          >
            <CurrentIcon className="h-4 w-4 shrink-0 text-amber-600" />
            <span className="truncate font-medium">{currentLabel}</span>
          </a>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-stone-300" />
          <span className="truncate px-1 py-0.5 font-semibold text-stone-800">
            {productFormLabel}
          </span>
        </>
      ) : (
        <span className="flex min-w-0 items-center gap-1.5 px-1 py-0.5 font-semibold text-stone-800">
          <CurrentIcon className="h-4 w-4 shrink-0 text-amber-600" />
          <span className="truncate">{currentLabel}</span>
        </span>
      )}
    </nav>
  );
}
