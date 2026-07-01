"use client";

import { useState } from "react";
import { Send, Paperclip } from "lucide-react";
import { MediaTypeToggle } from "./media-type-toggle";
import { TeamTable } from "./team-table";
import { ScriptTable } from "./script-table";
import { PlatformSelect } from "./platform-select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  CHANNELS,
  TEAM_MEMBERS,
  PRODUCTS,
  LOCATIONS,
  CONTENT_CATEGORIES,
} from "@/lib/constants";
import type { ContentFormData, MediaType, Platform } from "@/lib/types";
import { generateContentId } from "@/lib/utils";
import { useContent } from "@/lib/content-context";

const EMPTY_FORM: ContentFormData = {
  name: "",
  mediaType: "video",
  channel: "",
  platforms: [],
  details: "",
  location: "",
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
  const { addContent } = useContent();
  const [form, setForm] = useState<ContentFormData>(EMPTY_FORM);
  const [contentId] = useState(generateContentId());
  const [submitted, setSubmitted] = useState(false);

  const update = <K extends keyof ContentFormData>(
    key: K,
    value: ContentFormData[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSubmitted(false);
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

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || submitting) return;

    setSubmitting(true);
    try {
      await addContent(form, contentId);
      setForm(EMPTY_FORM);
      setSubmitted(true);
      onSubmitSuccess?.();
    } catch {
      alert("ส่ง Content ไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {submitted && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-700">
          ส่ง Content เรียบร้อยแล้ว — รอ Admin อนุมัติ
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>ประเภท Content</CardTitle>
          <CardDescription>เลือก Video หรือ Picture/Post</CardDescription>
        </CardHeader>
        <MediaTypeToggle
          value={form.mediaType}
          onChange={(v: MediaType) => update("mediaType", v)}
        />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลพื้นฐาน</CardTitle>
        </CardHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="รหัส Content" value={contentId} readOnly className="bg-stone-50" />
          <Input
            label="ชื่อ Content *"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="เช่น Hero Serum Launch Video"
            required
          />
          <Select
            label="ช่องที่ลง"
            options={CHANNELS}
            placeholder="เลือกช่อง..."
            value={form.channel}
            onChange={(e) => update("channel", e.target.value)}
          />
          <Select
            label="หมวดหมู่"
            options={CONTENT_CATEGORIES}
            placeholder="เลือกหมวดหมู่..."
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
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
          <CardTitle>สถานที่ & เวลา</CardTitle>
        </CardHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="สถานที่ถ่าย"
            options={LOCATIONS}
            placeholder="เลือกสถานที่..."
            value={form.location}
            onChange={(e) => update("location", e.target.value)}
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
        <TeamTable
          rows={form.team}
          onChange={(rows) => update("team", rows)}
        />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ทรัพยากร & อุปกรณ์</CardTitle>
        </CardHeader>
        <div className="space-y-4">
          <div>
            <span className="text-sm font-medium text-stone-700">
              สินค้าที่ต้องใช้
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
            label="ของที่ต้องเตรียม"
            value={form.itemsToPrepare}
            onChange={(e) => update("itemsToPrepare", e.target.value)}
            placeholder="Backdrop, Props, Equipment..."
          />
          <div>
            <span className="text-sm font-medium text-stone-700">
              ไฟล์แนบ / Reference
            </span>
            <div className="mt-2 flex items-center gap-3 rounded-lg border border-dashed border-stone-300 bg-stone-50 px-4 py-6">
              <Paperclip className="h-5 w-5 text-stone-400" />
              <div>
                <p className="text-sm text-stone-600">
                  ลากไฟล์มาวาง หรือวางลิงก์ reference
                </p>
                <p className="text-xs text-stone-400">
                  (จะเชื่อม upload จริงในขั้นตอนถัดไป)
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {form.mediaType === "video" && (
        <Card>
          <ScriptTable
            rows={form.script}
            onChange={(rows) => update("script", rows)}
          />
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>ทีมงาน</CardTitle>
        </CardHeader>
        <div className="grid gap-4 sm:grid-cols-3">
          <Select
            label="ผู้คิดไอเดีย"
            options={TEAM_MEMBERS}
            placeholder="เลือก..."
            value={form.ideaCreator}
            onChange={(e) => update("ideaCreator", e.target.value)}
          />
          <Select
            label={form.mediaType === "video" ? "ช่างภาพ" : "ช่างภาพ"}
            options={TEAM_MEMBERS}
            placeholder="เลือก..."
            value={form.photographer}
            onChange={(e) => update("photographer", e.target.value)}
          />
          <Select
            label="ผู้ตัดต่อ"
            options={TEAM_MEMBERS}
            placeholder="เลือก..."
            value={form.editor}
            onChange={(e) => update("editor", e.target.value)}
          />
        </div>
      </Card>

      <div className="flex justify-end gap-3 pb-8">
        <Button type="button" variant="secondary" onClick={() => setForm(EMPTY_FORM)}>
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
