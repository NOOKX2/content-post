import type { Content } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { invalidateContentsCache } from "@/lib/content/cache-tags";
import { logPipeline } from "@/lib/content/pipeline-log";
import { notifyPostStatusUpdate } from "@/lib/notifications/events";

export type MarkPostFailedInput = {
  postError: string;
  source: string;
  step?: string;
  details?: Record<string, unknown>;
};

function truncateError(message: string, max = 4000): string {
  const trimmed = message.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}…`;
}

export async function markPostFailedRecord(
  id: string,
  input: MarkPostFailedInput
): Promise<Content> {
  const existing = await prisma.content.findUnique({ where: { id } });
  if (!existing) {
    throw new Error("Not found");
  }

  if (existing.status === "posted") {
    logPipeline("mark-post-failed", "skip — already posted", {
      id: existing.id,
      contentId: existing.contentId,
      source: input.source,
      step: input.step,
    });
    return existing;
  }

  if (existing.status === "post_failed" && existing.postError === input.postError) {
    logPipeline("mark-post-failed", "skip duplicate failure", {
      id: existing.id,
      contentId: existing.contentId,
      source: input.source,
    });
    return existing;
  }

  const postError = truncateError(
    input.step ? `[${input.step}] ${input.postError}` : input.postError
  );

  const record = await prisma.content.update({
    where: { id },
    data: {
      status: "post_failed",
      postError,
    },
  });

  logPipeline("mark-post-failed", "content marked post_failed", {
    id: record.id,
    contentId: record.contentId,
    previousStatus: existing.status,
    newStatus: record.status,
    source: input.source,
    step: input.step ?? null,
    postError,
    scheduledDate: record.scheduledDate,
    scheduledTime: record.scheduledTime,
    channel: record.channel,
    platforms: record.platforms,
    ...(input.details ?? {}),
    hint: "Filter logs with [content-pipeline] in terminal / Vercel",
  });

  try {
    await notifyPostStatusUpdate(record, "post_failed");
  } catch (notifyError) {
    logPipeline("mark-post-failed", "WARN notification failed", {
      contentId: record.contentId,
      error:
        notifyError instanceof Error
          ? notifyError.message
          : String(notifyError),
    });
  }

  invalidateContentsCache(id);
  return record;
}
