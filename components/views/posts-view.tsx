"use client";

import { useMemo, useState } from "react";
import {
  Calendar,
  ImageIcon,
  ListFilter,
  Search,
  Video,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { DashboardLink } from "@/components/layout/dashboard-link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs } from "@/components/ui/tabs";
import { PlatformBadgeGroup } from "@/components/ui/platform-icon";
import { useContents } from "@/lib/content/contents-provider";
import { MEDIA_FORM_CONFIG } from "@/lib/content/form-config";
import { STATUS_LABELS } from "@/lib/constants";
import { formatThaiDate } from "@/lib/utils";
import type { ContentStatus } from "@/lib/types";
import { useSession } from "next-auth/react";

const FILTER_TABS: { id: ContentStatus | "all"; label: string }[] = [
  { id: "all", label: "ทั้งหมด" },
  { id: "pending", label: "รออนุมัติ" },
  { id: "approved", label: "อนุมัติแล้ว" },
  { id: "scheduled", label: "กำหนดการแล้ว" },
  { id: "posted", label: "โพสต์แล้ว" },
  { id: "rejected", label: "ไม่อนุมัติ" },
];

export function PostsView() {
  const { data: session } = useSession();
  const { contents } = useContents();
  const [filter, setFilter] = useState<ContentStatus | "all">("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return contents.filter((content) => {
      if (filter !== "all" && content.status !== filter) return false;
      if (!keyword) return true;

      return (
        content.name.toLowerCase().includes(keyword) ||
        content.contentId.toLowerCase().includes(keyword) ||
        content.channel.toLowerCase().includes(keyword)
      );
    });
  }, [contents, filter, query]);

  return (
    <>
      <Header
        session={session}
        title="รายการ post ทั้งหมด"
        description="ดูและตรวจสอบ Content ทุกสถานะได้จากที่เดียว"
      />
      <div className="space-y-5 px-8 py-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Tabs
            tabs={FILTER_TABS}
            activeTab={filter}
            onChange={(id) => setFilter(id as ContentStatus | "all")}
            className="flex-wrap overflow-x-auto"
          />
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ค้นหาชื่อ / รหัส / ช่อง..."
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-stone-500">
          <ListFilter className="h-4 w-4" />
          พบ {filtered.length} รายการ
        </div>

        {filtered.length === 0 ? (
          <Card className="py-12 text-center text-sm text-stone-400">
            ไม่พบ post ตามเงื่อนไขที่เลือก
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((content) => {
              const status = STATUS_LABELS[content.status];
              const media = MEDIA_FORM_CONFIG[content.mediaType];

              return (
                <DashboardLink
                  key={content.id}
                  href={`/content/${content.id}`}
                  className="block"
                >
                  <Card className="transition-shadow hover:border-blue-200 hover:shadow-md">
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${media.accentBg}`}
                      >
                        {content.mediaType === "video" ? (
                          <Video className={`h-5 w-5 ${media.accentText}`} />
                        ) : (
                          <ImageIcon className={`h-5 w-5 ${media.accentText}`} />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-xs text-stone-400">
                                #{content.contentId}
                              </span>
                              <Badge className={status.color}>
                                {status.label}
                              </Badge>
                              <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600">
                                {media.label}
                              </span>
                            </div>
                            <h3 className="mt-1 truncate text-base font-semibold text-stone-900">
                              {content.name}
                            </h3>
                            {content.channel && (
                              <p className="mt-0.5 text-sm text-stone-500">
                                {content.channel}
                              </p>
                            )}
                          </div>
                          <PlatformBadgeGroup platforms={content.platforms} />
                        </div>

                        {content.details && (
                          <p className="mt-2 line-clamp-2 text-sm text-stone-600">
                            {content.details}
                          </p>
                        )}

                        <div className="mt-3 flex flex-wrap gap-4 text-xs text-stone-500">
                          {content.scheduledDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {formatThaiDate(content.scheduledDate)}
                              {content.scheduledTime
                                ? ` · ${content.scheduledTime}`
                                : ""}
                            </span>
                          )}
                          {content.ideaCreator && (
                            <span>ผู้คิด: {content.ideaCreator}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </DashboardLink>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
