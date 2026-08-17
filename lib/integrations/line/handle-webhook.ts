import type { Content } from "@prisma/client";
import { prisma } from "@/lib/shared/prisma";
import {
  approveContentRecord,
  rejectContentRecord,
} from "@/lib/content/actions/approve";
import { STATUS_LABELS } from "@/lib/constants";
import { replyLineMessages } from "@/lib/integrations/line/client";
import { lineContentCardKind } from "@/lib/integrations/line/flex-approval";
import {
  isLineApprovalPostbackActive,
  parseLinePostback,
} from "@/lib/integrations/line/postback";
import { logLine } from "@/lib/integrations/line/log";

type LineEvent = {
  type?: string;
  replyToken?: string;
  postback?: { data?: string };
  source?: { type?: string; groupId?: string; userId?: string };
};

async function handlePostback(event: LineEvent): Promise<void> {
  const parsed = parseLinePostback(event.postback?.data ?? "");
  if (!parsed) return;

  const content = await prisma.content.findUnique({
    where: { id: parsed.id },
  });

  // LINE Messaging API cannot edit a Flex card after it is sent.
  // Do not reply with a second card — confirm with a short text instead.
  const replyText = async (text: string) => {
    if (!event.replyToken) return;
    await replyLineMessages(event.replyToken, [{ type: "text", text }]).catch(
      (error) => {
        console.error("[line] reply failed", error);
      }
    );
  };

  const replyDecision = async (record: Content) => {
    const status =
      STATUS_LABELS[record.status as keyof typeof STATUS_LABELS]?.label ??
      record.status;
    const title = `${record.contentId} — ${record.name}`.trim();
    const kind = lineContentCardKind(record.status);
    const headline =
      kind === "rejected"
        ? "ไม่อนุมัติแล้ว"
        : kind === "pending"
          ? "ยังรออนุมัติ"
          : "อนุมัติแล้ว";
    await replyText(`${headline}\n${title}\nสถานะ: ${status}`);
  };

  if (!content) {
    await replyText("ไม่พบคอนเทนต์นี้");
    return;
  }

  if (!isLineApprovalPostbackActive(content, parsed.token)) {
    const status =
      STATUS_LABELS[content.status as keyof typeof STATUS_LABELS]?.label ??
      content.status;
    logLine("info", "postback", "ignored spent button on original card", {
      contentId: content.contentId,
      status: content.status,
      action: parsed.action,
    });
    await replyText(
      `งานนี้ดำเนินการแล้ว — ปุ่มบนการ์ดเดิมใช้ไม่ได้แล้ว\n${content.contentId} — ${content.name}\nสถานะ: ${status}`
    );
    return;
  }

  try {
    if (parsed.action === "approve") {
      const updated = await approveContentRecord(content.id, "LINE OA");
      logLine("info", "postback", "approved from LINE", {
        contentId: content.contentId,
        status: updated.status,
      });
      await replyDecision(updated);
      return;
    }

    const rejected = await rejectContentRecord(
      content,
      "LINE OA",
      "ไม่อนุมัติผ่าน LINE"
    );
    logLine("info", "postback", "rejected from LINE", {
      contentId: content.contentId,
    });
    await replyDecision(rejected);
  } catch (error) {
    logLine("error", "postback", "approve/reject failed", {
      action: parsed.action,
      id: parsed.id,
      error: error instanceof Error ? error.message : String(error),
    });
    const latest = await prisma.content.findUnique({
      where: { id: content.id },
    });
    await replyDecision(latest ?? content);
  }
}

export async function handleLineWebhookEvents(
  events: LineEvent[]
): Promise<void> {
  for (const event of events) {
    if (event.type === "join" && event.source?.groupId) {
      logLine("info", "webhook", "bot joined group — copy LINE_GROUP_ID", {
        groupId: event.source.groupId,
      });
      if (event.replyToken) {
        await replyLineMessages(event.replyToken, [
          {
            type: "text",
            text: `เพิ่มบอทในกลุ่มแล้ว\nLINE_GROUP_ID=${event.source.groupId}`,
          },
        ]).catch(() => undefined);
      }
      continue;
    }

    if (event.type === "postback") {
      await handlePostback(event);
    }
  }
}

export type { Content };
