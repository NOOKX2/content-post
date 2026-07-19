"use client";

import {
  ArrowLeft,
  Calendar,
  ImageIcon,
  MapPin,
  Tag,
  User,
  Video,
} from "lucide-react";
import type { ContentItem } from "@/lib/types";
import { PlatformBadgeGroup } from "@/components/ui/platform-icon";
import { MEDIA_FORM_CONFIG } from "@/lib/content/form-config";
import { isImageAttachment } from "@/lib/content/attachments";
import { isVideoMediaUrl } from "@/lib/content/media-url";
import { formatScriptDuration } from "@/lib/content/script";
import { ContentStatusBadge } from "@/components/content/content-status-badge";
import { useDashboardNav } from "@/lib/navigation/dashboard-nav";
import { cn, formatLocations, formatThaiDate } from "@/lib/utils";

interface ContentDetailProps {
  content: ContentItem;
}

function SectionCard({
  title,
  children,
  className,
}: {
  title?: string;
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
        <h3 className="mb-3 text-base font-semibold text-stone-900">{title}</h3>
      )}
      {children}
    </section>
  );
}

function InfoChip({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-xl border border-stone-200 bg-stone-50/80 px-3 py-3">
      <p className="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-stone-500">
        {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
        {label}
      </p>
      <p className="text-sm font-semibold text-stone-900">{value}</p>
    </div>
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

function HeroMedia({
  content,
  onBack,
}: {
  content: ContentItem;
  onBack: () => void;
}) {
  const mediaConfig = MEDIA_FORM_CONFIG[content.mediaType];
  const isVideo = content.mediaType === "video";
  const heroUrl = content.attachments.find((url) => url.trim()) ?? "";
  const heroIsVideo = heroUrl ? isVideoMediaUrl(heroUrl) : false;
  const heroIsImage = heroUrl ? isImageAttachment(heroUrl) : false;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-stone-200">
      <div className="aspect-16/10 w-full sm:aspect-2/1">
        {heroIsVideo ? (
          <video
            src={heroUrl}
            controls
            className="h-full w-full object-cover bg-black"
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

      <button
        type="button"
        onClick={onBack}
        className="absolute left-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-stone-800 shadow-md backdrop-blur transition hover:bg-white"
        aria-label="กลับ"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>
    </div>
  );
}

export function ContentDetail({ content }: ContentDetailProps) {
  const { navigate } = useDashboardNav();
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
  const locationLabel =
    content.location.length > 0 ? formatLocations(content.location) : null;

  const infoItems: Array<{
    label: string;
    value: React.ReactNode;
    icon: React.ComponentType<{ className?: string }>;
  }> = [];

  if (scheduleLabel) {
    infoItems.push({
      label: "วันเวลาโพสต์",
      value: scheduleLabel,
      icon: Calendar,
    });
  }
  if (content.ideaFinishedDate) {
    infoItems.push({
      label: "คิดเสร็จ",
      value: formatThaiDate(content.ideaFinishedDate),
      icon: Calendar,
    });
  }
  if (content.shootDate) {
    infoItems.push({
      label: "นัดถ่าย",
      value: formatThaiDate(content.shootDate),
      icon: Calendar,
    });
  }
  if (content.editFinishedDate) {
    infoItems.push({
      label: "ตัดเสร็จ",
      value: formatThaiDate(content.editFinishedDate),
      icon: Calendar,
    });
  }
  if (locationLabel) {
    infoItems.push({
      label: "สถานที่",
      value: locationLabel,
      icon: MapPin,
    });
  }
  if (objective) {
    infoItems.push({
      label: "วัตถุประสงค์",
      value: objective,
      icon: Tag,
    });
  }
  if (content.approver) {
    infoItems.push({
      label: "อนุมัติโดย",
      value: content.approver,
      icon: User,
    });
  }

  const otherAttachments = content.attachments.slice(1);

  return (
    <div className="space-y-5">
      <HeroMedia content={content} onBack={() => navigate("/calendar")} />

      <SectionCard>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold tracking-tight text-stone-900 md:text-3xl">
              {content.name}
            </h1>
            {content.channel && (
              <p className="mt-1.5 flex items-center gap-1.5 text-sm text-stone-500">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {content.channel}
              </p>
            )}
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[11px] font-medium text-stone-400">สถานะ</p>
            <div className="mt-1 flex flex-col items-end gap-1.5">
              <ContentStatusBadge
                status={content.status}
                className="rounded-full"
              />
              <span className="font-mono text-xs text-stone-500">
                #{content.contentId}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
              mediaConfig.accentBg,
              mediaConfig.accentText
            )}
          >
            {isVideo ? (
              <Video className="h-3.5 w-3.5" />
            ) : (
              <ImageIcon className="h-3.5 w-3.5" />
            )}
            {mediaConfig.label}
          </span>
          {locationLabel && (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              <MapPin className="h-3 w-3" />
              {locationLabel}
            </span>
          )}
          {content.platforms.length > 0 && (
            <PlatformBadgeGroup platforms={content.platforms} size="sm" />
          )}
        </div>
      </SectionCard>

      {infoItems.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold text-stone-800">
            ข้อมูลสำคัญ
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {infoItems.map((item) => (
              <InfoChip
                key={item.label}
                label={item.label}
                value={item.value}
                icon={item.icon}
              />
            ))}
          </div>
        </div>
      )}

      {content.details && (
        <SectionCard title="รายละเอียด">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-stone-700">
            {content.details}
          </p>
        </SectionCard>
      )}

      {hasImageBrief && imageMeta && (
        <SectionCard title="ข้อความบนภาพ & องค์ประกอบ">
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
        <SectionCard title="ผู้สร้าง content">
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
        <SectionCard title="ผู้ร่วมงาน">
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
        <SectionCard title="สคริป">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-stone-100 text-xs text-stone-500">
                  <th className="pb-2 pr-4 font-medium">เวลา</th>
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
          <SectionCard title="สิ่งที่ต้องเตรียม">
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
        <SectionCard title="ไฟล์เพิ่มเติม">
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
        <SectionCard title="แท็ก">
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
