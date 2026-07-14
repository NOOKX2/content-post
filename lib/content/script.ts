import type { ScriptRow } from "@/lib/types";

/** Convert values like "0:00" / "0:15" into HTML time input values "00:00" / "00:15". */
export function toTimeInputValue(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const match = trimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!match) return "";

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const seconds = match[3] !== undefined ? Number(match[3]) : undefined;

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours > 23 ||
    minutes > 59 ||
    (seconds !== undefined && seconds > 59)
  ) {
    return "";
  }

  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");
  if (seconds !== undefined) {
    return `${hh}:${mm}:${String(seconds).padStart(2, "0")}`;
  }
  return `${hh}:${mm}`;
}

function parseLegacyDuration(duration: string): {
  startTime: string;
  endTime: string;
} {
  const trimmed = duration.trim();
  if (!trimmed) return { startTime: "", endTime: "" };

  const parts = trimmed.split(/[-–—]/).map((part) => part.trim());
  if (parts.length >= 2) {
    return {
      startTime: toTimeInputValue(parts[0]),
      endTime: toTimeInputValue(parts[1]),
    };
  }

  return { startTime: toTimeInputValue(trimmed), endTime: "" };
}

export function normalizeScriptRow(
  row: Partial<ScriptRow> & { id: string }
): ScriptRow {
  const hasSplitTimes =
    typeof row.startTime === "string" || typeof row.endTime === "string";

  if (hasSplitTimes) {
    return {
      id: row.id,
      startTime: toTimeInputValue(row.startTime ?? ""),
      endTime: toTimeInputValue(row.endTime ?? ""),
      action: row.action ?? "",
      dialogue: row.dialogue ?? "",
      notes: row.notes ?? "",
      imageUrl: row.imageUrl ?? "",
    };
  }

  const legacy = parseLegacyDuration(row.duration ?? "");
  return {
    id: row.id,
    startTime: legacy.startTime,
    endTime: legacy.endTime,
    action: row.action ?? "",
    dialogue: row.dialogue ?? "",
    notes: row.notes ?? "",
    imageUrl: row.imageUrl ?? "",
  };
}

export function formatScriptDuration(row: ScriptRow): string {
  const start = toTimeInputValue(row.startTime ?? "");
  const end = toTimeInputValue(row.endTime ?? "");

  if (start && end) return `${start} – ${end}`;
  if (start) return start;
  if (end) return end;
  if (row.duration?.trim()) return row.duration.trim();
  return "";
}
