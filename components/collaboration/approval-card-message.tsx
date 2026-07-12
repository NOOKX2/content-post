"use client";

import type { ApprovalCardMetadata } from "@/lib/collaboration/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { resolveApproval } from "@/lib/collaboration/fetch-actions";
import { Bot, CheckCircle2, XCircle } from "lucide-react";

export function ApprovalCardMessage({
  metadata,
  messageId,
  onResolved,
}: {
  metadata: ApprovalCardMetadata;
  messageId: string;
  onResolved: () => void;
}) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPending = metadata.status === "pending";

  const handleResolve = async (action: "approve" | "reject") => {
    setSubmitting(true);
    setError(null);
    try {
      await resolveApproval(
        messageId,
        action,
        action === "reject" ? rejectReason.trim() : undefined
      );
      setRejectOpen(false);
      setRejectReason("");
      onResolved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ดำเนินการไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md overflow-hidden rounded-xl border border-orange-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-orange-100 bg-orange-50 px-3 py-2">
        <Bot className="h-4 w-4 text-orange-600" />
        <span className="text-sm font-semibold text-orange-900">
          Approval Bot
        </span>
      </div>
      <div className="space-y-2 px-3 py-3 text-sm">
        <p className="font-semibold text-stone-900">คำขออนุมัติ Content</p>
        <div className="grid gap-1.5 text-xs text-stone-600">
          <Row label="ผู้ส่ง" value={metadata.requesterName} />
          <Row label="รหัส" value={metadata.contentCode} />
          <Row label="ชื่อ" value={metadata.contentName} />
          <Row label="ช่องที่ลง" value={metadata.channel} />
          <Row label="รายละเอียด" value={metadata.remarks} />
        </div>

        {!isPending && (
          <div
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium",
              metadata.status === "approved"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            )}
          >
            {metadata.status === "approved" ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
            ) : (
              <XCircle className="h-3.5 w-3.5" />
            )}
            {metadata.status === "approved" ? "อนุมัติแล้ว" : "ส่งกลับแก้ไข"}
            {metadata.resolvedBy && ` โดย ${metadata.resolvedBy}`}
            {metadata.rejectReason && (
              <span className="block font-normal">เหตุผล: {metadata.rejectReason}</span>
            )}
          </div>
        )}

        {isPending && isAdmin && (
          <div className="space-y-2 pt-1">
            {!rejectOpen ? (
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  className="flex-1"
                  disabled={submitting}
                  onClick={() => handleResolve("approve")}
                >
                  อนุมัติ
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                  disabled={submitting}
                  onClick={() => setRejectOpen(true)}
                >
                  ส่งกลับแก้ไข
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="ระบุสิ่งที่ต้องแก้ไข..."
                  rows={2}
                  className="w-full resize-none rounded-lg border border-stone-200 px-2.5 py-2 text-xs"
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setRejectOpen(false)}
                  >
                    ยกเลิก
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="danger"
                    className="flex-1"
                    disabled={submitting || !rejectReason.trim()}
                    onClick={() => handleResolve("reject")}
                  >
                    ยืนยันส่งกลับ
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="w-16 shrink-0 text-stone-400">{label}</span>
      <span className="min-w-0 text-stone-700">{value}</span>
    </div>
  );
}
