"use client";

import type { ReactNode } from "react";
import type { ApprovalCardMetadata } from "@/lib/collaboration/types";
import { useApprovalCardMessage } from "@/app/collaboration/_hooks/use-approval-card-message";
import { cn } from "@/lib/shared/utils";
import {
  CheckCircle2, Clock3, Loader2, XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatLocalizedDateTime } from "@/lib/i18n";

function MetaCol({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-medium text-stone-400">{label}</p>
      <p className="mt-0.5 truncate text-sm text-stone-800">{value}</p>
    </div>
  );
}

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
  const {
    isAdmin,
    isPending,
    busy,
    showRejectForm, setShowRejectForm,
    rejectReason, setRejectReason,
    handleApprove,
    handleReject,
    t,
    locale,
  } = useApprovalCardMessage(messageId, metadata, onResolved);

  const isApproved = metadata.status === "approved";
  const isRejected = metadata.status === "rejected";

  return (
    <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
      {/* Green left border accent */}
      <div className="flex">
        <div className="w-1 shrink-0 bg-emerald-500" />

        <div className="min-w-0 flex-1 p-4 space-y-3">
          {/* Title row + status badge */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600">
                {metadata.approvalRound === 2 ? t("team.approvalClip") : t("team.approvalIdea")}
              </p>
              <p className="mt-1 text-base font-semibold text-stone-900 leading-snug">
                {metadata.contentName}
              </p>
            </div>

            {/* Status badge */}
            {!isPending && (
              <span
                className={cn(
                  "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
                  isApproved
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-700"
                )}
              >
                {isApproved
                  ? <><CheckCircle2 className="h-3.5 w-3.5" />{t("team.approved")}</>
                  : <><XCircle className="h-3.5 w-3.5" />{t("team.sentBack")}</>
                }
              </span>
            )}
          </div>

          {/* Meta grid: ผู้ส่ง / รหัส / ช่องทาง / อนุมัติโดย */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
            <MetaCol label={t("team.sender")} value={metadata.requesterName} />
            <MetaCol label={t("team.code")} value={metadata.contentCode} />
            <MetaCol label={t("team.channel")} value={metadata.channel} />
            {metadata.resolvedBy ? (
              <MetaCol
                label={isApproved ? t("team.approvedBy") ?? "อนุมัติโดย" : t("team.rejectedBy") ?? "ส่งกลับโดย"}
                value={metadata.resolvedBy}
              />
            ) : (
              <MetaCol label={t("team.approvedBy") ?? "อนุมัติโดย"} value="—" />
            )}
          </div>

          {/* Remarks */}
          {metadata.remarks && (
            <p className="text-sm text-stone-600">{metadata.remarks}</p>
          )}

          {/* Footer: timestamp + resolved info */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-stone-100 pt-2 text-xs text-stone-400">
            <span className="flex items-center gap-1">
              <Clock3 className="h-3 w-3" />
              {formatLocalizedDateTime(createdAt, locale)}
            </span>
            {!isPending && metadata.resolvedAt && (
              <span className={cn(
                "flex items-center gap-1 font-medium",
                isApproved ? "text-emerald-600" : "text-red-500"
              )}>
                {isApproved
                  ? <CheckCircle2 className="h-3 w-3" />
                  : <XCircle className="h-3 w-3" />
                }
                {isApproved ? t("team.approved") : t("team.sentBack")}
                {metadata.resolvedBy && ` · ${metadata.resolvedBy}`}
              </span>
            )}
            {metadata.rejectReason && (
              <span className="text-red-400">({metadata.rejectReason})</span>
            )}
          </div>

          {/* Admin actions */}
          {isPending && isAdmin && (
            <div className="space-y-3 border-t border-stone-100 pt-3">
              {showRejectForm ? (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-stone-700">{t("team.rejectReason")}</label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder={t("team.rejectReasonPlaceholder")}
                    rows={3}
                    disabled={busy}
                    className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="danger" size="sm" disabled={busy} onClick={() => void handleReject()}>
                      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                      {t("team.confirmReject")}
                    </Button>
                    <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => { setShowRejectForm(false); setRejectReason(""); }}>
                      {t("common.cancel")}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <Button type="button" size="sm" disabled={busy} className="bg-emerald-600 hover:bg-emerald-700" onClick={() => void handleApprove()}>
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    {t("admin.approve")}
                  </Button>
                  <Button type="button" variant="outline" size="sm" disabled={busy} className="border-red-300 text-red-700 hover:bg-red-50" onClick={() => setShowRejectForm(true)}>
                    <XCircle className="h-4 w-4" />
                    {t("team.sentBack")}
                  </Button>
                </div>
              )}
            </div>
          )}

          {isPending && !isAdmin && (
            <p className="text-xs text-stone-400">{t("team.waitingAdmin")}</p>
          )}
        </div>
      </div>
    </div>
  );
}
