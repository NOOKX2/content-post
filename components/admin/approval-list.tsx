"use client";

import { useMemo, useState } from "react";
import { ApprovalCard } from "./approval-card";
import { Tabs } from "@/components/ui/tabs";
import { approveContent, rejectContent } from "@/lib/content/actions";
import { useContents } from "@/lib/content/contents-provider";
import type { ContentItem, ContentStatus } from "@/lib/types";

const FILTER_TABS: { id: ContentStatus | "all"; label: string }[] = [
  { id: "pending", label: "รออนุมัติ" },
  { id: "approved", label: "อนุมัติแล้ว" },
  { id: "rejected", label: "ไม่อนุมัติ" },
  { id: "all", label: "ทั้งหมด" },
];

function updateContentStatus(
  contents: ContentItem[],
  id: string,
  status: ContentStatus
): ContentItem[] {
  return contents.map((content) =>
    content.id === id ? { ...content, status } : content
  );
}

export function ApprovalList() {
  const [filter, setFilter] = useState<ContentStatus | "all">("pending");
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

  const handleApprove = (id: string) => {
    void mutateContents(
      async (current = []) => {
        const result = await approveContent(id);
        if (!result.success) {
          throw new Error(result.error);
        }
        return updateContentStatus(current, id, "approved");
      },
      {
        optimisticData: (current = []) =>
          updateContentStatus(current, id, "approved"),
        rollbackOnError: true,
        revalidate: true,
      }
    ).catch((error: Error) => {
      alert(error.message);
    });
  };

  const handleReject = (id: string) => {
    void mutateContents(
      async (current = []) => {
        const result = await rejectContent(id);
        if (!result.success) {
          throw new Error(result.error);
        }
        return updateContentStatus(current, id, "rejected");
      },
      {
        optimisticData: (current = []) =>
          updateContentStatus(current, id, "rejected"),
        rollbackOnError: true,
        revalidate: true,
      }
    ).catch((error: Error) => {
      alert(error.message);
    });
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
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
        </div>
      )}
    </div>
  );
}
