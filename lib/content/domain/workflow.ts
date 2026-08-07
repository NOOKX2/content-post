import {
  isImageMediaUrl,
  isVideoAttachmentUrl,
} from "@/lib/content/domain/media-url";
import type { ContentFormData, ContentItem, ContentStatus, MediaType } from "@/lib/types";

export function isAwaitingAdminApproval(status: ContentStatus): boolean {
  return status === "pending" || status === "clip_pending";
}

export const PUBLISH_PIPELINE_STATUSES: ContentStatus[] = [
  "approved",
  "scheduled",
  "posting",
  "posted",
  "post_failed",
];

export function isPublishPipelineStatus(status: ContentStatus): boolean {
  return PUBLISH_PIPELINE_STATUSES.includes(status);
}

export type AdminApprovalFilter =
  | ContentStatus
  | "all"
  | "content_approved"
  | "clip_approved"
  | "content_rejected"
  | "clip_rejected";

export type AdminApprovalView = "pending" | "completed" | "rejected";
export type AdminApprovalStage = "concept" | "clip";

export function isPendingConceptApproval(content: ContentItem): boolean {
  return content.status === "pending";
}

export function isPendingClipApproval(content: ContentItem): boolean {
  return (
    content.status === "clip_pending" ||
    (content.mediaType === "video" &&
      content.status === "idea_approved" &&
      hasFinalVideoClip(content))
  );
}

export function matchesAdminApprovalView(
  content: ContentItem,
  view: AdminApprovalView,
  stage: AdminApprovalStage
): boolean {
  if (view === "pending") {
    return stage === "concept"
      ? isPendingConceptApproval(content)
      : isPendingClipApproval(content);
  }

  if (view === "completed") {
    return stage === "concept"
      ? content.mediaType === "image" && isPublishPipelineStatus(content.status)
      : content.mediaType === "video" && isPublishPipelineStatus(content.status);
  }

  return stage === "concept"
    ? isRejectedAtContentStage(content)
    : isRejectedAtClipStage(content);
}

export function countAdminApprovalView(
  contents: ContentItem[],
  view: AdminApprovalView,
  stage?: AdminApprovalStage
): number {
  if (stage) {
    return contents.filter((content) =>
      matchesAdminApprovalView(content, view, stage)
    ).length;
  }

  return (
    countAdminApprovalView(contents, view, "concept") +
    countAdminApprovalView(contents, view, "clip")
  );
}

export function getAdminListRoundLabel(
  content: ContentItem,
  stage: AdminApprovalStage
): string | null {
  if (stage === "clip") {
    return "รอบที่ 2";
  }

  if (content.mediaType === "video" && content.status === "pending") {
    return "รอบที่ 1";
  }

  return null;
}

export function isRejectedAtClipStage(content: ContentItem): boolean {
  return content.status === "rejected" && shouldResubmitClip(content);
}

export function isRejectedAtContentStage(content: ContentItem): boolean {
  return content.status === "rejected" && !shouldResubmitClip(content);
}

export function getAdminRejectionLabel(content: ContentItem): string {
  if (isRejectedAtClipStage(content)) {
    return "ไม่อนุมัติคลิป";
  }
  return content.mediaType === "image" ? "ไม่อนุมัติ Content" : "ไม่อนุมัติแนวคิด";
}

export function matchesAdminApprovalFilter(
  content: ContentItem,
  filter: AdminApprovalFilter
): boolean {
  if (filter === "all") return true;
  if (filter === "content_approved") {
    return (
      content.mediaType === "image" && isPublishPipelineStatus(content.status)
    );
  }
  if (filter === "clip_approved") {
    return (
      content.mediaType === "video" && isPublishPipelineStatus(content.status)
    );
  }
  if (filter === "content_rejected") {
    return isRejectedAtContentStage(content);
  }
  if (filter === "clip_rejected") {
    return isRejectedAtClipStage(content);
  }
  return content.status === filter;
}

export function countAdminApprovalFilter(
  contents: ContentItem[],
  filter: AdminApprovalFilter
): number {
  return contents.filter((content) =>
    matchesAdminApprovalFilter(content, filter)
  ).length;
}

/** Admin can press approve on the approval list for this content. */
export function canAdminApproveContent(content: ContentItem): boolean {
  if (isAwaitingAdminApproval(content.status)) {
    return true;
  }

  if (
    content.mediaType === "video" &&
    content.status === "idea_approved" &&
    hasFinalVideoClip(content)
  ) {
    return true;
  }

  return false;
}

