"use client";

import { useState } from "react";
import { ArrowLeft, Check, X } from "lucide-react";
import { ApprovalFeedbackHistory } from "./ApprovalFeedbackHistory";
import {
  canAdminApproveContent,
  canAdminRejectContent,
  getAdminApproveLabel,
  getAdminRejectionLabel,
  getContentThumbnailUrl,
  isPublishPipelineStatus,
  isRejectedAtClipStage,
  type AdminApprovalStage,
  type AdminApprovalView,
} from "@/lib/content/domain/workflow";
import { isVideoMediaUrl } from "@/lib/content/domain/media-url";
import type { ContentItem } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/shared/utils";

interface ApprovalDetailPanelProps {
  content: ContentItem | null;
  view: AdminApprovalView;
  stage: AdminApprovalStage;
  className?: string;
  isProcessing?: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string, note: string) => void;
  onBack?: () => void;
}

function ApprovalMediaPreview({ content }: { content: ContentItem }) {
  const thumbnail = getContentThumbnailUrl(content);
  const videoUrl = content.attachments.find((url) => isVideoMediaUrl(url));

  if (videoUrl) {
    return (
      <video
        src={videoUrl}
        controls
        className="aspect-video w-full rounded-xl border border-stone-200 bg-stone-900 object-contain"
        preload="metadata"
      />
    );
  }

  if (thumbnail) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={thumbnail}
        alt=""
        className="aspect-video w-full rounded-xl border border-stone-200 object-cover"
      />
    );
  }

  return (
    <div className="flex aspect-video w-full items-center justify-center rounded-xl border border-dashed border-stone-200 bg-stone-50 text-sm text-stone-500">
      ไม่มีตัวอย่างสื่อ
    </div>
  );
}

export function ApprovalDetailPanel({
  content,
  view,
  stage,
  className,
  isProcessing = false,
  onApprove,
  onReject,
  onBack,
}: ApprovalDetailPanelProps) {
  const [rejectNote, setRejectNote] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  if (!content) {
    return (
      <div
        className={cn(
          "flex h-full min-h-48 items-center justify-center px-4 text-sm text-stone-500 lg:min-h-[28rem] lg:px-8",
          className
        )}
      >
        เลือกรายการจากด้านซ้ายเพื่อดูรายละเอียด
      </div>
    );
  }

  const status = STATUS_LABELS[content.status];
  const rejectionLabel =
    content.status === "rejected" ? getAdminRejectionLabel(content) : null;
  const canApprove = view === "pending" && canAdminApproveContent(content);
  const canReject = view === "pending" && canAdminRejectContent(content);
  const approveLabel = getAdminApproveLabel(content);
  const roundLabel =
    stage === "clip" || isRejectedAtClipStage(content) ? "รอบที่ 2" : null;

  const handleReject = () => {
    const note = rejectNote.trim();
    if (!note) return;
    onReject(content.id, note);
    setRejectNote("");
    setShowRejectForm(false);
  };

  return (
    <div className={cn("flex h-full min-h-48 flex-col lg:min-h-[28rem]", className)}>
      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:space-y-5 sm:px-6 sm:py-5">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 lg:hidden"
          >
            <ArrowLeft className="h-4 w-4" />
            กลับไปรายการ
          </button>
        ) : null}

        <ApprovalMediaPreview content={content} />

        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge className={status.color}>
              {rejectionLabel ?? status.label}
            </Badge>
            {roundLabel && (
              <Badge className="bg-stone-100 text-stone-700">{roundLabel}</Badge>
            )}
            <span className="font-mono text-xs text-stone-400">
              #{content.contentId}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-stone-900">{content.name}</h2>
          <p className="mt-1 text-sm text-stone-500">
            {content.ideaCreator || content.channel}
            {content.details ? ` — ${content.details}` : ""}
          </p>
        </div>

        <ApprovalFeedbackHistory contentId={content.id} />

        {view === "completed" && isPublishPipelineStatus(content.status) && (
          <p className="text-sm text-blue-600">
            {content.mediaType === "video"
              ? `อนุมัติคลิปโดย ${content.approver ?? "Admin"}`
              : `อนุมัติ Content โดย ${content.approver ?? "Admin"}`}
          </p>
        )}

        {view === "rejected" && (
          <p className="text-sm text-red-600">
            {rejectionLabel ?? "ไม่อนุมัติ"}
          </p>
        )}
      </div>

      {canApprove && (
        <div className="border-t border-stone-200 bg-stone-50 px-4 py-3 sm:px-6 sm:py-4">
          {showRejectForm ? (
            <div className="space-y-3">
              <textarea
                value={rejectNote}
                onChange={(event) => setRejectNote(event.target.value)}
                placeholder="ระบุเหตุผลที่ส่งกลับแก้ไข..."
                rows={3}
                className="w-full resize-none rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isProcessing}
                  onClick={() => {
                    setShowRejectForm(false);
                    setRejectNote("");
                  }}
                >
                  ยกเลิก
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  disabled={isProcessing || !rejectNote.trim()}
                  onClick={handleReject}
                >
                  {isProcessing ? "กำลังดำเนินการ..." : "ยืนยันไม่อนุมัติ"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap justify-end gap-3">
              {canReject && (
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  disabled={isProcessing}
                  className="min-w-36 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => setShowRejectForm(true)}
                >
                  <X className="h-4 w-4" />
                  ไม่อนุมัติ
                </Button>
              )}
              <Button
                type="button"
                size="lg"
                disabled={isProcessing}
                className="min-w-40"
                onClick={() => onApprove(content.id)}
              >
                <Check className="h-4 w-4" />
                {isProcessing ? "กำลังอนุมัติ..." : approveLabel}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
