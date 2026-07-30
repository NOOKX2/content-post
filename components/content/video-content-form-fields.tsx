"use client";

import {
  Calendar,
  CalendarRange,
  Clapperboard,
  Eye,
  ExternalLink,
  Info,
  MapPin,
  Package,
  UserRound,
  Users,
  Video,
} from "lucide-react";
import { AttachmentLinks } from "@/components/content/attachment-links";
import { ImageAttachmentLinks } from "@/components/content/image-attachment-links";
import {
  ContentFormSection,
  ContentFormSectionAction,
} from "@/components/content/content-form-section";
import { LocationSelect } from "@/components/content/location-select";
import { PlatformSelect } from "@/components/content/platform-select";
import { ScriptTable } from "@/components/content/script-table";
import { TeamTable } from "@/components/content/team-table";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { CreatableMultiSelect } from "@/components/ui/creatable-multi-select";
import { Input } from "@/components/ui/input";
import { PostingChannelSelect } from "@/components/content/posting-channel-select";
import type { PostingChannelOption } from "@/components/content/posting-channel-select";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  CONTENT_OBJECTIVES,
  FILMING_EQUIPMENT,
  PRODUCTS,
  TEAM_MEMBERS,
} from "@/lib/constants";
import { MEDIA_FORM_CONFIG } from "@/lib/content/form-config";
import { showFinalClipSection } from "@/lib/content/content-workflow";
import { isImageMediaUrl, isVideoAttachmentUrl, isVideoMediaUrl } from "@/lib/content/media-url";
import type { ContentFormData, ContentStatus, Platform } from "@/lib/types";
import { generateId } from "@/lib/utils";

type ChannelOption = PostingChannelOption;

