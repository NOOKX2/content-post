"use client";

import {
  Calendar,
  Clapperboard,
  FileText,
  ImageIcon,
  ListChecks,
  Package,
  Paperclip,
  Tag,
  Type,
  User,
  Users,
  Video,
} from "lucide-react";
import type { ContentItem } from "@/lib/types";
import { PlatformBadgeGroup } from "@/components/ui/PlatformIcon";
import { MEDIA_FORM_CONFIG } from "@/lib/content/domain/form-config";
import { isImageAttachment } from "@/lib/content/domain/attachments";
import { isVideoMediaUrl } from "@/lib/content/domain/media-url";
import { formatScriptDuration } from "@/lib/content/domain/script";
import { cn, formatThaiDate } from "@/lib/shared/utils";

interface ContentDetailProps {
  content: ContentItem;
}

function SectionCard({
  title,
  icon: Icon,
  children,
  className,
}: {
  title?: string;
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm",
        className
      )}
    >
      {title && (
        <div className="mb-4 flex items-center gap-2.5">
          {Icon && (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <Icon className="h-5 w-5" strokeWidth={2.25} />
            </span>
          )}
          <h3 className="text-xl font-bold tracking-tight text-slate-900">
            {title}
          </h3>
        </div>
      )}
      {children}
    </section>
  );
}

function MetaListRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  if (!value) return null;

  return (
    <div className="flex flex-col gap-1 border-b border-stone-100 py-3 last:border-b-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
      <dt className="flex shrink-0 items-center gap-1.5 text-sm text-stone-500">
        {Icon && <Icon className="h-3.5 w-3.5 text-stone-400" />}
        {label}
      </dt>
      <dd className="text-sm text-stone-800 sm:text-right">{value}</dd>
    </div>
  );
}

function HeroMedia({ content }: { content: ContentItem }) {
  const mediaConfig = MEDIA_FORM_CONFIG[content.mediaType];
  const isVideo = content.mediaType === "video";
  const heroUrl = content.attachments.find((url) => url.trim()) ?? "";
  const heroIsVideo = heroUrl ? isVideoMediaUrl(heroUrl) : false;
  const heroIsImage = heroUrl ? isImageAttachment(heroUrl) : false;
  const filename = heroUrl.split("?")[0].split("/").pop() ?? "preview";

  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-stone-200 shadow-sm">
      <div className="aspect-video w-full">
        {heroIsVideo ? (
          <video
            src={heroUrl}
            poster={content.coverImage || undefined}
            controls
            className="h-full w-full bg-black object-contain"
            preload="metadata"
          />
        ) : heroIsImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={heroUrl}
            alt={content.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className={cn(
              "flex h-full w-full flex-col items-center justify-center gap-2",
              mediaConfig.accentBg
            )}
          >
            {isVideo ? (
              <Video className={cn("h-12 w-12", mediaConfig.accentText)} />
            ) : (
              <ImageIcon className={cn("h-12 w-12", mediaConfig.accentText)} />
            )}
            <p className="text-sm text-stone-500">ยังไม่มีไฟล์ตัวอย่าง</p>
          </div>
        )}
      </div>
      {(heroIsVideo || heroIsImage) && (
        <div className="border-t border-stone-200 bg-white px-4 py-2">
          <p className="truncate text-xs text-stone-500">
            Preview: {filename}
          </p>
        </div>
      )}
    </div>
  );
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "เมื่อสักครู่";
  if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ชม.ที่แล้ว`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} วันที่แล้ว`;
  return formatThaiDate(iso.slice(0, 10));
}

const DETAIL_STATUS_STYLES: Record<
  ContentItem["status"],
  { label: string; className: string }
> = {
  draft: { label: "DRAFT", className: "bg-stone-100 text-stone-700" },
  pending: { label: "PENDING", className: "bg-amber-100 text-amber-800" },
  idea_approved: {
    label: "IDEA OK",
    className: "bg-sky-100 text-sky-800",
  },
  clip_pending: {
    label: "CLIP REVIEW",
    className: "bg-orange-100 text-orange-800",
  },
  approved: { label: "APPROVED", className: "bg-sky-100 text-sky-800" },
  scheduled: { label: "SCHEDULED", className: "bg-sky-100 text-sky-800" },
  posting: { label: "POSTING", className: "bg-amber-100 text-amber-800" },
  posted: { label: "PUBLISHED", className: "bg-sky-100 text-sky-800" },
  post_failed: { label: "POST FAILED", className: "bg-red-100 text-red-800" },
  rejected: { label: "REJECTED", className: "bg-red-100 text-red-800" },
};

function DetailStatusBadge({ status }: { status: ContentItem["status"] }) {
  const config = DETAIL_STATUS_STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex rounded-lg px-3 py-1.5 text-xs font-bold tracking-wide uppercase",
        config.className
      )}
    >
      {config.label}
    </span>
  );
}

