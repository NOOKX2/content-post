import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  requireAdmin,
  requireSessionOrN8n,
} from "@/lib/content/api-auth";
import { toContentItem } from "@/lib/content/mappers";
import type { ContentStatus } from "@/lib/types";
import {
  notifyApprovalRejected,
  notifyPostStatusUpdate,
} from "@/lib/notifications/events";
import { syncContentWorkflowToCollaboration } from "@/lib/collaboration/service";
import { approveContentRecord } from "@/lib/content/approve-content-record";

const N8N_ALLOWED_STATUSES: ContentStatus[] = ["posted", "scheduled"];

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

      if (body.status !== existing.status) {
        await notifyPostStatusUpdate(record, body.status);
      }

      return NextResponse.json(toContentItem(record));
    }

    if (body.status === "approved" || body.status === "rejected") {
      const adminResult = await requireAdmin();
      if ("error" in adminResult) return adminResult.error;

      if (body.status === "approved") {
        await approveContentRecord(
          id,
          body.approver || adminResult.session.user.name || "Admin"
        );
      } else {
        await prisma.content.update({
          where: { id },
          data: {
            status: "rejected",
            approver: null,
          },
        });
        await notifyApprovalRejected(existing);
        await syncContentWorkflowToCollaboration({
          content: existing,
          actorName: adminResult.session.user.name ?? "Admin",
          action: "rejected",
        });
      }

      const record = await prisma.content.findUniqueOrThrow({ where: { id } });
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