export function getAdminApproveLabel(content: ContentItem): string {
  if (content.mediaType === "image") {
    return "อนุมัติ";
  }

  if (content.status === "clip_pending") {
    return "อนุมัติคลิป";
  }

  if (content.status === "idea_approved" && hasFinalVideoClip(content)) {
    return "อนุมัติคลิป";
  }

  if (content.status === "pending" && hasFinalVideoClip(content)) {
    return "อนุมัติและโพสต์";
  }

  return "อนุมัติแนวคิด";
}

export function canAdminRejectContent(content: ContentItem): boolean {
  return (
    canAdminApproveContent(content) ||
    content.status === "idea_approved" ||
    content.status === "pending" ||
    content.status === "clip_pending"
  );
}

export function canUploadFinalClip(status: ContentStatus): boolean {
  return status === "idea_approved" || status === "rejected";
}

export function getApprovalRound(content: {
  mediaType: MediaType;
  status: ContentStatus;
}): 1 | 2 | null {
  if (content.mediaType !== "video") {
    return content.status === "pending" ? 1 : null;
  }

  if (content.status === "pending") return 1;
  if (content.status === "clip_pending") return 2;
  return null;
}

export function getApprovalRoundLabel(round: 1 | 2): string {
  return round === 1 ? "อนุมัติแนวคิด (รอบ 1)" : "อนุมัติคลิป (รอบ 2)";
}

export function hasExampleImages(data: Pick<ContentFormData, "exampleAttachments" | "script">): boolean {
  const exampleAttachments = (data.exampleAttachments ?? []).filter((url) =>
    url.trim()
  );
  if (exampleAttachments.some((url) => isImageMediaUrl(url))) {
    return true;
  }

  return data.script.some((row) => {
    const imageUrl = row.imageUrl?.trim();
    return Boolean(imageUrl && isImageMediaUrl(imageUrl));
  });
}

export function hasFinalVideoClip(data: Pick<ContentFormData, "attachments">): boolean {
  return (data.attachments ?? [])
    .filter((url) => url.trim())
    .some((url) => isVideoAttachmentUrl(url));
}

export function shouldResubmitClip(content: ContentItem): boolean {
  if (content.mediaType !== "video") return false;
  if (content.status === "idea_approved") return true;
  if (content.status !== "rejected") return false;
  return hasFinalVideoClip(content);
}

export function shouldResubmitIdea(content: ContentItem): boolean {
  if (content.mediaType !== "video") return false;
  if (content.status !== "rejected") return false;
  return !shouldResubmitClip(content);
}

export function showFinalClipSection(
  isEdit: boolean,
  status?: ContentStatus
): boolean {
  if (!isEdit) return false;
  if (!status) return false;
  return [
    "idea_approved",
    "clip_pending",
    "approved",
    "scheduled",
    "posting",
    "posted",
    "post_failed",
    "rejected",
  ].includes(status);
}

export const VIDEO_WORKFLOW_STEPS = [
  { id: 1, label: "วางแผน" },
  { id: 2, label: "รออนุมัติ 1" },
  { id: 3, label: "ผลิต" },
  { id: 4, label: "รออนุมัติ 2" },
  { id: 5, label: "เผยแพร่" },
] as const;

export type VideoWorkflowStep = (typeof VIDEO_WORKFLOW_STEPS)[number]["id"];

export function getVideoWorkflowStep(content: ContentItem): VideoWorkflowStep {
  if (content.mediaType !== "video") return 1;

  switch (content.status) {
    case "pending":
      return 2;
    case "idea_approved":
      return 3;
    case "clip_pending":
      return 4;
    case "approved":
    case "scheduled":
    case "posting":
    case "posted":
    case "post_failed":
      return 5;
    case "rejected":
      return shouldResubmitClip(content) ? 3 : 1;
    default:
      return 1;
  }
}

