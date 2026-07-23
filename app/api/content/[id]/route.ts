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
import { formatApiErrorResponse } from "@/lib/content/action-errors";
import { logPipeline } from "@/lib/content/pipeline-log";

import { markPostFailedRecord } from "@/lib/content/mark-post-failed";

const N8N_ALLOWED_STATUSES: ContentStatus[] = [
  "posted",
  "scheduled",
  "posting",
  "post_failed",
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
      postError?: string;
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
      logPipeline("PATCH from n8n", "received", {
        id,
        contentId: existing.contentId,
        previousStatus: existing.status,
        requestedStatus: body.status,
        postError: body.postError ?? null,
      });

      if (body.status === "post_failed") {
        const postError =
          typeof body.postError === "string" && body.postError.trim()
            ? body.postError.trim()
            : "โพสต์ไม่สำเร็จ (ไม่มีรายละเอียดจาก n8n)";

        const record = await markPostFailedRecord(id, {
          postError,
          source: "n8n",
          step: "pipeline",
        });

        logContentApproved("app/api", "n8n post_failed applied", {
          id: record.id,
          contentId: record.contentId,
          previousStatus: existing.status,
          newStatus: record.status,
          postError: record.postError,
        });

        return NextResponse.json(toContentItem(record));
      }

      const record = await prisma.content.update({
        where: { id },
        data: { status: body.status },
      });

      if (body.status !== existing.status) {
        try {
          await notifyPostStatusUpdate(record, body.status);
        } catch (notifyError) {
          logContentApproved("app/api", "WARN notify failed after n8n status update", {
            contentId: record.contentId,
            status: body.status,
            error:
              notifyError instanceof Error
                ? notifyError.message
                : String(notifyError),
          });
        }
      }

      logContentApproved("app/api", "n8n status update applied", {
        id: record.id,
        contentId: record.contentId,
        previousStatus: existing.status,
        newStatus: record.status,
        flowComplete: body.status === "posted",
      });
      logPipeline("PATCH from n8n", "status updated", {
        contentId: record.contentId,
        previousStatus: existing.status,
        newStatus: record.status,
        nextUiLabel:
          record.status === "posting"
            ? "กำลังโพสต์"
            : record.status === "posted"
              ? "โพสต์แล้ว"
              : record.status === "post_failed"
                ? "โพสต์ไม่สำเร็จ"
                : record.status,
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
    const { error: message, details } = formatApiErrorResponse(error);
    logContentApproved("app/api", "ERROR PATCH failed", {
      error: details,
    });
    return NextResponse.json({ error: message, details }, { status: 500 });
  }
}
