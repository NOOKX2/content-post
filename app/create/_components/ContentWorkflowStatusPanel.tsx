"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  Radio,
  Video,
  XCircle,
} from "lucide-react";
import { DashboardLink } from "@/components/layout/DashboardLink";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PlatformBadgeGroup } from "@/components/ui/PlatformIcon";
import { approveContent, rejectContent } from "@/lib/content/actions";
import {
  getApprovalRound,
  getContentWorkflowStep,
  getPublishWorkflowState,
  getWorkflowStatusHeader,
  type PublishWorkflowTone,
} from "@/lib/content/domain/workflow";
import { isImageMediaUrl, isVideoMediaUrl } from "@/lib/content/domain/media-url";
import { isStillMedia } from "@/lib/content/domain/media-type";
import { useContents } from "@/lib/content/client/contents-provider";
import { STATUS_LABELS } from "@/lib/constants";
import type { ContentItem } from "@/lib/types";
import { formatThaiDate } from "@/lib/shared/utils";
import { cn } from "@/lib/shared/utils";
import { statusLabel, useT } from "@/lib/i18n";
import { ContentWorkflowStepper } from "./ContentWorkflowStepper";

const PUBLISH_BANNER_STYLES: Record<
  PublishWorkflowTone,
  { box: string; icon: typeof CheckCircle2 }
> = {
  success: {
    box: "border-emerald-200 bg-emerald-50 text-emerald-800",
    icon: CheckCircle2,
  },
  info: {
    box: "border-blue-200 bg-blue-50 text-blue-800",
    icon: Clock3,
  },
  warning: {
    box: "border-amber-200 bg-amber-50 text-amber-900",
    icon: Radio,
  },
  error: {
    box: "border-red-200 bg-red-50 text-red-800",
    icon: XCircle,
  },
};

function PublishStatusBanner({ content }: { content: ContentItem }) {
  const publishState = getPublishWorkflowState(content);
  if (!publishState) return null;

  const styles = PUBLISH_BANNER_STYLES[publishState.banner.tone];
  const Icon = styles.icon;

  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3 text-sm",
        styles.box
      )}
    >
      <div className="flex items-center gap-2 font-medium">
        <Icon className="h-4 w-4 shrink-0" />
        {publishState.banner.message}
      </div>
    </div>
  );
}

function ExampleImageGrid({ content }: { content: ContentItem }) {
  const images = [
    ...(content.coverImage ? [content.coverImage] : []),
    ...content.exampleAttachments,
    ...(isStillMedia(content.mediaType) ? content.attachments : []),
    ...content.script
      .map((row) => row.imageUrl)
      .filter((url): url is string => Boolean(url?.trim())),
  ].filter((url) => isImageMediaUrl(url));

  if (images.length === 0) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-xl border border-dashed border-stone-200 bg-stone-50 text-sm text-stone-400">
        ไม่มีรูปตัวอย่าง
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {images.map((url) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={url}
          src={url}
          alt=""
          className="aspect-video w-full rounded-xl border border-stone-200 object-cover"
        />
      ))}
    </div>
  );
}

function VideoPreview({ content }: { content: ContentItem }) {
  const videoUrl = content.attachments.find((url) => isVideoMediaUrl(url));

  if (!videoUrl) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-xl border border-dashed border-stone-200 bg-stone-900 text-stone-400">
        <Video className="h-10 w-10" />
      </div>
    );
  }

  return (
    <video
      src={videoUrl}
      controls
      className="aspect-video w-full rounded-xl bg-stone-900 object-contain"
      preload="metadata"
    />
  );
}

function ContentSummary({ content }: { content: ContentItem }) {
  const { t } = useT();

  return (
    <Card className="space-y-4 p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs text-stone-400">
          #{content.contentId}
        </span>
        <Badge className={STATUS_LABELS[content.status].color}>
          {statusLabel(t, content.status)}
        </Badge>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-stone-900">{content.name}</h3>
        {content.details && (
          <p className="mt-2 text-sm text-stone-600 whitespace-pre-wrap">
            {content.details}
          </p>
        )}
      </div>
      <dl className="grid gap-2 text-sm sm:grid-cols-2">
        {content.category && (
          <div>
            <dt className="text-stone-500">หมวดหมู่</dt>
            <dd className="font-medium text-stone-800">{content.category}</dd>
          </div>
        )}
        {content.scheduledDate && (
          <div>
            <dt className="text-stone-500">วันโพสต์</dt>
            <dd className="font-medium text-stone-800">
              {formatThaiDate(content.scheduledDate)}
              {content.scheduledTime ? ` • ${content.scheduledTime}` : ""}
            </dd>
          </div>
        )}
      </dl>
      {content.platforms.length > 0 && (
        <PlatformBadgeGroup platforms={content.platforms} />
      )}
    </Card>
  );
}