function ApproverDisplay({ name }: { name: string }) {
  const initial = name.charAt(0).toUpperCase();
  return (
    <span className="inline-flex items-center gap-2">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-600 text-xs font-bold text-white">
        {initial}
      </span>
      <span>{name}</span>
    </span>
  );
}

function MetaCell({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  if (!value) return null;
  return (
    <div className="min-w-0">
      <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-stone-400">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </p>
      <p className="mt-1.5 text-sm font-semibold text-stone-900">{value}</p>
    </div>
  );
}

export function ContentDetail({ content }: ContentDetailProps) {
  const mediaConfig = MEDIA_FORM_CONFIG[content.mediaType];
  const isVideo = content.mediaType === "video";

  const scheduleLabel = content.scheduledDate
    ? `${formatThaiDate(content.scheduledDate)}${
        content.scheduledTime ? ` · ${content.scheduledTime}` : ""
      }`
    : null;

  const imageMeta = content.imageMeta;
  const hasImageBrief =
    !isVideo &&
    imageMeta &&
    (imageMeta.objective ||
      imageMeta.headline ||
      imageMeta.subHead ||
      imageMeta.callToAction ||
      imageMeta.requiredElements.length > 0 ||
      imageMeta.workSizes.length > 0);

  const objective = isVideo ? content.category : imageMeta?.objective;

  const otherAttachments = content.attachments.slice(1);

  return (
    <div className="space-y-4">
      <HeroMedia content={content} />

      <SectionCard>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {content.name}
            </h1>
            <div className="mt-2.5 flex flex-wrap items-center gap-2.5">
              <span className="font-mono text-sm text-stone-400">
                #{content.contentId}
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium",
                  mediaConfig.accentBg,
                  mediaConfig.accentText
                )}
                title={mediaConfig.label}
              >
                {isVideo ? (
                  <Video className="h-3.5 w-3.5" />
                ) : (
                  <ImageIcon className="h-3.5 w-3.5" />
                )}
              </span>
              {content.platforms.length > 0 && (
                <PlatformBadgeGroup platforms={content.platforms} size="sm" />
              )}
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <DetailStatusBadge status={content.status} />
            <p className="text-[10px] font-medium uppercase tracking-wide text-stone-400">
              อัปเดต: {formatRelativeTime(content.createdAt)}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 border-t border-stone-100 pt-5 sm:grid-cols-3">
          <MetaCell
            label="Post Date"
            value={scheduleLabel}
            icon={Calendar}
          />
          <MetaCell
            label="Approved By"
            value={
              content.approver ? (
                <ApproverDisplay name={content.approver} />
              ) : null
            }
            icon={User}
          />
          <MetaCell label="Category" value={objective} icon={Tag} />
        </div>
      </SectionCard>

      {content.status === "post_failed" && content.postError && (
        <SectionCard title="โพสต์ไม่สำเร็จ" className="border-red-200 bg-red-50/50">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-red-800">
            {content.postError}
          </p>
        </SectionCard>
      )}

      {content.details && (
        <SectionCard title="รายละเอียด" icon={FileText}>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-stone-700">
            {content.details}
          </p>
        </SectionCard>
      )}

      {hasImageBrief && imageMeta && (
        <SectionCard title="ข้อความบนภาพ & องค์ประกอบ" icon={Type}>
          <dl>
            {imageMeta.headline && (
              <MetaListRow label="Headline" value={imageMeta.headline} />
            )}
            {imageMeta.subHead && (
              <MetaListRow label="Sub Head" value={imageMeta.subHead} />
            )}
            {imageMeta.callToAction && (
              <MetaListRow
                label="Call to Action"
                value={imageMeta.callToAction}
              />
            )}
          </dl>
          {imageMeta.requiredElements.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs text-stone-500">องค์ประกอบที่ต้องมี</p>
              <div className="flex flex-wrap gap-2">
                {imageMeta.requiredElements.map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-700"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
          {imageMeta.workSizes.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs text-stone-500">ขนาดงาน</p>
              <div className="flex flex-wrap gap-2">
                {imageMeta.workSizes.map((size) => (
                  <span
                    key={size}
                    className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-700"
                  >
                    {size}
                  </span>
                ))}
              </div>
            </div>
          )}
        </SectionCard>
      )}

      {(content.ideaCreator || content.photographer || content.editor) && (
        <SectionCard title="ผู้สร้าง content" icon={User}>
          <dl>
            {content.ideaCreator && (
              <MetaListRow
                label="ผู้คิด Content"
                value={content.ideaCreator}
                icon={User}
              />
            )}
            {content.photographer && (
              <MetaListRow
                label={mediaConfig.photographerLabel}
                value={content.photographer}
              />
            )}
            {content.editor && (
              <MetaListRow label="ตัดต่อ" value={content.editor} />
            )}
          </dl>
        </SectionCard>
      )}

      {content.team.length > 0 && (
        <SectionCard title="ผู้ร่วมงาน" icon={Users}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-stone-100 text-xs text-stone-500">
                  <th className="pb-2 pr-6 font-medium">ผู้ร่วมงาน</th>
                  <th className="pb-2 font-medium">หน้าที่</th>
                </tr>
              </thead>
              <tbody>
                {content.team.map((row) => (
                  <tr key={row.id} className="border-b border-stone-50">
                    <td className="py-2.5 pr-6 font-medium text-stone-800">
                      {row.participant}
                    </td>
                    <td className="py-2.5 text-stone-600">
                      {row.responsibility}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}

      {isVideo && content.script.length > 0 && (
        <SectionCard title="สคริป" icon={Clapperboard}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-stone-100 text-xs text-stone-500">
                  <th className="pb-2 pr-4 font-medium">เวลา</th>
                  <th className="pb-2 pr-4 font-medium">คนพูด</th>
                  <th className="pb-2 pr-4 font-medium">Action</th>
                  <th className="pb-2 pr-4 font-medium">Dialogue</th>
                  <th className="pb-2 pr-4 font-medium">หมายเหตุ</th>
                  <th className="pb-2 font-medium">รูปภาพ</th>
                </tr>
              </thead>
              <tbody>
                {content.script.map((row) => (
                  <tr key={row.id} className="border-b border-stone-50">
                    <td className="py-2.5 pr-4 text-stone-700">
                      {formatScriptDuration(row) || "—"}
                    </td>
                    <td className="py-2.5 pr-4 text-stone-700">
                      {row.speaker || "—"}
                    </td>
                    <td className="py-2.5 pr-4 text-stone-700">{row.action}</td>
                    <td className="py-2.5 pr-4 text-stone-700">
                      {row.dialogue}
                    </td>
                    <td className="py-2.5 pr-4 text-stone-500">{row.notes}</td>
                    <td className="py-2.5">
                      {row.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={row.imageUrl}
                          alt=""
                          className="h-10 w-10 rounded object-cover"
                        />
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}

      {isVideo &&
        (content.productsNeeded.length > 0 ||
          content.itemsToPrepare ||
          (content.filmingEquipment?.length ?? 0) > 0) && (
          <SectionCard title="สิ่งที่ต้องเตรียม" icon={Package}>
            {content.productsNeeded.length > 0 && (
              <div className="mb-4">
                <p className="mb-2 text-xs text-stone-500">สินค้าที่ต้องเตรียม</p>
                <div className="flex flex-wrap gap-2">
                  {content.productsNeeded.map((product) => (
                    <span
                      key={product}
                      className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-700"
                    >
                      {product}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {content.itemsToPrepare && (
              <div className="mb-4">
                <p className="mb-2 text-xs text-stone-500">
                  อุปกรณ์ประกอบฉากที่ต้องเตรียม
                </p>
                <p className="whitespace-pre-wrap text-sm text-stone-700">
                  {content.itemsToPrepare}
                </p>
              </div>
            )}
            {(content.filmingEquipment?.length ?? 0) > 0 && (
              <div>
                <p className="mb-2 text-xs text-stone-500">
                  อุปกรณ์ถ่ายที่ต้องเตรียม
                </p>
                <div className="flex flex-wrap gap-2">
                  {(content.filmingEquipment ?? []).map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-700"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </SectionCard>
        )}

      {otherAttachments.length > 0 && (
        <SectionCard title="ไฟล์เพิ่มเติม" icon={Paperclip}>
          <div className="space-y-3">
            {otherAttachments.map((link, i) =>
              isImageAttachment(link) ? (
                <a
                  key={`${link}-${i}`}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block overflow-hidden rounded-xl border border-stone-200"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={link}
                    alt=""
                    className="max-h-64 w-full object-contain bg-stone-50"
                  />
                </a>
              ) : isVideoMediaUrl(link) ? (
                <video
                  key={`${link}-${i}`}
                  src={link}
                  controls
                  className="w-full rounded-xl bg-black"
                  preload="metadata"
                />
              ) : (
                <a
                  key={`${link}-${i}`}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block break-all text-sm text-blue-600 hover:underline"
                >
                  {link}
                </a>
              )
            )}
          </div>
        </SectionCard>
      )}

      {content.tags.length > 0 && (
        <SectionCard title="แท็ก" icon={Tag}>
          <div className="flex flex-wrap gap-2">
            {content.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-700"
              >
                #{tag}
              </span>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}
