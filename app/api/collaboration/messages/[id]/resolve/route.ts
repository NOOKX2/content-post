import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/content/api-auth";
import { approveContent, rejectContent } from "@/lib/content/actions";
import { resolveApprovalMessage } from "@/lib/collaboration/service";
import type { ApprovalCardMetadata } from "@/lib/collaboration/types";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireSession();
  if ("error" in authResult) return authResult.error;

  const isAdmin = authResult.session.user.role === "ADMIN";
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: messageId } = await params;
  const body = (await request.json()) as {
    action?: "approve" | "reject";
    rejectReason?: string;
  };

  if (!body.action) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const message = await prisma.collaborationMessage.findUnique({
    where: { id: messageId },
  });
  if (!message || message.messageType !== "approval_request") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const metadata = message.metadata as ApprovalCardMetadata;
  if (metadata.status !== "pending") {
    return NextResponse.json({ error: "ดำเนินการแล้ว" }, { status: 400 });
  }

  const content = await prisma.content.findUnique({
    where: { id: metadata.contentId },
  });
  if (!content) {
    return NextResponse.json({ error: "Content not found" }, { status: 404 });
  }

  const actorName = authResult.session.user.name ?? "Admin";

  if (body.action === "approve") {
    const result = await approveContent(content.id);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
  } else {
    if (!body.rejectReason?.trim()) {
      return NextResponse.json(
        { error: "กรุณาระบุเหตุผลที่ส่งกลับแก้ไข" },
        { status: 400 }
      );
    }
    const result = await rejectContent(content.id, body.rejectReason.trim());
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
  }

  await resolveApprovalMessage({
    messageId,
    status: body.action === "approve" ? "approved" : "rejected",
    resolvedBy: actorName,
    rejectReason: body.rejectReason?.trim(),
  });

  const updated = await prisma.collaborationMessage.findUnique({
    where: { id: messageId },
  });

  return NextResponse.json({
    message: updated
      ? {
          id: updated.id,
          channelId: updated.channelId,
          authorId: updated.authorId,
          authorName: updated.authorName,
          body: updated.body,
          messageType: updated.messageType,
          metadata: updated.metadata as Record<string, unknown>,
          createdAt: updated.createdAt.toISOString(),
        }
      : null,
  });
}
