"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, ListFilter, Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import {
  POSTS_GROUP_TABS,
  POSTS_SUB_FILTERS,
  type PostsSubFilter,
  type PostsViewGroup,
} from "@/lib/content/client/posts-filters";
import type { MediaType } from "@/lib/types";
import { cn } from "@/lib/shared/utils";

interface PostsFilterBarProps {
  group: PostsViewGroup;
  subFilter: PostsSubFilter;
  mediaType: MediaType | "all";
  query: string;
  onGroupChange: (group: PostsViewGroup) => void;
  onSubFilterChange: (subFilter: PostsSubFilter) => void;
  onMediaTypeChange: (mediaType: MediaType | "all") => void;
  onQueryChange: (query: string) => void;
}

const MEDIA_FILTER_OPTIONS: { id: MediaType | "all"; label: string }[] = [
  { id: "all", label: "ทุกประเภท" },
  { id: "video", label: "Video" },
  { id: "image", label: "Picture" },
];

export function PostsFilterBar({
  group,
  subFilter,
  mediaType,
  query,
  onGroupChange,
  onSubFilterChange,
  onMediaTypeChange,
  onQueryChange,
}: PostsFilterBarProps) {
  const [openGroup, setOpenGroup] = useState<PostsViewGroup | null>(null);
  const [showMediaFilter, setShowMediaFilter] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!barRef.current?.contains(event.target as Node)) {
        setOpenGroup(null);
        setShowMediaFilter(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleGroupClick = (nextGroup: PostsViewGroup) => {
    onGroupChange(nextGroup);

    const tab = POSTS_GROUP_TABS.find((item) => item.id === nextGroup);
    if (tab?.hasSubFilter) {
      setOpenGroup((current) => (current === nextGroup ? null : nextGroup));
      return;
    }

    setOpenGroup(null);
  };

  const activeSubLabel =
    group !== "all"
      ? POSTS_SUB_FILTERS[group].find((item) => item.id === subFilter)?.label
      : null;

  return (
    <div ref={barRef} className="space-y-3">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="-mx-1 overflow-x-auto px-1 pb-1">
          <div className="flex min-w-max items-end gap-1 border-b border-stone-200 sm:gap-3">
          {POSTS_GROUP_TABS.map((tab) => {
            const isActive = group === tab.id;
            const showDropdown = openGroup === tab.id && tab.hasSubFilter;

            return (
              <div key={tab.id} className="relative">
                <button
                  type="button"
                  onClick={() => handleGroupClick(tab.id)}
                  className={cn(
                    "-mb-px inline-flex min-h-10 shrink-0 items-center justify-center gap-1 rounded-t-lg px-3 pb-3 pt-2 text-sm font-medium transition-colors sm:min-h-11 sm:gap-1.5 sm:px-7 sm:pb-4 sm:pt-3 sm:text-[15px]",
                    isActive
                      ? "border-b-[3px] border-blue-600 text-blue-600"
                      : "border-b-[3px] border-transparent text-stone-500 hover:border-stone-300 hover:bg-stone-50/80 hover:text-stone-800"
                  )}
                >
                  <span className="whitespace-nowrap">{tab.label}</span>
                  {tab.hasSubFilter && (
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 shrink-0 opacity-70 transition-transform",
                        showDropdown && "rotate-180",
                        isActive && "opacity-100"
                      )}
                    />
                  )}
                </button>

                {showDropdown && tab.id !== "all" && (
                  <div className="absolute top-full left-0 z-20 mt-3 min-w-56 rounded-xl border border-stone-200 bg-white py-2 shadow-lg">
                    {POSTS_SUB_FILTERS[tab.id].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          onSubFilterChange(item.id);
                          setOpenGroup(null);
                        }}
                        className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-stone-700 hover:bg-stone-50"
                      >
                        <span>{item.label}</span>
                        {subFilter === item.id && group === tab.id && (
                          <Check className="h-4 w-4 text-blue-600" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <Input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="ค้นหาชื่อ / รหัส / ช่อง..."
              className="pl-9"
            />
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMediaFilter((current) => !current)}
              className={cn(
                "inline-flex h-10 w-10 items-center justify-center rounded-lg border transition-colors",
                mediaType !== "all" || showMediaFilter
                  ? "border-blue-200 bg-blue-50 text-blue-600"
                  : "border-stone-200 bg-white text-stone-500 hover:bg-stone-50"
              )}
              aria-label="กรองประเภท content"
            >
              <ListFilter className="h-4 w-4" />
            </button>

            {showMediaFilter && (
              <div className="absolute top-full right-0 z-20 mt-2 min-w-40 rounded-xl border border-stone-200 bg-white py-2 shadow-lg">
                {MEDIA_FILTER_OPTIONS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onMediaTypeChange(item.id);
                      setShowMediaFilter(false);
                    }}
                    className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-stone-700 hover:bg-stone-50"
                  >
                    <span>{item.label}</span>
                    {mediaType === item.id && (
                      <Check className="h-4 w-4 text-blue-600" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {activeSubLabel && subFilter !== "all" && (
        <p className="text-sm text-stone-500">
          กำลังแสดง: <span className="font-medium text-stone-700">{activeSubLabel}</span>
        </p>
      )}
    </div>
  );
}
