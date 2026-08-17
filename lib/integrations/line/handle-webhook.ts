import type { Content } from "@prisma/client";
import { prisma } from "@/lib/shared/prisma";
import {
  approveContentRecord,
  rejectContentRecord,
} from "@/lib/content/actions/approve";
import { replyLineMessages } from "@/lib/integrations/line/client";
import { logLine } from "@/lib/integrations/line/log";

type LineEvent = {
  type?: string;
  replyToken?: string;
  postback?: { data?: string };
  source?: { type?: string; groupId?: string; userId?: string };
};

function parsePostback(data: string): { action: string; id: string } | null {
  const [action, id] = data.split(":");
  if (!action || !id) return null;
  if (action !== "approve" && action !== "reject") return null;
  return { action, id };
}

async function handlePostback(event: LineEvent): Promise<void> {
  const parsed = parsePostback(event.postback?.data ?? "");
  if (!parsed) return;

  const content = await prisma.content.findUnique({
    where: { id: parsed.id },
  });

  const reply = async (text: string) => {
    if (!event.replyToken) return;
    await replyLineMessages(event.replyToken, [{ type: "text", text }]).catch(
      (error) => {
        console.error("[line] reply failed", error);
      }
    );
  };

  if (!content) {
    await reply("ไม่พบคอนเทนต์นี้");
    return;
  }

  const label = `${content.contentId} — ${content.name}`;

  try {
    if (parsed.action === "approve") {
      const updated = await approveContentRecord(content.id, "LINE OA");
      logLine("info", "postback", "approved from LINE", {
        contentId: content.contentId,
        status: updated.status,
      });
      await reply(`อนุมัติแล้ว: ${label}\nสถานะ: ${updated.status}`);
      return;
    }

    await rejectContentRecord(content, "LINE OA", "ไม่อนุมัติผ่าน LINE");
    logLine("info", "postback", "rejected from LINE", {
      contentId: content.contentId,
    });
    await reply(`ไม่อนุมัติ: ${label}`);
  } catch (error) {
    logLine("error", "postback", "approve/reject failed", {
      action: parsed.action,
      id: parsed.id,
      error: error instanceof Error ? error.message : String(error),
    });
    await reply(
      error instanceof Error ? error.message : "ดำเนินการไม่สำเร็จ"
    );
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
