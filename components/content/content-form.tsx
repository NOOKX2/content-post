"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { MediaTypeToggle } from "./media-type-toggle";
import { TeamTable } from "./team-table";
import { ScriptTable } from "./script-table";
import { PlatformSelect } from "./platform-select";
import { LocationSelect } from "./location-select";
import { AttachmentLinks } from "./attachment-links";
import { SubmitSuccess } from "./submit-success";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CHANNELS, TEAM_MEMBERS, PRODUCTS } from "@/lib/constants";
import { MEDIA_FORM_CONFIG } from "@/lib/content/form-config";
import type { ContentFormData, ContentItem, MediaType, Platform } from "@/lib/types";
import { generateContentId } from "@/lib/utils";
import { createContent } from "@/lib/content/actions";
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
};

interface ContentFormProps {
  onSubmitSuccess?: () => void;
}

export function ContentForm({ onSubmitSuccess }: ContentFormProps) {
  const [form, setForm] = useState<ContentFormData>(EMPTY_FORM);
  const [contentId, setContentId] = useState(() => generateContentId());
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

  const handleMediaTypeChange = (mediaType: MediaType) => {
    setForm((prev) => ({
      ...prev,
      mediaType,
      script: mediaType === "image" ? [] : prev.script,
    }));
  };

  const startNewContent = (mediaType: MediaType = "video") => {
    setSubmittedItem(null);
    setContentId(generateContentId());
    setForm({ ...EMPTY_FORM, mediaType });
  };

  const toggleProduct = (product: string) => {
    const current = form.productsNeeded;
    update(
      "productsNeeded",
      current.includes(product)
        ? current.filter((p) => p !== product)
        : [...current, product]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || submitting) return;

    setSubmitting(true);
    try {
      const result = await createContent(
        {
          ...form,
          attachments: form.attachments.filter((link) => link.trim()),
          script: isVideo ? form.script : [],
        },
        contentId
      );

      if (!result.success) {
        alert(result.error);
        return;
      }

      await mutateContents(
        (current = []) => [result.data, ...current],
        { revalidate: true }
      );

      setSubmittedItem(result.data);
      onSubmitSuccess?.();
    } catch {
      alert("ส่ง Content ไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedItem) {
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
              : "สำหรับรูปภาพ / Post — กรอกข้อมูลโพสต์"}
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
            placeholder="อธิบาย concept, mood, หรือ brief..."
            rows={3}
          />
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>สถานที่ &amp; เวลา</CardTitle>
        </CardHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <LocationSelect
            selected={form.location}
            onChange={(locations) => update("location", locations)}
            optional={config.locationOptional}
          />
          <Input
            label="วันที่"
            type="date"
            value={form.scheduledDate}
            onChange={(e) => update("scheduledDate", e.target.value)}
          />
          <Input
            label="เวลาเริ่ม"
            type="time"
            value={form.scheduledTime}
            onChange={(e) => update("scheduledTime", e.target.value)}
          />
          <Input
            label="เวลาสิ้นสุด"
            type="time"
            value={form.endTime}
            onChange={(e) => update("endTime", e.target.value)}
          />
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ผู้เข้าร่วม &amp; หน้าที่รับผิดชอบ</CardTitle>
        </CardHeader>
        <TeamTable rows={form.team} onChange={(rows) => update("team", rows)} />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ทรัพยากร &amp; อุปกรณ์</CardTitle>
        </CardHeader>
        <div className="space-y-4">
          <div>
            <span className="text-sm font-medium text-stone-700">
              สินค้าที่ต้องใช้
              {config.productsOptional && (
                <span className="ml-1 font-normal text-stone-400">(ไม่บังคับ)</span>
              )}
            </span>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
              {PRODUCTS.map((p) => (
                <Checkbox
                  key={p}
                  label={p}
                  checked={form.productsNeeded.includes(p)}
                  onChange={() => toggleProduct(p)}
                />
              ))}
            </div>
          </div>
          <Input
            label={`ของที่ต้องเตรียม${config.itemsPrepareOptional ? " (ไม่บังคับ)" : ""}`}
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

      {config.showScript && (
        <Card className="border-amber-100">
          <CardHeader>
            <CardTitle>สคริป</CardTitle>
            <CardDescription>ระยะเวลา, Action, บทพูด, หมายเหตุ</CardDescription>
          </CardHeader>
          <ScriptTable
            rows={form.script}
            onChange={(rows) => update("script", rows)}
          />
        </Card>
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
        <Button
          type="button"
          variant="secondary"
          onClick={() => setForm({ ...EMPTY_FORM, mediaType: form.mediaType })}
        >
          ล้างฟอร์ม
        </Button>
        <Button type="submit" size="lg" disabled={submitting}>
          <Send className="h-4 w-4" />
          {submitting ? "กำลังส่ง..." : "ส่งเพื่ออนุมัติ"}
        </Button>
      </div>
    </form>
  );
}
