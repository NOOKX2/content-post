"use client";

import { ArrowRight, ImageIcon, Plus, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getContentThumbnailUrl,
  getWorkflowCardAction,
  groupContentsByWorkflowStep,
  needsCreatorAction,
  WORKFLOW_BOARD_COLUMNS,
} from "@/lib/content/content-workflow";
import { STATUS_LABELS } from "@/lib/constants";
import type { ContentItem } from "@/lib/types";
import { cn } from "@/lib/utils";

function WorkflowBoardCard({
  content,
  onSelect,
}: {
  content: ContentItem;
  onSelect: (content: ContentItem) => void;
}) {
  const thumbnail = getContentThumbnailUrl(content);
  const action = getWorkflowCardAction(content);
  const status = STATUS_LABELS[content.status];

  return (
    <button
      type="button"
      onClick={() => onSelect(content)}
      className={cn(
        "w-full rounded-lg border bg-white p-2 text-left shadow-sm transition hover:shadow-md",
        action.urgent
          ? "border-blue-300 hover:border-blue-400"
          : "border-stone-200 hover:border-blue-200"
      )}
    >
      <div className="flex gap-2">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-stone-100">
          {thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumbnail}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : content.mediaType === "video" ? (
            <Video className="h-4 w-4 text-stone-400" />
          ) : (
            <ImageIcon className="h-4 w-4 text-stone-400" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-xs font-semibold leading-snug text-stone-900">
            {content.name}
          </p>
          <p className="mt-0.5 truncate font-mono text-[10px] text-stone-400">
            #{content.contentId}
          </p>
          <span
            className={cn(
              "mt-1 inline-flex max-w-full truncate rounded px-1 py-0.5 text-[9px] font-medium",
              status.color
            )}
          >
            {status.label}
          </span>
        </div>
      </div>
      <p
        className={cn(
          "mt-2 flex items-center gap-0.5 text-[10px] font-medium leading-tight",
          action.urgent ? "text-blue-600" : "text-stone-500"
        )}
      >
        <span className="line-clamp-1">{action.label}</span>
        <ArrowRight className="h-2.5 w-2.5 shrink-0" />
      </p>
    </button>
  );
}

export function ContentWorkflowHub({
  contents,
  onCreateNew,
  onSelectContent,
}: {
  contents: ContentItem[];
  onCreateNew: () => void;
  onSelectContent: (content: ContentItem) => void;
}) {
  const grouped = groupContentsByWorkflowStep(contents);

  const sortColumnItems = (items: ContentItem[]) =>
    [...items].sort((a, b) => {
      const aUrgent = needsCreatorAction(a) ? 0 : 1;
      const bUrgent = needsCreatorAction(b) ? 0 : 1;
      return aUrgent - bUrgent;
    });

  const columnsWithItems = WORKFLOW_BOARD_COLUMNS.map((column) => ({
    ...column,
    items:
      column.step === 5
        ? [...grouped[column.step]]
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
            .slice(0, 10)
        : sortColumnItems(grouped[column.step]),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-stone-900">
            งานที่กำลังดำเนินการ
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            ติดตามสถานะและจัดการงานคอนเทนต์ของคุณ
          </p>
        </div>
        <Button type="button" onClick={onCreateNew}>
          <Plus className="h-4 w-4" />
          สร้างคอนเทนต์ใหม่
        </Button>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {columnsWithItems.map((column) => (
          <div
            key={column.step}
            className="flex min-w-0 flex-col rounded-lg border border-stone-200 bg-stone-50/80"
          >
            <div className="border-b border-stone-200 px-2.5 py-2.5">
              <div className="flex items-center justify-between gap-1.5">
                <h3 className="truncate text-sm font-semibold text-stone-800">
                  {column.title}
                </h3>
                <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-xs font-medium text-stone-500 shadow-sm">
                  {column.items.length}
                </span>
              </div>
              <p className="mt-0.5 truncate text-xs text-stone-500">
                {column.hint}
              </p>
            </div>

            <div className="flex flex-1 flex-col gap-1.5 p-1.5">
              {column.step === 1 && (
                <button
                  type="button"
                  onClick={onCreateNew}
                  className="flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-stone-300 bg-white px-2 py-3 text-[10px] font-medium leading-tight text-stone-600 transition hover:border-blue-300 hover:bg-blue-50/40 hover:text-blue-700"
                >
                  <Plus className="h-3.5 w-3.5" />
                  สร้างใหม่
                </button>
              )}

              {column.items.length === 0 && column.step !== 1 ? (
                <p className="px-1 py-4 text-center text-[10px] text-stone-400">
                  ยังไม่มีงาน
                </p>
              ) : (
                column.items.map((item) => (
                  <WorkflowBoardCard
                    key={item.id}
                    content={item}
                    onSelect={onSelectContent}
                  />
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
