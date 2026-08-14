import type { Content } from "@prisma/client";
import { prisma } from "@/lib/shared/prisma";
import {
  createCalendarEvent,
  isGoogleCalendarConfigured,
} from "@/lib/integrations/google/calendar";
import { invalidateContentsCache } from "@/lib/content/data/cache-tags";

function toIsoInBangkok(date: string, time: string) {
  const normalized = time.length === 5 ? `${time}:00` : time || "00:00:00";
  return new Date(`${date}T${normalized}+07:00`).toISOString();
}

function endIsoFromContent(content: Pick<Content, "scheduledDate" | "scheduledTime" | "endTime">) {
  if (content.endTime?.trim()) {
    return toIsoInBangkok(content.scheduledDate, content.endTime);
  }
  const start = new Date(toIsoInBangkok(content.scheduledDate, content.scheduledTime));
  start.setMinutes(start.getMinutes() + 30);
  return start.toISOString();
}

export async function syncContentToGoogleCalendar(
  content: Pick<
    Content,
    | "id"
    | "contentId"
    | "name"
    | "channel"
    | "details"
    | "scheduledDate"
    | "scheduledTime"
    | "endTime"
    | "googleEventId"
    | "googleCalendarLink"
  >
): Promise<{ synced: boolean; link?: string; error?: string }> {
  if (!isGoogleCalendarConfigured()) {
    return { synced: false, error: "Google Calendar is not configured" };
  }
  if (!content.scheduledDate?.trim() || !content.scheduledTime?.trim()) {
    return { synced: false, error: "Missing schedule date/time" };
  }

  try {
    const created = await createCalendarEvent({
      title: `[Content] ${content.name}`,
      description: [
        `Content ID: ${content.contentId}`,
        content.channel ? `Channel: ${content.channel}` : "",
        content.details?.trim() || "",
      ]
        .filter(Boolean)
        .join("\n"),
      startsAt: toIsoInBangkok(content.scheduledDate, content.scheduledTime),
      endsAt: endIsoFromContent(content),
      withMeet: false,
      eventId: content.googleEventId || undefined,
    });

    await prisma.content.update({
      where: { id: content.id },
      data: {
        googleEventId: created.eventId,
        googleCalendarLink: created.htmlLink,
      },
    });
    invalidateContentsCache(content.id);

    return { synced: true, link: created.htmlLink };
  } catch (error) {
    return {
      synced: false,
      error: error instanceof Error ? error.message : "Google Calendar sync failed",
    };
  }
}

export async function syncScheduledContentsToGoogleCalendar() {
  if (!isGoogleCalendarConfigured()) {
    return {
      configured: false as const,
      synced: 0,
      failed: 0,
      error: "ยังไม่ได้ตั้งค่า Google Calendar",
    };
  }

  const contents = await prisma.content.findMany({
    where: {
      status: { in: ["approved", "scheduled", "posting", "posted"] },
      scheduledDate: { not: "" },
      scheduledTime: { not: "" },
    },
    select: {
      id: true,
      contentId: true,
      name: true,
      channel: true,
      details: true,
      scheduledDate: true,
      scheduledTime: true,
      endTime: true,
      googleEventId: true,
      googleCalendarLink: true,
    },
  });

  let synced = 0;
  let failed = 0;
  let lastError = "";

  for (const content of contents) {
    const result = await syncContentToGoogleCalendar(content);
    if (result.synced) {
      synced += 1;
    } else {
      failed += 1;
      if (result.error) lastError = result.error;
    }
  }

  return {
    configured: true as const,
    synced,
    failed,
    total: contents.length,
    error: failed > 0 ? lastError : undefined,
  };
}
