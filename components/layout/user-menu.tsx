"use client";

import { useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { ChevronDown, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export function UserMenu() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!session?.user) return null;

  const roleLabel = session.user.role === "ADMIN" ? "Admin" : "Creator";
  const initial = session.user.name?.charAt(0).toUpperCase() ?? "U";

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-2.5 rounded-xl border border-stone-200 bg-white px-3 py-2 transition-colors hover:bg-stone-50",
          open && "bg-stone-50 ring-2 ring-blue-500/20"
        )}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
          {initial}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium text-stone-900 leading-tight">
            {session.user.name}
          </p>
          <p className="text-xs text-stone-500">{roleLabel}</p>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-stone-400 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-lg">
          <div className="border-b border-stone-100 px-4 py-3">
            <p className="text-sm font-medium text-stone-900">
              {session.user.name}
            </p>
            <p className="text-xs text-stone-500">{session.user.email}</p>
            <span className="mt-1.5 inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
              {roleLabel}
            </span>
          </div>
          <div className="p-1.5">
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              ออกจากระบบ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
