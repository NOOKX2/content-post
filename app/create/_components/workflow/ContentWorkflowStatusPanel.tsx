"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  Expand,
  Loader2,
  Radio,
  Video,
  XCircle,
} from "lucide-react";
import { DashboardLink } from "@/components/layout/DashboardLink";
import { Button } from "@/components/ui/Button";
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
import type { ContentItem } from "@/lib/types";
import { cn } from "@/lib/shared/utils";
import { statusLabel, useT } from "@/lib/i18n";
import { getFilmingEquipmentTotalCount } from "@/app/create/_components/form/FilmingEquipmentChecklist";
import { PlatformLogo } from "@/components/ui/PlatformLogo";

const PUBLISH_BANNER_STYLES: Record<
  PublishWorkflowTone,
  { text: string; icon: typeof CheckCircle2 }
> = {
  success: {
    text: "text-emerald-800",
    icon: CheckCircle2,
  },
  info: {
    text: "text-blue-800",
    icon: Clock3,
  },
  warning: {
    text: "text-amber-900",
    icon: Radio,
  },
  error: {
    text: "text-red-800",
    icon: XCircle,
  },
};

function formatScheduleDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getDaysUntil(dateStr: string): number | null {
  const target = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(target.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  return Math.round(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
}

function scheduleUrgencyCopy(dateStr: string): {
  eyebrow: string;
  detail: string;
} {
  const diff = getDaysUntil(dateStr);
  if (diff == null) {
    return {
      eyebrow: "กำหนดโพสต์",
      detail: "ยังไม่ได้ระบุวันโพสต์",
    };
  }

  if (diff > 7) {
    return {
      eyebrow: "กำหนดโพสต์",
      detail: `เหลือเวลาอีก ${diff} วัน — วางแผนถ่ายและส่งงานให้ทันกำหนด`,
    };
  }

  if (diff > 0) {
    return {
      eyebrow: "กำหนดโพสต์ใกล้เข้ามา",
      detail: `เหลือเวลาอีก ${diff} วัน — ควรถ่ายและส่งงานให้แอดมินอนุมัติโดยเร็ว`,
    };
  }

  if (diff === 0) {
    return {
      eyebrow: "กำหนดโพสต์วันนี้",
      detail: "ถึงกำหนดโพสต์วันนี้ — ควรส่งงานให้แอดมินอนุมัติโดยเร็ว",
    };
  }

  return {
    eyebrow: "กำหนดโพสต์เลยกำหนดแล้ว",
    detail: `ผ่านมาแล้ว ${Math.abs(diff)} วัน — ควรถ่ายและส่งงานให้แอดมินอนุมัติโดยเร็ว`,
  };
}

function ScheduleHighlight({ content }: { content: ContentItem }) {
  if (!content.scheduledDate?.trim()) return null;

  const time = content.scheduledTime?.trim();
  const urgency = scheduleUrgencyCopy(content.scheduledDate);

  return (
    <section className="border-b border-stone-200 py-6">
      <div className="flex items-center gap-2 text-sm font-semibold text-orange-600">
        <CalendarDays className="h-4 w-4 shrink-0" strokeWidth={2.25} />
        <span>{urgency.eyebrow}</span>
      </div>
      <p className="mt-2 text-lg font-semibold tracking-tight text-stone-900 sm:text-xl">
        {formatScheduleDate(content.scheduledDate)}
        {time ? ` · ${time} น.` : ""}
      </p>
      <p className="mt-2 text-sm font-medium leading-relaxed text-orange-600">
        {urgency.detail}
      </p>
    </section>
  );
}

function WaitingStatusBanner({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="border-b border-stone-200 py-6">
      <div className="flex items-center gap-2.5">
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-orange-500" />
        </span>
        <h3 className="text-base font-semibold text-stone-900 sm:text-lg">{title}</h3>
      </div>
      <p className="mt-2 pl-5 text-sm leading-relaxed text-stone-500">
        {description}
      </p>
    </section>
  );
}

function PublishStatusBanner({ content }: { content: ContentItem }) {
  const publishState = getPublishWorkflowState(content);
  if (!publishState) return null;

  const styles = PUBLISH_BANNER_STYLES[publishState.banner.tone];
  const Icon = styles.icon;

  return (
    <section
      className={cn(
        "border-b border-stone-200 py-6 text-sm font-medium",
        styles.text
      )}
    >
      <div className="flex items-center gap-2.5">
        <Icon className="h-4 w-4 shrink-0" />
        <h3 className="text-base font-semibold sm:text-lg">
          {publishState.banner.message}
        </h3>
      </div>
    </section>
  );
}

function EquipmentChecklist({ items }: { items: string[] }) {
  if (items.length === 0) return null;

  return (
    <section className="border-b border-stone-200 py-6">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <p className="text-sm font-semibold text-stone-900">อุปกรณ์ที่ต้องใช้</p>
        <p className="text-xs text-stone-400">
          {items.length} / {getFilmingEquipmentTotalCount()} รายการ
        </p>
      </div>
      <div className="grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
        {items.map((item) => (
          <label
            key={item}
            className="flex cursor-default items-start gap-2.5 text-sm text-stone-800"
          >
            <input
              type="checkbox"
              checked
              readOnly
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-stone-300 text-teal-600"
            />
            <span className="leading-5">{item}</span>
          </label>
        ))}
      </div>
    </section>
  );
}

function collectPreviewImages(content: ContentItem): string[] {
  return [
    ...(content.coverImage ? [content.coverImage] : []),
    ...content.exampleAttachments,
    ...(isStillMedia(content.mediaType) ? content.attachments : []),
    ...content.script
      .map((row) => row.imageUrl)
      .filter((url): url is string => Boolean(url?.trim())),
  ].filter((url) => isImageMediaUrl(url));
}

function MediaPreview({ content }: { content: ContentItem }) {
  const isImage = isStillMedia(content.mediaType);
  const images = collectPreviewImages(content);
  const videoUrl = content.attachments.find((url) => isVideoMediaUrl(url));
  const primaryImage = images[0];
  const mediaUrl = primaryImage || videoUrl || "";
  const expandLabel = primaryImage ? "ขยายดูรูปเต็ม" : "ขยายดูสื่อ";

  return (
    <section className="w-full max-w-sm space-y-3">
      <div>
        <h3 className="text-base font-bold text-stone-900">ภาพอ้างอิง</h3>
      </div>

      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl border border-stone-200 bg-stone-100 shadow-sm sm:aspect-square">
        {primaryImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={primaryImage}
            alt={content.name}
            className="h-full w-full object-cover"
          />
        ) : videoUrl ? (
          <video
            src={videoUrl}
            controls
            className="h-full w-full bg-stone-900 object-contain"
            preload="metadata"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-stone-400">
            <Video className="h-8 w-8 text-stone-300" />
            <span>{isImage ? "ยังไม่มีรูปตัวอย่าง" : "ยังไม่มีสื่อตัวอย่าง"}</span>
          </div>
        )}
      </div>

      {mediaUrl ? (
        <div className="flex flex-wrap gap-2">
          <a
            href={mediaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
          >
            <Expand className="h-3.5 w-3.5" />
            {expandLabel}
          </a>
          <a
            href={mediaUrl}
            download
            className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
          >
            <Download className="h-3.5 w-3.5" />
            ดาวน์โหลด
          </a>
        </div>
      ) : null}
    </section>
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
    <section className="space-y-3 border-b border-stone-200 py-4">
      <div>
        <p className="text-sm font-semibold text-stone-900">
          การดำเนินการของผู้ดูแล
        </p>
        <p className="mt-1 text-xs text-stone-500">
          {round === 2
            ? "ตรวจสอบคลิปวิดีโอแล้วอนุมัติเพื่อจัดตารางโพสต์"
            : "ตรวจสอบแนวคิดและรูปตัวอย่างก่อนให้ทีมผลิตต่อ"}
        </p>
      </div>

      {showReject ? (
        <div className="space-y-3">
          <textarea
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            placeholder="ระบุเหตุผลที่ส่งกลับแก้ไข..."
            rows={3}
            className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
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
        <div className="flex flex-wrap gap-2">
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
    </section>
  );
}

export function ContentWorkflowStatusPanel({
  content,
  onContentChange,
}: {
  content: ContentItem;
  onContentChange: (item: ContentItem) => void;
}) {
  const { t } = useT();
  const { data: session } = useSession();
  const { mutateContents } = useContents();
  const isAdmin = session?.user?.role === "ADMIN";
  const step = getContentWorkflowStep(content);
  const header = getWorkflowStatusHeader(content);
  const publishState = getPublishWorkflowState(content);
  const isWaiting = step === 2 || step === 4;
  const isPublishedStep = step === 5;
  const isImage = isStillMedia(content.mediaType);
  const equipment = content.filmingEquipment.filter((item) => item.trim());

  const waitingTitle =
    step === 4 ? "รอแอดมินอนุมัติคลิป" : "รอแอดมินอนุมัติ";
  const waitingDescription =
    step === 2
      ? isImage
        ? "ส่งงานเพื่ออนุมัติแล้ว เริ่มขั้นตอนถัดไปได้เมื่อได้รับการยืนยันจากแอดมิน"
        : "ส่งคำขออนุมัติแนวคิดแล้ว เริ่มถ่ายได้เมื่อได้รับการยืนยันจากแอดมิน"
      : "ส่งคลิปเพื่อตรวจสอบแล้ว รอผู้ดูแลอนุมัติขั้นสุดท้ายก่อนจัดตารางโพสต์";

  const handleUpdated = async (item: ContentItem) => {
    await mutateContents(
      (current = []) =>
        current.map((entry) => (entry.id === item.id ? item : entry)),
      { revalidate: true }
    );
    onContentChange(item);
  };

  return (
    <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-7">
          <div className="space-y-3 border-b border-stone-200 pb-6">
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-stone-500">
              <span className="font-mono text-stone-400">
                #{content.contentId}
              </span>
              <span className="text-stone-300">·</span>
              <span className="font-semibold text-orange-600">
                {statusLabel(t, content.status)}
              </span>
              {content.platforms.length > 0 ? (
                <>
                  <span className="text-stone-300">·</span>
                  <span className="inline-flex items-center gap-1.5">
                    {content.platforms.map((platform) => (
                      <PlatformLogo
                        key={platform}
                        platform={platform}
                        size={16}
                      />
                    ))}
                  </span>
                </>
              ) : null}
              {content.category ? (
                <>
                  <span className="text-stone-300">·</span>
                  <span>{content.category}</span>
                </>
              ) : null}
            </p>

            <h2 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
              {content.name}
            </h2>

            <p className="text-sm leading-relaxed text-stone-500">
              {isWaiting
                ? step === 2
                  ? "เตรียมอุปกรณ์และถ่ายตามแนวทางที่อนุมัติ"
                  : header.description
                : header.description}
            </p>
          </div>

          <ScheduleHighlight content={content} />

          {isWaiting && (
            <WaitingStatusBanner
              title={waitingTitle}
              description={waitingDescription}
            />
          )}
          {isPublishedStep && <PublishStatusBanner content={content} />}

          {content.details?.trim() ? (
            <p className="whitespace-pre-wrap border-b border-stone-200 py-6 text-sm leading-relaxed text-stone-600">
              {content.details}
            </p>
          ) : null}

          <EquipmentChecklist items={equipment} />

          {isWaiting && isAdmin && (
            <AdminApprovalActions
              content={content}
              onUpdated={handleUpdated}
            />
          )}

          {isPublishedStep && (
            <div className="border-b border-stone-200 py-6">
              <DashboardLink href="/calendar">
                <Button size="lg">
                  <CalendarDays className="h-4 w-4" />
                  {publishState?.banner.tone === "success"
                    ? "ดูในปฏิทิน"
                    : "ดูตารางโพสต์"}
                </Button>
              </DashboardLink>
            </div>
          )}
        </div>

        <aside className="flex flex-col items-center lg:col-span-5 lg:sticky lg:top-20 lg:items-end">
          <MediaPreview content={content} />
        </aside>
    </div>
  );
}