export function getVideoWorkflowHeader(step: VideoWorkflowStep): {
  title: string;
  description: string;
} {
  switch (step) {
    case 1:
      return {
        title: "วางแผน Content & ส่งอนุมัติเบื้องต้น",
        description: "กรอก brief และแนบรูปตัวอย่างเพื่อส่งให้ Admin อนุมัติรอบแรก",
      };
    case 2:
      return {
        title: "สถานะการอนุมัติเบื้องต้นโดยแอดมิน",
        description: "รอ Admin ตรวจสอบแนวคิดและรูปตัวอย่าง",
      };
    case 3:
      return {
        title: "ขั้นตอนการผลิตและอัปโหลดงาน",
        description: "อัปโหลดคลิปวิดีโอที่ตัดต่อเสร็จแล้วเพื่อส่งตรวจสอบ",
      };
    case 4:
      return {
        title: "อนุมัติวิดีโอขั้นสุดท้าย",
        description: "รอ Admin ตรวจสอบคลิปวิดีโอก่อนลงโพสต์",
      };
    case 5:
      return {
        title: "สถานะ: เผยแพร่แล้ว",
        description: "Content ผ่านการอนุมัติและอยู่ในขั้นตอนลงโพสต์หรือโพสต์แล้ว",
      };
  }
}

export function getContentWorkflowHeader(
  mediaType: MediaType,
  step: VideoWorkflowStep
): { title: string; description: string } {
  if (mediaType === "image") {
    switch (step) {
      case 1:
        return {
          title: "วางแผน Content & ส่งอนุมัติ",
          description:
            "กรอก brief งานออกแบบภาพและแนบตัวอย่างเพื่อส่งให้ Admin",
        };
      case 2:
        return {
          title: "สถานะการอนุมัติโดยแอดมิน",
          description: "รอ Admin ตรวจสอบงานออกแบบภาพ",
        };
      case 5:
        return {
          title: "สถานะ: เผยแพร่แล้ว",
          description:
            "Content ผ่านการอนุมัติและอยู่ในขั้นตอนลงโพสต์หรือโพสต์แล้ว",
        };
      default:
        return getVideoWorkflowHeader(step);
    }
  }

  return getVideoWorkflowHeader(step);
}

export type PublishWorkflowTone = "success" | "info" | "warning" | "error";

export type PublishWorkflowState = {
  title: string;
  description: string;
  banner: {
    message: string;
    tone: PublishWorkflowTone;
  };
};

export function getPublishWorkflowState(
  content: ContentItem
): PublishWorkflowState | null {
  if (getContentWorkflowStep(content) !== 5) {
    return null;
  }

  switch (content.status) {
    case "posted":
      return {
        title: "สถานะ: โพสต์แล้ว",
        description: "Content ลงโพสต์บนแพลตฟอร์มที่เลือกเรียบร้อย",
        banner: {
          message: "โพสต์สำเร็จแล้ว — ดูรายละเอียดได้ในปฏิทิน",
          tone: "success",
        },
      };
    case "posting":
      return {
        title: "สถานะ: กำลังโพสต์",
        description: "ระบบกำลังอัปโหลดและเผยแพร่ Content ไปยังแพลตฟอร์ม",
        banner: {
          message: "กำลังโพสต์ — โปรดรอสักครู่",
          tone: "warning",
        },
      };
    case "post_failed":
      return {
        title: "สถานะ: โพสต์ไม่สำเร็จ",
        description: "การโพสต์อัตโนมัติล้มเหลว ติดต่อ Admin เพื่อตรวจสอบ",
        banner: {
          message: content.postError
            ? `โพสต์ไม่สำเร็จ: ${content.postError}`
            : "โพสต์ไม่สำเร็จ — ติดต่อ Admin",
          tone: "error",
        },
      };
    case "scheduled":
      return {
        title: "สถานะ: กำลังรอเผยแพร่",
        description: "จัดตารางโพสต์แล้ว รอถึงวันและเวลาที่กำหนด",
        banner: {
          message: "กำหนดการโพสต์แล้ว — รอเผยแพร่ตามเวลา",
          tone: "info",
        },
      };
    case "approved":
    default:
      return {
        title: "สถานะ: กำลังรอเผยแพร่",
        description:
          "ผ่านการอนุมัติแล้ว ระบบกำลังเตรียมจัดตารางโพสต์อัตโนมัติ",
        banner: {
          message: "อนุมัติแล้ว — รอระบบจัดตารางและเผยแพร่",
          tone: "info",
        },
      };
  }
}

export function getWorkflowStatusHeader(
  content: ContentItem
): { title: string; description: string } {
  const publishState = getPublishWorkflowState(content);
  if (publishState) {
    return {
      title: publishState.title,
      description: publishState.description,
    };
  }

  return getContentWorkflowHeader(content.mediaType, getContentWorkflowStep(content));
}

