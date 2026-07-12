import type { Content } from "@prisma/client";
import { buildN8nContentPayload } from "@/lib/n8n/build-content-payload";

function getApprovedWebhookUrl(): string {
  if (process.env.N8N_CONTENT_APPROVED_WEBHOOK_URL) {
    return process.env.N8N_CONTENT_APPROVED_WEBHOOK_URL;
  }

  const baseUrl = (process.env.N8N_WEBHOOK_URL || "http://n8n:5678").replace(
    /\/$/,
    ""
  );
  return `${baseUrl}/webhook/content-approved`;
}

export async function dispatchApprovedContentToN8n(
  record: Content
): Promise<boolean> {
  const payload = await buildN8nContentPayload(record);
  const webhookUrl = getApprovedWebhookUrl();

  console.log("[content-approved] dispatching to n8n", {
    contentId: record.contentId,
    id: record.id,
    webhookUrl,
    scheduledDate: record.scheduledDate,
    scheduledTime: record.scheduledTime,
    channel: record.channel,
    platforms: record.platforms,
    bufferTargetCount: payload.bufferTargets?.length ?? 0,
  });

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(
        `[content-approved] n8n webhook failed (${response.status}):`,
        text
      );
      return false;
    }

    console.log("[content-approved] n8n webhook accepted", {
      contentId: record.contentId,
      status: response.status,
    });

    return true;
  } catch (error) {
    console.error("[content-approved] n8n dispatch error:", error);
    return false;
  }
}
