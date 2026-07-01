import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  requireAdmin,
  requireSession,
  requireSessionOrN8n,
} from "@/lib/content/api-auth";
import { toContentItem } from "@/lib/content/mappers";
import type { ContentStatus } from "@/lib/types";

const N8N_ALLOWED_STATUSES: ContentStatus[] = ["posted", "scheduled"];

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireSession();
  if ("error" in authResult) return authResult.error;

  const { id } = await params;

  try {
    const record = await prisma.content.findUnique({ where: { id } });
    if (!record) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(toContentItem(record));
  } catch {
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาด กรุณาลองใหม่" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireSessionOrN8n(request);
  if ("error" in authResult) return authResult.error;

  const { id } = await params;

  try {
    const body = (await request.json()) as {
      status?: ContentStatus;
      approver?: string;
    };

    const existing = await prisma.content.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if ("n8n" in authResult) {
      if (!body.status || !N8N_ALLOWED_STATUSES.includes(body.status)) {
        return NextResponse.json(
          { error: "Invalid status for automation" },
          { status: 400 }
        );
      }

      const record = await prisma.content.update({
        where: { id },
        data: { status: body.status },
      });

      return NextResponse.json(toContentItem(record));
    }

    if (body.status === "approved" || body.status === "rejected") {
      const adminResult = await requireAdmin();
      if ("error" in adminResult) return adminResult.error;

      const record = await prisma.content.update({
        where: { id },
        data: {
          status: body.status,
          approver:
            body.status === "approved"
              ? body.approver || adminResult.session.user.name || "Admin"
              : null,
        },
      });

      return NextResponse.json(toContentItem(record));
    }

    const record = await prisma.content.update({
      where: { id },
      data: {
        ...(body.status ? { status: body.status } : {}),
        ...(body.approver !== undefined ? { approver: body.approver } : {}),
      },
    });

    return NextResponse.json(toContentItem(record));
  } catch {
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาด กรุณาลองใหม่" },
      { status: 500 }
    );
  }
}
