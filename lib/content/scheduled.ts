import type { Content } from "@prisma/client";

const BANGKOK_OFFSET = "+07:00";

export function parseScheduledAt(date: string, time: string): Date {
  const normalizedTime = time.length === 5 ? `${time}:00` : time;
  return new Date(`${date}T${normalizedTime}${BANGKOK_OFFSET}`);
}

export function isContentDue(content: Content, now = new Date()): boolean {
  if (content.status !== "approved" && content.status !== "scheduled") {
    return false;
  }
  if (!content.scheduledDate || !content.scheduledTime) {
    return false;
  }
  return parseScheduledAt(content.scheduledDate, content.scheduledTime) <= now;
}

export function filterDueContent<T extends Content>(
  items: T[],
  now = new Date()
): T[] {
  return items.filter((item) => isContentDue(item, now));
}
