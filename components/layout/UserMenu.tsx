"use client";

import { useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import {
  ChevronDown,
  ClipboardList,
  Globe,
  List,
  LogOut,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/shared/utils";
import { useDashboardNav } from "@/lib/navigation/client/dashboard-nav";
import { LanguageSwitch } from "./LanguageSwitch";
import { useT } from "@/lib/i18n";
import { useProfile } from "@/lib/profile/client/profile-provider";
import {
  updateMyAvailability,
} from "@/lib/profile/actions";
import { resolveDisplayName } from "@/lib/profile/types";
import type { Session } from "next-auth";

function roleLabelFor(
  role: Session["user"]["role"] | undefined,
  t: (key: string) => string
) {
  if (role === "ADMIN") return t("auth.roleAdmin");
  if (role === "EDITOR" || role === "DESIGNER") return t("auth.roleEditor");
  return t("auth.roleViewer");
}

export function UserAvatar({
  name,
  imageUrl,
  size = "md",
}: {
  name: string;
  imageUrl?: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const initial = name.trim().charAt(0).toUpperCase() || "U";
  const sizeClass =
    size === "lg" ? "h-12 w-12 text-lg" : size === "sm" ? "h-8 w-8 text-sm" : "h-10 w-10 text-sm";

  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt={name}
        className={cn("rounded-full object-cover", sizeClass)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-[#2B5AED] font-semibold text-white",
        sizeClass
      )}
    >
      {initial}
    </div>
  );
}

export function UserMenu({
  session,
  compact = false,
}: {
  session: Session | null;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { navigate, activePath } = useDashboardNav();
  const { t } = useT();
  const { update } = useSession();
  const { profile, setProfile } = useProfile();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
        setLanguageOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!session?.user) return null;

  const displayName = resolveDisplayName({
    displayName: profile?.displayName || session.user.displayName,
    name: session.user.name,
  });
  const position =
    profile?.position ||
    session.user.position ||
    t("userMenu.accountOwner");
  const imageUrl = profile?.imageUrl || session.user.image;
  const busy = profile?.busy ?? Boolean(session.user.busy);
  const openTaskCount = profile?.openTaskCount ?? 0;
  const roleLabel = roleLabelFor(session.user.role, t);

  const go = (href: string) => {
    setOpen(false);
    if (activePath !== href) navigate(href);
  };

  const toggleBusy = async () => {
    const result = await updateMyAvailability(!busy);
    if (!result.success) return;
    setProfile(result.data);
    await update({
      user: {
        busy: result.data.busy,
        displayName: result.data.displayName,
        position: result.data.position,
        image: result.data.imageUrl || null,
        name: result.data.name,
      },
    });
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center rounded-xl transition-colors",
          compact
            ? "h-10 w-10 justify-center hover:bg-stone-100"
            : "gap-2.5 border border-stone-200 bg-white px-3 py-2 hover:bg-stone-50",
          open && (compact ? "bg-stone-100" : "bg-stone-50 ring-2 ring-blue-500/20")
        )}
        aria-label={displayName}
      >
        <UserAvatar name={displayName} imageUrl={imageUrl} size="sm" />
        {!compact && (
          <>
            <div className="hidden min-w-0 text-left sm:block">
              <p className="truncate text-sm leading-tight font-semibold text-stone-900">
                {displayName}
              </p>
              <p className="truncate text-xs text-stone-500">
                {roleLabel}
              </p>
            </div>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-stone-400 transition-transform",
                open && "rotate-180"
              )}
            />
          </>
        )}
      </button>

      {open && (
        <div
          className={cn(
            "absolute z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-lg",
            compact ? "left-0 top-full" : "top-full right-0"
          )}
        >
          <div className="flex items-center gap-3 border-b border-stone-100 px-4 py-3">
            <UserAvatar name={displayName} imageUrl={imageUrl} size="md" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-stone-900">
                {displayName}
              </p>
              <p className="truncate text-xs text-stone-500">{position}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void toggleBusy()}
            className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-stone-50"
          >
            <span
              className={cn(
                "mt-1 h-2.5 w-2.5 shrink-0 rounded-full",
                busy ? "bg-red-500" : "bg-emerald-500"
              )}
            />
            <span>
              <span className="block text-sm text-stone-800">
                {busy ? t("userMenu.setAvailable") : t("userMenu.setBusy")}
              </span>
              <span className="mt-0.5 block text-xs text-stone-500">
                {t("userMenu.pendingWork", { count: openTaskCount })}
                {" · "}
                {t("userMenu.busyHint")}
              </span>
            </span>
          </button>

          <div className="space-y-0.5 border-t border-stone-100 p-1.5">
            <button
              type="button"
              onClick={() => go("/settings")}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors",
                activePath === "/settings"
                  ? "bg-blue-50 text-blue-700"
                  : "text-stone-700 hover:bg-stone-50"
              )}
            >
              <Settings className="h-4 w-4" />
              {t("userMenu.accountSettings")}
            </button>
           
            <button
              type="button"
              onClick={() => go("/posts")}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors",
                activePath === "/posts"
                  ? "bg-blue-50 text-blue-700"
                  : "text-stone-700 hover:bg-stone-50"
              )}
            >
              <List className="h-4 w-4" />
              {t("userMenu.allPosts")}
            </button>
            <button
              type="button"
              onClick={() => go("/my-tasks")}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors",
                activePath === "/my-tasks"
                  ? "bg-blue-50 text-blue-700"
                  : "text-stone-700 hover:bg-stone-50"
              )}
            >
              <ClipboardList className="h-4 w-4" />
              {t("userMenu.myTasks")}
            </button>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              {t("userMenu.signOut")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
