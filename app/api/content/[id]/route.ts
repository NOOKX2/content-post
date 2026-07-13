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
import { invalidateContentsCache } from "@/lib/content/cache-tags";

const N8N_ALLOWED_STATUSES: ContentStatus[] = [
  "posted",
  "scheduled",
  "posting",
];

function logContentApproved(
  step: string,
  message: string,
  data?: Record<string, unknown>
) {
  const suffix =
    data === undefined ? "" : ` ${JSON.stringify(data, null, 2)}`;
  console.log(`[content-approved] ${step} | ${message}${suffix}`);
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
        logContentApproved("app/api", "ERROR invalid n8n status update", {
          id,
          requestedStatus: body.status,
          allowed: N8N_ALLOWED_STATUSES,
        });
        return NextResponse.json(
          { error: "Invalid status for automation" },
          { status: 400 }
        );
      }

      logContentApproved("app/api", "n8n status update request", {
        id,
        contentId: existing.contentId,
        previousStatus: existing.status,
        requestedStatus: body.status,
      });

      const record = await prisma.content.update({
        where: { id },
        data: { status: body.status },
      });

      if (body.status !== existing.status) {
        await notifyPostStatusUpdate(record, body.status);
      }

      logContentApproved("app/api", "n8n status update applied", {
        id: record.id,
        contentId: record.contentId,
        previousStatus: existing.status,
        newStatus: record.status,
        flowComplete: body.status === "posted",
      });

      invalidateContentsCache(id);
      return NextResponse.json(toContentItem(record));
    }

    if (body.status === "approved" || body.status === "rejected") {
      const adminResult = await requireAdmin();
      if ("error" in adminResult) return adminResult.error;

      if (body.status === "approved") {
        logContentApproved("app/api", "admin approve request", {
          id,
          contentId: existing.contentId,
          previousStatus: existing.status,
        });
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
      invalidateContentsCache(id);
      return NextResponse.json(toContentItem(record));
    }

    const record = await prisma.content.update({
      where: { id },
      data: {
        ...(body.status ? { status: body.status } : {}),
        ...(body.approver !== undefined ? { approver: body.approver } : {}),
      },
    });

    invalidateContentsCache(id);
    return NextResponse.json(toContentItem(record));
  } catch (error) {
    logContentApproved("app/api", "ERROR PATCH failed", {
      error:
        error instanceof Error
          ? { name: error.name, message: error.message }
          : String(error),
    });
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาด กรุณาลองใหม่" },
      { status: 500 }
    );
  }
}
