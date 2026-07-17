import { NextResponse } from "next/server";
import { requireSession } from "@/lib/content/api-auth";
import {
  ensureDmChannel,
  listChannels,
} from "@/lib/collaboration/service";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const authResult = await requireSession();
  if ("error" in authResult) return authResult.error;

  const channels = await listChannels(authResult.session.user.id);
  return NextResponse.json({ channels });
}

export async function POST(request: Request) {
  const authResult = await requireSession();
  if ("error" in authResult) return authResult.error;

  try {
    const body = (await request.json()) as { userId?: string };
    if (!body.userId) {
      return NextResponse.json({ error: "กรุณาเลือกสมาชิก" }, { status: 400 });
    }

    const otherUser = await prisma.user.findUnique({
      where: { id: body.userId },
      select: { id: true, name: true, email: true },
    });
    if (!otherUser) {
      return NextResponse.json({ error: "ไม่พบสมาชิก" }, { status: 404 });
    }

    const channel = await ensureDmChannel({
      currentUser: {
        id: authResult.session.user.id,
        name: authResult.session.user.name ?? "ผู้ใช้",
      },
      otherUser,
    });

    const channels = await listChannels(authResult.session.user.id);
    const item = channels.find((c) => c.id === channel.id);

    return NextResponse.json({
      channel: item ?? {
        id: channel.id,
        slug: channel.slug,
        name: otherUser.name,
        kind: "dm" as const,
        contentId: null,
        peerUserId: otherUser.id,
        peerEmail: otherUser.email,
        lastMessageAt: null,
        lastMessagePreview: null,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "เปิดแชทส่วนตัวไม่สำเร็จ",
      },
      { status: 500 }
    );
  }
}
