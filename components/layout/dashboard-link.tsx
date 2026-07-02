"use client";

import type { ComponentProps } from "react";
import { useDashboardNav } from "@/lib/navigation/dashboard-nav";

type DashboardLinkProps = Omit<ComponentProps<"a">, "href"> & {
  href: string;
};

export function DashboardLink({
  href,
  onClick,
  ...props
}: DashboardLinkProps) {
  const { navigate } = useDashboardNav();

  return (
    <a
      href={href}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          event.preventDefault();
          navigate(href);
        }
      }}
      {...props}
    />
  );
}
