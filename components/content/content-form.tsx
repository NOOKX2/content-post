"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { MediaTypeToggle } from "./media-type-toggle";
import { TeamTable } from "./team-table";
import { ScriptTable } from "./script-table";
import { PlatformSelect } from "./platform-select";
import { LocationSelect } from "./location-select";
import { AttachmentLinks } from "./attachment-links";
import { ImageAttachmentLinks } from "./image-attachment-links";
import { SubmitSuccess } from "./submit-success";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { CreatableMultiSelect } from "@/components/ui/creatable-multi-select";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  CHANNELS,
  TEAM_MEMBERS,
  PRODUCTS,
  IMAGE_OBJECTIVES,
  IMAGE_REQUIRED_ELEMENTS,
  IMAGE_WORK_SIZES,
} from "@/lib/constants";
import { MEDIA_FORM_CONFIG } from "@/lib/content/form-config";
import type {
  ContentFormData,
  ContentItem,
  ImageMeta,
  MediaType,
  Platform,
} from "@/lib/types";
import { EMPTY_IMAGE_META } from "@/lib/types";
import { generateContentId } from "@/lib/utils";
import { createContent, updateContent } from "@/lib/content/actions";
import { contentItemToFormData } from "@/lib/content/mappers";
import { useContents } from "@/lib/content/contents-provider";

const EMPTY_FORM: ContentFormData = {
  name: "",
  mediaType: "video",
  channel: "",
  platforms: [],
  details: "",
  location: [],
  scheduledDate: "",
  scheduledTime: "",
  endTime: "",
  team: [],
  productsNeeded: [],
  itemsToPrepare: "",
  attachments: [],
  script: [],
  ideaCreator: "",
  photographer: "",
  editor: "",
  category: "",
  tags: [],
  imageMeta: { ...EMPTY_IMAGE_META },
};

interface ContentFormProps {
  onSubmitSuccess?: () => void;
  initialContent?: ContentItem;
  onCancel?: () => void;
  onSaved?: (item: ContentItem) => void;
}

