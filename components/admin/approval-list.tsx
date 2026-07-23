"use client";

import { useMemo, useState } from "react";
import { ApprovalCard } from "./approval-card";
import { Tabs } from "@/components/ui/tabs";
import { useContents } from "@/lib/content/contents-provider";
import { approveContent, rejectContent } from "@/lib/content/actions";
import type { ContentItem, ContentStatus } from "@/lib/types";

const FILTER_TABS: { id: ContentStatus | "all"; label: string }[] = [
  { id: "pending", label: "รออนุมัติ" },
  { id: "approved", label: "อนุมัติแล้ว" },
  { id: "rejected", label: "ไม่อนุมัติ" },
  { id: "all", label: "ทั้งหมด" },
];

function replaceContentItem(
  contents: ContentItem[],
  updated: ContentItem
): ContentItem[] {
  return contents.map((content) =>
    content.id === updated.id ? updated : content
  );
}

export function ApprovalList() {
  const [filter, setFilter] = useState<ContentStatus | "all">("pending");
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const { contents, mutateContents } = useContents();

  const filtered = useMemo(
    () =>
      filter === "all"
        ? contents
        : contents.filter((content) => content.status === filter),
    [contents, filter]
  );

  const pendingCount = useMemo(
    () => contents.filter((content) => content.status === "pending").length,
    [contents]
  );

  const setProcessing = (id: string, busy: boolean) => {
    setProcessingIds((current) => {
      const next = new Set(current);
      if (busy) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const handleApprove = async (id: string) => {
    if (processingIds.has(id)) return;

    setProcessing(id, true);
    try {
      const result = await approveContent(id);
      if (!result.success) {
        alert(result.error);
        return;
      }

      await mutateContents(
        (current = []) => replaceContentItem(current, result.data),
        { revalidate: false }
      );
    } finally {
      setProcessing(id, false);
    }
  };

  const handleReject = async (id: string) => {
    if (processingIds.has(id)) return;

    setProcessing(id, true);
    try {
      const result = await rejectContent(id);
      if (!result.success) {
        alert(result.error);
        return;
      }

      await mutateContents(
        (current = []) => replaceContentItem(current, result.data),
        { revalidate: false }
      );
    } finally {
      setProcessing(id, false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs
        tabs={FILTER_TABS.map((tab) => ({
          ...tab,
          count: tab.id === "pending" ? pendingCount : undefined,
        }))}
        activeTab={filter}
        onChange={(id) => setFilter(id as ContentStatus | "all")}
      />

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
              isProcessing={processingIds.has(content.id)}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
        </div>
      )}
    </div>
  );
}
