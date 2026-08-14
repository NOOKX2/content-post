"use client";

import { useEffect, useMemo, useState } from "react";
import { ApprovalDetailPanel } from "./ApprovalDetailPanel";
import { ApprovalListItem } from "./ApprovalListItem";
import { Tabs } from "@/components/ui/Tabs";
import { useContents } from "@/lib/content/client/contents-provider";
import { approveContent, rejectContent } from "@/lib/content/actions";
import {
  countAdminApprovalView,
  matchesAdminApprovalView,
  type AdminApprovalStage,
  type AdminApprovalView,
} from "@/lib/content/domain/workflow";
import { useIsMobile } from "@/lib/hooks/use-is-mobile";
import type { ContentItem } from "@/lib/types";
import { cn } from "@/lib/shared/utils";
import { useT } from "@/lib/i18n";

const MAIN_TABS: AdminApprovalView[] = ["pending", "completed", "rejected"];
const STAGE_TABS: AdminApprovalStage[] = ["concept", "clip"];

function replaceContentItem(
  contents: ContentItem[],
  updated: ContentItem
): ContentItem[] {
  return contents.map((content) =>
    content.id === updated.id ? updated : content
  );
}

function sortByNewest(contents: ContentItem[]): ContentItem[] {
  return [...contents].sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );
}

export function ApprovalList() {
  const { t } = useT();
  const isMobile = useIsMobile();
  const [view, setView] = useState<AdminApprovalView>("pending");
  const [stage, setStage] = useState<AdminApprovalStage>("clip");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const { contents, mutateContents } = useContents();

  const filtered = useMemo(
    () =>
      sortByNewest(
        contents.filter((content) => matchesAdminApprovalView(content, view, stage))
      ),
    [contents, view, stage]
  );

  const selectedContent =
    filtered.find((content) => content.id === selectedId) ?? filtered[0] ?? null;

  useEffect(() => {
    const conceptCount = countAdminApprovalView(contents, view, "concept");
    const clipCount = countAdminApprovalView(contents, view, "clip");

    if (clipCount > 0) {
      setStage("clip");
      return;
    }

    if (conceptCount > 0) {
      setStage("concept");
    }
  }, [view, contents]);

  useEffect(() => {
    setMobileDetailOpen(false);
  }, [view, stage]);

  useEffect(() => {
    if (!filtered.length) {
      setSelectedId(null);
      return;
    }

    if (!selectedId || !filtered.some((content) => content.id === selectedId)) {
      setSelectedId(filtered[0].id);
    }
  }, [filtered, selectedId]);

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

    const content = contents.find((item) => item.id === id);
    if (!content) return;

    if (
      !confirm(
        t("admin.confirmApprove", {
          id: content.contentId,
          name: content.name,
        })
      )
    ) {
      return;
    }

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

  const handleReject = async (id: string, note: string) => {
    if (processingIds.has(id)) return;

    setProcessing(id, true);
    try {
      const result = await rejectContent(id, note);
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
    <div className="space-y-5">
      <div className="overflow-x-auto">
        <div className="flex min-w-max gap-6 border-b border-stone-200 px-1 sm:gap-8">
          {MAIN_TABS.map((tab) => {
            const count = countAdminApprovalView(contents, tab);
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setView(tab)}
                className={cn(
                  "-mb-px border-b-2 pb-3 text-sm font-medium transition-colors",
                  view === tab
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-stone-500 hover:text-stone-700"
                )}
              >
                {t(`admin.${tab}`)}
                {count > 0 && (
                  <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-xs text-white">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <Tabs
        tabs={STAGE_TABS.map((tab) => ({
          id: tab,
          label: t(`admin.${tab}`),
          count: countAdminApprovalView(contents, view, tab),
        }))}
        activeTab={stage}
        onChange={(id) => setStage(id as AdminApprovalStage)}
        className="w-full"
        compact
      />

      <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
        <div className="grid min-h-[24rem] grid-cols-1 lg:min-h-[36rem] lg:grid-cols-[320px_minmax(0,1fr)]">
          <div
            className={cn(
              "border-b border-stone-200 lg:border-r lg:border-b-0",
              mobileDetailOpen && "hidden lg:block"
            )}
          >
            <div className="border-b border-stone-100 px-4 py-3">
              <h2 className="text-sm font-semibold text-stone-900">
                {t(
                  view === "pending"
                    ? "admin.pendingList"
                    : view === "completed"
                      ? "admin.completedList"
                      : "admin.rejectedList"
                )}{" "}
                ({filtered.length})
              </h2>
            </div>

            {filtered.length === 0 ? (
              <div className="px-4 py-16 text-center text-sm text-stone-500">
                {t("admin.empty")}
              </div>
            ) : (
              <div className="max-h-[32rem] overflow-y-auto">
                {filtered.map((content) => (
                  <ApprovalListItem
                    key={content.id}
                    content={content}
                    stage={stage}
                    selected={selectedContent?.id === content.id}
                    onSelect={() => {
                      setSelectedId(content.id);
                      if (isMobile) {
                        setMobileDetailOpen(true);
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          <ApprovalDetailPanel
            content={selectedContent}
            view={view}
            stage={stage}
            className={cn(!mobileDetailOpen && "hidden lg:flex")}
            isProcessing={
              selectedContent ? processingIds.has(selectedContent.id) : false
            }
            onApprove={handleApprove}
            onReject={handleReject}
            onBack={mobileDetailOpen ? () => setMobileDetailOpen(false) : undefined}
          />
        </div>
      </div>
    </div>
  );
}
