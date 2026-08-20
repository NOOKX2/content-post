"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ContentSummaryCard } from "@/components/content/ContentSummaryCard";
import {
  countContentsByWorkflowStep,
  groupContentsByWorkflowStep,
  needsCreatorAction,
  WORKFLOW_BOARD_COLUMNS,
  type VideoWorkflowStep,
} from "@/lib/content/domain/workflow";
import { getMediaTypeCardClass } from "@/lib/calendar/domain/filters";
import { cn } from "@/lib/shared/utils";
import {
  useT,
  workflowStepHint,
  workflowStepLabel,
} from "@/lib/i18n";
import type { ContentItem } from "@/lib/types";

type WorkflowHubFilter = VideoWorkflowStep;

function WorkflowBoardItem({
  content,
  onSelect,
}: {
  content: ContentItem;
  onSelect: (content: ContentItem) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(content)}
      className={cn(
        "w-full rounded-lg p-2 text-left shadow-sm transition hover:shadow-md",
        getMediaTypeCardClass(content.mediaType)
      )}
    >
      <ContentSummaryCard content={content} compact />
    </button>
  );
}

function WorkflowFilterTabs({
  activeFilter,
  counts,
  onChange,
}: {
  activeFilter: WorkflowHubFilter;
  counts: Record<VideoWorkflowStep, number>;
  onChange: (filter: WorkflowHubFilter) => void;
}) {
  const { t } = useT();
  const tabs = WORKFLOW_BOARD_COLUMNS.map((column) => ({
    id: column.step,
    label: workflowStepLabel(t, column.step, true),
    count: counts[column.step],
  }));

  return (
    <div className="-mx-1 overflow-x-auto px-1">
      <div className="flex min-w-max border-b border-stone-200">
        {tabs.map((tab) => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={String(tab.id)}
              type="button"
              onClick={() => onChange(tab.id)}
              className={cn(
                "shrink-0 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "border-teal-600 text-teal-700"
                  : "border-transparent text-stone-500 hover:text-stone-700"
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

type WorkflowBoardColumnWithItems = (typeof WORKFLOW_BOARD_COLUMNS)[number] & {
  items: ContentItem[];
};

function WorkflowSectionHeader() {
  const { t } = useT();

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-400">
        CONTENT WORKFLOW
      </p>
      <h2 className="mt-0.5 text-lg font-bold text-stone-900">
        {t("workflow.activeWork")}
      </h2>
    </div>
  );
}

function WorkflowDesktopBoard({
  columnsWithItems,
  onCreateNew,
  onSelectContent,
}: {
  columnsWithItems: WorkflowBoardColumnWithItems[];
  onCreateNew: () => void;
  onSelectContent: (content: ContentItem) => void;
}) {
  const { t } = useT();

  return (
    <div className="hidden min-w-0 md:block">
      <div className="grid grid-cols-5 divide-x divide-stone-200 border-y border-stone-200">
        {columnsWithItems.map((column) => (
          <div key={column.step} className="flex min-w-0 flex-col">
            <div className="border-b border-stone-100 px-3 py-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-bold leading-tight text-stone-900">
                  {workflowStepLabel(t, column.step)}
                </h3>
                <span className="shrink-0 text-xs font-medium text-stone-400">
                  {String(column.items.length).padStart(2, "0")}
                </span>
              </div>
              <p className="mt-0.5 truncate text-xs text-stone-400">
                {workflowStepHint(t, column.step)}
              </p>
            </div>

            <div className="flex min-h-[120px] flex-1 flex-col gap-1.5 p-1.5">
              {column.step === 1 && (
                <button
                  type="button"
                  onClick={onCreateNew}
                  className="flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-stone-300 bg-white px-2 py-3 text-[10px] font-medium leading-tight text-stone-600 transition hover:border-blue-300 hover:bg-blue-50/40 hover:text-blue-700"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {t("workflow.createNew")}
                </button>
              )}

              {column.items.length === 0 && column.step !== 1 ? (
                <p className="px-3 py-6 text-center text-xs text-stone-400">
                  {t("workflow.emptyColumn")}
                </p>
              ) : (
                column.items.map((item) => (
                  <WorkflowBoardItem
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

export function ContentWorkflowHub({
  contents,
  onCreateNew,
  onSelectContent,
}: {
  contents: ContentItem[];
  onCreateNew: () => void;
  onSelectContent: (content: ContentItem) => void;
}) {
  const { t } = useT();
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

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <WorkflowSectionHeader />
        <Button type="button" onClick={onCreateNew} className="shrink-0">
          <Plus className="h-4 w-4" />
          {t("workflow.createContent")}
        </Button>
      </div>

      <div className="space-y-4 md:hidden">
        <WorkflowFilterTabs
          activeFilter={activeFilter}
          counts={counts}
          onChange={setActiveFilter}
        />

        <div className="space-y-2">
          {activeFilter === 1 && (
            <button
              type="button"
              onClick={onCreateNew}
              className="flex w-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-stone-300 px-3 py-4 text-sm font-medium text-stone-600 transition hover:border-blue-300 hover:bg-blue-50/40 hover:text-blue-700"
            >
              <Plus className="h-4 w-4" />
              {t("workflow.createNew")}
            </button>
          )}

          {filteredItems.length === 0 ? (
            <p className="py-8 text-center text-sm text-stone-400">
              {t("workflow.emptyCategory")}
            </p>
          ) : (
            filteredItems.map((item) => (
              <WorkflowBoardItem
                key={item.id}
                content={item}
                onSelect={onSelectContent}
              />
            ))
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
