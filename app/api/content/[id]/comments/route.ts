import { NextResponse } from "next/server";
import { prisma } from "@/lib/shared/prisma";
import { requireSession } from "@/lib/shared/api-auth";
import { notifyTeamComment } from "@/lib/notifications/domain/events";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireSession();
  if ("error" in authResult) return authResult.error;

  const { id: contentId } = await params;

  const comments = await prisma.contentComment.findMany({
    where: { contentId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({
    comments: comments.map((c) => ({
      id: c.id,
      authorId: c.authorId,
      authorName: c.authorName,
      body: c.body,
      commentType: c.commentType,
      taggedName: c.taggedName,
      createdAt: c.createdAt.toISOString(),
    })),
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireSession();
  if ("error" in authResult) return authResult.error;

  const { id: contentId } = await params;

  const content = await prisma.content.findUnique({ where: { id: contentId } });
  if (!content) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = (await request.json()) as {
    body?: string;
    commentType?: "comment" | "edit_request" | "tag";
    taggedName?: string;
  };

  const text = body.body?.trim();
  if (!text) {
    return NextResponse.json({ error: "กรุณากรอกข้อความ" }, { status: 400 });
  }

  const commentType = body.commentType ?? "comment";

  const comment = await prisma.contentComment.create({
    data: {
      contentId,
      authorId: authResult.session.user.id,
      authorName: authResult.session.user.name ?? "ผู้ใช้",
      body: text,
      commentType,
      taggedName: body.taggedName?.trim() || null,
    },
  });

  await notifyTeamComment({
    content,
    authorId: authResult.session.user.id,
    authorName: authResult.session.user.name ?? "ผู้ใช้",
    body: text,
    commentType,
    taggedName: body.taggedName,
  });

  return NextResponse.json({
    comment: {
      id: comment.id,
      authorId: comment.authorId,
      authorName: comment.authorName,
      body: comment.body,
      commentType: comment.commentType,
      taggedName: comment.taggedName,
      createdAt: comment.createdAt.toISOString(),
    },
  });
}
