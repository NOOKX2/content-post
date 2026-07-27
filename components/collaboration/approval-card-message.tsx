"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import type { ApprovalCardMetadata } from "@/lib/collaboration/types";
import { resolveApproval } from "@/lib/collaboration/fetch-actions";
import { cn, formatThaiDateTime } from "@/lib/utils";
import { useSession } from "next-auth/react";
import {
  Bot,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Loader2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function ApprovalCardMessage({
  messageId,
  metadata,
  createdAt,
  onResolved,
}: {
  messageId: string;
  metadata: ApprovalCardMetadata;
  createdAt: string;
  onResolved?: () => void;
}) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  const isPending = metadata.status === "pending";
  const requestedAt = createdAt;

  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [busy, setBusy] = useState(false);

  const handleApprove = async () => {
    if (busy || !isPending) return;
    if (!confirm(`อนุมัติ ${metadata.contentCode} — ${metadata.contentName}?`)) {
      return;
    }
    setBusy(true);
    try {
      await resolveApproval(messageId, "approve");
      onResolved?.();
    } catch (error) {
      alert(error instanceof Error ? error.message : "อนุมัติไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  };

  const handleReject = async () => {
    if (busy || !isPending) return;
    const reason = rejectReason.trim();
    if (!reason) {
      alert("กรุณาระบุเหตุผลที่ส่งกลับแก้ไข");
      return;
    }
    setBusy(true);
    try {
      await resolveApproval(messageId, "reject", reason);
      setShowRejectForm(false);
      setRejectReason("");
      onResolved?.();
    } catch (error) {
      alert(error instanceof Error ? error.message : "ส่งกลับแก้ไขไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-orange-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b border-orange-100 bg-orange-50 px-3 py-2">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-orange-600" />
          <span className="text-sm font-semibold text-orange-900">
            Approval Bot
          </span>
        </div>
        <span className="text-xs text-orange-700/80">
          {formatThaiDateTime(requestedAt)}
        </span>
      </div>
      <div className="space-y-3 px-3 py-3 text-sm">
        <p className="font-semibold text-stone-900">
          {metadata.approvalRound === 2
            ? "คำขออนุมัติคลิป (รอบ 2)"
            : "คำขออนุมัติแนวคิด (รอบ 1)"}
        </p>
        <div className="grid gap-1.5 text-xs text-stone-600">
          <Row label="ผู้ส่ง" value={metadata.requesterName} />
          <Row label="รหัส" value={metadata.contentCode} />
          <Row label="ชื่อ" value={metadata.contentName} />
          <Row label="ช่องที่ลง" value={metadata.channel} />
          <Row label="รายละเอียด" value={metadata.remarks} />
          <Row
            label="ส่งคำขอ"
            value={formatThaiDateTime(requestedAt)}
            icon={<Clock3 className="h-3 w-3 text-stone-400" />}
          />
          {!isPending && metadata.resolvedAt && (
            <Row
              label={
                metadata.status === "approved" ? "อนุมัติเมื่อ" : "ส่งกลับเมื่อ"
              }
              value={`${formatThaiDateTime(metadata.resolvedAt)}${
                metadata.resolvedBy ? ` โดย ${metadata.resolvedBy}` : ""
              }`}
              icon={
                metadata.status === "approved" ? (
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                ) : (
                  <XCircle className="h-3 w-3 text-red-500" />
                )
              }
            />
          )}
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
            {metadata.rejectReason && (
              <span className="block font-normal">
                เหตุผล: {metadata.rejectReason}
              </span>
            )}
          </div>
        )}

        {isPending && isAdmin && (
          <div className="space-y-3 border-t border-stone-100 pt-3">
            {showRejectForm ? (
              <div className="space-y-2">
                <label className="text-xs font-medium text-stone-700">
                  เหตุผลที่ส่งกลับแก้ไข *
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="ระบุสิ่งที่ต้องแก้ไข..."
                  rows={3}
                  disabled={busy}
                  className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    disabled={busy}
                    onClick={() => void handleReject()}
                  >
                    {busy ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    ยืนยันส่งกลับแก้ไข
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={busy}
                    onClick={() => {
                      setShowRejectForm(false);
                      setRejectReason("");
                    }}
                  >
                    ยกเลิก
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={busy}
                  className="border-blue-300 text-blue-700 hover:bg-blue-50"
                  onClick={() => void handleApprove()}
                >
                  {busy ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  อนุมัติ
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={busy}
                  className="border-red-300 text-red-700 hover:bg-red-50"
                  onClick={() => setShowRejectForm(true)}
                >
                  <XCircle className="h-4 w-4" />
                  ส่งกลับแก้ไข
                </Button>
                <Link
                  href={`/content/${metadata.contentId}`}
                  className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-stone-500 hover:text-blue-600"
                >
                  ดูรายละเอียด
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            )}
          </div>
        )}

        {isPending && !isAdmin && (
          <p className="text-xs text-stone-500">รอ Admin อนุมัติ</p>
        )}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: ReactNode;
}) {
  return (
    <div className="flex gap-2">
      <span className="flex w-20 shrink-0 items-center gap-1 text-stone-400">
        {icon}
        {label}
      </span>
      <span className="min-w-0 text-stone-700">{value}</span>
    </div>
  );
}
