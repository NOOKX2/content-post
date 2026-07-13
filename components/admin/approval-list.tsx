"use client";

import { useMemo, useState } from "react";
import { ApprovalCard } from "./approval-card";
import { Tabs } from "@/components/ui/tabs";
import { useContents } from "@/lib/content/contents-provider";
import { formatClientApiError } from "@/lib/content/action-errors";
import type { ContentItem, ContentStatus } from "@/lib/types";

type PatchErrorBody = {
  error?: string;
  details?: Record<string, unknown>;
};

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

async function patchContentStatus(
  id: string,
  status: "approved" | "rejected"
): Promise<ContentItem> {
  const res = await fetch(`/api/content/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  const json = (await res.json()) as ContentItem & PatchErrorBody;
  if (!res.ok) {
    throw new Error(formatClientApiError(res.status, json));
  }
  return json;
}

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
        const updated = await patchContentStatus(id, "approved");
        return replaceContentItem(current, updated);
      },
      {
        optimisticData: (current = []) =>
          updateContentStatus(current, id, "scheduled"),
        rollbackOnError: true,
        populateCache: true,
        revalidate: true,
      }
    ).catch((error: Error) => {
      alert(error.message);
    });
  };

  const handleReject = (id: string) => {
    void mutateContents(
      async (current = []) => {
        const updated = await patchContentStatus(id, "rejected");
        return replaceContentItem(current, updated);
      },
      {
        optimisticData: (current = []) =>
          updateContentStatus(current, id, "rejected"),
        rollbackOnError: true,
        populateCache: true,
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
