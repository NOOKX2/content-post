"use client";

import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import {
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  MessageSquare,
  Pencil,
  XCircle,
} from "lucide-react";
import { cn, formatThaiDate } from "@/lib/utils";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationItem,
} from "@/lib/notifications/fetch-actions";
import { useDashboardNav } from "@/lib/navigation/dashboard-nav";

const NOTIFICATIONS_KEY = "notifications";

function NotificationIcon({ type }: { type: string }) {
  const className = "h-4 w-4 shrink-0";
  switch (type) {
    case "idea_deadline_reminder":
    case "shoot_reminder":
      return <Clock className={cn(className, "text-amber-600")} />;
    case "revision_needed":
    case "team_edit_request":
      return <Pencil className={cn(className, "text-orange-600")} />;
    case "approval_approved":
      return <CheckCircle2 className={cn(className, "text-green-600")} />;
    case "approval_rejected":
      return <XCircle className={cn(className, "text-red-600")} />;
    case "team_comment":
    case "team_tag":
      return <MessageSquare className={cn(className, "text-blue-600")} />;
    case "monthly_summary":
      return <Calendar className={cn(className, "text-purple-600")} />;
    default:
      return <Bell className={cn(className, "text-stone-500")} />;
  }
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "เมื่อสักครู่";
  if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ชม.ที่แล้ว`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} วันที่แล้ว`;
  return formatThaiDate(iso.slice(0, 10));
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { navigate } = useDashboardNav();

  const { data, mutate } = useSWR(NOTIFICATIONS_KEY, fetchNotifications, {
    refreshInterval: 30000,
    revalidateOnFocus: true,
  });

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpen = () => {
    setOpen((prev) => !prev);
  };

  const handleItemClick = async (item: NotificationItem) => {
    if (!item.readAt) {
      await markNotificationRead(item.id);
      mutate();
    }
    setOpen(false);
    if (item.link) {
      navigate(item.link);
    }
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    mutate();
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={handleOpen}
        aria-label="การแจ้งเตือน"
        className={cn(
          "relative flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 bg-white transition-colors hover:bg-stone-50",
          open && "bg-stone-50 ring-2 ring-blue-500/20"
        )}
      >
        <Bell className="h-5 w-5 text-stone-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-full right-0 z-50 mt-2 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-stone-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-stone-900">การแจ้งเตือน</p>
              {unreadCount > 0 && (
                <p className="text-xs text-stone-500">{unreadCount} รายการใหม่</p>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-xs font-medium text-blue-600 hover:text-blue-700"
              >
                อ่านทั้งหมด
              </button>
            )}
          </div>

          <div className="max-h-[min(24rem,60vh)] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-stone-500">
                ยังไม่มีการแจ้งเตือน
              </div>
            ) : (
              <ul className="divide-y divide-stone-100">
                {notifications.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => handleItemClick(item)}
                      className={cn(
                        "flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-stone-50",
                        !item.readAt && "bg-blue-50/40"
                      )}
                    >
                      <div className="mt-0.5">
                        <NotificationIcon type={item.type} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-stone-900">
                          {item.title}
                        </p>
                        <p className="mt-0.5 line-clamp-2 text-xs text-stone-600">
                          {item.message}
                        </p>
                        <p className="mt-1 text-[11px] text-stone-400">
                          {formatRelativeTime(item.createdAt)}
                        </p>
                      </div>
                      {!item.readAt && (
                        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
