"use client";

import {
  Calendar,
  ImageIcon,
  MapPin,
  Tag,
  User,
  Video,
} from "lucide-react";
import type { ContentItem } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { PlatformBadgeGroup } from "@/components/ui/platform-icon";
import { MEDIA_FORM_CONFIG } from "@/lib/content/form-config";
import { STATUS_LABELS } from "@/lib/constants";
import { cn, formatLocations, formatThaiDate } from "@/lib/utils";

interface ContentDetailProps {
  content: ContentItem;
}

function UtilityCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="apple-utility-card !p-5">
      <h3 className="apple-caption-strong mb-3 text-[#1d1d1f]">{title}</h3>
      {children}
    </section>
  );
}

function SpecCell({
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
    <div className="apple-spec-cell !px-4 !py-3">
      <p className="apple-fine-print mb-1.5 flex items-center gap-1 uppercase tracking-wide">
        {Icon && <Icon className="h-3 w-3 shrink-0 text-[#7a7a7a]" />}
        {label}
      </p>
      <p className="apple-body text-[#1d1d1f]">{value}</p>
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
    <div className="flex flex-col gap-1 border-b border-[#f0f0f0] py-3 last:border-b-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
      <dt className="apple-caption flex shrink-0 items-center gap-1.5">
        {Icon && <Icon className="h-3.5 w-3.5 text-[#7a7a7a]" />}
        {label}
      </dt>
      <dd className="apple-body text-[#1d1d1f] sm:text-right">{value}</dd>
    </div>
  );
}

