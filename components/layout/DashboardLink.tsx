"use client";

import type { ComponentProps } from "react";
import { useDashboardNav } from "@/lib/navigation/client/dashboard-nav";
import { useDashboardLinkPrefetch } from "@/lib/navigation/client/use-dashboard-link-prefetch";

type DashboardLinkProps = Omit<ComponentProps<"a">, "href"> & {
  href: string;
};

export function DashboardLink({
  href,
  onClick,
  onMouseEnter,
  onFocus,
  onTouchStart,
  ...props
}: DashboardLinkProps) {
  const { navigate } = useDashboardNav();
  const prefetch = useDashboardLinkPrefetch(href);

  return (
    <a
      href={href}
      onMouseEnter={(event) => {
        prefetch();
        onMouseEnter?.(event);
      }}
      onFocus={(event) => {
        prefetch();
        onFocus?.(event);
      }}
      onTouchStart={(event) => {
        prefetch();
        onTouchStart?.(event);
      }}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          event.preventDefault();
          prefetch();
          navigate(href);
        }
      }}
      {...props}
    />
  );
}
