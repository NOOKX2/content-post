import type { MediaType } from "@/lib/types";
import type {
  CalendarDateField,
  CalendarMode,
  DateRangePreset,
  PostStatusFilter,
} from "@/lib/calendar/domain/filters";

export type CalendarViewMode = "month" | "week";
export type MediaTypeFilter = "all" | MediaType;

export type CalendarUrlState = {
  mode: CalendarMode;
  view: CalendarViewMode;
  search: string;
  dateField: CalendarDateField;
  statusFilter: PostStatusFilter;
  mediaTypeFilter: MediaTypeFilter;
  rangeStart: string;
  rangeEnd: string;
  activePreset: DateRangePreset | null;
};

const DEFAULTS: CalendarUrlState = {
  mode: "post",
  view: "month",
  search: "",
  dateField: "post",
  statusFilter: "all",
  mediaTypeFilter: "all",
  rangeStart: "",
  rangeEnd: "",
  activePreset: null,
};

function isMode(value: string | null): value is CalendarMode {
  return value === "post" || value === "prepost";
}

function isView(value: string | null): value is CalendarViewMode {
  return value === "month" || value === "week";
}

function isDateField(value: string | null): value is CalendarDateField {
  return (
    value === "post" ||
    value === "ideaFinished" ||
    value === "shoot" ||
    value === "editFinished"
  );
}

function isStatus(value: string | null): value is PostStatusFilter {
  return (
    value === "all" ||
    value === "waiting" ||
    value === "posted" ||
    value === "needsEdit"
  );
}

function isMediaType(value: string | null): value is MediaTypeFilter {
  return (
    value === "all" ||
    value === "video" ||
    value === "image" ||
    value === "graphic"
  );
}

function isPreset(value: string | null): value is DateRangePreset {
  return (
    value === "today" ||
    value === "7d" ||
    value === "30d" ||
    value === "custom"
  );
}

export function parseCalendarSearchParams(
  searchParams: URLSearchParams
): CalendarUrlState {
  const modeParam = searchParams.get("mode");
  const mode = isMode(modeParam) ? modeParam : DEFAULTS.mode;
  const viewParam = searchParams.get("view");
  const dateFieldRaw = searchParams.get("dateField");
  const dateField = isDateField(dateFieldRaw)
    ? dateFieldRaw
    : mode === "prepost"
      ? "ideaFinished"
      : "post";
  const statusParam = searchParams.get("status");
  const typeParam = searchParams.get("type");
  const presetParam = searchParams.get("preset");

  return {
    mode,
    view: isView(viewParam) ? viewParam : DEFAULTS.view,
    search: searchParams.get("q") ?? "",
    dateField,
    statusFilter: isStatus(statusParam) ? statusParam : DEFAULTS.statusFilter,
    mediaTypeFilter: isMediaType(typeParam)
      ? typeParam
      : DEFAULTS.mediaTypeFilter,
    rangeStart: searchParams.get("from") ?? "",
    rangeEnd: searchParams.get("to") ?? "",
    activePreset: isPreset(presetParam) ? presetParam : null,
  };
}

export function calendarStateToSearchParams(
  state: CalendarUrlState
): URLSearchParams {
  const params = new URLSearchParams();

  if (state.mode !== DEFAULTS.mode) params.set("mode", state.mode);
  if (state.view !== DEFAULTS.view) params.set("view", state.view);
  if (state.search.trim()) params.set("q", state.search);
  if (state.mode === "prepost") {
    if (state.dateField !== "ideaFinished") {
      params.set("dateField", state.dateField);
    }
  } else if (state.dateField !== "post") {
    params.set("dateField", state.dateField);
  }
  if (state.statusFilter !== DEFAULTS.statusFilter) {
    params.set("status", state.statusFilter);
  }
  if (state.mediaTypeFilter !== DEFAULTS.mediaTypeFilter) {
    params.set("type", state.mediaTypeFilter);
  }
  if (state.rangeStart) params.set("from", state.rangeStart);
  if (state.rangeEnd) params.set("to", state.rangeEnd);
  if (state.activePreset) params.set("preset", state.activePreset);

  return params;
}
