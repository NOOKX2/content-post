import type { Content } from "@prisma/client";
import {
  createNotification,
  createNotifications,
} from "@/lib/notifications/service";
import {
  findUserIdsByNames,
  getContentCreatorId,
  getContentStakeholderIds,
} from "@/lib/notifications/targets";

function contentLink(contentId: string): string {
  return `/content/${contentId}`;
}

function contentLabel(content: Pick<Content, "contentId" | "name">): string {
  return `${content.contentId} — ${content.name}`;
}

export async function notifyIdeaApproved(content: Content): Promise<void> {
  const creatorId = await getContentCreatorId(content);
  if (!creatorId) return;

  await createNotification({
    userId: creatorId,
    type: "approval_approved",
    title: "อนุมัติแนวคิดแล้ว",
    message: `คอนเทนต์ ${contentLabel(content)} ผ่านการอนุมัติแนวคิดแล้ว — กรุณาอัปโหลดคลิปตัดต่อ`,
    contentId: content.id,
    link: `/create?resume=${content.id}`,
  });
}

export async function notifyApprovalApproved(content: Content): Promise<void> {
  const creatorId = await getContentCreatorId(content);
  if (!creatorId) return;

  await createNotification({
    userId: creatorId,
    type: "approval_approved",
    title: "อนุมัติแล้ว",
    message: `คอนเทนต์ ${contentLabel(content)} ได้รับการอนุมัติแล้ว`,
    contentId: content.id,
    link: contentLink(content.id),
  });
}

export async function notifyApprovalRejected(content: Content): Promise<void> {
  const creatorId = await getContentCreatorId(content);
  if (!creatorId) return;

  const resumeLink =
    content.mediaType === "video"
      ? `/create?resume=${content.id}`
      : contentLink(content.id);

  await createNotification({
    userId: creatorId,
    type: "approval_rejected",
    title: "ไม่ผ่านการอนุมัติ",
    message: `คอนเทนต์ ${contentLabel(content)} ไม่ผ่านการอนุมัติ กรุณาตรวจสอบและแก้ไข`,
    contentId: content.id,
    link: resumeLink,
  });

  await createNotification({
    userId: creatorId,
    type: "revision_needed",
    title: "ต้องแก้ไขคอนเทนต์",
    message: `คอนเทนต์ ${contentLabel(content)} ต้องการการแก้ไข`,
    contentId: content.id,
    link: resumeLink,
  });
}

export async function notifyPostStatusUpdate(
  content: Content,
  newStatus: string
): Promise<void> {
  const userIds = await getContentStakeholderIds(content);
  if (userIds.length === 0) return;

  const statusLabel =
    newStatus === "posted"
      ? "โพสต์สำเร็จแล้ว"
      : newStatus === "posting"
        ? "กำลังโพสต์"
        : newStatus === "scheduled"
          ? "ตั้งเวลาโพสต์แล้ว"
          : newStatus === "post_failed"
            ? "โพสต์ไม่สำเร็จ"
            : `สถานะเปลี่ยนเป็น ${newStatus}`;

  await createNotifications(userIds, {
    type: "post_status_update",
    title: "อัปเดตสถานะโพสต์",
    message: `${contentLabel(content)} — ${statusLabel}`,
    contentId: content.id,
    link: contentLink(content.id),
    dedupeKey: `post_status:${content.id}:${newStatus}`,
  });
}

export async function notifyContentDetailChanged(
  content: Content,
  changedFields: string[],
  actorUserId?: string
): Promise<void> {
  if (changedFields.length === 0) return;

  const userIds = (await getContentStakeholderIds(content)).filter(
    (id) => id !== actorUserId
  );
  if (userIds.length === 0) return;

  const fieldLabels: Record<string, string> = {
    scheduledDate: "วันที่โพสต์",
    scheduledTime: "เวลาโพสต์",
    ideaFinishedDate: "วันที่คิดเสร็จ",
    shootDate: "นัดวันถ่าย",
    editFinishedDate: "วันที่ตัดเสร็จ",
    details: "รายละเอียด",
    location: "สถานที่",
    team: "ทีมงาน",
    script: "สคริปต์",
    platforms: "แพลตฟอร์ม",
    productsNeeded: "สินค้าที่ต้องเตรียม",
    itemsToPrepare: "สิ่งที่ต้องเตรียม",
    filmingEquipment: "อุปกรณ์ถ่าย",
  };

  const labels = changedFields
    .map((field) => fieldLabels[field] ?? field)
    .join(", ");

  await createNotifications(userIds, {
    type: "content_detail_changed",
    title: "มีการเปลี่ยนแปลงรายละเอียด",
    message: `${contentLabel(content)} — แก้ไข: ${labels}`,
    contentId: content.id,
    link: contentLink(content.id),
  });
}

export async function notifyTeamComment(params: {
  content: Content;
  authorId: string;
  authorName: string;
  body: string;
  commentType: "comment" | "edit_request" | "tag";
  taggedName?: string;
}): Promise<void> {
  const { content, authorId, authorName, body, commentType, taggedName } =
    params;

  if (commentType === "tag" && taggedName) {
    const taggedUserIds = await findUserIdsByNames([taggedName]);
    await createNotifications(taggedUserIds.filter((id) => id !== authorId), {
      type: "team_tag",
      title: "มีการแท็กคุณ",
      message: `${authorName} แท็กคุณใน ${contentLabel(content)}: ${body}`,
      contentId: content.id,
      link: contentLink(content.id),
    });
    return;
  }

  const stakeholderIds = (await getContentStakeholderIds(content)).filter(
    (id) => id !== authorId
  );
  if (stakeholderIds.length === 0) return;

  if (commentType === "edit_request") {
    await createNotifications(stakeholderIds, {
      type: "team_edit_request",
      title: "ขอแก้ไขคอนเทนต์",
      message: `${authorName} ขอแก้ไข ${contentLabel(content)}: ${body}`,
      contentId: content.id,
      link: contentLink(content.id),
    });
    return;
  }

  await createNotifications(stakeholderIds, {
    type: "team_comment",
    title: "มีความคิดเห็นใหม่",
    message: `${authorName} แสดงความคิดเห็นใน ${contentLabel(content)}: ${body}`,
    contentId: content.id,
    link: contentLink(content.id),
  });
}

import type { ContentFormData } from "@/lib/types";

export function detectContentChanges(
  before: Content,
  data: ContentFormData
): string[] {
  const fields: { key: keyof ContentFormData; formKey: keyof ContentFormData }[] = [
    { key: "scheduledDate", formKey: "scheduledDate" },
    { key: "scheduledTime", formKey: "scheduledTime" },
    { key: "ideaFinishedDate", formKey: "ideaFinishedDate" },
    { key: "shootDate", formKey: "shootDate" },
    { key: "editFinishedDate", formKey: "editFinishedDate" },
    { key: "details", formKey: "details" },
    { key: "location", formKey: "location" },
    { key: "team", formKey: "team" },
    { key: "script", formKey: "script" },
    { key: "platforms", formKey: "platforms" },
    { key: "productsNeeded", formKey: "productsNeeded" },
    { key: "itemsToPrepare", formKey: "itemsToPrepare" },
    { key: "filmingEquipment", formKey: "filmingEquipment" },
  ];

  const changed: string[] = [];
  for (const { key, formKey } of fields) {
    const beforeVal = JSON.stringify(before[key as keyof Content]);
    const afterVal = JSON.stringify(data[formKey]);
    if (beforeVal !== afterVal) {
      changed.push(key);
    }
  }
  return changed;
}