export function VideoContentFormFields({
  form,
  contentId,
  isEdit,
  contentStatus,
  workflowPhase,
  channelOptions,
  channelTargetSlugs,
  availablePlatforms,
  hidePlatformSelect = false,
  config,
  update,
  onChannelsChange,
}: {
  form: ContentFormData;
  contentId: string;
  isEdit: boolean;
  contentStatus?: ContentStatus;
  workflowPhase?: "plan" | "produce";
  channelOptions: ChannelOption[];
  channelTargetSlugs: string[];
  availablePlatforms: Platform[];
  hidePlatformSelect?: boolean;
  config: (typeof MEDIA_FORM_CONFIG)["video"];
  update: <K extends keyof ContentFormData>(
    key: K,
    value: ContentFormData[K]
  ) => void;
  onChannelsChange: (slugs: string[]) => void;
}) {
  const addTeamRow = () => {
    update("team", [
      ...form.team,
      { id: generateId(), participant: "", responsibility: "" },
    ]);
  };

  const addScriptRow = () => {
    update("script", [
      ...form.script,
      {
        id: generateId(),
        startTime: "",
        endTime: "",
        action: "",
        dialogue: "",
        notes: "",
        imageUrl: "",
      },
    ]);
  };

  const previewAttachment =
    form.attachments.find((url) => url.trim() && isVideoAttachmentUrl(url)) ??
    form.exampleAttachments.find((url) => url.trim() && isImageMediaUrl(url)) ??
    form.script.find((row) => row.imageUrl?.trim())?.imageUrl ??
    "";
  const previewIsDirectVideo =
    previewAttachment && isVideoMediaUrl(previewAttachment);
  const previewIsImage =
    previewAttachment && isImageMediaUrl(previewAttachment);
  const isProducePhase = workflowPhase === "produce";
  const showClipUpload = isProducePhase
    ? true
    : workflowPhase === "plan"
      ? false
      : showFinalClipSection(isEdit, contentStatus);

  const briefSummary = (
    <ContentFormSection title="ข้อมูล Content" icon={Info}>
      <div className="space-y-3 rounded-xl border border-stone-200 bg-stone-50/80 p-4 text-sm">
        <div>
          <p className="text-xs text-stone-500">หัวข้อ Content</p>
          <p className="font-semibold text-stone-900">{form.name || "—"}</p>
        </div>
        {form.details && (
          <div>
            <p className="text-xs text-stone-500">รายละเอียด</p>
            <p className="text-stone-700 whitespace-pre-wrap">{form.details}</p>
          </div>
        )}
        {form.category && (
          <div>
            <p className="text-xs text-stone-500">หมวดหมู่</p>
            <p className="text-stone-700">{form.category}</p>
          </div>
        )}
      </div>
    </ContentFormSection>
  );

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
      <div className="min-w-0 space-y-5">
      {isProducePhase ? (
        <>
          {briefSummary}
          <ContentFormSection
            title="อัปโหลดวิดีโอที่ตัดต่อแล้ว"
            description="อัปโหลดคลิปวิดีโอ (.mp4 / .mov / .webm) สูงสุด 200 MB"
            icon={Video}
            className="border-amber-100"
          >
            <AttachmentLinks
              links={form.attachments}
              onChange={(links) => update("attachments", links)}
              hideHeader
              hideToolbar
            />
          </ContentFormSection>
        </>
      ) : (
        <>
      <ContentFormSection title="ข้อมูล Content" icon={Info}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="ชื่อ Content *"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="เช่น Hero Serum Launch Video"
            required
          />
          <Input
            label="รหัส Content"
            value={contentId}
            readOnly
            placeholder={isEdit ? "" : "เลือกช่องเพื่อรันรหัสอัตโนมัติ"}
            className="bg-stone-50 font-mono"
          />
          <div>
            <PostingChannelSelect
              label="ช่องที่ลง *"
              options={channelOptions}
              placeholder="เลือกช่อง..."
              value={channelTargetSlugs}
              onChange={onChannelsChange}
              required={!isEdit}
              multiple={hidePlatformSelect}
              hint={
                hidePlatformSelect
                  ? "เลือกได้หลายช่อง — รายการดึงจาก Buffer"
                  : undefined
              }
            />
          </div>
          <Select
            label="วัตถุประสงค์"
            options={CONTENT_OBJECTIVES}
            placeholder="เลือกวัตถุประสงค์..."
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
          />
        </div>
        {!hidePlatformSelect && (
        <div className="mt-4">
          <PlatformSelect
            selected={form.platforms}
            availablePlatforms={availablePlatforms}
            disabled={channelTargetSlugs.length === 0}
            onChange={(platforms: Platform[]) => update("platforms", platforms)}
          />
        </div>
        )}
        <div className="mt-4">
          <Textarea
            label="รายละเอียด"
            value={form.details}
            onChange={(e) => update("details", e.target.value)}
            placeholder="อธิบาย concept, mood, หรือ brief..."
            rows={3}
          />
        </div>
      </ContentFormSection>

      <ContentFormSection
        title="รูปภาพตัวอย่าง"
        description="แนบรูป reference / mood board สำหรับอนุมัติแนวคิดรอบแรก"
        icon={Eye}
        className="border-amber-100"
      >
        <ImageAttachmentLinks
          links={form.exampleAttachments}
          onChange={(links) => update("exampleAttachments", links)}
          hideToolbar
        />
      </ContentFormSection>

      {showClipUpload && (
        <ContentFormSection
          title="คลิปวิดีโอ (หลังตัดต่อ)"
          description="อัปโหลดคลิปที่ตัดต่อเสร็จแล้วเพื่อส่งอนุมัติรอบสอง"
          icon={Video}
          className="border-amber-100"
        >
          <AttachmentLinks
            links={form.attachments}
            onChange={(links) => update("attachments", links)}
            hideHeader
            hideToolbar
          />
        </ContentFormSection>
      )}

      <ContentFormSection
        title="Pre Post"
        icon={CalendarRange}
        className="border-amber-100"
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label="คอนเทนต์คิดเสร็จ"
            type="date"
            value={form.ideaFinishedDate}
            onChange={(e) => update("ideaFinishedDate", e.target.value)}
          />
          <Input
            label="นัดวันถ่าย"
            type="date"
            value={form.shootDate}
            onChange={(e) => update("shootDate", e.target.value)}
          />
          <Input
            label="ตัดเสร็จ"
            type="date"
            value={form.editFinishedDate}
            onChange={(e) => update("editFinishedDate", e.target.value)}
          />
        </div>
      </ContentFormSection>

      <ContentFormSection title="สถานที่ถ่าย" icon={MapPin}>
        <LocationSelect
          selected={form.location}
          onChange={(locations) => update("location", locations)}
          optional={config.locationOptional}
        />
      </ContentFormSection>

      <ContentFormSection
        title="ผู้เข้าร่วม & หน้าที่รับผิดชอบ"
        icon={Users}
        actions={
          <ContentFormSectionAction onClick={addTeamRow}>
            + เพิ่มแถว
          </ContentFormSectionAction>
        }
      >
        <TeamTable
          rows={form.team}
          onChange={(rows) => update("team", rows)}
          hideAddButton
        />
      </ContentFormSection>

      <ContentFormSection title="สิ่งที่ต้องเตรียม" icon={Package}>
        <div className="space-y-4">
          <CreatableMultiSelect
            label="สินค้า"
            options={PRODUCTS}
            value={form.productsNeeded}
            onChange={(items) => update("productsNeeded", items)}
            placeholder="เลือกสินค้า..."
            addPlaceholder="อื่นๆ..."
          />
          <Input
            label="อุปกรณ์ประกอบฉาก"
            value={form.itemsToPrepare}
            onChange={(e) => update("itemsToPrepare", e.target.value)}
            placeholder="Backdrop, Props, Equipment..."
          />
          <CreatableMultiSelect
            label="อุปกรณ์ถ่าย"
            options={FILMING_EQUIPMENT}
            value={form.filmingEquipment}
            onChange={(items) => update("filmingEquipment", items)}
            placeholder="เลือกอุปกรณ์..."
            addPlaceholder="อื่นๆ..."
          />
        </div>
      </ContentFormSection>

      <ContentFormSection
        title="สคริป"
        description="เวลาเริ่มต้น, เวลาสิ้นสุด, Action, บทพูด, หมายเหตุ, เพิ่มรูปภาพ"
        icon={Clapperboard}
        className="border-amber-100"
        actions={
          <ContentFormSectionAction onClick={addScriptRow}>
            + เพิ่ม Scene
          </ContentFormSectionAction>
        }
      >
        <ScriptTable
          rows={form.script}
          onChange={(rows) => update("script", rows)}
          hideAddButton
        />
      </ContentFormSection>

      <ContentFormSection title="ผู้สร้าง content" icon={UserRound}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Select
            label="ผู้คิดไอเดีย"
            options={TEAM_MEMBERS}
            placeholder="เลือก..."
            value={form.ideaCreator}
            onChange={(e) => update("ideaCreator", e.target.value)}
          />
          <Select
            label={config.photographerLabel}
            options={TEAM_MEMBERS}
            placeholder="เลือก..."
            value={form.photographer}
            onChange={(e) => update("photographer", e.target.value)}
          />
          {config.showEditor && (
            <Select
              label="ผู้ตัดต่อ"
              options={TEAM_MEMBERS}
              placeholder="เลือก..."
              value={form.editor}
              onChange={(e) => update("editor", e.target.value)}
            />
          )}
          <Input
            label="ผู้อนุมัติ"
            value=""
            readOnly
            placeholder="— กำหนดเมื่อ Admin อนุมัติ —"
            className="bg-stone-50"
          />
        </div>
      </ContentFormSection>
        </>
      )}
      </div>

      <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
        <ContentFormSection
          title="วันโพสต์ Content"
          icon={Calendar}
          className="border-amber-100"
          bodyClassName="space-y-3"
        >
          <Input
            label="วันโพสต์ *"
            type="date"
            value={form.scheduledDate}
            onChange={(e) => update("scheduledDate", e.target.value)}
            required
          />
          <Input
            label="เวลาโพสต์ *"
            type="time"
            value={form.scheduledTime}
            onChange={(e) => update("scheduledTime", e.target.value)}
            required
          />
          <div className="flex gap-2 rounded-xl bg-blue-50 px-3 py-2.5 text-xs text-blue-800">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <p>
              วันและเวลานี้จะใช้สำหรับลงโพสต์อัตโนมัติ และแสดงในปฏิทิน
              Content
            </p>
          </div>
        </ContentFormSection>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-stone-500" />
              Preview
            </CardTitle>
          </CardHeader>
          <div className="overflow-hidden rounded-xl border border-stone-200 bg-stone-100">
            <div className="relative aspect-video w-full bg-stone-900">
              {previewIsDirectVideo ? (
                <video
                  src={previewAttachment}
                  controls
                  className="h-full w-full object-contain"
                  preload="metadata"
                />
              ) : previewIsImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewAttachment}
                  alt="ตัวอย่าง"
                  className="h-full w-full object-contain"
                />
              ) : previewAttachment ? (
                <a
                  href={previewAttachment}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-sm text-amber-100 hover:text-white"
                >
                  <ExternalLink className="h-8 w-8 text-amber-400" />
                  <span className="line-clamp-2 break-all">{previewAttachment}</span>
                  <span className="text-xs text-amber-200/80">เปิดลิงก์วิดีโอ</span>
                </a>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-xs text-stone-400">
                  <Video className="h-8 w-8 text-stone-500" />
                  <span>
                    {showClipUpload
                      ? "ยังไม่มีคลิปวิดีโอ"
                      : "ยังไม่มีรูปตัวอย่าง"}
                  </span>
                </div>
              )}
            </div>
            <div className="border-t border-stone-200 bg-white p-3">
              <p className="text-sm font-bold leading-snug text-stone-900">
                {form.name.trim() || "ชื่อ Content"}
              </p>
              <p className="mt-1 line-clamp-2 text-xs text-stone-500">
                {form.details.trim() || "รายละเอียด brief จะแสดงที่นี่"}
              </p>
            </div>
          </div>
          <p className="mt-2 text-[11px] text-stone-400">
            ตัวอย่างวิดีโอและชื่อ Content ก่อนส่งอนุมัติ
          </p>
        </Card>
      </aside>
    </div>
  );
}
