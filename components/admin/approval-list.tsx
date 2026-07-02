"use client";

import { useState, useTransition } from "react";
import { ApprovalCard } from "./approval-card";
import { Tabs } from "@/components/ui/tabs";
import { approveContent, rejectContent } from "@/lib/content/actions";
import type { ContentItem, ContentStatus } from "@/lib/types";

const FILTER_TABS: { id: ContentStatus | "all"; label: string }[] = [
  { id: "pending", label: "รออนุมัติ" },
  { id: "approved", label: "อนุมัติแล้ว" },
  { id: "rejected", label: "ไม่อนุมัติ" },
  { id: "all", label: "ทั้งหมด" },
];

export function ApprovalList({ contents }: { contents: ContentItem[] }) {
  const [filter, setFilter] = useState<ContentStatus | "all">("pending");
  const [isPending, startTransition] = useTransition();

  const filtered =
    filter === "all"
      ? contents
      : contents.filter((c) => c.status === filter);

  const pendingCount = contents.filter((c) => c.status === "pending").length;

  const handleApprove = (id: string) => {
    startTransition(async () => {
      const result = await approveContent(id);
      if (!result.success) {
        alert(result.error);
      }
    });
  };

  const handleReject = (id: string) => {
    startTransition(async () => {
      const result = await rejectContent(id);
      if (!result.success) {
        alert(result.error);
      }
    });
  };

  return (
    <div className="space-y-6">
      <Tabs
        tabs={FILTER_TABS.map((t) => ({
          ...t,
          count: t.id === "pending" ? pendingCount : undefined,
        }))}
        activeTab={filter}
        onChange={(id) => setFilter(id as ContentStatus | "all")}
      />

      {isPending && (
        <p className="text-sm text-stone-500">กำลังอัปเดต...</p>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-stone-300 py-16 text-center">
          <p className="text-stone-500">ไม่มี Content ในหมวดนี้</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((content) => (
            <ApprovalCard
              key={content.id}
              content={content}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
        </div>
      )}
    </div>
  );
}
