"use client";

import { useCallback, useEffect, useState } from "react";
import useSWR from "swr";
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
  TEAM_MEMBERS,
  PRODUCTS,
  FILMING_EQUIPMENT,
  CONTENT_OBJECTIVES,
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
import { resolveNextContentIdFromList } from "@/lib/content/content-id";
import {
  createContent,
  previewNextContentId,
  updateContent,
} from "@/lib/content/actions";
import { contentItemToFormData } from "@/lib/content/mappers";
import { useContents } from "@/lib/content/contents-provider";
import { generateId } from "@/lib/utils";

type PostingChannelOption = {
  slug: string;
  label: string;
  prefix: string;
  platforms: Platform[];
};

const fetchPostingChannels = () =>
  fetch("/api/posting-channels").then((res) => res.json()) as Promise<{
    channels: PostingChannelOption[];
  }>;

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
  ideaFinishedDate: "",
  shootDate: "",
  editFinishedDate: "",
  team: [{ id: generateId(), participant: "", responsibility: "" }],
  productsNeeded: [],
  itemsToPrepare: "",
  filmingEquipment: [],
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
  onMediaTypeChange?: (mediaType: MediaType) => void;
}

export function ContentForm({
  onSubmitSuccess,
  initialContent,
  onCancel,
  onSaved,
  onMediaTypeChange,
}: ContentFormProps) {
  const isEdit = Boolean(initialContent);
  const [form, setForm] = useState<ContentFormData>(() =>
    initialContent ? contentItemToFormData(initialContent) : EMPTY_FORM
  );
  const [contentId, setContentId] = useState(
    () => initialContent?.contentId ?? ""
  );
  const [submittedItem, setSubmittedItem] = useState<ContentItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { contents, mutateContents } = useContents();
  const { data: postingData } = useSWR("posting-channels", fetchPostingChannels);

  const channelOptions =
    postingData?.channels.map((channel) => ({
      value: channel.slug,
      label: channel.label,
    })) ?? [];
  const selectedChannel = postingData?.channels.find(
    (channel) => channel.slug === form.channel
  );
  const availablePlatforms = selectedChannel?.platforms ?? [];

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
    onMediaTypeChange?.(mediaType);
  };

  const syncContentIdForChannel = useCallback(
    async (channel: string, active: () => boolean) => {
      if (isEdit) return;

      if (!channel) {
        if (active()) setContentId("");
        return;
      }

      const channelPrefix = postingData?.channels.find(
        (item) => item.slug === channel
      )?.prefix;
      const localId = channelPrefix
        ? resolveNextContentIdFromList(channel, contents, channelPrefix)
        : null;
      if (localId && active()) {
        setContentId(localId);
      }

      const result = await previewNextContentId(channel);
      if (!active()) return;

      if (result.success) {
        setContentId(result.data);
      } else if (!localId) {
        setContentId("");
        console.error("[content-form] preview content id failed", result.error);
      }
    },
    [contents, isEdit, postingData?.channels]
  );

  const handleChannelChange = (channel: string) => {
    const nextChannel = postingData?.channels.find((item) => item.slug === channel);
    const nextAvailable = nextChannel?.platforms ?? [];
    setForm((prev) => ({
      ...prev,
      channel,
      platforms: prev.platforms.filter((p) => nextAvailable.includes(p)),
    }));
    if (isEdit) return;

    if (!channel || !nextChannel) {
      setContentId("");
      return;
    }

    const localId = resolveNextContentIdFromList(
      channel,
      contents,
      nextChannel.prefix
    );
    if (localId) {
      setContentId(localId);
    }
  };

  useEffect(() => {
    let active = true;
    void syncContentIdForChannel(form.channel, () => active);
    return () => {
      active = false;
    };
  }, [form.channel, syncContentIdForChannel]);

  const startNewContent = (mediaType: MediaType = "video") => {
    setSubmittedItem(null);
    setContentId("");
    setForm({ ...EMPTY_FORM, mediaType });
    onMediaTypeChange?.(mediaType);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || submitting) return;
    if (!isEdit && !form.channel.trim()) {
      alert("กรุณาเลือกช่องที่ลง");
      return;
    }
    if (!isEdit && form.platforms.length === 0) {
      alert("กรุณาเลือกแพลตฟอร์มอย่างน้อย 1 แพลตฟอร์ม");
      return;
    }

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
        : await createContent(payload);

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
        <CardHeader className="pb-3">
          <CardTitle>{isVideo ? "Video Content" : "Picture Content"}</CardTitle>
        </CardHeader>
        <MediaTypeToggle value={form.mediaType} onChange={handleMediaTypeChange} />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ข้อมูล Content</CardTitle>
        </CardHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="ชื่อ Content *"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder={
              isVideo ? "เช่น Hero Serum Launch Video" : "เช่น Herbal Lifestyle Post"
            }
            required
          />
          <Input
            label="รหัส Content"
            value={contentId}
            readOnly
            placeholder={isEdit ? "" : "เลือกช่องเพื่อรันรหัสอัตโนมัติ"}
            className="bg-stone-50 font-mono"
          />
          <Select
            label="ช่องที่ลง *"
            options={channelOptions}
            placeholder="เลือกช่อง..."
            value={form.channel}
            onChange={(e) => handleChannelChange(e.target.value)}
            required={!isEdit}
          />
          <Select
            label="วัตถุประสงค์"
            options={CONTENT_OBJECTIVES}
            placeholder="เลือกวัตถุประสงค์..."
            value={isVideo ? form.category : form.imageMeta.objective}
            onChange={(e) =>
              isVideo
                ? update("category", e.target.value)
                : updateImageMeta("objective", e.target.value)
            }
          />
        </div>
        <div className="mt-4">
          <PlatformSelect
            selected={form.platforms}
            availablePlatforms={availablePlatforms}
            disabled={!form.channel}
            onChange={(platforms: Platform[]) => update("platforms", platforms)}
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
              label="วันที่โพสต์"
              type="date"
              value={form.scheduledDate}
              onChange={(e) => update("scheduledDate", e.target.value)}
            />
            <Input
              label="เวลาโพสต์"
              type="time"
              value={form.scheduledTime}
              onChange={(e) => update("scheduledTime", e.target.value)}
            />
          </div>
        )}
      </Card>

      <Card className={isVideo ? "border-amber-100" : "border-pink-100"}>
        <CardHeader>
          <CardTitle>Pre Post</CardTitle>
          <CardDescription>
            วันที่คิดเสร็จ นัดถ่าย และตัดเสร็จ — ใช้ในปฏิทิน Pre Post
          </CardDescription>
        </CardHeader>
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
                label="องค์ประกอบ"
                options={IMAGE_REQUIRED_ELEMENTS}
                value={form.imageMeta.requiredElements}
                onChange={(items) => updateImageMeta("requiredElements", items)}
                placeholder="เลือกองค์ประกอบ..."
                addPlaceholder="พิมพ์องค์ประกอบเพิ่มเอง..."
              />
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
          </Card>

          <Card className="border-pink-100">
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
            <CardTitle>วัน/เวลาโพสต์</CardTitle>
          </CardHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="วันที่โพสต์"
              type="date"
              value={form.scheduledDate}
              onChange={(e) => update("scheduledDate", e.target.value)}
            />
            <Input
              label="เวลาโพสต์"
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
              <CardTitle>สิ่งที่ต้องเตรียม</CardTitle>
            </CardHeader>
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
          </Card>

          <Card className="border-amber-100">
            <CardHeader>
              <CardTitle>ตัวอย่าง</CardTitle>
              <CardDescription>
                วางลิงก์ reference หรืออัปโหลดรูป / PDF / วิดีโอ (สูงสุด 10 MB)
              </CardDescription>
            </CardHeader>
            <AttachmentLinks
              links={form.attachments}
              onChange={(links) => update("attachments", links)}
              hideHeader
            />
          </Card>

          <Card className="border-amber-100">
            <CardHeader>
              <CardTitle>สคริป</CardTitle>
              <CardDescription>
                เวลาเริ่มต้น, เวลาสิ้นสุด, Action, บทพูด, หมายเหตุ, เพิ่มรูปภาพ
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
          <CardTitle>ผู้สร้าง content</CardTitle>
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
