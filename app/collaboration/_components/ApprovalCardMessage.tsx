"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import type { ApprovalCardMetadata } from "@/lib/collaboration/types";
import { useApprovalCardMessage } from "@/app/collaboration/_hooks/use-approval-card-message";
import { cn } from "@/lib/shared/utils";
import {
  Bot, CheckCircle2, Clock3, ExternalLink, Loader2, XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatLocalizedDateTime } from "@/lib/i18n";

function Row({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
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

  return (
    <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-orange-200 bg-white shadow-sm">
      {/* Bot header */}
      <div className="flex items-center justify-between gap-2 border-b border-orange-100 bg-orange-50 px-3 py-2">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-orange-600" />
          <span className="text-sm font-semibold text-orange-900">Approval Bot</span>
        </div>
        <span className="text-xs text-orange-700/80">{formatLocalizedDateTime(createdAt, locale)}</span>
      </div>

      <div className="space-y-3 px-3 py-3 text-sm">
        <p className="font-semibold text-stone-900">
          {metadata.approvalRound === 2 ? t("team.approvalClip") : t("team.approvalIdea")}
        </p>
        <div className="grid gap-1.5 text-xs text-stone-600">
          <Row label={t("team.sender")} value={metadata.requesterName} />
          <Row label={t("team.code")} value={metadata.contentCode} />
          <Row label={t("team.contentName")} value={metadata.contentName} />
          <Row label={t("team.channel")} value={metadata.channel} />
          <Row label={t("team.details")} value={metadata.remarks} />
          <Row label={t("team.requestedAt")} value={formatLocalizedDateTime(createdAt, locale)} icon={<Clock3 className="h-3 w-3 text-stone-400" />} />
          {!isPending && metadata.resolvedAt && (
            <Row
              label={metadata.status === "approved" ? t("team.approvedAt") : t("team.rejectedAt")}
              value={`${formatLocalizedDateTime(metadata.resolvedAt, locale)}${metadata.resolvedBy ? ` ${t("team.byName", { name: metadata.resolvedBy })}` : ""}`}
              icon={metadata.status === "approved" ? <CheckCircle2 className="h-3 w-3 text-emerald-500" /> : <XCircle className="h-3 w-3 text-red-500" />}
            />
          )}
        </div>

        {/* Resolved badge */}
        {!isPending && (
          <div className={cn("flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium", metadata.status === "approved" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700")}>
            {metadata.status === "approved" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
            {metadata.status === "approved" ? t("team.approved") : t("team.sentBack")}
            {metadata.rejectReason && <span className="block font-normal">{t("team.reason", { reason: metadata.rejectReason })}</span>}
          </div>
        )}

        {/* Admin actions */}
        {isPending && isAdmin && (
          <div className="space-y-3 border-t border-stone-100 pt-3">
            {showRejectForm ? (
              <div className="space-y-2">
                <label className="text-xs font-medium text-stone-700">{t("team.rejectReason")}</label>
                <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder={t("team.rejectReasonPlaceholder")} rows={3} disabled={busy} className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60" />
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
                <Button type="button" variant="outline" size="sm" disabled={busy} className="border-blue-300 text-blue-700 hover:bg-blue-50" onClick={() => void handleApprove()}>
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  {t("admin.approve")}
                </Button>
                <Button type="button" variant="outline" size="sm" disabled={busy} className="border-red-300 text-red-700 hover:bg-red-50" onClick={() => setShowRejectForm(true)}>
                  <XCircle className="h-4 w-4" />
                  {t("team.sentBack")}
                </Button>
                <Link href={`/content/${metadata.contentId}`} className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-stone-500 hover:text-blue-600">
                  {t("create.viewDetail")}
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            )}
          </div>
        )}

        {isPending && !isAdmin && (
          <p className="text-xs text-stone-500">{t("team.waitingAdmin")}</p>
        )}
      </div>
    </div>
  );
}