function AdminApprovalActions({
  content,
  onUpdated,
}: {
  content: ContentItem;
  onUpdated: (item: ContentItem) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [rejectNote, setRejectNote] = useState("");
  const [showReject, setShowReject] = useState(false);
  const round = getApprovalRound(content);

  const handleApprove = async () => {
    if (busy) return;
    const label = round === 2 ? "อนุมัติคลิป" : "อนุมัติแนวคิด";
    if (!confirm(`${label} ${content.contentId} — ${content.name}?`)) return;

    setBusy(true);
    try {
      const result = await approveContent(content.id);
      if (!result.success) {
        alert(result.error);
        return;
      }
      onUpdated(result.data);
    } finally {
      setBusy(false);
    }
  };

  const handleReject = async () => {
    if (busy) return;
    const note = rejectNote.trim();
    if (!note) {
      alert("กรุณาระบุเหตุผลที่ส่งกลับแก้ไข");
      return;
    }

    setBusy(true);
    try {
      const result = await rejectContent(content.id, note);
      if (!result.success) {
        alert(result.error);
        return;
      }
      onUpdated(result.data);
      setShowReject(false);
      setRejectNote("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="border-orange-100 bg-orange-50/40 p-5">
      <p className="text-sm font-semibold text-stone-900">
        การดำเนินการของ Admin
      </p>
      <p className="mt-1 text-xs text-stone-600">
        {round === 2
          ? "ตรวจสอบคลิปวิดีโอแล้วอนุมัติเพื่อจัดตารางโพสต์"
          : "ตรวจสอบแนวคิดและรูปตัวอย่างก่อนให้ทีมผลิตต่อ"}
      </p>

      {showReject ? (
        <div className="mt-4 space-y-3">
          <textarea
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            placeholder="ระบุเหตุผลที่ส่งกลับแก้ไข..."
            rows={3}
            className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm"
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowReject(false)}
              disabled={busy}
            >
              ยกเลิก
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleReject}
              disabled={busy}
            >
              {busy ? "กำลังส่ง..." : "ยืนยันส่งกลับแก้ไข"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" onClick={handleApprove} disabled={busy}>
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            {round === 2 ? "อนุมัติขั้นสุดท้าย" : "อนุมัติ"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowReject(true)}
            disabled={busy}
          >
            ปฏิเสธ / ขอแก้ไข
          </Button>
        </div>
      )}
    </Card>
  );
}

export function ContentWorkflowStatusPanel({
  content,
  onContentChange,
}: {
  content: ContentItem;
  onContentChange: (item: ContentItem) => void;
}) {
  const { data: session } = useSession();
  const { mutateContents } = useContents();
  const isAdmin = session?.user?.role === "ADMIN";
  const step = getContentWorkflowStep(content);
  const header = getWorkflowStatusHeader(content);
  const publishState = getPublishWorkflowState(content);
  const isWaiting = step === 2 || step === 4;
  const isPublishedStep = step === 5;
  const isImage = isStillMedia(content.mediaType);

  const handleUpdated = async (item: ContentItem) => {
    await mutateContents(
      (current = []) =>
        current.map((entry) => (entry.id === item.id ? item : entry)),
      { revalidate: true }
    );
    onContentChange(item);
  };

  return (
    <div className="space-y-6">
      <ContentWorkflowStepper
        currentStep={step}
        fullyPublished={content.status === "posted"}
      />

      <div>
        <h2 className="text-xl font-bold text-stone-900">{header.title}</h2>
        <p className="mt-1 text-sm text-stone-500">{header.description}</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        <div className="space-y-5">
          {isPublishedStep && <PublishStatusBanner content={content} />}

          {isWaiting && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <div className="flex items-center gap-2 font-medium">
                <Clock3 className="h-4 w-4" />
                {step === 2
                  ? isImage
                    ? "ส่งงานเพื่ออนุมัติแล้ว — รอ Admin ตรวจสอบ"
                    : "ส่งขออนุมัติเบื้องต้นแล้ว — รอ Admin ตรวจสอบ"
                  : "ส่งคลิปเพื่อตรวจสอบแล้ว — รอ Admin อนุมัติขั้นสุดท้าย"}
              </div>
            </div>
          )}

          <ContentSummary content={content} />

          {(step === 2 || step === 1 || (isImage && step === 5)) && (
            <Card className="p-5">
              <p className="mb-3 text-sm font-semibold text-stone-800">
                {isImage ? "ตัวอย่างภาพ" : "ภาพอ้างอิง"}
              </p>
              <ExampleImageGrid content={content} />
            </Card>
          )}

          {!isImage && (step === 4 || step === 5) && (
            <Card className="p-5">
              <p className="mb-3 text-sm font-semibold text-stone-800">
                ตัวอย่างวิดีโอ
              </p>
              <VideoPreview content={content} />
            </Card>
          )}

          {isWaiting && isAdmin && (
            <AdminApprovalActions
              content={content}
              onUpdated={handleUpdated}
            />
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20">
          <Card className="p-5">
            <p className="text-sm font-semibold text-stone-800">
              วันโพสต์ Content
            </p>
            <p className="mt-2 text-sm text-stone-600">
              {content.scheduledDate
                ? `${formatThaiDate(content.scheduledDate)}${content.scheduledTime ? `, ${content.scheduledTime}` : ""}`
                : "—"}
            </p>
          </Card>

          {isPublishedStep && (
            <DashboardLink href="/calendar">
              <Button className="w-full" size="lg">
                <CalendarDays className="h-4 w-4" />
                {publishState?.banner.tone === "success"
                  ? "ดูในปฏิทิน"
                  : "ดูตารางโพสต์"}
              </Button>
            </DashboardLink>
          )}
        </aside>
      </div>
    </div>
  );
}
