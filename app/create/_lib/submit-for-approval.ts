"use client";

/**
 * ปุ่มเสร็จสิ้น — เส้นทางส่งงานให้แอดมิน + LINE
 *
 * อ่านตามลำดับนี้:
 * 1. FinishSubmitBar.tsx  (ปุ่ม UI "เสร็จสิ้น")
 * 2. ContentForm.tsx      (ฟอร์มเรียกฟังก์ชันด้านล่าง)
 * 3. ไฟล์นี้               (เลือก create / ส่งคลิป / ส่งแนวคิดใหม่ / บันทึก)
 * 4. lib/content/actions/mutate.ts → createContent()
 * 5. lib/content/actions/create.ts → createContentRecord()
 *      - บันทึกสถานะ pending ให้แอดมินเห็นที่ /admin
 *      - การ์ดขออนุมัติในแชททีม
 * 6. lib/integrations/line/notify.ts → notifyLineApprovalRequested()
 *      - ส่งการ์ด Flex เข้า LINE กลุ่ม (ดู log `[line]` ใน terminal)
 */

import {
  createContent,
  resubmitIdeaForApproval,
  submitClipForApproval,
  updateContent,
  type ActionResult,
} from "@/lib/content/actions";
import { EMPTY_IMAGE_META } from "@/lib/types";
import type { ContentFormData, ContentItem } from "@/lib/types";
import {
  hasFinalVideoClip,
  shouldResubmitClip,
  shouldResubmitIdea,
} from "@/lib/content/domain/workflow";

export type FinishSubmitKind =
  | "create"
  | "submit_clip"
  | "resubmit_idea"
  | "save";

export function getFinishSubmitKind(
  form: ContentFormData,
  initialContent: ContentItem | undefined
): FinishSubmitKind {
  const isEdit = Boolean(initialContent);
  const isVideo = form.mediaType === "video";

  if (!isEdit) return "create";

  const willSubmitClip =
    isVideo &&
    hasFinalVideoClip(form) &&
    (initialContent?.status === "idea_approved" ||
      (initialContent?.status === "rejected" &&
        shouldResubmitClip(initialContent)));

  if (willSubmitClip) return "submit_clip";

  const willResubmitIdea =
    isVideo &&
    initialContent &&
    shouldResubmitIdea(initialContent) &&
    !hasFinalVideoClip(form);

  if (willResubmitIdea) return "resubmit_idea";
  return "save";
}

export function buildFinishSubmitPayload(
  form: ContentFormData
): ContentFormData {
  const isVideo = form.mediaType === "video";
  return {
    ...form,
    endTime: "",
    attachments: form.attachments.filter((link) => link.trim()),
    exampleAttachments: form.exampleAttachments.filter((link) => link.trim()),
    coverImage: form.coverImage.trim(),
    script: isVideo ? form.script : [],
    imageMeta: isVideo ? { ...EMPTY_IMAGE_META } : form.imageMeta,
  };
}

export async function submitCreateContentForm(input: {
  form: ContentFormData;
  initialContent?: ContentItem;
}): Promise<ActionResult<ContentItem>> {
  const payload = buildFinishSubmitPayload(input.form);
  const kind = getFinishSubmitKind(input.form, input.initialContent);
  const id = input.initialContent?.id;

  console.log("[content-submit] client | Finish button", {
    kind,
    name: payload.name,
    mediaType: payload.mediaType,
    id,
  });

  switch (kind) {
    case "submit_clip":
      return submitClipForApproval(id!, payload);
    case "resubmit_idea":
      return resubmitIdeaForApproval(id!, payload);
    case "save":
      return updateContent(id!, payload);
    case "create":
      return createContent(payload);
  }
}
