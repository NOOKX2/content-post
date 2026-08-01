"use client";

import { useMemo, useState } from "react";
import { ImageIcon, Plus, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  countContentsByWorkflowStep,
  getContentThumbnailUrl,
  getWorkflowCardAction,
  groupContentsByWorkflowStep,
  needsCreatorAction,
  WORKFLOW_BOARD_COLUMNS,
  type VideoWorkflowStep,
} from "@/lib/content/content-workflow";
import { STATUS_LABELS } from "@/lib/constants";
import type { ContentItem } from "@/lib/types";
import { cn } from "@/lib/utils";

type WorkflowHubFilter = VideoWorkflowStep;

function WorkflowFilterTabs({
  activeFilter,
  counts,
  onChange,
}: {
  activeFilter: WorkflowHubFilter;
  counts: Record<VideoWorkflowStep, number>;
  onChange: (filter: WorkflowHubFilter) => void;
}) {
  const tabs = WORKFLOW_BOARD_COLUMNS.map((column) => ({
    id: column.step,
    label: column.shortTitle,
    count: counts[column.step],
  }));

  return (
    <div className="-mx-1 overflow-x-auto px-1 pb-1">
      <div className="flex min-w-max gap-2">
        {tabs.map((tab) => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={String(tab.id)}
              type="button"
              onClick={() => onChange(tab.id)}
              className={cn(
                "shrink-0 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-medium transition",
                isActive
                  ? "bg-blue-600 text-white shadow-sm"
                  : "border border-stone-200 bg-white text-stone-600 hover:border-stone-300"
              )}
            >
              {tab.label} ({tab.count})
            </button>
          );
        })}
      </div>
    </div>
  );
}

function sortWorkflowItems(items: ContentItem[]): ContentItem[] {
  return [...items].sort((a, b) => {
    const aUrgent = needsCreatorAction(a) ? 0 : 1;
    const bUrgent = needsCreatorAction(b) ? 0 : 1;
    if (aUrgent !== bUrgent) return aUrgent - bUrgent;
    return (
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  });
}

function FeaturedWorkflowCard({
  content,
  onSelect,
}: {
  content: ContentItem;
  onSelect: (content: ContentItem) => void;
}) {
  const status = STATUS_LABELS[content.status];

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
      <h3 className="text-lg font-bold leading-snug text-stone-900">
        {content.name}
      </h3>
      <p className="mt-1 font-mono text-sm text-stone-400">
        #{content.contentId}
      </p>
      <span
        className={cn(
          "mt-2 inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
          status.color
        )}
      >
        {status.label}
      </span>
      <Button
        type="button"
        className="mt-4 w-full"
        onClick={() => onSelect(content)}
      >
        ดูรายละเอียด
      </Button>
    </div>
  );
}

function CompactWorkflowCard({
  content,
  onSelect,
}: {
  content: ContentItem;
  onSelect: (content: ContentItem) => void;
}) {
  const status = STATUS_LABELS[content.status];

  return (
    <div className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-base font-semibold text-stone-900">
          {content.name}
        </h3>
        <p className="mt-0.5 font-mono text-sm text-stone-400">
          #{content.contentId}
        </p>
        <span
          className={cn(
            "mt-1.5 inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
            status.color
          )}
        >
          {status.label}
        </span>
      </div>
      <Button
        type="button"
        size="sm"
        className="shrink-0"
        onClick={() => onSelect(content)}
      >
        ดูรายละเอียด
      </Button>
    </div>
  );
}

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
              "mt-1 inline-flex max-w-full truncate rounded px-1 py-0.5 text-[9px] font-medium leading-tight",
              status.color
            )}
          >
            {status.label}
          </span>
        </div>
      </div>
    </button>
  );
}

type WorkflowBoardColumnWithItems = (typeof WORKFLOW_BOARD_COLUMNS)[number] & {
  items: ContentItem[];
};

function WorkflowDesktopBoard({
  columnsWithItems,
  onCreateNew,
  onSelectContent,
}: {
  columnsWithItems: WorkflowBoardColumnWithItems[];
  onCreateNew: () => void;
  onSelectContent: (content: ContentItem) => void;
}) {
  return (
    <div className="hidden min-w-0 grid-cols-5 gap-2 md:grid">
      {columnsWithItems.map((column) => (
        <div
          key={column.step}
          className="flex min-w-0 flex-col rounded-lg border border-stone-200 bg-stone-50/80"
        >
          <div className="border-b border-stone-200 px-2.5 py-2.5">
            <div className="flex items-start justify-between gap-1.5">
              <h3 className="text-sm font-semibold leading-tight text-stone-800">
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

          <div className="flex flex-col gap-1.5 p-1.5">
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
  const [activeFilter, setActiveFilter] = useState<WorkflowHubFilter>(1);
  const grouped = groupContentsByWorkflowStep(contents);
  const counts = countContentsByWorkflowStep(contents);

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
        : sortWorkflowItems(grouped[column.step]),
  }));

  const filteredItems = useMemo(() => {
    return (
      columnsWithItems.find((column) => column.step === activeFilter)?.items ??
      []
    );
  }, [activeFilter, columnsWithItems]);

  const [featuredItem, ...restItems] = filteredItems;

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="hidden md:block">
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
      </div>

      <div className="space-y-4 md:hidden">
        <WorkflowFilterTabs
          activeFilter={activeFilter}
          counts={counts}
          onChange={setActiveFilter}
        />

        <Button type="button" onClick={onCreateNew} className="w-full">
          <Plus className="h-4 w-4" />
          สร้างคอนเทนต์ใหม่
        </Button>

        <div className="space-y-3">
          {filteredItems.length === 0 ? (
            <p className="py-8 text-center text-sm text-stone-400">
              ยังไม่มีงานในหมวดนี้
            </p>
          ) : (
            <>
              {featuredItem ? (
                <FeaturedWorkflowCard
                  content={featuredItem}
                  onSelect={onSelectContent}
                />
              ) : null}
              {restItems.map((item) => (
                <CompactWorkflowCard
                  key={item.id}
                  content={item}
                  onSelect={onSelectContent}
                />
              ))}
            </>
          )}
        </div>
      </div>

      <WorkflowDesktopBoard
        columnsWithItems={columnsWithItems}
        onCreateNew={onCreateNew}
        onSelectContent={onSelectContent}
      />
    </div>
  );
}
