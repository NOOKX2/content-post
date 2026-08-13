import { existsSync } from "node:fs";
import type { Content } from "@prisma/client";
import { buildN8nContentPayload } from "@/lib/integrations/n8n/build-content-payload";

function isRunningInDocker() {
  try {
    return existsSync("/.dockerenv");
  } catch {
    return false;
  }
}

function resolveN8nBaseUrl() {
  const configured = (process.env.N8N_WEBHOOK_URL || "").replace(/\/$/, "");
  const dockerUrl = "http://n8n:5678";
  const hostUrl = "http://localhost:5678";

  if (configured) {
    // Compose hostname only resolves inside the Docker network.
    if (/^https?:\/\/n8n(?::|\/|$)/i.test(configured) && !isRunningInDocker()) {
      return hostUrl;
    }
    return configured;
  }

  return isRunningInDocker() ? dockerUrl : hostUrl;
}

function logContentApproved(
  step: string,
  message: string,
  data?: Record<string, unknown>
) {
  const suffix =
    data === undefined ? "" : ` ${JSON.stringify(data, null, 2)}`;
  console.log(`[content-approved] ${step} | ${message}${suffix}`);
}

function getScheduleDebugInfo(
  scheduledDate: string | null,
  scheduledTime: string | null
) {
  if (!scheduledDate) {
    return { isDue: false, scheduledAt: null, now: new Date().toISOString() };
  }

  const time = scheduledTime || "00:00";
  const normalizedTime = time.length === 5 ? `${time}:00` : time;
  const scheduledAt = new Date(`${scheduledDate}T${normalizedTime}+07:00`);
  const now = new Date();

  return {
    scheduledAt: scheduledAt.toISOString(),
    now: now.toISOString(),
    isDue: scheduledAt.getTime() <= now.getTime(),
    msUntilDue: scheduledAt.getTime() - now.getTime(),
  };
}

function getApprovedWebhookUrl(): string {
  if (process.env.N8N_CONTENT_APPROVED_WEBHOOK_URL) {
    return process.env.N8N_CONTENT_APPROVED_WEBHOOK_URL;
  }

  const baseUrl = resolveN8nBaseUrl();
  return `${baseUrl}/webhook/content-approved`;
}

export async function dispatchApprovedContentToN8n(
  record: Content
): Promise<boolean> {
  const payload = await buildN8nContentPayload(record);
  const webhookUrl = getApprovedWebhookUrl();
  const schedule = getScheduleDebugInfo(
    record.scheduledDate,
    record.scheduledTime
  );

  logContentApproved("app/dispatch", "dispatching to n8n", {
    contentId: record.contentId,
    id: record.id,
    webhookUrl,
    scheduledDate: record.scheduledDate,
    scheduledTime: record.scheduledTime,
    channel: record.channel,
    platforms: record.platforms,
    bufferTargets: payload.bufferTargets,
    mediaUrl: payload.mediaUrl,
    attachmentCount: payload.attachments?.length ?? 0,
    schedule,
    expectedN8nPath: schedule.isDue
      ? "Due Now? true → post immediately"
      : "Due Now? false → wait until scheduled time",
  });

  const startedAt = Date.now();

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    let responseBody: unknown = responseText;
    try {
      responseBody = responseText ? JSON.parse(responseText) : null;
    } catch {
      // keep raw text
    }

    if (!response.ok) {
      logContentApproved("app/dispatch", "ERROR n8n webhook failed", {
        contentId: record.contentId,
        status: response.status,
        durationMs: Date.now() - startedAt,
        responseBody,
      });
      return false;
    }

    logContentApproved("app/dispatch", "n8n webhook accepted", {
      contentId: record.contentId,
      status: response.status,
      durationMs: Date.now() - startedAt,
      responseBody,
      note: "n8n returns 200 when webhook received; check n8n execution logs for Buffer result",
    });

    return true;
  } catch (error) {
    logContentApproved("app/dispatch", "ERROR n8n dispatch exception", {
      contentId: record.contentId,
      durationMs: Date.now() - startedAt,
      error:
        error instanceof Error
          ? { name: error.name, message: error.message, stack: error.stack }
          : String(error),
    });
    return false;
  }
}
