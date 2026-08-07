"use client";

import { Calendar, Eye, ImageIcon, Info, Users } from "lucide-react";
import { ImageAttachmentLinks } from "@/app/create/_components/ImageAttachmentLinks";
import { ContentFormSection } from "@/app/create/_components/ContentFormSection";
import { PlatformSelect } from "@/app/create/_components/PlatformSelect";
import { TeamTable } from "@/app/create/_components/TeamTable";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { PostingChannelSelect } from "@/app/create/_components/PostingChannelSelect";
import type { PostingChannelOption } from "@/app/create/_components/PostingChannelSelect";
import { Select } from "@/components/ui/Select";
import { CreatableMultiSelect } from "@/components/ui/CreatableMultiSelect";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  TEAM_MEMBERS,
  PRODUCTS,
  CONTENT_OBJECTIVES,
  IMAGE_REQUIRED_ELEMENTS,
  IMAGE_WORK_SIZES,
} from "@/lib/constants";
import { MEDIA_FORM_CONFIG } from "@/lib/content/domain/form-config";
import { isImageAttachment } from "@/lib/content/domain/attachments";
import { generateId } from "@/lib/shared/utils";
import type { ContentFormData, ImageMeta, Platform } from "@/lib/types";

type ChannelOption = PostingChannelOption;

