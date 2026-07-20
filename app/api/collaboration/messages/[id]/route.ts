import { NextResponse } from "next/server";
import { requireSession } from "@/lib/content/api-auth";
import {
  assertCanAccessChannel,
  deleteTextMessage,
  updateTextMessage,
} from "@/lib/collaboration/service";
import { prisma } from "@/lib/prisma";

function toMessageItem(message: {
  id: string;
  channelId: string;
  authorId: string | null;
  authorName: string;
  body: string;
  messageType: string;
  metadata: unknown;
  createdAt: Date;
  editedAt: Date | null;
  deletedAt: Date | null;
}) {
  return {
    id: message.id,
    channelId: message.channelId,
    authorId: message.authorId,
    authorName: message.authorName,
    body: message.body,
    messageType: message.messageType,
    metadata: (message.metadata as Record<string, unknown>) ?? {},
    createdAt: message.createdAt.toISOString(),
    editedAt: message.editedAt?.toISOString() ?? null,
    deletedAt: message.deletedAt?.toISOString() ?? null,
  };
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireSession();
  if ("error" in authResult) return authResult.error;

  const { id } = await params;
  const existing = await prisma.collaborationMessage.findUnique({
    where: { id },
    select: { channelId: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "ไม่พบข้อความ" }, { status: 404 });
  }

  const allowed = await assertCanAccessChannel(
    existing.channelId,
    authResult.session.user.id
  );
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = (await request.json()) as { body?: string };
    const message = await updateTextMessage({
      messageId: id,
      userId: authResult.session.user.id,
      body: body.body ?? "",
    });
    return NextResponse.json({ message: toMessageItem(message) });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "แก้ไขข้อความไม่สำเร็จ",
      },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireSession();
  if ("error" in authResult) return authResult.error;

  const { id } = await params;
  const existing = await prisma.collaborationMessage.findUnique({
    where: { id },
    select: { channelId: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "ไม่พบข้อความ" }, { status: 404 });
  }

  const allowed = await assertCanAccessChannel(
    existing.channelId,
    authResult.session.user.id
  );
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const message = await deleteTextMessage({
      messageId: id,
      userId: authResult.session.user.id,
    });
    return NextResponse.json({ message: toMessageItem(message) });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "ยกเลิกข้อความไม่สำเร็จ",
      },
      { status: 400 }
    );
  }
}
