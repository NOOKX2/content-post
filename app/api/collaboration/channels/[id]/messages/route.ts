import { NextResponse } from "next/server";
import { requireSession } from "@/lib/content/api-auth";
import {
  getChannelMessages,
  postTextMessage,
} from "@/lib/collaboration/service";

function toMessageItem(
  message: Awaited<ReturnType<typeof getChannelMessages>>[number]
) {
  return {
    id: message.id,
    channelId: message.channelId,
    authorId: message.authorId,
    authorName: message.authorName,
    body: message.body,
    messageType: message.messageType,
    metadata: (message.metadata as Record<string, unknown>) ?? {},
    createdAt: message.createdAt.toISOString(),
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireSession();
  if ("error" in authResult) return authResult.error;

  const { id } = await params;
  const messages = await getChannelMessages(id);
  return NextResponse.json({
    messages: messages.map(toMessageItem),
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireSession();
  if ("error" in authResult) return authResult.error;

  const { id } = await params;
  const body = (await request.json()) as { body?: string };
  const text = body.body?.trim();
  if (!text) {
    return NextResponse.json({ error: "กรุณากรอกข้อความ" }, { status: 400 });
  }

  const message = await postTextMessage({
    channelId: id,
    authorId: authResult.session.user.id,
    authorName: authResult.session.user.name ?? "ผู้ใช้",
    body: text,
  });

  return NextResponse.json({ message: toMessageItem(message) });
}
