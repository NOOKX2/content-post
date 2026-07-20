import { NextResponse } from "next/server";
import { requireSession } from "@/lib/content/api-auth";
import {
  assertCanAccessChannel,
  postMeetingMessage,
} from "@/lib/collaboration/service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireSession();
  if ("error" in authResult) return authResult.error;

  const { id } = await params;
  const allowed = await assertCanAccessChannel(
    id,
    authResult.session.user.id
  );
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const payload = (await request.json()) as {
    title?: string;
    meetUrl?: string;
    startsAt?: string;
    endsAt?: string;
  };

  if (!payload.title?.trim() || !payload.meetUrl?.trim()) {
    return NextResponse.json(
      { error: "กรุณากรอกหัวข้อและลิงก์ Google Meet" },
      { status: 400 }
    );
  }
  if (!payload.startsAt || !payload.endsAt) {
    return NextResponse.json(
      { error: "กรุณาเลือกเวลาเริ่มและสิ้นสุด" },
      { status: 400 }
    );
  }

  const message = await postMeetingMessage({
    channelId: id,
    authorId: authResult.session.user.id,
    authorName: authResult.session.user.name ?? "ผู้ใช้",
    title: payload.title.trim(),
    meetUrl: payload.meetUrl.trim(),
    startsAt: payload.startsAt,
    endsAt: payload.endsAt,
  });

  return NextResponse.json({
    message: {
      id: message.id,
      channelId: message.channelId,
      authorId: message.authorId,
      authorName: message.authorName,
      body: message.body,
      messageType: message.messageType,
      metadata: message.metadata as Record<string, unknown>,
      createdAt: message.createdAt.toISOString(),
      editedAt: message.editedAt?.toISOString() ?? null,
      deletedAt: message.deletedAt?.toISOString() ?? null,
    },
  });
}