export function ContentDetail({ content }: ContentDetailProps) {
  const status = STATUS_LABELS[content.status];
  const mediaConfig = MEDIA_FORM_CONFIG[content.mediaType];
  const isVideo = content.mediaType === "video";

  const scheduleLabel = content.scheduledDate
    ? `${formatThaiDate(content.scheduledDate)}${
        content.scheduledTime
          ? ` · ${content.scheduledTime}${content.endTime ? ` – ${content.endTime}` : ""}`
          : ""
      }`
    : null;

  const hasSpecs =
    scheduleLabel ||
    content.location.length > 0 ||
    content.category ||
    content.approver;

  return (
    <div className="apple-detail">
      {/* Summary header — compact layout + old-page visual cues */}
      <section className="border-b border-[#e0e0e0] bg-white px-6 py-5 md:px-8">
        <div className="mx-auto flex max-w-[980px] items-start gap-4">
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-[11px]",
              mediaConfig.accentBg
            )}
          >
            {isVideo ? (
              <Video className={cn("h-5 w-5", mediaConfig.accentText)} />
            ) : (
              <ImageIcon className={cn("h-5 w-5", mediaConfig.accentText)} />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="font-mono text-[12px] text-[#7a7a7a]">
                #{content.contentId}
              </span>
              <Badge className={cn("rounded-full", status.color)}>
                {status.label}
              </Badge>
              <span className="apple-pearl-chip !px-3 !py-1 !text-[13px]">
                {mediaConfig.label}
              </span>
            </div>
            <h1 className="text-[28px] font-semibold leading-tight tracking-[-0.01em] text-[#1d1d1f] md:text-[32px]">
              {content.name}
            </h1>
            {content.channel && (
              <p className="apple-caption mt-1">{content.channel}</p>
            )}
          </div>

          {content.platforms.length > 0 && (
            <div className="hidden shrink-0 sm:block">
              <PlatformBadgeGroup platforms={content.platforms} size="sm" />
            </div>
          )}
        </div>

        {content.platforms.length > 0 && (
          <div className="mx-auto mt-3 flex max-w-[980px] sm:hidden">
            <PlatformBadgeGroup platforms={content.platforms} size="sm" />
          </div>
        )}
      </section>

      {/* Spec grid — scannable with icons */}
      {hasSpecs && (
        <section className="bg-[#f5f5f7] px-6 py-5 md:px-8">
          <div className="mx-auto max-w-[980px]">
            <div className="apple-spec-grid grid grid-cols-2 lg:grid-cols-4">
              {scheduleLabel && (
                <SpecCell
                  label="วันเวลา"
                  value={scheduleLabel}
                  icon={Calendar}
                />
              )}
              {content.location.length > 0 && (
                <SpecCell
                  label="สถานที่"
                  value={formatLocations(content.location)}
                  icon={MapPin}
                />
              )}
              {content.category && (
                <SpecCell
                  label="หมวดหมู่"
                  value={content.category}
                  icon={Tag}
                />
              )}
              {content.approver && (
                <SpecCell
                  label="อนุมัติโดย"
                  value={content.approver}
                  icon={User}
                />
              )}
            </div>
          </div>
        </section>
      )}

      {/* Detail sections */}
      <section className="bg-[#f5f5f7] px-6 pt-5 pb-8 md:px-8 md:pb-10">
        <div className="mx-auto flex max-w-[980px] flex-col gap-4">
          {content.details && (
            <UtilityCard title="รายละเอียด">
              <p className="apple-body whitespace-pre-wrap text-[#333333]">
                {content.details}
              </p>
            </UtilityCard>
          )}

          {(content.ideaCreator || content.photographer || content.editor) && (
            <UtilityCard title="ทีมงาน">
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
            </UtilityCard>
          )}

          {content.team.length > 0 && (
            <UtilityCard title="ผู้ร่วมงาน">
              <div className="overflow-x-auto">
                <table className="apple-data-table">
                  <thead>
                    <tr>
                      <th className="pr-6">ผู้ร่วมงาน</th>
                      <th>หน้าที่</th>
                    </tr>
                  </thead>
                  <tbody>
                    {content.team.map((row) => (
                      <tr key={row.id}>
                        <td className="pr-6 font-normal">{row.participant}</td>
                        <td className="text-[#333333]">{row.responsibility}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </UtilityCard>
          )}

          {isVideo && content.script.length > 0 && (
            <UtilityCard title="สคริป">
              <div className="overflow-x-auto">
                <table className="apple-data-table">
                  <thead>
                    <tr>
                      <th className="pr-4">เวลา</th>
                      <th className="pr-4">Action</th>
                      <th className="pr-4">Dialogue</th>
                      <th>หมายเหตุ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {content.script.map((row) => (
                      <tr key={row.id}>
                        <td className="pr-4">{row.duration}</td>
                        <td className="pr-4 text-[#333333]">{row.action}</td>
                        <td className="pr-4 text-[#333333]">{row.dialogue}</td>
                        <td className="text-[#7a7a7a]">{row.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </UtilityCard>
          )}

          {(content.productsNeeded.length > 0 || content.itemsToPrepare) && (
            <UtilityCard title="ของที่ต้องเตรียม">
              {content.productsNeeded.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {content.productsNeeded.map((product) => (
                    <span key={product} className="apple-pearl-chip">
                      {product}
                    </span>
                  ))}
                </div>
              )}
              {content.itemsToPrepare && (
                <p className="apple-body whitespace-pre-wrap text-[#333333]">
                  {content.itemsToPrepare}
                </p>
              )}
            </UtilityCard>
          )}

          {content.attachments.length > 0 && (
            <UtilityCard title="ไฟล์แนบ / ลิงก์">
              <ul className="space-y-3">
                {content.attachments.map((link, i) => (
                  <li key={i}>
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="apple-link break-all"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </UtilityCard>
          )}

          {content.tags.length > 0 && (
            <UtilityCard title="แท็ก">
              <div className="flex flex-wrap gap-2">
                {content.tags.map((tag) => (
                  <span key={tag} className="apple-pearl-chip">
                    {tag}
                  </span>
                ))}
              </div>
            </UtilityCard>
          )}
        </div>
      </section>
    </div>
  );
}