export function ImageContentFormFields({
  form,
  contentId,
  isEdit,
  channelOptions,
  channelTargetSlugs,
  availablePlatforms,
  hidePlatformSelect = false,
  update,
  updateImageMeta,
  onChannelsChange,
}: {
  form: ContentFormData;
  contentId: string;
  isEdit: boolean;
  channelOptions: ChannelOption[];
  channelTargetSlugs: string[];
  availablePlatforms: Platform[];
  hidePlatformSelect?: boolean;
  update: <K extends keyof ContentFormData>(
    key: K,
    value: ContentFormData[K]
  ) => void;
  updateImageMeta: <K extends keyof ImageMeta>(
    key: K,
    value: ImageMeta[K]
  ) => void;
  onChannelsChange: (slugs: string[]) => void;
}) {
  const config = MEDIA_FORM_CONFIG.image;
  const previewImage =
    form.attachments.find((url) => url.trim() && isImageAttachment(url)) ?? "";

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
      <div className="min-w-0 space-y-4">
        <Card padding="none">
          <div className="flex items-center gap-2.5 border-b border-stone-200 px-6 py-4">
            <Info className="h-5 w-5 shrink-0 text-stone-900" strokeWidth={2.25} />
            <h3 className="text-xl font-bold tracking-tight text-stone-900">
              ข้อมูล Content
            </h3>
          </div>
          <div className="p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="ชื่อ Content *"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="เช่น Herbal Lifestyle Post"
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
              value={form.imageMeta.objective}
              onChange={(e) => updateImageMeta("objective", e.target.value)}
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
              placeholder="อธิบาย concept, mood, หรือ brief ของงานภาพ..."
              rows={3}
            />
          </div>
          </div>
        </Card>

        <ContentFormSection
          title="ตัวอย่างรูปภาพ"
          description="อัปโหลดรูป reference หรือแนบลิงก์ภาพตัวอย่าง"
          icon={ImageIcon}
          className="border-pink-100"
        >
          <ImageAttachmentLinks
            links={form.attachments}
            onChange={(links) => update("attachments", links)}
            hideToolbar
          />
        </ContentFormSection>

        <Card padding="none" className="border-pink-100">
          <div className="flex items-center gap-2.5 border-b border-stone-200 px-6 py-4">
            <ImageIcon
              className="h-5 w-5 shrink-0 text-stone-900"
              strokeWidth={2.25}
            />
            <h3 className="text-xl font-bold tracking-tight text-stone-900">
              องค์ประกอบ &amp; ขนาดงาน
            </h3>
          </div>
          <div className="space-y-5 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Headline"
                value={form.imageMeta.headline}
                onChange={(e) => updateImageMeta("headline", e.target.value)}
                placeholder="หัวข้อหลักบนภาพ"
              />
              <Input
                label="Sub Head"
                value={form.imageMeta.subHead}
                onChange={(e) => updateImageMeta("subHead", e.target.value)}
                placeholder="หัวข้อรอง"
              />
              <div className="sm:col-span-2">
                <Input
                  label="Call to Action"
                  value={form.imageMeta.callToAction}
                  onChange={(e) =>
                    updateImageMeta("callToAction", e.target.value)
                  }
                  placeholder="เช่น สั่งซื้อเลย, ดูรายละเอียด"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <CreatableMultiSelect
                label="สินค้า"
                options={PRODUCTS}
                value={form.productsNeeded}
                onChange={(items) => update("productsNeeded", items)}
                placeholder="เลือกสินค้า..."
                addPlaceholder="อื่นๆ..."
              />
              <CreatableMultiSelect
                label="ขนาดงาน"
                options={IMAGE_WORK_SIZES}
                value={form.imageMeta.workSizes}
                onChange={(items) => updateImageMeta("workSizes", items)}
                placeholder="เลือกขนาดงาน..."
                addPlaceholder="พิมพ์ขนาดเพิ่มเอง..."
              />
            </div>

            <CreatableMultiSelect
              label="องค์ประกอบ"
              options={IMAGE_REQUIRED_ELEMENTS}
              value={form.imageMeta.requiredElements}
              onChange={(items) => updateImageMeta("requiredElements", items)}
              placeholder="เลือกองค์ประกอบ..."
              addPlaceholder="พิมพ์องค์ประกอบเพิ่มเอง..."
            />
          </div>
        </Card>

        <Card padding="none">
          <div className="flex items-center justify-between gap-3 border-b border-stone-200 px-6 py-4">
            <div className="flex items-center gap-2.5">
              <Users
                className="h-5 w-5 shrink-0 text-stone-900"
                strokeWidth={2.25}
              />
              <h3 className="text-xl font-bold tracking-tight text-stone-900">
                ผู้สร้าง Content &amp; หน้าที่รับผิดชอบ
              </h3>
            </div>
            <button
              type="button"
              onClick={() =>
                update("team", [
                  ...form.team,
                  {
                    id: generateId(),
                    participant: "",
                    responsibility: "",
                  },
                ])
              }
              className="shrink-0 text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              + เพิ่มแถว
            </button>
          </div>
          <div className="p-6">
          <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
          <TeamTable
            rows={form.team}
            onChange={(rows) => update("team", rows)}
            hideAddButton
          />
          </div>
        </Card>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
        <Card padding="none" className="border-pink-100">
          <div className="flex items-center gap-2.5 border-b border-stone-200 px-6 py-4">
            <Calendar
              className="h-5 w-5 shrink-0 text-stone-900"
              strokeWidth={2.25}
            />
            <h3 className="text-xl font-bold tracking-tight text-stone-900">
              วันโพสต์ Content
            </h3>
          </div>
          <div className="space-y-3 p-6">
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
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-stone-500" />
              Preview
            </CardTitle>
          </CardHeader>
          <div className="overflow-hidden rounded-xl border border-stone-200 bg-stone-100">
            <div className="relative aspect-square w-full bg-stone-200">
              {previewImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewImage}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-stone-400">
                  ยังไม่มีรูปตัวอย่าง
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent p-4 pt-10 text-white">
                <p className="text-sm font-bold leading-snug">
                  {form.imageMeta.headline.trim() || "Your Headline Here"}
                </p>
                <p className="mt-1 text-xs text-white/85">
                  {form.imageMeta.subHead.trim() || "Sub-headline text"}
                </p>
                <span className="mt-2 inline-block rounded-md bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-stone-900">
                  {form.imageMeta.callToAction.trim() || "CTA BUTTON"}
                </span>
              </div>
            </div>
          </div>
          <p className="mt-2 text-[11px] text-stone-400">
            ตัวอย่างการแสดงผลเบื้องต้นของหัวข้อและภาพ
          </p>
        </Card>
      </aside>
    </div>
  );
}