export function isActiveVideoWorkflow(status: ContentStatus): boolean {
  return [
    "pending",
    "idea_approved",
    "clip_pending",
    "approved",
    "scheduled",
    "posting",
    "rejected",
  ].includes(status);
}

/** Creator must return to /create to upload clip or fix rejected work. */
export function needsCreatorAction(content: ContentItem): boolean {
  if (content.mediaType !== "video") {
    return content.status === "rejected";
  }

  return content.status === "idea_approved" || content.status === "rejected";
}

export function getCreateResumeHref(contentId: string): string {
  return `/create?resume=${contentId}`;
}

export function parseCreateMediaType(
  value: string | null | undefined
): MediaType {
  return value === "image" ? "image" : "video";
}

export function getCreateNewHref(mediaType: MediaType = "video"): string {
  return `/create?new=1&type=${mediaType}`;
}

export function getCreatorActionLabel(content: ContentItem): string {
  if (content.status === "idea_approved") {
    return "อัปโหลดคลิป";
  }
  if (content.status === "rejected") {
    return shouldResubmitClip(content) ? "แก้ไขคลิป" : "แก้ไขแนวคิด";
  }
  return "ดำเนินการต่อ";
}

export const WORKFLOW_BOARD_COLUMNS = [
  {
    step: 1 as VideoWorkflowStep,
    title: "วางแผน",
    shortTitle: "วางแผน",
    hint: "แก้ไข brief",
  },
  {
    step: 2 as VideoWorkflowStep,
    title: "รออนุมัติ 1",
    shortTitle: "รอ 1",
    hint: "รอ Admin",
  },
  {
    step: 3 as VideoWorkflowStep,
    title: "รอ upload คลิป",
    shortTitle: "ผลิต",
    hint: "อัปโหลดคลิป",
  },
  {
    step: 4 as VideoWorkflowStep,
    title: "รออนุมัติ 2",
    shortTitle: "รอ 2",
    hint: "รอ Admin",
  },
  {
    step: 5 as VideoWorkflowStep,
    title: "เผยแพร่แล้ว",
    shortTitle: "เผยแพร่",
    hint: "ลงโพสต์แล้ว",
  },
] as const;

export function getContentWorkflowStep(content: ContentItem): VideoWorkflowStep {
  if (content.mediaType === "image") {
    switch (content.status) {
      case "pending":
        return 2;
      case "rejected":
        return 1;
      case "approved":
      case "scheduled":
      case "posting":
      case "posted":
      case "post_failed":
        return 5;
      default:
        return 1;
    }
  }

  return getVideoWorkflowStep(content);
}

export function getWorkflowCardAction(content: ContentItem): {
  label: string;
  urgent: boolean;
} {
  if (content.status === "idea_approved") {
    return { label: "ไปที่ขั้นตอนการผลิต", urgent: true };
  }
  if (content.status === "rejected") {
    return {
      label: shouldResubmitClip(content) ? "แก้ไขคลิป" : "แก้ไขแนวคิด",
      urgent: true,
    };
  }
  if (getContentWorkflowStep(content) === 1) {
    return { label: "แก้ไข", urgent: false };
  }
  return { label: "ดูรายละเอียด", urgent: false };
}

export function getContentThumbnailUrl(content: ContentItem): string | null {
  for (const url of content.exampleAttachments) {
    if (url.trim() && isImageMediaUrl(url)) return url;
  }
  for (const row of content.script) {
    const imageUrl = row.imageUrl?.trim();
    if (imageUrl && isImageMediaUrl(imageUrl)) return imageUrl;
  }
  for (const url of content.attachments) {
    if (url.trim() && isImageMediaUrl(url)) return url;
  }
  return null;
}

export function groupContentsByWorkflowStep(
  contents: ContentItem[]
): Record<VideoWorkflowStep, ContentItem[]> {
  const groups: Record<VideoWorkflowStep, ContentItem[]> = {
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
  };

  for (const content of contents) {
    const step = getContentWorkflowStep(content);
    groups[step].push(content);
  }

  return groups;
}

export function countContentsByWorkflowStep(
  contents: ContentItem[]
): Record<VideoWorkflowStep, number> {
  const groups = groupContentsByWorkflowStep(contents);
  return {
    1: groups[1].length,
    2: groups[2].length,
    3: groups[3].length,
    4: groups[4].length,
    5: groups[5].length,
  };
}
