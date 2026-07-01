import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/content/api-auth";
import { formDataToCreateInput, toContentItem } from "@/lib/content/mappers";
import type { ContentFormData } from "@/lib/types";
import { generateContentId } from "@/lib/utils";

export async function GET() {
  const authResult = await requireSession();
  if ("error" in authResult) return authResult.error;

  const records = await prisma.content.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(records.map(toContentItem));
}

export async function POST(request: Request) {
  const authResult = await requireSession();
  if ("error" in authResult) return authResult.error;

  try {
    const body = (await request.json()) as ContentFormData & {
      contentId?: string;
    };

    if (!body.name?.trim()) {
      return NextResponse.json(
        { error: "กรุณากรอกชื่อ Content" },
        { status: 400 }
      );
    }

    if (authResult.session.user.role === "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let contentId = body.contentId?.trim() || generateContentId();
    let attempts = 0;

    while (attempts < 5) {
      const existing = await prisma.content.findUnique({
        where: { contentId },
      });
      if (!existing) break;
      contentId = generateContentId();
      attempts++;
    }

    const record = await prisma.content.create({
      data: formDataToCreateInput(
        body,
        contentId,
        authResult.session.user.id
      ),
    });

    return NextResponse.json(toContentItem(record), { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาด กรุณาลองใหม่" },
      { status: 500 }
    );
  }
}
