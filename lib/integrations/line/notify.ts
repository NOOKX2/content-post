import type { Content } from "@prisma/client";
import { pushLineMessages } from "@/lib/integrations/line/client";
import {
  getLineGroupId,
  isLineMessagingConfigured,
} from "@/lib/integrations/line/env";
import { buildApprovalFlexMessage } from "@/lib/integrations/line/flex-approval";
import { logLine } from "@/lib/integrations/line/log";

export async function notifyLineApprovalRequested(
  content: Content
): Promise<void> {
  const hasToken = isLineMessagingConfigured();
  const groupId = getLineGroupId();

  logLine("info", "notify-approval", "sending Flex card after submit", {
    id: content.id,
    contentId: content.contentId,
    name: content.name,
    status: content.status,
    hasToken,
    hasGroupId: Boolean(groupId),
    groupId: groupId || null,
  });

  if (!hasToken) {
    logLine(
      "error",
      "notify-approval",
      "SKIP — LINE_CHANNEL_ACCESS_TOKEN is missing (check .env / Vercel / recreate Docker)"
    );
    return;
  }

  if (!groupId) {
    logLine(
      "error",
      "notify-approval",
      "SKIP — LINE_GROUP_ID is missing (invite the bot to a group, then set the C… id)"
    );
    return;
  }

  const message = buildApprovalFlexMessage(content);

  try {
    await pushLineMessages(groupId, [message]);
    logLine("info", "notify-approval", "Flex card sent to LINE group", {
      contentId: content.contentId,
      groupId,
    });
  } catch (error) {
    logLine("error", "notify-approval", "LINE push failed — content is still saved", {
      contentId: content.contentId,
      groupId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