export function ContentForm({
  onSubmitSuccess,
  initialContent,
  onCancel,
  onSaved,
}: ContentFormProps) {
  const isEdit = Boolean(initialContent);
  const [form, setForm] = useState<ContentFormData>(() =>
    initialContent ? contentItemToFormData(initialContent) : EMPTY_FORM
  );
  const [contentId, setContentId] = useState(
    () => initialContent?.contentId ?? generateContentId()
  );
  const [submittedItem, setSubmittedItem] = useState<ContentItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { mutateContents } = useContents();

  const config = MEDIA_FORM_CONFIG[form.mediaType];
  const isVideo = form.mediaType === "video";

  const update = <K extends keyof ContentFormData>(
    key: K,
    value: ContentFormData[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateImageMeta = <K extends keyof ImageMeta>(
    key: K,
    value: ImageMeta[K]
  ) => {
    setForm((prev) => ({
      ...prev,
      imageMeta: { ...prev.imageMeta, [key]: value },
    }));
  };

  const handleMediaTypeChange = (mediaType: MediaType) => {
    setForm((prev) => ({
      ...prev,
      mediaType,
      script: mediaType === "image" ? [] : prev.script,
      imageMeta:
        mediaType === "image" ? prev.imageMeta : { ...EMPTY_IMAGE_META },
    }));
  };

  const startNewContent = (mediaType: MediaType = "video") => {
    setSubmittedItem(null);
    setContentId(generateContentId());
    setForm({ ...EMPTY_FORM, mediaType });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || submitting) return;

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        endTime: "",
        attachments: form.attachments.filter((link) => link.trim()),
        script: isVideo ? form.script : [],
        imageMeta: isVideo ? { ...EMPTY_IMAGE_META } : form.imageMeta,
      };

      const result = isEdit
        ? await updateContent(initialContent!.id, payload)
        : await createContent(payload, contentId);

      if (!result.success) {
        console.error("[content-form] action failed", {
          isEdit,
          contentId,
          mediaType: form.mediaType,
          error: result.error,
        });
        alert(result.error);
        return;
      }

      await mutateContents(
        (current = []) => {
          if (isEdit) {
            return current.map((item) =>
              item.id === result.data.id ? result.data : item
            );
          }
          return [result.data, ...current];
        },
        { revalidate: true }
      );

      if (isEdit) {
        onSaved?.(result.data);
        return;
      }

      setSubmittedItem(result.data);
      onSubmitSuccess?.();
    } catch (error) {
      console.error("[content-form] submit crashed", {
        isEdit,
        contentId,
        mediaType: form.mediaType,
        error,
      });
      const message =
        error instanceof Error && error.message
          ? error.message
          : isEdit
            ? "บันทึกการแก้ไขไม่สำเร็จ กรุณาลองใหม่"
            : "ส่ง Content ไม่สำเร็จ กรุณาลองใหม่";
      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedItem && !isEdit) {
    return (
      <SubmitSuccess
        content={submittedItem}
        onCreateAnother={() => startNewContent(submittedItem.mediaType)}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className={isVideo ? "border-amber-100" : "border-pink-100"}>
        <CardHeader>
          <CardTitle>Module 1: Content Ideation</CardTitle>
          <CardDescription>
            {isVideo
              ? "สำหรับ Video — กรอกข้อมูลถ่ายทำและสคริป"
              : "สำหรับ Picture — กรอก brief งานออกแบบภาพ"}
          </CardDescription>
        </CardHeader>
        <MediaTypeToggle value={form.mediaType} onChange={handleMediaTypeChange} />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ข้อมูล Content</CardTitle>
        </CardHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="รหัส Content"
            value={contentId}
            readOnly
            className="bg-stone-50"
          />
          <Input
            label="ชื่อ Content *"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder={
              isVideo ? "เช่น Hero Serum Launch Video" : "เช่น Herbal Lifestyle Post"
            }
            required
          />
          <Select
            label="ช่องที่ลง"
            options={CHANNELS}
            placeholder="เลือกช่อง..."
            value={form.channel}
            onChange={(e) => update("channel", e.target.value)}
          />
          {!isVideo && (
            <Select
              label="วัตถุประสงค์"
              options={IMAGE_OBJECTIVES}
              placeholder="เลือกวัตถุประสงค์..."
              value={form.imageMeta.objective}
              onChange={(e) => updateImageMeta("objective", e.target.value)}
            />
          )}
        </div>
        <div className="mt-4">
          <PlatformSelect
            selected={form.platforms}
            onChange={(p: Platform[]) => update("platforms", p)}
          />
        </div>
        <div className="mt-4">
          <Textarea
            label="รายละเอียด"
            value={form.details}
            onChange={(e) => update("details", e.target.value)}
            placeholder={
              isVideo
                ? "อธิบาย concept, mood, หรือ brief..."
                : "อธิบาย concept, mood, หรือ brief ของงานภาพ..."
            }
            rows={3}
          />
        </div>
        {!isVideo && (
          <div className="mt-4 grid gap-4 border-t border-pink-100 pt-4 sm:grid-cols-2">
            <Input
              label="วันที่"
              type="date"
              value={form.scheduledDate}
              onChange={(e) => update("scheduledDate", e.target.value)}
            />
            <Input
              label="เวลา post"
              type="time"
              value={form.scheduledTime}
              onChange={(e) => update("scheduledTime", e.target.value)}
            />
          </div>
        )}
      </Card>

      {!isVideo && (
        <>
          <Card className="border-pink-100">
            <CardHeader>
              <CardTitle>ข้อความบนภาพ</CardTitle>
              <CardDescription>
                Headline, Sub Head และ Call to Action ที่ต้องการบนภาพ
              </CardDescription>
            </CardHeader>
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
          </Card>

          <Card className="border-pink-100">
            <CardHeader>
              <CardTitle>องค์ประกอบ &amp; ขนาดงาน</CardTitle>
            </CardHeader>
            <div className="space-y-5">
              <CreatableMultiSelect
                label="องค์ประกอบที่ต้องมี"
                options={IMAGE_REQUIRED_ELEMENTS}
                value={form.imageMeta.requiredElements}
                onChange={(items) => updateImageMeta("requiredElements", items)}
                placeholder="เลือกองค์ประกอบ..."
                addPlaceholder="พิมพ์องค์ประกอบเพิ่มเอง..."
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
          </Card>

          <Card className="border-pink-100">
            <CardHeader>
              <CardTitle>แนบตัวอย่าง</CardTitle>
              <CardDescription>
                แนบ reference หรือตัวอย่างภาพ — วางลิงก์หรืออัปโหลดได้มากกว่า 1
                รายการ
              </CardDescription>
            </CardHeader>
            <ImageAttachmentLinks
              links={form.attachments}
              onChange={(links) => update("attachments", links)}
            />
          </Card>
        </>
      )}

      {isVideo && (
        <Card>
          <CardHeader>
            <CardTitle>เวลา post</CardTitle>
          </CardHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="วันที่"
              type="date"
              value={form.scheduledDate}
              onChange={(e) => update("scheduledDate", e.target.value)}
            />
            <Input
              label="เวลา post"
              type="time"
              value={form.scheduledTime}
              onChange={(e) => update("scheduledTime", e.target.value)}
            />
          </div>
        </Card>
      )}

      {isVideo && (
        <Card>
          <CardHeader>
            <CardTitle>สถานที่ถ่าย</CardTitle>
          </CardHeader>
          <LocationSelect
            selected={form.location}
            onChange={(locations) => update("location", locations)}
            optional={config.locationOptional}
          />
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>ผู้เข้าร่วม &amp; หน้าที่รับผิดชอบ</CardTitle>
        </CardHeader>
        <TeamTable rows={form.team} onChange={(rows) => update("team", rows)} />
      </Card>

      {isVideo && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>ทรัพยากร &amp; อุปกรณ์</CardTitle>
            </CardHeader>
            <div className="space-y-4">
              <CreatableMultiSelect
                label="สินค้าที่ต้องใช้"
                options={PRODUCTS}
                value={form.productsNeeded}
                onChange={(items) => update("productsNeeded", items)}
                placeholder="เลือกสินค้า..."
                addPlaceholder="พิมพ์สินค้าเพิ่มเอง..."
              />
              <Input
                label="ของที่ต้องเตรียม"
                value={form.itemsToPrepare}
                onChange={(e) => update("itemsToPrepare", e.target.value)}
                placeholder="Backdrop, Props, Equipment..."
              />
              <AttachmentLinks
                links={form.attachments}
                onChange={(links) => update("attachments", links)}
              />
            </div>
          </Card>

          <Card className="border-amber-100">
            <CardHeader>
              <CardTitle>สคริป</CardTitle>
              <CardDescription>
                เวลาเริ่มต้น, เวลาสิ้นสุด, Action, บทพูด, หมายเหตุ
              </CardDescription>
            </CardHeader>
            <ScriptTable
              rows={form.script}
              onChange={(rows) => update("script", rows)}
            />
          </Card>
        </>
      )}

      <Card>
        <CardHeader>
          <CardTitle>ทีมงานหลัก</CardTitle>
        </CardHeader>
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
      </Card>

      <div className="flex justify-end gap-3 pb-8">
        {isEdit ? (
          <Button type="button" variant="secondary" onClick={onCancel}>
            ยกเลิก
          </Button>
        ) : (
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              setForm({ ...EMPTY_FORM, mediaType: form.mediaType })
            }
          >
            ล้างฟอร์ม
          </Button>
        )}
        <Button type="submit" size="lg" disabled={submitting}>
          <Send className="h-4 w-4" />
          {submitting
            ? isEdit
              ? "กำลังบันทึก..."
              : "กำลังส่ง..."
            : isEdit
              ? "บันทึกการแก้ไข"
              : "ส่งเพื่ออนุมัติ"}
        </Button>
      </div>
    </form>
  );
}
