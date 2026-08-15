import type { Content } from "@prisma/client";
import { pushLineMessages } from "@/lib/integrations/line/client";
import {
  getLineGroupId,
  isLineMessagingConfigured,
} from "@/lib/integrations/line/env";
import { buildApprovalFlexMessage } from "@/lib/integrations/line/flex-approval";

export async function notifyLineApprovalRequested(
  content: Content
): Promise<void> {
  if (!isLineMessagingConfigured()) return;

  const groupId = getLineGroupId();
  if (!groupId) {
    console.warn(
      "[line] skip approval notify — set LINE_GROUP_ID (invite the bot to a group first)"
    );
    return;
  }

  const message = buildApprovalFlexMessage(content);

  try {
    await pushLineMessages(groupId, [message]);
  } catch (error) {
    console.error("[line] failed to send approval notification", {
      contentId: content.contentId,
      error: error instanceof Error ? error.message : error,
    });
  }
}
